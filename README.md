# coconut-os-lp

The marketing site for **Coconut OS** — a Linux distribution where agents are first-class kernel primitives.

Lives at: https://coconutos.org

## Stack

- Next.js 15 (App Router, static export)
- Tailwind CSS v4
- motion (Framer Motion v12)
- Lenis (smooth scroll)
- Inter + Fragment Mono (Google Fonts)

## Develop

```sh
bun install
bun dev          # http://localhost:4321
```

## Build

```sh
bun run build    # writes static site to ./out
```

## Deploy

Cloudflare Pages, direct upload from `./out`. Production deploy is automatic on push to `main` once Pages-project is connected.

## Brand

Sibling of Coconut Labs warm-paper palette. Warmer, more confident, slightly cooler in dark mode. Premium typography + color + motion choreography — no gimmicks.

Spec lives in [docs/04-HLD.md §4.20](https://github.com/coconut-labs/coconut-os/blob/main/docs/04-HLD.md) of the parent spec repo.
