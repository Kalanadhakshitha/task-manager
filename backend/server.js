// --- Imports ---
const express = require("express");
const cors = require("cors"); // CORS import
const knex = require("knex"); // Knex (SQL query builder) import
const knexConfig = require("./knexfile.js"); // Knex config file import

// --- Setup ---
const db = knex(knexConfig.development); // Database connection setup
const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Tell the server to understand JSON data from POST requests

// --- Routes (API Endpoints) ---

// Test route to check if server is working
app.get("/api", (req, res) => {
  res.send("Backend server is working!");
});

// 1. GET ALL TASKS
// GET to /api/tasks
app.get("/api/tasks", (req, res) => {
  db("tasks") // 'tasks' table select
    .then((tasks) => {
      res.status(200).json(tasks); // tasks return as JSON
    })
    .catch((err) => {
      res.status(500).json({ message: "Failed to get tasks" }); // error handling
    });
});

// 2. CREATE A NEW TASK
// POST to /api/tasks
app.post("/api/tasks", (req, res) => {
  const taskData = req.body; // Get JSON data from the request

  // --- Validation (Basic) ---
  // If 'title' is missing, send an error
  if (!taskData.title) {
    return res.status(400).json({ message: "Missing required field: title" });
  }
  // --- End Validation ---

  db("tasks")
    .insert(taskData) // Insert data into the 'tasks' table
    .then((ids) => {
      // insert , then new task ID will return
      res.status(201).json({ id: ids[0], ...taskData });
    })
    .catch((err) => {
      res.status(500).json({ message: "Failed to create new task" });
    });
});

// 3. UPDATE A TASK
// PUT to /api/tasks/:id
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params; // Get the :id from the URL
  const changes = req.body; // Get the changes from the request body

  db("tasks")
    .where({ id: id }) // Find the task with the correct id
    .update(changes) // Update it with the new data
    .then((count) => {
      if (count > 0) {
        // If 1 or more rows were updated
        res.status(200).json({ message: "Task updated successfully" });
      } else {
        // If no task with that id was found
        res.status(404).json({ message: "Task not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Failed to update task" });
    });
});

// 4. DELETE A TASK
// DELETE to /api/tasks/:id
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params; // Get the :id from the URL

  db("tasks")
    .where({ id: id }) // Find the task with the correct id
    .del() // Delete it
    .then((count) => {
      if (count > 0) {
        // If 1 or more rows were deleted
        res.status(200).json({ message: "Task deleted successfully" });
      } else {
        // If no task with that id was found
        res.status(404).json({ message: "Task not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Failed to delete task" });
    });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
