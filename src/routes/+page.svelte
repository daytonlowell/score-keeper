<script lang="ts">
	interface Round {
		number: number
		scores: Record<string, number>
	}

	import { fade } from 'svelte/transition'

	let preGame = $state(true)
	let pastPlayers = $state<string[]>(loadJSON<string[]>('pastPlayers') ?? [])
	let players = $state<string[]>([])
	let roundsToPlay = $state<number | undefined>(loadJSON<number>('roundsToPlay') ?? undefined)
	let currentScoringPlayer = $state<string | undefined>(undefined)
	let addPlayerName = $state('')
	let editingIndex = $state<number | null>(null)
	let rounds = $state<Round[]>([])
	let currentRoundNumber = $state<number | null>(null)
	let winningScoreType = $state<'HIGH' | 'LOW'>('HIGH')

	let playerInput: HTMLInputElement | undefined = $state()
	let editPlayerInput: HTMLInputElement | undefined = $state()

	let totals = $derived.by(() => {
		const start: Record<string, number> = {}
		for (const player of players) start[player] = 0

		return rounds.reduce((acc, round) => {
			for (const key of Object.keys(acc)) acc[key] += round.scores[key] ?? 0
			return acc
		}, start)
	})

	let displayRounds = $derived([...rounds].sort((a, b) => b.number - a.number))
	let displayPastPlayers = $derived(pastPlayers.filter((player) => !players.includes(player)))
	let maxRound = $derived(Math.max(...rounds.map((round) => round.number)))
	let currentRound = $derived(rounds.find((round) => round.number === currentRoundNumber))

	$effect(() => {
		localStorage.setItem('pastPlayers', JSON.stringify([...players, ...displayPastPlayers]))
	})

	$effect(() => {
		if (roundsToPlay) {
			localStorage.setItem('roundsToPlay', JSON.stringify(roundsToPlay))
		} else {
			localStorage.removeItem('roundsToPlay')
		}
	})

	$effect(() => {
		if (editingIndex !== null) {
			editPlayerInput?.select()
		}
	})

	function loadJSON<T>(key: string): T | null {
		const raw = localStorage.getItem(key)
		return raw ? JSON.parse(raw) : null
	}

	function getNewRound(players: string[], currentRoundNumber: number): Round {
		const scores: Record<string, number> = {}
		for (const player of players) scores[player] = 0

		return { number: currentRoundNumber + 1, scores }
	}

	function cap(str: string): string {
		return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
	}

	function roundScore(scores: Record<string, number>) {
		const values = Object.values(scores)
		const maxScore = Math.max(...values)
		const minScore = Math.min(...values)
		const highWins = winningScoreType === 'HIGH'

		return {
			winning: highWins ? maxScore : minScore,
			losing: !highWins ? maxScore : minScore
		}
	}

	function isWinningRound(scores: Record<string, number>, player: string) {
		return roundScore(scores).winning === scores[player]
	}

	function isLosingRound(scores: Record<string, number>, player: string) {
		return roundScore(scores).losing === scores[player]
	}

	function isWinningOrLosingRound(scores: Record<string, number>, player: string) {
		return isWinningRound(scores, player) || isLosingRound(scores, player)
	}

	function isWinningScore(score: number) {
		if (rounds.length === 1) return false

		const scores = Object.values(totals)
		const winningScore = winningScoreType === 'HIGH' ? Math.max(...scores) : Math.min(...scores)

		return score === winningScore
	}

	function startGame() {
		if (players.length < 2) {
			alert("You don't have enough players!")
			playerInput?.select()
			return
		}

		const round = getNewRound(players, 0)
		rounds.push(round)
		currentRoundNumber = round.number
		currentScoringPlayer = players[0]
		preGame = false
	}

	function addPlayerSubmit(event: SubmitEvent) {
		event.preventDefault()
		addPlayer(addPlayerName)
	}

	function addPlayer(name: string) {
		const trimmed = name.trim()

		if (!trimmed || players.some((player) => player.toUpperCase() === trimmed.toUpperCase())) {
			alert('Player already exists!')
			return
		}

		players.push(cap(trimmed))
		addPlayerName = ''
	}

	function addAllPastPlayers() {
		players.push(...displayPastPlayers)
	}

	function editPlayer(name: string) {
		editingIndex = players.indexOf(name)
	}

	function stopEditing(event: SubmitEvent) {
		event.preventDefault()
		editingIndex = null
	}

	function editPlayerKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return
		event.stopPropagation()
		editingIndex = null
	}

	function removePlayer(name: string, event: MouseEvent) {
		event.stopPropagation()
		const index = players.indexOf(name)
		if (index !== -1) players.splice(index, 1)
	}

	function removePastPlayer(name: string, event: MouseEvent) {
		event.stopPropagation()
		const index = pastPlayers.indexOf(name)
		if (index !== -1) pastPlayers.splice(index, 1)
	}

	function reorderPlayer(index: number, moveUp: boolean, event: MouseEvent) {
		event.stopPropagation()
		const swapWith = moveUp ? index - 1 : index + 1
		if (swapWith < 0 || swapWith >= players.length) return

		;[players[index], players[swapWith]] = [players[swapWith], players[index]]
	}

	function clearAllPlayers() {
		if (confirm('Are you sure you want to remove all players?')) {
			players = []
			playerInput?.select()
		}
	}

	function changeCurrentScoringPlayer(index: number) {
		currentScoringPlayer = players[index]
	}

	function nextRound() {
		if (maxRound === roundsToPlay) {
			const lines = players.map((player) => `${player}: ${totals[player]}`)
			alert(`Game Over!\n\n${lines.join('\n')}`)
			return
		}

		const round = getNewRound(players, maxRound)
		rounds.push(round)
		currentScoringPlayer = players[0]
		currentRoundNumber = round.number
	}

	function changeRound(roundNumber: number) {
		currentRoundNumber = roundNumber
	}

	function changePlayerRoundScore(player: string, adjustment: number) {
		if (!currentRound) return
		currentRound.scores[player] = (currentRound.scores[player] ?? 0) + adjustment
	}
</script>

<div class="container-md pt-4">
	{#if preGame}
		<div in:fade>
			<div class="d-flex flex-row-reverse mb-2">
				<button
					type="button"
					class="btn btn-outline-success"
					class:disabled={players.length < 2}
					onclick={startGame}
				>
					<i class="fas fa-play-circle"></i> Start Game!
				</button>
			</div>
			<div class="row">
				<div class="col">
					<div class="card h-100">
						<h5 class="card-header">Game Settings</h5>
						<div class="card-body">
							<div class="row">
								<div class="col-12 col-lg-6">
									<div class="mb-3">
										<label for="rounds" class="form-label">Rounds</label>
										<input
											id="rounds"
											class="form-control"
											type="number"
											inputmode="numeric"
											placeholder="Leave blank for unlimited"
											bind:value={roundsToPlay}
										/>
									</div>
								</div>
								<div class="col-12 col-lg-6">
									<label for="winningscore" class="form-label">Winning Score</label>
									<div class="input-group">
										<select id="winningscore" class="form-select" bind:value={winningScoreType}>
											<option value="HIGH">High</option>
											<option value="LOW">Low</option>
										</select>
										<span class="input-group-text">Score Wins</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="col">
					<div class="card h-100">
						<div class="card-header">
							<div class="d-flex justify-content-between align-items-center">
								<h5 class="mb-0">Game Players</h5>
								{#if players.length > 0}
									<button
										type="button"
										class="btn btn-sm btn-outline-danger"
										onclick={clearAllPlayers}
									>
										<i class="fas fa-minus-circle"></i> Clear All
									</button>
								{/if}
							</div>
						</div>
						<ul class="list-group list-group-flush">
							<li class="list-group-item">
								<form class="mb-0" onsubmit={addPlayerSubmit}>
									<div class="input-group">
										<!-- svelte-ignore a11y_autofocus -->
										<input
											id="player"
											bind:this={playerInput}
											placeholder="Add Player Name"
											class="form-control"
											bind:value={addPlayerName}
											autofocus
											autocomplete="off"
										/>
										<button
											class="btn btn-outline-success"
											type="submit"
											id="add-player-button"
											aria-label="Add player"
											disabled={!addPlayerName.trim()}
										>
											<i class="fas fa-plus"></i>
										</button>
									</div>
								</form>
							</li>
							{#each players as player, i (i)}
								<div
									class="list-group-item list-group-item-action"
									role="button"
									tabindex="0"
									onclick={() => editPlayer(player)}
									onkeydown={(event) => event.key === 'Enter' && editPlayer(player)}
								>
									<div class="d-flex justify-content-between align-items-center">
										{#if editingIndex === i}
											<div class="flex-grow-1 me-2">
												<form class="m-0" onsubmit={stopEditing}>
													<div class="input-group">
														<input
															id="edit-player"
															bind:this={editPlayerInput}
															class="form-control"
															bind:value={players[i]}
															onclick={(event) => event.stopPropagation()}
															onkeydown={editPlayerKeydown}
														/>
														<button
															type="submit"
															class="btn btn-outline-success"
															aria-label="Done editing {player}"
															onclick={(event) => event.stopPropagation()}
														>
															<i class="fas fa-check"></i> Done
														</button>
													</div>
												</form>
											</div>
										{:else}
											<div><i class="fas fa-user"></i> {player}</div>
										{/if}

										<div>
											<button
												type="button"
												class="btn btn-sm btn-outline-primary"
												aria-label="Move {player} up"
												onclick={(event) => reorderPlayer(i, true, event)}
												><i class="fas fa-arrow-up"></i></button
											>
											<button
												type="button"
												class="btn btn-sm btn-outline-primary me-2"
												aria-label="Move {player} down"
												onclick={(event) => reorderPlayer(i, false, event)}
												><i class="fas fa-arrow-down"></i></button
											>
											<button
												type="button"
												class="btn btn-sm btn-outline-danger"
												aria-label="Remove {player}"
												onclick={(event) => removePlayer(player, event)}
												><i class="fas fa-minus-circle"></i></button
											>
										</div>
									</div>
								</div>
							{/each}
							{#if displayPastPlayers.length > 0}
								<li class="list-group-item past-players-header">
									<div class="d-flex justify-content-between align-items-center">
										<div class="h6 mb-0">Past Players</div>
										<button
											type="button"
											class="btn btn-sm btn-outline-success"
											onclick={addAllPastPlayers}
										>
											<i class="fas fa-user-plus"></i> Add All
										</button>
									</div>
								</li>
							{/if}
							{#each displayPastPlayers as pastPlayer (pastPlayer)}
								<div
									class="list-group-item list-group-item-action"
									role="button"
									tabindex="0"
									onclick={() => addPlayer(pastPlayer)}
									onkeydown={(event) => event.key === 'Enter' && addPlayer(pastPlayer)}
								>
									<div class="d-flex justify-content-between align-items-center">
										<div><i class="fas fa-user-plus text-success"></i> {pastPlayer}</div>
										<button
											type="button"
											class="btn btn-sm btn-outline-danger"
											aria-label="Remove {pastPlayer} from past players"
											onclick={(event) => removePastPlayer(pastPlayer, event)}
											><i class="fas fa-trash"></i></button
										>
									</div>
								</div>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div in:fade>
			<div class="d-flex flex-row-reverse mb-2">
				<button disabled={players.length < 1} class="btn btn-outline-success" onclick={nextRound}>
					{#if maxRound === roundsToPlay}
						End Game
					{:else}
						<i class="fas fa-forward"></i>
						Move to Round {maxRound + 1}
					{/if}
				</button>
			</div>
			<div class="card">
				<h5 class="card-header">
					Round {currentRound?.number}
					{#if roundsToPlay}
						of {roundsToPlay}
					{/if}
				</h5>
				<div class="card-body">
					<ul class="list-group">
						{#each players as player, i (player)}
							<div
								class="list-group-item list-group-item-action"
								class:list-group-item-primary={player === currentScoringPlayer}
								style="cursor:pointer"
								role="button"
								tabindex="0"
								onclick={() => changeCurrentScoringPlayer(i)}
								onkeydown={(event) => event.key === 'Enter' && changeCurrentScoringPlayer(i)}
							>
								<div class="d-flex justify-content-between">
									<div><i class="fas fa-user"></i> {player}</div>
									<span
										class="badge"
										class:text-bg-secondary={!isWinningOrLosingRound(
											currentRound?.scores ?? {},
											player
										)}
										class:text-bg-success={isWinningRound(currentRound?.scores ?? {}, player)}
										class:text-bg-danger={isLosingRound(currentRound?.scores ?? {}, player)}
										style="width: 56px; font-variant-numeric: tabular-nums;"
									>
										{currentRound?.scores[player]}
									</span>
								</div>
							</div>
						{/each}
					</ul>

					<hr />
					<h4>
						{#if currentScoringPlayer}
							{currentScoringPlayer}: {currentRound?.scores[currentScoringPlayer]}
						{/if}
					</h4>
					<div class="d-flex justify-content-between">
						<button
							type="button"
							class="btn btn-outline-success score-change-button"
							class:disabled={!currentScoringPlayer}
							onclick={() =>
								currentScoringPlayer && changePlayerRoundScore(currentScoringPlayer, -5)}
							>- 5</button
						>
						<button
							type="button"
							class="btn btn-outline-success score-change-button"
							class:disabled={!currentScoringPlayer}
							onclick={() =>
								currentScoringPlayer && changePlayerRoundScore(currentScoringPlayer, -1)}
							>- 1</button
						>
						<button
							type="button"
							class="btn btn-outline-success score-change-button"
							class:disabled={!currentScoringPlayer}
							onclick={() =>
								currentScoringPlayer && changePlayerRoundScore(currentScoringPlayer, 1)}>+ 1</button
						>
						<button
							type="button"
							class="btn btn-outline-success score-change-button"
							class:disabled={!currentScoringPlayer}
							onclick={() =>
								currentScoringPlayer && changePlayerRoundScore(currentScoringPlayer, 5)}>+ 5</button
						>
					</div>
				</div>
			</div>

			<div class="card mt-3">
				<h5 class="card-header">Game Score</h5>
				<div class="table-responsive-sm">
					<table class="table table-bordered table-striped table-sm">
						<thead>
							<tr class="text-end">
								<th scope="col">#</th>
								{#each players as player (player)}
									<th scope="col">
										{player}
										{#if isWinningScore(totals[player])}
											<i class="fas fa-trophy"></i>
										{/if}
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							<tr class="table-primary text-end">
								<th scope="row">Totals</th>
								{#each players as player (player)}
									<td class="number">{totals[player]}</td>
								{/each}
							</tr>
							{#each displayRounds as round (round.number)}
								<tr
									class:table-active={round.number === currentRoundNumber}
									class="text-end"
									style="cursor:pointer"
									onclick={() => changeRound(round.number)}
								>
									<th scope="row">{round.number}</th>
									{#each players as player (player)}
										<td class="number">{round.scores[player]}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.number {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.score-change-button {
		width: 100%;
		margin: 0.2rem;
		touch-action: manipulation;
	}

	.list-group-item {
		font-size: large;
	}

	.past-players-header {
		border-top-width: 3px !important;
	}
</style>
