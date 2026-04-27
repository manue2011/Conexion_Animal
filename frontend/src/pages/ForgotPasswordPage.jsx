import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMensaje('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMensaje(res.data.message);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data.message);
      } else {
        setError('Error al enviar el correo. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
        
        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">¿Olvidaste tu contraseña?</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Introduce tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {/* Mensaje de éxito */}
        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 text-sm text-center">
            ✅ {mensaje}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm text-center">
            ❌ {error}
          </div>
        )}

        {!mensaje && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
          <p>
            <Link to="/login" className="text-blue-600 hover:underline font-bold">
              ← Volver al inicio de sesión
            </Link>
          </p>
          <p>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-bold">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;