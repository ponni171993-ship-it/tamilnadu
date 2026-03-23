import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Register font (you can add custom fonts later)
// registerFont('path/to/font.ttf', { family: 'CustomFont' });

export async function generateWhatsAppBadge({ name, phone, registrationDate, userPhotoBuffer }) {
  try {
    // Canvas setup for WhatsApp status (optimal size: 1080x1920)
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#25D366'); // WhatsApp green
    gradient.addColorStop(1, '#128C7E'); // Darker WhatsApp green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Add decorative pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(540, 960, 50 + i * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Header text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Registration Complete!', 540, 200);

    // Certificate badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(140, 300, 800, 1000);
    
    // Badge border
    ctx.strokeStyle = '#25D366';
    ctx.lineWidth = 8;
    ctx.strokeRect(140, 300, 800, 1000);

    // Certificate title
    ctx.fillStyle = '#128C7E';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Certificate of Registration', 540, 400);

    // User name
    ctx.fillStyle = '#333';
    ctx.font = 'bold 56px Arial';
    ctx.fillText(name, 540, 550);

    // Add user photo if available
    if (userPhotoBuffer) {
      try {
        const photo = await loadImage(userPhotoBuffer);
        
        // Create circular clipping path for photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(540, 750, 120, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw photo
        const photoSize = 240; // Diameter of circle
        const photoX = 540 - photoSize / 2;
        const photoY = 750 - photoSize / 2;
        
        // Calculate aspect ratio to fit photo in circle
        const aspectRatio = photo.width / photo.height;
        let drawWidth = photoSize;
        let drawHeight = photoSize;
        
        if (aspectRatio > 1) {
          drawWidth = photoSize * aspectRatio;
          photoX = 540 - drawWidth / 2;
        } else {
          drawHeight = photoSize / aspectRatio;
          photoY = 750 - drawHeight / 2;
        }
        
        ctx.drawImage(photo, photoX, photoY, drawWidth, drawHeight);
        ctx.restore();
        
        // Add border around photo
        ctx.strokeStyle = '#25D366';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(540, 750, 120, 0, Math.PI * 2);
        ctx.stroke();
        
      } catch (photoError) {
        console.error('Error loading user photo:', photoError);
        // Fallback to placeholder if photo fails
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.arc(540, 750, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#999';
        ctx.font = '24px Arial';
        ctx.fillText('Photo', 540, 755);
      }
    } else {
      // Placeholder if no photo
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.arc(540, 750, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#999';
      ctx.font = '24px Arial';
      ctx.fillText('No Photo', 540, 755);
    }

    // Divider
    ctx.strokeStyle = '#25D366';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, 900);
    ctx.lineTo(880, 900);
    ctx.stroke();

    // Registration details
    ctx.fillStyle = '#555';
    ctx.font = '36px Arial';
    ctx.fillText('Phone: ' + phone, 540, 980);
    ctx.fillText('Registered: ' + registrationDate, 540, 1040);

    // QR Code placeholder (you can integrate QR code generation)
    ctx.fillStyle = '#333';
    ctx.fillRect(440, 1130, 200, 200);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('QR Code', 540, 1240);

    // Footer
    ctx.fillStyle = '#25D366';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Verify Online', 540, 1430);

    // WhatsApp branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '28px Arial';
    ctx.fillText('Share on WhatsApp Status', 540, 1800);

    // Generate buffer
    const buffer = canvas.toBuffer('image/png');
    return buffer;

  } catch (error) {
    console.error('Badge generation error:', error);
    throw new Error('Failed to generate WhatsApp badge');
  }
}

export async function generateSimpleBadge({ name, phone, userPhotoBuffer }) {
  try {
    // Simple badge for quick sharing
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    gradient.addColorStop(0, '#25D366');
    gradient.addColorStop(1, '#128C7E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);

    // White circle in center
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(400, 400, 300, 0, Math.PI * 2);
    ctx.fill();

    // Add user photo if available
    if (userPhotoBuffer) {
      try {
        const photo = await loadImage(userPhotoBuffer);
        
        // Create circular clipping path for photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 320, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw photo
        const photoSize = 200; // Diameter of circle
        const photoX = 400 - photoSize / 2;
        const photoY = 320 - photoSize / 2;
        
        // Calculate aspect ratio to fit photo in circle
        const aspectRatio = photo.width / photo.height;
        let drawWidth = photoSize;
        let drawHeight = photoSize;
        
        if (aspectRatio > 1) {
          drawWidth = photoSize * aspectRatio;
          photoX = 400 - drawWidth / 2;
        } else {
          drawHeight = photoSize / aspectRatio;
          photoY = 320 - drawHeight / 2;
        }
        
        ctx.drawImage(photo, photoX, photoY, drawWidth, drawHeight);
        ctx.restore();
        
        // Add border around photo
        ctx.strokeStyle = '#25D366';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(400, 320, 100, 0, Math.PI * 2);
        ctx.stroke();
        
      } catch (photoError) {
        console.error('Error loading user photo:', photoError);
        // Fallback to placeholder if photo fails
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.arc(400, 320, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#999';
        ctx.font = '20px Arial';
        ctx.fillText('Photo', 400, 325);
      }
    } else {
      // Placeholder if no photo
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.arc(400, 320, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#999';
      ctx.font = '20px Arial';
      ctx.fillText('No Photo', 400, 325);
    }

    // Registration text
    ctx.fillStyle = '#128C7E';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Registered', 400, 480);

    // User name
    ctx.font = 'bold 42px Arial';
    ctx.fillText(name, 400, 540);

    // Phone number
    ctx.font = '28px Arial';
    ctx.fillText(phone, 400, 580);

    // Generate buffer
    const buffer = canvas.toBuffer('image/png');
    return buffer;

  } catch (error) {
    console.error('Simple badge generation error:', error);
    throw new Error('Failed to generate simple badge');
  }
}
