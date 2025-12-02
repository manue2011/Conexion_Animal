// Archivo: frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      
      // 1. OBTENER EL TOKEN Y EL USUARIO
      const { token, user } = response.data;

      // 2. GUARDAR EN LOCALSTORAGE (La "memoria" del navegador)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 3. REDIRECCIONAR SEGÚN ROL
      // Si es admin, lo mandamos a una zona especial (futuro Dashboard)
      // Si es usuario normal, a la Home.
      if (user.role === 'admin') {
        navigate('/admin/dashboard'); // (Esta ruta la crearemos luego, de momento dará 404 pero es correcto)
      } else {
        navigate('/');
      }

      // Truco para recargar el estado de la app (temporal hasta que usemos Context)
      window.location.reload(); 

    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Iniciar Sesión</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ejemplo@correo.com"
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <input 
              type="password" 
              name="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;