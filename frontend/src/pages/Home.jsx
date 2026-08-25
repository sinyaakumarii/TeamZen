// pages/Home.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Fingerprint, CalendarCheck, LogOut as LogOutIcon, ShieldCheck } from 'lucide-react';

function Home() {
  const { user, logout } = useAuth();
  const [faceRegistered, setFaceRegistered] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkFaceStatus = async () => {
      try {
        const response = await api.get('/face/status');
        setFaceRegistered(response.data.isRegistered);
      } catch (err) {
        setFaceRegistered(false);
      } finally {
        setLoading(false);
      }
    };

    checkFaceStatus();
  }, [user]);

  if (!user) {
    return (
      <div className="auth-shell">
        <div className="auth-brand-panel">
          <svg className="zen-rings" viewBox="0 0 420 420">
            <circle className="ring-2" cx="210" cy="210" r="90" />
            <circle className="ring-3" cx="210" cy="210" r="140" />
            <circle className="ring-4" cx="210" cy="210" r="190" />
          </svg>
          <div style={{ zIndex: 1 }}>
            <div className="auth-eyebrow">Smart HR, Made Calm</div>
            <h1 className="auth-headline">Welcome to<br />TeamZen.</h1>
            <p className="auth-subline">
              AI-powered attendance, performance and payroll — built for clarity.
            </p>
          </div>
          <div className="auth-footnote">© 2026 TeamZen HRMS</div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-box" style={{ textAlign: 'center' }}>
            <p className="form-wordmark">TeamZen</p>
            <h2 className="form-title">You're not signed in</h2>
            <p className="form-subtitle">Sign in to view your dashboard.</p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dash-shell">
      <div className="dash-topbar">
        <div className="dash-wordmark">TeamZen</div>
        <button className="btn-logout btn-with-icon" onClick={logout}>
          <LogOutIcon size={15} /> Logout
        </button>
      </div>

      <div className="dash-content">
        <div className="welcome-card">
          <div className="avatar-circle">{initials}</div>
          <div>
            <h2 className="welcome-name">Welcome, {user.full_name}</h2>
            <p className="welcome-email">{user.email}</p>
            <span className="role-badge">{user.role.replace('_', ' ')}</span>
          </div>
        </div>

        {(user.role === 'employee' || user.role === 'intern') && !loading && (
          <div className="action-card">
            <div className="action-card-header">
              <div className={`icon-circle ${faceRegistered ? 'teal' : 'amber'}`}>
                {faceRegistered ? <CalendarCheck size={20} /> : <Fingerprint size={20} />}
              </div>
              <div>
                <h3 className="action-card-title">Attendance</h3>
                {faceRegistered !== null && (
                  <span className={`status-pill ${faceRegistered ? 'done' : 'pending'}`}>
                    <ShieldCheck size={13} />
                    {faceRegistered ? 'Face verified' : 'Setup required'}
                  </span>
                )}
              </div>
            </div>

            {faceRegistered === false && (
              <>
                <p className="action-card-desc">
                  You haven't registered your face yet. This one-time setup is required
                  before you can mark attendance securely.
                </p>
                <Link to="/face-register" className="btn-primary btn-with-icon" style={{ display: 'inline-flex', textDecoration: 'none', maxWidth: '220px' }}>
                  <Fingerprint size={16} /> Register My Face
                </Link>
              </>
            )}

            {faceRegistered === true && (
              <>
                <p className="action-card-desc">
                  Your face is registered. You're all set to check in — we'll verify your
                  face, location, and office network automatically.
                </p>
                <Link to="/check-in" className="btn-primary btn-with-icon" style={{ display: 'inline-flex', textDecoration: 'none', maxWidth: '220px' }}>
                  <CalendarCheck size={16} /> Mark Attendance
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;