// pages/Home.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
        <button className="btn-logout" onClick={logout}>Logout</button>
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
          <div className="welcome-card" style={{ marginTop: '20px', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 12px 0' }}>Attendance</h3>

            {faceRegistered === false && (
              <>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '14px' }}>
                  You haven't registered your face yet. This is required before you can mark attendance.
                </p>
                <Link to="/face-register" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', maxWidth: '220px' }}>
                  Register My Face
                </Link>
              </>
            )}

            {faceRegistered === true && (
              <>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '14px' }}>
                  Your face is registered. You can now mark your attendance.
                </p>
                <Link to="/check-in" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', maxWidth: '220px' }}>
                  Mark Attendance
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