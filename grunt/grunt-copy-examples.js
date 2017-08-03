const {basename, join} = require('path');
const exec = require('child_process').execSync;
const {removeSync, pathExistsSync, copySync, writeFileSync, readJsonSync, readdirSync} = require('fs-extra');

exports.copyExamples = function copyExamples(sourceDir, targetDir) {
  removeSync(targetDir);
  let index = readdirSync(sourceDir)
    .filter(dir => pathExistsSync(join(sourceDir, dir, 'package.json')))
    .map(dir => copyExample(join(sourceDir, dir), join(targetDir, dir)))
    .filter(value => !!value);
  writeFileSync(join(targetDir, 'index.json'), JSON.stringify(index, null, 2));
  if (pathExistsSync(sourceDir, 'README.md')) {
    copySync(join(sourceDir, 'README.md'), join(targetDir, 'README.md'));
  }
  console.log(`copied ${index.length} examples from ${sourceDir} to ${targetDir}`);
};

function copyExample(srcDir, targetDir) {
  let manifest = readJsonSync(join(srcDir, 'package.json'));
  if ('title' in manifest) {
    copySync(srcDir, targetDir, path => !path.includes('/node_modules'));
    copySync('build/tabris', join(targetDir, 'node_modules/tabris'));
    installDependencies(targetDir, manifest);
    return {
      category: manifest.category || '',
      title: manifest.title,
      description: manifest.description || '',
      path: basename(srcDir)
    };
  }
}

function installDependencies(targetDir, manifest) {
  if (Object.keys(manifest.dependencies).length) {
    Object.keys(manifest.dependencies).filter(name => name !== 'tabris').forEach(name => {
      exec('npm install ' + name, {cwd: targetDir});
    });
  }
}
