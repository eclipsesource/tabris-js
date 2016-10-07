let npm = require('npm');
let path = require('path');
let async = require('async');

const EXAMPLES_LOCATION = 'examples';

module.exports = function(grunt) {

  grunt.registerTask('copy-examples', 'Copy examples to build/', function() {
    let done = this.async();
    processExamples(EXAMPLES_LOCATION, done);
  });

  function processExamples(dir, callback) {
    async.map(grunt.file.expand(dir + '/*'), processExample, (err, results) => {
      if (err) {
        grunt.log.error(err);
        return callback(!err);
      }
      let index = results.filter(exists);
      grunt.file.write(path.join('build', dir, 'index.json'), JSON.stringify(index, null, 2));
      if (grunt.file.exists(dir, 'README.md')) {
        grunt.file.copy(path.join(dir, 'README.md'), path.join('build', dir, 'README.md'));
      }
      grunt.log.writeln('copied ' + index.length + ' ' + dir + ' to build/');
      callback();
    });
  }

  function processExample(dir, callback) {
    if (grunt.file.exists(dir, 'package.json')) {
      let manifest = grunt.file.readJSON(path.join(dir, 'package.json'));
      if ('title' in manifest) {
        return installDependencies(dir, manifest, (err) => {
          if (err) {
            return callback(err);
          }
          return copyExample(dir, manifest, callback);
        });
      }
    }
    callback();
  }

  function copyExample(dir, manifest, callback) {
    grunt.file.recurse(dir, (abspath) => {
      grunt.file.copy(abspath, path.join('build', abspath));
    });
    return callback(null, {
      category: manifest.category || '',
      title: manifest.title,
      description: manifest.description || '',
      path: path.basename(dir)
    });
  }

  function installDependencies(dir, manifest, callback) {
    preInstallTabris(dir, manifest);
    if (Object.keys(manifest.dependencies).length === 0) {
      return callback();
    }
    npm.load({}, (err) => {
      if (err) {
        return callback(err);
      }
      grunt.log.writeln('installing dependencies in ' + dir);
      let modules = Object.keys(manifest.dependencies).map((key) => key + '@' + manifest.dependencies[key]);
      npm.commands.install(dir, modules, callback);
    });
  }

  function exists(value) {
    return !!value;
  }

  function preInstallTabris(dir, manifest) {
    delete manifest.dependencies.tabris;
    grunt.file.copy('build/tabris/package.json', dir + '/node_modules/tabris/package.json');
    grunt.file.copy('build/tabris/tabris.min.js', dir + '/node_modules/tabris/tabris.min.js');
    grunt.file.copy('build/tabris/polyfill.min.js', dir + '/node_modules/tabris/polyfill.min.js');
  }

};
