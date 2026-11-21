# ጽዳት (Tsidat)

**Digital Waste Management, Community Reporting & Smart Collection Platform**

Tsidat is a multi-client platform intended to help communities report waste-related problems and help municipal teams review, prioritize, assign, and track collection or cleanup work. The repository is organized as a monorepo with a shared REST API, a web application, a mobile application, and common domain constants.

> **Project status:** This repository contains an implementation scaffold and selected working flows. Some operational capabilities described in the architecture—such as incident clustering, automated worker recommendations, full task execution, notifications, and the admin command center—are still planned or incomplete. See [Architecture and implementation status](#architecture-and-implementation-status) before treating the platform as production-ready.

**Project walkthrough:** [Watch the project video](https://youtu.be/pf-FQ4ZQ2yc?si=5Dzc-ODq3-sAfQt3)

---

## Contents

- [Purpose](#purpose)
- [Core capabilities](#core-capabilities)
- [Technology stack](#technology-stack)
- [System architecture](#system-architecture)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Available commands](#available-commands)
- [API overview](#api-overview)
- [Roles and domain model](#roles-and-domain-model)
- [Security](#security)
- [Architecture and implementation status](#architecture-and-implementation-status)
- [Team workflow and contribution](#team-workflow-and-contribution)
- [Testing](#testing)
- [Documentation](#documentation)

## Purpose

Waste-management issues can be difficult to report, coordinate, and follow through when information is scattered across informal channels. Tsidat provides a common digital workflow for:

1. Submitting waste-related reports with descriptions, categories, and geographic coordinates.
2. Giving citizens visibility into the reports they have submitted.
3. Supporting municipal staff with report review, worker verification, and operational oversight.
4. Establishing a foundation for prioritization, incident grouping, worker assignment, and performance analytics.

## Core capabilities

### Available in the current scaffold

- User registration and login with password hashing.
- JWT-based access and refresh token endpoints.
- Role-aware authorization middleware.
- Citizen report submission and personal report listing.
- Report detail access with ownership checks for citizens and staff access rules.
- Report status history creation when a report is submitted.
- Worker profile retrieval for authenticated workers.
- Admin worker verification with an audit-log record.
- Basic report overview analytics grouped by status and waste category.
- Shared role, report-status, priority, and waste-category constants.
- Web and mobile application foundations with authentication/navigation and selected report/worker screens.

### Planned or not yet fully wired

- Photo/file upload and attachment storage.
- Automatic duplicate detection and geographic incident clustering.
- End-to-end priority-score calculation and application to reports/incidents.
- Smart worker recommendations based on location, availability, and workload.
- Complete worker task lifecycle and assignment management.
- In-app notifications and delivery integrations.
- Full administrator command center, map interface, and expanded analytics.
- Server-side refresh-token storage, rotation, and revocation.

## Technology stack

| Layer                   | Technologies                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| Web client              | React, Vite, React Router, Axios, Tailwind CSS                                                                  |
| Mobile client           | React Native, Expo, React Navigation, Axios                                                                     |
| Backend                 | Node.js, Express.js                                                                                             |
| Database                | MongoDB, Mongoose                                                                                               |
| Authentication          | JSON Web Tokens (JWT), bcryptjs                                                                                 |
| Validation and security | express-validator, Helmet, CORS, rate limiting, Mongo sanitization, XSS and HTTP parameter-pollution protection |
| Logging                 | Winston, Morgan                                                                                                 |
| Testing                 | Jest, Supertest                                                                                                 |
| Development tooling     | npm workspaces, ESLint, Prettier, Husky, Docker Compose                                                         |

## System architecture

```text
       React Web Client                 Expo Mobile Client
               |                               |
               +---------------+---------------+
                               |
                         HTTPS / REST
                               |
                    Express API (/api/v1)
                               |
          +--------------------+--------------------+
          |                    |                    |
     Auth & RBAC          Domain routes        Middleware
          |             Reports / Workers     Validation,
          |             Admin / Analytics     security, errors
          +--------------------+--------------------+
                               |
                         Mongoose ODM
                               |
                           MongoDB

                  Shared domain constants
             roles / statuses / priorities / categories
```

Both clients communicate with the same backend API. Authorization decisions are enforced by backend middleware; client-side route protection is only a user-interface convenience and is not a security boundary. Shared constants in `packages/shared` reduce inconsistencies between clients and the server.

## Repository structure

```text
tsidat/
├── packages/
│   ├── backend/             # Express API, models, routes, services and tests
│   ├── shared/              # Shared roles, statuses, priorities and categories
│   ├── web/                 # React + Vite web client
│   └── mobile/              # Expo / React Native mobile client
├── docs/
│   └── ARCHITECTURE.md      # Architecture notes and implementation TODOs
├── .github/workflows/       # Continuous-integration workflows
├── .husky/                  # Git hooks
├── docker-compose.yml       # Local MongoDB and backend services
├── CONTRIBUTING.md          # Branching and contribution workflow
├── package.json             # Root workspace configuration and scripts
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18 or later and npm.
- MongoDB 7 locally, or Docker Desktop / Docker Engine with Docker Compose.
- For mobile development: Expo-compatible Android/iOS tooling or the Expo Go app.

### 1. Clone the repository

```bash
git clone <repository-url>
cd tsidat
```

Replace `<repository-url>` with the repository's actual Git URL.

### 2. Install workspace dependencies

```bash
npm install
```

The root npm workspace includes `packages/shared`, `packages/backend`, and `packages/web`.

### 3. Configure the backend

```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env` and set the MongoDB connection string and unique, strong JWT secrets. Do not commit `.env` files or real credentials.

### 4. Configure the web client

If the web package's environment example is present:

```bash
cp packages/web/.env.example packages/web/.env
```

Set the API base URL to the backend, normally `http://localhost:5000/api/v1` for local development. Follow the variable name documented in the web package's `.env.example`.

### 5. Start MongoDB

Using Docker Compose:

```bash
docker compose up -d mongo
```

Alternatively, start a local MongoDB instance and make sure `MONGO_URI` in the backend environment points to it.

### 6. Run the backend and web client

From the repository root:

```bash
npm run dev
```

Or run each application separately:

```bash
npm run dev:backend
npm run dev:web
```

Default local addresses:

- Web client: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/v1/health`

### 7. Run the mobile client

The mobile app is maintained as a separate Expo project rather than part of the root npm workspaces.

```bash
cd packages/mobile
npm install
cp .env.example .env
npx expo start
```

Set `EXPO_PUBLIC_API_BASE_URL` to an address reachable from the mobile device. When testing on a physical phone, `localhost` refers to the phone itself; use the development machine's LAN IP address and ensure both devices can reach the backend.

## Environment configuration

Backend configuration is documented in `packages/backend/.env.example`. It includes:

| Variable                     | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `NODE_ENV`                   | Runtime environment                            |
| `PORT`                       | API server port                                |
| `MONGO_URI`                  | MongoDB connection URI                         |
| `JWT_ACCESS_SECRET`          | Secret used to sign access tokens              |
| `JWT_REFRESH_SECRET`         | Separate secret used to sign refresh tokens    |
| `JWT_ACCESS_EXPIRES_IN`      | Access-token lifetime                          |
| `JWT_REFRESH_EXPIRES_IN`     | Refresh-token lifetime                         |
| `CORS_ORIGINS`               | Comma-separated allowed client origins         |
| `MAX_UPLOAD_MB`              | Intended upload-size limit                     |
| `UPLOAD_DIR`                 | Intended local upload directory                |
| `AUTH_RATE_LIMIT_WINDOW_MIN` | Authentication rate-limit window               |
| `AUTH_RATE_LIMIT_MAX`        | Maximum authentication requests in that window |

Use the example files as the source of truth for each package's current environment-variable names. Never place real secrets in source control, screenshots, issue descriptions, or documentation.

## Available commands

Run these from the repository root unless otherwise stated.

| Command                                  | Description                                        |
| ---------------------------------------- | -------------------------------------------------- |
| `npm install`                            | Install root workspace dependencies                |
| `npm run dev`                            | Start backend and web development servers together |
| `npm run dev:backend`                    | Start the backend with nodemon                     |
| `npm run dev:web`                        | Start the Vite web client                          |
| `npm run lint`                           | Run ESLint for backend and web source              |
| `npm run format`                         | Format package source files with Prettier          |
| `npm test --workspace=packages/backend`  | Run backend Jest tests                             |
| `npm run build --workspace=packages/web` | Build the web client for production                |

Mobile commands, from `packages/mobile`:

| Command                    | Description                       |
| -------------------------- | --------------------------------- |
| `npx expo start`           | Start the Expo development server |
| `npx expo start --android` | Start and open Android target     |
| `npx expo start --ios`     | Start and open iOS target         |

## API overview

The backend mounts its versioned API under `/api/v1`.

| Method  | Endpoint                          | Purpose                                           | Access               |
| ------- | --------------------------------- | ------------------------------------------------- | -------------------- |
| `GET`   | `/health`                         | API health check                                  | Public               |
| `POST`  | `/auth/register`                  | Register an account                               | Public, rate-limited |
| `POST`  | `/auth/login`                     | Authenticate and receive tokens                   | Public, rate-limited |
| `POST`  | `/auth/refresh`                   | Refresh token flow                                | Public, rate-limited |
| `GET`   | `/auth/me`                        | Get the authenticated user's profile              | Authenticated        |
| `POST`  | `/reports`                        | Submit a waste report                             | Authenticated        |
| `GET`   | `/reports/mine`                   | List the current citizen's reports                | Authenticated        |
| `GET`   | `/reports/:id`                    | Retrieve a report subject to ownership/role rules | Authenticated        |
| `GET`   | `/workers/me`                     | Retrieve the current worker profile               | Worker               |
| `PATCH` | `/admin/workers/:workerId/verify` | Verify a worker                                   | Admin                |
| `GET`   | `/analytics/overview`             | Aggregate reports by status and category          | Admin or Planner     |

All endpoints are relative to `/api/v1`. This table describes routes present in the current backend scaffold; it is not a promise that every planned feature or workflow is complete. Refer to route files and API tests for the latest behavior.

## Roles and domain model

The shared role constants currently define:

- **Citizen** — submits waste-related reports and views their own reports.
- **Worker** — has a worker profile and is intended to carry out assigned field tasks.
- **Admin** — verifies workers and is intended to manage platform operations.
- **Planner** — supports planning and analytics access.

Key backend domain entities include `User`, `Worker`, `Report`, `Incident`, `Assignment`, `Attachment`, `StatusHistory`, `Notification`, `Feedback`, and `AuditLog`.

A `Report` records the citizen who submitted it, waste category, description, geographic point, status, priority information, related incident, and attachments. An `Incident` is designed to group multiple related reports into an operational issue. An `Assignment` links an incident to a worker and records task progress. Geographic fields use GeoJSON-style points with coordinate order `[longitude, latitude]`.

## Security

The backend scaffold includes several security controls:

- Password hashing with `bcryptjs`.
- JWT authentication middleware and role-based authorization middleware.
- Server-side ownership and role checks for protected report access.
- Helmet security headers and configured CORS origins.
- Request rate limiting, including a stricter authentication limiter.
- MongoDB query sanitization, XSS input sanitization, and HTTP parameter-pollution protection.
- Request validation and centralized error handling.
- Audit-log example for worker verification.
- Environment-variable validation during server startup.

These controls are an implementation baseline, not a completed security audit. Review token lifecycle, upload handling, authorization coverage, deployment secrets, logging, and operational monitoring before production deployment.

## Architecture and implementation status

The repository's `docs/ARCHITECTURE.md` distinguishes the current scaffold from remaining team work. In summary:

| Area                      | Current repository evidence                                                    | Remaining work identified in architecture                                |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Authentication            | Registration, login, refresh, current-user flow                                | Strengthen refresh-token storage, rotation and revocation                |
| Reports                   | Citizen report creation, personal listing, detail access, status-history entry | Attachments, duplicate detection, incident linking, priority integration |
| Workers                   | Worker model, profile endpoint, admin verification example                     | Registration/availability flow, assigned tasks, task-state transitions   |
| Incidents and assignments | Mongoose models exist                                                          | Clustering, assignment operations and worker recommendation              |
| Notifications             | Notification model exists                                                      | Notification creation, delivery and client UI                            |
| Administration            | Worker verification and audit example                                          | Full command center, incident queue, map and manual assignment interface |
| Analytics                 | Basic status/category aggregation                                              | Hotspots, trends and worker-performance analytics                        |
| Mobile                    | Expo app, auth/navigation foundations and selected screens                     | Complete camera/GPS reporting, worker task flow and push notifications   |

Keep this section updated as features are implemented, tested, and reviewed. Mark a feature as complete only when its implementation and relevant tests have been verified.

## Team Workflow and Contribution

Tsidat follows a collaborative Git workflow to maintain code consistency, support parallel development, and ensure that changes are properly reviewed before integration.

### Branching Strategy

The project uses the following branch structure:

| Branch      | Purpose                                           |
| ----------- | ------------------------------------------------- |
| `main`      | Stable and deployable project version             |
| `develop`   | Main integration branch for ongoing development   |
| `feature/*` | Individual branches for implementing new features |
| `fix/*`     | Branches for bug fixes and corrections            |

Feature branches should be created from `develop` and merged back through pull requests.

### Development Workflow

Team members should follow these steps when contributing:

1. Update the local `develop` branch.
2. Create a descriptive feature or fix branch.
3. Implement the assigned task using the existing project structure.
4. Test the changes and check for errors.
5. Commit changes using meaningful commit messages.
6. Open a pull request targeting `develop`.
7. Request at least one teammate to review the changes.
8. Merge only after the required checks and review are completed.

### Development Guidelines

To maintain consistency across the project, contributors should follow these guidelines:

- Check `packages/shared/src/constants` before introducing new roles, report statuses, priorities, or waste categories.
- Use shared constants instead of hardcoding common values across different application components.
- Protect backend routes using the appropriate authentication and role-based authorization middleware.
- Never trust user roles or user IDs supplied directly through request bodies.
- Organize web API requests within `src/api/endpoints/`.
- Use the established API client in the mobile application instead of making direct Axios requests from UI components.
- Follow the existing project architecture and coding conventions.

### Commit and Pull Request Guidelines

Use clear and meaningful commit messages. The following prefixes are recommended:

| Prefix   | Purpose                       |
| -------- | ----------------------------- |
| `feat:`  | New functionality             |
| `fix:`   | Bug fixes                     |
| `chore:` | Maintenance and configuration |
| `docs:`  | Documentation updates         |

Before submitting a pull request, verify that:

- Relevant linting checks pass.
- Backend tests pass when applicable.
- The web application builds successfully when applicable.
- New protected backend routes have appropriate authorization.
- No credentials, passwords, or environment secrets are included.
- New database fields use shared enumerations where applicable.

### Environment and Security Guidelines

- Never commit `.env` files or actual credentials.
- Add new environment variables to the relevant `.env.example` file using placeholder values.
- Document new configuration requirements in the README.
- Keep sensitive configuration outside the source code.
- Review changes before pushing them to the remote repository.

All team members are expected to follow these guidelines to maintain a consistent, secure, and collaborative development environment.

## Testing

Backend tests use Jest and Supertest. Run:

```bash
npm test --workspace=packages/backend
```

The current test suite includes an API health-check test. Add tests for new endpoints, validation rules, authorization boundaries, error cases, and important business rules as the project grows. Run linting and the web production build before submitting changes:

```bash
npm run lint
npm run build --workspace=packages/web
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — high-level architecture, scaffolded functionality, and TODOs.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branch strategy, development workflow, and contribution checklist.
- `packages/backend/.env.example` — backend environment-variable reference.
- `packages/mobile/.env.example` — mobile API configuration example.

---

**Tsidat — connecting community reports with coordinated waste-management action.**
