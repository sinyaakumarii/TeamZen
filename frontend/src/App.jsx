// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // Imported the Guard

import Home from './pages/Home';
import Login from './pages/Login';
import FaceRegister from './pages/FaceRegister';
import CheckIn from './pages/CheckIn';
import Leave from './pages/Leave';
import Holidays from './pages/Holidays';
import Tasks from './pages/Tasks';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (Anyone can visit these) */}
          <Route path="/login" element={<Login />} />
          <Route path="/face-register" element={<FaceRegister />} />

          {/* Protected Routes (Must be logged in to pass the guard) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/tasks" element={<Tasks />} />
            </Route>
          </Route>
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;