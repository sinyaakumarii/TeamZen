// pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(user, token);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="auth-headline">Attendance, performance,<br />and payroll — in one place.</h1>
          <p className="auth-subline">
            Verified check-ins, AI-assisted reviews, and payroll that always reconciles.
            Built for teams who want clarity without the busywork.
          </p>
        </div>

        <div className="auth-footnote">© 2026 TeamZen HRMS</div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <p className="form-wordmark">TeamZen</p>
          <h2 className="form-title">Welcome back</h2>
          <p className="form-subtitle">Sign in to your workspace to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;