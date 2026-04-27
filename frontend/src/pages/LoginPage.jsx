import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LoginPage = () => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!executeRecaptcha) {
      setError('ReCAPTCHA no está disponible');
      return;
    }
    try {
      const captchaToken = await executeRecaptcha('login');
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        ...formData,
        recaptchaToken: captchaToken
      });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else if (user.role === 'gestor') {
        navigate('/colonia/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-100">

        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">🐾</span>
          <h2 className="text-2xl font-bold text-blue-600">Iniciar Sesión</h2>
          <p className="text-sm text-gray-400 mt-1">Bienvenido de nuevo</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="ejemplo@correo.com"
              onChange={handleChange}
              required
            />
             <p className="text-[11px] text-gray-400 mt-1.5 ml-1">⚠️ El sistema distingue entre mayúsculas y minúsculas.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>
          <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition shadow-md mt-2"
          >
            Entrar
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;