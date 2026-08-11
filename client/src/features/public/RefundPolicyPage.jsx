import { motion } from 'framer-motion';
import { HiCurrencyRupee, HiClock, HiCheckCircle } from 'react-icons/hi';

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-8 sm:p-12 shadow-sm">
        
        {/* Header */}
        <div className="border-b border-gray-150 dark:border-dark-800 pb-8 mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold font-display text-dark-800 dark:text-white sm:text-4xl">
            Refund & Cancellation <span className="text-gradient">Policy</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: June 30, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm text-gray-600 dark:text-dark-300 leading-relaxed">
          
          <section className="flex gap-4">
            <HiClock className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">1. Cancellation Window</h2>
              <p>
                You can cancel your order at any time before the kitchen team marks it as "accepted" or starts the cooking process. Once kitchen preparation begins, cancellations are not allowed and no refunds will be initiated.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <HiCurrencyRupee className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">2. Processing of Refunds</h2>
              <p>
                Approved refunds are credited back to your original payment method (Credit Card, Debit Card, or UPI account) within 5 to 7 business days, depending on bank processing timelines. For COD orders, cash refunds are not provided; instead, equivalent store credit / loyalty points will be added to your account.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <HiCheckCircle className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">3. Quality issues & Missing Items</h2>
              <p>
                If you receive an incorrect dish, food quality issues, or missing items in your delivery package, please raise a support ticket on our Contact page within 2 hours of order delivery. Our team will verify and initiate a partial or full refund as appropriate.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default RefundPolicyPage;
