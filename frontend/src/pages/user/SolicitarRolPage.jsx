import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SolicitarRolPage = () => {
  const navigate = useNavigate();
  
  // 1. Añadimos los nuevos campos al estado
  const [formData, setFormData] = useState({ 
    rol_solicitado: 'gestor', 
    mensaje: '',
    telefono: '',
    entidad_solicitada: ''
  });
  
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // 2. Función genérica para manejar los cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      // 3. Enviamos todos los datos estructurados al backend
      await axios.post(`${API_URL}/api/usuarios/solicitar-rol`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus({ type: 'success', text: '¡Solicitud enviada! Nuestro equipo de administración la revisará en breve.' });
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Error al enviar la solicitud.' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Únete como Entidad Colaboradora</h1>
      <p className="text-gray-600 mb-8 pb-4 border-b">Rellena este formulario si representas a una protectora o gestionas una colonia felina y quieres usar nuestra plataforma.</p>
      
      {status.text && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ROL */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">¿Qué rol deseas solicitar?</label>
          <select 
            name="rol_solicitado"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
            onChange={handleChange}
            value={formData.rol_solicitado}
          >
            <option value="gestor">🐱 Soy Gestor de Colonia Felina</option>
            <option value="admin">🏡 Represento a una Protectora / Asociación</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-lg border border-blue-100">
          {/* TELÉFONO (NUEVO) */}
          <div>
            <label className="block text-blue-900 font-bold mb-1 text-sm">Teléfono de Contacto</label>
            <p className="text-xs text-blue-600 mb-2">Para verificar la cuenta si es necesario.</p>
            <input 
              type="tel"
              name="telefono"
              placeholder="Ej: 600 123 456"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
              value={formData.telefono}
              required
            />
          </div>

          {/* ENTIDAD (NUEVO) */}
          <div>
            <label className="block text-blue-900 font-bold mb-1 text-sm">
              {formData.rol_solicitado === 'admin' ? 'Nombre de la Protectora' : 'Nombre/Zona de la Colonia'}
            </label>
            <p className="text-xs text-blue-600 mb-2">
              {formData.rol_solicitado === 'admin' ? 'Ej: Asociación Huellas' : 'Ej: Colonia Parque Norte'}
            </p>
            <input 
              type="text"
              name="entidad_solicitada"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
              value={formData.entidad_solicitada}
              required
            />
          </div>
        </div>

        {/* MENSAJE (Ya lo tenías, lo mantenemos como info extra) */}
        <div>
          <label className="block text-gray-700 font-bold mb-1">Comentarios Adicionales</label>
          <p className="text-sm text-gray-500 mb-2">
            Cuéntanos brevemente sobre vuestra labor o cualquier detalle que debamos conocer.
          </p>
          <textarea 
            name="mensaje"
            className="w-full border border-gray-300 p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Hola, somos una asociación registrada desde 2015..."
            onChange={handleChange}
            value={formData.mensaje}
            required
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-md transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Procesando...' : 'Enviar Solicitud'}
        </button>
      </form>
    </div>
  );
};

export default SolicitarRolPage;