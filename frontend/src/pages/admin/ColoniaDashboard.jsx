import { useState, useEffect } from 'react';
import axios from 'axios';

const ColoniaDashboard = () => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ESTADOS PARA EL MODAL Y EL FORMULARIO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para evitar el doble clic
  const [formData, setFormData] = useState({
    nombre: '', especie: 'Gato', edad: '', urgent: false, descripcion: ''
  });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');

  // 1. Función para cargar los animales (la sacamos para poder reutilizarla)
  const fetchAnimales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/animales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimales(response.data);
    } catch (err) {
      console.error('Error al cargar animales:', err);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimales();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 2. Función para GUARDAR (Corregida para 1 solo clic)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Si ya está enviando, no hace nada

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
      if (file) {
        data.append('foto_url', file); 
      }

      await axios.post('http://localhost:3000/api/animales', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Recargamos la lista completa para asegurar que tenemos el ID real
      await fetchAnimales();
      
      setIsModalOpen(false); 
      setFormData({ nombre: '', especie: 'Gato', edad: '', urgent: false, descripcion: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setIsSubmitting(false); // Liberamos el botón
    }
  };

  // 3. Función para BORRAR (Soft Delete)
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres archivar este registro?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/animales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtramos el estado local para que desaparezca al instante
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
          <h2 className="text-xl font-bold">🐾 Mi Colonia</h2>
          <p className="text-xs text-blue-300 mt-1">Gestor de Comunidad</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-blue-700 rounded-lg font-medium">🐱 Mis Animales</button>
          <button className="w-full text-left px-4 py-3 hover:bg-blue-800 rounded-lg transition">📅 Citas Médicas</button>
          <button className="w-full text-left px-4 py-3 hover:bg-blue-800 rounded-lg transition">📦 Inventario Comida</button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Censo de Animales</h1>
            <p className="text-gray-600">Gestiona los habitantes de tu zona</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition">
            + Añadir Nuevo Animal
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {loading ? ( <p className="text-center text-gray-500">Cargando censo...</p> ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animales.map(animal => (
              <div key={animal.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition relative group">
                {animal.urgent && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">URGENTE</span>
                )}
                
                {/* BOTÓN BORRAR (Icono Papelera) */}
                <button 
                  onClick={() => handleDelete(animal.id)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-full z-10 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar animal"
                >
                  🗑️
                </button>

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
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
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
                <select name="especie" value={formData.especie} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none">
                  <option value="Gato">Gato</option>
                  <option value="Perro">Perro</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Edad</label>
                <input type="text" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 2" className="w-full border border-gray-300 p-2.5 rounded-lg outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto</label>
                <input type="file" onChange={handleFileChange} required className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
              </div>
              
              <div className="md:col-span-2 flex items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                <input type="checkbox" name="urgent" checked={formData.urgent} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded cursor-pointer"/>
                <label className="ml-3 block text-sm font-semibold text-blue-800">Marcar como caso URGENTE</label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción / Notas</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg h-24 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Detalles sobre el animal..."></textarea>
              </div>

              <div className="md:col-span-2 mt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full text-white font-bold py-3 px-4 rounded-xl transition shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isSubmitting ? 'Guardando en el sistema...' : 'Guardar Animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColoniaDashboard;