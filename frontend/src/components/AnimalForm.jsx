import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AnimalForm = ({ onSuccess }) => {
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
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (file) data.append('foto_url', file);

      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/animales`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ type: 'success', text: '¡Animal registrado correctamente!' });
      setFormData({ nombre: '', descripcion: '', edad: '', especie: '', ubicacion: '', urgent: false });
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al subir el animal.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
      <h3 className="text-base md:text-xl font-bold mb-4 text-gray-700">Registrar Nuevo Animal</h3>

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

        {/* DESCRIPCIÓN */}
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

      
        <div className="border-2 border-dashed border-gray-300 p-3 md:p-4 rounded-lg text-center">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs md:text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg text-white font-bold text-sm transition-all active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Subiendo...' : 'Guardar Animal'}
        </button>
      </form>
    </div>
  );
};

export default AnimalForm;