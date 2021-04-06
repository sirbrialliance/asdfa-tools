var child_process = require("child_process");


module.exports = function(grunt) {

	function webFiles(inWebFolder) {
		var files = grunt.file.expand(['web/**']);
		files = files.filter(x => !x.match(/\.(less|tsx)$/) && !grunt.file.isDir(x));
		if (inWebFolder) {
			files = files.map(x => x.substr(4)).filter(x => x);
		}
		// console.log("files: ", files);
		return files;
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
		},

		typeScript: {},
		typeScriptWatch: {},
		serverlessLocal: {},

		concurrent: {
			'build': ['less', 'copy', 'typeScript'],
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

	grunt.registerTask('typeScript', "Compile TypeScript", () => child_process.execSync("tsc"));
	grunt.registerTask('typeScriptWatch', "Compile TypeScript, watch changes", () => child_process.execSync("tsc -w"));
	grunt.registerTask('serverlessLocal', "Run service locally", () => child_process.execSync("serverless offline"));

	grunt.registerTask('watch', ['concurrent:watch']);
	grunt.registerTask('default', ['concurrent:build']);
};