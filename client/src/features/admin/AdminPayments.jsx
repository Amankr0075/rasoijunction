import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineDocumentReport, HiOutlineDownload } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err) {
      toast.error('Failed to load transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDownloadInvoice = (orderId) => {
    navigate(`/orders/invoice/${orderId}`);
  };

  const filteredPayments = payments.filter((p) =>
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.orderId.toLowerCase().includes(search.toLowerCase()) ||
    p.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Invoice No', field: 'invoiceNumber', render: (num) => <span className="font-semibold text-dark-800 dark:text-white">{num}</span> },
    { header: 'Order ID', field: 'orderId', render: (id) => <span className="font-mono font-bold text-primary-500">{id}</span> },
    { header: 'Customer', field: 'customerName' },
    { header: 'Method', field: 'paymentMethod', render: (m) => <span className="uppercase text-xs font-semibold">{m.replace('_', ' ')}</span> },
    { header: 'Amount Paid', field: 'amountPaid', render: (amt) => `₹${amt}` },
    { header: 'Status', field: 'paymentStatus', render: (status) => <Badge variant="success" dot>{status}</Badge> },
    { header: 'Date', field: 'paymentDate' },
    { header: 'Time', field: 'paymentTime' },
    {
      header: 'Actions',
      field: 'orderId',
      render: (orderId) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-2.5 py-1 text-xs"
          onClick={() => handleDownloadInvoice(orderId)}
        >
          <HiOutlineDocumentReport className="w-4 h-4" /> View Invoice
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Transaction Logs & Auditing</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">View simulated payments, audit invoice slips, and track revenue flow.</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative max-w-xs w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoice, order, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl text-sm w-full"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredPayments}
            loading={loading}
            emptyMessage="No billing transaction logs matching filters."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPayments;
