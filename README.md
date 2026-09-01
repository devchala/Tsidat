# ጽዳት (Tsidat) — Digital Waste Management, Community Reporting & Smart Collection Platform

Monorepo for the web + mobile Tsidat platform: a shared Node/Express + MongoDB
backend, a React (Vite) web app, and an Expo/React Native mobile app.

## Structure

```
tsidat/
├── packages/
│   ├── shared/     # constants shared by all apps (roles, statuses, categories)
│   ├── backend/    # Node.js + Express API, MongoDB/Mongoose, JWT auth, RBAC
│   ├── web/        # React + Vite + Tailwind — citizen/worker/admin web app
│   └── mobile/     # Expo/React Native — citizen + field-worker mobile app
├── docs/
├── docker-compose.yml   # local MongoDB + backend container
└── .github/workflows/   # CI: lint + test backend, build web
```

`shared`, `backend`, and `web` are npm workspaces (one `npm install` at the
root wires them together). `mobile` is a separate Expo project — install it
independently (Expo/Metro doesn't play well inside npm workspaces).

## Getting started

### 1. Backend + Web (from repo root)

```bash
npm install
cp packages/backend/.env.example packages/backend/.env   # fill in real secrets
cp packages/web/.env.example packages/web/.env

# Start MongoDB locally, OR just run:
docker compose up -d mongo

npm run dev   # runs backend (port 5000) + web (port 5173) together
```

- Backend health check: `GET http://localhost:5000/api/v1/health`
- Web app: `http://localhost:5173`

### 2. Mobile

```bash
cd packages/mobile
npm install
cp .env.example .env
npx expo start
```

## Team split suggestion (5 members)

| Area | Suggested owner(s) |
|---|---|
| Backend core: auth, RBAC, models, security middleware | 1 person |
| Backend features: reports/incidents/assignments, priority scoring, analytics | 1 person |
| Web app: citizen + worker flows | 1 person |
| Web app: admin Command Center + analytics/map | 1 person |
| Mobile app (Expo): citizen reporting + worker task flow | 1 person |

Everyone works off `packages/shared` for roles/statuses/categories so the
three apps never drift out of sync — see `CONTRIBUTING.md` for the branching
workflow.

## Security notes baked into this scaffold

- Passwords hashed with bcrypt (12 rounds); never store plaintext.
- Short-lived JWT access tokens + longer-lived refresh tokens, verified server-side on every request (`middleware/auth.js`).
- Role checks are enforced **server-side** only (`middleware/role.js`) — the client role is UI-only.
- `helmet`, `cors` (explicit origin allowlist), `express-mongo-sanitize`, `xss-clean`, `hpp`, and rate limiting (tighter on `/auth/*`) are wired into `app.js` by default.
- Centralized error handler that never leaks stack traces in production.
- Env var validation fails fast at boot instead of running with missing secrets.
- Audit logging pattern demonstrated in `admin.controller.js` for sensitive admin actions.

This is a starting point, not a finished security review — see `docs/ARCHITECTURE.md` for what's still a TODO.
