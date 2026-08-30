// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  // Check if the browser has a saved login token
  const token = localStorage.getItem('token');

  // If there is no token, kick the user back to the login page immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have a token, let them pass through to the page they requested
  return <Outlet />;
}

export default ProtectedRoute;