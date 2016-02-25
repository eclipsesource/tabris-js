var WebSocketServer = require("websocket").server;
var http = require("http");
var port = 9000;
var count = 0;
var clients = {};

var server = http.createServer(function(request, response) {
  console.log((new Date()) + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(port, function() {
  console.log((new Date()) + " Server is listening on port " + port);
});

var wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on("request", function(request) {
  var connection = request.accept("chat-protocol", request.origin);
  connection.sendUTF("MOTD: <b>Welcome to the Tabris.js lounge</b><br/>");
  console.log((new Date()) + " Connection accepted.");
  console.log("Origin " + request.origin);

  var id = count++;
  clients[id] = connection;

  connection.on("message", function(message) {
    if (message.type === "utf8") {
      console.log("Received Message: " + message.utf8Data);
      for (var i in clients) {
        clients[i].sendUTF(message.utf8Data);
      }
    } else if (message.type === "binary") {
      console.log("Received binary message of " + message.binaryData.length + " bytes." +
        " As Uint8Array: " + new Uint8Array(message.binaryData));
      for (i in clients) {
        clients[i].sendBytes(message.binaryData);
      }

    }
  });

  connection.on("close", function(reasonCode, description) {
    console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected." +
      " With code " + reasonCode + " and reason " + description);
  });

});
