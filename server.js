// server.js
// Simple Express backend for the Habit Tracker
// Storage: a local JSON file (habits.json) acting as a lightweight "database"

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "habits.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Helpers ----------

// Make sure the data file exists
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// Read all habits from the JSON file
function readHabits() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save all habits back to the JSON file
function writeHabits(habits) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(habits, null, 2));
}

// Returns today's date as YYYY-MM-DD
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

// ---------- API Routes ----------

// GET all habits
app.get("/api/habits", (req, res) => {
  const habits = readHabits();
  res.json(habits);
});

// POST a new habit
app.post("/api/habits", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Habit name is required" });
  }

  const habits = readHabits();
  const newHabit = {
    id: Date.now().toString(),
    name: name.trim(),
    createdAt: todayKey(),
    completedDates: [],   // array of "YYYY-MM-DD" strings
    streak: 0
  };

  habits.push(newHabit);
  writeHabits(habits);
  res.status(201).json(newHabit);
});

// PATCH - toggle today's completion for a habit (this drives the streak)
app.patch("/api/habits/:id/toggle", (req, res) => {
  const habits = readHabits();
  const habit = habits.find(h => h.id === req.params.id);

  if (!habit) {
    return res.status(404).json({ error: "Habit not found" });
  }

  const today = todayKey();
  const idx = habit.completedDates.indexOf(today);

  if (idx === -1) {
    habit.completedDates.push(today);
  } else {
    habit.completedDates.splice(idx, 1);
  }

  habit.streak = calculateStreak(habit.completedDates);
  writeHabits(habits);
  res.json(habit);
});

// DELETE a habit
app.delete("/api/habits/:id", (req, res) => {
  let habits = readHabits();
  const exists = habits.some(h => h.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ error: "Habit not found" });
  }

  habits = habits.filter(h => h.id !== req.params.id);
  writeHabits(habits);
  res.json({ success: true });
});

// ---------- Streak Calculation ----------
// Counts consecutive days (ending today or yesterday) that are marked complete
function calculateStreak(completedDates) {
  if (!completedDates.length) return 0;

  const dateSet = new Set(completedDates);
  let streak = 0;
  let cursor = new Date();

  // If today isn't checked off yet, start counting from yesterday
  if (!dateSet.has(todayKey())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (dateSet.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

app.listen(PORT, () => {
  console.log(`Habit Tracker server running at http://localhost:${PORT}`);
});
