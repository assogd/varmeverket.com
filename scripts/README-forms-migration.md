# Forms migration (legacy fields/sections → content blocks)

Migrates Payload forms that still have the old `fields` / `sections` structure into the new blocks-based `content` array. Does not remove legacy keys.

## Commands

From project root (`.env` and `.env.local` are loaded automatically):

- **Inspect** – list forms that have legacy `fields` or `sections`:
  ```bash
  npm run migrate:forms:inspect
  ```

- **Dry run** – show what would be migrated, without writing:
  ```bash
  npm run migrate:forms:dry-run
  ```

- **Run migration** – copy legacy data into `content` and update documents:
  ```bash
  npm run migrate:forms
  ```

## Environment

Uses `DATABASE_URI` and `PAYLOAD_SECRET` from `.env` / `.env.local`. To run against another environment (e.g. production), point the script at that env (e.g. copy `.env.production` to `.env` temporarily, or run with `env $(cat .env.production | xargs) npm run migrate:forms`).

You may see an SMTP/Nodemailer error when the script starts; it comes from Payload’s email adapter and can be ignored when only running this migration.

## Idempotency

Forms that already have a non-empty `content` array are skipped. Only forms with legacy `fields`/`sections` and no (or empty) `content` are updated.
