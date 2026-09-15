# Fitness Tracker

Private daily meals, water, walking, exercise and weight tracker.

## Exercises & equipment
The workout form now starts with a gym equipment/machine picker (barbell, dumbbells, Smith machine, cables, lat pulldown, leg press, leg extension/curl, assisted pull-up, cardio machines, bodyweight, etc.) styled after a typical commercial gym floor. Picking a machine suggests matching exercises; you can still type any custom exercise name.

## Nutrition plan
The "الخطة الغذائية" tab asks for gender, age, height, weight and activity level, then lets you choose a goal — تنشيف (cutting), تضخيم (bulking) or ثبات (maintain) — and calculates BMR, TDEE, calories and macros (Mifflin-St Jeor formula), plus a sample daily meal breakdown you can apply as your daily targets in one tap.

## Water & meal reminders
Settings → "تذكيرات المياه والطعام" lets you enable browser notifications for water (every N minutes) and up to four meal times, with a quiet-hours window. Reminders fire while the app is open in the browser on this device (or installed as a PWA and kept open); this is not a push-notification service, so background delivery when the tab/app is fully closed is not guaranteed, especially on iOS Safari.

## Family members
Settings → "أفراد العائلة" lets you add multiple local profiles (e.g. spouse, kids) that each keep fully separate meals, workouts, water, walking, measurements and nutrition plans on this device. Only the original/default profile syncs to the cloud account; additional family members are stored locally on the device only.

## Cloud sync
Open the same hosted URL on each device and sign in with the same ChatGPT account. Wait for “متزامن مع حسابك”. Existing device records are merged once on first connection. D1 is authoritative; local storage retains a cache and a pending-operation outbox during connection failures. Online devices refresh every 15 seconds and on focus. Concurrent edits to different records merge; the later accepted operation wins for the same field or record. Deletions propagate. Watch data is still entered manually.

## Build
Install the pinned dev dependencies, then run `npm run build`. Source assets are in dist/; scripts/build.mjs emits a Worker in dist/server/index.js. Drizzle schema and generated migration are tracked. Deployment requires the private Sites dispatcher identity headers and the DB binding. Run `drizzle-kit generate` only for a new schema change; do not edit applied migrations.

## Verification
Tested against SQLite with two simulated browser clients: initial migration, additions, offline queue replay, independent concurrent changes, deletions, acknowledgement, user isolation, and stale-revision rejection. No live browser test performed.
