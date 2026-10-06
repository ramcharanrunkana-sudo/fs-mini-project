// script.js
// Frontend logic for the Habit Tracker - talks to the Express backend via fetch()

const API_URL = "/api/habits";

// Load habits when the page loads
document.addEventListener("DOMContentLoaded", loadHabits);

// Fetch all habits from the backend and render them
async function loadHabits() {
  const res = await fetch(API_URL);
  const habits = await res.json();

  const list = document.getElementById("habitList");
  list.innerHTML = "";

  habits.forEach(habit => renderHabit(habit));
}

// Add a new habit
async function addHabit() {
  const input = document.getElementById("habitInput");
  const habitName = input.value.trim();

  if (habitName === "") {
    alert("Please enter a habit!");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: habitName })
  });

  const newHabit = await res.json();
  renderHabit(newHabit);
  input.value = "";
}

// Toggle today's completion for a habit
async function toggleHabit(id) {
  const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
  const updatedHabit = await res.json();

  const li = document.getElementById(`habit-${id}`);
  li.replaceWith(buildHabitElement(updatedHabit));
}

// Delete a habit
async function deleteHabit(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  document.getElementById(`habit-${id}`).remove();
}

// Render a single habit into the list
function renderHabit(habit) {
  const list = document.getElementById("habitList");
  list.appendChild(buildHabitElement(habit));
}

// Build the <li> element for a habit
function buildHabitElement(habit) {
  const li = document.createElement("li");
  li.id = `habit-${habit.id}`;

  const today = new Date().toISOString().split("T")[0];
  const doneToday = habit.completedDates.includes(today);
  if (doneToday) li.classList.add("completed");

  const top = document.createElement("div");
  top.className = "habit-top";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = habit.name;
  nameSpan.className = "habit-name";
  nameSpan.addEventListener("click", () => toggleHabit(habit.id));

  const completeBtn = document.createElement("button");
  completeBtn.textContent = doneToday ? "✓" : "Done";
  completeBtn.className = "complete-btn";
  completeBtn.onclick = () => toggleHabit(habit.id);

  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.className = "delete-btn";
  delBtn.onclick = () => deleteHabit(habit.id);

  top.appendChild(nameSpan);
  top.appendChild(completeBtn);
  top.appendChild(delBtn);

  const streak = document.createElement("div");
  streak.className = "streak";
  streak.textContent = `🔥 Streak: ${habit.streak} day(s)`;

  li.appendChild(top);
  li.appendChild(streak);

  return li;
}
