// frontend/src/pages/Leave.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // This auto-attaches your JWT token
import { useAuth } from '../context/AuthContext';

function Leave() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const response = await api.post('/leave/apply', formData);
      setMessage(response.data.message);
      // Clear the form after success
      setFormData({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for leave.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>Leave Management</h2>
        <Link to="/" className="btn-secondary">Back to Dashboard</Link>
      </div>
      
      <div className="dash-content">
        <div className="action-card">
          <h3>Apply for Leave</h3>
          <p>Submit a request to your Admin for approval.</p>
          
          {error && <div className="error-box">{error}</div>}
          {message && <div className="result-box">{message}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>Leave Type:</strong>
              <select name="leave_type" value={formData.leave_type} onChange={handleChange} required style={{ padding: '10px' }}>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>Start Date:</strong>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required style={{ padding: '10px' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>End Date:</strong>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required style={{ padding: '10px' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>Reason:</strong>
              <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="3" style={{ padding: '10px' }}></textarea>
            </label>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Leave;