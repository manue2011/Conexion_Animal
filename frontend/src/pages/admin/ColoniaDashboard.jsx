import { useState, useEffect } from 'react';
import axios from 'axios';
import SubscriptionStatus from '../../components/SubscriptionStatus'; 

const ColoniaDashboard = () => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('animales'); 
  
  // --- ESTADOS PARA EL PERFIL DE LA COLONIA ---
  const [coloniaInfo, setColoniaInfo] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [perfilForm, setPerfilForm] = useState({ descripcion: '', direccion: '', codigo_postal: '' });

  // ESTADOS PARA EL MODAL DE ANIMALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', especie: 'Gato', edad: '', urgent: false, descripcion: ''
  });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');

  // --- ESTADOS PARA PETICIONES DE AYUDA (NECESIDADES) ---
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isSubmittingNeed, setIsSubmittingNeed] = useState(false);
  const [needForm, setNeedForm] = useState({
    titulo: '',
    categoria: 'comida',
    descripcion: '',
    prioridad: 'normal'
  });

  // --- LÓGICA DE PETICIONES DE AYUDA ---
  const handleSubmitNeed = async (e) => {
    e.preventDefault();
    if (isSubmittingNeed) return;
    setIsSubmittingNeed(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/necesidades', {
        ...needForm,
        colonia_id: coloniaInfo.id 
      }, {
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

  // 1. Cargar datos (Colonia + Animales)
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const resColonia = await axios.get('http://localhost:3000/api/usuarios/mi-colonia', config);
      setColoniaInfo(resColonia.data);
      setPerfilForm({
        descripcion: resColonia.data.descripcion || '',
        direccion: resColonia.data.direccion || '',
        codigo_postal: resColonia.data.codigo_postal || ''
      });

      const resAnimales = await axios.get('http://localhost:3000/api/animales', config);
      setAnimales(resAnimales.data);

    }  catch (err) {
      console.error('ERROR DETALLADO:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE PERFIL ---
  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/usuarios/colonia/${coloniaInfo.id}`, perfilForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsProfileModalOpen(false);
      fetchData();
      alert('¡Perfil de colonia actualizado!');
    } catch (err) {
      alert('Error al actualizar el perfil.');
    }
  };

  // --- LÓGICA DE ANIMALES ---
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('especie', formData.especie);
      data.append('edad', formData.edad);
      data.append('urgent', formData.urgent);
      data.append('descripcion', formData.descripcion);
      data.append('colonia_id', coloniaInfo.id);
      
      if (file) data.append('foto_url', file);

      await axios.post('http://localhost:3000/api/animales', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await fetchData();
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
      await axios.delete(`http://localhost:3000/api/animales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimales(animales.filter(a => a.id !== id));
    } catch (err) {
      alert('No se pudo eliminar el animal.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-blue-800 text-center">
          <h2 className="text-xl font-bold">🐾 {coloniaInfo?.nombre || 'Mi Colonia'}</h2>
          <p className="text-xs text-blue-300 mt-1">Gestor de Comunidad</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Botón Animales con onClick añadido */}
          <button 
            onClick={() => setActiveView('animales')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeView === 'animales' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >
            🐱 Mis Animales
          </button>
          
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full text-left px-4 py-3 hover:bg-blue-800 rounded-lg transition"
          >
            ⚙️ Configurar Colonia
          </button>

          <button 
            onClick={() => setActiveView('plan')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeView === 'plan' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
          >
            💳 Mi Plan
          </button>

          <button 
            disabled={!coloniaInfo?.direccion}
            onClick={() => setIsNeedModalOpen(true)}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold mt-8 transition shadow-md flex justify-between items-center ${!coloniaInfo?.direccion ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            <span>🚨 Pedir Ayuda</span>
          </button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* VISTA: MI PLAN */}
        {activeView === 'plan' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Suscripción</h1>
            <SubscriptionStatus /> 
          </div>
        )}

        {/* VISTA: CENSO DE ANIMALES (Envolvemos todo lo demás aquí) */}
        {activeView === 'animales' && (
          <div className="animate-fade-in">
            {/* 🚨 AVISO DE PERFIL INCOMPLETO */}
            {coloniaInfo && (!coloniaInfo.direccion || !coloniaInfo.descripcion || !coloniaInfo.codigo_postal) && (
              <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-8 flex justify-between items-center rounded-r-lg shadow-md animate-bounce-short">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <p className="font-bold text-orange-800">¡Perfil incompleto!</p>
                    <p className="text-sm text-orange-700">Debes configurar la ubicación y descripción antes de añadir animales.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm"
                >
                  Completar ahora
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Censo de Animales</h1>
                <p className="text-gray-600">Gestiona los habitantes de tu zona</p>
              </div>
              <button 
                disabled={!coloniaInfo?.direccion}
                onClick={() => setIsModalOpen(true)}
                className={`font-bold py-2 px-6 rounded-lg shadow-lg transition ${!coloniaInfo?.direccion ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                + Añadir Nuevo Animal
              </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

            {loading ? ( <p className="text-center text-gray-500">Cargando censo...</p> ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {animales.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400">
                        <p className="text-5xl mb-4">🐱</p>
                        <p>No hay animales registrados en esta colonia.</p>
                    </div>
                ) : (
                    animales.map(animal => (
                        <div key={animal.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition relative group">
                            {animal.urgent && (
                                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">URGENTE</span>
                            )}
                            <button 
                                onClick={() => handleDelete(animal.id)}
                                className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-full z-10 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                            > 🗑️ </button>
                            <img className="h-48 w-full object-cover" src={animal.foto_url || 'https://via.placeholder.com/400x300?text=Sin+Foto'} alt={animal.nombre} />
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold text-gray-800 truncate">{animal.nombre}</h3>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{animal.especie}</span>
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

      {/* --- MODAL DE PERFIL --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Configurar Colonia</h2>
            <p className="text-sm text-gray-500 mb-6">Completa la información para activar todas las funciones.</p>
            <form onSubmit={handleUpdatePerfil} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección / Ubicación aproximada</label>
                <input type="text" required value={perfilForm.direccion} onChange={(e) => setPerfilForm({...perfilForm, direccion: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Calle Mayor 15, parque trasero"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Postal</label>
                <input type="text" required maxLength="5" value={perfilForm.codigo_postal || ''} onChange={(e) => setPerfilForm({...perfilForm, codigo_postal: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 28001"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea required value={perfilForm.descripcion} onChange={(e) => setPerfilForm({...perfilForm, descripcion: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg h-32 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Explica brevemente vuestra labor..."></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE ANIMALES --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Registro</h2>
            {formError && ( <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100">{formError}</div> )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Especie</label>
                <div className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-gray-700 font-bold flex items-center gap-2">🐱 Gato <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded ml-auto">Fijo para Colonias</span></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Edad</label>
                <input type="text" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 2" className="w-full border border-gray-300 p-2.5 rounded-lg outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto</label>
                <input type="file" onChange={handleFileChange} required className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"/>
              </div>
              <div className="md:col-span-2 flex items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                <input type="checkbox" name="urgent" checked={formData.urgent} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded cursor-pointer"/>
                <label className="ml-3 block text-sm font-semibold text-blue-800">Marcar como caso URGENTE</label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg h-24 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Detalles..."></textarea>
              </div>
              <div className="md:col-span-2 mt-4">
                <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold py-3 px-4 rounded-xl transition shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE NECESIDADES --- */}
      {isNeedModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border-t-8 border-red-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🚨 Publicar Petición</h2>
            <form onSubmit={handleSubmitNeed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                <input type="text" required maxLength="50" value={needForm.titulo} onChange={(e) => setNeedForm({...needForm, titulo: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="Ej: Falta pienso"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                <select value={needForm.categoria} onChange={(e) => setNeedForm({...needForm, categoria: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="comida">🥫 Comida</option>
                  <option value="medicina">💊 Medicina</option>
                  <option value="transporte">🚐 Transporte</option>
                  <option value="urgencia">🆘 Urgencia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea required value={needForm.descripcion} onChange={(e) => setNeedForm({...needForm, descripcion: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg h-24 outline-none focus:ring-2 focus:ring-red-500" placeholder="Explica vuestra necesidad..."></textarea>
              </div>
              <div className="flex items-center bg-red-50 p-4 rounded-xl border border-red-100">
                <input type="checkbox" id="urgente_colonia" checked={needForm.prioridad === 'urgente'} onChange={(e) => setNeedForm({...needForm, prioridad: e.target.checked ? 'urgente' : 'normal'})} className="h-5 w-5 text-red-600 rounded cursor-pointer"/>
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