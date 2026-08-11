import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleRoute — only redirects to /unauthorized when BOTH conditions are true:
 *   1. The user object is fully loaded (not null)
 *   2. The user's role is NOT in the allowed list
 *
 * This prevents the race condition where user=null briefly after loading=false
 * causes a false 403 redirect.
 */
const RoleRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  // Still loading auth state — render nothing (wait)
  if (loading) return null;

  // Auth loaded but user object not yet set — wait (prevents false 403)
  if (!user) return null;

  const userRole = (user.role || '').trim().toLowerCase();
  const allowed = roles.map(r => r.trim().toLowerCase());

  // Definitively deny access only when role is known and not allowed
  if (allowed.length > 0 && !allowed.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;

