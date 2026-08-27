// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import FaceRegister from './pages/FaceRegister';
import CheckIn from './pages/CheckIn';
import Leave from './pages/Leave';
import Holidays from './pages/Holidays';
import Tasks from './pages/Tasks'; // Imported the new Tasks page

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/face-register" element={<FaceRegister />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/holidays" element={<Holidays />} />
          <Route path="/tasks" element={<Tasks />} /> {/* Added the Tasks route */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;