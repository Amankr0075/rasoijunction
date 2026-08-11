import { useLocation, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DeliveryRiderView from './DeliveryRiderView';
import StaffDashboard from '../staff/StaffDashboard';

const DeliveryDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/delivery/dashboard') {
    return <StaffDashboard />;
  }

  if (path === '/delivery/history') {
    return (
      <DashboardLayout>
        <DeliveryRiderView isHistory={true} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DeliveryRiderView isHistory={false} />
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
