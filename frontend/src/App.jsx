// Archivo: frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
// Componentes
import Navbar from './components/Navbar'; 
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import TablonPage from './pages/TablonPage'; 
import ModeracionTablonPage from './pages/admin/ModeracionTablonPage';
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
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
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
        <Route path="/tablon" element={<TablonPage />} />

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
           {/* NUEVO: Ruta de moderación */}
          <Route path="/superadmin/moderacion-tablon" element={<ModeracionTablonPage />} />
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
     </GoogleReCaptchaProvider>
  );
}

export default App;