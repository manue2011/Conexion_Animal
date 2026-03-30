import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SolicitarRolPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ rol_solicitado: 'gestor', mensaje: '' });
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/usuarios/solicitar-rol', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus({ type: 'success', text: '¡Solicitud enviada! Los administradores la revisarán pronto.' });
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Error al enviar la solicitud.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Únete como Colaborador</h1>
      
      {status.text && (
        <div className={`p-4 mb-6 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-bold mb-2">¿Qué rol deseas solicitar?</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, rol_solicitado: e.target.value})}
            value={formData.rol_solicitado}
          >
            <option value="gestor">Gestor de Colonia Felina</option>
            <option value="admin">Administrador de Protectora</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Justificación o Mensaje</label>
          <p className="text-sm text-gray-500 mb-2">
            Explícanos por qué necesitas este rol. Si eres de una protectora, incluye el nombre. Si eres gestor, indica la zona.
          </p>
          <textarea 
            className="w-full border border-gray-300 p-2 rounded h-32 focus:ring-2 focus:ring-blue-500"
            placeholder="Hola, me gustaría gestionar la Protectora Patitas..."
            onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
            required
          ></textarea>
        </div>

        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition w-full">
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
};

export default SolicitarRolPage;