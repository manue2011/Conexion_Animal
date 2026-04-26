import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');
  const isLoggedIn = token && user;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-3 xl:px-8">
        <div className="flex justify-between h-16 items-center gap-2">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-lg text-blue-600 tracking-tight hidden sm:block">Conexión Animal</span>
          </Link>

          {/* ENLACES DESKTOP — ocultos en móvil */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center">
            <Link to="/" className="text-gray-600 hover:text-blue-500 px-2 py-2 text-sm font-medium whitespace-nowrap rounded-lg hover:bg-gray-50 transition-colors">
              🏠 Inicio
            </Link>
            <Link to="/colonias" className="text-gray-600 hover:text-blue-600 font-semibold px-2 py-2 text-sm rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
              🗺️ <span className="hidden xl:inline">Red de </span>Colonias
            </Link>
            <Link to="/contacto" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-2 text-sm whitespace-nowrap rounded-lg hover:bg-gray-50 transition-colors">
              ✉️ Contacto
            </Link>
            <Link to="/sobre-nosotros" className="text-gray-700 hover:text-blue-600 px-2 py-2 text-sm font-medium whitespace-nowrap rounded-lg hover:bg-gray-50 transition-colors">
              🤝 Conócenos
            </Link>
            <Link to="/tablon" className="text-gray-600 hover:text-orange-600 font-semibold px-2 py-2 text-sm rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap">
              📢 Tablón<span className="hidden xl:inline"> de Ayuda</span>
            </Link>

            {/* DROPDOWN MÁS */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-semibold px-2 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors focus:outline-none whitespace-nowrap"
              >
                ➕ Más
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  
                  {/* NUEVO: Mis Solicitudes movido aquí si es 'user' */}
                  {isLoggedIn && user.role === 'user' && (
                    <>
                      <Link to="/mis-solicitudes" onClick={() => setIsDropdownOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group">
                        <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
                        <div>
                          <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700">Mis Solicitudes</p>
                          <p className="text-xs text-gray-500">Ver estado de mis adopciones</p>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                    </>
                  )}

                  <Link to="/adoptados" onClick={() => setIsDropdownOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🏡</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-green-700">Finales Felices</p>
                      <p className="text-xs text-gray-500">Ver animales ya adoptados</p>
                    </div>
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link to="/planes" onClick={() => setIsDropdownOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">⭐</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-purple-700">Planes Protectoras</p>
                      <p className="text-xs text-gray-500">Conoce el Plan Free y Plan PRO</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ZONA DERECHA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Acciones de usuario — DESKTOP */}
            <div className="hidden lg:flex items-center gap-1.5 border-l border-gray-200 pl-3">
              {isLoggedIn ? (
                <>
                  {user.role === 'superadmin' && (
                    <Link to="/superadmin/dashboard" className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-yellow-200 transition whitespace-nowrap">
                      👑 Cuartel General
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="text-blue-600 font-bold px-2 py-1.5 text-sm whitespace-nowrap hover:bg-blue-50 rounded-lg transition">
                      Panel Admin
                    </Link>
                  )}
                  {user.role === 'gestor' && (
                    <Link to="/colonia/dashboard" className="bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-blue-200 transition whitespace-nowrap">
                      🐱 Mi Colonia
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <Link to="/solicitar-rol" className="bg-green-100 text-green-800 font-bold px-2.5 py-1.5 rounded-lg text-xs hover:bg-green-200 transition whitespace-nowrap">
                      🤝 Colaborar
                    </Link>
                  )}
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-blue-500 px-2 py-1.5 text-sm font-medium whitespace-nowrap">
                    Entrar
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap">
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* HAMBURGER — solo en móvil/tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm">🏠 Inicio</Link>
            <Link to="/colonias" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition text-sm">🗺️ Red de Colonias</Link>
            <Link to="/contacto" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm">✉️ Contacto</Link>
            <Link to="/sobre-nosotros" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm">🤝 Conócenos</Link>
            <Link to="/tablon" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition text-sm">📢 Tablón de Ayuda</Link>
            
            {/* NUEVO: Mis Solicitudes movido aquí si es 'user' (Vista Móvil) */}
            {isLoggedIn && user.role === 'user' && (
              <Link to="/mis-solicitudes" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-700 transition text-sm">📋 Mis Solicitudes</Link>
            )}

            <Link to="/adoptados" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-green-50 hover:text-green-700 transition text-sm">🏡 Finales Felices</Link>
            <Link to="/planes" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-purple-50 hover:text-purple-700 transition text-sm">⭐ Planes Protectoras</Link>
          </div>

          <div className="border-t border-gray-100 px-4 py-3 space-y-2">
            {isLoggedIn ? (
              <>
                {user.role === 'superadmin' && (
                  <Link to="/superadmin/dashboard" onClick={closeMobileMenu} className="flex items-center gap-2 w-full bg-yellow-100 text-yellow-800 font-bold px-3 py-2.5 rounded-lg text-sm hover:bg-yellow-200 transition">
                    👑 Cuartel General
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={closeMobileMenu} className="flex items-center gap-2 w-full bg-blue-50 text-blue-700 font-bold px-3 py-2.5 rounded-lg text-sm hover:bg-blue-100 transition">
                    Panel Admin
                  </Link>
                )}
                {user.role === 'gestor' && (
                  <Link to="/colonia/dashboard" onClick={closeMobileMenu} className="flex items-center gap-2 w-full bg-blue-100 text-blue-800 font-bold px-3 py-2.5 rounded-lg text-sm hover:bg-blue-200 transition">
                    🐱 Gestión Colonia
                  </Link>
                )}
                {user.role === 'user' && (
                  <Link to="/solicitar-rol" onClick={closeMobileMenu} className="flex items-center gap-2 w-full bg-green-100 text-green-800 font-bold px-3 py-2.5 rounded-lg text-sm hover:bg-green-200 transition">
                    🤝 Trabaja con nosotros
                  </Link>
                )}
                <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-2.5 rounded-lg text-sm transition">
                  Salir
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={closeMobileMenu} className="flex-1 text-center border border-gray-300 text-gray-700 font-medium px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Entrar
                </Link>
                <Link to="/register" onClick={closeMobileMenu} className="flex-1 text-center bg-blue-600 text-white font-bold px-3 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;