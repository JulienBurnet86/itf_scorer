const domainName =  window.location.hostname;
let socket = new WebSocket(`ws://${domainName}:8800`);
// let socket = new WebSocket("ws://localhost:8800");
const matches = []


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
				<span className="player-infos col-4"><input class="big-checkbox" type="checkbox" checked={p.serve} onChange={this.props.setServe}/> &nbsp; {p.name}</span>
				<span className="player-infos col-1">{p.games[0]}</span>
				<span className="player-infos col-1">{p.games[1]}</span>
				<span className="player-infos col-1">{p.games[2]}</span>
				<span className="player-infos col-1">{point}</span>
				<span class="col-4">
					<span class="row"> 
						<div className="col-4 btncls"><button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.props.addPoint}>Point +1</button></div>
						<div className="col-4 btncls"><button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.props.removePoint}>Point -1</button></div>
						<div className="col-4 btncls"><button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.props.addGame}>Game +1</button></div>
					</span>
				</span>
			</div>
		</div>
	}
}

class Match extends React.Component {
	
	constructor() {
		super();
		this.addPoint = this.addPoint.bind(this)
		this.removePoint = this.removePoint.bind(this)
		this.changeMatch = this.changeMatch.bind(this)
		this.isEndOfSet = this.isEndOfSet.bind(this)
		this.setServe = this.setServe.bind(this)
		var that = this
		socket.onopen = function(e) {
			socket.onmessage = function(e){
				const msg = JSON.parse(e.data)
				console.log(msg);
				if (msg.type == "init") {
					for (var m of msg.matches) {
						matches.push(m)
					}
					that.setState(matches[msg.currentIdx])
					console.log(matches[msg.currentIdx])
				}
			}
			// socket.send(JSON.stringify(msg));
		};
	}

	addPoint = function(p) {
		
		return () => {
			var p1 = this.state.players[p];
			var p2 = this.state.players[(p + 1) %2];
			var currentSet = this.state.currentSet;
			if (p1.games[currentSet] == 6 && p2.games[currentSet] == 6) {
				p1.tiebreak = true;
				if (p1.points == 0 && p2.points == 0
					|| (p1.points + p2.points) %2 == 0) {
					this.switchServe(p1, p2);
				}
				p1.points++;
				if (p1.points >= 7 && p1.points >= (p2.points +2)) {
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
						this.switchServe(p1, p2);
						p1.points = 0;
						p2.points = 0;
						if (this.isEndOfSet(p1, currentSet, p2)) {
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

	addGame = function(p) {
		
		return () => {
			var p1 = this.state.players[p];
			var p2 = this.state.players[(p + 1) %2];
			p1.games[this.state.currentSet]++;
			if (this.isEndOfSet(p1, this.state.currentSet, p2) && this.state.currentSet < 2) {
				this.state.currentSet++;
			}
			this.switchServe(p1, p2)
			this.setState(this.state)
			socket.send(JSON.stringify(this.state))
		}
	}

	switchServe(p1, p2) {
		if (p1.serve) {
			p1.serve = false;
			p2.serve = true;
		} else {
			p2.serve = false;
			p1.serve = true;
		}
	}

	isEndOfSet(p1, currentSet, p2) {
		return p1.games[currentSet] >= 6 && p1.games[currentSet] - p2.games[currentSet] >= 2;
	}

	resetPoints(players) {
		for (var p of players) {
			p.points = 0;
			p.tiebreak = undefined;
		}
	}

	changeMatch(e) {
		const idx = e.target.value
		const match = matches[idx]
		this.setState(match)
		socket.send(JSON.stringify(match))
	}

	setServe(idx) {
		var p1 = this.state.players[idx];
		var p2 = this.state.players[(idx + 1) %2];
		return () => {
			p1.serve = true;
			p2.serve = false;
			this.setState(this.state)
			socket.send(JSON.stringify(this.state))
		}
	}

    render() {
		var match = this.state;
		if (!match) {
			return <div>EMPTY</div>
		}
		var currentIdx = match.idx;
        return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-6 col-sm-12">
						<h1>
							<select onChange={this.changeMatch}>
								{matches.map(function(match, idx) {
									return <option selected={idx == currentIdx} value={idx}>{match.players[0].name} / {match.players[1].name}</option>
								})}
							</select>
						</h1>
						<br />
						<hr />
						<Player player={match.players[0]} addPoint={this.addPoint(0)} removePoint={this.removePoint(0)}
							setServe={this.setServe(0)} addGame={this.addGame(0)}/>
						<hr />
						<Player player={match.players[1]} addPoint={this.addPoint(1)} removePoint={this.removePoint(1)} 
							setServe={this.setServe(1)} addGame={this.addGame(1)}/>
					</div>
				</div>
			</div>
        );
    }
}

ReactDOM.render(<Match />, document.getElementById('root'));