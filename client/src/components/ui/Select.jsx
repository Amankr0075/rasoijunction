import { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  required = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border ${
            error ? 'border-danger-500' : 'border-gray-200 dark:border-dark-600'
          } rounded-xl text-left text-dark-800 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200 flex items-center justify-between shadow-sm`}
        >
          <span className={selectedOption ? 'text-dark-800 dark:text-dark-100' : 'text-gray-400 dark:text-dark-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-xl shadow-premium max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-gray-50 dark:divide-dark-700/50"
            >
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    if (onChange) onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    opt.value === value
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-dark-700 dark:text-dark-200 hover:bg-gray-50 dark:hover:bg-dark-700/50'
                  }`}
                >
                  {opt.label}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
};

export default Select;
