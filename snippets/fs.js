const {fs} = require('tabris');

let file = fs.filesDir + '/test.dat';

let data = new Uint8Array([1, 2, 3]).buffer;

fs.writeFile(file, data)
  .then(() => fs.readFile(file))
  .then(content => console.log('read ' + content.byteLength + ' bytes'))
  .then(() => fs.removeFile(file))
  .catch(err => console.error(err));
