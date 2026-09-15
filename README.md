# Fitness Tracker

Private daily meals, water, walking, exercise and weight tracker.

## Cloud sync
Open the same hosted URL on each device and sign in with the same ChatGPT account. Wait for “متزامن مع حسابك”. Existing device records are merged once on first connection. D1 is authoritative; local storage retains a cache and a pending-operation outbox during connection failures. Online devices refresh every 15 seconds and on focus. Concurrent edits to different records merge; the later accepted operation wins for the same field or record. Deletions propagate. Watch data is still entered manually.

## Build
Install the pinned dev dependencies, then run `npm run build`. Source assets are in dist/; scripts/build.mjs emits a Worker in dist/server/index.js. Drizzle schema and generated migration are tracked. Deployment requires the private Sites dispatcher identity headers and the DB binding. Run `drizzle-kit generate` only for a new schema change; do not edit applied migrations.

## Verification
Tested against SQLite with two simulated browser clients: initial migration, additions, offline queue replay, independent concurrent changes, deletions, acknowledgement, user isolation, and stale-revision rejection. No live browser test performed.

## Family, nutrition and reminders
Family profiles are owned and managed inside the current signed-in account; they are not invitations or separate logins. Each profile has an isolated cloud state and device cache. The default profile retains existing data.

The nutrition tool accepts manually entered InBody fields and optional device-only image preview. It generates a seven-day draft with natural foods, cooked edible weights, approximate food composition, exclusion filters, and cut/bulk/maintenance goals. It does not perform image OCR. Adult healthy-person scope is enforced; minors, pregnancy/breastfeeding or medical conditions, other allergies, and out-of-range estimates are directed to individual professional planning. Meals are not logged until explicitly selected and confirmed. Calorie/protein totals are shown separately from targets.

Reminders show in-app while visible. A downloadable 90-day recurring ICS calendar with alarms supports notifications through the user's calendar application after import and permissions. Changing in-app settings does not modify imported calendar events. Web Push is not configured.

The exercise selector supports Arabic/English search, resistance machines, assisted machines, cables, dumbbells, barbells, Smith machines, kettlebells, bodyweight and cardio. Equipment is generic and is not a verified inventory of any particular PureGym branch. Cardio uses duration/distance, resistance uses sets/reps; assisted-machine values mean assistance, and dumbbell entries use one dumbbell.

Additional validation covered schema migration, profile ownership and unauthorized access, six goal/sex meal-plan combinations, all supported allergen exclusions and underage/medical/underweight gates.
