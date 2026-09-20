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

The nutrition tool accepts manually entered InBody fields or an image submitted to the configured OpenAI API for extraction and review. It generates a seven-day draft with natural foods, cooked edible weights, approximate food composition, exclusion filters, and cut/bulk/maintenance goals. Unreadable values stay blank; the user confirms extracted values before saving. Adult healthy-person scope is enforced; minors, pregnancy/breastfeeding or medical conditions, other allergies, and out-of-range estimates are directed to individual professional planning. Meals are not logged until explicitly selected and confirmed. Calorie/protein totals are shown separately from targets.

Reminders show in-app while visible. A downloadable 90-day recurring ICS calendar with alarms supports notifications through the user's calendar application after import and permissions. Changing in-app settings does not modify imported calendar events. Web Push is not configured.

The exercise selector supports Arabic/English search, resistance machines, assisted machines, cables, dumbbells, barbells, Smith machines, kettlebells, bodyweight and cardio. Equipment is generic and is not a verified inventory of any particular PureGym branch. Cardio uses duration/distance, resistance uses sets/reps; assisted-machine values mean assistance, and dumbbell entries use one dumbbell.

Additional validation covered schema migration, profile ownership and unauthorized access, six goal/sex meal-plan combinations, all supported allergen exclusions and underage/medical/underweight gates.

## Independent accounts and reference imports
Trusted dispatcher email is hashed into a stable account key (trusted user-ID fallback). APIs and browser caches/outboxes use that key; no user-provided identity is accepted. Site viewers can edit their own data, not other accounts. Invitations are controlled by Sites sharing and still require recipient emails. Original legacy device data is migrated only for the original owner.

The 101-record Excel history is server-only and accessible exclusively to the original owner. Muscle percentages remain percentages; two suspicious weight records are retained but excluded pending confirmation. The PDF's 31-exercise, four-session glute-focused routine is an optional editable template. Completion is tracked per date and exercise, separately from actual performance.

Vision service quota, credentials and rate-limit failures are distinct. Failures log upstream status, code and request ID without images or secrets. Tests use mocked vision responses; billing availability requires a successful real request.

## Body coaching and schematic 3D
Owner-only reference import v2 adds 25 Boditrax body scans and the supplied InBody 270 report to the 101 existing scale measurements. Login events and IP addresses are not imported. Latest Boditrax scan is 2026-06-09; the export/login date is not a measurement date. BMR kJ is converted using 4.184 kJ/kcal; total muscle and skeletal muscle stay separate.

The body dashboard shows dated source-specific comparisons, body composition and segment values. Seven-day meals and 2–4-session resistance drafts use confirmed preferences, goal and health gates. Adoption never logs consumed food or completed exercise. Reports older than 90 days cannot be adopted. The default goal heuristic is transparent and editable, not diagnostic. Nutrition PDF used only for food ideas; no supplement regimens were copied.

WebGL provides a rotatable, selectable region schematic. Geometry never claims to reproduce body shape or forecast cosmetic results. If current measurements lack regions, a clearly dated older detailed scan supplies region values. Numeric region controls remain usable without WebGL. Browser print provides a static report. No live browser/device rendering verification was available.
