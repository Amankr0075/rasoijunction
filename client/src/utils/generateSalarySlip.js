import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    img.onerror = error => reject(error);
    img.src = url;
  });
};

const numberToWords = (num) => {
  if (num === 0) return 'Zero Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.replace(/\s+/g, ' ').trim() + ' Only';
};

export const generateSalarySlip = async (user, payment, action = 'download') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Try adding logo
  let logoData = null;
  try {
    logoData = await getBase64ImageFromURL('/logo.png');
  } catch (err) {
    console.error('Failed to load logo for PDF:', err);
  }

  // --- TOP HEADER BACKGROUND ---
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 45, 'F');

  let headerTextStartX = 15;
  if (logoData) {
    doc.addImage(logoData, 'PNG', 15, 10, 25, 25);
    headerTextStartX = 45;
  }

  // Company Info
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('RASOI JUNCTION', headerTextStartX, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Parul University, Vadodara, Gujarat, 391760', headerTextStartX, 28);
  doc.text('Phone: +91 1234567890 | Email: rasoijunction.admin@gmail.com', headerTextStartX, 33);

  // --- WATERMARK ---
  if (logoData) {
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    const wmSize = 140;
    doc.addImage(logoData, 'PNG', (pageWidth - wmSize) / 2, (pageHeight - wmSize) / 2 + 20, wmSize, wmSize);
    doc.setGState(new doc.GState({ opacity: 1.0 }));
  }

  // --- PAYSLIP TITLE ---
  doc.setFontSize(20);
  doc.setTextColor(234, 88, 12); // Orange primary
  doc.setFont('helvetica', 'bold');
  doc.text('PAYSLIP', pageWidth - 15, 60, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`For the month of ${months[payment.month]} ${payment.year}`, pageWidth - 15, 66, { align: 'right' });

  // --- EMPLOYEE SUMMARY PANEL ---
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 75, pageWidth - 30, 35, 3, 3, 'FD');

  const employeeId = user.employeeId || user._id || 'N/A';

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');

  // Left Column
  doc.text('Employee Name:', 20, 85);
  doc.text('Employee ID:', 20, 93);
  doc.text('Designation:', 20, 101);

  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.text(`${user.name || user.firstName}`, 55, 85);
  doc.text(`${employeeId}`, 55, 93);
  doc.text(`${user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Staff'}`, 55, 101);

  // Right Column
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Payment Date:', pageWidth / 2 + 10, 85);
  doc.text('Payment Method:', pageWidth / 2 + 10, 93);
  doc.text('Email:', pageWidth / 2 + 10, 101);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`${new Date(payment.paidAt).toLocaleDateString('en-GB')}`, pageWidth / 2 + 45, 85);
  doc.text(`${payment.paymentMethod || 'Bank Transfer'}`, pageWidth / 2 + 45, 93);
  doc.text(`${user.email}`, pageWidth / 2 + 45, 101);

  // --- EARNINGS & DEDUCTIONS TABLE ---
  const baseSalary = user.staffDetails?.salary || 0;
  const deductions = Math.max(0, baseSalary - payment.amount);

  autoTable(doc, {
    startY: 120,
    margin: { left: 15, right: 15 },
    head: [['EARNINGS', 'AMOUNT (Rs.)', 'DEDUCTIONS', 'AMOUNT (Rs.)']],
    body: [
      ['Basic Salary', baseSalary.toFixed(2), 'Leave / Absences', deductions.toFixed(2)],
      // Empty padding row for better visual spacing
      ['', '', '', '']
    ],
    foot: [
      ['Gross Earnings', baseSalary.toFixed(2), 'Total Deductions', deductions.toFixed(2)]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      fontSize: 9,
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      fontSize: 10,
      cellPadding: 8
    },
    footStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9,
      lineWidth: { top: 0.5, bottom: 0.5 },
      lineColor: [203, 213, 225]
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { halign: 'right', cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { halign: 'right', cellWidth: 40 }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  // --- NET PAY BLOCK ---
  doc.setFillColor(234, 88, 12); // Orange primary
  doc.roundedRect(15, finalY, pageWidth / 2 - 20, 25, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('NET PAY', 22, finalY + 10);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  // Replaced ₹ with Rs. to fix font rendering issues
  doc.text(`Rs. ${payment.amount.toFixed(2)}`, 22, finalY + 20);

  // --- AMOUNT IN WORDS ---
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount in words:', pageWidth / 2 + 5, finalY + 10);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${numberToWords(Math.round(payment.amount))}`, pageWidth / 2 + 5, finalY + 16, { maxWidth: pageWidth / 2 - 20 });

  // --- SIGNATURES ---
  const sigY = finalY + 55;

  // Add Simulated Physical Signature (Italicized blue text)
  doc.setFont('times', 'italic');
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102); // Dark ink blue
  doc.text('Rasoi Junction', 45, sigY - 5, { align: 'center' });

  // Draw Signature Lines
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, sigY, 75, sigY);
  doc.line(pageWidth - 75, sigY, pageWidth - 15, sigY);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Employer Signature', 45, sigY + 5, { align: 'center' });
  doc.text('Employee Signature', pageWidth - 45, sigY + 5, { align: 'center' });

  // --- FOOTER ---
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated document. It does not require any physical Signature', pageWidth / 2, pageHeight - 6, { align: 'center' });

  // --- OUTPUT ACTION ---
  if (action === 'view') {
    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl, '_blank');
  } else {
    const userName = user.name || user.firstName || 'Employee';
    doc.save(`Salary_Slip_${userName.replace(/\s+/g, '_')}_${months[payment.month]}_${payment.year}.pdf`);
  }
};



