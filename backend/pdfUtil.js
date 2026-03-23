import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateUserPDF({ name, phone, photo, userId, outputDir }) {
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

    // Add photo if provided
    if (photo) {
      try {
        // Add photo to the right side
        const photoSize = 120;
        const photoX = doc.page.width - 50 - photoSize;
        const photoY = 140;
        
        // Draw border for photo
        doc.rect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4).stroke('#0078d4');
        
        // Add photo (centered in the border)
        doc.image(photo, photoX, photoY, { 
          width: photoSize, 
          height: photoSize,
          align: 'center',
          valign: 'center'
        });
      } catch (photoError) {
        console.error('Error adding photo to PDF:', photoError);
        // Continue without photo if there's an error
      }
    }

    // Dynamic user name (adjusted position if photo is present)
    const nameX = 50;
    const nameY = photo ? 140 : 180;
    
    doc.fontSize(24).fillColor('#0078d4').text(name, nameX, nameY, { underline: true });

    // Dynamic phone number
    doc.moveDown(1);
    const phoneY = photo ? 280 : 245;
    doc.fontSize(16).fillColor('black').text('Phone Number:', nameX, phoneY);
    doc.fontSize(18).fillColor('#0078d4').text(phone, nameX, phoneY + 25);

    // More static content
    doc.moveDown(2);
    const thankYouY = photo ? 350 : 300;
    doc.fontSize(14).fillColor('black').text('Thank you for registering!', nameX, thankYouY);
    
    // Add registration date
    const registrationDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fontSize(12).fillColor('gray').text(`Registration Date: ${registrationDate}`, nameX, thankYouY + 50);
    
    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}
