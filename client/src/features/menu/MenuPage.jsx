import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineAdjustments, HiOutlineHeart, HiOutlineShoppingCart, HiOutlineStar } from 'react-icons/hi';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wishlist local state persistence
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Filters & Sorting States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'All';
  });
  const [isVegFilter, setIsVegFilter] = useState('All'); // 'All', 'Veg', 'Non-Veg'
  const [sortBy, setSortBy] = useState('rating'); // 'priceAsc', 'priceDesc', 'rating', 'prepTime'

  const categories = ['All', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Desserts', 'Beverages'];

  const sortOptions = [
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'priceAsc' },
    { label: 'Price: High to Low', value: 'priceDesc' },
    { label: 'Preparation Time', value: 'prepTime' },
  ];

  const vegOptions = [
    { label: 'All Dishes', value: 'All' },
    { label: '🟢 Vegetarian', value: 'Veg' },
    { label: '🔴 Non-Vegetarian', value: 'Non-Veg' },
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (isVegFilter === 'Veg') params.isVeg = true;
        if (isVegFilter === 'Non-Veg') params.isVeg = false;
        if (search) params.search = search;
        if (sortBy) params.sort = sortBy;

        const res = await api.get('/menu', { params });
        setMenuItems(res.data);
      } catch (err) {
        toast.error('Failed to load menu items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [selectedCategory, isVegFilter, search, sortBy]);

  const handleToggleWishlist = (dishId) => {
    let updated;
    if (wishlist.includes(dishId)) {
      updated = wishlist.filter((id) => id !== dishId);
      toast.success('Removed from wishlist');
    } else {
      updated = [...wishlist, dishId];
      toast.success('Added to wishlist ❤️');
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold font-display text-dark-800 dark:text-white mb-3"
          >
            Our Culinary <span className="text-gradient">Creation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-gray-500 dark:text-dark-400 max-w-xl mx-auto"
          >
            Handcrafted luxury dining, fresh ingredients, cooked by master chefs, delivered to your doorstep.
          </motion.p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
          <SearchBar
            placeholder="Search our cuisine..."
            onSearch={setSearch}
            className="w-full lg:max-w-md"
          />

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Select
              options={vegOptions}
              value={isVegFilter}
              onChange={setIsVegFilter}
              placeholder="Filter Veg/Non-Veg"
              className="w-full sm:w-44"
            />

            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 border border-gray-100 dark:border-dark-700/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} type="card" />
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <EmptyState
            icon="search"
            title="No dishes found"
            description="Try expanding your search query or choosing another category."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('All');
              setIsVegFilter('All');
              setSortBy('rating');
            }}
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {menuItems.map((dish) => (
                <motion.div
                  key={dish._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="group relative"
                >
                  <Card className="h-full overflow-hidden flex flex-col hover:-translate-y-1.5 transition-transform duration-300">
                    {/* Dish Image */}
                    <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-dark-800 flex-shrink-0">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Veg / Non-Veg Indicator */}
                      <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase text-white shadow-md ${
                        dish.isVeg ? 'bg-success-500' : 'bg-danger-500'
                      }`}>
                        {dish.isVeg ? 'Veg' : 'Non-Veg'}
                      </div>
                      
                      {/* Wishlist Icon */}
                      <button
                        onClick={() => handleToggleWishlist(dish._id)}
                        className={`absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-dark-900/80 hover:text-danger-500 backdrop-blur-sm transition-colors shadow-sm ${
                          wishlist.includes(dish._id) ? 'text-danger-500 fill-danger-500' : 'text-gray-500'
                        }`}
                      >
                        <HiOutlineHeart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Dish Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500">
                            {dish.category}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                            <HiOutlineStar className="w-3.5 h-3.5 fill-amber-400" />
                            {dish.ratings.average.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-dark-800 dark:text-white line-clamp-1 mb-2 group-hover:text-primary-500 transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-dark-400 line-clamp-2 leading-relaxed mb-4">
                          {dish.description}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-dark-700/50">
                          <div>
                            <p className="text-xs text-gray-400 dark:text-dark-500">Price</p>
                            <span className="text-xl font-black text-dark-800 dark:text-white">
                              ₹{dish.price}
                            </span>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => addToCart(dish, 1)}
                            disabled={!dish.isAvailable}
                          >
                            <HiOutlineShoppingCart className="w-4 h-4" />
                            {dish.isAvailable ? 'Add' : 'Sold Out'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
