const badgeStyles = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  neutral: 'badge-neutral',
  primary: 'badge bg-primary-50 text-primary-600 dark:bg-primary-600/20 dark:text-primary-400',
};

const Badge = ({ children, variant = 'neutral', className = '', dot = false }) => {
  return (
    <span className={`${badgeStyles[variant]} ${className}`}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-1.5 ${
          variant === 'success' ? 'bg-success-500' :
          variant === 'danger' ? 'bg-danger-500' :
          variant === 'warning' ? 'bg-warning-500' :
          variant === 'info' ? 'bg-blue-500' :
          variant === 'primary' ? 'bg-primary-500' :
          'bg-gray-400'
        }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
