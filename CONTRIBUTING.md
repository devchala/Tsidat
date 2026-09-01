# Contributing (Team Workflow)

## Branching

- `main` — always deployable.
- `develop` — integration branch; PRs merge here first.
- Feature branches: `feature/<area>-<short-description>`, e.g. `feature/backend-worker-verification`, `feature/web-admin-map`.

## Workflow

1. Branch off `develop`.
2. Commit in small, meaningful chunks (`feat:`, `fix:`, `chore:`, `docs:` prefixes recommended).
3. Open a PR into `develop`. CI (lint + backend tests + web build) must pass.
4. At least 1 other teammate reviews before merge.
5. Periodically merge `develop` → `main` for releases.

## Before you start a task

- Check `packages/shared/src/constants` first — if you need a new role, status, or category, add it there so backend/web/mobile all pick it up, instead of hardcoding a string in your own package.
- Backend: new protected routes must use `requireAuth` + `requireRole(...)` from `middleware/`. Never trust a role/user id coming from the request body.
- Web/mobile: new API calls go in `src/api/endpoints/*.api.js` (web) or `src/api/client.js` consumers (mobile) — don't call `axios` directly from components.

## Commit checklist

- [ ] `npm run lint` passes for your package
- [ ] No secrets committed (`.env` is gitignored — only edit `.env.example` for new variables)
- [ ] New backend routes have RBAC applied
- [ ] New Mongoose fields use the shared enums from `@tsidat/shared` where applicable

## Environment variables

Never commit `.env`. When you add a new variable, add it (with a placeholder, not a real secret) to the relevant `.env.example` and mention it in your PR description.
