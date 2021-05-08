import matches from "./matches.js";

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
		return <div className="col-6 col-sm-12 main-div">
			<div className="row player">
				<span className="player-infos col-4">{p.name}</span>
				<span className="player-infos col-1">{p.games[0]}</span>
				<span className="player-infos col-1">{p.games[1]}</span>
				<span className="player-infos col-1">{p.games[2]}</span>
				<span className="player-infos col-1">{point}</span>
				<div className="col-2"><button type="button" className="btn btn-primary btn-lg" onClick={this.props.addPoint}>Add Point</button></div>
				<div className="col-2"><button type="button" className="btn btn-primary btn-lg" onClick={this.props.removePoint}>Remove Point</button></div>
			</div>
		</div>
	}
}

class Match extends React.Component {
	
	constructor() {
		super();
		this.state = matches[0]
		this.addPoint = this.addPoint.bind(this)
		this.removePoint = this.removePoint.bind(this)
		this.changeMatch = this.changeMatch.bind(this)
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

	changeMatch(e) {
		var match = matches[e.target.value]
		if (!match.currentSet) {
			match.currentSet = 0
		}
		for (var p of match.players) {
			if (!p.points) p.points = 0;
			if (!p.games) p.games = [0, 0, 0];
		}
		this.setState(match)
		socket.send(JSON.stringify(match))
	}

    render() {
		var match = this.state;
		var changeMatch = this.changeMatch
        return (
			<div className="container">
				<div className="row">
					<div className="col-6 col-sm-12">
						<h1>
							<select onChange={changeMatch}>
								{matches.map(function(match, idx) {
									return <option value={idx}>{match.players[0].name} / {match.players[1].name}</option>
								})}
							</select>
						</h1>
						<Player player={match.players[0]} addPoint={this.addPoint(0)} removePoint={this.removePoint(0)}/>
						<hr />
						<Player player={match.players[1]} addPoint={this.addPoint(1)} removePoint={this.removePoint(1)}/>
					</div>
				</div>
			</div>
        );
    }
}

ReactDOM.render(<Match />, document.getElementById('root'));