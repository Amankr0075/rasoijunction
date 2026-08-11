import Reservation from './reservation.model.js';
import User from '../auth/auth.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { createSystemNotification } from '../notifications/notification.controller.js';
import sendEmail from '../../utils/sendEmail.js';
import { generateReservationPDF } from '../../utils/pdfGenerator.js';

// Total 50 tables in the restaurant. Max capacity per table is 5 people.
const TABLES = Array.from({ length: 50 }, (_, i) => {
  const tableNumber = i + 1;
  let position = 'centre';
  if (tableNumber <= 12) position = 'window';
  else if (tableNumber >= 31 && tableNumber <= 42) position = 'corner';
  else if (tableNumber >= 43) position = 'outdoor';

  return { tableNumber, position, capacity: 5 };
});

// Utility to parse all occupied table numbers on a slot
const getOccupiedTableNumbers = (activeReservations) => {
  const occupied = [];
  activeReservations.forEach((r) => {
    if (r.tableNumber) {
      r.tableNumber.split(',').forEach((numStr) => {
        const num = parseInt(numStr.trim());
        if (!isNaN(num)) occupied.push(num);
      });
    }
  });
  return occupied;
};

// Auto-releases tables whose reservation dates have passed
const autoReleasePassedReservations = async () => {
  try {
    const now = new Date();
    await Reservation.updateMany(
      {
        date: { $lt: now },
        status: { $in: ['pending', 'approved'] }
      },
      { status: 'completed' }
    );
  } catch (err) {
    console.error('Failed to auto-release passed reservations:', err);
  }
};

/**
 * @desc    Get status of all 50 tables for a date and time slot
 * @route   GET /api/reservations/vacant-tables
 * @access  Private
 */
export const getVacantTables = asyncHandler(async (req, res) => {
  const { date, timeSlot } = req.query;

  if (!date || !timeSlot) {
    return res.status(400).json({
      success: false,
      message: 'Date and time slot are required query parameters.',
    });
  }

  await autoReleasePassedReservations();

  const searchDate = new Date(date);
  const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

  // Find reservations on this date & timeSlot
  const activeReservations = await Reservation.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot,
    status: { $in: ['pending', 'approved'] },
  });

  const occupiedTableNumbers = getOccupiedTableNumbers(activeReservations);

  const tablesWithStatus = TABLES.map((table) => ({
    ...table,
    isVacant: !occupiedTableNumbers.includes(table.tableNumber),
  }));

  res.status(200).json({
    success: true,
    tables: tablesWithStatus,
  });
});

/**
 * @desc    Book a table with ₹199 fee and multi-table capacity allotment logic
 * @route   POST /api/reservations
 * @access  Private (Customer)
 */
export const createReservation = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    phone, 
    date, 
    timeSlot, 
    guests, 
    specialRequests, 
    tableNumber, 
    preference, 
    paymentId,
    paymentDetails,
    useLoyaltyPoints
  } = req.body;

  // Validate payment details
  if (paymentDetails) {
    const { upiId, customerName, mobileNumber } = paymentDetails;
    if (!upiId || !customerName || !mobileNumber) {
      throw new AppError('UPI ID, Name, and Mobile Number are required for payment.', 400);
    }
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      throw new AppError('Mobile number must be 10 digits.', 400);
    }
  }

  const guestsCount = parseInt(guests) || 1;
  const tablesNeeded = Math.ceil(guestsCount / 5);

  await autoReleasePassedReservations();

  const searchDate = new Date(date);
  const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

  // Get occupied table numbers
  const activeReservations = await Reservation.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot,
    status: { $in: ['pending', 'approved'] },
  });

  const occupiedTableNumbers = getOccupiedTableNumbers(activeReservations);

  // Filter vacant tables
  const vacantTables = TABLES.filter(t => !occupiedTableNumbers.includes(t.tableNumber));

  if (vacantTables.length < tablesNeeded) {
    throw new AppError(`Not enough vacant tables available. You need ${tablesNeeded} tables for ${guestsCount} guests, but only ${vacantTables.length} are available.`, 400);
  }

  let assignedTables = [];

  if (tableNumber) {
    // Specific table requested (can be comma-separated list of table numbers)
    const requestedNums = tableNumber.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    // Verify all requested tables are vacant
    for (const num of requestedNums) {
      if (occupiedTableNumbers.includes(num)) {
        throw new AppError(`Table ${num} is already reserved for this date and time slot.`, 400);
      }
    }
    
    assignedTables = [...requestedNums];

    // If customer selected fewer tables than needed, auto-fill the remaining
    if (assignedTables.length < tablesNeeded) {
      const remainingNeeded = tablesNeeded - assignedTables.length;
      const remainingVacant = vacantTables.filter(t => !assignedTables.includes(t.tableNumber));
      const zone = TABLES.find(t => t.tableNumber === requestedNums[0])?.position || 'centre';
      
      // Prefer same zone for fallback
      let candidates = remainingVacant.filter(t => t.position === zone);
      if (candidates.length < remainingNeeded) {
        candidates = remainingVacant;
      }
      
      for (let i = 0; i < remainingNeeded && i < candidates.length; i++) {
        assignedTables.push(candidates[i].tableNumber);
      }
    }
  } else {
    // Auto-assign all tables needed
    const preferredPos = preference && preference !== 'none' ? preference : null;
    let candidates = preferredPos 
      ? vacantTables.filter(t => t.position === preferredPos) 
      : vacantTables;

    if (candidates.length < tablesNeeded) {
      candidates = vacantTables;
    }

    for (let i = 0; i < tablesNeeded && i < candidates.length; i++) {
      assignedTables.push(candidates[i].tableNumber);
    }
  }

  let finalAmount = tablesNeeded * 199;
  let loyaltyPointsUsed = 0;

  if (useLoyaltyPoints && req.user) {
    const maxPointsAllowed = Math.floor(finalAmount * 0.10);
    const user = await User.findById(req.user._id);
    loyaltyPointsUsed = Math.min(maxPointsAllowed, user.loyaltyPoints || 0);
    
    if (loyaltyPointsUsed > 0) {
      finalAmount -= loyaltyPointsUsed;
      await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: -loyaltyPointsUsed } });
    }
  }

  const reservation = await Reservation.create({
    user: req.user._id,
    name,
    email,
    phone,
    date,
    timeSlot,
    guests: guestsCount,
    specialRequests,
    tableNumber: assignedTables.join(', '),
    preference: preference || 'none',
    paymentStatus: paymentId ? 'paid' : 'pending',
    paymentId: paymentId || undefined,
    status: paymentId ? 'approved' : 'pending',
    amount: finalAmount,
    loyaltyPointsUsed,
    paymentDetails: paymentDetails || undefined,
  });

  await createSystemNotification(
    `Table reserved (Table(s): ${reservation.tableNumber}): ${reservation.guests} guests by ${reservation.name} on ${new Date(reservation.date).toLocaleDateString()}`,
    'Reservation'
  );

  // Generate and send PDF Invoice via Email
  try {
    const pdfBuffer = await generateReservationPDF(reservation, paymentDetails);
    
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="Rasoi Junction" style="width: 80px; height: 80px;" />
          <h1 style="color: #ea580c; margin: 10px 0 0 0; font-size: 24px;">Rasoi Junction</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Gourmet Dining Experience</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Reservation Confirmed! 🎉</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Dear <strong>${reservation.name}</strong>,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Warm greetings from Rasoi Junction! We are thrilled to confirm your table reservation.</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: bold;">Date</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${new Date(reservation.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: bold;">Time Slot</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${reservation.timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: bold;">Guests</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${reservation.guests} People</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: bold;">Table Assigned</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">Table ${reservation.tableNumber}</td>
          </tr>
        </table>
        
        <p style="color: #374151; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
          Please find your official booking receipt attached to this email as a PDF document. You can show this receipt at the reception when you arrive.
        </p>
        
        <div style="text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 20px;">
          <p style="color: #ea580c; font-weight: bold; font-size: 18px; margin: 0;">Thank you for choosing us!</p>
          <p style="color: #6b7280; font-size: 14px;">We look forward to serving you an unforgettable meal.</p>
        </div>
      </div>
    `;

    await sendEmail({
      email: reservation.email,
      subject: `Reservation Confirmed - Rasoi Junction`,
      message: `Dear ${reservation.name},\n\nYour table reservation for ${reservation.guests} guests on ${new Date(reservation.date).toLocaleDateString()} at ${reservation.timeSlot} is confirmed. \n\nPlease find your booking receipt attached.`,
      html: emailHtml,
      attachments: [
        {
          filename: `Invoice-RES-${reservation._id.toString().slice(-6).toUpperCase()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  } catch (emailErr) {
    console.error('Error sending reservation email:', emailErr);
    // We don't fail the reservation if the email fails
  }

  res.status(201).json({
    success: true,
    message: `Table reserved successfully! Allotted Table(s): ${reservation.tableNumber}. ₹${reservation.amount} payment received.`,
    data: reservation,
  });
});

/**
 * @desc    Get current customer's reservations
 * @route   GET /api/reservations/my
 * @access  Private (Customer)
 */
export const getMyReservations = asyncHandler(async (req, res) => {
  await autoReleasePassedReservations();
  const reservations = await Reservation.find({ user: req.user._id }).sort({ date: 1 });

  res.status(200).json({
    success: true,
    data: reservations,
  });
});

/**
 * @desc    Get all reservations with filters
 * @route   GET /api/reservations
 * @access  Private (Admin/Manager/Staff)
 */
export const getReservations = asyncHandler(async (req, res) => {
  await autoReleasePassedReservations();
  const { status, date } = req.query;
  const query = {};

  if (status) query.status = status;
  if (date) {
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0,0,0,0));
    const endOfDay = new Date(searchDate.setHours(23,59,59,999));
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }
  
  if (req.user.role === 'staff') {
    query.assignedStaff = req.user._id;
  }

  const reservations = await Reservation.find(query)
    .sort({ date: 1 })
    .populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    data: reservations,
  });
});

/**
 * @desc    Update reservation status / assign table
 * @route   PUT /api/reservations/:id/status
 * @access  Private (Admin/Manager/Staff)
 */
export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status, tableNumber } = req.body;
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  let changesMade = false;
  let statusChanged = false;
  let tableChanged = false;

  if (status && status !== reservation.status) {
    reservation.status = status;
    changesMade = true;
    statusChanged = true;
  }
  if (tableNumber && tableNumber !== reservation.tableNumber) {
    reservation.tableNumber = tableNumber;
    changesMade = true;
    tableChanged = true;
  }

  await reservation.save();

  if (changesMade) {
    try {
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:logo" alt="Rasoi Junction" style="width: 80px; height: 80px;" />
            <h1 style="color: #ea580c; margin: 10px 0 0 0; font-size: 24px;">Rasoi Junction</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Gourmet Dining Experience</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Reservation Update 📝</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">Dear <strong>${reservation.name}</strong>,</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">There has been an update to your table reservation for ${new Date(reservation.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${reservation.timeSlot}.</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${statusChanged ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: bold;">New Status</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #10b981; text-align: right; text-transform: capitalize; font-weight: bold;">${reservation.status}</td>
            </tr>
            ` : ''}
            ${tableChanged ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: bold;">New Table Assigned</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">Table ${reservation.tableNumber}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: bold;">Guests</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${reservation.guests} People</td>
            </tr>
          </table>
          
          <div style="text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 20px;">
            <p style="color: #ea580c; font-weight: bold; font-size: 18px; margin: 0;">Thank you for choosing us!</p>
            <p style="color: #6b7280; font-size: 14px;">We look forward to serving you.</p>
          </div>
        </div>
      `;

      await sendEmail({
        email: reservation.email,
        subject: `Reservation Update - Rasoi Junction`,
        message: `Dear ${reservation.name},\n\nYour reservation for ${new Date(reservation.date).toLocaleDateString()} has been updated.\nStatus: ${reservation.status}\nTable: ${reservation.tableNumber}`,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('Error sending reservation update email:', emailErr);
    }
  }

  res.status(200).json({
    success: true,
    message: `Reservation updated to ${reservation.status}`,
    data: reservation,
  });
});

/**
 * @desc    Delete a reservation
 * @route   DELETE /api/reservations/:id
 * @access  Private (Admin/Manager)
 */
export const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  await Reservation.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Reservation deleted successfully',
  });
});

/**
 * @desc    Assign staff to a reservation
 * @route   PUT /api/reservations/:id/assign
 * @access  Private (Admin/Manager)
 */
export const assignStaffToReservation = asyncHandler(async (req, res) => {
  const { staffId } = req.body;
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  reservation.assignedStaff = staffId;
  await reservation.save();

  res.status(200).json({
    success: true,
    message: 'Staff assigned to reservation successfully.',
    data: reservation,
  });
});
