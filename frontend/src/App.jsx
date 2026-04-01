// Archivo: frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Componentes
import Navbar from './components/Navbar'; 
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import ColoniasPublic from './pages/ColoniasPublic';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SolicitarRolPage from './pages/user/SolicitarRolPage';
import AnimalDetailsPage from './pages/AnimalDetailsPage';
import MisSolicitudesPage from './pages/user/MisSolicitudesPage.jsx';
// Páginas Privadas
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import ColoniaDashboard from './pages/admin/ColoniaDashboard'; 

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ==============================
            RUTAS PÚBLICAS
        ============================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/animal/:id" element={<AnimalDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ==============================
            RUTAS DE USUARIO NORMAL
        ============================== */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/solicitar-rol" element={<SolicitarRolPage />} />
          <Route path="/mis-solicitudes" element={<MisSolicitudesPage />} />
        </Route>

        {/* ==============================
            RUTAS PROTEGIDAS (Solo Protectoras)
        ============================== */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ==============================
            RUTAS DE SUPERADMIN (Solo Tú)
        ============================== */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        </Route>

        {/* ==============================
            RUTAS DE GESTOR (Colonias)
        ============================== */}
        <Route element={<ProtectedRoute allowedRoles={['gestor']} />}>
          <Route path="/colonia/dashboard" element={<ColoniaDashboard />} />
        </Route>
        <Route path="/colonias" element={<ColoniasPublic />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;