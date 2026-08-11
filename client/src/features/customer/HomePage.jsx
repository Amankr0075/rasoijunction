import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineCalendar,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineSparkles,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Animated counter hook
const useCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return { count, ref };
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const categories = [
    { name: 'North Indian', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80', count: 45 },
    { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80', count: 32 },
    { name: 'Chinese', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80', count: 28 },
    { name: 'Italian', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', count: 20 },
    { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80', count: 18 },
    { name: 'Beverages', image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=400&q=80', count: 15 },
  ];

  const featuredDishes = [
    { name: 'Butter Chicken', price: 350, rating: 4.8, reviews: 234, category: 'North Indian', isVeg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80' },
    { name: 'Paneer Tikka', price: 280, rating: 4.7, reviews: 189, category: 'North Indian', isVeg: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80' },
    { name: 'Masala Dosa', price: 150, rating: 4.9, reviews: 312, category: 'South Indian', isVeg: true, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80' },
    { name: 'Chicken Biryani', price: 320, rating: 4.8, reviews: 456, category: 'North Indian', isVeg: false, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80' },
  ];

  const [testimonials, setTestimonials] = useState([]);

  const [ordersCount, setOrdersCount] = useState(0);
  const [dishesCount, setDishesCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const isStaffOrAdmin = isAuthenticated && ['admin', 'manager', 'staff'].includes(user?.role);
        
        const [ordersRes, menuRes, usersRes, reviewsRes] = await Promise.all([
          isStaffOrAdmin ? api.get('/orders').catch(() => null) : null,
          api.get('/menu').catch(() => null),
          isStaffOrAdmin ? api.get('/auth/users').catch(() => null) : null,
          api.get('/reviews').catch(() => null)
        ]);
        
        const orders = ordersRes?.data || [];
        const menuItems = menuRes?.data || [];
        const users = usersRes?.data?.users || [];
        const reviews = reviewsRes?.reviews || [];
        
        if (isStaffOrAdmin) {
          setOrdersCount(orders.length);
          setCustomersCount(users.filter(u => u.role === 'customer').length);
        }
        if (menuItems && menuItems.length > 0) {
          setDishesCount(menuItems.length);
        }
        if (reviews && reviews.length > 0) {
          setTestimonials(reviews.slice(0, 3).map(r => ({
            id: r._id,
            name: r.customerName || 'Happy Customer',
            review: r.comment,
            rating: r.rating || 5,
            avatar: (r.customerName || 'H').charAt(0).toUpperCase()
          })));
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };
    fetchStats();
  }, [isAuthenticated, user]);

  const ordersCounter = useCounter(ordersCount || 10);
  const dishesCounter = useCounter(dishesCount || 50);
  const ratingCounter = useCounter(48);
  const customersCounter = useCounter(customersCount || 5);

  return (
    <div className="overflow-hidden">
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url(/hotel_bg.png)' }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} custom={0} className="mb-6">
              <motion.img 
                animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                src="/logo.png" 
                alt="Rasoi Junction" 
                className="h-32 w-32 sm:h-40 sm:w-40 mx-auto mb-6 rounded-3xl object-cover bg-white/10 p-2 shadow-2xl shadow-black/30 backdrop-blur-sm border border-white/10" 
              />
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium"
              >
                <HiOutlineSparkles className="w-4 h-4" />
                Premium Indian Dining Experience
              </motion.span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-white leading-tight mb-6"
            >
              Welcome to{' '}
              <span className="text-gradient">Rasoi Junction</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-4"
            >
              Good Food • Good Mood • Good Times
            </motion.p>

            <motion.p
              variants={fadeInUp}
              custom={3}
              className="text-base text-dark-500 max-w-xl mx-auto mb-10"
            >
              Experience authentic Indian flavors with seamless online ordering,
              real-time tracking, and a premium dining experience.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={4}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/menu" className="btn-primary text-lg px-8 py-4 gap-2">
                <HiOutlineShoppingBag className="w-5 h-5" />
                Order Now
              </Link>
              <Link to="/reservations" className="btn-outline text-lg px-8 py-4 gap-2 border-white/20 text-white hover:bg-white hover:text-dark-900">
                <HiOutlineCalendar className="w-5 h-5" />
                Book Table
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { label: 'Orders Served', value: ordersCounter.count, suffix: '+', ref: ordersCounter.ref },
              { label: 'Dishes', value: dishesCounter.count, suffix: '+', ref: dishesCounter.ref },
              { label: 'Rating', value: (ratingCounter.count / 10).toFixed(1), suffix: '★', ref: ratingCounter.ref },
              { label: 'Happy Customers', value: customersCounter.count, suffix: '+', ref: customersCounter.ref },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  {stat.value}{stat.suffix}
                </p>
                <p className="text-sm text-dark-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-dark-600 flex justify-center">
            <div className="w-1.5 h-3 bg-dark-500 rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* ─── Categories Section ───────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="section-title">
              Explore Our <span className="text-gradient">Cuisine</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="section-subtitle">
              Discover a world of flavors across multiple categories
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => navigate(`/menu?category=${encodeURIComponent(cat.name)}`)}
                className="relative h-44 rounded-2xl overflow-hidden cursor-pointer group shadow-card hover:shadow-premium transition-all duration-300"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-center z-10">
                  <h3 className="font-bold text-white text-base font-accent tracking-wide drop-shadow">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-primary-300 font-semibold mt-1">
                    {cat.count} items
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Featured Dishes Section ──────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <motion.h2 variants={fadeInUp} className="section-title">
                Today's <span className="text-gradient">Specials</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="section-subtitle">
                Chef's handpicked dishes for today
              </motion.p>
            </div>
            <motion.div variants={fadeInUp}>
              <Link to="/menu" className="hidden sm:flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors">
                View Full Menu <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredDishes.map((dish, i) => (
              <motion.div
                key={dish.name}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -8 }}
                className="card overflow-hidden group cursor-pointer"
              >
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={dish.image} 
                    alt={dish.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md ${
                    dish.isVeg
                      ? 'bg-success-500 text-white'
                      : 'bg-danger-500 text-white'
                  }`}>
                    {dish.isVeg ? 'Veg' : 'Non-Veg'}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-primary-500 font-medium mb-1">{dish.category}</p>
                  <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-2">
                    {dish.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-sm text-amber-500">
                      <HiOutlineStar className="w-4 h-4 fill-amber-400" />
                      {dish.rating}
                    </span>
                    <span className="text-xs text-gray-400">({dish.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-dark-800 dark:text-white">
                      ₹{dish.price}
                    </span>
                    <button 
                      onClick={() => navigate('/menu')}
                      className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works Section ─────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="section-title">
              How It <span className="text-gradient">Works</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="section-subtitle">
              Three simple steps to your perfect meal
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: HiOutlineShoppingBag,
                title: 'Browse & Order',
                description: 'Explore our extensive menu, add your favorites to cart, and place your order in seconds.',
                step: '01',
              },
              {
                icon: HiOutlineClock,
                title: 'Track in Real-time',
                description: 'Watch your order being prepared with live status updates from kitchen to your doorstep.',
                step: '02',
              },
              {
                icon: HiOutlineTruck,
                title: 'Enjoy Your Meal',
                description: 'Receive hot, fresh food at your door or dine-in at our beautifully reserved table.',
                step: '03',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                custom={i}
                className="relative text-center group"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:shadow-glow transition-all duration-300"
                >
                  <item.icon className="w-9 h-9 text-primary-500 group-hover:text-white transition-colors" />
                </motion.div>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-6xl font-bold text-gray-100 dark:text-dark-800 font-display">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-dark-800 dark:text-white mb-3 relative">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-dark-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Testimonials Section ─────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="section-title">
              What Our <span className="text-gradient">Guests</span> Say
            </motion.h2>
            <motion.p variants={fadeInUp} className="section-subtitle">
              Real reviews from our happy customers
            </motion.p>
          </motion.div>

          {testimonials.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              className="text-center py-12 glass-card max-w-lg mx-auto bg-white/50 dark:bg-dark-950/20 backdrop-blur"
            >
              <HiOutlineStar className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500 dark:text-dark-400 font-medium">
                No guest reviews published yet. Order today and share your gourmet feedback!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.id || i}
                  variants={fadeInUp}
                  custom={i}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <HiOutlineStar
                        key={j}
                        className={`w-5 h-5 ${
                          j < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-dark-600 dark:text-dark-300 text-sm leading-relaxed mb-6">
                    "{testimonial.review}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark-800 dark:text-white">{testimonial.name}</p>
                      <p className="text-xs text-gray-400">Verified Customer</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-saffron-500">
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }} 
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} 
            className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" 
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }} 
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} 
            className="absolute bottom-10 right-10 w-60 h-60 border border-white/20 rounded-full" 
          />
          <motion.div 
            animate={{ rotate: [0, 180, 360], scale: [1, 1.05, 1] }} 
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-dashed border-2 border-white/10 rounded-full" 
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-bold font-display text-white mb-6"
            >
              Ready to Experience<br />Amazing Food?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-white/80 text-lg mb-10 max-w-xl mx-auto"
            >
              Join thousands of food lovers who've discovered their new favorite restaurant.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Explore Menu
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
