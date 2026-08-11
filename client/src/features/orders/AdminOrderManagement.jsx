import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineEye, HiOutlineUserGroup, HiOutlineClock, HiOutlineTrash, HiOutlineOfficeBuilding } from 'react-icons/hi';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateExcelReport } from '../../utils/generateExcelReport';
import { HiOutlineDownload } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const AdminOrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Staff options lists for assignment
  const [chefs, setChefs] = useState([]);
  const [riders, setRiders] = useState([]);
  const [waitstaff, setWaitstaff] = useState([]);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [draftChanges, setDraftChanges] = useState({
    chefId: '',
    deliveryId: '',
    staffId: '',
    orderStatus: ''
  });

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth());
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportMode, setExportMode] = useState('monthly'); // 'monthly' or 'yearly'

  const statusOptions = [
    { label: 'All Orders', value: 'All' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Out for Delivery', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders catalog');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/users', { params: { limit: 100 } });
      const usersList = res.data.users || [];

      const chefsList = usersList
        .filter((u) => u.role === 'chef' || u.role === 'admin' || u.role === 'manager')
        .map((u) => ({ label: `${u.name} (${u.role.toUpperCase()})`, value: u._id }));

      const ridersList = usersList
        .filter((u) => u.role === 'delivery')
        .map((u) => ({ label: `${u.name} (Rider)`, value: u._id }));

      const staffList = usersList
        .filter((u) => u.role === 'staff')
        .map((u) => ({ label: `${u.name} (Staff)`, value: u._id }));

      if (chefsList.length === 0) {
        chefsList.push({ label: 'Chef Kitchen Chef', value: '654321098765432109876543' });
      }
      if (ridersList.length === 0) {
        ridersList.push({ label: 'Rider Delivery Rider', value: '654321098765432109876544' });
      }
      if (staffList.length === 0) {
        staffList.push({ label: 'Staff Waitstaff', value: '654321098765432109876545' });
      }

      setChefs(chefsList);
      setRiders(ridersList);
      setWaitstaff(staffList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff list');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  const handleSaveDraftChanges = async () => {
    try {
      if (!selectedOrder) return;
      const { chefId, deliveryId, staffId, orderStatus } = draftChanges;

      // Update assignments only if authorized
      if (user?.role === 'admin' || user?.role === 'manager') {
        await api.put(`/orders/${selectedOrder._id}/assign`, { chefId, deliveryId, staffId });
      }

      // Update status if it changed
      if (orderStatus !== selectedOrder.orderStatus) {
        await api.put(`/orders/${selectedOrder._id}/status`, { status: orderStatus });
      }

      toast.success('Order updated successfully!');
      fetchOrders();
      setDetailOpen(false);
    } catch (err) {
      console.error("Order Update Error:", err.response?.data || err.message);
      toast.error('Failed to update order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Order deleted successfully!');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setDetailOpen(false);
      }
    } catch (err) {
      toast.error('Failed to delete order.');
    }
  };

  const handleExportExcel = async () => {
    let filteredOrders = orders;
    let periodStr = '';

    if (exportMode === 'yearly') {
      filteredOrders = orders.filter(o => new Date(o.createdAt).getFullYear() === Number(exportYear));
      periodStr = `${exportYear}`;
    } else {
      filteredOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === Number(exportMonth) && d.getFullYear() === Number(exportYear);
      });
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      periodStr = `${months[exportMonth]} ${exportYear}`;
    }

    if (filteredOrders.length === 0) {
      toast.error(`No orders found for ${periodStr}`);
      return;
    }

    try {
      await generateExcelReport(filteredOrders, periodStr);
      toast.success('Excel report generated successfully!');
      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel report');
    }
  };

  const handleDeleteAllOrders = async () => {
    if (!window.confirm('CRITICAL WARNING: Are you sure you want to delete ALL orders in the database? This cannot be undone!')) {
      return;
    }
    try {
      await api.delete('/orders/all');
      toast.success('All orders have been permanently deleted.');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete all orders.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || 'Guest User').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Order ID',
      field: 'orderId',
      render: (id, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-primary-500">{id}</span>
          {row.orderType === 'dine-in' ? (
            <Badge variant="primary" className="text-[9px]">Dine-in (Table {row.tableNumber})</Badge>
          ) : (
            <Badge variant="neutral" className="text-[9px]">Delivery</Badge>
          )}
        </div>
      )
    },
    { header: 'Customer', field: 'user', render: (user) => <span className="font-semibold">{user?.name || 'Guest User'}</span> },
    { header: 'Placed Time', field: 'createdAt', render: (time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { header: 'Total Amount', field: 'total', render: (t) => `₹${t}` },
    {
      header: 'Order Status',
      field: 'orderStatus',
      render: (status) => (
        <Badge variant={status === 'delivered' ? 'success' : status === 'cancelled' ? 'danger' : 'warning'} dot>
          {status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      field: '_id',
      render: (id, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-2.5 py-1 text-xs"
            onClick={() => {
              setSelectedOrder(row);
              setDraftChanges({
                chefId: row.chef?._id || row.chef || '',
                deliveryId: row.deliveryPartner?._id || row.deliveryPartner || '',
                staffId: row.assignedStaff?._id || row.assignedStaff || '',
                orderStatus: row.orderStatus || 'pending'
              });
              setDetailOpen(true);
            }}
          >
            <HiOutlineEye className="w-4 h-4" /> View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-2.5 py-1 text-xs text-danger-500 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/20"
            onClick={() => handleDeleteOrder(row._id)}
          >
            <HiOutlineTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Active Orders Management</h1>
            <p className="text-sm text-gray-500 dark:text-dark-400">Track incoming tickets, inspect invoices, and assign staff preparers.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowExportModal(true)}
            >
              <HiOutlineDownload className="w-5 h-5" /> Export Income
            </Button>
            <Button
              variant="danger"
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAllOrders}
            >
              <HiOutlineTrash className="w-5 h-5" /> Delete All
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative max-w-xs w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl text-sm w-full"
              />
            </div>

            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-48"
            />
          </div>

          <Table
            columns={columns}
            data={filteredOrders}
            loading={loading}
            emptyMessage="No active orders found matching filters."
          />
        </Card>

        {/* Details / Assignment Modal */}
        <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={`Details for ${selectedOrder?.orderId}`}>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Header info */}
              <div className="flex justify-between items-center bg-gray-50 dark:bg-dark-800 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <Badge variant="warning" className="mt-1" dot>{selectedOrder.orderStatus}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Final Total</p>
                  <p className="text-lg font-black text-primary-500">₹{selectedOrder.total}</p>
                </div>
              </div>

              {/* Items details */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-dark-800 dark:text-white">Items List</h4>
                <div className="divide-y divide-gray-100 dark:divide-dark-700/50">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 text-sm text-dark-700 dark:text-dark-300">
                      <span>{item.menuitem.name} × {item.quantity}</span>
                      <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery or Dine-in address details */}
              {selectedOrder.orderType === 'dine-in' ? (
                <div className="space-y-2 border-t border-gray-100 dark:border-dark-700/50 pt-4">
                  <h4 className="text-sm font-bold text-dark-800 dark:text-white flex items-center gap-1.5">
                    <HiOutlineOfficeBuilding className="w-4 h-4 text-primary-500" /> Dine-In Details
                  </h4>
                  <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    Serving to Table {selectedOrder.tableNumber}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 border-t border-gray-100 dark:border-dark-700/50 pt-4">
                  <h4 className="text-sm font-bold text-dark-800 dark:text-white">Delivery Coordinates</h4>
                  {selectedOrder.deliveryAddress ? (
                    <p className="text-xs text-gray-600 dark:text-dark-300">
                      {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.pincode}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No delivery address provided.</p>
                  )}
                </div>
              )}

              {/* Assign Staff Panel */}
              {user?.role !== 'staff' && (
                <div className="space-y-3 border-t border-gray-100 dark:border-dark-700/50 pt-4">
                  <h4 className="text-sm font-bold text-dark-800 dark:text-white flex items-center gap-1.5">
                    <HiOutlineUserGroup className="w-5 h-5 text-primary-500" /> Dispatch Assignment
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Assign Chef</label>
                      <Select
                        options={chefs}
                        value={draftChanges.chefId}
                        onChange={(val) => setDraftChanges(prev => ({ ...prev, chefId: val }))}
                        placeholder="Select Chef"
                      />
                    </div>
                    {selectedOrder.orderType !== 'dine-in' && (
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Assign Driver</label>
                        <Select
                          options={riders}
                          value={draftChanges.deliveryId}
                          onChange={(val) => setDraftChanges(prev => ({ ...prev, deliveryId: val }))}
                          placeholder="Select Rider"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Assign Staff</label>
                      <Select
                        options={waitstaff}
                        value={draftChanges.staffId}
                        onChange={(val) => setDraftChanges(prev => ({ ...prev, staffId: val }))}
                        placeholder="Select Staff"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Operational Action triggers */}
              <div className="space-y-2 border-t border-gray-100 dark:border-dark-700/50 pt-4">
                <h4 className="text-sm font-bold text-dark-800 dark:text-white flex items-center gap-1.5">
                  <HiOutlineClock className="w-5 h-5 text-primary-500" /> Operational Control / Update Status
                </h4>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Update Status to:</label>
                    <div className="flex flex-wrap gap-2">
                      {(user?.role === 'staff'
                        ? [{ value: 'delivered', label: 'Delivered to Table', color: 'bg-green-100 text-green-800 hover:bg-green-200' }]
                        : [
                          { value: 'pending', label: 'Ordered', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
                          { value: 'accepted', label: 'Accepted', color: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
                          { value: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
                          { value: 'ready', label: 'Ready', color: 'bg-teal-100 text-teal-800 hover:bg-teal-200' },
                          ...(selectedOrder.orderType !== 'dine-in'
                            ? [{ value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' }]
                            : []),
                          { value: 'delivered', label: selectedOrder.orderType === 'dine-in' ? 'Delivered to Table' : 'Delivered', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
                          { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
                        ]
                      ).map((st) => (
                        <button
                          key={st.value}
                          onClick={() => setDraftChanges(prev => ({ ...prev, orderStatus: st.value }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${draftChanges.orderStatus === st.value
                              ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-900 bg-primary-500 text-white'
                              : `${st.color} dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-dark-700`
                            }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-700/50 mt-6">
                <Button variant="ghost" onClick={() => setDetailOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveDraftChanges}>
                  Confirm Changes
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Income Report (Excel)">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Generate a professional Excel sheet summarizing income and orders.</p>

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

export default AdminOrderManagement;
