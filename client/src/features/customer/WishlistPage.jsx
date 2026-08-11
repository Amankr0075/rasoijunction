import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingCart, HiOutlineTrash, HiOutlineArrowRight } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { addToCart } = useCart();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        setMenuItems(res.data || []);
      } catch (err) {
        console.error('Failed to load menu items:', err);
        toast.error('Failed to load menu items.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleRemoveFromWishlist = (id) => {
    const updated = wishlistIds.filter((item) => item !== id);
    setWishlistIds(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const wishlistedItems = menuItems.filter((item) => wishlistIds.includes(item._id));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white flex items-center gap-2">
            <HiOutlineHeart className="w-6 h-6 text-danger-500 fill-danger-500" /> My Gourmet Wishlist
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Manage your favorite dishes and add them directly to your order.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="h-80 animate-pulse bg-gray-100 dark:bg-dark-800" />
            ))}
          </div>
        ) : wishlistedItems.length === 0 ? (
          <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-danger-50 dark:bg-danger-500/10 rounded-full flex items-center justify-center mx-auto text-danger-500">
              <HiOutlineHeart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-dark-800 dark:text-white">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400">
              Explore our menu to add your favorite recipes and gourmet delights here!
            </p>
            <Link to="/menu" className="inline-block">
              <Button variant="primary" className="gap-2">
                Explore Menu <HiOutlineArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {wishlistedItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden flex flex-col h-full group relative">
                    {/* Dish Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <img
                        src={item.image || '/dish_fallback.png'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Veg / Non-Veg Indicator */}
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.isVeg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-dark-800 dark:text-white group-hover:text-primary-500 transition-colors text-base line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="font-black text-primary-500 text-sm">₹{item.price}</span>
                        </div>
                        <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-dark-700/50">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 py-2 text-xs"
                          onClick={() => handleAddToCart(item)}
                        >
                          <HiOutlineShoppingCart className="w-4 h-4" /> Add to Cart
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 p-2"
                          onClick={() => handleRemoveFromWishlist(item._id)}
                          title="Remove from Wishlist"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WishlistPage;
