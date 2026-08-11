import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  HiOutlinePrinter,
  HiOutlineDownload,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await api.get(`/payments/order/${orderId}`);
        setPayment(res.data);
      } catch (err) {
        toast.error('Failed to load transaction billing invoice.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    toast.loading('Generating invoice PDF...', { id: 'pdf-toast' });
    try {
      // Create a temporary hidden container at the end of the body
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.background = '#ffffff';
      tempContainer.style.color = '#111827';
      document.body.appendChild(tempContainer);

      // Clone the invoice element
      const clone = element.cloneNode(true);
      
      // Force clean light theme styles on the clone
      clone.style.width = '800px';
      clone.style.background = '#ffffff';
      clone.style.color = '#111827';
      clone.style.padding = '32px';
      clone.className = 'bg-white p-8 space-y-6';

      // Recursively clean up dark classes inside the clone
      const allElements = clone.querySelectorAll('*');
      allElements.forEach((el) => {
        el.style.color = '';
        el.style.backgroundColor = '';
        if (el.classList.contains('dark:bg-dark-800') || el.classList.contains('bg-gray-50')) {
          el.classList.remove('dark:bg-dark-800', 'bg-gray-50');
          el.classList.add('bg-gray-50');
          el.style.backgroundColor = '#f9fafb';
        }
        if (el.classList.contains('dark:border-dark-800') || el.classList.contains('border-gray-100')) {
          el.classList.remove('dark:border-dark-800', 'border-gray-100');
          el.classList.add('border-gray-200');
          el.style.borderColor = '#e5e7eb';
        }
        el.classList.remove('dark:text-white', 'dark:text-dark-200', 'dark:text-dark-300', 'dark:bg-dark-900', 'dark:bg-dark-800', 'text-white', 'text-gray-400');
        el.classList.add('text-gray-800');
      });

      tempContainer.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2, // high resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Cleanup
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice_${orderId}.pdf`);
      toast.success('Invoice PDF downloaded successfully!', { id: 'pdf-toast' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF.', { id: 'pdf-toast' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 p-6">
        <LoadingSkeleton type="table" count={3} className="w-full max-w-2xl" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-950 p-6 text-center">
        <h2 className="text-xl font-bold text-dark-800 dark:text-white mb-2">Invoice Not Found</h2>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const { orderRef } = payment;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Toolbar (Hidden in print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-2xl shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse" />
            <span className="text-sm font-bold text-success-600 dark:text-success-400">Payment Success</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1 text-xs">
              <HiOutlinePrinter className="w-4 h-4" /> Print
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadPDF} className="gap-1 text-xs">
              <HiOutlineDownload className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Printable Invoice Sheet Container */}
        <div 
          ref={invoiceRef}
          className="relative bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-8 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0"
        >
          {/* Background Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0" style={{ opacity: 0.15 }}>
            <img src="/logo.png" alt="Watermark" className="w-80 h-80 object-contain" />
          </div>

          {/* Header row with logo */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-dark-800 pb-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Rasoi Junction" className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <h2 className="text-2xl font-bold font-display text-dark-800 dark:text-white">Rasoi Junction</h2>
                <p className="text-xs text-primary-500 font-bold uppercase tracking-wider">Where Tradition Meets Technology</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-400">Tax Invoice / Bill of Supply</p>
              <h3 className="text-lg font-mono font-bold text-primary-500 mt-1">{payment.invoiceNumber}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">GSTIN: 07AAAAA1111A1Z1 (Sample)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">rasoijunction.admin@gmail.com</p>
            </div>
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600 dark:text-dark-300 bg-gray-50 dark:bg-dark-800 p-4 rounded-2xl">
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Order ID</p>
              <p className="font-mono font-bold text-dark-800 dark:text-white mt-0.5">{payment.orderId}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Payment ID</p>
              <p className="font-mono font-bold text-dark-800 dark:text-white mt-0.5">{payment.paymentId}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Transaction ID</p>
              <p className="font-mono font-bold text-dark-800 dark:text-white mt-0.5">{payment.transactionId}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Date & Time</p>
              <p className="font-semibold text-dark-800 dark:text-white mt-0.5">{payment.paymentDate} at {payment.paymentTime}</p>
            </div>
          </div>

          {/* Customer and Billing profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600 dark:text-dark-300">
            <div>
              <h4 className="font-bold text-dark-800 dark:text-white uppercase tracking-wider text-[10px] text-gray-400 mb-2">Customer details</h4>
              <p className="font-bold text-dark-800 dark:text-white">{payment.customerName}</p>
              <p>Email: {payment.email}</p>
              <p>Phone: {orderRef?.user?.phone || payment.mobileNumber}</p>
            </div>
            <div>
              <h4 className="font-bold text-dark-800 dark:text-white uppercase tracking-wider text-[10px] text-gray-400 mb-2">Billing coordinates</h4>
              <p>{payment.billingAddress.street}</p>
              <p>{payment.billingAddress.city}, {payment.billingAddress.pincode}</p>
              <p className="mt-1.5 font-bold text-dark-700 dark:text-dark-300">
                Payment: {payment.paymentMethod.toUpperCase()} {payment.upiId ? `(${payment.upiId})` : payment.maskedCardNumber ? `(${payment.maskedCardNumber})` : ''}
              </p>
              <p className="text-[10px] text-success-500 font-bold flex items-center gap-1 mt-0.5">
                <HiOutlineCheckCircle className="w-3.5 h-3.5" /> STATUS: SUCCESSFUL
              </p>
            </div>
          </div>

          {/* Placed Items Table */}
          <div className="border-t border-gray-100 dark:border-dark-800 pt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-800 text-gray-400 uppercase font-semibold text-[9px] tracking-wider">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-850">
                {orderRef?.items?.map((item, idx) => (
                  <tr key={idx} className="text-dark-700 dark:text-dark-200">
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

          {/* Grand Pricing Summary */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-800">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-dark-800 dark:text-white">₹{orderRef?.subtotal || payment.amountPaid}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (5%)</span>
                <span className="font-semibold text-dark-800 dark:text-white">₹{orderRef?.tax || 0}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charges</span>
                <span className="font-semibold text-dark-800 dark:text-white">₹{orderRef?.deliveryCharges || 0}</span>
              </div>
              {orderRef?.discount > 0 && (
                <div className="flex justify-between text-success-500 font-bold">
                  <span>Discount</span>
                  <span>-₹{orderRef.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-dark-800 dark:text-white border-t border-gray-100 dark:border-dark-800 pt-2.5">
                <span>Total Amount Paid</span>
                <span className="text-lg font-black text-primary-500 font-display">₹{payment.amountPaid}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-gray-400 pt-6 border-t border-gray-100 dark:border-dark-800">
            <p>Thank you for ordering from Rasoi Junction.</p>
            <p className="mt-0.5">This is a simulated transaction record for college software project exhibition purposes.</p>
          </div>
        </div>

        {/* Operational buttons (Hidden in print) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 print:hidden">
          <Link to="/" className="btn-outline flex items-center gap-1.5 py-2.5 px-5 text-sm">
            <HiOutlineHome className="w-4 h-4" /> Back to Home
          </Link>
          <Link to="/customer/dashboard" className="btn-primary flex items-center gap-1.5 py-2.5 px-5 text-sm">
            <HiOutlineClipboardList className="w-4 h-4" /> View Orders
          </Link>
          <Link to="/menu" className="btn-outline flex items-center gap-1.5 py-2.5 px-5 text-sm">
            Order Again
          </Link>
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;
