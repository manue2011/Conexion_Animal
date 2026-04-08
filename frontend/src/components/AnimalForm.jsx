// Archivo: frontend/src/components/AnimalForm.jsx
import { useState } from 'react';
import axios from 'axios';

const AnimalForm = ({ onSuccess }) => {
  // 🔑 LA LLAVE: Obtenemos el usuario del localStorage para que el componente sepa quién eres
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    edad: '',
    especie: '',
    ubicacion: '', // Importante: debe estar aquí
    urgent: false
  });
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('edad', formData.edad);
      data.append('especie', formData.especie);
      data.append('urgent', formData.urgent);
      data.append('ubicacion', formData.ubicacion); // Enviamos la ubicación al backend
      
      if (file) {
        data.append('foto_url', file);
      }

      const token = localStorage.getItem('token');

      await axios.post('http://localhost:3000/api/animales', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: '¡Animal registrado correctamente!' });
      
      // Limpiamos todo el formulario incluyendo la ubicación
      setFormData({ 
        nombre: '', 
        descripcion: '', 
        edad: '', 
        especie: '', 
        ubicacion: '', 
        urgent: false 
      });
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-700">Registrar Nuevo Animal</h3>
      
      {message && (
        <div className={`p-3 mb-4 rounded text-white text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
            <input 
              name="nombre" 
              placeholder="Nombre del animal" 
              value={formData.nombre}
              onChange={handleChange} 
              className="border p-2 rounded w-full" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Especie</label>
            <select 
              name="especie" 
              value={formData.especie}
              onChange={handleChange} 
              className="border p-2 rounded w-full bg-white outline-none focus:ring-2 focus:ring-blue-500" 
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="number" 
            name="edad" 
            placeholder="Edad (años)" 
            value={formData.edad}
            onChange={handleChange} 
            className="border p-2 rounded w-full" 
          />
          <label className="flex items-center space-x-2 border p-2 rounded bg-gray-50 cursor-pointer">
            <input 
              type="checkbox" 
              name="urgent" 
              checked={formData.urgent} 
              onChange={handleChange} 
              className="w-5 h-5 text-red-600"
            />
            <span className="text-red-600 font-bold">¿Urgente?</span>
          </label>
        </div>

        <textarea 
          name="descripcion" 
          placeholder="Descripción, historia..." 
          value={formData.descripcion}
          onChange={handleChange} 
          className="border p-2 rounded w-full h-24" 
        />

        {/* 📍 UBICACIÓN: Ahora 'user' ya está definido arriba y no dará error */}
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">📍 Ubicación</label>
            <input 
              type="text" 
              name="ubicacion" 
              placeholder="Ciudad o Provincia" 
              value={formData.ubicacion}
              onChange={handleChange} 
              className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required={user?.role === 'admin'} 
            />
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 p-4 text-center rounded">
          <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500"/>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white font-bold transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Subiendo...' : 'Guardar Animal'}
        </button>
      </form>
    </div>
  );
};

export default AnimalForm;