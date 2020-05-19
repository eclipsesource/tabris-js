require('ts-node').register({project: './tools/tsconfig.json'});
const {generateDoc} = require('./tools/generate-doc');
const {generateDts} = require('./tools/generate-dts');
const {Validator} = require('jsonschema');
const {join} = require('path');

module.exports = function(grunt) {

  const pkg = grunt.file.readJSON('package.json');
  let version = pkg.version;
  const release = grunt.option('release');
  if (!release) {
    version += '-dev.' + grunt.template.today('yyyymmdd+HHMM');
  }
  const banner = blockComment('Tabris.js ' + version + '\n\n' + grunt.file.read('LICENSE'));

  grunt.log.writeln('Building version ' + version);

  grunt.initConfig({
    version,
    clean: ['build/**/*'],
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
      }
    },
    doc: {
      source: 'doc',
      snippets: 'snippets/',
      schema: 'tools/api-schema.json',
      propertyTypes: 'typings/propertyTypes.d.ts',
      resourcesDataTypes: 'src/tabris/resourcesDataTypes.d.ts',
      reExports: 'typings/reExports.d.ts',
      globalTypings: 'typings/global/*.d.ts',
      target: 'build/doc/'
    },
    copy: {
      readme: {
        src: 'README.md',
        dest: 'build/tabris/'
      },
      schema: {
        src: 'schema/*',
        dest: 'build/tabris/'
      },
      test_ts: {
        expand: true,
        cwd: 'test/typescript/',
        src: ['**/*.test.ts*', '**/*.fail.ts*', 'package.json', 'tsconfig.json', 'tsconfig.fail.json'],
        dest: 'build/typescript/'
      },
      snippets: {
        expand: true,
        cwd: 'snippets',
        src: ['*.js', '*.jsx', '*.ts', '*.tsx', '*.json', 'resources/*'],
        dest: 'build/snippets/'
      },
      client_mock: {
        expand: true,
        cwd: 'test/tabris',
        src: ['ClientMock.js', 'ClientMock.d.ts'],
        dest: 'build/tabris/',
        options: {
          process: (content, srcpath) => {
            if (srcpath.indexOf('.js') !== -1) {
              return content.replace('export default class', 'exports.default = class');
            }
            return content;
          }
        }
      }
    },
    exec: {
      verify_typings: {
        cmd: 'npm install && node node_modules/typescript/bin/tsc -p . --noImplicitAny',
        cwd: 'build/typescript'
      },
      transpile_snippets: {
        cmd: 'npm install ../tabris --save && npm install && node node_modules/typescript/bin/tsc -p .',
        cwd: 'build/snippets'
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
        cmd: 'npx eslint --color --f visualstudio --ext .js,.jsx,.ts,.tsx .'
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
    const validator = new Validator();
    const schema = grunt.file.readJSON(grunt.config('doc').schema);
    const files = grunt.file.expand(grunt.config('doc').source + '/api/*.json');
    const allResults = [];
    files.forEach(file => {
      const results = validator.validate(grunt.file.readJSON(file), schema, {nestedErrors: true});
      if (results.errors.length) {
        allResults.push(`${file}:\n${results.errors.join('\n')}`);
      }
    });
    if (allResults.length > 0) {
      grunt.fail.warn('Invalid JSON found\n' + allResults.join('\n') + '\n');
    }
  });

  grunt.registerTask('doc', () => {
    const targetPath = grunt.config('doc').target;
    const snippetsPath = grunt.config('doc').snippets;
    const sourcePath = grunt.config('doc').source;
    try {
      generateDoc({sourcePath, targetPath, snippetsPath, version});
    } catch (ex) {
      grunt.fail.warn(ex.stack);
    }
  });

  grunt.registerTask('generate-tsd', () => {
    const files = join(grunt.config('doc').source, 'api');
    const propertyTypes = grunt.file.read(grunt.config('doc').propertyTypes);
    const reExports = grunt.file.read(grunt.config('doc').reExports);
    const resourcesDataTypes = grunt.file.read(grunt.config('doc').resourcesDataTypes);
    const globalTypeDefFiles = grunt.file.expand(grunt.config('doc').globalTypings);
    try {
      generateDts({
        files,
        localTypeDefFiles: [propertyTypes, reExports, resourcesDataTypes].join('\n\n'),
        globalTypeDefFiles,
        version
      });
    } catch (ex) {
      grunt.fail.warn(ex.stack);
    }
  });

  /* runs static code analysis tools */
  grunt.registerTask('lint', [
    'exec:eslint',
    'validate-json'
  ]);

  grunt.registerTask('package', 'create package.json', () => {
    const stringify = require('format-json');
    const pack = grunt.file.readJSON('package.json');
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
    'copy:client_mock',
    'package',
    'copy:schema',
    'copy:readme',
    'generate-tsd'
  ]);

  grunt.registerTask('test', [
    'exec:test_boot',
    'exec:test_tabris'
  ]);

  grunt.registerTask('verify_typings_fail', () => {
    grunt.file.expand('build/typescript/**/*.fail.ts*').forEach(file => {
      const childProcess = require('child_process').spawnSync(
        'node',
        [
          'node_modules/typescript/bin/tsc',
          '--noImplicitAny',
          '--jsx', 'react',
          '--jsxFactory', 'JSX.createElement',
          '--target', 'es6',
          '--module', 'commonjs',
          '--lib', 'es6,es2015.promise',
          `./${file}`
        ],
        {encoding: 'utf-8'}
      );
      if (childProcess.error || childProcess.status !== 2) {
        grunt.fail.warn('Unexpected tsc status ' + (childProcess.error || childProcess.status) + 'in ' + file);
      }
      const matches = grunt.file.read(file).match(/\/\*Expected\n([\w\W]+)\*\//);
      if (!matches || matches.length !== 2) {
        grunt.fail.warn(
          `No expectations found in ${file}. Suggestion:\n--\n/*Expected\n${childProcess.stdout}*/\n--\n`
        );
      }
      const exp = matches[1].trim().split('\n').filter(match => match.trim().length > 0);
      let remaining = childProcess.stdout;
      for (let i = 0; i < exp.length; i++) {
        const matchIndex = remaining.indexOf(exp[i]);
        if (matchIndex === -1) {
          grunt.fail.warn(`${file} is missing compiler output "${exp[i]}" in:\n${remaining}`);
        }
        remaining = remaining.slice(matchIndex);
      }
    });
  });

  /* runs tests against the build output */
  grunt.registerTask('verify', [
    'exec:verify_tabris',
    'copy:test_ts',
    'exec:verify_typings',
    'copy:snippets',
    'exec:transpile_snippets',
    'verify_typings_fail'
  ]);

  grunt.registerTask('default', [
    'clean',
    'lint',
    'test',
    'build',
    'verify',
    'doc'
  ]);

  grunt.registerTask('quickverify', [
    'clean',
    'build',
    'exec:verify_tabris',
    'copy:test_ts',
    'exec:verify_typings',
    'verify_typings_fail',
    'copy:snippets',
    'exec:transpile_snippets'
  ]);

  function blockComment(text) {
    const commented = text.trim().split('\n').map(line => ' * ' + line).join('\n');
    return '/*!\n' + commented + '\n */\n';
  }

};
