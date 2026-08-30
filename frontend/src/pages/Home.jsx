// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const { user } = useAuth();
  const [pendingTasks, setPendingTasks] = useState(0);

  useEffect(() => {
    // Agar user employee ya intern hai, toh backend se uske tasks mangwao taake count dikha sakein
    if (user?.role === 'employee' || user?.role === 'intern') {
      api.get('/tasks/my-tasks')
        .then(response => {
          const tasks = response.data.data;
          // Sirf wo tasks count karo jo 'completed' nahi hain
          const incomplete = tasks.filter(task => task.status !== 'completed');
          setPendingTasks(incomplete.length);
        })
        .catch(err => console.error("Failed to load tasks for dashboard", err));
    }
  }, [user]);

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>Dashboard</h2>
      </div>
      
      <div className="dash-content">
        <div className="action-card" style={{ marginBottom: '20px' }}>
          <h3>Welcome back, {user?.role.toUpperCase()}! 👋</h3>
          <p>Here is what is happening in your workspace today.</p>
        </div>

        {/* SUMMARY CARDS SECTION */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Card 1: Tasks Summary (Only for Employees) */}
          {(user?.role === 'employee' || user?.role === 'intern') && (
            <div className="action-card" style={{ flex: 1, minWidth: '200px', borderLeft: '4px solid #3498db' }}>
              <h4>My Tasks</h4>
              <h1 style={{ fontSize: '3rem', margin: '10px 0', color: '#2c3e50' }}>{pendingTasks}</h1>
              <p style={{ color: '#7f8c8d' }}>Tasks needing your attention</p>
              <Link to="/tasks" className="btn-primary" style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}>
                View Tasks
              </Link>
            </div>
          )}

          {/* Card 2: Quick Action (Check-in) */}
          <div className="action-card" style={{ flex: 1, minWidth: '200px', borderLeft: '4px solid #2ecc71' }}>
            <h4>Daily Attendance</h4>
            <p style={{ marginTop: '10px', color: '#7f8c8d' }}>Don't forget to mark your attendance using facial recognition.</p>
            <Link to="/check-in" className="btn-primary" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>
              Check In Now
            </Link>
          </div>

          {/* Card 3: Quick Action (Leave) */}
          <div className="action-card" style={{ flex: 1, minWidth: '200px', borderLeft: '4px solid #e74c3c' }}>
            <h4>Leave Management</h4>
            <p style={{ marginTop: '10px', color: '#7f8c8d' }}>Planning a vacation or feeling sick? Submit a request.</p>
            <Link to="/leave" className="btn-primary" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none' }}>
              Apply for Leave
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;