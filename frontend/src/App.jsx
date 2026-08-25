// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import FaceRegister from './pages/FaceRegister';
import CheckIn from './pages/CheckIn';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/face-register" element={<FaceRegister />} />
          <Route path="/check-in" element={<CheckIn />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;