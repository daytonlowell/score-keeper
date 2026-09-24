import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// This app is fully client-side (localStorage-backed), so it builds as a static SPA.
			// See https://svelte.dev/docs/kit/single-page-apps for more information.
			adapter: adapter({ fallback: 'index.html' }),

			// GitHub Pages serves a project site from /<repo-name>/, not the domain root.
			// The deploy workflow sets BASE_PATH; local dev/build defaults to serving from '/'.
			paths: {
				base: (process.env.BASE_PATH ?? '') as '' | `/${string}`
			}
		})
	]
})
