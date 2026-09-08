import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, PlusCircle } from 'lucide-react';

function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { title, message });
      setStatusMsg('Announcement posted!');
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err) {
      setStatusMsg('Error posting announcement.');
    }
  };

  return (
    <div className="dash-shell">
      <div className="dash-topbar"><h2>Company Announcements</h2></div>
      <div className="dash-content">
        
        {/* Sirf Admin nayi announcement post kar sakti hai */}
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <div className="action-card" style={{ marginBottom: '20px' }}>
            <h3><PlusCircle size={20} /> Post New Notice</h3>
            {statusMsg && <p style={{color: 'green'}}>{statusMsg}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <input type="text" placeholder="Announcement Title" value={title} required onChange={e => setTitle(e.target.value)} style={{ padding: '10px' }} />
              <textarea placeholder="Write message here..." value={message} required onChange={e => setMessage(e.target.value)} rows="3" style={{ padding: '10px' }}></textarea>
              <button type="submit" style={{ background: '#3498db', color: '#fff', border: 'none', padding: '10px', width: '150px', cursor: 'pointer' }}>Post Notice</button>
            </form>
          </div>
        )}

        {/* Sab log announcements dekh sakte hain */}
        <div className="action-card">
          <h3><Bell size={20} /> Notice Board</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {announcements.length === 0 ? <p>No announcements yet.</p> : announcements.map(a => (
              <div key={a.id} style={{ borderLeft: '4px solid #e74c3c', padding: '10px 15px', background: '#f9f9f9' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{a.title}</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{a.message}</p>
                <small style={{ color: '#7f8c8d' }}>Posted by: {a.first_name} {a.last_name} | {new Date(a.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Announcements;