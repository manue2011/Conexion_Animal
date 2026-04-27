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
  const [filtroEntidad, setFiltroEntidad] = useState('protectoras');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [entidades, setEntidades] = useState({ protectoras: [], colonias: [] });
  const [vinculoModo, setVinculoModo] = useState('nueva');
  const [entidadIdSeleccionada, setEntidadIdSeleccionada] = useState('');
  const [nombreNuevaEntidad, setNombreNuevaEntidad] = useState('');
  const [staff, setStaff] = useState([]);
  const [nuevoAdminEmail, setNuevoAdminEmail] = useState('');
  const [usuariosList, setUsuariosList] = useState([]);
  const [searchUsuario, setSearchUsuario] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [resSolicitudes, resEntidades, resMaestro, resStaff] = await Promise.all([
          axios.get(`${API_URL}/api/superadmin/solicitudes`, config),
          axios.get(`${API_URL}/api/superadmin/entidades-existentes`, config),
          axios.get(`${API_URL}/api/superadmin/entidades-maestro`, config),
          axios.get(`${API_URL}/api/superadmin/staff`, config),
        ]);

        setSolicitudes(resSolicitudes.data);
        setEntidades(resEntidades.data);
        setListadoMaestro(resMaestro.data);
        setStaff(resStaff.data);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Hubo un problema al cargar los datos del servidor.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const resUsuarios = await axios.get(`${API_URL}/api/superadmin/usuarios`, config);
        setUsuariosList(resUsuarios.data);
      } catch (err) {
        console.warn('Ruta /usuarios no disponible aún:', err.message);
      }
    };

    fetchDatos();
    fetchUsuarios();
  }, []);

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

  const abrirModalAprobar = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setNombreNuevaEntidad(solicitud.entidad_solicitada || '');
    setVinculoModo('nueva');
    setShowModal(true);
  };

  const confirmarAprobacion = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        accion: 'aprobar',
        vinculoModo,
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
      const nuevaLista = listadoMaestro[editData.tipo].map(item =>
        item.id === editData.id ? res.data.data : item
      );
      setListadoMaestro({ ...listadoMaestro, [editData.tipo]: nuevaLista });
      setShowEditModal(false);
      alert('¡Cambios guardados!');
    } catch (err) {
      alert('Error al guardar cambios');
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
      alert('¡Nuevo SuperAdmin dado de alta!');
      setNuevoAdminEmail('');
      const res = await axios.get(`${API_URL}/api/superadmin/staff`, { headers: { Authorization: `Bearer ${token}` } });
      setStaff(res.data);
    } catch (err) {
      alert('El usuario no existe o ya es admin.');
    }
  };

  const toggleBanUsuario = async (userId, currentStatus) => {
    const accion = currentStatus === 'archivado' ? 'reactivar' : 'archivar';
    if (!window.confirm(`¿Estás seguro de que quieres ${accion} a este usuario?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/superadmin/usuarios/${userId}/ban`,
        { estado: currentStatus === 'archivado' ? 'activo' : 'archivado' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsuariosList(usuariosList.map(u =>
        u.id === userId ? { ...u, estado: currentStatus === 'archivado' ? 'activo' : 'archivado' } : u 
      ));

      alert(`Usuario ${accion}do correctamente.`);
    } catch (err) {
      console.error(err);
      alert(`Error al ${accion} al usuario.`);
    }
  };

  const usuariosFiltrados = usuariosList.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(searchUsuario.toLowerCase());
    const matchRol = filtroRol === 'todos' || u.role === filtroRol;
    return matchSearch && matchRol;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full overflow-x-hidden">

      {/* MODAL: APROBAR */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aprobar Usuario</h2>
            <p className="text-gray-600 mb-6">
              Vas a ascender a <span className="font-bold text-blue-600">{selectedSolicitud.email}</span> como <span className="uppercase font-bold">{selectedSolicitud.rol_solicitado}</span>.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <button onClick={() => setVinculoModo('nueva')} className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${vinculoModo === 'nueva' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Crear Nueva Entidad</button>
                <button onClick={() => setVinculoModo('existente')} className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${vinculoModo === 'existente' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Vincular a Existente</button>
              </div>
              {vinculoModo === 'nueva' ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-bold text-blue-900 mb-1">Nombre de la nueva {selectedSolicitud.rol_solicitado === 'admin' ? 'Protectora' : 'Colonia'}</label>
                  <input type="text" value={nombreNuevaEntidad} onChange={(e) => setNombreNuevaEntidad(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                  <p className="text-xs text-blue-600 mt-2">ℹ️ Se creará automáticamente en la base de datos.</p>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Selecciona una {selectedSolicitud.rol_solicitado === 'admin' ? 'Protectora' : 'Colonia'} existente</label>
                  <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white" value={entidadIdSeleccionada} onChange={(e) => setEntidadIdSeleccionada(e.target.value)}>
                    <option value="">-- Selecciona una opción --</option>
                    {selectedSolicitud.rol_solicitado === 'admin'
                      ? entidades.protectoras.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)
                      : entidades.colonias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)
                    }
                  </select>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold transition">Cancelar</button>
              <button onClick={confirmarAprobacion} disabled={vinculoModo === 'existente' && !entidadIdSeleccionada} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow transition disabled:bg-gray-400">Confirmar y Ascender</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar {editData.tipo === 'protectoras' ? 'Protectora' : 'Colonia'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <input type="text" className="w-full p-2 border rounded-lg" value={editData.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })} />
              </div>
              {editData.tipo === 'colonias' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Postal</label>
                  <input type="text" className="w-full p-2 border rounded-lg" value={editData.codigo_postal || ''} onChange={(e) => setEditData({ ...editData, codigo_postal: e.target.value })} />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                <select className="w-full p-2 border rounded-lg bg-white" value={editData.estado} onChange={(e) => setEditData({ ...editData, estado: e.target.value })}>
                  <option value="activo">Activo</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-400 font-bold">Cancelar</button>
              <button onClick={confirmarEdicion} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 md:min-h-screen bg-gray-900 text-white flex flex-col shadow-2xl z-10 shrink-0 md:sticky md:top-0">
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
          <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === 'usuarios' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>
            <span>👥 Usuarios</span>
          </button>
          <button onClick={() => setActiveTab('moderacion')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'moderacion' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>⚖️ Moderación Foro</button>
          <button onClick={() => setActiveTab('entidades')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'entidades' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>🏢 Protectoras / Colonias</button>
          <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center px-4 py-3 rounded-lg transition ${activeTab === 'staff' ? 'bg-red-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`}>🔑 Gestión Staff</button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full p-4 md:p-8 bg-gray-100 min-w-0">

        {/* PESTAÑA: SOLICITUDES */}
        {activeTab === 'solicitudes' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Aprobación de Roles</h1>
              <p className="text-gray-500 mt-1">Revisa y valida las peticiones de nuevas entidades</p>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200">{error}</div>}

            <div className="hidden md:block bg-white shadow-lg rounded-xl border border-gray-100 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Usuario / Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Entidad / Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mensaje</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-10 text-gray-500 animate-pulse">Cargando solicitudes...</td></tr>
                  ) : solicitudes.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-12"><span className="text-4xl block mb-3">✨</span><p className="text-gray-500">No hay solicitudes pendientes. ¡Todo al día!</p></td></tr>
                  ) : (
                    solicitudes.map((sol) => (
                      <tr key={sol.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{sol.email}</div>
                          <div className="text-sm text-gray-500 mt-1">📞 {sol.telefono || <span className="text-red-400 italic">Sin teléfono</span>}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-800 mb-1">{sol.entidad_solicitada || 'Entidad no especificada'}</div>
                          <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${sol.rol_solicitado === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {sol.rol_solicitado === 'admin' ? 'PROTECTORA' : 'GESTOR COLONIA'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs"><p className="line-clamp-2">{sol.mensaje}</p></td>
                        <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                          <button onClick={() => abrirModalAprobar(sol)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">✅ Aprobar</button>
                          <button onClick={() => handleRechazar(sol.id)} className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition">❌ Rechazar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {loading ? (
                <div className="text-center py-10 text-gray-500 animate-pulse">Cargando solicitudes...</div>
              ) : solicitudes.length === 0 ? (
                <div className="text-center bg-white rounded-xl shadow p-8">
                  <span className="text-4xl block mb-3">✨</span>
                  <p className="text-gray-500">No hay solicitudes pendientes. ¡Todo al día!</p>
                </div>
              ) : (
                solicitudes.map((sol) => (
                  <div key={sol.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100 space-y-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{sol.email}</p>
                      <p className="text-gray-500 text-xs mt-1">📞 {sol.telefono || 'Sin teléfono'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-800 text-sm">{sol.entidad_solicitada || 'Entidad no especificada'}</p>
                      <span className={`mt-1 px-2 py-1 inline-flex text-xs font-bold rounded-full ${sol.rol_solicitado === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {sol.rol_solicitado === 'admin' ? 'PROTECTORA' : 'GESTOR COLONIA'}
                      </span>
                    </div>
                    {sol.mensaje && <p className="text-gray-600 text-xs line-clamp-3">{sol.mensaje}</p>}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => abrirModalAprobar(sol)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">✅ Aprobar</button>
                      <button onClick={() => handleRechazar(sol.id)} className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition">❌ Rechazar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: MÉTRICAS */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <MetricasPage />
          </div>
        )}

        {/* PESTAÑA: MODERACIÓN */}
        {activeTab === 'moderacion' && (
          <div className="animate-fade-in">
            <ModeracionTablonPage />
          </div>
        )}

        {/* PESTAÑA: ENTIDADES */}
        {activeTab === 'entidades' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Entidades</h1>
              <div className="bg-gray-200 p-1 rounded-lg flex self-start">
                <button onClick={() => setFiltroEntidad('protectoras')} className={`px-3 py-2 rounded-md font-bold text-sm transition ${filtroEntidad === 'protectoras' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>🏢 Protectoras</button>
                <button onClick={() => setFiltroEntidad('colonias')} className={`px-3 py-2 rounded-md font-bold text-sm transition ${filtroEntidad === 'colonias' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>🐱 Colonias</button>
              </div>
            </div>

            <div className="hidden md:block bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{filtroEntidad === 'protectoras' ? 'Admins Responsables' : 'Gestor Principal'}</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(listadoMaestro[filtroEntidad] || []).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{item.nombre}</div>
                        <div className="text-xs text-gray-400">{item.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {filtroEntidad === 'protectoras' ? `👥 ${item.total_admins} administradores` : `📧 ${item.gestor_email}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.estado.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => abrirModalEdicion(item)} className="text-blue-600 hover:text-blue-900 font-bold text-sm bg-blue-50 px-3 py-1 rounded-md">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {(listadoMaestro[filtroEntidad] || []).length === 0 ? (
                <div className="text-center bg-white rounded-xl shadow p-8">
                  <p className="text-gray-500">No hay {filtroEntidad} registradas.</p>
                </div>
              ) : (
                (listadoMaestro[filtroEntidad] || []).map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100 space-y-2">
                    <div>
                      <p className="font-bold text-gray-800">{item.nombre}</p>
                      <p className="text-xs text-gray-400">{item.id.substring(0, 8)}...</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {filtroEntidad === 'protectoras' ? `👥 ${item.total_admins} administradores` : `📧 ${item.gestor_email}`}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.estado.toUpperCase()}</span>
                      <button onClick={() => abrirModalEdicion(item)} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-md">Editar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* NUEVA PESTAÑA: GESTIÓN DE USUARIOS (BANEOS) */}
        {activeTab === 'usuarios' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Control de Usuarios</h1>
                <p className="text-gray-500 mt-1">Busca, revisa y aplica suspensiones (baneos) a cuentas de la plataforma.</p>
              </div>
            </div>

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="🔍 Buscar por email..." 
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchUsuario}
                onChange={(e) => setSearchUsuario(e.target.value)}
              />
              <select 
                className="p-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="todos">Todos los roles</option>
                <option value="user">Solo Usuarios</option>
                <option value="admin">Solo Protectoras</option>
                <option value="gestor">Solo Colonias</option>
              </select>
            </div>

            {/* TABLA DE USUARIOS — solo desktop */}
            <div className="hidden md:block bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email / Registro</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acción de Baneo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">No se encontraron usuarios con ese filtro.</td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((u) => (
                      <tr key={u.id} className={`transition ${u.estado === 'archivado' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className={`font-bold ${u.estado === 'archivado' ? 'text-red-700 line-through' : 'text-gray-800'}`}>{u.email}</div>
                          <div className="text-xs text-gray-400">Creado: {new Date(u.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase 
                            ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                              u.role === 'gestor' ? 'bg-green-100 text-green-800' : 
                              u.role === 'superadmin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.estado === 'archivado' ? (
                            <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded-full flex w-max items-center gap-1">⛔ Archivado</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex w-max items-center gap-1">✅ Activo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.role === 'superadmin' ? (
                            <span className="text-xs text-gray-400 italic">Inmune</span>
                          ) : u.estado === 'archivado' ? (
                            <button 
                              onClick={() => toggleBanUsuario(u.id, u.estado)} 
                              className="text-green-600 hover:bg-green-100 font-bold text-sm bg-white border border-green-200 px-3 py-1.5 rounded-lg transition"
                            >
                              Reactivar Cuenta
                            </button>
                          ) : (
                            <button 
                              onClick={() => toggleBanUsuario(u.id, u.estado)} 
                              className="text-red-600 hover:bg-red-600 hover:text-white font-bold text-sm bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition"
                            >
                              Archivar Usuario
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* TARJETAS DE USUARIOS — solo móvil */}
            <div className="md:hidden space-y-4">
              {usuariosFiltrados.length === 0 ? (
                <div className="text-center bg-white rounded-xl shadow p-8">
                  <p className="text-gray-500">No se encontraron usuarios con ese filtro.</p>
                </div>
              ) : (
                usuariosFiltrados.map((u) => (
                  <div key={u.id} className={`bg-white rounded-xl shadow-md p-4 border border-gray-100 space-y-3 ${u.estado === 'archivado' ? 'bg-red-50' : ''}`}>
                    <div>
                      <p className={`font-bold text-sm ${u.estado === 'archivado' ? 'text-red-700 line-through' : 'text-gray-800'}`}>{u.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Creado: {new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase 
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          u.role === 'gestor' ? 'bg-green-100 text-green-800' : 
                          u.role === 'superadmin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                      {u.estado === 'archivado' ? (
                        <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded-full">⛔ Archivado</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">✅ Activo</span>
                      )}
                    </div>
                    <div className="pt-2">
                      {u.role === 'superadmin' ? (
                        <span className="text-xs text-gray-400 italic block text-center">Cuenta Inmune</span>
                      ) : u.estado === 'archivado' ? (
                        <button onClick={() => toggleBanUsuario(u.id, u.estado)} className="w-full text-green-600 hover:bg-green-100 font-bold text-sm bg-white border border-green-200 px-3 py-2 rounded-lg transition">Reactivar Cuenta</button>
                      ) : (
                        <button onClick={() => toggleBanUsuario(u.id, u.estado)} className="w-full text-red-600 hover:bg-red-600 hover:text-white font-bold text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg transition">Archivar Usuario</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: STAFF */}
        {activeTab === 'staff' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Gestión de Staff</h1>
            <p className="text-gray-500 mb-8">Control de accesos de nivel crítico para la plataforma.</p>

            <div className="bg-white p-6 rounded-xl shadow-md border border-red-100 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Dar de alta nuevo SuperAdmin</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Email del usuario a promover..."
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  value={nuevoAdminEmail}
                  onChange={(e) => setNuevoAdminEmail(e.target.value)}
                />
                <button onClick={handlePromoverAdmin} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg">Asignar Poderes</button>
              </div>
              <p className="text-xs text-red-500 mt-3 font-medium">⚠️ Atención: asegúrese de que el usuario sea confiable antes de asignarle poderes de SuperAdmin.</p>
            </div>

            <div className="hidden md:block bg-white shadow-xl rounded-xl overflow-hidden">
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

            <div className="md:hidden space-y-3">
              {staff.map(admin => (
                <div key={admin.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">{admin.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(admin.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black shrink-0">SUPERUSER</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;