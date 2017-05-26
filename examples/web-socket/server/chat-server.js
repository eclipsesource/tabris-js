const WebSocketServer = require('websocket').server;
const http = require('http');
const PORT = 9000;

let count = 0;
let clients = {};

let server = http.createServer((request, response) => {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(PORT, () => console.log((new Date()) + ' Server is listening on port ' + PORT));

let wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', (request) => {
  let connection = request.accept('chat-protocol', request.origin);
  connection.sendUTF('MOTD: <b>Welcome to the Tabris.js lounge</b><br/>');
  console.log((new Date()) + ' Connection accepted.');
  console.log('Origin ' + request.origin);

  let id = count++;
  clients[id] = connection;

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      for (let i in clients) {
        clients[i].sendUTF(message.utf8Data);
      }
    } else if (message.type === 'binary') {
      console.log('Received binary message of ' + message.binaryData.length + ' bytes.' +
        ' As Uint8Array: ' + new Uint8Array(message.binaryData));
      for (let i in clients) {
        clients[i].sendBytes(message.binaryData);
      }

    }
  });

  connection.on('close', (reasonCode, description) => {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.' +
      ' With code ' + reasonCode + ' and reason ' + description);
  });

});
