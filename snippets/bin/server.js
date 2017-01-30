const colors = require('colors/safe');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ecstatic = require('ecstatic');
const union = require('union');

const PORT = 8080;

if (!process.argv[2]) {
  fail('You need to specify a snippet. E.g.: \n  npm start button.js');
}

let fileName = `${path.parse(process.argv[2]).name}.js`;
if (!exists(fileName)) {
  fail('Snippet does not exist.');
}

let externalAddresses = getExternalAddresses();
if (!externalAddresses.length) {
  fail('No remotely accessible network interfaces.');
}

let servePackageJson = (req, res, next) => {
  if (req.url === '/package.json') {
    return res.end(JSON.stringify({main: fileName}));
  }
  next();
};

let server = union.createServer({
  before: [servePackageJson, ecstatic({root: path.join(__dirname, '..')})]
});

server.listen(PORT, () => {
  let port = server.address().port;
  console.log(
    colors.yellow(`Server started for ${colors.red.bold(fileName)}.\nPoint your Tabris.js client to:`)
  );
  externalAddresses.forEach(
    iface => console.log(colors.green('  http://' + iface.address + ':' + port.toString()))
  );
});

function getExternalAddresses() {
  let interfaces = os.networkInterfaces();
  return Object.keys(interfaces)
    .map(key => interfaces[key].find(details => details.family === 'IPv4' && details.internal === false))
    .filter(val => !!val);
}

function fail(message) {
  console.error(colors.red(message));
  process.exit(1);
}

function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch(e) {
    return false;
  }
}
