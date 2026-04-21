import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import Comment from "./Comments";

function TaskManager() {
  // ✅ TASK STATE (SAFE LOAD)
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("tasks");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [category, setCategory] = useState("Work");

  // ✅ SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // ✅ DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ✅ ADD TASK
  const addTask = () => {
    if (!input.trim()) return;

    const newTask = {
      id: Date.now(),
      text: input,
      completed: false,
      selected: false,
      rating: 0,
      category: category,
      comments: [],
    };

    setTasks((prev) => [...prev, newTask]);
    setInput("");
  };

  // ✅ DELETE TASK
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ✅ TOGGLE COMPLETE
  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // ✅ SELECT
  const toggleSelect = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, selected: !t.selected } : t
      )
    );
  };

  const allSelected =
    tasks.length > 0 && tasks.every((t) => t.selected);

  const handleSelectAll = () => {
    setTasks((prev) =>
      prev.map((t) => ({ ...t, selected: !allSelected }))
    );
  };

  const deleteSelected = () => {
    setTasks((prev) => prev.filter((t) => !t.selected));
  };

  // ✅ STAR RATING
  const updateRating = (id, rating) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, rating } : t
      )
    );
  };

  // ✅ COMMENTS
  const addComment = (taskId, text) => {
    if (!text.trim()) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [
                ...t.comments,
                { id: Date.now(), text, replies: [] },
              ],
            }
          : t
      )
    );
  };

  const addReply = (taskId, commentId, text) => {
    if (!text.trim()) return;

    const addNestedReply = (comments) =>
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                { id: Date.now(), text, replies: [] },
              ],
            }
          : { ...c, replies: addNestedReply(c.replies) }
      );

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: addNestedReply(t.comments) }
          : t
      )
    );
  };

  // ✅ DELETE COMMENT
  const deleteComment = (taskId, commentId) => {
    const deleteNested = (comments) =>
      comments
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: deleteNested(c.replies),
        }));

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: deleteNested(t.comments) }
          : t
      )
    );
  };

  // ✅ EDIT COMMENT (NEW 🔥)
  const editComment = (taskId, commentId, newText) => {
    const editNested = (comments) =>
      comments.map((c) =>
        c.id === commentId
          ? { ...c, text: newText }
          : { ...c, replies: editNested(c.replies) }
      );

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: editNested(t.comments) }
          : t
      )
    );
  };

  // ✅ FILTER TASKS
  const filteredTasks = tasks
    .filter((task) =>
      task.text
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    )
    .filter((task) =>
      activeTab === "All"
        ? true
        : task.category === activeTab
    );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Manager</h1>

      {/* INPUT */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter task"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
      </select>

      <button onClick={addTask}>Add</button>

      {/* SEARCH */}
      <input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABS */}
      <div style={{ marginTop: "10px" }}>
        {["All", "Work", "Personal"].map((tab) => {
          const count =
            tab === "All"
              ? tasks.length
              : tasks.filter((t) => t.category === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                marginRight: "10px",
                fontWeight:
                  activeTab === tab ? "bold" : "normal",
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* BULK */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
        />
        <label>Select All</label>

        <button
          onClick={deleteSelected}
          style={{ marginLeft: "10px" }}
        >
          Delete Selected
        </button>
      </div>

      {/* EMPTY STATE */}
      {filteredTasks.length === 0 && (
        <p>No tasks found</p>
      )}

      {/* TASK LIST */}
      {filteredTasks.map((task) => (
        <div key={task.id}>
          <input
            type="checkbox"
            checked={task.selected}
            onChange={() => toggleSelect(task.id)}
          />

          <span
            onClick={() => toggleComplete(task.id)}
            style={{
              textDecoration: task.completed
                ? "line-through"
                : "none",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            {task.text}
          </span>

          <StarRating
            value={task.rating}
            onChange={(rating) =>
              updateRating(task.id, rating)
            }
          />

          <button onClick={() => deleteTask(task.id)}>
            Delete
          </button>

          {/* COMMENTS */}
          <div style={{ marginLeft: "20px" }}>
            <h4>Comments</h4>

            <input
              placeholder="Add comment"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addComment(task.id, e.target.value);
                  e.target.value = "";
                }
              }}
            />

            {task.comments.map((c) => (
              <Comment
                key={c.id}
                comment={c}
                addReply={(cid, text) =>
                  addReply(task.id, cid, text)
                }
                deleteComment={(cid) =>
                  deleteComment(task.id, cid)
                }
                editComment={(cid, text) =>
                  editComment(task.id, cid, text)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskManager;