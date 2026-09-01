/**
 * Canonical user roles. Import this everywhere (backend, web, mobile)
 * instead of hardcoding role strings so the whole team stays in sync.
 */
const ROLES = Object.freeze({
  CITIZEN: 'citizen',
  WORKER: 'worker',
  ADMIN: 'admin',
  PLANNER: 'planner', // Municipal Planner
});

module.exports = { ROLES };
