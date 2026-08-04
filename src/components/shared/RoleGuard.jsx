import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ children, requiredRoles, requireAny = true }) => {
  const { user, loading, isAuthenticated, hasAnyRole } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;
