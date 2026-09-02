// frontend/src/pages/AIRecommendations.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/performance/recommendations');
      setRecommendations(response.data.data);
    } catch (err) {
      console.error("Failed to load AI recommendations", err);
      setError("Failed to load AI recommendations.");
    }
  };

  const handleReview = async (id, status) => {
    setError('');
    setMessage('');
    try {
      const response = await api.put(`/performance/recommend/${id}/review`, { status });
      setMessage(response.data.message);
      fetchRecommendations(); // Refresh list instantly
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recommendation status.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>AI Performance Recommendations</h2>
      </div>

      <div className="dash-content">
        {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}
        {message && <div className="result-box"><CheckCircle size={16} /> {message}</div>}

        <div className="action-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Bot size={24} color="#3b82f6" />
            <h3>AI-Driven Bonus, Increment & Penalty Proposals</h3>
          </div>

          {recommendations.length === 0 ? (
            <p>No AI recommendations generated yet.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                  <th style={{ padding: '12px' }}>Employee</th>
                  <th style={{ padding: '12px' }}>Suggested Action</th>
                  <th style={{ padding: '12px' }}>AI Reasoning</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{rec.employee_email}</td>
                    <td style={{ padding: '12px', textTransform: 'uppercase' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        background: rec.suggested_action === 'bonus' ? '#d1fae5' : rec.suggested_action === 'increment' ? '#dbeafe' : '#fee2e2',
                        color: rec.suggested_action === 'bonus' ? '#065f46' : rec.suggested_action === 'increment' ? '#1e40af' : '#991b1b'
                      }}>
                        {rec.suggested_action}
                      </span>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '350px', fontSize: '14px' }}>{rec.reasoning}</td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{
                        color: rec.status === 'approved' ? 'green' : rec.status === 'rejected' ? 'red' : 'orange'
                      }}>
                        {rec.status.toUpperCase()}
                      </strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {rec.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleReview(rec.id, 'approved')} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleReview(rec.id, 'rejected')} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                        </div>
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

export default AIRecommendations;