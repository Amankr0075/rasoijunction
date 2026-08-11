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

export const generateFinancialLogExcel = async (kpiStats) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Financial Logs', {
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
    { key: 'date', width: 15 },
    { key: 'invoiceNo', width: 20 },
    { key: 'orderId', width: 20 },
    { key: 'customer', width: 25 },
    { key: 'amount', width: 15 },
    { key: 'status', width: 18 },
    { key: 'payment', width: 18 },
    { key: 'colLast', width: 5 }, // Padding
  ];

  // Header Title
  sheet.mergeCells('B2:H4');
  const titleCell = sheet.getCell('B2');
  titleCell.value = 'RASOI JUNCTION\nENTERPRISE FINANCIAL LOGS & SALES METRICS';
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

  // Platform Details & Generation Date
  sheet.mergeCells('B5:H5');
  const detailsCell = sheet.getCell('B5');
  detailsCell.value = 'Parul University, Vadodara | Phone: +91 1234567890 | Email: rasoijunction.admin@gmail.com';
  detailsCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  detailsCell.alignment = { horizontal: 'center' };

  sheet.mergeCells('B7:H7');
  const periodCell = sheet.getCell('B7');
  periodCell.value = `Report Generated On: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`;
  periodCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFEA580C' } }; // Orange
  periodCell.alignment = { horizontal: 'center' };

  // Summary Metrics
  sheet.mergeCells('B9:D9');
  sheet.getCell('B9').value = `Total Orders Processed: ${kpiStats.orders.length}`;
  sheet.getCell('B9').font = { bold: true, size: 11 };

  sheet.mergeCells('E9:H9');
  sheet.getCell('E9').value = `Total Enterprise Sales: ₹${kpiStats.totalSales.toLocaleString('en-IN')}.00`;
  sheet.getCell('E9').font = { bold: true, size: 12, color: { argb: 'FF16A34A' } };
  sheet.getCell('E9').alignment = { horizontal: 'right' };

  sheet.mergeCells('B10:D10');
  sheet.getCell('B10').value = `Total Reservations: ${kpiStats.reservations.length}`;
  sheet.getCell('B10').font = { bold: true, size: 11 };

  sheet.mergeCells('E10:H10');
  sheet.getCell('E10').value = `Active Registered Users: ${kpiStats.customers.length}`;
  sheet.getCell('E10').font = { bold: true, size: 11 };
  sheet.getCell('E10').alignment = { horizontal: 'right' };

  // Data Table Headers
  const headerRowIdx = 12;
  const headers = ['Date', 'Invoice No', 'Order ID', 'Customer Name', 'Amount (₹)', 'Order Status', 'Payment Method'];
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
  
  kpiStats.orders.forEach((order, index) => {
    const isAlternate = index % 2 === 0;
    const rowFill = isAlternate ? 'FFF8FAFC' : 'FFFFFFFF'; // Slate 50 / White

    const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB');
    const invoiceNo = `INV-${new Date(order.createdAt).toISOString().split('T')[0].replace(/-/g, '')}-${order.orderId.split('-')[1] || '00'}`;

    const rowData = [
      dateStr,
      invoiceNo,
      order.orderId,
      order.user?.name || order.user?.firstName || 'Guest',
      order.total,
      order.orderStatus.toUpperCase(),
      (order.paymentMethod || 'N/A').toUpperCase()
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
      if (idx === 0 || idx === 1 || idx === 2 || idx === 4 || idx === 5 || idx === 6) {
        cell.alignment = { ...cell.alignment, horizontal: 'center' };
      }
    });

    currentRow++;
  });

  // Grand Total Row at bottom
  sheet.mergeCells(`B${currentRow}:E${currentRow}`);
  const gtLabelCell = sheet.getCell(`B${currentRow}`);
  gtLabelCell.value = 'GRAND TOTAL:';
  gtLabelCell.font = { bold: true };
  gtLabelCell.alignment = { horizontal: 'right' };
  
  const gtValueCell = sheet.getCell(`F${currentRow}`);
  gtValueCell.value = `₹${kpiStats.totalSales.toLocaleString('en-IN')}.00`;
  gtValueCell.font = { bold: true };
  gtValueCell.alignment = { horizontal: 'center' };
  
  // Apply bottom border for grand total row
  sheet.mergeCells(`G${currentRow}:H${currentRow}`);

  // Write to Buffer and Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Rasoi_Junction_Financial_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
};
