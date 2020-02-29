'use strict';

var client = "<style>\n\t.number {\n\t\ttext-align: right;\n\t\tfont-variant-numeric: tabular-nums;\n\t}\n\n\t.score-change-button {\n\t\twidth: 100%;\n\t\tmargin: .2rem;\n\t\ttouch-action: manipulation;\n\t}\n</style>\n\n<div class=\"container pt-4\">\n\t{{#if preGame}}\n\t<div class=\"card\">\n\t\t<div class=\"card-header\">\n\t\t\t<div class=\"d-flex justify-content-between\">\n\t\t\t\t<h5><i class=\"fas fa-tally\"></i> New Game</h5>\n\t\t\t\t<button\n\t\t\t\t\tdisabled=\"{{players.length < 1}}\"\n\t\t\t\t\tclass=\"btn btn-sm btn-outline-success\"\n\t\t\t\t\ton-click=\"@this.startGame()\"\n\t\t\t\t><i class=\"fas fa-play-circle\"></i> Start Game!</button>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class=\"card-body\">\n\t\t\t<div class=\"form-row align-items-end\">\n\t\t\t\t<div class=\"col-md-6\">\n\t\t\t\t\t<div class=\"form-group\">\n\t\t\t\t\t\t<label for=\"rounds\">Rounds</label>\n\t\t\t\t\t\t<input\n\t\t\t\t\t\t\tid=\"rounds\"\n\t\t\t\t\t\t\tclass=\"form-control form-control-sm\"\n\t\t\t\t\t\t\ttype=\"number\"\n\t\t\t\t\t\t\tinputmode=\"number\"\n\t\t\t\t\t\t\tplaceholder=\"Leave blank for unlimited\"\n\t\t\t\t\t\t\tvalue=\"{{roundsToPlay}}\"\n\t\t\t\t\t\t/>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"col-md-6\">\n\t\t\t\t\t<div class=\"input-group input-group-sm mb-3\">\n\t\t\t\t\t\t<select\n\t\t\t\t\t\t\tclass=\"form-control custom-select\"\n\t\t\t\t\t\t\tvalue=\"{{winningScoreType}}\"\n\t\t\t\t\t\t>\n\t\t\t\t\t\t\t<option value=\"HIGH\">High</option>\n\t\t\t\t\t\t\t<option value=\"LOW\">Low</option>\n\t\t\t\t\t\t</select>\n\t\t\t\t\t\t<div class=\"input-group-append\">\n\t\t\t\t\t\t\t<span class=\"input-group-text\">Score Wins</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class=\"card\">\n\t\t\t\t<div class=\"card-header\">\n\t\t\t\t\t<div class=\"d-flex justify-content-between\">\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<h5 class=\"mb-0\"><i class=\"fas fa-users\"></i> Players\n\t\t\t\t\t\t\t\t<form\n\t\t\t\t\t\t\t\t\tclass=\"form-group mb-0\"\n\t\t\t\t\t\t\t\t\tstyle=\"display: inline-block;\"\n\t\t\t\t\t\t\t\t\ton-submit=\"@this.addPlayer(addPlayerName, {}, @event)\"\n\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t<div class=\"input-group input-group-sm ml-2\">\n\t\t\t\t\t\t\t\t\t\t<input\n\t\t\t\t\t\t\t\t\t\t\tid=\"player\"\n\t\t\t\t\t\t\t\t\t\t\tplaceholder=\"Add Player Name\"\n\t\t\t\t\t\t\t\t\t\t\tclass=\"form-control\"\n\t\t\t\t\t\t\t\t\t\t\tvalue=\"{{addPlayerName}}\"\n\t\t\t\t\t\t\t\t\t\t\tautofocus\n\t\t\t\t\t\t\t\t\t\t\tautocomplete=\"off\"\n\t\t\t\t\t\t\t\t\t\t/>\n\t\t\t\t\t\t\t\t\t\t<div class=\"input-group-append\">\n\t\t\t\t\t\t\t\t\t\t\t<button\n\t\t\t\t\t\t\t\t\t\t\t\tclass=\"btn btn-outline-success\"\n\t\t\t\t\t\t\t\t\t\t\t\ttype=\"submit\"\n\t\t\t\t\t\t\t\t\t\t\t\tid=\"add-player-button\"\n\t\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t\t<i class=\"fas fa-plus\"></i>\n\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</form>\n\t\t\t\t\t\t\t</h5>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t{{#if players.length > 0}}\n\t\t\t\t\t\t<button\n\t\t\t\t\t\t\tclass=\"btn btn-sm btn-outline-danger\"\n\t\t\t\t\t\t\ton-click=\"@this.set({ players: [] })\"\n\t\t\t\t\t\t><i class=\"fas fa-minus-circle\"></i> Clear Players</button>\n\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t{{#if players && players.length > 0}}\n\t\t\t\t<ul class=\"list-group\">\n\t\t\t\t\t{{#players:i}}\n\t\t\t\t\t<li class=\"list-group-item\">\n\t\t\t\t\t\t<div class=\"d-flex justify-content-between align-items-center\">\n\t\t\t\t\t\t\t<div><i class=\"fas fa-user\"></i> {{this}}</div>\n\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t<button\n\t\t\t\t\t\t\t\t\ton-click=\"@this.reorderPlayer(i, true)\"\n\t\t\t\t\t\t\t\t\tclass=\"btn btn-sm btn-outline-primary\"\n\t\t\t\t\t\t\t\t><i class=\"fas fa-arrow-up\"></i></button>\n\t\t\t\t\t\t\t\t<button\n\t\t\t\t\t\t\t\t\ton-click=\"@this.reorderPlayer(i)\"\n\t\t\t\t\t\t\t\t\tclass=\"btn btn-sm btn-outline-primary mr-2\"\n\t\t\t\t\t\t\t\t><i class=\"fas fa-arrow-down\"></i></button>\n\t\t\t\t\t\t\t\t<button\n\t\t\t\t\t\t\t\t\ton-click=\"@this.editPlayer(this)\"\n\t\t\t\t\t\t\t\t\tclass=\"btn btn-sm btn-outline-warning\"\n\t\t\t\t\t\t\t\t><i class=\"fas fa-pencil\"></i></button>\n\t\t\t\t\t\t\t\t<button\n\t\t\t\t\t\t\t\t\ton-click=\"@this.removePlayer(this)\"\n\t\t\t\t\t\t\t\t\tclass=\"btn btn-sm btn-outline-danger\"\n\t\t\t\t\t\t\t\t><i class=\"fas fa-minus-circle\"></i></button>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</li>\n\t\t\t\t\t{{/players}}\n\t\t\t\t</ul>\n\t\t\t\t{{/if}}\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t{{else}}\n\t<div class=\"card\">\n\t\t<div class=\"card-header\">\n\t\t\t<div class=\"d-flex justify-content-between\">\n\t\t\t\t<h5> Round {{currentRound.number}}\n\t\t\t\t\t{{#if roundsToPlay}}\n\t\t\t\t\tof {{roundsToPlay}}\n\t\t\t\t\t{{/if}}\n\t\t\t\t</h5>\n\t\t\t\t<button\n\t\t\t\t\tdisabled=\"{{players.length < 1}}\"\n\t\t\t\t\tclass=\"btn btn-sm btn-outline-success\"\n\t\t\t\t\ton-click=\"@this.nextRound()\"\n\t\t\t\t>\n\t\t\t\t\t{{#if currentGame.rounds.length === roundsToPlay}}\n\t\t\t\t\tEnd Game\n\t\t\t\t\t{{else}}\n\t\t\t\t\t<i class=\"fas fa-play-circle\"></i>\n\t\t\t\t\tNext Round\n\t\t\t\t\t{{/if}}\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class=\"card-body\">\n\t\t\t<ul class=\"list-group\">\n\t\t\t\t{{#players:i}}\n\t\t\t\t<li\n\t\t\t\t\tclass=\"list-group-item\"\n\t\t\t\t\tstyle=\"cursor: pointer;\"\n\t\t\t\t\ton-click=\"@this.changeCurrentScoringPlayer(i)\"\n\t\t\t\t\tclass-list-group-item-primary=\"players[i] === currentScoringPlayer\"\n\t\t\t\t>\n\t\t\t\t\t<div class=\"d-flex justify-content-between\">\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<i class=\"fas fa-user\"></i> {{this}}\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<span\n\t\t\t\t\t\t\t\tclass=\"badge badge-secondary\"\n\t\t\t\t\t\t\t\tstyle=\"font-variant-numeric: tabular-nums;\"\n\t\t\t\t\t\t\t>{{currentRound.scores[this]}}</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</li>\n\t\t\t\t{{/players}}\n\t\t\t</ul>\n\n\t\t\t<hr>\n\t\t\t<h4>\n\t\t\t\t{{#if currentScoringPlayer}}\n\t\t\t\t{{currentScoringPlayer}}: {{currentRound.scores[currentScoringPlayer]}}\n\t\t\t\t{{else}}\n\t\t\t\t<span class=\"font-italic\">Select a Player</span>\n\t\t\t\t{{/if}}\n\t\t\t</h4>\n\t\t\t<div class=\"d-flex justify-content-between\">\n\t\t\t\t<button\n\t\t\t\t\tclass=\"btn btn-outline-danger score-change-button mr-3\"\n\t\t\t\t\tclass-disabled=\"!currentScoringPlayer\"\n\t\t\t\t\ton-click=\"@this.changePlayerRoundScore(currentScoringPlayer)\"\n\t\t\t\t><i class=\"fas fa-broom\"></i></button>\n\t\t\t\t<button\n\t\t\t\t\tclass=\"btn btn-outline-success score-change-button\"\n\t\t\t\t\tclass-disabled=\"!currentScoringPlayer\"\n\t\t\t\t\ton-click=\"@this.changePlayerRoundScore(currentScoringPlayer, -5)\"\n\t\t\t\t>- 5</button>\n\t\t\t\t<button\n\t\t\t\t\tclass=\"btn btn-outline-success score-change-button\"\n\t\t\t\t\tclass-disabled=\"!currentScoringPlayer\"\n\t\t\t\t\ton-click=\"@this.changePlayerRoundScore(currentScoringPlayer, -1)\"\n\t\t\t\t>- 1</button>\n\t\t\t\t<button\n\t\t\t\t\tclass=\"btn btn-outline-success score-change-button\"\n\t\t\t\t\tclass-disabled=\"!currentScoringPlayer\"\n\t\t\t\t\ton-click=\"@this.changePlayerRoundScore(currentScoringPlayer, 1)\"\n\t\t\t\t>+ 1</button>\n\t\t\t\t<button\n\t\t\t\t\tclass=\"btn btn-outline-success score-change-button\"\n\t\t\t\t\tclass-disabled=\"!currentScoringPlayer\"\n\t\t\t\t\ton-click=\"@this.changePlayerRoundScore(currentScoringPlayer, 5)\"\n\t\t\t\t>+ 5</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<div class=\"card mt-3\">\n\t\t<h5 class=\"card-header\">\n\t\t\tGame Score\n\t\t</h5>\n\t\t<table class=\"table table-bordered table-striped table-sm\">\n\t\t\t<thead>\n\t\t\t\t<tr class=\"text-right\">\n\t\t\t\t\t<th scope=\"col\">#</th>\n\t\t\t\t\t{{#players}}\n\t\t\t\t\t<th scope=\"col\">{{this}}\n\t\t\t\t\t\t{{#if @this.isWinningScore(totals[this])}}\n\t\t\t\t\t\t<i class=\"fas fa-trophy-alt\"></i>\n\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t</th>\n\t\t\t\t\t{{/players}}\n\t\t\t\t</tr>\n\t\t\t</thead>\n\t\t\t<tbody>\n\t\t\t\t<tr class=\"table-primary text-right\">\n\t\t\t\t\t<th scope=\"row\">Totals</th>\n\t\t\t\t\t{{#players}}\n\t\t\t\t\t<td class=\"number\">{{totals[this]}}</td>\n\t\t\t\t\t{{/players}}\n\t\t\t\t</tr>\n\t\t\t\t{{#displayRounds:i}}\n\t\t\t\t<tr\n\t\t\t\t\tclass-table-success=\"number === currentRound.number\"\n\t\t\t\t\tclass=\"text-right\"\n\t\t\t\t\tstyle=\"cursor:pointer;\"\n\t\t\t\t\ton-click=\"@this.changeRound(number)\"\n\t\t\t\t>\n\t\t\t\t\t<th scope=\"row\">{{number}}</th>\n\t\t\t\t\t{{#players}}\n\t\t\t\t\t<td class=\"number\">{{scores[this]}}</td>\n\t\t\t\t\t{{/players}}\n\t\t\t\t</tr>\n\t\t\t\t{{/}}\n\t\t\t</tbody>\n\t\t</table>\n\t</div>\n\t{{/if}}\n</div>";

var client$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': client
});

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var require$$0 = getCjsExportFromNamespace(client$1);

function getNewRound(players, currentRoundNumber) {
	const newRoundPlayerScores = players.reduce((acc, player) => {
		return { ...acc, [player]: 0 }
	}, {});

	return {
		number: currentRoundNumber + 1,
		scores: newRoundPlayerScores,
	}
}

function swapPosition(array, indexA, indexB) {
	const tmp = array[indexA];
	array[indexA] = array[indexB];
	array[indexB] = tmp;

	return array
}

// eslint-disable-next-line no-undef
new Ractive({
	el: 'body',
	template: require$$0,
	data: {
		preGame: true,
		players: JSON.parse(localStorage.getItem('players')) || [],
		roundsToPlay: JSON.parse(localStorage.getItem('rounds')) || null,
		currentScoringPlayer: undefined,
		addPlayerName: '',
		currentRound: {},
		currentGame: {
			rounds: [],
		},
		winningScoreType: 'HIGH',
	},
	computed: {
		totals() {
			const scores = this.get('currentGame.rounds').map(round => round.scores);
			const start = this.get('players').reduce((acc, player) => {
				return { ...acc, [player]: 0 }
			}, {});

			return scores.reduce((acc, score) => {
				Object.keys(acc).forEach(key => {
					acc[key] += score[key];
				});

				return acc
			}, start)
		},
		displayRounds() {
			return this.get('currentGame.rounds').slice().sort((a, b) => b.number - a.number)
		},
	},
	getRoundIndex(givenRoundNumber) {
		return this.get('currentGame.rounds').findIndex(round => round.number === givenRoundNumber)
	},
	isWinningScore(score) {
		const totals = this.get('totals');
		const scores = Object.values(totals);
		const winningScore = this.get('winningScoreType') === 'HIGH' ? Math.max(...scores) : Math.min(...scores);

		if (this.get('currentGame.rounds').length === 1) {
			return false
		}

		return score === winningScore
	},
	startGame() {
		const ractive = this;

		ractive.set({ preGame: false });
		ractive.push('currentGame.rounds', getNewRound(ractive.get('players'), 0));

		ractive.link('currentGame.rounds.0', 'currentRound');
		ractive.link('players.0', 'currentScoringPlayer');

		const roundsToPlay = ractive.get('roundsToPlay');
		const players = ractive.get('players');

		players && players.length > 0 ? localStorage.setItem('players', JSON.stringify(ractive.get('players'))) : localStorage.removeItem('players');
		roundsToPlay ? localStorage.setItem('rounds', JSON.stringify(roundsToPlay)) : localStorage.removeItem('rounds');
	},
	addPlayer(name, context, event) {
		event.preventDefault();

		if (!name || this.get('players').find(player => player === name)) {
			return alert('Player already exists!')
		}

		this.push('players', name);
		this.set({ addPlayerName: '' });
	},
	editPlayer(name) {
		this.removePlayer(name);
		this.set({ addPlayerName: name }).then(() => {
			this.find('#player').select();
		});
	},
	removePlayer(name) {
		const playerIndex = this.get('players').indexOf(name);
		this.splice('players', playerIndex, 1);
	},
	reorderPlayer(playerIndex, moveUp) {
		if ((moveUp && playerIndex !== 0) || (!moveUp && playerIndex !== this.get('players').length - 1)) {
			this.set({ players: swapPosition(this.get('players'), playerIndex, moveUp ? playerIndex - 1 : playerIndex + 1) });
		}
	},
	changeCurrentScoringPlayer(playerIndex) {
		this.link(`players.${playerIndex}`, 'currentScoringPlayer');
	},
	nextRound() {
		if (this.get('currentRound.number') === this.get('roundsToPlay')) {
			const totals = this.get('totals');
			let finalTotals = [];

			Object.keys(totals).forEach(key => {
				finalTotals.push(`${key}: ${totals[key]}`);
			});

			return alert(`Game Over!\n\n${finalTotals.join('\n')}`)
		}

		const maxRound = Math.max(...this.get('currentGame.rounds').map(round => round.number));

		this.push('currentGame.rounds', getNewRound(this.get('players'), maxRound));
		this.link('players.0', 'currentScoringPlayer');
		this.link(`currentGame.rounds.${this.get('currentGame.rounds').length - 1}`, 'currentRound');
	},
	changeRound(roundNumber) {
		this.link(`currentGame.rounds.${this.getRoundIndex(roundNumber)}`, 'currentRound');
	},
	changePlayerRoundScore(player, scoreAdjustment) {
		const currentRound = this.get('currentRound');
		let newScore = 0;
		if (scoreAdjustment) {
			newScore = currentRound.scores[player] + scoreAdjustment;
		}

		this.set(`currentRound.scores.${player}`, newScore);
	},
});
//# sourceMappingURL=build.js.map
