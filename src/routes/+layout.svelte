<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'
	import { MediaQuery } from 'svelte/reactivity'

	type Theme = 'light' | 'dark' | 'auto'

	let { children } = $props()

	function loadTheme(): Theme {
		const stored = localStorage.getItem('theme')
		return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto'
	}

	let theme = $state<Theme>(loadTheme())
	const systemPrefersDark = new MediaQuery('(prefers-color-scheme: dark)')
	let computedTheme = $derived(
		theme === 'auto' ? (systemPrefersDark.current ? 'dark' : 'light') : theme
	)

	$effect(() => {
		document.documentElement.setAttribute('data-bs-theme', computedTheme)
	})

	$effect(() => {
		localStorage.setItem('theme', theme)
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="btn-group position-fixed top-0 start-0 m-2" role="group" aria-label="Theme toggle">
	<input
		type="radio"
		class="btn-check"
		id="theme-light"
		autocomplete="off"
		checked={theme === 'light'}
		onclick={() => (theme = 'light')}
	/>
	<label class="btn btn-outline-secondary btn-sm" for="theme-light" title="Light">
		<i class="fas fa-sun"></i>
	</label>

	<input
		type="radio"
		class="btn-check"
		id="theme-dark"
		autocomplete="off"
		checked={theme === 'dark'}
		onclick={() => (theme = 'dark')}
	/>
	<label class="btn btn-outline-secondary btn-sm" for="theme-dark" title="Dark">
		<i class="fas fa-moon"></i>
	</label>

	<input
		type="radio"
		class="btn-check"
		id="theme-auto"
		autocomplete="off"
		checked={theme === 'auto'}
		onclick={() => (theme = 'auto')}
	/>
	<label
		class="btn btn-outline-secondary btn-sm"
		for="theme-auto"
		title="Automatic (matches system)"
	>
		<i class="fas fa-circle-half-stroke"></i>
	</label>
</div>

{@render children()}
