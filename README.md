# Fitness Tracker

Private daily meals, water, walking, exercise and weight tracker.

## Cloud sync
Open the same hosted URL on each device and sign in with the same ChatGPT account. Wait for “متزامن مع حسابك”. Existing device records are merged once on first connection. D1 is authoritative; local storage retains a cache and a pending-operation outbox during connection failures. Online devices refresh every 15 seconds and on focus. Concurrent edits to different records merge; the later accepted operation wins for the same field or record. Deletions propagate. Watch data is still entered manually.

## Build
Install the pinned dev dependencies, then run `npm run build`. Source assets are in dist/; scripts/build.mjs emits a Worker in dist/server/index.js. Drizzle schema and generated migration are tracked. Deployment requires the private Sites dispatcher identity headers and the DB binding. Run `drizzle-kit generate` only for a new schema change; do not edit applied migrations.

## Verification
Tested against SQLite with two simulated browser clients: initial migration, additions, offline queue replay, independent concurrent changes, deletions, acknowledgement, user isolation, and stale-revision rejection. No live browser test performed.
