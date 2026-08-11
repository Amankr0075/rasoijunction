import { HiOutlinePrinter, HiOutlineDownload, HiOutlineX } from 'react-icons/hi';
import Button from '../../components/ui/Button';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0">
      <div className="relative w-full max-w-2xl bg-white dark:bg-dark-900 rounded-3xl shadow-premium overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Header toolbar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-800 print:hidden">
          <h3 className="font-bold text-dark-800 dark:text-white text-lg">Order Receipt Invoice</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <HiOutlinePrinter className="w-4 h-4" /> Print
            </Button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 transition-colors">
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Body Content */}
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Logo & Info headers */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-dark-800 pb-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Rasoi Junction" className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <h2 className="font-bold text-dark-800 dark:text-white text-xl">Rasoi Junction</h2>
                <p className="text-[10px] text-primary-500 font-semibold uppercase tracking-wider">Good Food • Good Mood • Good Times</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-400">Invoice ID</p>
              <p className="text-base font-mono font-bold text-primary-500">{order.orderId}</p>
              <p className="text-[10px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-dark-300">
            <div>
              <p className="font-bold text-dark-800 dark:text-white uppercase tracking-wider text-[10px] text-gray-400 mb-1.5">Billed To</p>
              <p className="font-semibold text-dark-800 dark:text-white">{order.user?.name || 'Guest User'}</p>
              <p>{order.user?.email || 'N/A'}</p>
              <p>{order.user?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="font-bold text-dark-800 dark:text-white uppercase tracking-wider text-[10px] text-gray-400 mb-1.5">Delivery Coordinates</p>
              <p>{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.pincode}</p>
              <p className="mt-1 font-bold text-dark-700 dark:text-dark-300">Method: {order.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          {/* Items breakdown list */}
          <div className="border-t border-gray-100 dark:border-dark-800 pt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-800 text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-2.5">Item description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-800/50">
                {order.items.map((item, index) => (
                  <tr key={index} className="text-dark-700 dark:text-dark-200">
                    <td className="py-3 font-semibold">
                      {item.menuitem?.name || 'Gourmet Dish'} 
                      {item.menuitem?.category ? ` (${item.menuitem.category})` : ''}
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">₹{item.price}</td>
                    <td className="py-3 text-right font-bold">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Math calculations */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-800">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-dark-800 dark:text-white">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (5%)</span>
                <span className="font-semibold text-dark-800 dark:text-white">₹{order.tax}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charges</span>
                <span className="font-semibold text-dark-800 dark:text-white">₹{order.deliveryCharges}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success-500 font-bold">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-dark-800 dark:text-white border-t border-gray-100 dark:border-dark-800 pt-2.5">
                <span>Total Amount</span>
                <span className="text-lg font-black text-primary-500">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Invoice Footer note */}
          <div className="text-center text-[10px] text-gray-400 pt-6 border-t border-gray-100 dark:border-dark-800">
            <p>Thank you for choosing Rasoi Junction!</p>
            <p className="mt-0.5">Please scan QR code at billing counter to verify your transaction status.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
