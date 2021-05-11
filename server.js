var express = require('express');
var path = require('path');
var myArgs = process.argv.slice(2);
if (!myArgs[0])
	throw new Error("Json file of matches needs to be 1st argment")
var matchesFile = myArgs[0]
if (!matchesFile.startsWith("/") && !matchesFile.startsWith(".")) {
	matchesFile = `./${matchesFile}`
}
var matches = require(matchesFile);
var currentIdx = 0;
for (var idx in matches) {
	const match = matches[idx]
	if (!match.idx) {
		match.idx = idx;
	}
	if (!match.currentSet) {
		match.currentSet = 0;
	}
	for (var p of match.players) {
		if (!p.points)
			p.points = 0;
		if (!p.games)
			p.games = [0, 0, 0];
		if (p.serve === undefined) {
			p.serve = false;
		}
	}
}

var app = express();

var staticPath = path.join(__dirname, '/static');
app.use(express.static(staticPath));
app.use("/modules", express.static(path.join(__dirname, "node_modules")));

// Allows you to set port in the project properties.
app.set('port', process.env.PORT || 3000);

const WebSocket = require('ws');
const wsServer = new WebSocket.Server({
  port: 8800
});

let sockets = [];
wsServer.on('connection', function(socket) {
  sockets.push(socket);
  const initMsg = { 'type': 'init', 'currentIdx': currentIdx, 'matches': matches };
  socket.send(JSON.stringify(initMsg));
  // When you receive a message, send that message to every socket.
  socket.on('message', function(msg) {
    var match = JSON.parse(msg);
	matches[match.idx] = match;
	currentIdx = match.idx;
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
