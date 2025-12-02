// Archivo: frontend/src/components/AnimalForm.jsx
import { useState } from 'react';
import axios from 'axios';

const AnimalForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    edad: '',
    especie: '',
    urgent: false
  });
  const [file, setFile] = useState(null); // Estado separado para la foto
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guardamos el archivo real
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Preparar los datos como FormData (necesario para subir archivos)
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('edad', formData.edad);
      data.append('especie', formData.especie);
      data.append('urgent', formData.urgent);
      if (file) {
        data.append('image', file); // 'image' debe coincidir con upload.single('image') del backend
      }

      // 2. Obtener el token del almacenamiento
      const token = localStorage.getItem('token');

      // 3. Enviar al Backend
      await axios.post('http://localhost:3000/api/animales', data, {
        headers: {
          'Authorization': `Bearer ${token}`, // ¡El carnet de Admin!
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: '¡Animal registrado correctamente!' });
      
      // Limpiar formulario
      setFormData({ nombre: '', descripcion: '', edad: '', especie: '', urgent: false });
      setFile(null);
      
      // Avisar al padre (Dashboard) para que refresque la lista si hace falta
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al subir el animal. ¿Eres Admin?' });
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
          <input 
            name="nombre" 
            placeholder="Nombre del animal" 
            value={formData.nombre}
            onChange={handleChange} 
            className="border p-2 rounded w-full" 
            required 
          />
          <input 
            name="especie" 
            placeholder="Especie (Gato, Perro...)" 
            value={formData.especie}
            onChange={handleChange} 
            className="border p-2 rounded w-full" 
            required 
          />
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
            <span className="text-red-600 font-bold">¿Es un caso Urgente?</span>
          </label>
        </div>

        <textarea 
          name="descripcion" 
          placeholder="Descripción del carácter, historia..." 
          value={formData.descripcion}
          onChange={handleChange} 
          className="border p-2 rounded w-full h-24" 
        />

        {/* INPUT DE ARCHIVO */}
        <div className="border-2 border-dashed border-gray-300 p-4 text-center rounded">
          <p className="text-sm text-gray-500 mb-2">Sube una foto del animal</p>
          <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "/>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white font-bold transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Subiendo a la nube...' : 'Guardar Animal'}
        </button>
      </form>
    </div>
  );
};

export default AnimalForm;