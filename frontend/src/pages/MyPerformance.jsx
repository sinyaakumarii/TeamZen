// frontend/src/pages/MyPerformance.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Target, AlertCircle } from 'lucide-react';

function MyPerformance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'employee' || user?.role === 'intern') {
      fetchPerformance();
    }
  }, [user]);

  const fetchPerformance = async () => {
    try {
      const response = await api.get('/performance/my-performance');
      setRecords(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load performance records.');
    }
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    return 'C';
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>My Performance</h2>
      </div>

      <div className="dash-content">
        {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}

        <div className="action-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Target size={24} color="#8e44ad" />
            <h3>Performance & Evaluation Records</h3>
          </div>

          {records.length === 0 ? (
            <p>No performance reviews available yet.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                  <th style={{ padding: '12px' }}>Period</th>
                  <th style={{ padding: '12px' }}>Attendance</th>
                  <th style={{ padding: '12px' }}>Tasks</th>
                  <th style={{ padding: '12px' }}>Penalty</th>
                  <th style={{ padding: '12px' }}>Final Score</th>
                  <th style={{ padding: '12px' }}>Grade</th>
                  <th style={{ padding: '12px' }}>Bonus/Increment</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{rec.review_month} {rec.review_year}</td>
                    <td style={{ padding: '12px', color: '#27ae60' }}>+{rec.attendance_score}</td>
                    <td style={{ padding: '12px', color: '#2980b9' }}>+{rec.task_score}</td>
                    <td style={{ padding: '12px', color: '#c0392b' }}>-{rec.late_penalty}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '16px' }}>{rec.final_score}/100</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#f39c12', color: 'white', fontWeight: 'bold' }}>
                        {getGrade(rec.final_score)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {rec.rec_status === 'approved' ? (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>{rec.suggested_action.toUpperCase()}</span>
                      ) : (
                        <span style={{ color: 'gray' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPerformance;