import { motion } from 'framer-motion';

const cardVariants = {
  default: 'card',
  premium: 'card-premium',
  glass: 'glass-card',
};

const Card = ({
  children,
  variant = 'default',
  className = '',
  padding = 'p-6',
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`${cardVariants[variant]} ${padding} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Sub-components for structured card layouts
Card.Header = ({ children, className = '' }) => (
  <div className={`pb-4 border-b border-gray-100 dark:border-dark-700 ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`py-4 ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`pt-4 border-t border-gray-100 dark:border-dark-700 ${className}`}>
    {children}
  </div>
);

export default Card;
