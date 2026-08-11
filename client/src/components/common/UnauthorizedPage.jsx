import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShieldExclamation } from 'react-icons/hi';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center">
          <HiOutlineShieldExclamation className="w-10 h-10 text-danger-500" />
        </div>
        <h1 className="text-6xl font-bold font-display text-danger-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-dark-800 dark:text-white mb-3">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-dark-400 mb-8">
          Sorry, you don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
