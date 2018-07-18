require('ts-node').register({compilerOptions: {module: 'commonjs', lib: ['es2016']}});
const {generateDoc} = require('./tools/generate-doc');
const {generateDts} = require('./tools/generate-dts');
const {generateJsx} = require('./tools/generate-jsx');
const {Validator} = require('jsonschema');

module.exports = function(grunt) {

  let pkg = grunt.file.readJSON('package.json');
  let version = pkg.version;
  let release = grunt.option('release');
  if (!release) {
    version += '-dev.' + grunt.template.today('yyyymmdd+HHMM');
  }
  let banner = blockComment('Tabris.js ' + version + '\n\n' + grunt.file.read('LICENSE'));

  grunt.log.writeln('Building version ' + version);

  grunt.initConfig({
    version,
    clean: ['build'],
    concat: {
      tabris: {
        options: {
          banner,
          process: src => src.replace(/\${VERSION}/g, version)
        },
        src: ['build/tabris-transpiled.js'],
        dest: 'build/tabris/tabris.js'
      },
      boot: {
        options: {
          banner,
          process: src => '(function(){\n' + src.replace(/\${VERSION}/g, version) + '}());'
        },
        src: ['build/boot-transpiled.js'],
        dest: 'build/tabris/boot.js'
      },
    },
    doc: {
      api: 'doc/api/**/*.json',
      schema: 'tools/api-schema.json',
      propertyTypes: 'typings/propertyTypes.d.ts',
      globalTypings: 'typings/global/*.d.ts',
      target: 'build/doc/'
    },
    copy: {
      doc: {
        expand: true,
        cwd: 'doc/',
        src: ['*.md', 'api/*.md', 'api/img/**/*.*', 'img/*.*', 'toc.yml'],
        dest: 'build/doc/'
      },
      readme: {
        src: 'README.md',
        dest: 'build/tabris/'
      },
      test_ts: {
        expand: true,
        cwd: 'test/typescript/',
        src: ['**/*.test.ts', '**/*.test.tsx', '**/*.fail.ts', 'package.json', 'tsconfig.json', 'tsconfig.fail.json'],
        dest: 'build/typescript/'
      }
    },
    exec: {
      verify_typings: {
        cmd: 'npm install && node node_modules/typescript/bin/tsc -p . --noImplicitAny',
        cwd: 'build/typescript'
      },
      test_boot: {
        cmd: 'node node_modules/mocha/bin/mocha --colors --require babel-core/register "test/boot/**/*.test.js"'
      },
      verify_tabris: {
        cmd: 'node node_modules/mocha/bin/mocha --colors "test/**/*.verify.js"'
      },
      test_tabris: {
        cmd: 'node node_modules/mocha/bin/mocha --colors --require babel-core/register "test/tabris/**/*.test.js"'
      },
      test_spec: {
        cmd: `node node_modules/mocha/bin/mocha --colors --require babel-core/register "${grunt.option('spec')}"`
      },
      eslint: {
        cmd: 'node node_modules/eslint/bin/eslint.js --color .'
      },
      tslint: {
        cmd: 'node node_modules/tslint/bin/tslint --exclude "**/*.d.ts" "examples/**/*.ts" "test/**/*.ts"'
      },
      bundle_tabris: {
        cmd: 'node node_modules/rollup/bin/rollup --config rollup.config.js -f cjs ' +
          '-o build/tabris-bundle.js -- src/tabris/main.js'
      },
      bundle_boot: {
        cmd: 'node node_modules/rollup/bin/rollup -f cjs -o build/boot-bundle.js -- src/boot/main.js'
      },
      transpile_tabris: {
        cmd: 'node node_modules/babel-cli/bin/babel.js --compact false ' +
          '--out-file build/tabris-transpiled.js build/tabris-bundle.js',
        options: {
          env: Object.assign({}, process.env, {BABEL_ENV: 'build'})
        }
      },
      uglify_tabris: {
        cmd: 'node node_modules/uglify-es/bin/uglifyjs --mangle --keep-fnames --compress ' +
          '-o build/tabris/tabris.min.js build/tabris/tabris.js'
      },
      transpile_boot: {
        cmd: 'node node_modules/babel-cli/bin/babel.js --compact false ' +
          '--out-file build/boot-transpiled.js build/boot-bundle.js',
        options: {
          env: Object.assign({}, process.env, {BABEL_ENV: 'build'})
        }
      },
      uglify_boot: {
        cmd: 'node node_modules/uglify-es/bin/uglifyjs --mangle --compress ' +
          '-o build/tabris/boot.min.js build/tabris/boot.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('validate-json', () => {
    let validator = new Validator();
    let schema = grunt.file.readJSON(grunt.config('doc').schema);
    let files = grunt.file.expand(grunt.config('doc').api);
    let allResults = [];
    files.forEach(file => {
      let results = validator.validate(grunt.file.readJSON(file), schema, {nestedErrors: true});
      if (results.errors.length) {
        allResults.push(`${file}:\n${results.errors.join('\n')}`);
      }
    });
    if (allResults.length > 0) {
      grunt.fail.warn('Invalid JSON found\n' + allResults.join('\n') + '\n');
    }
  });

  grunt.registerTask('generate-doc', () => {
    let targetPath = grunt.config('doc').target;
    let files = grunt.file.expand(grunt.config('doc').api);
    generateDoc({files, targetPath, version});
  });

  grunt.registerTask('generate-jsx', () => {
    let files = grunt.file.expand(grunt.config('doc').api);
    generateJsx({files});
  });

  grunt.registerTask('generate-tsd', () => {
    let files = grunt.file.expand(grunt.config('doc').api);
    let propertyTypes = grunt.file.read(grunt.config('doc').propertyTypes);
    let globalTypeDefFiles = grunt.file.expand(grunt.config('doc').globalTypings);
    generateDts({files, propertyTypes, globalTypeDefFiles, version});
  });

  /* runs static code analysis tools */
  grunt.registerTask('lint', [
    'exec:eslint',
    'exec:tslint',
    'validate-json'
  ]);

  grunt.registerTask('package', 'create package.json', () => {
    let stringify = require('format-json');
    let pack = grunt.file.readJSON('package.json');
    delete pack.devDependencies;
    pack.main = 'tabris.min.js';
    pack.typings = 'tabris.d.ts';
    pack.version = version;
    grunt.file.write('build/tabris/package.json', stringify.plain(pack));
  });

  /* concatenates and minifies code */
  grunt.registerTask('build', [
    'exec:bundle_tabris',
    'exec:transpile_tabris',
    'concat:tabris',
    'exec:uglify_tabris',
    'exec:bundle_boot',
    'exec:transpile_boot',
    'concat:boot',
    'exec:uglify_boot',
    'package',
    'copy:readme',
    'generate-jsx',
    'generate-tsd'
  ]);

  grunt.registerTask('test', [
    'exec:test_boot',
    'exec:test_tabris'
  ]);

  grunt.registerTask('verify_typings_fail', () => {
    grunt.file.expand('build/typescript/**/*.fail.ts').forEach(file => {
      const childProcess = require('child_process').spawnSync(
        'node',
        ['node_modules/typescript/bin/tsc', '--noImplicitAny', '--lib', 'es6,es2015.promise',  `./${file}`],
        {encoding: 'utf-8'}
      );
      if (childProcess.error || childProcess.status !== 2) {
        grunt.fail.warn('Unexpected tsc status ' + (childProcess.error || childProcess.status));
      }
      const matches = grunt.file.read(file).match(/\/\*Expected\n([\w\W]+)\*\//);
      if (!matches || matches.length !== 2) {
        grunt.fail.warn(
          `No expectations found in ${file}. Suggestion:\n--\n/*Expected\n${childProcess.stdout}*/\n--\n`
        );
      }
      const exp = matches[1].trim().split('\n');
      for (let i = 0; i < exp.length; i++) {
        if (childProcess.stdout.indexOf(exp[i]) === -1) {
          grunt.fail.warn(`${file} is missing compiler output "${exp[i]}" in:\n${childProcess.stdout}`);
        }
      }
    });
  });

  /* runs tests against the build output */
  grunt.registerTask('verify', [
    'exec:verify_tabris',
    'copy:test_ts',
    'exec:verify_typings',
    'verify_typings_fail'
  ]);

  /* generates reference documentation */
  grunt.registerTask('doc', [
    'copy:doc',
    'generate-doc'
  ]);

  grunt.registerTask('default', [
    'clean',
    'lint',
    'test',
    'build',
    'verify',
    'doc'
  ]);

  function blockComment(text) {
    let commented = text.trim().split('\n').map(line => ' * ' + line).join('\n');
    return '/*!\n' + commented + '\n */\n';
  }

};
