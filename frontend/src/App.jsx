// frontend/src/App.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// ඔයාගේ Replit ලින්ක් එක එහෙම්මම තියන්න (api/tasks කෑල්ල එක්කම)
const API_URL = "https://task-manager-kalana.replit.dev/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(""); // 1. අලුත් Date State එක
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDate, setEditingDate] = useState(""); // Edit කරනකොට Date එක වෙනස් කරන්න

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(API_URL)
      .then((response) => {
        setTasks(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks!");
        setIsLoading(false);
      });
  }, []);

  const handleAddTask = (event) => {
    event.preventDefault();
    if (newTaskTitle.trim() === "") {
      toast.warning("Please enter a task!");
      return;
    }

    // Backend එකට යවන ඩේටා ටික
    const taskToAdd = {
      title: newTaskTitle,
      due_date: newTaskDate, // 2. Date එකත් යවනවා
    };

    axios
      .post(API_URL, taskToAdd)
      .then((response) => {
        setTasks([...tasks, response.data]);
        setNewTaskTitle("");
        setNewTaskDate(""); // Input එක හිස් කරනවා
        toast.success("Task added successfully! 🎉");
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
        toast.error("Task deleted! 🗑️");
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
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setEditingDate(task.due_date || ""); // තියෙන Date එක ගන්නවා
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingDate("");
  };

  const handleUpdateTask = (id) => {
    if (editingTitle.trim() === "") return;

    axios
      .put(`${API_URL}/${id}`, {
        title: editingTitle,
        due_date: editingDate, // Update කරනකොට Date එකත් යවනවා
      })
      .then(() => {
        const updatedTasks = tasks.map((task) => {
          if (task.id === id)
            return { ...task, title: editingTitle, due_date: editingDate };
          return task;
        });
        setTasks(updatedTasks);
        setEditingId(null);
        toast.success("Task updated successfully! ✏️");
      })
      .catch((error) => console.error("Error updating task:", error));
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

      <ToastContainer position="top-right" autoClose={2000} />

      <form onSubmit={handleAddTask} className="task-form">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            flexGrow: 1,
          }}
        >
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{ width: "95%" }}
          />
          {/* 3. Date Picker Input */}
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "2px solid #ddd",
              width: "150px",
              color: "#555",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            height: "fit-content",
            alignSelf: "center",
            marginLeft: "10px",
          }}
        >
          Add Task
        </button>
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

        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul>
            {filteredTasks.map((task) => (
              <li key={task.id}>
                {editingId === task.id ? (
                  // --- EDIT MODE ---
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        gap: "5px",
                      }}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        style={{
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #4a90e2",
                        }}
                      />
                      <input
                        type="date"
                        value={editingDate}
                        onChange={(e) => setEditingDate(e.target.value)}
                        style={{
                          padding: "5px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                        }}
                      />
                    </div>
                    <button
                      className="btn-done"
                      onClick={() => handleUpdateTask(task.id)}
                    >
                      Save
                    </button>
                    <button className="btn-delete" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  // --- NORMAL MODE ---
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      <span
                        className="task-title"
                        style={{
                          textDecoration: task.is_completed
                            ? "line-through"
                            : "none",
                          color: task.is_completed ? "#888" : "#333",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                        onClick={() => startEditing(task)}
                      >
                        {task.title}
                      </span>
                      {/* 4. Date එක පෙන්වන තැන */}
                      {task.due_date && (
                        <span
                          style={{
                            fontSize: "0.85em",
                            color: "#666",
                            marginTop: "4px",
                          }}
                        >
                          📅 {task.due_date}
                        </span>
                      )}
                    </div>

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
