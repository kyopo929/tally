# Tally

A personal to-do app to replace Microsoft To Do: lists in groups, quick add in plain English ("pay rent every 1st 9am #bills"), repeating tasks, reminders, My Day, Upcoming and a calendar. Installs as an app on Windows (Chrome or Edge) and Android (Chrome).

## How it's built
- `src/` — the source: `parser.js` (quick-add language and date math), `app.js` (the app), `app.css`, `shell.html`.
- `python3 build.py` combines them into `index.html`, the file that gets served.
- `manifest.webmanifest`, `sw.js`, `icons/` — make it installable and usable offline.

## Status
- Done: lists, groups, headings inside lists, per-list sort, start dates, events (incl. multi-day, color-coded), day notes, quick add, repeats, reminders, calendar view, search, right-click task menu, multi-select (Ctrl/Shift-click), drag to move/reorder, keyboard shortcuts, My Day suggestions, Completed history, Recently deleted (30 days), taskbar badge, clickable links in notes, 15 color themes, backup/restore.
- Sync between computers via Supabase (sign in with an email link). Live updates, works offline and catches up.
- Phone layout (≤600px wide): add box docked at the bottom, compact month calendar with dots and the picked day's agenda (swipe to change months), full-screen task panel, menus as bottom sheets, Back button closes panels.
- Reminders when the app is closed: web push. `api/push.js` sends them; Supabase's pg_cron calls it every minute. One-time setup at `/setup-push.html` (makes the keys in your browser, gives the Vercel values and the Supabase SQL). Without that setup, reminders still work while the app is open.
- Outlook meetings in the calendar (read-only, per device): Settings → Show my Outlook meetings → paste Outlook's published ICS link. `api/outlook.js` reads it (Outlook/Google links only) and `api/_outlook.js` expands repeats, skipped and moved meetings, and Windows time-zone names.
- Dismissing a reminder on one device clears it on the others (`/api/push` `{dismiss}`); notifications have Done and Snooze 1 hour buttons.
- Calendar link: Settings → Show tasks in Outlook or Google. `/feed/<token>.ics` (also `-work`/`-personal`) served by `api/feed.js`; needs `supabase/feed.sql` run once.

Live app: https://tally-ntqo.vercel.app (Vercel redeploys on every push to `main`).

## Your own copy
A copy needs its own Supabase project. In Vercel → Settings → Environment Variables, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (Supabase → Project Settings → API Keys), then redeploy. Without them, sync stays off; a copy never uses the original project. Then follow the steps below with your own address in place of `tally-ntqo.vercel.app`.

## Sync setup (one time, in Supabase)
1. SQL Editor → run `supabase/schema.sql`.
2. Authentication → URL Configuration: Site URL `https://tally-ntqo.vercel.app`, add redirect URL `https://tally-ntqo.vercel.app/**`.
3. Sign-in uses the email link (editing email templates needs custom SMTP, so the default template is used).
4. SQL Editor → run `supabase/storage.sql` (private `attachments` bucket for note photos and PDFs; each user can only reach their own folder).

`vendor/supabase.js` is @supabase/supabase-js 2.118.0 (UMD build). `vendor/pdf.min.mjs` + `pdf.worker.min.mjs` are pdfjs-dist 6.4.299 (Apache-2.0), used for PDF previews. It loads only when needed. `vendor/ocr/` is tesseract.js 7 + tesseract.js-core 7 (Apache-2.0) with English `eng.traineddata` (4.0.0_best_int, uncompressed), used to read text in photos for search (computers only, in the background).

Saving on the device: IndexedDB `tally-data` (keys `tally.v1` = your data, `tally.sync.v1` = sync bookkeeping), moved over from localStorage on first start. A failed save shows a red banner and retries. Edits made on two devices at once are merged field by field; a push that would delete more than a quarter of your items asks first.

Notes: stored as items with `type:'note'`. Photos and PDFs live in IndexedDB (`tally-files`) on each computer and in Supabase Storage at `attachments/<user id>/<file id>` (`_t` = preview). Photos are resized to 2400px on the way in.

## Keyboard
`Ctrl K` / `Q` add a task · `/` or `Ctrl F` search · `↑ ↓` (or `J K`) move between tasks · `Space` / `X` complete · `Delete` delete · `Ctrl Z` undo · `?` typing examples · `Esc` close

## Tests
`node tests/parser.test.js` checks the quick-add language (dates, repeats, tags, start dates, reminders).
`node tests/push.test.js` checks which reminders the server sends and when (time zones, per-device settings, no repeats, clearing on other devices).
`node tests/outlook.test.js` checks reading Outlook's calendar (repeats, exceptions, time zones).

## Notes, Documents, locks, backups
- Notes (`type:'note'`) and Documents (`type:'doc'`: holder, number, expires) are task rows. Any item can have `attachments`.
- Expiry: setting `expires` sets `reminder` to the next of 60/30/7/0 days before at 9am; after each fires the app moves `reminder` on (server push needs no SQL change).
- Locked items: `locked:true`, `sealed` = AES-GCM(JSON {body, items, number, texts}) with a PBKDF2 key from the passphrase; the `vault` row holds salt + check. Locked files are stored and uploaded encrypted (`enc:true`). Auto-locks after 10 min idle / 5 min hidden.
- Weekly backup: `attachments/<uid>/backups/YYYY-MM-DD.json`, last 8 kept (Settings → Automatic backups). Unreferenced files are removed from Storage after 30 days.
- Android share sheet: manifest `share_target` → POST `/share-in` handled by sw.js (cache `tally-share`) → app opens `?share=1` and makes a note.

## Payments (original site only)
- Shown only where `/config.js` lists `features: ['payments']`: the original site by default (`api/_cfg.js` `featuresFor`); copies get none unless they set `FEATURES=payments` in Vercel.
- Always locked: payments are items with `type:'payment'`; the roster, repeating payments and bank balance are one item `paycfg`. Everything is in `body`, sealed with the locked-items passphrase before saving or syncing. No payment data is ever in this repo (not in tests or comments either).
- Columns follow the cash-flow sheet: Date, Vendor/Customer, Check #, Project, Description, Deposit, Check, Balance, notes.
- Tabs: To pay (payrolls grouped), Payroll, Forecast, Chase, All.
- Payroll: roster imported from the payroll list (Name … Housing Allowance), yearly USD; each pay = (salary + housing) × rate ÷ 26 (2-week) or ÷ 12 (month-end). Rate defaults to 3.67. Roster names are matched to how people appear in past payrolls ("Name in payroll"). Totals every 2 weeks / per month / per year in AED and USD; history with a chart; click a person for their payments.
- Basket: a whole payroll as one table (tick, name, project, amount, note). The next 2-week payroll comes from the roster, flags anyone whose last pay differs, and adds transfers that didn't go through. Month-end staff get their own basket. Any payroll can be edited as a basket later.
- Forecast: bank balance + 2-week payroll from the roster (new people at full pay) + month-end staff + repeating payments (suggested from history using the recent gap) + To pay items; month by month and the next 8 weeks.
- Import from sheet: paste rows A to I. Blank dates carry down; Pending/Due rows go to To pay; month headings and rows dated more than a week ahead (the sheet's forecast) are skipped; rows already in Tally are skipped.
- Copy for Excel writes the sheet's columns; Balance is a formula that works on any row (row above + Deposit - Check); a transfer that didn't go through is the amount in both Deposit and Check with a note.
