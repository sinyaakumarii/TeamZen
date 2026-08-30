// frontend/src/components/Layout.jsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    window.location.href = '/login'; // Force reload to clear states
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <div style={{ 
        width: '250px', background: '#2c3e50', color: 'white', 
        padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' 
      }}>
        <h2 style={{ color: '#ecf0f1', margin: '0 0 10px 0' }}>TeamZen</h2>
        <hr style={{ borderColor: '#34495e', width: '100%', marginBottom: '10px' }} />

        {/* Links */}
        <Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '10px', background: '#34495e', borderRadius: '5px' }}>Dashboard</Link>
        <Link to="/check-in" style={{ color: 'white', textDecoration: 'none', padding: '10px', background: '#34495e', borderRadius: '5px' }}>Attendance</Link>
        <Link to="/tasks" style={{ color: 'white', textDecoration: 'none', padding: '10px', background: '#34495e', borderRadius: '5px' }}>Tasks</Link>
        <Link to="/leave" style={{ color: 'white', textDecoration: 'none', padding: '10px', background: '#34495e', borderRadius: '5px' }}>Leave</Link>
        <Link to="/holidays" style={{ color: 'white', textDecoration: 'none', padding: '10px', background: '#34495e', borderRadius: '5px' }}>Holidays</Link>

        {/* User Info & Logout at the bottom */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #34495e', paddingTop: '15px' }}>
          <p style={{ fontSize: '14px', color: '#bdc3c7', marginBottom: '10px' }}>
            Logged in as: <strong style={{color: 'white'}}>{user?.role?.toUpperCase()}</strong>
          </p>
          <button 
            onClick={handleLogout} 
            style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', width: '100%', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f4f7f6', padding: '20px' }}>
        {/* The <Outlet /> is where React Router dynamically injects your other pages */}
        <Outlet /> 
      </div>

    </div>
  );
}

export default Layout;