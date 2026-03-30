import { useState, useEffect } from 'react';
import axios from 'axios'; // <-- Importamos axios para las peticiones HTTP

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Efecto para cargar los datos reales al abrir el panel
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        // 1. Recuperamos tu token del localStorage
        const token = localStorage.getItem('token');
        
        // 2. Hacemos la petición enviando el token en la cabecera (Header)
        const response = await axios.get('http://localhost:3000/api/superadmin/solicitudes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // 3. Guardamos los datos reales en el estado
        setSolicitudes(response.data);
      } catch (err) {
        console.error('Error al cargar solicitudes:', err);
        setError('Hubo un problema al cargar los datos del servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);
const handleProcesar = async (id, accion) => {
    try {
      const token = localStorage.getItem('token');
      // Llamamos al backend
      await axios.put(`http://localhost:3000/api/superadmin/solicitudes/${id}`, 
        { accion }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Si todo va bien, quitamos esa solicitud de la pantalla al instante
      setSolicitudes(solicitudes.filter(sol => sol.id !== id));
      alert(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} con éxito.`);
      
    } catch (err) {
      console.error(err);
      alert('Error al procesar la solicitud');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      
      {/* ==========================================
          SIDEBAR (Menú Lateral Oscuro)
      ========================================== */}  
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-yellow-500 mb-1">👑 SuperAdmin</h2>
          <p className="text-xs text-gray-400">Panel de Control Global</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            📊 Métricas (KPIs)
          </button>
          
          <button 
            onClick={() => setActiveTab('solicitudes')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === 'solicitudes' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            <span>📝 Solicitudes</span>
            {solicitudes.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {solicitudes.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('moderacion')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'moderacion' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            ⚖️ Moderación Foro
          </button>

          <button 
            onClick={() => setActiveTab('entidades')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'entidades' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          >
            🏢 Protectoras / Colonias
          </button>
        </nav>
      </aside>

      {/* ==========================================
          ÁREA DE CONTENIDO PRINCIPAL
      ========================================== */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* PESTAÑA: SOLICITUDES */}
        {activeTab === 'solicitudes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Aprobación de Roles</h1>
              <p className="text-gray-500">Revisa quién quiere ser Admin o Gestor</p>
            </div>

            {/* Mostramos si hay un error de conexión */}
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol Solicitado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Justificación</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-6 text-gray-500 font-medium">Cargando solicitudes...</td></tr>
                  ) : solicitudes.length === 0 ? (
                     <tr><td colSpan="4" className="text-center py-8 text-gray-500">No hay solicitudes pendientes. ¡Todo al día!</td></tr>
                  ) : (
                    solicitudes.map((sol) => (
                      <tr key={sol.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{sol.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${sol.rol_solicitado === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                            {sol.rol_solicitado.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={sol.mensaje}>
                          {sol.mensaje}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                         <button 
                        onClick={() => handleProcesar(sol.id, 'aprobar')}
                       className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                      >
                      Aprobar
                     </button>
                    <button 
                      onClick={() => handleProcesar(sol.id, 'rechazar')}
                      className="bg-white text-red-600 border border-red-300 px-4 py-2 rounded shadow-sm hover:bg-red-50 transition"
                    >
                      Rechazar
                    </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Métricas Globales</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-bold uppercase">Usuarios Totales</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-bold uppercase">Protectoras Activas</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                <h3 className="text-gray-500 text-sm font-bold uppercase">Colonias Activas</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
              </div>
            </div>
          </div>
        )}

        {/* Otras pestañas en construcción */}
        {(activeTab === 'moderacion' || activeTab === 'entidades') && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-6xl mb-4">🚧</span>
            <h2 className="text-xl font-bold">Módulo en construcción</h2>
            <p>Se conectará con la base de datos en los próximos Sprints.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default SuperAdminDashboard;