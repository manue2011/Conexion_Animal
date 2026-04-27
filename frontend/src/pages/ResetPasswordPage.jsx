import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Si no hay token en la URL, redirigimos
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (newPassword.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    if (newPassword !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      setMensaje(res.data.message);

      // Redirigimos al login tras 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'El enlace no es válido o ha caducado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">

        <div className="text-center mb-8">
          <span className="text-5xl">🔒</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Nueva contraseña</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>

        {/* Mensaje de éxito */}
        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 text-sm text-center">
            ✅ {mensaje}
            <p className="mt-2 text-xs text-green-600">Redirigiendo al login en 3 segundos...</p>
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
                Nueva contraseña
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Indicador visual de coincidencia */}
            {confirmPassword && (
              <p className={`text-xs font-bold ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                {newPassword === confirmPassword ? '✅ Las contraseñas coinciden' : '❌ Las contraseñas no coinciden'}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline font-bold">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;