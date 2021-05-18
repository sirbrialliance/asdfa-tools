var child_process = require("child_process");
var fsp = require("fs/promises");
var stream = require("stream");
var md = require("markdown-it");

Array.prototype.contains = function(v) { return this.indexOf(v) >= 0; };

const disabledModules = [
	//abstract
	'Module',

	//not ready:
	'WebRTC',
	'BrowserInfo',
]

module.exports = function(grunt) {
	function buildModuleList() {
		var modules = [];

		grunt.file.recurse('web/modules', (path, root, subdir, filename) => {
			if (filename.match(/\.tsx$/)) {
				let name = filename.replace(/\.tsx$/, "");
				if (disabledModules.indexOf(name) < 0) modules.push(name);
			}
		});

		var aboutMD = grunt.file.read("Readme.md");
		var markdown = new md({html: true});
		var aboutHTML = markdown.render(aboutMD);

		function updateFile(file, content) {
			var current = undefined;
			try {
				current = grunt.file.read(file);
			} catch (ex) {
				current = undefined;
			}
			if (current !== content) grunt.file.write(file, content);
		}

		updateFile("server/contentList.js", `"use strict";
//Automatically generated, don't hand-edit.
module.exports = {
	modules: ${JSON.stringify(modules)},
	webFiles: ${JSON.stringify(webFiles({includeBuilt: true}))},
};
`);

		updateFile("web/lib/contentList.tsx", `//Automatically generated, don't hand-edit.
export default {
	bgImages: ${JSON.stringify(webFiles({bgImages: true}).map(x => x.substr(3, x.length - 7)))},
	modules: ${JSON.stringify(modules)},
	aboutHTML: ${JSON.stringify(aboutHTML)},
}
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
		files = files.filter(x => !x.match(/\bindex\.html$|^web\/third/) && !grunt.file.isDir(x));
		// files = files.filter(x => !x.match(/\.(less|tsx)$/) && !grunt.file.isDir(x));

		if (options.bgImages) {
			files = files.filter(x => x.match(/^web\/bg\/.*\.jpg$/));
		}

		if (options.includeBuilt) {
			//not actually in "___/", but usually that will be stripped off when this flag is set
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

	async function buildIndexHTML() {
		var done = this.async();
		try {
			var template = await fsp.readFile("web/index.html");
			var minOutput = await fsp.readFile("build/loader.min.js");

			var content = template.toString().replace("{loader}", minOutput);

			grunt.file.write("build/out/index.html", content);
			// await fsp.writeFile("build/out/index.html", content);

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
					sourceMapBasepath: 'web',
					sourceMapRootpath: '',
					sourceMapURL: 'main.css.map',
					compress: true,
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
			// 'nonMinJs': {//dev/watch only
			// 	src: "build/main.js",
			// 	dest: "build/out/main.min.js",
			// },
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
				tasks: ['uglify:loader', 'indexHTML'],
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
			// 'nonMinJs': {
			// 	options: {atBegin: true,},
			// 	files: ['build/main.js'],
			// 	tasks: ['copy:nonMinJs'],
			// },
		},

		uglify: {
			'build': {
				options: {
					sourceMap: {
						content: "inline",
					},
				},
				files: {
					'build/out/main.min.js': ['build/main.js'],
				},
			},

			'loader': {
				options: {
					mangle: {
						reserved: ["require", "define", "requireList"]
					},
				},
				files: { 'build/loader.min.js': 'loader.js' },
			},
		},

		typeScript: {},
		typeScriptWatch: {},
		serverlessLocal: {},
		contentList: {},
		indexHTML: {},

		concurrent: {
			'build': [
				['uglify:loader', 'indexHTML'],
				'less',
				'copy',
				['contentList', 'typeScript', 'uglify:build']
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
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.renameTask('watch', '_watch');

	grunt.registerTask('contentList', "Build a list of modules, files, etc. we have/use.", buildModuleList);
	grunt.registerTask('typeScript', "Compile TypeScript", getShellTask("tsc", ['--pretty']));
	grunt.registerTask('typeScriptWatch', "Compile TypeScript, watch changes", getShellTask(
		"tsc", ["-w", "--preserveWatchOutput", '--pretty', '--outFile', 'build/out/main.min.js']
	));
	grunt.registerTask('serverlessLocal', "Run service locally", getShellTask("serverless", ["offline", "--color"]));
	grunt.registerTask('indexHTML', "Build index.html", buildIndexHTML);


	grunt.registerTask('watch', ['concurrent:watch']);
	grunt.registerTask('default', ['concurrent:build']);
	grunt.registerTask('build', ['default']);//because I keep trying to run "grunt build"
};