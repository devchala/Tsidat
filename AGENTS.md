<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Tsidat project rules

- Status changes, assignments, verification and role/worker approval go only through SECURITY DEFINER Postgres functions (admin_*, worker_update_task); tables expose read-only or tightly scoped RLS so browsers can't skip business rules.
- Roles live in `user_roles`; bootstrap and migrated global administrators have the superadmin role. Only superadmins manage administrator memberships or planner roles; never trust browser-sent roles.
- Structured location IDs scope profiles, reports and incidents; admin_locations grants local administration and all admin RPCs, RLS, photos, notifications and analytics enforce that scope. Local worker enrollment uses existing accounts, and assignments must match the incident location.
- Reports (one per resident) are separate from incidents (the real waste pile); assignments attach to incidents and status flows down to every linked report with history rows.
- Photos live in private storage buckets under `{userId}/...` and are shown with short-lived signed links.
- Maps use Leaflet loaded only in the browser through `src/components/tsidat/Maps.tsx`, never imported directly into pages.
- Navigation reuses short-lived Query caches without speculative protected-route preloads; dashboard redirects share the identity query, while the managed authentication gate and database authorization remain authoritative.
