import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const RegisterPage = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      setMessage({ type: 'error', text: 'El sistema de seguridad no ha cargado. Reintenta.' });
      return;
    }
    try {
      const recaptchaToken = await executeRecaptcha('register');
      if (!recaptchaToken) {
        setMessage({ type: 'error', text: 'No se pudo generar el token de seguridad.' });
        return;
      }
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        ...formData,
        recaptchaToken
      });
      setMessage({ type: 'success', text: '¡Registro exitoso! Redirigiendo...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al registrarse';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-100">

        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">🐾</span>
          <h2 className="text-2xl font-bold text-blue-600">Crear Cuenta</h2>
          <p className="text-sm text-gray-400 mt-1">Únete a la red de Conexión Animal</p>
        </div>

        {message && (
          <div className={`p-3 mb-4 text-center text-white rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md mt-2"
          >
            Registrarse
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;