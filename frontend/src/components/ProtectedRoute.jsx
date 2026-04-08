import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // 1. Buscamos la información del usuario logueado
  // (Ajusta esto si usas un AuthContext en lugar de localStorage)
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Si no hay nadie logueado, patada y al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si está logueado, miramos si su rol está en la lista de la puerta (allowedRoles)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si un 'user' normal intenta entrar a '/admin/dashboard', lo devolvemos al inicio
    return <Navigate to="/" replace />;
  }

  // 4. Si tiene el rol correcto, le abrimos la puerta
  // <Outlet /> es un componente mágico de React Router que renderiza las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;