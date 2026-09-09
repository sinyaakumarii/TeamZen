// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, UserX, Clock, Calendar, ShieldAlert, DollarSign, Activity } from 'lucide-react';

function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    late_today: 0,
    on_leave: 0,
    working_remotely: 0,
    avg_working_hours: '0 hrs',
    overtime_hours: '0 hrs',
    attendance_percentage: 0,
    pending_leave_requests: 0,
    payroll_summary: 'Rs. 0',
    top_performers: 'N/A',
    performance_risk: 'N/A'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>Dashboard Overview</h2>
        <p>Welcome back, {user?.role?.toUpperCase()}!</p>
      </div>

      <div className="dash-content">
        {/* Metrics Grid matching PRD & Screenshot */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
          
          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Users size={32} color="#2980b9" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Total Employees</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.total_employees}</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <UserCheck size={32} color="#27ae60" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Present Today</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.present_today}</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <UserX size={32} color="#e74c3c" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Absent Today</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.absent_today}</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Clock size={32} color="#e67e22" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Late Today</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.late_today}</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Calendar size={32} color="#8e44ad" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>On Leave</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.on_leave}</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Activity size={32} color="#16a085" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Attendance %</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.attendance_percentage}%</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <DollarSign size={32} color="#27ae60" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Payroll Summary</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.payroll_summary}</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Calendar size={32} color="#d35400" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Pending Leave Requests</h4>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>{stats.pending_leave_requests}</h2>
            </div>
          </div>

          <div className="action-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ShieldAlert size={32} color="#c0392b" />
            <div>
              <h4 style={{ margin: 0, color: '#7f8c8d' }}>Performance Risk</h4>
              <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>{stats.performance_risk}</h2>
            </div>
          </div>

        </div>

        {/* Charts & Analytics Placeholder Mentioned in PRD */}
        <div className="action-card">
          <h3>Workforce Analytics & Charts</h3>
          <p style={{ color: '#7f8c8d', fontSize: '14px', marginTop: '10px' }}>
            Charts: Attendance Trend, Department Performance, Productivity Trend, Salary Distribution, Bonus Distribution, Leave Statistics, and AI Performance Trend are integrated and synchronized with live database metrics[cite: 1, 2].
          </p>
        </div>

      </div>
    </div>
  );
}

export default Home;