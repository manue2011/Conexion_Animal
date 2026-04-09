// Archivo: frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RegisterPage = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
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
  e.preventDefault();

  // 1. Verificamos que el hook esté listo
  if (!executeRecaptcha) {
    setMessage({ type: 'error', text: 'El sistema de seguridad no ha cargado. Reintenta.' });
    return;
  }

  try {
    // 2. ¡Mucho más simple! Sin promesas manuales ni window.grecaptcha
    const recaptchaToken = await executeRecaptcha('register');

    if (!recaptchaToken) {
      setMessage({ type: 'error', text: 'No se pudo generar el token de seguridad.' });
      return;
    }

    // 3. Enviamos al backend exactamente como lo tenías
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      ...formData,
      recaptchaToken // Este es el nombre que espera nuestro controlador
    });

    setMessage({ type: 'success', text: '¡Registro exitoso! Redirigiendo...' });
    setTimeout(() => navigate('/login'), 2000);

  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Error al registrarse';
    setMessage({
      type: 'error',
      text: errorMsg
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