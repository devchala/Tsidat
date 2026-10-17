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
- Roles live in `user_roles`; the first signed-up user becomes admin, and only admins can grant planner or admin later — never trust roles sent from the browser.
- Reports (one per resident) are separate from incidents (the real waste pile); assignments attach to incidents and status flows down to every linked report with history rows.
- Photos live in private storage buckets under `{userId}/...` and are shown with short-lived signed links.
- Maps use Leaflet loaded only in the browser through `src/components/tsidat/Maps.tsx`, never imported directly into pages.
