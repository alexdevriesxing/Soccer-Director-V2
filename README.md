# Soccer Director V2

Soccer Director V2 is the validated release line for the management-game route set in this project. The shipping surface is the V2 flow, not the older legacy routes that still exist elsewhere in the codebase.

## Status

- Release-candidate validation passed on 2026-03-27.
- Browser smoke passed for the default path and the lower-tier rollover scenario with zero console errors and zero page errors.
- The week-advance benchmark passed within the current SLA.

## Shipping Surface

The V2 release path currently covers:

- `/new-career`
- `/hq`
- `/club-pulse`
- `/week-planner`
- `/inbox`
- `/match-center/:matchId`
- `/post-match/:matchId`
- `/standings`
- `/career-squad`
- `/career-finances`
- `/save-load`

Scope and acceptance details live in [V2_RELEASE_PLAN.md](./V2_RELEASE_PLAN.md). Ongoing release notes and verification history are tracked in [progress.md](./progress.md).

## Stack

- Frontend: React 19, TypeScript, Create React App
- Backend: Node.js, Express, Prisma
- Validation: Jest, Playwright
- Data: SQLite via Prisma for local development

## Quick Start

Recommended runtime: Node.js 20.

```bash
git clone https://github.com/alexdevriesxing/Soccer-Director-V2.git
cd Soccer-Director-V2
npm ci
npm ci --prefix backend
npm ci --prefix frontend
npx --prefix backend prisma generate --schema backend/prisma/schema.prisma
npx --prefix backend prisma db push --schema backend/prisma/schema.prisma
npm --prefix backend run seed
npm run dev
```

The frontend runs on `http://localhost:3000` and the V2 backend health endpoint is `http://localhost:4000/api/v2/health`.

## Validation Commands

Run the release gate without browser automation:

```bash
npm run check:v2:release-candidate
```

Run the full release gate including browser smoke:

```bash
npm run check:v2:release-candidate:browser
```

If the local save database has grown too large during long dev sessions, compact stored snapshots with:

```bash
npm --prefix backend run compact:v2:saves
```

## Recent V2 Cleanup

- Reduced the main frontend production bundle from about 624 kB gzipped to about 90.71 kB gzipped by removing global icon-pack bootstrap.
- Compacted persisted V2 save snapshots, reducing the local dev database from about 1.6 GB to about 902 MB in the current test environment.
- Cleared the remaining browser-smoke console noise so the release reports now end cleanly.

## Repository Layout

- [`frontend/`](./frontend/) contains the React client, including the V2 route set in `frontend/src/v2`.
- [`backend/`](./backend/) contains the Express server, Prisma schema, browser smoke scripts, and the V2 simulation logic.
- [`scripts/`](./scripts/) contains the root release-check entrypoints.
- [`output/`](./output/) contains generated benchmark and smoke-test artifacts.

## Notes

- Legacy routes remain in the repo for historical continuity, but they are not the release path unless the release plan explicitly says otherwise.
- This repository is intended to be the clean V2 line. The older `Soccer-Director-2025` repository remains separate because its `main` branch is a divergent code line.
