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
        src: ['build/tabris-bundle.js'],
        dest: 'build/tabris/tabris.js'
      },
      boot: {
        options: {
          banner,
          process: src => '(function(){\n' + src.replace(/\${VERSION}/g, version) + '}());'
        },
        src: ['build/boot-bundled.js'],
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
      ObservableTypes: 'src/tabris/Observable.types.d.ts',
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
        src: ['**/*.test.ts*', 'package.json', 'tsconfig.json'],
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
        cmd: 'node node_modules/mocha/bin/mocha --colors --require ts-node/register "test/boot/**/*.test.ts"',
        options: {env: Object.assign({TS_NODE_PROJECT: './test/boot/tsconfig.json'}, process.env)}
      },
      verify_tabris: {
        cmd: 'node node_modules/mocha/bin/mocha --colors "test/**/*.verify.js"'
      },
      test_tabris: {
        cmd: 'node node_modules/mocha/bin/mocha --colors --require ts-node/register '
          + '"test/tabris/**/*.test.js" "test/tabris/**/*.test.ts"',
        options: {env: Object.assign({
          TS_NODE_PROJECT: './tsconfig.json',
          // This needs to stay true as long as the tsconfig.json of src/tabris (used for bundle_tabris)
          // differs significantly from the one in root (used here). Specifically,
          // "strictNullChecks" causes compile errors in either the tests when true or in src/tabris when false:
          TS_NODE_TRANSPILE_ONLY: 'true'
        }, process.env)}
      },
      test_spec: {
        cmd: `node node_modules/mocha/bin/mocha --colors --require ts-node/register "${grunt.option('spec')}"`,
        options: {env: Object.assign({
          TS_NODE_PROJECT: './tsconfig.json',
          TS_NODE_TRANSPILE_ONLY: 'true'
        }, process.env)}
      },
      eslint: {
        cmd: 'npx eslint --color --f visualstudio --ext .js,.jsx,.ts,.tsx .'
      },
      bundle_tabris: {
        cmd: 'node node_modules/rollup/bin/rollup --config rollup.tabris.js'
      },
      bundle_boot: {
        cmd: 'node node_modules/rollup/bin/rollup --config rollup.boot.js'
      },
      uglify_tabris: {
        cmd: 'node node_modules/uglify-es/bin/uglifyjs --mangle --keep-fnames --compress ' +
          '-o build/tabris/tabris.min.js build/tabris/tabris.js'
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
    const observableTypes = grunt.file.read(grunt.config('doc').ObservableTypes);
    const globalTypeDefFiles = grunt.file.expand(grunt.config('doc').globalTypings);
    try {
      generateDts({
        files,
        localTypeDefFiles: [
          propertyTypes,
          reExports,
          resourcesDataTypes,
          observableTypes.split('\n\n').slice(1).join('\n\n') // remove imports
        ].join('\n\n'),
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
    'concat:tabris',
    'exec:uglify_tabris',
    'exec:bundle_boot',
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

  /* runs tests against the build output */
  grunt.registerTask('verify', [
    'exec:verify_tabris',
    'copy:test_ts',
    'exec:verify_typings',
    'copy:snippets',
    'exec:transpile_snippets'
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
    'copy:snippets',
    'exec:transpile_snippets'
  ]);

  function blockComment(text) {
    const commented = text.trim().split('\n').map(line => ' * ' + line).join('\n');
    return '/*!\n' + commented + '\n */\n';
  }

};
