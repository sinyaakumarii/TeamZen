// frontend/src/pages/Leave.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Leave() {
  const { user } = useAuth();
  
  // States for Employee Form
  const [formData, setFormData] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
  
  // States for Admin View
  const [allLeaves, setAllLeaves] = useState([]);
  
  // Shared States
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch all leaves immediately if user is Admin
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leave/all');
      setAllLeaves(response.data.data);
    } catch (err) {
      console.error("Failed to load leaves", err);
      setError("Failed to load leave requests.");
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const response = await api.post('/leave/apply', formData);
      setMessage(response.data.message);
      setFormData({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for leave.');
    }
  };

  const handleReview = async (leaveId, newStatus) => {
    setMessage(''); setError('');
    try {
      const response = await api.put(`/leave/${leaveId}/review`, { 
        status: newStatus,
        admin_notes: `Reviewed by ${user.role}`
      });
      setMessage(response.data.message);
      fetchLeaves(); // Refresh the list instantly after approval/rejection
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review leave.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>Leave Management</h2>
      </div>

      <div className="dash-content">
        {error && <div className="error-box">{error}</div>}
        {message && <div className="result-box">{message}</div>}

        {/* ============================== */}
        {/* ADMIN VIEW: Leave Requests Table */}
        {/* ============================== */}
        {(user?.role === 'admin' || user?.role === 'super_admin') ? (
          <div className="action-card">
            <h3>Employee Leave Requests</h3>
            {allLeaves.length === 0 ? (
              <p>No leave requests found.</p>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                    <th style={{ padding: '10px' }}>Employee</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Dates</th>
                    <th style={{ padding: '10px' }}>Reason</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allLeaves.map(leave => (
                    <tr key={leave.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{leave.employee_email}</td>
                      <td style={{ padding: '10px', textTransform: 'capitalize' }}>{leave.leave_type}</td>
                      <td style={{ padding: '10px' }}>
                        {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px' }}>{leave.reason}</td>
                      <td style={{ padding: '10px' }}>
                        <strong style={{
                          color: leave.status === 'approved' ? 'green' : leave.status === 'rejected' ? 'red' : 'orange'
                        }}>
                          {leave.status.toUpperCase()}
                        </strong>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {leave.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleReview(leave.id, 'approved')} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => handleReview(leave.id, 'rejected')} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* ============================== */
          /* EMPLOYEE VIEW: Apply Form      */
          /* ============================== */
          <div className="action-card">
            <h3>Apply for Leave</h3>
            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div>
                <label>Leave Type:</label><br />
                <select value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})} style={{ padding: '10px', width: '100%', marginTop: '5px' }}>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Leave</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>Start Date:</label><br />
                  <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ padding: '10px', width: '100%', marginTop: '5px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>End Date:</label><br />
                  <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} style={{ padding: '10px', width: '100%', marginTop: '5px' }} />
                </div>
              </div>
              <div>
                <label>Reason:</label><br />
                <textarea required rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} style={{ padding: '10px', width: '100%', marginTop: '5px' }}></textarea>
              </div>
              <button type="submit" className="btn-primary">Submit Application</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leave;