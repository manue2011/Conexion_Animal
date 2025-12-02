// Archivo: frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate(); // Para redirigir al usuario

  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  

  const [message, setMessage] = useState(''); // Para mostrar mensajes de éxito/error

  // Función que se ejecuta al escribir en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      // Hacemos la petición al Backend
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      
      setMessage({ type: 'success', text: '¡Registro exitoso! Redirigiendo...' });
      
      // Esperamos 2 segundos y lo mandamos al Login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      // Si el backend devuelve error (ej: usuario ya existe)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al registrarse' 
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Crear Cuenta</h2>
        
        {/* Mensaje de Alerta */}
        {message && (
          <div className={`p-3 mb-4 text-center text-white rounded ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input 
              type="email" 
              name="email"
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="block text-gray-700">Contraseña</label>
            <input 
              type="password" 
              name="password"
              placeholder="******"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required 
            />
          </div>

          {/* Selector de Rol (Solo para pruebas, luego lo quitaremos o ocultaremos) */}
         {/*  <div>
            <label className="block text-gray-700">Tipo de Usuario</label>
            <select 
              name="role" 
              className="w-full px-4 py-2 border rounded"
              onChange={handleChange}
            >
              <option value="user">Adoptante (Usuario)</option>
              <option value="gestor">Gestor de Colonia</option>
              <option value="admin">Administrador (Protectora)</option>
            </select>
          </div> */}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;