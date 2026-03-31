import { useState, useEffect } from 'react';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- ESTADOS NUEVOS PARA EL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [entidades, setEntidades] = useState({ protectoras: [], colonias: [] });
  
  // Opciones del formulario del modal
  const [vinculoModo, setVinculoModo] = useState('nueva'); // 'nueva' o 'existente'
  const [entidadIdSeleccionada, setEntidadIdSeleccionada] = useState('');
  const [nombreNuevaEntidad, setNombreNuevaEntidad] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 1. Pedimos las solicitudes pendientes
        const resSolicitudes = await axios.get('http://localhost:3000/api/superadmin/solicitudes', config);
        setSolicitudes(resSolicitudes.data);

        // 2. Pedimos las entidades que ya existen (La ruta que acabamos de crear)
        const resEntidades = await axios.get('http://localhost:3000/api/superadmin/entidades-existentes', config);
        setEntidades(resEntidades.data);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Hubo un problema al cargar los datos del servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  // Función para RECHAZAR (Directo, sin modal)
  const handleRechazar = async (id) => {
    if (!window.confirm('¿Seguro que quieres rechazar esta solicitud?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/superadmin/solicitudes/${id}`, 
        { accion: 'rechazar' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSolicitudes(solicitudes.filter(sol => sol.id !== id));
    } catch (err) {
      alert('Error al rechazar la solicitud');
    }
  };

  // Función para abrir el MODAL de APROBAR
  const abrirModalAprobar = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setNombreNuevaEntidad(solicitud.entidad_solicitada || ''); // Autocompleta lo que escribió
    setVinculoModo('nueva');
    setShowModal(true);
  };

  // Función para ENVIAR la aprobación desde el Modal
  const confirmarAprobacion = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Enviamos toda la info de cómo queremos vincularlo
      const payload = {
        accion: 'aprobar',
        vinculoModo: vinculoModo,
        entidadId: entidadIdSeleccionada,
        entidadNombre: nombreNuevaEntidad
      };

      await axios.put(`http://localhost:3000/api/superadmin/solicitudes/${selectedSolicitud.id}`, 
        payload, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSolicitudes(solicitudes.filter(sol => sol.id !== selectedSolicitud.id));
      setShowModal(false);
      alert('¡Usuario aprobado y vinculado con éxito!');
      
    } catch (err) {
      console.error(err);
      alert('Error al aprobar la solicitud');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      
      {/* --- MODAL FLOTANTE DE APROBACIÓN --- */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aprobar Usuario</h2>
            <p className="text-gray-600 mb-6">
              Vas a ascender a <span className="font-bold text-blue-600">{selectedSolicitud.email}</span> como <span className="uppercase font-bold">{selectedSolicitud.rol_solicitado}</span>.
            </p>

            <div className="space-y-4">
              {/* Opciones: Nueva o Existente */}
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setVinculoModo('nueva')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${vinculoModo === 'nueva' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Crear Nueva Entidad
                </button>
                <button 
                  onClick={() => setVinculoModo('existente')}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${vinculoModo === 'existente' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Vincular a Existente
                </button>
              </div>

              {/* Formulario Dinámico */}
              {vinculoModo === 'nueva' ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-bold text-blue-900 mb-1">Nombre de la nueva {selectedSolicitud.rol_solicitado === 'admin' ? 'Protectora' : 'Colonia'}</label>
                  <input 
                    type="text" 
                    value={nombreNuevaEntidad}
                    onChange={(e) => setNombreNuevaEntidad(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-2">ℹ️ Se creará automáticamente en la base de datos.</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Selecciona una {selectedSolicitud.rol_solicitado === 'admin' ? 'Protectora' : 'Colonia'} existente</label>
                  <select 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                    value={entidadIdSeleccionada}
                    onChange={(e) => setEntidadIdSeleccionada(e.target.value)}
                  >
                    <option value="">-- Selecciona una opción --</option>
                    {selectedSolicitud.rol_solicitado === 'admin' 
                      ? entidades.protectoras.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)
                      : entidades.colonias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)
                    }
                  </select>
                </div>
              )}
            </div>

            {/* Botones de acción del Modal */}
            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold transition"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarAprobacion}
                disabled={vinculoModo === 'existente' && !entidadIdSeleccionada} // Bloquea si no elige nada
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow transition disabled:bg-gray-400"
              >
                Confirmar y Ascender
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- FIN DEL MODAL --- */}


      {/* SIDEBAR */}  
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 text-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-yellow-500 mb-1">👑 SuperAdmin</h2>
          <p className="text-xs text-gray-400">Panel de Control Global</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* ... (Tus botones de navegación del Sidebar se quedan igual) ... */}
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>📊 Métricas (KPIs)</button>
          <button onClick={() => setActiveTab('solicitudes')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === 'solicitudes' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <span>📝 Solicitudes</span>
            {solicitudes.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">{solicitudes.length}</span>}
          </button>
          <button onClick={() => setActiveTab('moderacion')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'moderacion' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>⚖️ Moderación Foro</button>
          <button onClick={() => setActiveTab('entidades')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'entidades' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>🏢 Protectoras / Colonias</button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* PESTAÑA: SOLICITUDES */}
        {activeTab === 'solicitudes' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Aprobación de Roles</h1>
                <p className="text-gray-500 mt-1">Revisa y valida las peticiones de nuevas entidades</p>
              </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200">{error}</div>}

            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario / Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entidad / Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mensaje</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium animate-pulse">Cargando solicitudes...</td></tr>
                  ) : solicitudes.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-12"><span className="text-4xl block mb-3">✨</span><p className="text-gray-500 font-medium">No hay solicitudes pendientes. ¡Todo al día!</p></td></tr>
                  ) : (
                    solicitudes.map((sol) => (
                      <tr key={sol.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{sol.email}</div>
                          <div className="text-sm text-gray-500 mt-1">📞 {sol.telefono || <span className="text-red-400 italic">Sin teléfono</span>}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-800 mb-1">{sol.entidad_solicitada || 'Entidad no especificada'}</div>
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${sol.rol_solicitado === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                            {sol.rol_solicitado === 'admin' ? 'PROTECTORA' : 'GESTOR COLONIA'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs"><p className="line-clamp-2" title={sol.mensaje}>{sol.mensaje}</p></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                          {/* --- AQUI CAMBIA EL BOTON APROBAR --- */}
                          <button 
                            onClick={() => abrirModalAprobar(sol)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
                          >
                            ✅ Aprobar
                          </button>
                          <button 
                            onClick={() => handleRechazar(sol.id)}
                            className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg shadow-sm hover:bg-red-50 transition"
                          >
                            ❌ Rechazar
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

        {/* PESTAÑA: DASHBOARD Y DEMÁS */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Métricas Globales</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Usuarios Totales</h3>
                <p className="text-4xl font-black text-gray-800 mt-2">--</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Protectoras Activas</h3>
                <p className="text-4xl font-black text-gray-800 mt-2">--</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Colonias Activas</h3>
                <p className="text-4xl font-black text-gray-800 mt-2">--</p>
              </div>
            </div>
          </div>
        )}
        {(activeTab === 'moderacion' || activeTab === 'entidades') && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400 animate-fade-in">
            <span className="text-6xl mb-4">🚧</span>
            <h2 className="text-2xl font-bold text-gray-600">Módulo en construcción</h2>
            <p className="mt-2">Se conectará con la base de datos en los próximos Sprints.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default SuperAdminDashboard;