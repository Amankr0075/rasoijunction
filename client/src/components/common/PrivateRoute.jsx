import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="text-center">
          <img src="/logo.png" alt="Rasoi Junction" className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-white shadow-md animate-pulse" />
          <LoadingSkeleton type="text" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
