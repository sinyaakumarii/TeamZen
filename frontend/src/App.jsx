// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import FaceRegister from './pages/FaceRegister';
import CheckIn from './pages/CheckIn';
import Leave from './pages/Leave'; // Imported the new Leave page

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/face-register" element={<FaceRegister />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/leave" element={<Leave />} /> {/* Added the Leave route */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;