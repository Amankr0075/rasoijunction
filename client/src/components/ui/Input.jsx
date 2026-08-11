import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  register,
  required = false,
  className = '',
  inputClassName = '',
  variant = 'default',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Determine styling based on variant
  const isGlass = variant === 'glass';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-1.5 ${className}`}
    >
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium ${isGlass ? 'text-white/90' : 'text-dark-700 dark:text-dark-200'}`}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isGlass ? 'text-white/50' : 'text-gray-400 dark:text-dark-500'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            input-field
            ${isGlass ? 'bg-black/30 border-white/20 text-white placeholder-white/30 backdrop-blur-md focus:bg-black/50 focus:border-amber-500 focus:ring-amber-500/20' : ''}
            ${Icon ? 'pl-11' : ''}
            ${type === 'password' ? 'pr-11' : ''}
            ${error ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500' : ''}
            ${isFocused ? 'ring-2 ring-amber-500/30' : ''}
            ${inputClassName}
          `}
          {...(register ? register(name, { required: required && `${label || name} is required` }) : {})}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors"
          >
            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger-500 flex items-center gap-1"
        >
          <span>⚠</span> {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Input;
