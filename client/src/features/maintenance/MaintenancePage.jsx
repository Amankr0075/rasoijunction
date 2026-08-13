import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCog, HiOutlineRefresh } from 'react-icons/hi';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MaintenancePage = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await api.get('/system/maintenance/status');
      if (!res.isMaintenanceMode) {
        navigate('/');
      } else if (res.endTime) {
        setEndTime(res.endTime);
      }
    } catch (err) {
      // Still in maintenance
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkStatus();
    // Check every 30 seconds automatically
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (!endTime) return;
    const updateCountdown = () => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeRemaining('Any moment now...');
        checkStatus(); // Force a check when timer hits 0
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (h > 0) {
          setTimeRemaining(`${h}h ${m}m ${s}s`);
        } else {
          setTimeRemaining(`${m}m ${s}s`);
        }
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const handleDisableMaintenance = async () => {
    if (!window.confirm('Are you sure you want to disable Maintenance Mode and bring the site back online?')) return;
    try {
      const res = await api.post('/system/maintenance/toggle', { enabled: false });
      toast.success(res.message);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable maintenance mode.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-dark-700 relative"
      >
        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineCog className="w-10 h-10 text-primary-600 dark:text-primary-500 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-black text-dark-900 dark:text-white mb-2 font-display">
          System Under Maintenance
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          We're currently upgrading Rasoi Junction to serve you better. 
          Please bear with us; we'll be back online shortly!
        </p>

        {endTime && (
          <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/30">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Expected Return In</p>
            <p className="text-2xl font-black text-primary-700 dark:text-primary-300 font-mono">{timeRemaining}</p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={checkStatus}
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-900 hover:bg-dark-800 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 w-full"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking Status...' : 'Check Status Now'}
          </button>

          {user?.role === 'admin' && (
            <button 
              onClick={handleDisableMaintenance}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors border border-red-200 w-full mt-4"
            >
              <HiOutlineCog className="w-5 h-5" />
              Disable Maintenance Mode
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
