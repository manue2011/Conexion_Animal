import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AnimalForm = ({ onSuccess, onCancel, animalAEditar }) => {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', edad: '', especie: '', ubicacion: '', urgent: false
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // ESTADO PARA LA VISTA PREVIA DE LA IMAGEN
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (animalAEditar) {
      setFormData({
        nombre: animalAEditar.nombre || '',
        descripcion: animalAEditar.descripcion || '',
        edad: animalAEditar.edad || '',
        especie: animalAEditar.especie || '',
        ubicacion: animalAEditar.ubicacion || '',
        urgent: animalAEditar.urgent || false
      });
      setFile(null);
      setPreviewUrl(animalAEditar.foto_url || null);
    } else {
      setFormData({ nombre: '', descripcion: '', edad: '', especie: '', ubicacion: '', urgent: false });
      setFile(null);
      setPreviewUrl(null);
    }
  }, [animalAEditar]);

  // EFECTO PARA GENERAR LA URL LOCAL CUANDO SE SUBE UNA FOTO
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // Limpiar memoria
    } else if (!animalAEditar?.foto_url) {
      setPreviewUrl(null);
    }
  }, [file, animalAEditar]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
        if (animalAEditar) {
        const payload = {
          ...formData,
          estado: animalAEditar.estado || 'activo'
        };

        await axios.put(`${API_URL}/api/animales/${animalAEditar.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: '¡Animal actualizado correctamente!' });
      } else {
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => data.append(k, v));
        if (file) data.append('foto_url', file);

        await axios.post(`${API_URL}/api/animales`, data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setMessage({ type: 'success', text: '¡Animal registrado correctamente!' });
        
        setFormData({ nombre: '', descripcion: '', edad: '', especie: '', ubicacion: '', urgent: false });
        setFile(null);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: animalAEditar ? 'Error al actualizar.' : 'Error al subir el animal.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // ESTRUCTURA A DOS COLUMNAS
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      
      {/* --- COLUMNA IZQUIERDA: EL FORMULARIO --- */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md flex-1 w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base md:text-xl font-bold text-gray-700">
            {animalAEditar ? '✏️ Editar Animal' : 'Registrar Nuevo Animal'}
          </h3>
          {animalAEditar && (
            <button 
              type="button" 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition"
            >
              ✕ Cancelar
            </button>
          )}
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-white text-center text-sm font-medium ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
              <input
                name="nombre"
                placeholder="Nombre del animal"
                value={formData.nombre}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Especie</label>
              <select
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 rounded-lg w-full text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>-- Selecciona --</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Roedor">Roedor</option>
                <option value="Ave">Ave</option>
                <option value="Reptil">Reptil</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Edad (años)</label>
              <input
                type="number"
                name="edad"
                placeholder="Ej: 3"
                value={formData.edad}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prioridad</label>
              <label className="flex items-center gap-2 border border-gray-300 p-2.5 rounded-lg bg-gray-50 cursor-pointer h-[42px]">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 accent-red-500"
                />
                <span className="text-red-600 font-bold text-sm">¿Urgente?</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
            <textarea
              name="descripcion"
              placeholder="Historia, comportamiento..."
              value={formData.descripcion}
              onChange={handleChange}
              className="border border-gray-300 p-2.5 rounded-lg w-full h-24 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">📍 Ubicación</label>
              <input
                type="text"
                name="ubicacion"
                placeholder="Ciudad o Provincia"
                value={formData.ubicacion}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 rounded-lg w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required={user?.role === 'admin'}
              />
            </div>
          )}

          {!animalAEditar ? (
            <div className="border-2 border-dashed border-gray-300 p-3 md:p-4 rounded-lg text-center">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-xs md:text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded-lg text-yellow-700 text-xs text-center border border-yellow-200">
              ℹ️ La foto no se puede modificar desde el modo edición actualmente.
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-sm transition-all active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : (animalAEditar ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')}`}
            >
              {loading ? 'Procesando...' : (animalAEditar ? 'Guardar Cambios' : 'Guardar Animal')}
            </button>
          </div>
        </form>
      </div>

      {/* --- COLUMNA DERECHA: VISTA PREVIA (Oculta en móvil, visible en PC) --- */}
      <div className="hidden lg:block w-80 shrink-0 sticky top-6">
        <h4 className="text-gray-500 font-bold mb-3 uppercase text-sm tracking-wider">Vista Previa</h4>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
          
          {/* Contenedor Foto Previa */}
          <div className="h-56 bg-gray-100 flex items-center justify-center relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <span className="text-4xl block mb-2">📸</span>
                <span className="text-xs font-bold uppercase tracking-wider">Sin foto</span>
              </div>
            )}
            
            {/* Etiqueta flotante de urgencia sobre la foto */}
            {formData.urgent && (
              <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-md animate-pulse">
                URGENTE
              </span>
            )}
          </div>

          {/* Contenedor Datos Previos */}
          <div className="p-5">
            <h3 className="font-extrabold text-xl text-gray-800 truncate mb-2">
              {formData.nombre || 'Nombre del animal'}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                {formData.especie || 'Especie'}
              </span>
              <span className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                {formData.edad ? `${formData.edad} años` : 'Edad ?'}
              </span>
            </div>

            <p className="text-gray-500 text-sm italic line-clamp-3 leading-relaxed min-h-[4rem]">
              {formData.descripcion || 'La descripción que escribas aparecerá aquí...'}
            </p>

            {(formData.ubicacion || (user?.role === 'admin' || user?.role === 'superadmin')) && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500 font-medium">
                <span className="mr-1">📍</span> 
                {formData.ubicacion || 'Ubicación...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalForm;