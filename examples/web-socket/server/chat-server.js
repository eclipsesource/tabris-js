const os = require('os');
const WebSocketServer = require('websocket').server;
const http = require('http');
const PORT = 9000;

let count = 0;
const clients = {};

const server = http.createServer((request, response) => {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(PORT, () => console.log(
  new Date() + ' Server is listening on: ' +
  externalAddresses().map(address => `  ws://${address}:${PORT}`).join('\n')
));

function externalAddresses() {
  const interfaces = os.networkInterfaces();
  return Object.keys(interfaces)
    .map(key => interfaces[key].find(details => details.family === 'IPv4' && details.internal === false))
    .filter(val => !!val)
    .map(iface => iface.address);
}

const wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', (request) => {
  const connection = request.accept('chat-protocol', request.origin);
  connection.sendUTF('MOTD: <b>Welcome to the Tabris.js lounge</b><br/>');
  console.log((new Date()) + ' Connection accepted.');
  console.log('Origin ' + request.origin);

  const id = count++;
  clients[id] = connection;

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      for (const i in clients) {
        clients[i].sendUTF(message.utf8Data);
      }
    } else if (message.type === 'binary') {
      console.log('Received binary message of ' + message.binaryData.length + ' bytes.' +
        ' As Uint8Array: ' + new Uint8Array(message.binaryData));
      for (const i in clients) {
        clients[i].sendBytes(message.binaryData);
      }

    }
  });

  connection.on('close', (reasonCode, description) => {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.' +
      ' With code ' + reasonCode + ' and reason ' + description);
  });

});
