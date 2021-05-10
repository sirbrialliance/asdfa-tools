var child_process = require("child_process");
var fsp = require("fs/promises");
var stream = require("stream");

Array.prototype.contains = function(v) { return this.indexOf(v) >= 0; };

module.exports = function(grunt) {
	const closuePath = "node_modules/google-closure-compiler-windows/compiler.exe";
	// const closuePath = "node_modules/.bin/google-closure-compiler";


	function buildModuleList() {
		var modules = [];

		grunt.file.recurse('web/modules', (path, root, subdir, filename) => {
			if (filename.match(/\.tsx$/)) {
				let name = filename.replace(/\.tsx$/, "");
				if (name !== "Module") modules.push(name);
			}
		});

		grunt.file.write("server/contentList.js", `"use strict";
//Automatically generated, don't hand-edit.
module.exports = {
	modules: ${JSON.stringify(modules)},
	webFiles: ${JSON.stringify(webFiles({includeBuilt: true}))},
};
`);

		grunt.file.write("web/lib/BGImageList.tsx", `//Automatically generated, don't hand-edit.
export default ${JSON.stringify(webFiles({bgImages: true}).map(x => x.substr(3, x.length - 7)))};
`);
	}

	/**
	 * Returns an array of web resource files.
	 * Pass in a number of string flags to change options:
	 */
	function webFiles(options) {
		options = {...{
			projectRelative: false,
			includeBuilt: false,
			bgImages: false,
		}, ...options};

		var files = grunt.file.expand(['web/**']);
		// Grab basically everything, including source files for source map usage when distributed
		files = files.filter(x => !x.match(/^index\.html$/) && !grunt.file.isDir(x));
		// files = files.filter(x => !x.match(/\.(less|tsx)$/) && !grunt.file.isDir(x));

		if (options.bgImages) {
			files = files.filter(x => x.match(/^web\/bg\/.*\.jpg$/));
		}

		if (options.includeBuilt) {
			//not actually in "___/", but usually that will be stripped off when this flag is set
			files.push("___/main.js");
			files.push("___/main.js.map");
			files.push("___/main.min.js");
			files.push("___/main.min.js.map");
			files.push("___/main.css");
			files.push("___/main.css.map");
			files.push("___/index.html");
		}

		if (!options.projectRelative) {
			files = files.map(x => x.substr(4)).filter(x => x);
		}

		//console.log("files: ", options, files);
		return files;
	}

	function getShellTask(command, args = []) {
		function subTask() {
			var done = this.async();
			grunt.log.writeln("Starting " + command + " with " + JSON.stringify(args));
			// Beware: https://github.com/nodejs/node-v0.x-archive/issues/2318
			// To workaround we run cmd.exe as the target instead.
			var args2 = ["/S", "/C", command, ...args];
			var child = child_process.spawn("cmd.exe", args2, {
				stdio: 'inherit',
				env: {...process.env},
			});
			child.on('close', code => {
				if (code !== 0) done(new Error("Child process failed, exited with code " + code));
				else done();
			});
		}
		return subTask;
	}

	async function closureCompile(input, output) {
		return new Promise(async (resolve, reject) => {
			// var outFile = await fsp.open(output, "w");

			var child = child_process.spawn(closuePath, [
				input,
				"--js_output_file", output,
				"--create_source_map", output + ".map",
			], {
				stdio: 'inherit',
				// stdio: ['inherit', 'pipe', 'inherit'],
				env: {...process.env},
			});

			// //child.stdout.pipe(outFile);
			// child.stdout.on("data", data => {
			// 	outFile.write(data);
			// });

			child.on('close', code => {
				if (code !== 0) reject(new Error("Closure compile process failed, exited with code " + code));
				else resolve();
				// outFile.close();
			});
		});
	}

	async function buildIndexHTML() {
		var done = this.async();
		try {
			//closure compile loader:
			await closureCompile("loader.js", "build/loader.min.js");

			var template = await fsp.readFile("web/index.html");
			var minOutput = await fsp.readFile("build/loader.min.js");

			var content = template.toString().replace("{loader}", minOutput);

			await fsp.writeFile("build/out/index.html", content);

			done();
		} catch (ex) {
			done(ex);
		}
	}

	async function mainJSClosure() {
		var done = this.async();
		try {
			await closureCompile("build/main.js", "build/out/main.min.js");
			// var fd = await fsp.open("build/out/main.js", "a+");
			// await fd.write("\n//# sourceMappingURL=main.js.map\n");
			// await fd.close();
			done();
		} catch (ex) {
			done(ex);
		}
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		less: {
			'build': {
				options: {
					sourceMap: true,
					sourceMapBasepath: 'build/out',
					sourceMapURL: 'main.css.map',
					sourceMapRootpath: '..',
				},
				files: {
					'build/out/main.css': 'web/main.less',
				}
			}
		},

		clean: ['build/'],

		copy: {
			'build': {
				expand: true,
				cwd: 'web',
				src: [
					...webFiles(),
				],
				dest: 'build/out/',
			},
			// 'srcMap': {
			// 	src: "build/main.js.map",
			// 	dest: "build/out/main.js.map",
			// },
			'nonMinJs': {//dev/watch only
				src: "build/main.js",
				dest: "build/out/main.min.js",
			},
		},


		_watch: {
			'buildSystem': {
				files: ['Gruntfile.js', 'tsconfig.json'],
				options: {reload: true},
				tasks: ['default'],
			},
			'indexHTML': {
				options: {atBegin: true,},
				files: ["web/index.html", "loader.js"],
				tasks: ['indexHTML'],
			},
			'staticRes': {
				options: {atBegin: true,},
				files: webFiles({projectRelative: true}),
				tasks: ['copy:build'],
			},
			'styles': {
				options: {atBegin: true,},
				files: [
					'web/**.less',
					'web/**/**.less',
				],
				tasks: ['less'],
			},
			'contentList': {
				options: {atBegin: true,},
				files: [
					'web/modules/**.tsx',
				],
				tasks: ['contentList'],
			},
			'nonMinJs': {
				options: {atBegin: true,},
				files: ['out/main.js'],
				tasks: ['copy:nonMinJs'],
			},
		},

		"merge-source-maps": {
			'build': {
				src: ['build/out/*.min.js'],
				expand: true,
			}
		},



		typeScript: {},
		typeScriptWatch: {},
		serverlessLocal: {},
		contentList: {},
		indexHTML: {},
		mainJSClosure: {},

		concurrent: {
			'build': [
				'indexHTML',
				'less',
				'copy',
				['contentList', 'typeScript', 'mainJSClosure', 'merge-source-maps']
			],
			'watch': {
				tasks: ['_watch', 'typeScriptWatch', 'serverlessLocal'],
				options: {
					logConcurrentOutput: true,
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('merge-source-maps');

	grunt.renameTask('watch', '_watch');

	grunt.registerTask('contentList', "Build a list of modules, files, etc. we have/use.", buildModuleList);
	grunt.registerTask('typeScript', "Compile TypeScript", getShellTask("tsc", ['--pretty']));
	grunt.registerTask('typeScriptWatch', "Compile TypeScript, watch changes", getShellTask(
		"tsc", ["-w", "--preserveWatchOutput", '--pretty']
	));
	grunt.registerTask('serverlessLocal', "Run service locally", getShellTask("serverless", ["offline", "--color"]));
	grunt.registerTask('indexHTML', "Build index.html", buildIndexHTML);
	grunt.registerTask('mainJSClosure', "Closure compile main.js", mainJSClosure);


	//grunt.registerTask('arrgh', "arrgh", getShellTask("echo", ["fizz", "baz"]));

	grunt.registerTask('watch', ['concurrent:watch']);
	grunt.registerTask('default', ['concurrent:build']);
};