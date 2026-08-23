// pages/Home.jsx
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user, logout } = useAuth();

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
      </div>
    </div>
  );
}

export default Home;