import { useState, useEffect } from 'react';
import axios from 'axios';
import SubscriptionStatus from '../../components/SubscriptionStatus';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ColoniaDashboard = () => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('animales');
  const [coloniaInfo, setColoniaInfo] = useState(null);
  
  // NUEVO: Estado para el filtro de fecha
  const [filtroFecha, setFiltroFecha] = useState('desc');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [perfilForm, setPerfilForm] = useState({ descripcion: '', direccion: '', codigo_postal: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', especie: 'Gato', edad: '', urgent: false, descripcion: '' });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isSubmittingNeed, setIsSubmittingNeed] = useState(false);
  const [needForm, setNeedForm] = useState({ titulo: '', categoria: 'comida', descripcion: '', prioridad: 'normal' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cargar datos de la colonia (solo una vez)
  const fetchColoniaInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const resColonia = await axios.get(`${API_URL}/api/usuarios/mi-colonia`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColoniaInfo(resColonia.data);
      setPerfilForm({
        descripcion: resColonia.data.descripcion || '',
        direccion: resColonia.data.direccion || '',
        codigo_postal: resColonia.data.codigo_postal || ''
      });
    } catch (err) {
      console.error('Error cargando colonia:', err);
    }
  };

  // Cargar animales (Se ejecuta al inicio y cuando cambia el filtro de fecha)
  const fetchAnimales = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Pasamos el orden y ponemos un límite alto para ver todos los gatos
      const params = new URLSearchParams({ order: filtroFecha, limit: 100 }); 
      
      const resAnimales = await axios.get(`${API_URL}/api/animales?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // SOLUCIÓN AL PANTALLAZO BLANCO (e.map is not a function)
      const data = resAnimales.data.animales || [];
      setAnimales(data);
      
    } catch (err) {
      setError('Error al cargar los animales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColoniaInfo();
  }, []);

  useEffect(() => {
    fetchAnimales();
  }, [filtroFecha]); // Se recarga automáticamente al cambiar el filtro

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/usuarios/colonia/${coloniaInfo.id}`, perfilForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsProfileModalOpen(false);
      fetchColoniaInfo();
      alert('¡Perfil de colonia actualizado!');
    } catch (err) {
      alert('Error al actualizar el perfil.');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => { setFile(e.target.files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('especie', formData.especie); // Siempre será 'Gato'
      data.append('edad', formData.edad);
      data.append('urgent', formData.urgent);
      data.append('descripcion', formData.descripcion);
      data.append('colonia_id', coloniaInfo.id);
      if (file) data.append('foto_url', file);
      
      await axios.post(`${API_URL}/api/animales`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchAnimales(); // Recargamos la lista
      setIsModalOpen(false);
      setFormData({ nombre: '', especie: 'Gato', edad: '', urgent: false, descripcion: '' });
      setFile(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres archivar este registro?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/animales/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAnimales(); // Recargamos para asegurar el orden
    } catch (err) {
      alert('No se pudo eliminar el animal.');
    }
  };

  const handleSubmitNeed = async (e) => {
    e.preventDefault();
    if (isSubmittingNeed) return;
    setIsSubmittingNeed(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/necesidades`, { ...needForm, colonia_id: coloniaInfo.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(needForm.prioridad === 'urgente' ? '¡Alerta enviada a los voluntarios!' : 'Petición publicada correctamente.');
      setIsNeedModalOpen(false);
      setNeedForm({ titulo: '', categoria: 'comida', descripcion: '', prioridad: 'normal' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error al publicar la petición.');
    } finally {
      setIsSubmittingNeed(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full overflow-x-hidden">

      {/* BOTÓN HAMBURGUESA — solo móvil */}
      <div className="md:hidden flex items-center justify-between bg-blue-900 text-white px-4 py-3">
        <h2 className="text-lg font-bold">🐾 {coloniaInfo?.nombre || 'Mi Colonia'}</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl focus:outline-none">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:flex md:flex-col w-full md:w-64 md:min-h-screen bg-blue-900 text-white shadow-xl shrink-0 md:sticky md:top-0`}>
        <div className="p-6 border-b border-blue-800 text-center hidden md:block">
          <h2 className="text-xl font-bold">🐾 {coloniaInfo?.nombre || 'Mi Colonia'}</h2>
          <p className="text-xs text-blue-300 mt-1">Gestor de Comunidad</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setActiveView('animales'); setSidebarOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeView === 'animales' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >🐱 Mis Animales</button>

          <button
            onClick={() => { setIsProfileModalOpen(true); setSidebarOpen(false); }}
            className="w-full text-left px-4 py-3 hover:bg-blue-800 rounded-lg transition"
          >⚙️ Configurar Colonia</button>

          <button
            onClick={() => { setActiveView('plan'); setSidebarOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeView === 'plan' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >💳 Mi Plan</button>

          <button
            disabled={!coloniaInfo?.direccion}
            onClick={() => { setIsNeedModalOpen(true); setSidebarOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold mt-4 transition shadow-md flex justify-between items-center ${!coloniaInfo?.direccion ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          ><span>🚨 Pedir Ayuda</span></button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 w-full min-w-0">

        {/* VISTA: MI PLAN */}
        {activeView === 'plan' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Suscripción</h1>
            <SubscriptionStatus />
          </div>
        )}

        {/* VISTA: CENSO DE ANIMALES */}
        {activeView === 'animales' && (
          <div className="animate-fade-in">

            {/* AVISO PERFIL INCOMPLETO */}
            {coloniaInfo && (!coloniaInfo.direccion || !coloniaInfo.descripcion || !coloniaInfo.codigo_postal) && (
              <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 rounded-r-lg shadow-md">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <p className="font-bold text-orange-800">¡Perfil incompleto!</p>
                    <p className="text-sm text-orange-700">Debes configurar la ubicación y descripción antes de añadir animales.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm self-start sm:self-auto"
                >Completar ahora</button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Censo de la Colonia</h1>
                <p className="text-gray-600">Gestiona los gatos de tu zona</p>
              </div>
              
              {/* FILTRO DE FECHA Y BOTÓN AÑADIR */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={filtroFecha} 
                  onChange={e => setFiltroFecha(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                >
                  <option value="desc">⏱️ Más recientes</option>
                  <option value="asc">⏳ Más antiguos</option>
                </select>

                <button
                  disabled={!coloniaInfo?.direccion}
                  onClick={() => setIsModalOpen(true)}
                  className={`font-bold py-2 px-6 rounded-lg shadow-lg transition ${!coloniaInfo?.direccion ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >+ Añadir Gato</button>
              </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64 w-full" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {animales.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    <p className="text-5xl mb-4">🐱</p>
                    <p className="font-medium">No hay gatos registrados en esta colonia.</p>
                  </div>
                ) : (
                  animales.map(animal => (
                    <div key={animal.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition relative group">
                      {animal.urgent && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm animate-pulse">URGENTE</span>
                      )}
                      <button
                        onClick={() => handleDelete(animal.id)}
                        title="Archivar gato"
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-full z-10 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      >🗑️</button>
                      <img className="h-48 w-full object-cover" src={animal.foto_url || 'https://via.placeholder.com/400x300?text=Sin+Foto'} alt={animal.nombre} />
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-800 truncate">{animal.nombre}</h3>
                        </div>
                        <p className="text-gray-500 text-xs mb-3 italic">{animal.edad ? `${animal.edad} años` : 'Edad no especificada'}</p>
                        <p className="text-gray-600 text-sm line-clamp-2">{animal.descripcion}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODALES OMITIDOS PARA BREVEDAD (SON EXACTAMENTE LOS MISMOS QUE TENÍAS) --- */}
      {/* MODAL: PERFIL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Configurar Colonia</h2>
            <p className="text-sm text-gray-500 mb-6">Completa la información para activar todas las funciones.</p>
            <form onSubmit={handleUpdatePerfil} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección / Ubicación aproximada</label>
                <input type="text" required value={perfilForm.direccion} onChange={(e) => setPerfilForm({ ...perfilForm, direccion: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Calle Mayor 15, parque trasero" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Postal</label>
                <input type="text" required maxLength="5" value={perfilForm.codigo_postal || ''} onChange={(e) => setPerfilForm({ ...perfilForm, codigo_postal: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 28001" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea required value={perfilForm.descripcion} onChange={(e) => setPerfilForm({ ...perfilForm, descripcion: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg h-32 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Explica brevemente vuestra labor..."></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AÑADIR ANIMAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Gato</h2>
            {formError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100">{formError}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Especie</label>
                <div className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-gray-700 font-bold flex items-center gap-2">🐱 Gato <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded ml-auto">Fijo para Colonias</span></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Edad</label>
                <input type="text" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 2" className="w-full border border-gray-300 p-2.5 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto</label>
                <input type="file" onChange={handleFileChange} required className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer" />
              </div>
              <div className="md:col-span-2 flex items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                <input type="checkbox" name="urgent" checked={formData.urgent} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded cursor-pointer" />
                <label className="ml-3 block text-sm font-semibold text-blue-800">Marcar como caso URGENTE</label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg h-24 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Detalles de este gatito..."></textarea>
              </div>
              <div className="md:col-span-2 mt-4">
                <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold py-3 px-4 rounded-xl transition shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Gato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NECESIDADES */}
      {isNeedModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg border-t-8 border-red-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🚨 Publicar Petición</h2>
            <form onSubmit={handleSubmitNeed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                <input type="text" required maxLength="50" value={needForm.titulo} onChange={(e) => setNeedForm({ ...needForm, titulo: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="Ej: Falta pienso" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                <select value={needForm.categoria} onChange={(e) => setNeedForm({ ...needForm, categoria: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="comida">🥫 Comida</option>
                  <option value="medicina">💊 Medicina</option>
                  <option value="transporte">🚐 Transporte</option>
                  <option value="urgencia">🆘 Urgencia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea required value={needForm.descripcion} onChange={(e) => setNeedForm({ ...needForm, descripcion: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg h-24 outline-none focus:ring-2 focus:ring-red-500" placeholder="Explica vuestra necesidad..."></textarea>
              </div>
              <div className="flex items-center bg-red-50 p-4 rounded-xl border border-red-100">
                <input type="checkbox" id="urgente_colonia" checked={needForm.prioridad === 'urgente'} onChange={(e) => setNeedForm({ ...needForm, prioridad: e.target.checked ? 'urgente' : 'normal' })} className="h-5 w-5 text-red-600 rounded cursor-pointer" />
                <label htmlFor="urgente_colonia" className="ml-3 block text-sm font-bold text-red-800 cursor-pointer">⚠️ EMERGENCIA EXTREMA</label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsNeedModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={isSubmittingNeed} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition">{isSubmittingNeed ? 'Publicando...' : 'Publicar Alerta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColoniaDashboard;