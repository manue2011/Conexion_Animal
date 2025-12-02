// Archivo: frontend/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  // Comprobamos si hay alguien logueado mirando el localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const isLoggedIn = token && user;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); // Recarga rápida para limpiar estados
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
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-500 px-3 py-2 font-medium">
              Inicio
            </Link>

            {/* Si está logueado, mostramos su nombre y Logout */}
            {isLoggedIn ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-blue-600 font-bold px-3 py-2">
                    Panel Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                >
                  Salir
                </button>
              </>
            ) : (
              /* Si NO está logueado, mostramos Entrar/Registro */
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