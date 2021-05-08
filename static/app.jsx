let socket = new WebSocket("ws://localhost:8080");
class Player extends React.Component {
	
	scores = ["0", "15", "30", "40", "AD"]
	
	constructor() {
		super()
	}
	
	render() {
		var p = this.props.player
		var point;
		if (!p.tiebreak) {
			point = this.scores[p.points]
		} else {
			point = p.points;
		}
		return <tr>
			<td>{p.name}</td>
			<td>{p.games[0]}</td>
			<td>{p.games[1]}</td>
			<td>{p.games[2]}</td>
			<td>{point}</td>
			<td><button type="button" className="btn btn-primary" onClick={this.props.addPoint}>Add Point</button></td>
			<td><button type="button" className="btn btn-primary" onClick={this.props.removePoint}>Remove Point</button></td>
		</tr>
	}
}

class Match extends React.Component {
	
	constructor() {
		super();
		this.state = {
			"court": "central",
			"currentSet": 1,
			"players" : [{
				"name": "Roger Federer",
				"games": [6, 3, 0],
				"points": 1,
				"serve": false
			},
			{
				"name": "Rafael Nadal",
				"games": [3, 4, 0],
				"points": 2,
				"serve": true
			}]
		}
		this.addPoint = this.addPoint.bind(this)
		this.removePoint = this.removePoint.bind(this)
		var msg = this.state;
		socket.onopen = function(e) {
			socket.send(JSON.stringify(msg));
		};
	}

	addPoint = function(p) {
		
		return () => {
			var p1 = this.state.players[p];
			var p2 = this.state.players[(p + 1) %2];
			var currentSet = this.state.currentSet;
			if (p1.games[currentSet] == 6 && p2.games[currentSet] == 6) {
				p1.tiebreak = true;
				p1.points++;
				if (p1.points >= 7 && p1.points > p2.points +2) {
					p1.games[currentSet]++;
					this.state.currentSet++;
					this.resetPoints(this.state.players);
				}
			} else {
				if (p2.points == 4) {
					p2.points--;
				} else {
					p1.points++;
					if (p2.points < 3 && p1.points > 3 || p2.points >=3 && (p1.points - p2.points) >= 2) {
						p1.games[currentSet]++;
						p1.points = 0;
						p2.points = 0;
						if (p1.games[currentSet] >= 6 && p1.games[currentSet] - p2.games[currentSet] >= 2) {
							this.state.currentSet++;
						}
					} 
				}
			}
			
			this.setState(this.state)
			socket.send(JSON.stringify(this.state));
		}
	}
	
	removePoint = function(p) {
		
		return () => {
			var p1 = this.state.players[p];
			var p2 = this.state.players[(p + 1) %2];
			if (p1.points > 0) {
				p1.points--;
			} else {
				p1.games[this.state.currentSet]--;
				p2.points = 0; 
			}
			
			this.setState(this.state)
			socket.send(JSON.stringify(this.state))
		}
	}

	resetPoints(players) {
		for (var p of players) {
			p.points = 0;
			p.tiebreak = undefined;
		}
	}

    render() {
		var match = this.state;
        return (
			<div className="container">
				<div className="col-6">

					<h1>Current Match</h1>
					<table className="table">
						<tbody>
							<Player player={match.players[0]} addPoint={this.addPoint(0)} removePoint={this.removePoint(0)}/>
							<Player player={match.players[1]} addPoint={this.addPoint(1)} removePoint={this.removePoint(1)}/>
						</tbody>
					</table>

				</div>
			</div>
        );
    }
}

ReactDOM.render(<Match />, document.getElementById('root'));