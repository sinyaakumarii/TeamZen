// frontend/src/pages/Tasks.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks/my-tasks');
      setTasks(response.data.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
      setError("Failed to load tasks.");
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    setMessage('');
    setError('');
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      setMessage(response.data.message);
      fetchTasks(); // Refresh the list immediately so the UI updates
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>My Tasks</h2>
        <Link to="/" className="btn-secondary">Back to Dashboard</Link>
      </div>

      <div className="dash-content">
        <div className="action-card">
          <h3>Assigned Tasks</h3>
          {error && <div className="error-box">{error}</div>}
          {message && <div className="result-box">{message}</div>}

          {tasks.length === 0 ? (
            <p>You have no assigned tasks right now.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tasks.map(task => (
                <li key={task.id} style={{ padding: '15px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    
                    {/* Left Side: Task Info */}
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{task.title}</h4>
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>{task.description}</p>
                      <span style={{ fontSize: '12px', background: '#e0e0e0', padding: '3px 8px', borderRadius: '12px', marginRight: '10px' }}>
                        Priority: {task.priority}
                      </span>
                      <span style={{ fontSize: '12px', background: '#e0e0e0', padding: '3px 8px', borderRadius: '12px' }}>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Right Side: Status Update */}
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block', marginBottom: '10px', color: task.status === 'completed' ? 'green' : '#333' }}>
                        Status: {task.status.replace('_', ' ').toUpperCase()}
                      </strong>
                      
                      {/* Only show the dropdown if the task is not completed yet */}
                      {task.status !== 'completed' && (
                        <select 
                          onChange={(e) => updateStatus(task.id, e.target.value)}
                          value={task.status}
                          style={{ padding: '8px', borderRadius: '4px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>

                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;