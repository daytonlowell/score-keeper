# score-keeper

SvelteKit-based score keeping app

So you want to keep score for a game with multiple rounds. Designed to be mobile-first, but works well on desktop as well.

[Live Demo](https://daytonlowell.github.io/score-keeper/)

## Developing

Install dependencies, then start a dev server:

```sh
pnpm install
pnpm dev
```

## Building

The app is a client-only SPA (game state lives in `localStorage`), built as static files via `@sveltejs/adapter-static`:

```sh
pnpm build
```

The output in `build/` can be served from any static file host.
