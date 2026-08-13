import { motion } from 'framer-motion';
import { HiShieldCheck, HiLockClosed, HiEye } from 'react-icons/hi';

export const PrivacyContent = () => (
  <div className="space-y-8 text-sm text-gray-600 dark:text-dark-300 leading-relaxed">

    <section className="flex gap-4">
      <HiShieldCheck className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
      <div>
        <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">1. Information We Collect</h2>
        <p>
          We collect personal information that you provide to us, including your name, email address, mobile number, and physical address for delivery. If you book a table reservation, we collect guest counts and dining details. We do not store full payment card details directly; all transactions are processed through secure gateways.
        </p>
      </div>
    </section>

    <section className="flex gap-4">
      <HiLockClosed className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
      <div>
        <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">2. How We Protect Your Data</h2>
        <p>
          Your security is our top priority. We use industry-standard encryption protocols (SSL/TLS) to protect data transmissions. Your password details are securely hashed on our backend databases using one-way cryptographic algorithms, ensuring unauthorized actors cannot access your login credentials.
        </p>
      </div>
    </section>

    <section className="flex gap-4">
      <HiEye className="w-8 h-8 text-primary-500 flex-shrink-0 mt-1" />
      <div>
        <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">3. Sharing Your Information</h2>
        <p>
          We do not sell, rent, or trade your personal information. We only share details with trusted third parties necessary for fulfillment, such as delivery riders to locate your address, or credit card processors to simulate financial gateway approvals.
        </p>
      </div>
    </section>

    <section className="border-t border-gray-100 dark:border-dark-800 pt-8 mt-8">
      <h2 className="text-lg font-bold text-dark-800 dark:text-white mb-2">4. Your Rights</h2>
      <p>
        You have the right to request details of the information we hold about you, request updates to incorrect details, or request that your profile be permanently deactivated from our system. If you have any inquiries regarding data protection, please contact rasoijunction.admin@gmail.com.
      </p>
    </section>

  </div>
);

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-8 sm:p-12 shadow-sm">

        {/* Header */}
        <div className="border-b border-gray-150 dark:border-dark-800 pb-8 mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold font-display text-dark-800 dark:text-white sm:text-4xl">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: June 30, 2026</p>
        </div>

        {/* Content */}
        <PrivacyContent />

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
