module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		less: {
			dev: {
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


		ts: {
			options: {
				// additionalFlags: '--jsx react-jsx --jsxImportSource lib',
				// additionalFlags: '--jsx react-jsx --jsxFactory jim',
				// 		"jsx": "react-jsx",		"jsxFactory": "jim",		"jsxImportSource": "jsx-runtime",

			},
			// options: {
			// 	jsx: "react-jsx",
			// },
			// options: {
				// jsx: 'react-jsx',
				// jsxImportSource: 'jsx-runtime',
				// lib: ["es6", 'dom'],
				// removeComments: false,
				// module: 'amd',
				// moduleResolution: 'node',
				// fast: "never",//quell warnings about fast not working with --out
				// rootDir: "web",
			// },
			dev: {
				tsconfig: {
					tsconfig: "tsconfig.json",
					passThrough: true,
				},
			},
			// dev: {
			// 	options: {
			// 		removeComments: true,
			// 	},
			// 	src: ["web/**/*.tsx"],
			// 	out: 'build/main.js',
			// 	// files: {
			// 	// 	'build/**.js': 'web/**.tsx',
			// 	// }
			// }
		},


		copy: {
			dev: {
				expand: true,
				cwd: 'web',
				src: '*.html',
				dest: 'build/',
			}
		},



		watch: {
			buildSystem: {
				files: ['Gruntfile.js', 'tsconfig.json'],
				options: {reload: true},
				tasks: ['default'],
			},
			html: {
				options: {atBegin: true,},
				files: [
					'web/**.html',
				],
				tasks: ['copy'],
			},
			styles: {
				options: {atBegin: true,},
				files: [
					'web/**.less',
				],
				tasks: ['less'],
			},

			//run `tsc -w` instead
			// scripts: {
			// 	options: {atBegin: true,},
			// 	files: [
			// 		'web/**.tsx',
			// 	],
			// 	tasks: ['ts'],
			// }
		},

		// babel: {
		// 	options: {
		// 		parserOpts: { strictMode: true },
		// 		plugins: [
		// 			["@babel/plugin-transform-typescript", {
		// 			}],

		// 			["@babel/plugin-transform-react-jsx", {
		// 				isTSX: true,
		// 			}],
		// 		],
		// 		// "presets": [
		// 		// 	"@babel/preset-typescript",
		// 		// 	"@babel/preset-react",
		// 		// ],
		// 	},
		// 	dev: {
		// 		files: {
		// 			'build/main.js': 'scripts/main.tsx',
		// 		}
		// 	}
		// },

	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	// grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-ts');

	grunt.registerTask('default', ['less', 'ts', 'copy']);
};