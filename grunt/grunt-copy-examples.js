let path = require('path');
let exec = require('child_process').execSync;

const SRC_DIR = 'examples';
const OUT_DIR = 'build/examples';

module.exports = function(grunt) {

  grunt.registerTask('copy-examples', 'Copy examples to build/', () => {
    let subdirs = grunt.file.expand(SRC_DIR + '/*')
      .filter(dir => grunt.file.exists(dir, 'package.json'))
      .map(dir => path.basename(dir));
    let index = subdirs.map(processExample).filter(value => !!value);
    grunt.file.write(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2));
    if (grunt.file.exists(SRC_DIR, 'README.md')) {
      grunt.file.copy(path.join(SRC_DIR, 'README.md'), path.join(OUT_DIR, 'README.md'));
    }
    grunt.log.writeln(`copied ${index.length} examples from ${SRC_DIR} to ${OUT_DIR}`);
  });

  function processExample(dir) {
    let srcDir = path.join(SRC_DIR, dir);
    let targetDir = path.join(OUT_DIR, dir);
    let manifest = grunt.file.readJSON(path.join(srcDir, 'package.json'));
    if ('title' in manifest) {
      copyExample(srcDir, targetDir);
      copyTabris(targetDir);
      installDependencies(targetDir, manifest);
      return {
        category: manifest.category || '',
        title: manifest.title,
        description: manifest.description || '',
        path: path.basename(srcDir)
      };
    }
  }

  function copyExample(srcDir, targetDir) {
    grunt.file.recurse(srcDir, (abspath, root, subdir, file) => {
      if (!subdir || !subdir.startsWith('node_modules')) {
        grunt.file.copy(abspath, path.join(targetDir, subdir || '', file));
      }
    });
  }

  function copyTabris(targetDir) {
    grunt.file.recurse('build/tabris', (abspath, root, subdir, file) => {
      grunt.file.copy(abspath, path.join(targetDir, 'node_modules/tabris', subdir || '', file));
    });
  }

  function installDependencies(targetDir, manifest) {
    if (Object.keys(manifest.dependencies).length) {
      Object.keys(manifest.dependencies).filter(name => name !== 'tabris').forEach(name => {
        exec('npm install ' + name, {cwd: targetDir});
      });
    }
  }

};
