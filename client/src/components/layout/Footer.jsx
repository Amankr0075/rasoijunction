import { Link } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineChatAlt2,
} from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-dark-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Rasoi Junction" className="h-10 w-10 rounded-full object-cover bg-white shadow-sm" />
              <div>
                <h3 className="text-xl font-bold font-display text-white">Rasoi Junction</h3>
                <p className="text-[10px] tracking-widest text-dark-500 uppercase">Good Food • Good Mood • Good Times</p>
              </div>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed mb-6">
              Experience the finest Indian cuisine with modern convenience. Order online, reserve tables, and enjoy authentic flavors delivered to your doorstep.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaTwitter, href: '#' },
                { icon: FaYoutube, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-400 hover:bg-primary-500 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'Menu', to: '/menu' },
                { label: 'Reservations', to: '/reservations' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'FAQ', to: '/faq' },
                { label: 'Privacy Policy', to: '/privacy-policy' },
                { label: 'Terms of Service', to: '/terms-of-service' },
                { label: 'Refund Policy', to: '/refund-policy' },
                { label: 'Share Feedback', to: '/customer/feedback' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-dark-400">
                  Parul University,<br />
                  Vadodara, Gujarat, 391760
                </span>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlinePhone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-dark-400">1234567890</span>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlineMail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-dark-400">rasoijunction.admin@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500">
            © {currentYear} Rasoi Junction. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-dark-500">
            <Link
              to="/customer/feedback"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-200 font-semibold text-xs"
            >
              <HiOutlineChatAlt2 className="w-4 h-4" />
              Share Feedback
            </Link>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
