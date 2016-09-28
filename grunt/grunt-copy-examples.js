var npm = require('npm');
var path = require('path');
var async = require('async');

module.exports = function(grunt) {

  grunt.registerTask('copy-examples', 'Copy examples and snippets to build/', function() {
    var src = grunt.config('examples').src;
    var done = this.async();
    async.eachSeries(src, processExamples, function(err) {
      if (err) {
        grunt.log.error(err);
      }
      done(!err);
    });
  });

  function processExamples(dir, callback) {
    async.map(grunt.file.expand(dir + '/*'), processExample, function(err, results) {
      if (err) {
        return callback(err);
      }
      var index = results.filter(exists);
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
      var manifest = grunt.file.readJSON(path.join(dir, 'package.json'));
      if ('title' in manifest) {
        return installDependencies(dir, manifest, function(err) {
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
    grunt.file.recurse(dir, function(abspath) {
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
    npm.load({}, function(err) {
      if (err) {
        return callback(err);
      }
      grunt.log.writeln('installing dependencies in ' + dir);
      var modules = Object.keys(manifest.dependencies).map(function(key) {
        return key + '@' + manifest.dependencies[key];
      });
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
