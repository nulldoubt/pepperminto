<h1 align="center">Pepperminto Ticket Management 🍵</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-0.2-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/docker/pulls/pepperlabs/peppermint" />
</p>
<p align="center">
    <img src="./static/logo.svg" alt="Logo" height="80px" >
</p>

Pepperminto is a community-maintained fork of Peppermint, focused on a clean, modern admin experience, a public knowledge base, and an updated monorepo workflow.

## ❤️ Fork credits

This is a fork of the original Peppermint project.

- Original repository: https://github.com/Peppermint-Lab/peppermint
- Thank you to the original author and the Peppermint contributors for their work.

## ✨ Highlights

- Modernized admin UI with shadcn components and dark-mode support.
- Public knowledge base with admin-only CRUD workflows.
- Rich-text editing using BlockNote across tickets, documents, and KB.
- Turborepo + pnpm workspace for fast local development.

## 📦 Monorepo layout

- `apps/api` – Fastify API server
- `apps/client` – Admin dashboard (Next.js)
- `apps/knowledge-base` – Public knowledge base (Next.js)
- `apps/docs` – Documentation site (Nextra)

## 🚀 Local development

```bash
pnpm install
pnpm dev
```

Default ports:

- `knowledge-base` → `http://localhost:3000`
- `api` → `http://localhost:3001`
- `client` → `http://localhost:3002`
- `docs` → `http://localhost:3003`

## 📚 Documentation

Run the docs locally with:

```bash
pnpm --filter docs dev
```

The docs are in `apps/docs/content` and the sidebar order is defined in `apps/docs/content/_meta.js`.

## Repo

- Pepperminto fork: https://github.com/nulldoubt/Pepperminto

## License

See `LICENSE` for licensing details.
