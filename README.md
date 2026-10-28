# TECHFLIX — Inside Out: Debug the Mind

React + Vite + Tailwind frontend, Node/Express backend (all scoring, timers and auth are server-side).

## Deploy on Render (Web Service)
1. Push this folder to a GitHub repo (or use Render's "Deploy from Git").
2. New → Web Service → pick the repo.
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment variables: `ADMIN_USERNAME` (e.g. `admin`) and **`ADMIN_PASSWORD`** (your committee password), `NODE_VERSION=20`
3. Open the URL → `/admin` (or the "Organizer" link) to log in as the core committee.

(`render.yaml` is included if you prefer a Blueprint.)

## Run an event
Organizer console → **Select** a round → **Start**. Pause/Resume freezes every team's timer. **End** closes it.
Reveal the leaderboard with the 🏆 button; export results with **Export CSV**.
After testing, use Danger Zone → RESET to wipe test teams.

## Data persistence (IMPORTANT on Render free tier)
Default storage is a JSON file, and Render's free tier disk is wiped when the service restarts/sleeps (~15 min idle).
Keep the organizer console open during the event (it keeps the service awake), or switch to Firestore:
set env var `FIREBASE_SERVICE_ACCOUNT` to the full service-account JSON (Firebase Console → Project settings → Service accounts → Generate key).
Collections used: `teams`, `scores`, `rounds`.

## Edit questions / rules
`server/questions.js` (questions, memory patterns, answers). Rules text: `src/pages/Home.tsx`.

## Local dev
`npm install && npm run build && ADMIN_PASSWORD=test npm start` → http://localhost:3000
Tests: start server on port 3111, then `node test/api-test.mjs`.
