import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Gate a route by auth + optional role list.
 * Usage: <ProtectedRoute roles={['admin']}><CommandCenter /></ProtectedRoute>
 * Remember: this only controls UI visibility. The API enforces the real
 * authorization - never treat a client-side check as a security boundary.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
