function getNewRound(players, currentRoundNumber) {
	const newRoundPlayerScores = players.reduce((acc, player) => {
		return { ...acc, [player]: 0 }
	}, {})

	return {
		number: currentRoundNumber + 1,
		scores: newRoundPlayerScores,
	}
}

function swapPosition(array, indexA, indexB) {
	const tmp = array[indexA]
	array[indexA] = array[indexB]
	array[indexB] = tmp

	return array
}

// eslint-disable-next-line no-undef
new Ractive({
	el: 'body',
	template: require('./client.html'),
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
			const scores = this.get('currentGame.rounds').map(round => round.scores)
			const start = this.get('players').reduce((acc, player) => {
				return { ...acc, [player]: 0 }
			}, {})

			return scores.reduce((acc, score) => {
				Object.keys(acc).forEach(key => {
					acc[key] += score[key]
				})

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
		const totals = this.get('totals')
		const scores = Object.values(totals)
		const winningScore = this.get('winningScoreType') === 'HIGH' ? Math.max(...scores) : Math.min(...scores)

		if (this.get('currentGame.rounds').length === 1) {
			return false
		}

		return score === winningScore
	},
	startGame() {
		const ractive = this

		ractive.set({ preGame: false })
		ractive.push('currentGame.rounds', getNewRound(ractive.get('players'), 0))

		ractive.link('currentGame.rounds.0', 'currentRound')
		ractive.link('players.0', 'currentScoringPlayer')

		const roundsToPlay = ractive.get('roundsToPlay')
		const players = ractive.get('players')

		players && players.length > 0 ? localStorage.setItem('players', JSON.stringify(ractive.get('players'))) : localStorage.removeItem('players')
		roundsToPlay ? localStorage.setItem('rounds', JSON.stringify(roundsToPlay)) : localStorage.removeItem('rounds')
	},
	addPlayer(name, context, event) {
		event.preventDefault()

		if (!name || this.get('players').find(player => player === name)) {
			return alert('Player already exists!')
		}

		this.push('players', name)
		this.set({ addPlayerName: '' })
	},
	editPlayer(name) {
		this.removePlayer(name)
		this.set({ addPlayerName: name }).then(() => {
			this.find('#player').select()
		})
	},
	removePlayer(name) {
		const playerIndex = this.get('players').indexOf(name)
		this.splice('players', playerIndex, 1)
	},
	reorderPlayer(playerIndex, moveUp) {
		if ((moveUp && playerIndex !== 0) || (!moveUp && playerIndex !== this.get('players').length - 1)) {
			this.set({ players: swapPosition(this.get('players'), playerIndex, moveUp ? playerIndex - 1 : playerIndex + 1) })
		}
	},
	changeCurrentScoringPlayer(playerIndex) {
		this.link(`players.${playerIndex}`, 'currentScoringPlayer')
	},
	nextRound() {
		if (this.get('currentRound.number') === this.get('roundsToPlay')) {
			const totals = this.get('totals')
			let finalTotals = []

			Object.keys(totals).forEach(key => {
				finalTotals.push(`${key}: ${totals[key]}`)
			})

			return alert(`Game Over!\n\n${finalTotals.join('\n')}`)
		}

		const maxRound = Math.max(...this.get('currentGame.rounds').map(round => round.number))

		this.push('currentGame.rounds', getNewRound(this.get('players'), maxRound))
		this.link('players.0', 'currentScoringPlayer')
		this.link(`currentGame.rounds.${this.get('currentGame.rounds').length - 1}`, 'currentRound')
	},
	changeRound(roundNumber) {
		this.link(`currentGame.rounds.${this.getRoundIndex(roundNumber)}`, 'currentRound')
	},
	changePlayerRoundScore(player, scoreAdjustment) {
		const currentRound = this.get('currentRound')
		let newScore = 0
		if (scoreAdjustment) {
			newScore = currentRound.scores[player] + scoreAdjustment
		}

		this.set(`currentRound.scores.${player}`, newScore)
	},
})
