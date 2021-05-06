class Player extends React.Component {
	
	scores = ["0", "15", "30", "40", "AD"]

	constructor() {
		super()
	}

	render() {
		var p = this.props.player
		var point;
		point = this.scores[p.points]
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
			"players" : [{
				"name": "Roger Federer",
				"games": [6, 3, 3],
				"points": 1,
				"serve": false
			},
			{
				"name": "Rafael Nadal",
				"games": [3, 6, 3],
				"points": 2,
				"serve": true
			}]
		}
		this.addPoint = this.addPoint.bind(this)
		this.removePoint = this.removePoint.bind(this)
	}

	addPoint = function(p) {
		
		return () => {
			var p1 = this.state.players[p];
			var p2 = this.state.players[(p + 1) %2];
			if (p2.points == 4) {
				p2.points--;
			} else {
				p1.points++;
				if (p2.points < 3 && p1.points > 3 || p2.points >=3 && (p1.points - p2.points) >= 2) {
					p1.games[2]++;
					p1.points = 0;
					p2.points = 0;
				} 
			}
			
			this.setState(this.state)
		}
	}
	
	removePoint = function(p) {
		
		return () => {
			var p1 = this.state.players[p];
			var p2 = this.state.players[(p + 1) %2];
			if (p1.points > 0) {
				p1.points--;
			} else {
				p1.games[2]--;
				p2.points = 0; 
			}
			
			this.setState(this.state)
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