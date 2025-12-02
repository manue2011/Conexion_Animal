// Archivo: frontend/src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes
import AnimalForm from '../../components/AnimalForm';
import AnimalList from '../../components/AnimalList';
import AdoptionRequests from '../../components/AdoptionRequests';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // ESTADO PARA LA NAVEGACIÓN (Por defecto vemos el 'resumen')
  // Opciones: 'resumen', 'animales', 'solicitudes'
  const [activeView, setActiveView] = useState('resumen');

  // Estado para refrescar la lista de animales
  const [refreshList, setRefreshList] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !userData) { navigate('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') { navigate('/'); return; }
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const triggerRefresh = () => {
    setRefreshList(prev => !prev);
  };

  if (!user) return <div className="p-10">Cargando...</div>;

  // --- SUB-COMPONENTES INTERNOS (Para ordenar el código) ---
  
  // VISTA 1: RESUMEN (Métricas)
  const RenderResumen = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Vision General</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Estado del Sistema</h3>
          <p className="text-xl font-bold text-green-600">En Línea 🟢</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Tu Rol</h3>
          <p className="text-xl font-bold uppercase">{user.role}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Tareas Pendientes</h3>
          <p className="text-xl font-bold">Revisar Solicitudes</p>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-2">👋 ¡Hola de nuevo!</h3>
        <p className="text-blue-700">Selecciona una opción en el menú de la izquierda para empezar a trabajar.</p>
      </div>
    </div>
  );

  // VISTA 2: GESTIÓN DE ANIMALES
  const RenderAnimales = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">🐾 Gestión de Animales</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <AnimalForm onSuccess={triggerRefresh} />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-600">Inventario Actual</h3>
          <AnimalList refreshTrigger={refreshList} />
        </div>
      </div>
    </div>
  );

  // VISTA 3: SOLICITUDES
  const RenderSolicitudes = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-purple-700 border-b pb-2">💌 Buzón de Solicitudes</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <AdoptionRequests />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl">
        <div className="p-6 text-center border-b border-slate-700">
          <h2 className="text-2xl font-bold tracking-wider">PANEL ADMIN</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveView('resumen')}
            className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3
              ${activeView === 'resumen' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-700 text-gray-300'}`}
          >
            📊 <span>Resumen</span>
          </button>
          
          <button 
            onClick={() => setActiveView('animales')}
            className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3
              ${activeView === 'animales' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-700 text-gray-300'}`}
          >
            🐾 <span>Animales</span>
          </button>
          
          <button 
            onClick={() => setActiveView('solicitudes')}
            className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3
              ${activeView === 'solicitudes' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-700 text-gray-300'}`}
          >
            💌 <span>Solicitudes</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeView === 'resumen' && 'Dashboard'}
            {activeView === 'animales' && 'Inventario'}
            {activeView === 'solicitudes' && 'Adopciones'}
          </h1>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow">
            Usuario: <span className="font-bold text-blue-600">{user.email}</span>
          </div>
        </header>

        {/* AQUÍ ES DONDE CAMBIAMOS LA VISTA SEGÚN EL BOTÓN PULSADO */}
        {activeView === 'resumen' && <RenderResumen />}
        {activeView === 'animales' && <RenderAnimales />}
        {activeView === 'solicitudes' && <RenderSolicitudes />}

      </main>
    </div>
  );
};

export default AdminDashboard;