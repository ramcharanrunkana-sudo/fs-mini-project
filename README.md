# Habit Tracker

Interactive habit tracker with a Node.js + Express backend and a vanilla HTML/CSS/JS frontend (same dark/neon-cyan style as the To-Do List tutorial).

## Setup
```
npm install
npm start
```
Then open http://localhost:3000 in your browser.

## How it works
- **Backend (server.js)**: Express REST API storing habits in `habits.json` (auto-created on first run).
  - `GET  /api/habits` — list all habits
  - `POST /api/habits` — add a habit `{ name }`
  - `PATCH /api/habits/:id/toggle` — mark/unmark today complete, recalculates streak
  - `DELETE /api/habits/:id` — remove a habit
- **Frontend (public/)**: `index.html`, `style.css`, `script.js` — fetches from the API, renders each habit with a "Done" toggle, delete button, and current streak count (🔥).

## Notes
- Streaks count consecutive days ending today or yesterday.
- Data persists in `habits.json` on the server between restarts.
