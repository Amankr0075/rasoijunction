import { motion } from 'framer-motion';
import { HiOutlineInbox, HiOutlineSearch, HiOutlineShoppingCart } from 'react-icons/hi';
import Button from './Button';

const icons = {
  default: HiOutlineInbox,
  search: HiOutlineSearch,
  cart: HiOutlineShoppingCart,
};

const EmptyState = ({
  icon = 'default',
  title = 'No data found',
  description = 'There is nothing to show here yet.',
  actionLabel,
  onAction,
  className = '',
}) => {
  const Icon = typeof icon === 'string' ? icons[icon] : icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-dark-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400 dark:text-dark-500" />
      </div>
      <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-dark-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
