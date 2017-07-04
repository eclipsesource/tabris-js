const http = require('http');
const fs = require('fs');
const WebSocketServer = require('websocket').server;

const PORT = 9000;
//let RELOAD = false;


/*fs.watchFile('app.js', (curr, prev) => {
	RELOAD = true;
});*/

const server = http.createServer((request, response) => {
  /*response.writeHead(200);
  if (RELOAD) {
  response.end('APP_RELOAD');
  RELOAD = false;
  } else {
  response.end('APP_LOAD');
  }*/
});
server.listen(PORT);

let wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', (request) => {
  let connection = request.accept('chat-protocol', request.origin);
  connection.sendUTF('APP_LOAD');

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      //console.log('Received Message: ' + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    }
  });

	fs.watchFile('app.js', (curr, prev) => {
	connection.sendUTF('APP_RELOAD');
	});

  connection.on('close', (reasonCode, description) => {
	  // HERE CODE
  });

});
