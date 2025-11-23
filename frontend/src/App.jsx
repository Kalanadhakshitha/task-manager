import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import Toast
import "./App.css";

const API_URL =
  "https://83f87a77-6a39-4579-a1f5-300ae14be54e-00-3v2bhof5n5igu.pike.replit.dev/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => setTasks(response.data))
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks!"); // Error Alert
      });
  }, []);

  const handleInputChange = (event) => {
    setNewTaskTitle(event.target.value);
  };

  const handleAddTask = (event) => {
    event.preventDefault();
    if (newTaskTitle.trim() === "") {
      toast.warning("Please enter a task!"); // Warning Alert for empty input
      return;
    }

    const taskToAdd = { title: newTaskTitle, description: "" };

    axios
      .post(API_URL, taskToAdd)
      .then((response) => {
        setTasks([...tasks, response.data]);
        setNewTaskTitle("");
        toast.success("Task added successfully! 🎉"); // Success Alert
      })
      .catch((error) => {
        console.error("Error adding task:", error);
        toast.error("Something went wrong!");
      });
  };

  const handleDeleteTask = (idToDelete) => {
    axios
      .delete(`${API_URL}/${idToDelete}`)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== idToDelete));
        toast.error("Task deleted! 🗑️"); // Delete Alert
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  const handleToggleComplete = (idToUpdate, currentStatus) => {
    const newStatus = !currentStatus;
    axios
      .put(`${API_URL}/${idToUpdate}`, { is_completed: newStatus })
      .then(() => {
        const updatedTasks = tasks.map((task) => {
          if (task.id === idToUpdate)
            return { ...task, is_completed: newStatus };
          return task;
        });
        setTasks(updatedTasks);
        if (newStatus) {
          toast.info("Task marked as completed! ✅"); // Info Alert
        } else {
          toast.info("Task marked as active! ↩️");
        }
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleUpdateTitle = (id) => {
    if (editingTitle.trim() === "") return;

    axios
      .put(`${API_URL}/${id}`, { title: editingTitle })
      .then(() => {
        const updatedTasks = tasks.map((task) => {
          if (task.id === id) return { ...task, title: editingTitle };
          return task;
        });
        setTasks(updatedTasks);
        setEditingId(null);
        toast.success("Task updated successfully! ✏️"); // Update Alert
      })
      .catch((error) => console.error("Error updating title:", error));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.is_completed;
    if (filter === "active") return !task.is_completed;
    return true;
  });

  return (
    <div className="App">
      <header>
        <h1>My Task Manager</h1>
      </header>

      {/* Toast Container placed here */}
      <ToastContainer position="top-right" autoClose={2000} />

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

        <div className="filter-buttons">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "btn-filter active" : "btn-filter"}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={filter === "active" ? "btn-filter active" : "btn-filter"}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={
              filter === "completed" ? "btn-filter active" : "btn-filter"
            }
          >
            Completed
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul>
            {filteredTasks.map((task) => (
              <li key={task.id}>
                {editingId === task.id ? (
                  <div style={{ display: "flex", flexGrow: 1, gap: "10px" }}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      style={{
                        flexGrow: 1,
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #4a90e2",
                      }}
                    />
                    <button
                      className="btn-done"
                      onClick={() => handleUpdateTitle(task.id)}
                    >
                      Save
                    </button>
                    <button className="btn-delete" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      className="task-title"
                      style={{
                        textDecoration: task.is_completed
                          ? "line-through"
                          : "none",
                        color: task.is_completed ? "#888" : "#333",
                        cursor: "pointer",
                      }}
                      onClick={() => startEditing(task)}
                    >
                      {task.title}
                    </span>

                    <div className="task-actions">
                      <button
                        onClick={() => startEditing(task)}
                        style={{ backgroundColor: "#e0e0e0", color: "#333" }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleToggleComplete(task.id, task.is_completed)
                        }
                        className={task.is_completed ? "btn-undo" : "btn-done"}
                      >
                        {task.is_completed ? "Undo" : "Done"}
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
