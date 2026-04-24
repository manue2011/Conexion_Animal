import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userString = localStorage.getItem('user');
  
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch {
    // Si el JSON está corrupto, tratamos como no logueado
    localStorage.removeItem('user');
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;