import { motion } from 'framer-motion';
import { HiDocumentText, HiOutlineGlobeAlt, HiScale } from 'react-icons/hi';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-8 sm:p-12 shadow-sm">
        
        {/* Header */}
        <div className="border-b border-gray-150 dark:border-dark-800 pb-8 mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold font-display text-dark-800 dark:text-white sm:text-4xl">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: June 30, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm text-gray-600 dark:text-dark-300 leading-relaxed">
          
          <section className="flex gap-4">
            <HiOutlineGlobeAlt className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">1. Use of the Platform</h2>
              <p>
                By registering an account with Rasoi Junction and ordering food or booking tables, you agree to comply with our Terms of Service. You represent that you are at least 18 years of age and the delivery coordinates provided are accurate.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <HiDocumentText className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">2. Order Placement & Billing</h2>
              <p>
                We reserve the right to refuse or cancel any orders in the event of stock sold-out states, pricing discrepancies, or delivery logistics constraints. All prices are in Indian Rupees (INR) and are subject to dynamic GST taxes and delivery charges calculated at checkout.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <HiScale className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">3. Limitations of Liability</h2>
              <p>
                Rasoi Junction is not responsible for any indirect or consequential damages resulting from platform latency, delivery rider delays, food temperature variations, or simulated credit card processing failures. All services are provided on an "as-is" basis.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-100 dark:border-dark-800 pt-8 mt-8">
            <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">4. Contact Information</h2>
            <p>
              For legal support, inquiries regarding license agreements, intellectual property claims, or brand partnership terms, please reach out to hell@rasoijunction.com or mail us at Parul University, Vadodara, Gujarat.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default TermsOfServicePage;
