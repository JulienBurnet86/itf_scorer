var express = require('express');
var path = require('path');
const http = require('http')
let sockets = [];

var myArgs = process.argv.slice(2);
if (!myArgs[0])
	throw new Error("Please provide configuration file as first argument")
var configFile = myArgs[0]
if (!configFile.startsWith("/") && !configFile.startsWith(".")) {
	configFile = `./${configFile}`
}
var config = require(configFile)
const keyCounter = []
for (var key in config.keys) {
	keyCounter.push({"key": key, "count": 0})
}


//const id = "sr:competition:22540"
// 22480
const id = "sr:competition:" + config.competitionId

const currentMatches = {     
	"Dummy court": {
		"player1": {
			"name": "Player1 Name",
			"games": [6, 4, 4],
			"point": 15,
			// optional
			"serve": false
		},
		"player2": {
			"name": "Player2 Name",
			"games": [4, 6, 4],
			"point": 40,
			// optional
			"server": true
		}
	}
}
function update() {
	// selecting key
	const apiKey = keyCounter.filter(a => a.count < 1000)[0]

	// 9sa5htyu9ufw8wjyzxws7zbu
	const url = 'http://api.sportradar.us/tennis/trial/v3/en/schedules/live/summaries.json?api_key=' + apiKey.key
	console.log("URL is " + url)
	if (sockets.length > 0) {
		http.get(url, res => {
			apiKey.count++
			console.log("keyCounter", keyCounter)
			const data = new Array();
		
			res.on('data', chunk => {
				data.push(chunk);
			});
			
			res.on('end', () => {
				const summaries = JSON.parse(Buffer.concat(data).toString());
				for (const summary of summaries.summaries) {
					if (summary.sport_event.sport_event_context.competition.id == id) {
						const sportEvent = summary.sport_event
						const eventStatus = summary.sport_event_status
						const player1 = {
							name: sportEvent.competitors[0].name,
							games : [
								eventStatus.period_scores && eventStatus.period_scores[0] ? eventStatus.period_scores[0].home_score : 0,
								eventStatus.period_scores && eventStatus.period_scores[1] ? eventStatus.period_scores[1].home_score : 0,
								eventStatus.period_scores && eventStatus.period_scores[2] ? eventStatus.period_scores[2].home_score : 0
							],
							point: eventStatus.game_state ? eventStatus.game_state.home_score : 0
						}
						const player2 = {
							name: sportEvent.competitors[1].name,
							games : [
								eventStatus.period_scores && eventStatus.period_scores[0] ? eventStatus.period_scores[0].away_score : 0,
								eventStatus.period_scores && eventStatus.period_scores[1] ? eventStatus.period_scores[1].away_score : 0,
								eventStatus.period_scores && eventStatus.period_scores[2] ? eventStatus.period_scores[2].away_score : 0
							],
							point: eventStatus.game_state ? eventStatus.game_state.away_score : 0
						}
						currentMatches[sportEvent.venue.name] = {
							"player1" : player1,
							"player2" : player2
						}
					}
				}
				console.log(`currentMatches : ${JSON.stringify(currentMatches)}`)
				sockets.forEach(s => s.send(JSON.stringify(currentMatches)))
			});
		})
	} else {
		console.log("Nobody is connected :( ")
	}
	setTimeout(update, 30000)
}
update()

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

wsServer.on('connection', function(socket) {
	console.log("Connection, sending : ", currentMatches)
  sockets.push(socket);
  if (currentMatches)
  socket.send(JSON.stringify(currentMatches));
  console.log("Message sent")

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function() {
    sockets = sockets.filter(s => s !== socket);
  });
});

var server = app.listen(app.get('port'), function() {
    console.log('listening');
});
