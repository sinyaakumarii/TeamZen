// frontend/src/pages/Holidays.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Holidays() {
  const { user } = useAuth(); // Get the logged-in user to check their role
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState({ holiday_name: '', holiday_date: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Automatically fetch holidays when the page loads
  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await api.get('/holidays');
      setHolidays(response.data.data);
    } catch (err) {
      console.error("Failed to load holidays", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const response = await api.post('/holidays', formData);
      setMessage(response.data.message);
      setFormData({ holiday_name: '', holiday_date: '' }); // Clear form
      fetchHolidays(); // Refresh the list instantly
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <h2>Organization Holidays</h2>
        <Link to="/" className="btn-secondary">Back to Dashboard</Link>
      </div>
      
      <div className="dash-content">
        
        {/* THIS SECTION ONLY SHOWS FOR ADMINS */}
        {user?.role === 'admin' && (
          <div className="action-card" style={{ marginBottom: '20px' }}>
            <h3>Add New Holiday</h3>
            {error && <div className="error-box">{error}</div>}
            {message && <div className="result-box">{message}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <input type="text" name="holiday_name" placeholder="E.g., Eid ul Fitr" value={formData.holiday_name} onChange={handleChange} required style={{ padding: '10px', flex: 1, minWidth: '200px' }} />
              <input type="date" name="holiday_date" value={formData.holiday_date} onChange={handleChange} required style={{ padding: '10px' }} />
              <button type="submit" className="btn-primary">Add Holiday</button>
            </form>
          </div>
        )}

        {/* THIS SECTION SHOWS FOR EVERYONE */}
        <div className="action-card">
          <h3>Upcoming Holidays</h3>
          {holidays.length === 0 ? (
            <p>No holidays scheduled yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {holidays.map(holiday => (
                <li key={holiday.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{holiday.holiday_name}</strong> 
                  <span>{new Date(holiday.holiday_date).toDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Holidays;