import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineSearch, HiOutlineCheck, HiOutlineX, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { generateReservationExcelReport } from '../../utils/generateReservationExcelReport';
import { HiOutlineDownload } from 'react-icons/hi';
import Select from '../../components/ui/Select';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  
  // Assign Table Modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [tableNumber, setTableNumber] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [waitstaff, setWaitstaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');

  // Invoice Modal
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth());
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportMode, setExportMode] = useState('monthly');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (err) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/users', { params: { limit: 100 } });
      const usersList = res.data.users || [];
      const staffList = usersList
        .filter((u) => u.role === 'staff')
        .map((u) => ({ label: `${u.name} (Staff)`, value: u._id }));
      
      if (staffList.length === 0) {
        staffList.push({ label: 'Staff Waitstaff', value: '654321098765432109876545' });
      }
      setWaitstaff(staffList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchStaff();
  }, []);

  const handleUpdateStatus = async (id, status, tableNum = '') => {
    try {
      await api.put(`/reservations/${id}/status`, { status, tableNumber: tableNum });
      toast.success(`Booking status set to ${status}`);
      fetchReservations();
    } catch (err) {
      toast.error('Failed to update reservation');
    }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      toast.success('Reservation deleted successfully.');
      fetchReservations();
    } catch (err) {
      toast.error('Failed to delete reservation');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    setSubmitLoading(true);
    try {
      await api.put(`/reservations/${selectedRes._id}/status`, {
        status: 'approved',
        tableNumber,
      });

      if (selectedStaff) {
        await api.put(`/reservations/${selectedRes._id}/assign`, {
          staffId: selectedStaff
        });
      }

      toast.success('Reservation approved and table/staff assigned!');
      setAssignOpen(false);
      fetchReservations();
    } catch (err) {
      toast.error('Failed to assign table/staff.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExportExcel = async () => {
    let filteredRes = reservations;
    let periodStr = '';
    
    if (exportMode === 'yearly') {
      filteredRes = reservations.filter(r => new Date(r.date || r.createdAt).getFullYear() === Number(exportYear));
      periodStr = `${exportYear}`;
    } else {
      filteredRes = reservations.filter(r => {
        const d = new Date(r.date || r.createdAt);
        return d.getMonth() === Number(exportMonth) && d.getFullYear() === Number(exportYear);
      });
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      periodStr = `${months[exportMonth]} ${exportYear}`;
    }

    if (filteredRes.length === 0) {
      toast.error(`No reservations found for ${periodStr}`);
      return;
    }
    
    try {
      await generateReservationExcelReport(filteredRes, periodStr);
      toast.success('Excel report generated successfully!');
      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel report');
    }
  };

  const now = new Date();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  const isHistory = (r) => {
    if (r.status === 'completed' || r.status === 'rejected' || r.status === 'cancelled') {
      const updatedTime = new Date(r.updatedAt || r.date).getTime();
      return (now - updatedTime) > ONE_DAY;
    }
    return false;
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    const inHistory = isHistory(r);
    const matchesTab = activeTab === 'history' ? inHistory : !inHistory;
    return matchesSearch && matchesTab;
  });

  const columns = [
    { header: 'Guest Name', field: 'name', render: (name, row) => <span className="font-semibold">{name} <p className="text-[10px] text-gray-400 font-normal">{row.phone}</p></span> },
    { header: 'Guests', field: 'guests' },
    { header: 'Date', field: 'date', render: (d) => new Date(d).toLocaleDateString() },
    { header: 'Time Slot', field: 'timeSlot' },
    {
      header: 'Status',
      field: 'status',
      render: (status) => (
        <Badge variant={status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'} dot>
          {status}
        </Badge>
      ),
    },
    { header: 'Table', field: 'tableNumber', render: (t) => t ? `Table ${t}` : '—' },
    {
      header: 'Actions',
      field: '_id',
      render: (id, row) => (
        <div className="flex items-center gap-2">
          {/* View Invoice Button */}
          <button
            onClick={() => {
              setSelectedInvoice(row);
              setInvoiceOpen(true);
            }}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-105 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 transition-colors"
            title="View Invoice"
          >
            <HiOutlineDocumentText className="w-4 h-4" />
          </button>

          {/* Approve/Assign Button */}
          {activeTab !== 'history' && (
            <button
              onClick={() => {
                setSelectedRes(row);
                setTableNumber(row.tableNumber || '');
                setSelectedStaff(row.assignedStaff?._id || '');
                setAssignOpen(true);
              }}
              className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-success-600 transition-colors"
              title="Approve / Allocate Table"
            >
              <HiOutlineCheck className="w-4 h-4" />
            </button>
          )}
          
          {/* Reject Button (only show if not already rejected) */}
          {activeTab !== 'history' && row.status !== 'rejected' && (
            <button
              onClick={() => handleUpdateStatus(id, 'rejected')}
              className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors"
              title="Reject Booking"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button */}
          {activeTab !== 'history' && (
            <button
              onClick={() => handleDeleteReservation(id)}
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-danger-600 transition-colors"
              title="Delete Reservation"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}

          {/* Show assigned staff in history mode */}
          {activeTab === 'history' && row.assignedStaff && (
            <span className="text-[10px] bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-300 px-2 py-1 rounded-md font-bold">
              Staff: {row.assignedStaff.name}
            </span>
          )}
        </div>
      ),
    },
  ];

  const totalRevenue = reservations
    .filter((r) => r.paymentStatus === 'paid' || r.status === 'approved' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.amount || 199), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Reservations Bookings Console</h1>
            <p className="text-sm text-gray-500 dark:text-dark-400">Review guest requests and allocate restaurant seating tables.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 px-6 py-3 rounded-2xl flex flex-col items-end shadow-sm">
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-0.5">Total Revenue</span>
              <span className="text-2xl font-black text-primary-500">₹{totalRevenue.toLocaleString('en-IN')}.00</span>
            </div>
            <Button 
              variant="outline" 
              className="gap-2 h-full py-4 whitespace-nowrap"
              onClick={() => setShowExportModal(true)}
            >
              <HiOutlineDownload className="w-5 h-5" /> Export Bookings
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-800 rounded-xl">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'current'
                    ? 'bg-white dark:bg-dark-700 text-dark-800 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Current Bookings
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-dark-700 text-dark-800 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Reservation History
              </button>
            </div>
            
            <div className="relative max-w-xs w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guest name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl text-sm w-full"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredReservations}
            loading={loading}
            emptyMessage="No table reservation tickets matched criteria."
          />
        </Card>

        {/* Allocate Seating Modal */}
        <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Allocate Seating Table">
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                Allocate table for <strong>{selectedRes?.name}</strong> ({selectedRes?.guests} guests).
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Table Designation Number</label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="E.g. 12, A-3"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Assign Waitstaff (Optional)</label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                  >
                    <option value="">-- No Staff Assigned --</option>
                    {waitstaff.map(staff => (
                      <option key={staff.value} value={staff.value}>{staff.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-700">
              <Button type="button" variant="ghost" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitLoading}>
                Allocate Table
              </Button>
            </div>
          </form>
        </Modal>

        {/* Invoice Modal */}
        {invoiceOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white">
            <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 print:border-none print:shadow-none print:rounded-none">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-dark-800 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Rasoi Junction" className="h-12 w-12 rounded-xl object-cover" />
                  <div className="space-y-0.5">
                    <h2 className="text-xl font-bold font-display text-primary-500">Rasoi Junction</h2>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Gourmet Dining Experience</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-bold font-display text-lg text-dark-800 dark:text-white">Rasoi Junction</h3>
                  <p className="text-xs text-gray-400 mt-1.5">Invoice #RES-{selectedInvoice._id?.slice(-6).toUpperCase() || 'NEW'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">rasoijunction.admin@gmail.com</p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-gray-400 mb-1">CUSTOMER DETAILS</p>
                  <p className="font-semibold text-dark-850 dark:text-white">{selectedInvoice.name}</p>
                  <p className="text-gray-500">{selectedInvoice.email}</p>
                  <p className="text-gray-500">{selectedInvoice.phone}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 mb-1">RESERVATION DETAILS</p>
                  <p className="font-semibold text-dark-850 dark:text-white">Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  <p className="text-gray-500">Slot: {selectedInvoice.timeSlot}</p>
                  <p className="text-gray-500">Guests: {selectedInvoice.guests}</p>
                  <p className="text-gray-500 font-bold text-primary-500">Assigned Table: Table {selectedInvoice.tableNumber}</p>
                </div>
              </div>

              {/* Receipt Calculation */}
              <div className="border-t border-b border-gray-150 dark:border-dark-800 py-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Base Booking Fee</span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{((selectedInvoice.amount || 199) / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{((selectedInvoice.amount || 199) - ((selectedInvoice.amount || 199) / 1.18)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-dashed border-gray-200 dark:border-dark-800 pt-2 text-primary-500">
                  <span>Total Paid</span>
                  <span>₹{(selectedInvoice.amount || 199).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Information */}
              {selectedInvoice.paymentDetails && (
                <div className="bg-gray-50 dark:bg-dark-800 p-3 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">PAYMENT INFORMATION</p>
                  <p className="text-dark-700 dark:text-dark-200">Name: <span className="font-semibold">{selectedInvoice.paymentDetails.customerName}</span></p>
                  <p className="text-dark-700 dark:text-dark-200">Mobile: <span className="font-semibold">{selectedInvoice.paymentDetails.mobileNumber}</span></p>
                  <p className="text-dark-700 dark:text-dark-200">UPI ID: <span className="font-mono font-semibold">{selectedInvoice.paymentDetails.upiId}</span></p>
                </div>
              )}

              {/* Footer Transaction Details */}
              <div className="text-[10px] text-gray-400 space-y-1">
                <p>Transaction ID: <span className="font-mono">{selectedInvoice.paymentId || 'N/A'}</span></p>
                <p>Payment Mode: UPI</p>
                <p className="text-center italic mt-4 text-xs font-semibold text-primary-500">Thank you for dining with us! See you soon.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-dark-800 print:hidden">
                <Button variant="outline" className="flex-1" onClick={() => setInvoiceOpen(false)}>
                  Close
                </Button>
                <Button variant="primary" className="flex-1 gap-2" onClick={() => window.print()}>
                  🖨️ Print Invoice
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* Export Excel Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Reservations Report">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Generate a professional Excel sheet summarizing reservation bookings.</p>
          
          <div>
            <label className="block text-sm font-medium mb-1">Report Mode</label>
            <Select 
              value={exportMode} 
              onChange={setExportMode} 
              options={[
                { label: 'Monthly Report', value: 'monthly' },
                { label: 'Yearly Report', value: 'yearly' }
              ]}
              className="w-full" 
            />
          </div>
          
          {exportMode === 'monthly' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Month</label>
              <Select 
                value={exportMonth} 
                onChange={setExportMonth} 
                options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => ({
                  label: m,
                  value: i
                }))}
                className="w-full" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Select Year</label>
            <Select 
              value={exportYear} 
              onChange={setExportYear} 
              options={[2024, 2025, 2026, 2027].map(y => ({
                label: y.toString(),
                value: y
              }))}
              className="w-full" 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowExportModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExportExcel} className="flex-1 gap-2">
              <HiOutlineDownload className="w-5 h-5" /> Download Excel
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminReservations;
