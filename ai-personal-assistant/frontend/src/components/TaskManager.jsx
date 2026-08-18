import { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskManager.css';

const API_BASE_URL = 'http://localhost:8000';

export default function TaskManager({ onTasksChanged }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.title) {
      try {
        await axios.post(`${API_BASE_URL}/tasks`, newTask);
        setNewTask({ title: '', description: '', priority: 'medium' });
        fetchTasks();
        onTasksChanged();
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updates);
      fetchTasks();
      onTasksChanged();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      fetchTasks();
      onTasksChanged();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="task-manager">
      <div className="task-form-section">
        <h2>Add Task Manually</h2>
        <form className="task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description (optional)..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            rows="2"
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button type="submit">+ Add Task</button>
        </form>
      </div>

      <div className="tasks-view">
        <div className="tasks-section">
          <h3>Active Tasks ({activeTasks.length})</h3>
          {activeTasks.length === 0 ? (
            <p className="empty">No active tasks. Great job!</p>
          ) : (
            <div className="task-list">
              {activeTasks.map((task) => (
                <div key={task.id} className={`task-card priority-${task.priority}`}>
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      onChange={() => handleUpdateTask(task.id, { ...task, status: 'completed' })}
                    />
                  </div>
                  <div className="task-content">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                  </div>
                  <span className="priority-badge">{task.priority}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="tasks-section completed">
            <h3>Completed ({completedTasks.length})</h3>
            <div className="task-list">
              {completedTasks.map((task) => (
                <div key={task.id} className="task-card completed">
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked
                      onChange={() => handleUpdateTask(task.id, { ...task, status: 'pending' })}
                    />
                  </div>
                  <div className="task-content">
                    <h4>{task.title}</h4>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
