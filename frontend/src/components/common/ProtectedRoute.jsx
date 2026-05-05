import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — guards routes by auth & role.
 * @param {number} maxRole — highest role_id allowed (uses hierarchy: lower = more privilege)
 * @param {number[]} exactRoles — if provided, only these exact roles are allowed
 */
export default function ProtectedRoute({ children, maxRole, exactRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (exactRoles && !exactRoles.includes(user.role_id)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (maxRole && user.role_id > maxRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
