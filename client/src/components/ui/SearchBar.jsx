import { useState, useEffect, useRef } from 'react';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({
  placeholder = 'Search dishes, categories...',
  onSearch,
  debounceTime = 300,
  suggestions = [],
  onSuggestionClick,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [query, onSearch, debounceTime]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-500 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-dark-800 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200 shadow-sm"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && query && filteredSuggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-xl shadow-premium overflow-hidden divide-y divide-gray-50 dark:divide-dark-700/50"
          >
            {filteredSuggestions.map((item, index) => (
              <motion.li
                key={index}
                whileHover={{ backgroundColor: 'rgba(230, 126, 34, 0.05)' }}
                onClick={() => {
                  setQuery(item);
                  setShowSuggestions(false);
                  if (onSuggestionClick) onSuggestionClick(item);
                  if (onSearch) onSearch(item);
                }}
                className="px-4 py-3 text-sm text-dark-700 dark:text-dark-200 cursor-pointer transition-colors"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
