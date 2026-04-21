# Releasing Värmeverket

This document defines the release flow for stable versions.

## Versioning

- Use semantic versioning (`MAJOR.MINOR.PATCH`).
- Update `package.json` version for each release.
- Keep `CHANGELOG.md` updated with one section per version.

## Release Checklist

1. Ensure `main` is green (lint, typecheck, build).
2. Confirm launch docs are current:
   - `README.md`
   - `API_GUIDE.md`
   - `.env.example`
   - `CHANGELOG.md`
3. Verify no secrets are committed (examples must use placeholders).
4. Run:
   - `npm run lint`
   - `npm run build`
5. Smoke test critical flows:
   - Session/login flow
   - Admin API access control
   - Portal saved events and dashboard routes
6. Create release commit and tag:
   - `git tag vX.Y.Z`
7. Publish deployment and monitor logs for regressions.

## Rollback

- Revert to previous release tag in deployment.
- Restore previous environment configuration if release introduced config changes.
- Record rollback reason in `CHANGELOG.md` under an "Unreleased" section.
