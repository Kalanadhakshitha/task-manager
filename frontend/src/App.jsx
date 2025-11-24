// frontend/src/App.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const API_URL =
  "https://83f87a77-6a39-4579-a1f5-300ae14be54e-00-3v2bhof5n5igu.pike.replit.dev/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDate, setEditingDate] = useState("");

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(API_URL)
      .then((response) => {
        setTasks(response.data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load tasks!");
        setIsLoading(false);
      });
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.warning("Please enter a task!");
      return;
    }
    const taskToAdd = { title: newTaskTitle, due_date: newTaskDate };
    axios
      .post(API_URL, taskToAdd)
      .then((res) => {
        setTasks([...tasks, res.data]);
        setNewTaskTitle("");
        setNewTaskDate("");
        toast.success("Task added! 🚀");
      })
      .catch(() => toast.error("Error adding task"));
  };

  const handleDeleteTask = (id) => {
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => {
        setTasks(tasks.filter((t) => t.id !== id));
        toast.error("Task deleted 🗑️");
      })
      .catch(() => toast.error("Error deleting"));
  };

  const handleToggleComplete = (id, status) => {
    axios
      .put(`${API_URL}/${id}`, { is_completed: !status })
      .then(() => {
        setTasks(
          tasks.map((t) => (t.id === id ? { ...t, is_completed: !status } : t))
        );
      })
      .catch(() => toast.error("Error updating"));
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setEditingDate(task.due_date || "");
  };

  const handleUpdateTask = (id) => {
    axios
      .put(`${API_URL}/${id}`, { title: editingTitle, due_date: editingDate })
      .then(() => {
        setTasks(
          tasks.map((t) =>
            t.id === id
              ? { ...t, title: editingTitle, due_date: editingDate }
              : t
          )
        );
        setEditingId(null);
        toast.success("Updated successfully! ✨");
      });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.is_completed;
    if (filter === "active") return !task.is_completed;
    return true;
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return dateString.replace("T", " at ");
  };

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />

      <header>
        <h1>✨ My Task Manager</h1>
        <p>Stay organized, stay productive.</p>
      </header>

      <div className="container">
        <form onSubmit={handleAddTask} className="task-form card">
          <div className="input-group">
            <input
              type="text"
              className="main-input"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            {/* datetime-local */}
            <input
              type="datetime-local"
              className="date-input"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-add">
            Add Task +
          </button>
        </form>

        <div className="filters">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? "active" : ""}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="task-list">
          {isLoading ? (
            <div className="loader"></div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found here 📝</p>
            </div>
          ) : (
            <ul>
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${
                    task.is_completed ? "completed" : ""
                  }`}
                >
                  {editingId === task.id ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                      />
                      {/*datetime-local */}
                      <input
                        type="datetime-local"
                        value={editingDate}
                        onChange={(e) => setEditingDate(e.target.value)}
                      />
                      <div className="edit-actions">
                        <button
                          className="btn-save"
                          onClick={() => handleUpdateTask(task.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="task-info"
                        onClick={() =>
                          handleToggleComplete(task.id, task.is_completed)
                        }
                      >
                        <span className="checkbox">
                          {task.is_completed ? "✔" : ""}
                        </span>
                        <div className="details">
                          <span className="title">{task.title}</span>
                          {task.due_date && (
                            <span className="date">
                              📅 {formatDateTime(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="actions">
                        <button
                          className="btn-icon edit"
                          onClick={() => startEditing(task)}
                        >
                          ✎
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          🗑
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
    </div>
  );
}

export default App;
