import { jsPDF } from 'jspdf';

/**
 * Generates and triggers download of an Executive Admin Reporting PDF
 */
export const downloadAdminReportPDF = ({ period = 'Last 30 Days', salesTeam = 'All Teams', approvalStatus = 'All Statuses', repPerformance = [] }) => {
  const doc = new jsPDF();

  // Primary Accent Header
  doc.setFillColor(0, 113, 227);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DealFlow360 — Executive Sales Operations Report', 14, 16);

  // Metadata
  doc.setTextColor(100, 100, 110);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()} | Period: ${period} | Team: ${salesTeam} | Status: ${approvalStatus}`, 14, 34);

  // Divider
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  // KPI Summary Boxes
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 44, 56, 26, 3, 3, 'F');
  doc.roundedRect(77, 44, 56, 26, 3, 3, 'F');
  doc.roundedRect(140, 44, 56, 26, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 130);
  doc.text('TOTAL QUOTES', 18, 52);
  doc.text('AVG APPROVAL TIME', 81, 52);
  doc.text('TOP ATTACHED UPSELL', 144, 52);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 31);
  doc.text('148 Created', 18, 63);

  doc.setTextColor(27, 126, 54);
  doc.text('6.4 Hours', 81, 63);

  doc.setTextColor(121, 52, 158);
  doc.text('Care Plan 2yr', 144, 63);

  // Table Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(29, 29, 31);
  doc.text('Sales Representative Performance Matrix', 14, 82);

  // Table Header
  doc.setFillColor(235, 238, 245);
  doc.rect(14, 88, 182, 9, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 70);
  doc.text('Sales Representative', 18, 94);
  doc.text('Deals Won', 75, 94);
  doc.text('Total Revenue', 105, 94);
  doc.text('Avg Discount', 140, 94);
  doc.text('Approval SLA', 170, 94);

  // Table Rows
  let y = 104;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  repPerformance.forEach((rep, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 252);
      doc.rect(14, y - 5, 182, 8, 'F');
    }
    doc.setTextColor(29, 29, 31);
    doc.text(rep.name || 'Sales Rep', 18, y);
    doc.text(String(rep.dealsWon || 0), 75, y);
    doc.text(`$${(rep.revenue || 0).toLocaleString()}`, 105, y);

    // Color code discount
    if (rep.avgDiscount > 15) {
      doc.setTextColor(201, 52, 44);
    } else {
      doc.setTextColor(27, 126, 54);
    }
    doc.text(`${rep.avgDiscount || 0}%`, 140, y);

    doc.setTextColor(29, 29, 31);
    doc.text(`${rep.avgApprovalTurnaround || '2.4'} hrs`, 170, y);

    y += 9;
  });

  // Governance Footer
  doc.setDrawColor(220, 220, 225);
  doc.line(14, 275, 196, 275);
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 150);
  doc.text('DealFlow360 Autonomous Sales Operations Platform — Confidential Internal Document', 14, 282);
  doc.text('Page 1 of 1', 180, 282);

  doc.save(`dealflow360_admin_report_${Date.now()}.pdf`);
};

/**
 * Generates and triggers download of an Invoice Reconciliation PDF
 */
export const downloadInvoicePDF = ({ invoiceId = 'INV-1042', customer = 'Acme Corp', amount = 2730, status = 'Unpaid', dueDate = 'Sep 10, 2026' }) => {
  const doc = new jsPDF();

  // Header Bar
  doc.setFillColor(28, 73, 58);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DealFlow360 — Invoice Reconciliation Summary', 14, 16);

  // Invoice Meta
  doc.setTextColor(29, 29, 31);
  doc.setFontSize(12);
  doc.text(`Invoice ID: ${invoiceId}`, 14, 38);
  doc.text(`Customer: ${customer}`, 14, 46);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 110);
  doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 130, 38);
  doc.text(`Due Date: ${dueDate}`, 130, 46);
  doc.text(`Status: ${status.toUpperCase()}`, 130, 54);

  // Divider
  doc.setDrawColor(220, 220, 225);
  doc.line(14, 60, 196, 60);

  // Line Items Table
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 68, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 70);
  doc.text('Description', 18, 73);
  doc.text('Qty', 110, 73);
  doc.text('Unit Price', 135, 73);
  doc.text('Line Amount', 170, 73);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(29, 29, 31);
  doc.text('Laptop Pro 14 (Hardware Fulfillment - Partial Split)', 18, 84);
  doc.text('2', 110, 84);
  doc.text('$1,200.00', 135, 84);
  doc.text('$2,280.00', 170, 84);

  doc.text('Onsite Setup Service (Professional Services)', 18, 93);
  doc.text('1', 110, 93);
  doc.text('$450.00', 135, 93);
  doc.text('$450.00', 170, 93);

  // Total Calculation Box
  doc.setDrawColor(220, 220, 225);
  doc.line(14, 105, 196, 105);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Invoice Balance:', 120, 115);
  doc.setTextColor(0, 113, 227);
  doc.text(`$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 170, 115);

  // Payment Instruction
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 130, 182, 35, 3, 3, 'F');
  doc.setTextColor(29, 29, 31);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Reconciliation Terms:', 18, 138);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 110);
  doc.text('1. Invoiced lines reconcile against physical shipments. Unshipped backorders remain uninvoiced.', 18, 145);
  doc.text('2. Please remit payment within 30 days of receipt via ACH or Wire Transfer.', 18, 152);
  doc.text('3. Reference Invoice ID when remitting payment to operations@dealflow360.com', 18, 159);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 150);
  doc.text('DealFlow360 Billing & Financial Operations Engine', 14, 282);

  doc.save(`dealflow360_invoice_${invoiceId}.pdf`);
};

/**
 * Generates and triggers download of an Official Quotation PDF
 */
export const downloadQuotationPDF = ({ quoteId = 'Q-1042', customerName = 'Acme Corp', items = [], grandTotal = 0 }) => {
  const doc = new jsPDF();

  // Header Bar
  doc.setFillColor(0, 113, 227);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DealFlow360 — Official Commercial Quotation', 14, 16);

  // Quote Meta
  doc.setTextColor(29, 29, 31);
  doc.setFontSize(12);
  doc.text(`Quotation ID: ${quoteId}`, 14, 38);
  doc.text(`Customer Account: ${customerName}`, 14, 46);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 110);
  doc.text(`Proposal Date: ${new Date().toLocaleDateString()}`, 130, 38);
  doc.text('Validity: 30 Days from issue', 130, 46);

  // Divider
  doc.setDrawColor(220, 220, 225);
  doc.line(14, 54, 196, 54);

  // Table
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 60, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 70);
  doc.text('Product / Solution', 18, 65);
  doc.text('Qty', 105, 65);
  doc.text('List Price', 125, 65);
  doc.text('Discount', 150, 65);
  doc.text('Line Net', 172, 65);

  let y = 75;
  doc.setFont('helvetica', 'normal');
  items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 252);
      doc.rect(14, y - 5, 182, 8, 'F');
    }
    const lineNet = item.price * item.qty * (1 - (item.discount || 0) / 100);
    doc.setTextColor(29, 29, 31);
    doc.text(item.name || 'Item', 18, y);
    doc.text(String(item.qty || 1), 105, y);
    doc.text(`$${Number(item.price || 0).toLocaleString()}`, 125, y);
    doc.text(`${item.discount || 0}%`, 150, y);
    doc.text(`$${lineNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 172, y);
    y += 9;
  });

  // Total
  doc.setDrawColor(220, 220, 225);
  doc.line(14, y + 2, 196, y + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Contract Net Total:', 115, y + 12);
  doc.setTextColor(0, 113, 227);
  doc.text(`$${Number(grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 165, y + 12);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 150);
  doc.text('This quotation is subject to DealFlow360 Master Services & Licensing Agreement.', 14, 282);

  doc.save(`dealflow360_quotation_${quoteId}.pdf`);
};
