import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiSearch, HiQuestionMarkCircle } from 'react-icons/hi';
import Card from '../../components/ui/Card';

const faqs = [
  {
    category: 'Ordering & Delivery',
    questions: [
      {
        q: 'What are your delivery hours?',
        a: 'We deliver daily from 11:00 AM to 11:00 PM. Last order can be placed up to 10:45 PM.'
      },
      {
        q: 'Is there a minimum order value for delivery?',
        a: 'Yes, the minimum order value for delivery is ₹200. Orders above ₹500 qualify for free delivery.'
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order is placed, you can track its real-time preparation and delivery status directly from your Customer Dashboard in the "Orders" tab.'
      }
    ]
  },
  {
    category: 'Payments & Refunds',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit/debit cards, UPI payments, and Cash on Delivery (COD).'
      },
      {
        q: 'How does the refund policy work?',
        a: 'If your order is cancelled before kitchen preparation starts, a full refund is processed. For delivered items with quality issues, please contact support for a partial or full refund.'
      }
    ]
  },
  {
    category: 'Reservations & Dine-in',
    questions: [
      {
        q: 'How do I book a table reservation?',
        a: 'You can easily reserve a table online through our Reservations page by selecting your date, time, and number of guests. It is completely free!'
      },
      {
        q: 'Can I modify or cancel my reservation?',
        a: 'Yes, you can view, modify, or cancel your active table bookings from your profile dashboard under the "Reservations" tab.'
      }
    ]
  }
];

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = ['All', ...faqs.map(f => f.category)];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQs based on category and search query
  const filteredFAQs = faqs.flatMap((cat, catIdx) => 
    cat.questions
      .filter(q => 
        (activeCategory === 'All' || cat.category === activeCategory) &&
        (q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
         q.a.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map((q, idx) => ({ ...q, category: cat.category, id: `${catIdx}-${idx}` }))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <HiQuestionMarkCircle className="w-4 h-4" />
            Support Center
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold font-display text-dark-800 dark:text-white sm:text-5xl"
          >
            Frequently Asked <span className="text-gradient">Questions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-lg text-gray-500 dark:text-dark-400 max-w-xl mx-auto"
          >
            Find quick answers to common questions about ordering food, payments, table bookings, and delivery services.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-xl mx-auto mb-10"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiSearch className="h-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400 text-sm transition-all"
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 uppercase ${
                activeCategory === cat
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white dark:bg-dark-900 text-gray-600 dark:text-dark-400 border border-gray-200 dark:border-dark-800 hover:bg-gray-100 dark:hover:bg-dark-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div 
          layout
          className="space-y-4"
        >
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => {
              const isOpen = openIndex === faq.id;
              return (
                <motion.div 
                  key={faq.id}
                  layout
                  className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-dark-800 text-[10px] font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-bold text-dark-800 dark:text-white">
                        {faq.q}
                      </h3>
                    </div>
                    <HiChevronDown 
                      className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-sm text-gray-600 dark:text-dark-300 border-t border-gray-50 dark:border-dark-800">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-dark-400">No questions matched your search criteria.</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default FAQPage;
