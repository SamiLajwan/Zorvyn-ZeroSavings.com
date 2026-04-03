import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireRole }) {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && !can(requireRole)) return <Navigate to="/dashboard" replace />;
  return children;
}
