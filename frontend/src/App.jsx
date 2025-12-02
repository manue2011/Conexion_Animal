// Archivo: frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Componentes
import Navbar from './components/Navbar'; // <--- Importamos el nuevo Navbar

// Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AnimalDetailsPage from './pages/AnimalDetailsPage';

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar se coloca aquí para que aparezca en TODAS las páginas */}
      <Navbar />

      <Routes>
        <Route path="/animal/:id" element={<AnimalDetailsPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;