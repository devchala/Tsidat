# Architecture Overview & TODOs

## High-level

```
[React Web (Vite)]     [Expo Mobile]
        \                   /
         \                 /
          [Express REST API] ---- JWT auth, RBAC middleware
                  |
             [MongoDB]
   (users, reports, incidents, workers,
    assignments, attachments, status_history,
    notifications, feedback, audit_logs)
```

Both clients call the same REST API (`/api/v1/...`) and enforce the same
role permissions server-side. Business logic (priority scoring, incident
clustering, worker recommendation) lives in the backend `services/` layer,
never duplicated in the clients.

## What's scaffolded vs. what's a TODO

**Scaffolded (working):**
- Auth: register/login/refresh/me, bcrypt hashing, JWT access+refresh
- RBAC middleware (`requireAuth`, `requireRole`)
- Core Mongoose models for every collection in the spec (section 14)
- Security middleware stack in `app.js` (helmet, cors, sanitize, xss, hpp, rate limiting)
- Centralized error handling + validation pattern
- Citizen report creation + "my reports" + status history logging
- Admin worker-verification example with audit logging
- Web: routing, protected routes, auth context, login/register, report form, my-reports list, role page stubs
- Mobile: auth context, navigation skeleton, screen stubs

**Left for the team to build:**
- File/photo upload (Attachment model exists; wire up `multer` + storage — local disk for MVP, S3/Cloud storage later)
- Incident clustering / duplicate detection (group nearby Reports into an Incident using geospatial queries)
- Priority score wiring (`services/priorityScore.service.js` has the formula stub — call it on report creation/update)
- Smart worker recommendation (distance + availability + workload query against `Worker.currentLocation` 2dsphere index)
- Notifications (in-app center; email/SMS deferred per spec)
- Admin Command Center: live map, KPIs, incident queue, manual assignment UI
- Analytics endpoints beyond the basic `overview` example (hotspots, trends, worker performance)
- Mobile: camera/GPS capture screens, worker task status transitions, push notifications
- Refresh token rotation/revocation (current implementation is a basic pattern - consider storing refresh tokens server-side to allow logout/revocation)
