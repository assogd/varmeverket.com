# Portal SSR Migration Note

Quick note for future maintainers: this portal is client-side by design today.  
Moving it server-side is possible, but it requires auth/session changes first.

## Current state (why it is client-side)

- Portal pages fetch user data from `api.varmeverket.com` in the browser.
- Auth is based on API session cookies and `credentials: "include"` (`/session`, `/v2/*`, `/v3/*`).
- Session discovery happens in client hooks (`useSession` + route guards).

This matches the current API contract and was the lowest-risk integration path.

## Main blocker for full SSR

The app server cannot automatically act as the logged-in user with the current browser-cookie model.

To do SSR safely, server code must be able to:

1. Resolve the current user from the incoming request.
2. Call backend APIs on behalf of that user.
3. Enforce role checks (especially admin) before rendering.

Today, that server-readable session contract is not fully defined.

## What must exist before SSR work starts

Pick one auth/session model:

- Shared cookie/session model across app + API domains, or
- Token/JWT model where app server can verify identity and call API as user.

Then implement:

- `getServerSession()` (or equivalent) for server components/middleware.
- Server-side API client that forwards user identity securely.
- Clear 401/403 handling and role enforcement on the server.

## Practical migration plan (hybrid first)

1. Build server session + server API layer.
2. Migrate initial payload rendering for:
   - Dashboard
   - Bookings
   - Admin list pages
3. Keep interactive UI client-side (filters, load-more, optimistic updates).
4. Move route protection from client guards to server-side checks.
5. Add metrics and error monitoring before broad rollout.

## Recommendation

Treat SSR for the portal as a future feature branch, not a quick refactor.  
Best path is hybrid SSR: server-render first payloads, keep rich interactions client-side.
