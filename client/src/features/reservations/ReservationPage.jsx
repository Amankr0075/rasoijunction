import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineUserGroup, HiOutlineClock, HiOutlineCheckCircle, HiOutlineHeart, HiOutlineLocationMarker, HiOutlineCreditCard, HiOutlineShoppingCart } from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const ReservationPage = () => {
  const { user } = useAuth();
  const { setDineInContext } = useCart();
  const navigate = useNavigate();
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Table selection states
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);
  const [preference, setPreference] = useState('none');

  // Checkout modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState(null);

  // Payment details form state
  const [payUpiId, setPayUpiId] = useState('');
  const [payCustomerName, setPayCustomerName] = useState('');
  const [payMobileNumber, setPayMobileNumber] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({});

  // Invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      timeSlot: '12:00 - 14:00 (Lunch)'
    }
  });

  const timeSlots = [
    '12:00 - 14:00 (Lunch)',
    '14:00 - 16:00 (Lunch)',
    '18:00 - 20:00 (Dinner)',
    '20:00 - 22:00 (Dinner)',
    '22:00 - 00:00 (Dinner)',
  ];

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/my');
      setReservations(res.data || []);
    } catch (err) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Watch date and timeslot to reload table availability
  const watchDate = watch('date');
  const watchTimeSlot = watch('timeSlot');
  const watchGuests = watch('guests') || 1;
  const tablesNeeded = Math.max(1, Math.ceil((parseInt(watchGuests) || 1) / 5));
  
  const baseTotalAmount = tablesNeeded * 199;
  const maxLoyaltyPointsAllowed = Math.floor(baseTotalAmount * 0.10);
  const loyaltyPointsAvailable = user?.loyaltyPoints || 0;
  const loyaltyPointsToUse = Math.min(maxLoyaltyPointsAllowed, loyaltyPointsAvailable);
  const totalAmount = useLoyaltyPoints ? baseTotalAmount - loyaltyPointsToUse : baseTotalAmount;

  useEffect(() => {
    if (watchDate && watchTimeSlot) {
      const fetchVacantTables = async () => {
        setLoadingTables(true);
        try {
          const res = await api.get(`/reservations/vacant-tables?date=${watchDate}&timeSlot=${watchTimeSlot}`);
          setTables(res.tables || []);
          setSelectedTables([]);
        } catch (err) {
          console.error('Failed to load vacant tables:', err);
        } finally {
          setLoadingTables(false);
        }
      };
      fetchVacantTables();
    }
  }, [watchDate, watchTimeSlot]);

  const handleOpenPayment = (data) => {
    setFormData(data);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    // Validate payment form fields
    const errors = {};
    if (!payCustomerName.trim()) errors.customerName = 'Name is required';
    if (!payMobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
    else if (payMobileNumber.length !== 10 || isNaN(payMobileNumber)) errors.mobileNumber = 'Must be 10 digits';
    if (!payUpiId.trim()) errors.upiId = 'UPI ID is required';
    else if (!/^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/.test(payUpiId)) errors.upiId = 'Invalid UPI ID format (e.g. name@upi)';

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }
    setPaymentErrors({});

    setSubmitLoading(true);
    setShowPaymentModal(false);
    try {
      const paymentId = 'PAYID-RES-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const submissionData = {
        ...formData,
        tableNumber: selectedTables.length > 0 ? selectedTables.join(', ') : undefined,
        preference,
        paymentId,
        useLoyaltyPoints,
        paymentDetails: {
          upiId: payUpiId,
          customerName: payCustomerName,
          mobileNumber: payMobileNumber,
        },
      };
      const res = await api.post('/reservations', submissionData);
      toast.success(`Table(s) reserved successfully! 🎉`);
      reset();
      setSelectedTables([]);
      setPreference('none');
      setPayUpiId('');
      setPayCustomerName('');
      setPayMobileNumber('');
      fetchReservations();
      if (res && res.data) {
        setSelectedInvoice(res.data);
        setShowInvoiceModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book table');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper to split tables into zones
  const getTablesByZone = (zoneName) => {
    return tables.filter(t => t.position === zoneName);
  };

  const renderTable = (table) => {
    if (!table) return null;
    const isSelected = selectedTables.includes(table.tableNumber);
    const isVacant = table.isVacant;

    return (
      <button
        key={table.tableNumber}
        type="button"
        disabled={!isVacant}
        onClick={() => {
          setPreference('none');
          setSelectedTables((prev) => {
            if (prev.includes(table.tableNumber)) {
              return prev.filter((t) => t !== table.tableNumber);
            }
            if (prev.length >= tablesNeeded) {
              toast.error(`You can only select up to ${tablesNeeded} table(s) for ${watchGuests} guest(s).`);
              return prev;
            }
            return [...prev, table.tableNumber];
          });
        }}
        className={`group relative flex flex-col items-center justify-center w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl text-xs font-bold transition-all duration-300 ${
          isSelected
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-dark-900 scale-105'
            : isVacant
            ? 'bg-white dark:bg-dark-800 text-dark-700 dark:text-dark-200 border-2 border-emerald-200 dark:border-emerald-800/40 hover:border-primary-400 hover:shadow-md hover:scale-105 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'
            : 'bg-gray-100 dark:bg-dark-850 text-gray-350 dark:text-dark-600 border-2 border-gray-150 dark:border-dark-800 cursor-not-allowed opacity-60'
        }`}
        title={`Table ${table.tableNumber} — ${isVacant ? 'Available' : 'Reserved'} (Seats ${table.capacity})`}
      >
        {/* Chair indicators on top */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          <span className={`w-2.5 h-1.5 rounded-full ${isSelected ? 'bg-primary-300' : isVacant ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-250 dark:bg-dark-700'}`} />
          <span className={`w-2.5 h-1.5 rounded-full ${isSelected ? 'bg-primary-300' : isVacant ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-250 dark:bg-dark-700'}`} />
        </div>
        {/* Chair indicators on bottom */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          <span className={`w-2.5 h-1.5 rounded-full ${isSelected ? 'bg-primary-300' : isVacant ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-250 dark:bg-dark-700'}`} />
          <span className={`w-2.5 h-1.5 rounded-full ${isSelected ? 'bg-primary-300' : isVacant ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-250 dark:bg-dark-700'}`} />
        </div>
        {/* Chair indicator left */}
        <span className={`absolute left-[-5px] top-1/2 -translate-y-1/2 w-1.5 h-2.5 rounded-full ${isSelected ? 'bg-primary-300' : isVacant ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-250 dark:bg-dark-700'}`} />
        {/* Chair indicator right */}
        <span className={`absolute right-[-5px] top-1/2 -translate-y-1/2 w-1.5 h-2.5 rounded-full ${isSelected ? 'bg-primary-300' : isVacant ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-gray-250 dark:bg-dark-700'}`} />

        <span className="text-[11px] font-black tracking-tight">{table.tableNumber}</span>
        <span className={`text-[8px] font-semibold mt-0.5 ${isSelected ? 'text-primary-200' : isVacant ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-dark-600'}`}>
          {isSelected ? '✓ Selected' : isVacant ? `${table.capacity} seats` : 'Booked'}
        </span>
      </button>
    );
  };

  const vacantTablesCount = tables.filter(t => t.isVacant).length;
  const isSlotFull = watchDate && watchTimeSlot && !loadingTables && tables.length > 0 && vacantTablesCount < tablesNeeded;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-dark-800 dark:text-white">
            Table <span className="text-gradient">Reservations</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
            Experience premium dining with custom seat selection. A table reservation fee of ₹199 applies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form and Map Layout */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-4">
                1. Reservation Details
              </h3>
              <form onSubmit={handleSubmit(handleOpenPayment)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Name *"
                    name="name"
                    placeholder="Enter contact name"
                    register={register}
                    required
                    error={errors.name?.message}
                  />
                  <Input
                    label="Phone *"
                    name="phone"
                    placeholder="9876543210"
                    register={register}
                    required
                    error={errors.phone?.message}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email *"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    register={register}
                    required
                    error={errors.email?.message}
                  />
                  <Input
                    label="Guests Count *"
                    name="guests"
                    type="number"
                    placeholder="2"
                    register={register}
                    required
                    min={1}
                    error={errors.guests?.message}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Booking Date *"
                    name="date"
                    type="date"
                    register={register}
                    required
                    error={errors.date?.message}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                      Preferred Time Slot *
                    </label>
                    <select
                      {...register('timeSlot', { required: 'Time slot is required' })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auto Assign Preferences */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                    Seat Preference (If auto-assigning)
                  </label>
                  <select
                    value={preference}
                    onChange={(e) => {
                      setPreference(e.target.value);
                      setSelectedTables([]); // Reset specific tables if choosing general preference
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="none">No Preference (Auto-assign Any Available)</option>
                    <option value="window">Window Seat Area</option>
                    <option value="centre">Main Center Area</option>
                    <option value="corner">Cozy Corners</option>
                    <option value="outdoor">Outdoor Terrace</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                    Special Requests
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    placeholder="E.g. anniversary dinner, high chair for toddler..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* 2. Interactive Seat Selection */}
                {watchDate && watchTimeSlot && (
                  <div className="border-t border-gray-100 dark:border-dark-800 pt-6 space-y-5">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-dark-800 dark:text-white">
                          2. Restaurant Floor Plan
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Select up to {tablesNeeded} table{tablesNeeded > 1 ? 's' : ''} — or leave blank for auto-assignment
                        </p>
                      </div>
                      <div className="flex gap-4 text-[11px] bg-gray-50 dark:bg-dark-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-dark-700">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="w-3 h-3 rounded-md bg-white dark:bg-dark-800 border-2 border-emerald-300 dark:border-emerald-700" /> Available
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-400 font-semibold">
                          <span className="w-3 h-3 rounded-md bg-gray-100 dark:bg-dark-850 border-2 border-gray-200 dark:border-dark-700 opacity-60" /> Booked
                        </span>
                        <span className="flex items-center gap-1.5 text-primary-500 font-semibold">
                          <span className="w-3 h-3 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 border-2 border-primary-400" /> Selected
                        </span>
                      </div>
                    </div>

                    {loadingTables ? (
                      <div className="h-64 flex flex-col items-center justify-center text-xs text-gray-400 bg-gray-50 dark:bg-dark-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-dark-700">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
                        Loading floor plan...
                      </div>
                    ) : (
                      <div className="rounded-2xl border-2 border-gray-200 dark:border-dark-700 overflow-hidden shadow-sm">
                        {/* Floor plan header bar */}
                        <div className="bg-gradient-to-r from-dark-800 to-dark-900 dark:from-dark-800 dark:to-dark-900 px-6 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Live Floor Plan — Rasoi Junction</span>
                          </div>
                          <span className="text-[10px] text-white/50 font-mono">
                            {vacantTablesCount}/{tables.length} tables available
                          </span>
                        </div>

                        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-950 p-5 sm:p-8 overflow-x-auto">
                          <div className="flex flex-col gap-6 min-w-[680px]">
                            
                            {/* ─── ENTRANCE & CORNER ZONE ─── */}
                            <div className="flex justify-between items-start">
                              {/* Top Left Corner */}
                              <div className="flex flex-col gap-5">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400 mb-1">🪑 Corner Nook</p>
                                <div className="grid grid-cols-2 gap-5">
                                  {getTablesByZone('corner').slice(0, 3).map(renderTable)}
                                </div>
                              </div>
                              
                              {/* Main Entrance */}
                              <div className="flex flex-col items-center gap-1 self-start">
                                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-dark-600 to-transparent rounded-full" />
                                <div className="px-8 py-2.5 bg-white dark:bg-dark-800 rounded-b-2xl border border-t-0 border-gray-200 dark:border-dark-700 text-center shadow-sm">
                                  <span className="text-[10px] font-black text-dark-600 dark:text-dark-300 uppercase tracking-[0.25em]">Main Entrance</span>
                                </div>
                              </div>

                              {/* Top Right Corner */}
                              <div className="flex flex-col gap-5 items-end">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400 mb-1">Corner Nook 🪑</p>
                                <div className="grid grid-cols-2 gap-5">
                                  {getTablesByZone('corner').slice(3, 6).map(renderTable)}
                                </div>
                              </div>
                            </div>

                            {/* ─── MAIN DINING FLOOR ─── */}
                            <div className="flex justify-between gap-5 flex-1">
                              {/* Left Window Wall */}
                              <div className="flex flex-col items-center gap-5 border-l-[3px] border-sky-300 dark:border-sky-800/50 pl-4 py-4 bg-gradient-to-r from-sky-50/60 to-transparent dark:from-sky-900/10 rounded-l-xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-sky-500 dark:text-sky-400 -rotate-90 whitespace-nowrap mb-2">🪟 Window</p>
                                {getTablesByZone('window').slice(0, 6).map(renderTable)}
                              </div>

                              {/* Centre Floor */}
                              <div className="flex-1 relative">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-dark-500 text-center mb-3">✦ Main Dining Hall ✦</p>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-5 place-items-center bg-white/60 dark:bg-dark-800/30 border border-gray-100 dark:border-dark-800 p-5 sm:p-7 rounded-2xl backdrop-blur-sm">
                                  {getTablesByZone('centre').map(renderTable)}
                                </div>
                              </div>

                              {/* Right Window Wall */}
                              <div className="flex flex-col items-center gap-5 border-r-[3px] border-sky-300 dark:border-sky-800/50 pr-4 py-4 bg-gradient-to-l from-sky-50/60 to-transparent dark:from-sky-900/10 rounded-r-xl">
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-sky-500 dark:text-sky-400 rotate-90 whitespace-nowrap mb-2">Window 🪟</p>
                                {getTablesByZone('window').slice(6, 12).map(renderTable)}
                              </div>
                            </div>

                            {/* ─── BOTTOM: CORNERS + OUTDOOR TERRACE ─── */}
                            <div className="flex justify-between items-end gap-4 pt-4 border-t border-dashed border-gray-200 dark:border-dark-700">
                              {/* Bottom Left Corner */}
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400 mb-2">🪑 Corner</p>
                                <div className="grid grid-cols-2 gap-5">
                                  {getTablesByZone('corner').slice(6, 8).map(renderTable)}
                                </div>
                              </div>

                              {/* Outdoor Terrace */}
                              <div className="flex-1 max-w-md mx-auto">
                                <div className="bg-gradient-to-b from-emerald-50 to-green-50/30 dark:from-emerald-950/20 dark:to-green-950/10 border-2 border-emerald-200/60 dark:border-emerald-800/30 rounded-2xl p-4 sm:p-5 shadow-sm">
                                  <p className="text-center text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em] mb-3 flex items-center justify-center gap-2">
                                    <HiOutlineLocationMarker className="w-3.5 h-3.5" /> Outdoor Terrace <span className="text-[8px] opacity-60">☀️</span>
                                  </p>
                                  <div className="grid grid-cols-4 gap-5 place-items-center">
                                    {getTablesByZone('outdoor').map(renderTable)}
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Right Corner */}
                              <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400 mb-2">Corner 🪑</p>
                                <div className="grid grid-cols-2 gap-5">
                                  {getTablesByZone('corner').slice(8, 12).map(renderTable)}
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isSlotFull && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800/30 flex gap-3 items-start">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-bold">Fully Booked!</p>
                      <p className="mt-1">Sorry, this time slot doesn't have enough tables for {watchGuests} guest(s). We only have {vacantTablesCount} table(s) available, but you need {tablesNeeded}. Please select another time or date.</p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3.5" 
                  loading={submitLoading}
                  disabled={isSlotFull}
                >
                  Confirm details & Pay ₹{totalAmount}
                </Button>
              </form>
            </Card>
          </div>

          {/* Booking History list */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-6">
                Your Bookings
              </h3>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <LoadingSkeleton key={i} type="text" />
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No tables reserved yet. Request a reservation on the left.
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {reservations.map((res) => (
                    <div
                      key={res._id}
                      className="p-4 bg-gray-50 dark:bg-dark-850 border border-gray-100 dark:border-dark-800 rounded-xl space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-sm text-dark-800 dark:text-white">
                            {res.name}
                          </p>
                          <p className="text-[10px] text-gray-400">{res.guests} Guests</p>
                        </div>
                        <Badge
                          variant={
                            res.status === 'approved'
                              ? 'success'
                              : res.status === 'completed'
                              ? 'neutral'
                              : res.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          dot
                        >
                          {res.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-x-4 gap-y-1 text-[10px] text-gray-400 border-t border-gray-100 dark:border-dark-800/80 pt-2">
                        <span className="flex items-center gap-1">
                          <HiOutlineCalendar className="w-3.5 h-3.5" />
                          {new Date(res.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          {res.timeSlot.split(' ')[0]}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-[10px] text-primary-500 font-bold bg-primary-500/5 px-2 py-0.5 rounded">
                          Table {res.tableNumber} ({res.preference !== 'none' ? res.preference : 'Assigned'})
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(res);
                              setShowInvoiceModal(true);
                            }}
                            className="text-[10px] text-primary-500 hover:text-primary-600 font-bold border border-primary-500/20 px-2 py-0.5 rounded bg-primary-500/5 transition-all"
                          >
                            Receipt
                          </button>
                          {res.status === 'approved' && res.tableNumber && res.tableNumber !== 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDineInContext(res.tableNumber, res.name, res.phone);
                                navigate('/menu');
                              }}
                              className="text-[10px] text-white hover:text-white font-bold border border-emerald-500 px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center gap-1 shadow-sm shadow-emerald-500/20"
                            >
                              <HiOutlineShoppingCart className="w-3 h-3" />
                              Order Food
                            </button>
                          )}
                          <span className="text-[10px] text-green-500 font-bold self-center">
                            Paid ₹{res.amount || 199}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout & Pay Reservation Fee Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mx-auto text-primary-500">
                  <HiOutlineCreditCard className="w-6 h-6" />
                </div>
                 <h3 className="text-xl font-bold text-dark-800 dark:text-white">Secure Table Booking Payment</h3>
                <p className="text-xs text-gray-500">To confirm your booking, a non-refundable table reservation fee of ₹199 per table is required.</p>
              </div>

              <div className="bg-primary-50 dark:bg-primary-500/10 p-4 rounded-2xl flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-primary-700 dark:text-primary-300">
                  <span>Table Fee (₹199 x {tablesNeeded} Table(s))</span>
                  <span className="font-semibold">₹{baseTotalAmount}.00</span>
                </div>
                
                {loyaltyPointsAvailable > 0 && (
                  <div className="flex items-center justify-between border-t border-primary-200 dark:border-primary-800/30 pt-2 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-primary-700 dark:text-primary-300 font-semibold">
                      <input 
                        type="checkbox"
                        checked={useLoyaltyPoints}
                        onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                        className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                      />
                      Use Loyalty Points (Available: {loyaltyPointsAvailable})
                    </label>
                    {useLoyaltyPoints && (
                      <span className="font-semibold text-green-600">-₹{loyaltyPointsToUse}.00</span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-primary-200 dark:border-primary-800/30 pt-2 mt-1">
                  <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">Total Payable</span>
                  <span className="text-lg font-black text-primary-500">₹{totalAmount}.00</span>
                </div>
              </div>

              {/* Payment Details Form */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Details (UPI)</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={payCustomerName}
                      onChange={(e) => setPayCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                    {paymentErrors.customerName && <p className="text-xs text-red-500 mt-1">{paymentErrors.customerName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      value={payMobileNumber}
                      onChange={(e) => setPayMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                    {paymentErrors.mobileNumber && <p className="text-xs text-red-500 mt-1">{paymentErrors.mobileNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-1">UPI ID *</label>
                    <input
                      type="text"
                      value={payUpiId}
                      onChange={(e) => setPayUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                    {paymentErrors.upiId && <p className="text-xs text-red-500 mt-1">{paymentErrors.upiId}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowPaymentModal(false); setPaymentErrors({}); }}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleProcessPayment} loading={submitLoading}>
                  Pay ₹{totalAmount} & Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 print:border-none print:shadow-none print:rounded-none"
            >
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
                  <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-2">
                    PAID
                  </span>
                  <div>
                    <h3 className="font-bold font-display text-lg text-dark-800 dark:text-white">Rasoi Junction</h3>
                    <p className="text-xs text-gray-400 mt-1.5">Invoice #RES-{selectedInvoice._id?.slice(-6).toUpperCase() || 'NEW'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">rasoijunction.admin@gmail.com</p>
                  </div>
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

              {/* Payment Details & Transaction Info */}
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
                <p>Transaction ID: <span className="font-mono">{selectedInvoice.paymentId}</span></p>
                <p>Payment Mode: UPI</p>
                <p className="text-center italic mt-4 text-xs font-semibold text-primary-500">Thank you for dining with us! See you soon.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-dark-800 print:hidden">
                <Button variant="outline" className="flex-1" onClick={() => setShowInvoiceModal(false)}>
                  Close
                </Button>
                <Button variant="primary" className="flex-1 gap-2" onClick={() => window.print()}>
                  🖨️ Print Invoice
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReservationPage;
