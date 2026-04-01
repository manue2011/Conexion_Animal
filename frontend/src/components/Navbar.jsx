// Archivo: frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');
  const isLoggedIn = token && user;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl mr-2">🐾</span>
            <span className="font-bold text-xl text-blue-600 tracking-tight">Conexión Animal</span>
          </Link>

          {/* ENLACES */}
          <div className="flex space-x-4 items-center">
            <Link to="/" className="text-gray-600 hover:text-blue-500 px-3 py-2 font-medium">
              Inicio
            </Link>
            <Link 
              to="/colonias" 
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              🗺️ Red de Colonias
            </Link>
            {isLoggedIn ? (
              <>
                {/* Botón exclusivo para Manuel (SuperAdmin) */}
                {user.role === 'superadmin' && (
                  <Link to="/superadmin/dashboard" className="bg-yellow-100 text-yellow-800 font-bold px-3 py-2 rounded-lg flex items-center hover:bg-yellow-200 transition">
                    👑 Cuartel General
                  </Link>
                )}

                {/* Botón para Protectoras (Admin normal) */}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-blue-600 font-bold px-3 py-2">
                    Panel Admin
                  </Link>
                )}
                 {/* Antes decía /colonia-dashboard, cámbialo por /colonia/dashboard */}
                {user.role === 'gestor' && (
                  <Link to="/colonia/dashboard" className="bg-blue-100 text-blue-800 font-bold px-3 py-2 rounded-lg flex items-center hover:bg-blue-200 transition">
                    🐱 Gestión Colonia
                  </Link>
                )}
  
                {/* Botón para Usuarios Normales - Añadimos Mis Solicitudes */}
                {user.role === 'user' && (
                  <div className="flex gap-2">
                    <Link to="/mis-solicitudes" className="text-gray-600 hover:text-blue-600 font-bold px-3 py-2">
                      📋 Mis Solicitudes
                    </Link>
                    <Link to="/solicitar-rol" className="bg-green-100 text-green-800 font-bold px-3 py-2 rounded-lg flex items-center hover:bg-green-200 transition">
                      🤝 Trabaja con nosotros
                    </Link>
                  </div>
                )}

                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition ml-4"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-500 px-3 py-2">
                  Entrar
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;