var express = require('express');
var path = require('path');

var app = express();

var staticPath = path.join(__dirname, '/static');
app.use(express.static(staticPath));
app.use("/modules", express.static(path.join(__dirname, "node_modules")));

// Allows you to set port in the project properties.
app.set('port', process.env.PORT || 3000);

const WebSocket = require('ws');
const wsServer = new WebSocket.Server({
  port: 8080
});

let sockets = [];
wsServer.on('connection', function(socket) {
  sockets.push(socket);

  // When you receive a message, send that message to every socket.
  socket.on('message', function(msg) {
    sockets.forEach(s => s.send(msg));
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function() {
    sockets = sockets.filter(s => s !== socket);
  });
});

var server = app.listen(app.get('port'), function() {
    console.log('listening');
});
