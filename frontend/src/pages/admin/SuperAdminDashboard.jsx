import { useState, useEffect } from 'react';
import axios from 'axios';
import ModeracionTablonPage from './ModeracionTablonPage';
import MetricasPage from '../MetricasPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listadoMaestro, setListadoMaestro] = useState({ protectoras: [], colonias: [] });
  const [filtroEntidad, setFiltroEntidad] = useState('protectoras'); // Para alternar la vista
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null); // Aquí guardaremos lo que estamos editando

  // --- ESTADOS NUEVOS PARA EL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [entidades, setEntidades] = useState({ protectoras: [], colonias: [] });
  
  // Opciones del formulario del modal
  const [vinculoModo, setVinculoModo] = useState('nueva'); // 'nueva' o 'existente'
  const [entidadIdSeleccionada, setEntidadIdSeleccionada] = useState('');
  const [nombreNuevaEntidad, setNombreNuevaEntidad] = useState('');
  const [staff, setStaff] = useState([]);
  const [nuevoAdminEmail, setNuevoAdminEmail] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 1. Pedimos las solicitudes pendientes
        const resSolicitudes = await axios.get(`${API_URL}/api/superadmin/solicitudes`, config);
        setSolicitudes(resSolicitudes.data);

        // 2. Pedimos las entidades que ya existen
        const resEntidades = await axios.get(`${API_URL}/api/superadmin/entidades-existentes`, config);
        setEntidades(resEntidades.data);
        
        const resMaestro = await axios.get(`${API_URL}/api/superadmin/entidades-maestro`, config);
        setListadoMaestro(resMaestro.data);
        
        const resStaff = await axios.get(`${API_URL}/api/superadmin/staff`, config);
        setStaff(resStaff.data);
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
      await axios.put(`${API_URL}/api/superadmin/solicitudes/${id}`, 
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

      await axios.put(`${API_URL}/api/superadmin/solicitudes/${selectedSolicitud.id}`, 
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

  const abrirModalEdicion = (entidad) => {
    setEditData({ ...entidad, tipo: filtroEntidad }); 
    setShowEditModal(true);
  };

  const confirmarEdicion = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/api/superadmin/entidades/${editData.tipo}/${editData.id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Esto actualiza la tabla visualmente sin recargar
      const nuevaLista = listadoMaestro[editData.tipo].map(item => 
        item.id === editData.id ? res.data.data : item
      );
      
      setListadoMaestro({ ...listadoMaestro, [editData.tipo]: nuevaLista });
      setShowEditModal(false);
      alert("¡Cambios guardados!");
    } catch (err) {
      alert("Error al guardar cambios");
    }
  };

  const handlePromoverAdmin = async () => {
    if (!window.confirm(`¿Estás seguro de darle poder total a ${nuevoAdminEmail}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/superadmin/staff/asignar`, 
        { email: nuevoAdminEmail.toLowerCase().trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("¡Nuevo SuperAdmin dado de alta!");
      setNuevoAdminEmail('');
      // Recargar lista
      const res = await axios.get(`${API_URL}/api/superadmin/staff`, { headers: { Authorization: `Bearer ${token}` } });
      setStaff(res.data);
    } catch (err) {
      alert("El usuario no existe o ya es admin.");
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
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar {editData.tipo === 'protectoras' ? 'Protectora' : 'Colonia'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <input 
                  type="text" className="w-full p-2 border rounded-lg"
                  value={editData.nombre}
                  onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                />
              </div>

              {editData.tipo === 'colonias' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Postal</label>
                  <input 
                    type="text" className="w-full p-2 border rounded-lg"
                    value={editData.codigo_postal || ''}
                    onChange={(e) => setEditData({...editData, codigo_postal: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                <select 
                  className="w-full p-2 border rounded-lg bg-white"
                  value={editData.estado}
                  onChange={(e) => setEditData({...editData, estado: e.target.value})}
                >
                  <option value="activo">Activo</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-400 font-bold">Cancelar</button>
              <button 
                onClick={confirmarEdicion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}  
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 text-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-yellow-500 mb-1">👑 SuperAdmin</h2>
          <p className="text-xs text-gray-400">Panel de Control Global</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>📊 Métricas (KPIs)</button>
          <button onClick={() => setActiveTab('solicitudes')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === 'solicitudes' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <span>📝 Solicitudes</span>
            {solicitudes.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">{solicitudes.length}</span>}
          </button>
          <button onClick={() => setActiveTab('moderacion')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'moderacion' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>⚖️ Moderación Foro</button>
          <button onClick={() => setActiveTab('entidades')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'entidades' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>🏢 Protectoras / Colonias</button>
          <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center px-4 py-3 rounded-lg transition ${activeTab === 'staff' ? 'bg-red-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>🔑 Gestión Staff</button>
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

        {/* PESTAÑA: DASHBOARD (MÉTRICAS) */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <MetricasPage /> 
          </div>
        )}

        {/* PESTAÑA: MODERACIÓN DEL TABLÓN */}
        {activeTab === 'moderacion' && (
          <div className="animate-fade-in">
            <ModeracionTablonPage />
          </div>
        )}

        {/* PESTAÑA: ENTIDADES */}
        {activeTab === 'entidades' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Entidades</h1>
              {/* Selector de tipo */}
              <div className="bg-gray-200 p-1 rounded-lg flex">
                <button 
                  onClick={() => setFiltroEntidad('protectoras')}
                  className={`px-4 py-2 rounded-md font-bold transition ${filtroEntidad === 'protectoras' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >🏢 Protectoras</button>
                <button 
                  onClick={() => setFiltroEntidad('colonias')}
                  className={`px-4 py-2 rounded-md font-bold transition ${filtroEntidad === 'colonias' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
                >🐱 Colonias</button>
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      {filtroEntidad === 'protectoras' ? 'Admins Responsables' : 'Gestor Principal'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(listadoMaestro[filtroEntidad] || []).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{item.nombre}</div>
                        <div className="text-xs text-gray-400">{item.id.substring(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {filtroEntidad === 'protectoras' 
                          ? `👥 ${item.total_admins} administradores` 
                          : `📧 ${item.gestor_email}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {item.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => abrirModalEdicion(item)}
                          className="text-blue-600 hover:text-blue-900 font-bold text-sm bg-blue-50 px-3 py-1 rounded-md"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: STAFF */}
        {activeTab === 'staff' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Staff</h1>
            <p className="text-gray-500 mb-8">Control de accesos de nivel crítico para la plataforma.</p>

            {/* Formulario de Alta */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-red-100 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Dar de alta nuevo SuperAdmin</h3>
              <div className="flex gap-4">
                <input 
                  type="email" 
                  placeholder="Email del usuario a promover..."
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  value={nuevoAdminEmail}
                  onChange={(e) => setNuevoAdminEmail(e.target.value)}
                />
                <button 
                  onClick={handlePromoverAdmin}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg"
                >
                  Asignar Poderes
                </button>
              </div>
              <p className="text-xs text-red-500 mt-3 font-medium">⚠️ Atención: asegurese de que el usuario sea confiable antes de asignarle poderes de SuperAdmin.</p>
            </div>

            {/* Tabla de Staff Actual */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Admin Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Fecha Alta</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Rango</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map(admin => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 font-bold text-gray-700">{admin.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(admin.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">SUPERUSER</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;