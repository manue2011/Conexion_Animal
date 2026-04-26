// Archivo: frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import axios from 'axios'; 
// Componentes
import Navbar from './components/Navbar'; 
import ProtectedRoute from './components/ProtectedRoute';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';

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
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TerminosCondiciones from './pages/TerminosCondiciones';
import ContactoPage from './pages/ContactoPage';
import SobreNosotros from './pages/SobreNosotros';
import AdoptadosPage from './pages/AdoptadosPage';
import PlanesPage from './pages/PlanesPage';
// Páginas Privadas
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import ColoniaDashboard from './pages/admin/ColoniaDashboard'; 

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 && 
        error.response?.data?.message?.includes('suspendida')) {
      
      // ✅ Si estamos en /login, NO hacemos nada — dejamos que LoginPage muestre el error
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      alert('⛔ Tu cuenta ha sido suspendida. Contacta con el administrador.');
      
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 3000);
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen">
      <Routes>
        {/* ==============================
            RUTAS PÚBLICAS
        ============================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/animal/:id" element={<AnimalDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tablon" element={<TablonPage />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/adoptados" element={<AdoptadosPage />} />
        <Route path="/planes" element={<PlanesPage />} />
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
      </main>
      <Footer />
      <CookieBanner />
    </BrowserRouter>
     </GoogleReCaptchaProvider>
  );
}

export default App;