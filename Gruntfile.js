module.exports = function(grunt) {

  let pkg = grunt.file.readJSON('package.json');

  let banner = blockComment('Tabris.js ' + pkg.version +
                            " (<%= grunt.template.today('yyyy-mm-dd HH:MM') %>)\n\n" +
                            grunt.file.read('LICENSE'));

  grunt.initConfig({
    version: pkg.version,
    clean: ['build'],
    concat: {
      tabris: {
        options: {
          banner,
          process: src => src.replace(/\${VERSION}/g, pkg.version)
        },
        src: ['build/transpiled.js'],
        dest: 'build/tabris/tabris.js'
      },
      boot: {
        options: {
          banner: banner + '(function(){\n',
          footer: '\n}());',
          stripBanners: true,
          process: src => src.replace(/\${VERSION}/g, pkg.version)
        },
        src: prefix('src/boot/', [
          'Module.js',
          'bootstrap.js'
        ]),
        dest: 'build/boot.js'
      }
    },
    uglify: {
      boot: {
        src: 'build/boot.js',
        dest: 'build/boot.min.js'
      },
      polyfill: {
        src: 'build/tabris/polyfill.js',
        dest: 'build/tabris/polyfill.min.js'
      }
    },
    doc: {
      api: 'doc/api/**/*.json',
      typings: 'typings/propertyTypes.d.ts',
      target: 'build/doc/api/',
      index: 'build/doc/index.md',
      types: 'build/doc/types.md'
    },
    copy: {
      doc: {
        expand: true,
        cwd: 'doc/',
        src: ['*.md', 'api/*.md', 'api/img/**/*.*', 'img/*.*'],
        dest: 'build/doc/'
      },
      readme: {
        src: 'README.md',
        dest: 'build/tabris/'
      },
      typings: {
        expand: true,
        cwd: 'typings/',
        src: ['whatwg-fetch.d.ts'],
        dest: 'build/tabris/'
      },
      test_ts: {
        expand: true,
        cwd: 'test/typescript/',
        src: ['**/*.test.ts', 'package.json', 'tsconfig.json'],
        dest: 'build/typescript/'
      }
    },
    compress: {
      doc: {
        options: {
          archive: 'build/doc.zip'
        },
        files: [
          {expand: true, cwd: 'build', src: ['doc/**'], filter: 'isFile'}
        ]
      },
      examples: {
        options: {
          archive: 'build/examples.zip'
        },
        files: [
          {expand: true, cwd: 'build/', src: ['examples/**'], filter: 'isFile'}
        ]
      },
      tabris: {
        options: {
          archive: 'build/tabris.tgz'
        },
        files: [
          {expand: true, cwd: 'build/', src: ['tabris/**'], filter: 'isFile'}
        ]
      }
    },
    webpack: {
      polyfill: {
        entry: './src/polyfill.js',
        output: {
          filename: 'build/tabris/polyfill.js',
          library: 'polyfill',
          libraryTarget: 'commonjs2'
        }
      }
    },
    exec: {
      verify_typings: {
        cmd: 'npm install && node node_modules/typescript/bin/tsc -p . --noImplicitAny',
        cwd: 'build/typescript'
      },
      test_boot: {
        cmd: 'node node_modules/mocha/bin/mocha --colors --compilers js:babel-core/register "test/boot/**/*.test.js"'
      },
      verify_tabris: {
        cmd: 'node node_modules/mocha/bin/mocha --colors "test/**/*.verify.js"'
      },
      test_tabris: {
        cmd: 'node node_modules/mocha/bin/mocha --colors --compilers js:babel-core/register "test/tabris/**/*.test.js"'
      },
      test_spec: {
        cmd: `node node_modules/mocha/bin/mocha --colors --compilers js:babel-core/register "${grunt.option('spec')}"`
      },
      eslint: {
        cmd: 'node node_modules/eslint/bin/eslint.js --color .'
      },
      tslint: {
        cmd: 'node node_modules/tslint/bin/tslint --exclude "**/*.d.ts" "examples/**/*.ts" "test/**/*.ts"'
      },
      bundle: {
        cmd: 'node node_modules/rollup/bin/rollup --format=cjs --output=build/bundle.js -- src/tabris/main.js'
      },
      transpile: {
        cmd: 'node node_modules/cross-env/bin/cross-env.js BABEL_ENV=build ' +
          'node node_modules/babel-cli/bin/babel.js' +
          ' --compact false --out-file build/transpiled.js build/bundle.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadTasks('./grunt');

  /* runs static code analysis tools */
  grunt.registerTask('lint', [
    'exec:eslint',
    'exec:tslint'
  ]);

  grunt.registerTask('package', 'create package.json', () => {
    let stringify = require('format-json');
    let pack = grunt.file.readJSON('package.json');
    delete pack.devDependencies;
    pack.main = 'tabris.js';
    pack.typings = 'tabris.d.ts';
    grunt.file.write('build/tabris/package.json', stringify.plain(pack));
  });

  /* concatenates and minifies code */
  grunt.registerTask('build', [
    'exec:bundle',
    'exec:transpile',
    'concat:tabris',
    'concat:boot',
    'webpack:polyfill',
    'uglify:boot',
    'uglify:polyfill',
    'package',
    'copy:readme',
    'copy:typings',
    'generate-tsd',
    'compress:tabris'
  ]);

  grunt.registerTask('test', [
    'exec:test_boot',
    'exec:test_tabris'
  ]);

  /* runs tests against the build output */
  grunt.registerTask('verify', [
    'exec:verify_tabris',
    'copy:test_ts',
    'exec:verify_typings'
  ]);

  /* generates reference documentation */
  grunt.registerTask('doc', [
    'copy:doc',
    'generate-doc',
    'compress:doc'
  ]);

  /* packages example code */
  grunt.registerTask('examples', [
    'copy-examples',
    'compress:examples'
  ]);

  grunt.registerTask('default', [
    'clean',
    'lint',
    'test',
    'build',
    'verify',
    'doc',
    'examples'
  ]);

  function prefix(prefix, strings) {
    return strings.map(string => prefix + string);
  }

  function blockComment(text) {
    let commented = text.trim().split('\n').map(line => ' * ' + line).join('\n');
    return '/*!\n' + commented + '\n */\n';
  }

};
