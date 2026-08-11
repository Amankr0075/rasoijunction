import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

export const generateReservationExcelReport = async (reservations, periodStr) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Reservations Record', {
    views: [{ showGridLines: false }],
  });

  // Fetch logo
  let logoId;
  try {
    const logoData = await getBase64ImageFromURL('/logo.png');
    logoId = workbook.addImage({
      base64: logoData,
      extension: 'png',
    });
  } catch (err) {
    console.error('Failed to load logo for Excel:', err);
  }

  // Set default column widths
  sheet.columns = [
    { key: 'col1', width: 5 }, // Padding
    { key: 'invoiceNo', width: 20 },
    { key: 'date', width: 20 },
    { key: 'customer', width: 25 },
    { key: 'guests', width: 10 },
    { key: 'status', width: 18 },
    { key: 'payment', width: 18 },
    { key: 'amount', width: 15 },
    { key: 'colLast', width: 5 }, // Padding
  ];

  // Header Title
  sheet.mergeCells('B2:H4');
  const titleCell = sheet.getCell('B2');
  titleCell.value = 'RASOI JUNCTION\nRESERVATIONS & BOOKINGS REPORT';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate 800
  };

  // Add Logo if available
  if (logoId) {
    sheet.addImage(logoId, {
      tl: { col: 1, row: 1.5 },
      ext: { width: 50, height: 50 },
    });
  }

  // Platform Details & Period
  sheet.mergeCells('B5:H5');
  const detailsCell = sheet.getCell('B5');
  detailsCell.value = 'Parul University, Vadodara | Phone: +91 1234567890 | Email: rasoijunction.admin@gmail.com';
  detailsCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  detailsCell.alignment = { horizontal: 'center' };

  sheet.mergeCells('B7:H7');
  const periodCell = sheet.getCell('B7');
  periodCell.value = `Report Period: ${periodStr}`;
  periodCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFEA580C' } }; // Orange
  periodCell.alignment = { horizontal: 'center' };

  // Summary Metrics
  const completedRes = reservations.filter((r) => r.status === 'completed' || r.paymentStatus === 'paid' || r.status === 'approved');
  const totalIncome = completedRes.reduce((sum, r) => sum + (r.amount || 199), 0); // Assuming 199 booking fee if amount not present
  const totalGuests = completedRes.reduce((sum, r) => sum + (r.guests || 0), 0);

  sheet.mergeCells('B9:C9');
  sheet.getCell('B9').value = `Total Bookings: ${reservations.length}`;
  sheet.getCell('B9').font = { bold: true };

  sheet.mergeCells('D9:E9');
  sheet.getCell('D9').value = `Total Guests: ${totalGuests}`;
  sheet.getCell('D9').font = { bold: true };

  sheet.mergeCells('F9:H9');
  sheet.getCell('F9').value = `Paid / Approved Bookings: ${completedRes.length}`;
  sheet.getCell('F9').font = { bold: true };

  sheet.mergeCells('B10:H10');
  const totalIncomeCell = sheet.getCell('B10');
  totalIncomeCell.value = `Total Reservation Income: Rs. ${totalIncome.toFixed(2)}`;
  totalIncomeCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF16A34A' } }; // Green
  totalIncomeCell.alignment = { horizontal: 'center' };

  // Data Table Headers
  const headerRowIdx = 12;
  const headers = ['Invoice No', 'Reservation Date', 'Guest Name', 'Guests', 'Status', 'Payment', 'Amount (Rs.)'];
  const startColCode = 'B'.charCodeAt(0);

  headers.forEach((header, idx) => {
    const colChar = String.fromCharCode(startColCode + idx);
    const cell = sheet.getCell(`${colChar}${headerRowIdx}`);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF334155' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });

  // Populate Data Rows
  let currentRow = headerRowIdx + 1;
  
  reservations.forEach((res, index) => {
    const isAlternate = index % 2 === 0;
    const rowFill = isAlternate ? 'FFF8FAFC' : 'FFFFFFFF'; // Slate 50 / White

    const dateStr = new Date(res.date).toLocaleDateString('en-GB') + ' ' + res.timeSlot;
    const invoiceNo = `RES-${new Date(res.createdAt || res.date).toISOString().split('T')[0].replace(/-/g, '')}-${res._id.substring(res._id.length - 4)}`;
    const amount = res.amount || 199; // Default 199 for table fee if not set

    const rowData = [
      invoiceNo.toUpperCase(),
      dateStr,
      res.name || 'Guest User',
      res.guests || 1,
      res.status.toUpperCase(),
      (res.paymentStatus || 'Pending').toUpperCase(),
      amount,
    ];

    rowData.forEach((val, idx) => {
      const colChar = String.fromCharCode(startColCode + idx);
      const cell = sheet.getCell(`${colChar}${currentRow}`);
      cell.value = val;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowFill },
      };
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        left: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        right: { style: 'hair', color: { argb: 'FFE2E8F0' } },
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
      
      // Center specific columns
      if (idx === 0 || idx === 1 || idx === 3 || idx === 4 || idx === 5 || idx === 6) {
        cell.alignment = { ...cell.alignment, horizontal: 'center' };
      }
    });

    currentRow++;
  });

  // Grand Total Row at bottom
  sheet.mergeCells(`B${currentRow}:G${currentRow}`);
  const gtLabelCell = sheet.getCell(`B${currentRow}`);
  gtLabelCell.value = 'GRAND TOTAL:';
  gtLabelCell.font = { bold: true };
  gtLabelCell.alignment = { horizontal: 'right' };
  
  const gtValueCell = sheet.getCell(`H${currentRow}`);
  gtValueCell.value = `Rs. ${totalIncome.toFixed(2)}`;
  gtValueCell.font = { bold: true };
  gtValueCell.alignment = { horizontal: 'center' };

  // Write to Buffer and Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Rasoi_Junction_Reservations_${periodStr.replace(/\s+/g, '_')}.xlsx`);
};
