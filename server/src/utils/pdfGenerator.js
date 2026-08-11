import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Payment from '../modules/payments/payment.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = async (order) => {
  // Construct absolute file path for the logo
  const logoPath = path.join(__dirname, '../../../client/public/logo.png');
  let logoBase64 = '';
  if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
  }

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0] + ' at ' + d.toTimeString().split(' ')[0];
  };

  const invoiceNumber = `INV-${order.orderId.replace('RJ-', '')}`;
  const orderDate = formatDate(order.createdAt);

  // Fetch payment details to get the dynamic UPI ID or Card Number
  const payment = await Payment.findOne({ orderRef: order._id });
  let paymentText = order.paymentMethod.toUpperCase();
  if (payment) {
    if (payment.paymentMethod === 'upi' && payment.upiId) {
      paymentText = `UPI (${payment.upiId})`;
    } else if (payment.maskedCardNumber) {
      paymentText = `CARD (${payment.maskedCardNumber})`;
    }
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #1f2937;">
        ${item.menuitem?.name || 'Deleted Item'}
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; text-align: center; color: #4b5563;">
        ${item.quantity}
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">
        ₹${item.price.toFixed(2)}
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #1f2937;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 40px;
        color: #374151;
        background-color: #f9fafb;
      }
      .container {
        background: #ffffff;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
      }
      .logo-section {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      .logo-img {
        width: 80px;
        height: 80px;
        object-fit: contain;
      }
      .brand-title {
        margin: 0;
        color: #1e3a8a;
        font-size: 24px;
        font-weight: 800;
      }
      .brand-subtitle {
        margin: 4px 0 0 0;
        color: #ea580c;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .invoice-info {
        text-align: right;
      }
      .invoice-type {
        color: #9ca3af;
        font-size: 14px;
        margin: 0 0 5px 0;
      }
      .invoice-id {
        color: #ea580c;
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 5px 0;
      }
      .gstin {
        color: #9ca3af;
        font-size: 12px;
        margin: 0;
      }
      .email-info {
        color: #6b7280;
        font-size: 12px;
        margin-top: 5px;
      }
      .info-grid {
        display: flex;
        justify-content: space-between;
        background: #f9fafb;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 40px;
      }
      .info-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .info-label {
        color: #9ca3af;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .info-value {
        color: #1f2937;
        font-size: 14px;
        font-weight: 600;
      }
      .details-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
      }
      .details-col {
        width: 48%;
      }
      .details-col p {
        margin: 5px 0;
        color: #6b7280;
        font-size: 14px;
      }
      .details-col .bold {
        color: #1f2937;
        font-weight: 600;
      }
      .status-success {
        color: #10b981;
        font-weight: 600;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 40px;
      }
      th {
        text-align: left;
        color: #9ca3af;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e5e7eb;
      }
      th.center { text-align: center; }
      th.right { text-align: right; }
      .totals {
        width: 300px;
        margin-left: auto;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        color: #6b7280;
        font-size: 14px;
      }
      .totals-row.grand-total {
        margin-top: 10px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;
        color: #1f2937;
        font-size: 18px;
        font-weight: 700;
      }
      .totals-row.grand-total .amount {
        color: #ea580c;
      }
      .footer {
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
        margin-top: 60px;
      }
      .footer p { margin: 4px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      
      <div class="header">
        <div class="logo-section">
          <img src="${logoBase64}" class="logo-img" alt="Logo" />
          <div>
            <h1 class="brand-title">Rasoi Junction</h1>
            <p class="brand-subtitle">Where Tradition Meets Technology</p>
          </div>
        </div>
        <div class="invoice-info">
          <p class="invoice-type">Tax Invoice / Bill of Supply</p>
          <p class="invoice-id">${invoiceNumber}</p>
          <p class="gstin">GSTIN: 07AAAAA1111A1Z1 (Sample)</p>
          <p class="email-info">rasoijunction.admin@gmail.com</p>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <span class="info-label">Order ID</span>
          <span class="info-value">${order.orderId}</span>
        </div>
        <div class="info-block">
          <span class="info-label">Payment ID</span>
          <span class="info-value">${order.paymentMethod === 'online' ? 'PAY-ONLINE' : 'PAY-COD'}</span>
        </div>
        <div class="info-block">
          <span class="info-label">Transaction ID</span>
          <span class="info-value">${order._id.toString().substring(0, 10).toUpperCase()}</span>
        </div>
        <div class="info-block">
          <span class="info-label">Date & Time</span>
          <span class="info-value">${orderDate}</span>
        </div>
      </div>

      <div class="details-section">
        <div class="details-col">
          <p class="info-label">Customer Details</p>
          <p class="bold" style="margin-top: 10px;">${order.user.name}</p>
          <p>Email: ${order.user.email}</p>
          <p>Phone: ${order.user.phone || 'N/A'}</p>
        </div>
        <div class="details-col">
          <p class="info-label">Billing Coordinates</p>
          <p style="margin-top: 10px;">${order.deliveryAddress.street}</p>
          <p>${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}</p>
          <p class="bold" style="margin-top: 10px;">Payment: ${paymentText}</p>
          <div class="status-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            STATUS: SUCCESSFUL
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th class="center">Qty</th>
            <th class="right">Unit Price</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>₹${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>GST (5%)</span>
          <span>₹${order.tax.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>Delivery Charges</span>
          <span>₹${order.deliveryCharges.toFixed(2)}</span>
        </div>
        ${order.discount > 0 ? `
        <div class="totals-row" style="color: #10b981;">
          <span>Discount</span>
          <span>-₹${order.discount.toFixed(2)}</span>
        </div>
        ` : ''}
        ${order.loyaltyPointsEarned > 0 ? `
        <div class="totals-row" style="color: #10b981;">
          <span>Loyalty Points Earned</span>
          <span>+${order.loyaltyPointsEarned}</span>
        </div>
        ` : ''}
        <div class="totals-row grand-total">
          <span>Total Amount Paid</span>
          <span class="amount">₹${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for ordering from Rasoi Junction.</p>
        <p>This is a simulated transaction record for college software project exhibition purposes.</p>
      </div>

    </div>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set content and wait until network is idle so the image loads
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();

  return pdfBuffer;
};

export const generateReservationPDF = async (reservation, payment) => {
  const logoPath = path.join(__dirname, '../../../client/public/logo.png');
  let logoBase64 = '';
  if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
  }

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const invoiceNumber = `RES-${reservation._id.toString().slice(-6).toUpperCase()}`;
  const orderDate = formatDate(reservation.date);

  let paymentText = 'PENDING';
  if (payment) {
    if (payment.paymentMethod === 'upi' && payment.upiId) {
      paymentText = `UPI (${payment.upiId})`;
    } else if (payment.maskedCardNumber) {
      paymentText = `CARD (${payment.maskedCardNumber})`;
    } else if (payment.paymentMethod) {
      paymentText = payment.paymentMethod.toUpperCase();
    }
  }

  const totalAmount = reservation.amount || 199;
  const subtotal = totalAmount / 1.18;
  const tax = totalAmount - subtotal;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Reservation Invoice</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
      body {
        font-family: 'Inter', sans-serif;
        background-color: #f9fafb;
        color: #374151;
        margin: 0;
        padding: 40px;
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 50px;
        border-radius: 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #f3f4f6;
        padding-bottom: 30px;
        margin-bottom: 40px;
      }
      .logo-section {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .logo-img {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        object-fit: cover;
      }
      .brand-title {
        font-family: 'Outfit', sans-serif;
        font-size: 28px;
        font-weight: 700;
        color: #111827;
        margin: 0;
      }
      .brand-subtitle {
        font-size: 12px;
        color: #ea580c;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
        margin-top: 5px;
      }
      .invoice-info {
        text-align: right;
      }
      .invoice-type {
        font-size: 13px;
        color: #6b7280;
        margin: 0 0 5px 0;
      }
      .invoice-id {
        font-family: 'Outfit', sans-serif;
        font-size: 24px;
        font-weight: 700;
        color: #ea580c;
        margin: 0 0 5px 0;
      }
      .gstin {
        font-size: 11px;
        color: #9ca3af;
        margin: 0;
      }
      .email-info {
        font-size: 11px;
        color: #9ca3af;
        margin: 5px 0 0 0;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        background-color: #f9fafb;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 40px;
      }
      .info-block {
        display: flex;
        flex-direction: column;
      }
      .info-label {
        font-size: 10px;
        color: #9ca3af;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.5px;
        margin-bottom: 5px;
      }
      .info-value {
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: #111827;
      }
      .details-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
      }
      .details-col {
        width: 45%;
      }
      .details-col p {
        margin: 4px 0;
        font-size: 14px;
        color: #4b5563;
      }
      .details-col .bold {
        color: #111827;
        font-weight: 600;
      }
      .status-success {
        color: #10b981;
        font-weight: 600;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 40px;
      }
      th {
        text-align: left;
        padding: 15px 0;
        border-bottom: 2px solid #e5e7eb;
        color: #6b7280;
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 600;
      }
      .total-section {
        width: 350px;
        float: right;
        background-color: #f9fafb;
        padding: 25px;
        border-radius: 12px;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 14px;
        color: #4b5563;
      }
      .grand-total {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 2px dashed #e5e7eb;
        font-size: 18px;
        font-weight: 700;
        color: #111827;
        font-family: 'Outfit', sans-serif;
      }
      .grand-total .amount {
        color: #ea580c;
      }
      .footer {
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
        margin-top: 60px;
        clear: both;
      }
      .footer p { margin: 4px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      
      <div class="header">
        <div class="logo-section">
          <img src="${logoBase64}" class="logo-img" alt="Logo" />
          <div>
            <h1 class="brand-title">Rasoi Junction</h1>
            <p class="brand-subtitle">Gourmet Dining Experience</p>
          </div>
        </div>
        <div class="invoice-info">
          <p class="invoice-type">Table Booking Receipt</p>
          <p class="invoice-id">${invoiceNumber}</p>
          <p class="gstin">GSTIN: 07AAAAA1111A1Z1 (Sample)</p>
          <p class="email-info">rasoijunction.admin@gmail.com</p>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <span class="info-label">Reservation ID</span>
          <span class="info-value">${reservation._id.toString().substring(0, 10).toUpperCase()}</span>
        </div>
        <div class="info-block">
          <span class="info-label">Payment ID</span>
          <span class="info-value">${payment ? payment.paymentId : 'N/A'}</span>
        </div>
        <div class="info-block">
          <span class="info-label">Transaction ID</span>
          <span class="info-value">${payment ? payment.transactionId : 'N/A'}</span>
        </div>
        <div class="info-block">
          <span class="info-label">Reservation Date</span>
          <span class="info-value">${orderDate}</span>
        </div>
      </div>

      <div class="details-section">
        <div class="details-col">
          <p class="info-label">Guest Details</p>
          <p class="bold" style="margin-top: 10px;">${reservation.name}</p>
          <p>${reservation.phone}</p>
          <p>${reservation.email}</p>
        </div>
        <div class="details-col">
          <p class="info-label">Booking Details</p>
          <p style="margin-top: 10px;">Table Number: <span class="bold">${reservation.tableNumber}</span></p>
          <p>Time Slot: <span class="bold">${reservation.timeSlot}</span></p>
          <p>Number of Guests: <span class="bold">${reservation.guests}</span></p>
          <p class="bold" style="margin-top: 10px;">Payment: ${paymentText}</p>
          <div class="status-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            STATUS: SUCCESSFUL
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #1f2937;">
              Table Booking Fee
            </td>
            <td style="padding: 15px 0; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563;">
              ₹${subtotal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="total-section">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>GST (18%)</span>
          <span>₹${tax.toFixed(2)}</span>
        </div>
        ${reservation.loyaltyPointsUsed > 0 ? `
        <div class="totals-row" style="color: #10b981;">
          <span>Amount Paid using Loyalty Points</span>
          <span>-₹${reservation.loyaltyPointsUsed.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="totals-row grand-total">
          <span>Total Amount Paid</span>
          <span class="amount">₹${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for choosing Rasoi Junction.</p>
        <p>This is a simulated transaction record for college software project exhibition purposes.</p>
      </div>

    </div>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  return pdfBuffer;
};
