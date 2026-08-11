import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          🍽️
        </motion.div>
        <h1 className="text-7xl font-bold font-display text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-dark-800 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-dark-400 mb-8">
          Oops! Looks like this dish isn't on our menu. Let's get you back to something delicious.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/menu" className="btn-outline">
            Browse Menu
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
