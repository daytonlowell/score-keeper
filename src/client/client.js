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

const cap = str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`

// eslint-disable-next-line no-undef
new Ractive({
	el: 'body',
	template: require('./client.html'),
	data: {
		preGame: true,
		pastPlayers: JSON.parse(localStorage.getItem('pastPlayers')) || [],
		players: [],
		roundsToPlay: JSON.parse(localStorage.getItem('roundsToPlay')) || null,
		currentScoringPlayer: undefined,
		addPlayerName: '',
		currentRound: {},
		currentEditPlayer: '',
		currentGame: {
			rounds: [],
		},
		winningScoreType: 'HIGH',
	},
	transitions: {
		fade: require('ractive-transitions-fade'),
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
		displayPastPlayers() {
			const players = this.get('players')

			return this.get('pastPlayers').filter(pastPlayer => {
				return !players.includes(pastPlayer)
			})
		},
		maxRound() {
			return Math.max(...this.get('currentGame.rounds').map(({ number }) => number))
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
	roundScore(scores) {
		scores = Object.values(scores)
		const maxScore = Math.max(...scores)
		const minScore = Math.min(...scores)

		const highWins = this.get('winningScoreType') === 'HIGH'

		return {
			winning: highWins ? maxScore : minScore,
			losing: !highWins ? maxScore : minScore,
		}
	},
	isWinningRound(roundScores, player) {
		return this.roundScore(roundScores).winning === roundScores[player] || 0
	},
	isLosingRound(roundScores, player) {
		return this.roundScore(roundScores).losing === roundScores[player] || 0
	},
	isWinningOrLosingRound(roundScores, player) {
		return this.isWinningRound(roundScores, player) || this.isLosingRound(roundScores, player)
	},
	startGame() {
		if (this.get('players.length') < 2) {
			alert(`You don't have enough players!`)
			return this.find('#player').select()
		}

		Promise.all([
			this.push('currentGame.rounds', getNewRound(this.get('players'), 0)),
			this.link('currentGame.rounds.0', 'currentRound'),
			this.set({ currentScoringPlayer: this.get('players')[0] }),
			//TODO restore after ractive.link memory leak is fixed
			//ractive.link('players.0', 'currentScoringPlayer'),
		]).then(() => {
			this.set({ preGame: false })
		})
	},
	addPlayerSubmit(name, context, event) {
		event.preventDefault()

		this.addPlayer(name)
	},
	addPlayer(name) {
		if (!name || this.get('players').find(player => player.toUpperCase() === name.toUpperCase())) {
			return alert('Player already exists!')
		}

		this.push('players', cap(name.trim()))
		this.set({ addPlayerName: '' })
	},
	editPlayer(name) {
		this.link(`players.${this.get('players').indexOf(name)}`, 'currentEditPlayer').then(() => {
			this.find('#edit-player').select()
		})
	},
	removePlayer(name, event) {
		event.stopPropagation()

		this.splice('players', this.get('players').indexOf(name), 1)
		return false
	},
	removePastPlayer(name, event) {
		event.stopPropagation()

		this.splice('pastPlayers', this.get('pastPlayers').indexOf(name), 1)

		return false
	},
	reorderPlayer(playerIndex, moveUp, event) {
		event.stopPropagation()

		if ((moveUp && playerIndex !== 0) || (!moveUp && playerIndex !== this.get('players').length - 1)) {
			this.set({ players: swapPosition(this.get('players'), playerIndex, moveUp ? playerIndex - 1 : playerIndex + 1) })
		}

		return false
	},
	clearAllPlayers() {
		if (confirm('Are you sure you want to remove all players?')) {
			this.set({ players: [] }).then(() => this.find('#player').select())
		}
	},
	changeCurrentScoringPlayer(playerIndex) {
		this.set({ currentScoringPlayer: this.get('players')[playerIndex] })
		//TODO restore this when the ractive.link memory leak bug is fixed.
		//this.link(`players.${playerIndex}`, 'currentScoringPlayer')
	},
	nextRound() {
		if (this.get('maxRound') === this.get('roundsToPlay')) {
			const totals = this.get('totals')
			let finalTotals = []

			Object.keys(totals).forEach(key => {
				finalTotals.push(`${key}: ${totals[key]}`)
			})

			return alert(`Game Over!\n\n${finalTotals.join('\n')}`)
		}

		this.push('currentGame.rounds', getNewRound(this.get('players'), this.get('maxRound')))

		//TODO restore this when the ractive.link memory leak bug is fixed.
		//this.link('players.0', 'currentScoringPlayer')
		this.set({ currentScoringPlayer: this.get('players')[0] })

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
	oninit() {
		this.observe('players displayPastPlayers', () => {
			const displayPastPlayers = this.get('displayPastPlayers')
			const currentPlayers = this.get('players')

			localStorage.setItem('pastPlayers', JSON.stringify([ ...currentPlayers, ...displayPastPlayers ]))
		}, { init: false })

		this.observe('roundsToPlay', roundsToPlay => {
			roundsToPlay
				? localStorage.setItem('roundsToPlay', JSON.stringify(roundsToPlay))
				: localStorage.removeItem('roundsToPlay')
		}, { init: false })
	},
})
