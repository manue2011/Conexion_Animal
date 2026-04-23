import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');
  const isLoggedIn = token && user;

  // --- NUEVO ESTADO PARA EL MENÚ DESPLEGABLE ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el menú si hacemos clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="w-full mx-auto px-2 xl:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center min-w-max">
            <span className="text-2xl mr-2">🐾</span>
            <span className="font-bold text-xl text-blue-600 tracking-tight hidden md:block">Conexión Animal</span>
          </Link>

          {/* ENLACES */}
          <div className="flex space-x-1 lg:space-x-3 items-center">
            <Link to="/" className="text-gray-600 hover:text-blue-500 px-2 py-2 font-medium whitespace-nowrap">
             🏠 Inicio
            </Link>
            
            <Link 
              to="/colonias" 
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-bold px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              🗺️ <span className="hidden xl:inline">Red de </span>Colonias
            </Link>

            <Link to="/contacto" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-2 whitespace-nowrap">
            ✉️ Contacto
            </Link>
            
            <Link to="/sobre-nosotros" className="text-gray-700 hover:text-blue-600 px-2 py-2 font-medium whitespace-nowrap">
              🤝 Conócenos
            </Link>        
            
            <Link 
              to="/tablon" 
              className="flex items-center gap-1 text-gray-600 hover:text-orange-600 font-bold px-2 py-2 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              📢 Tablón<span className="hidden xl:inline"> de Ayuda</span>
            </Link>

            {/* --- MENÚ DESPLEGABLE "MÁS" --- */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-bold px-2 py-2 rounded-lg transition-colors focus:outline-none whitespace-nowrap"
              >
                ➕ Más 
                <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {/* Contenido del Desplegable */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                  <Link 
                    to="/adoptados"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 transition-colors group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">🏡</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-green-700">Finales Felices</p>
                      <p className="text-xs text-gray-500">Ver animales ya adoptados</p>
                    </div>
                  </Link>
                  
                  <div className="border-t border-gray-100 my-1"></div>

                  <Link 
                    to="/planes"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">⭐</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-purple-700">Planes Protectoras</p>
                      <p className="text-xs text-gray-500">Conoce el Plan Free y Plan PRO</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* BOTONES DE USUARIO */}
            {isLoggedIn ? (
              <div className="flex items-center border-l border-gray-300 pl-2 ml-1">
                {user.role === 'superadmin' && (
                  <Link to="/superadmin/dashboard" className="bg-yellow-100 text-yellow-800 font-bold px-3 py-2 rounded-lg flex items-center hover:bg-yellow-200 transition whitespace-nowrap">
                    👑 Cuartel General
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-blue-600 font-bold px-3 py-2 whitespace-nowrap">
                    Panel Admin
                  </Link>
                )}
                 
                {user.role === 'gestor' && (
                  <Link to="/colonia/dashboard" className="bg-blue-100 text-blue-800 font-bold px-3 py-2 rounded-lg flex items-center hover:bg-blue-200 transition whitespace-nowrap">
                    🐱 Gestión Colonia
                  </Link>
                )}
  
                {user.role === 'user' && (
                  <div className="flex gap-1 xl:gap-2">
                    <Link to="/mis-solicitudes" className="text-gray-600 hover:text-blue-600 font-bold px-2 py-2 whitespace-nowrap">
                      📋 <span className="hidden lg:inline">Mis Solicitudes</span>
                    </Link>
                    <Link to="/solicitar-rol" className="bg-green-100 text-green-800 font-bold px-3 py-2 rounded-lg flex items-center hover:bg-green-200 transition whitespace-nowrap">
                      🤝 Trabaja con nosotros
                    </Link>
                  </div>
                )}

                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition ml-2 whitespace-nowrap"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center border-l border-gray-300 pl-2 ml-1 gap-2">
                <Link to="/login" className="text-gray-600 hover:text-blue-500 px-2 py-2 whitespace-nowrap">
                  Entrar
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition whitespace-nowrap">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;