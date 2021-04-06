var child_process = require("child_process");


module.exports = function(grunt) {

	function buildModuleList() {
		var items = [];

		grunt.file.recurse('web/modules', (path, root, subdir, filename) => {
			if (filename.match(/\.tsx$/)) {
				let name = filename.replace(/\.tsx$/, "");
				if (name !== "Module") items.push(name);
			}
		});

		grunt.file.write("server/moduleList.js", `//Automatically generated, don't hand-edit.
module.exports = ${JSON.stringify(items)};
`);
	}

	function webFiles(inWebFolder) {
		var files = grunt.file.expand(['web/**']);
		files = files.filter(x => !x.match(/\.(less|tsx)$/) && !grunt.file.isDir(x));
		if (inWebFolder) {
			files = files.map(x => x.substr(4)).filter(x => x);
		}
		// console.log("files: ", files);
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
				env: {
					PATH: process.env.PATH,
				},
			});
			child.on('close', code => {
				if (code !== 0) done(new Error("Child process failed, exited with code " + code));
				else done();
			});
		}
		return subTask;
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		less: {
			'build': {
				options: {
					sourceMap: true,
					sourceMapBasepath: 'build',
					sourceMapURL: 'main.css.map',
					sourceMapRootpath: '..',
				},
				files: {
					'build/main.css': 'web/main.less',
				}
			}
		},

		clean: ['build/'],

		copy: {
			'build': {
				expand: true,
				cwd: 'web',
				src: webFiles(true),
				dest: 'build/',
			}
		},

		_watch: {
			'buildSystem': {
				files: ['Gruntfile.js', 'tsconfig.json'],
				options: {reload: true},
				tasks: ['default'],
			},
			'html': {
				options: {atBegin: true,},
				files: webFiles(false),
				tasks: ['copy'],
			},
			'styles': {
				options: {atBegin: true,},
				files: [
					'web/**.less',
				],
				tasks: ['less'],
			},
			'moduleList': {
				options: {atBegin: true,},
				files: [
					'web/modules/**.tsx',
				],
				tasks: ['moduleList'],
			},
		},

		typeScript: {},
		typeScriptWatch: {},
		serverlessLocal: {},
		moduleList: {},

		concurrent: {
			'build': ['less', 'copy', ['moduleList', 'typeScript']],
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

	grunt.renameTask('watch', '_watch');

	grunt.registerTask('moduleList', "Build a list of modules", buildModuleList);
	grunt.registerTask('typeScript', "Compile TypeScript", getShellTask("tsc", ['--pretty']));
	grunt.registerTask('typeScriptWatch', "Compile TypeScript, watch changes", getShellTask(
		"tsc", ["-w", "--preserveWatchOutput", '--pretty']
	));
	grunt.registerTask('serverlessLocal', "Run service locally", getShellTask("serverless", ["offline", "--color"]));
	grunt.registerTask('arrgh', "arrgh", getShellTask("echo", ["fizz", "baz"]));

	grunt.registerTask('watch', ['concurrent:watch']);
	grunt.registerTask('default', ['concurrent:build']);
};