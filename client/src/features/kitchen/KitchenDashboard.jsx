import { useLocation, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import KitchenOverview from './KitchenOverview';
import KitchenQueue from './KitchenQueue';
import KitchenOrders from './KitchenOrders';
import { useAuth } from '../../context/AuthContext';

const KITCHEN_ROLES = ['chef', 'admin', 'manager'];

const KitchenDashboard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // Wait for auth to load before deciding
  if (loading) return null;

  // If user is loaded and doesn't have kitchen access, redirect to their home
  if (user && !KITCHEN_ROLES.includes(user.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    if (path === '/kitchen/queue') return <KitchenQueue />;
    if (path === '/kitchen/orders') return <KitchenOrders />;
    return <KitchenOverview />;
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default KitchenDashboard;

