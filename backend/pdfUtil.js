import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateUserPDF({ name, userId, outputDir }) {
  return new Promise((resolve, reject) => {
    const fileName = `user-${userId}.pdf`;
    const filePath = path.join(outputDir, fileName);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Static design elements
    doc.rect(0, 0, doc.page.width, 80).fill('#0078d4');
    doc.fillColor('white').fontSize(28).text('Registration Certificate', 50, 30, { align: 'left' });
    doc.moveDown(2);
    doc.fillColor('black').fontSize(18).text('This certifies that:', 50, 140);

    // Dynamic user name
    doc.fontSize(24).fillColor('#0078d4').text(name, 50, 180, { underline: true });

    // More static content
    doc.moveDown(2);
    doc.fontSize(14).fillColor('black').text('Thank you for registering!', 50, 240);
    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}
