import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; 
import AIRecommendations from './pages/AIRecommendations';
import MyPerformance from './pages/MyPerformance';
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
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/face-register" element={<FaceRegister />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/ai-recommendations" element={<AIRecommendations />} />
              <Route path="/my-performance" element={<MyPerformance />} />
            </Route>
          </Route>
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;