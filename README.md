# Stack Helper

A reference site documenting my self-hosting and development stack — what each tool is, why I use it, and the acronyms behind it. Covers security, infrastructure, observability, backend, and frontend tooling running on my homeserver.

Live at [stack-helper.syamxm.com](https://stack-helper.syamxm.com).

## Tech

React 19 + Vite. No backend — all content is static data in `src/App.jsx`.

## Development

```bash
npm install
npm run dev      # local dev server
npm run lint     # eslint
npm run build    # production build to dist/
```

## Deployment

Built `dist/` is served as static files by the homeserver's nginx reverse proxy, published through a Cloudflare Tunnel.
