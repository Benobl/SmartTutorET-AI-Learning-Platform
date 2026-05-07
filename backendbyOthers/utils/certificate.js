const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a PDF certificate for a student who completed a course.
 * Returns the file path (relative to uploads/) and the certificate ID.
 */
const generateCertificate = async ({ studentName, courseName, completionDate, certId }) => {
  const id = certId || uuidv4();
  const fileName = `cert-${id}.pdf`;
  const dirPath = path.join(__dirname, '..', 'uploads', 'certificates');

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // ── Background ──────────────────────────────────────────────────────────
    doc.rect(0, 0, pageWidth, pageHeight).fill('#f8f9fa');

    // Outer border
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
      .lineWidth(3)
      .stroke('#1e40af');

    // Inner border
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
      .lineWidth(1)
      .stroke('#93c5fd');

    // ── Header ───────────────────────────────────────────────────────────────
    doc.fillColor('#1e40af')
      .fontSize(36)
      .font('Helvetica-Bold')
      .text('SmartTutorET', 0, 60, { align: 'center' });

    doc.fillColor('#374151')
      .fontSize(18)
      .font('Helvetica')
      .text('Certificate of Completion', 0, 105, { align: 'center' });

    // Decorative line
    const lineY = 135;
    doc.moveTo(100, lineY).lineTo(pageWidth - 100, lineY).lineWidth(1).stroke('#d1d5db');

    // ── Body ─────────────────────────────────────────────────────────────────
    doc.fillColor('#6b7280')
      .fontSize(14)
      .font('Helvetica')
      .text('This is to certify that', 0, 160, { align: 'center' });

    doc.fillColor('#111827')
      .fontSize(30)
      .font('Helvetica-Bold')
      .text(studentName, 0, 185, { align: 'center' });

    // Underline for name
    const nameWidth = doc.widthOfString(studentName, { fontSize: 30 });
    const nameX = (pageWidth - nameWidth) / 2;
    doc.moveTo(nameX, 220).lineTo(nameX + nameWidth, 220).lineWidth(1).stroke('#1e40af');

    doc.fillColor('#6b7280')
      .fontSize(14)
      .font('Helvetica')
      .text('has successfully completed the course', 0, 235, { align: 'center' });

    doc.fillColor('#1e40af')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(courseName, 0, 260, { align: 'center' });

    // ── Footer ───────────────────────────────────────────────────────────────
    const footerY = pageHeight - 120;
    doc.moveTo(100, footerY).lineTo(pageWidth - 100, footerY).lineWidth(1).stroke('#d1d5db');

    const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.fillColor('#374151')
      .fontSize(12)
      .font('Helvetica')
      .text(`Date of Completion: ${formattedDate}`, 80, footerY + 15);

    doc.fillColor('#374151')
      .fontSize(12)
      .font('Helvetica')
      .text(`Certificate ID: ${id}`, 80, footerY + 35);

    doc.fillColor('#6b7280')
      .fontSize(10)
      .text('Issued by SmartTutorET Platform', 0, footerY + 55, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve({ filePath: `uploads/certificates/${fileName}`, certId: id }));
    stream.on('error', reject);
  });
};

module.exports = { generateCertificate };
