// frontend/src/App.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // 1. Fetch all tasks on load
  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  // 2. Handle input field changes
  const handleInputChange = (event) => {
    setNewTaskTitle(event.target.value);
  };

  // 3. Handle Add Task
  const handleAddTask = (event) => {
    event.preventDefault();
    if (newTaskTitle.trim() === "") return;

    const taskToAdd = { title: newTaskTitle, description: "" };

    axios
      .post(API_URL, taskToAdd)
      .then((response) => {
        setTasks([...tasks, response.data]);
        setNewTaskTitle("");
      })
      .catch((error) => {
        console.error("Error adding task:", error);
      });
  };

  // 4. Handle Delete Task
  const handleDeleteTask = (idToDelete) => {
    axios
      .delete(`${API_URL}/${idToDelete}`)
      .then((response) => {
        const updatedTasks = tasks.filter((task) => task.id !== idToDelete);
        setTasks(updatedTasks);
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
      });
  };

  // 5. Handle Toggle Complete (Mark as Done/Undo) --- (THIS IS NEW) ---
  const handleToggleComplete = (idToUpdate, currentStatus) => {
    const newStatus = !currentStatus; // Get the opposite status

    // Call the PUT API endpoint to update
    axios
      .put(`${API_URL}/${idToUpdate}`, { is_completed: newStatus })
      .then((response) => {
        // If successful, update the task in our React state
        const updatedTasks = tasks.map((task) => {
          if (task.id === idToUpdate) {
            // This is the task we updated, return it with the new status
            return { ...task, is_completed: newStatus };
          }
          // This is not the task we updated, return it as is
          return task;
        });
        setTasks(updatedTasks);
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
  };

  return (
    <div className="App">
      <header>
        <h1>My Task Manager</h1>
      </header>

      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTaskTitle}
          onChange={handleInputChange}
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="task-list">
        <h2>My Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks found. Add one!</p>
        ) : (
          <ul>
            {/* --- THIS PART IS UPDATED --- */}
            {tasks.map((task) => (
              <li key={task.id}>
                {/* Task Title (with conditional styling) */}
                <span
                  className="task-title"
                  // If task is completed, add the 'completed' class
                  style={{
                    textDecoration: task.is_completed ? "line-through" : "none",
                    color: task.is_completed ? "#888" : "#333",
                  }}
                >
                  {task.title}
                </span>

                {/* Action Buttons */}
                <div className="task-actions">
                  {/* Done/Undo Button */}
                  <button
                    onClick={() =>
                      handleToggleComplete(task.id, task.is_completed)
                    }
                    className={task.is_completed ? "btn-undo" : "btn-done"}
                  >
                    {task.is_completed ? "Undo" : "Done"}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {/* --- END OF UPDATED PART --- */}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
