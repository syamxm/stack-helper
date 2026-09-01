# Stack Helper
# TODO: Update Content

A reference site documenting my self-hosting and development stack — what each tool is, why I use it, and the acronyms behind it. Every entry answers the same three questions: what it does, why it's in my stack, and what the letters stand for.

Live at [stack-helper.syamxm.com](https://stack-helper.syamxm.com).

## Content

100 entries across 8 categories, all in `src/App.jsx`.

| Category | Entries | Covers |
|---|---|---|
| Security & Network | 22 | UFW, Fail2ban, CrowdSec, Tailscale, Cloudflare Tunnel, JWT, CSRF, IDOR |
| Cryptography | 5 | RSA, AES-256-GCM, public-key crypto, hashing vs encryption |
| Infrastructure | 15 | Debian, Docker, Compose, nginx, GitHub Actions, systemd, GHCR |
| DevSecOps & CI/CD | 16 | security-gated pipelines, Gitleaks, Trivy, Hadolint, SBOM, Dependabot |
| Observability | 6 | Prometheus, Grafana, Loki, Promtail, node_exporter, Umami |
| Backend & APIs | 18 | Node, Express, FastAPI, Spring Boot, Postgres, Mongo, Redis |
| Frontend & Mobile | 7 | React, Vite, Tailwind, Flutter, Kotlin/Android |
| Languages | 11 | JavaScript, Python, Java, Kotlin, Dart, SQL, Bash and the rest |

Pick a category from the rail, filter with the `grep tools...` box, expand an entry to read it.

## Tech

React 19 + Vite. No backend, no state library, no CSS framework — the content is a plain array and the UI reads from it.

The hero wordmark is rendered by `src/lib/ascii3d.js`, the same ASCII 3D renderer used on [syamxm.com](https://syamxm.com). JetBrains Mono is self-hosted from `public/fonts/`, so the page makes no external font requests. Analytics is my own Umami instance.

## Structure

```
index.html          entry point, meta tags, font preload
src/
  App.jsx           all content data + the whole UI
  AsciiLogo.jsx     hero wordmark, driven by ascii3d
  index.css         tokens, layout, components
  main.jsx          React root
  lib/ascii3d.js    ASCII 3D renderer
  banner.txt        ANSI Shadow wordmark
  ascii-art.txt     hero art
public/
  fonts/            self-hosted JetBrains Mono
  favicon.svg
```

## Development

```bash
npm install
npm run dev      # local dev server
npm run lint     # eslint
npm run build    # production build to dist/
npm run preview  # serve the built dist/
```

## Deployment

No pipeline. I build locally and copy `dist/` to the homeserver, where nginx serves it as static files behind a Cloudflare Tunnel.

## Related

- [syamxm.com](https://syamxm.com) — portfolio, same terminal-desktop theme
- [cv-spring.syamxm.com](https://cv-spring.syamxm.com) — my CV as a Spring Boot API

## License

Code is free to learn from. Content and copy are mine.
