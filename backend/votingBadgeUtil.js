import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateVotingBadge({ name, phone, userPhotoBuffer }) {
  try {
    // Canvas setup for voting badge (circular design)
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext('2d');

    // Dark blue outer circle (ring)
    ctx.fillStyle = '#1e3a8a'; // Dark blue color
    ctx.beginPath();
    ctx.arc(400, 400, 380, 0, Math.PI * 2);
    ctx.fill();

    // White inner circle
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(400, 430, 250, 0, Math.PI * 2);
    ctx.fill();

    // Add SWEEP logo (top left)
    try {
      const sweepLogoPath = path.join(__dirname, 'assets', 'logos', 'sweep-logo.png');
      if (fs.existsSync(sweepLogoPath)) {
        const sweepLogo = await loadImage(sweepLogoPath);
        ctx.drawImage(sweepLogo, 140, 140, 140, 31); // Adjust size and position as needed
      } else {
        // Fallback to text if logo not found
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('SWEEP', 100, 80);
      }
    } catch (logoError) {
      console.error('Error loading SWEEP logo:', logoError);
      // Fallback to text if logo loading fails
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('SWEEP', 50, 80);
    }

    // Add Election Commission logo (top right)
    try {
      const electionLogoPath = path.join(__dirname, 'assets', 'logos', 'Election_Commission_of_India_Logo.png');
      if (fs.existsSync(electionLogoPath)) {
        const electionLogo = await loadImage(electionLogoPath);
        ctx.drawImage(electionLogo,250, 50, 140, 131); // Position and size for top right
      } else {
        // Fallback to text if logo not found
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Election Commission of India', 750, 80);
        
        ctx.font = '14px Arial';
        ctx.fillText('இந்திய தேர்தல் ஆணையம்', 750, 100);
      }
    } catch (electionLogoError) {
      console.error('Error loading Election Commission logo:', electionLogoError);
      // Fallback to text if logo loading fails
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('Election Commission of India', 750, 80);
      
      ctx.font = '14px Arial';
      ctx.fillText('இந்திய தேர்தல் ஆணையம்', 750, 100);
    }

    // Add district name (top right)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VILLUPURAM DISTRICT', 600, 120);

    // Add user photo in center if available
    if (userPhotoBuffer) {
      try {
        const photo = await loadImage(userPhotoBuffer);
        
        // Create circular clipping path for photo - match white circle size
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 430, 250, 0, Math.PI * 2); // Match white circle radius
        ctx.closePath();
        ctx.clip();
        
        // Draw photo - fit to white circle (250px diameter)
        const whiteCircleRadius = 250;
        const photoSize = whiteCircleRadius * 2; // 500px to cover the circle
        const aspectRatio = photo.width / photo.height;
        let drawWidth = photoSize;
        let drawHeight = photoSize;
        let photoX = 400 - photoSize / 2;
        let photoY = 350 - photoSize / 2;
        
        if (aspectRatio > 1) {
          drawWidth = photoSize * aspectRatio;
          photoX = 400 - drawWidth / 2;
        } else {
          drawHeight = photoSize / aspectRatio;
          photoY = 350 - drawHeight / 2;
        }
        
        ctx.drawImage(photo, photoX, photoY, drawWidth, drawHeight);
        ctx.restore();
        
        // Add border around photo - match white circle
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(400, 350, 250, 0, Math.PI * 2); // Match white circle radius
        ctx.stroke();
        
      } catch (photoError) {
        console.error('Error loading user photo:', photoError);
        // Fallback placeholder - match white circle size
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.arc(400, 350, 250, 0, Math.PI * 2); // Match white circle radius
        ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.font = '24px Arial'; // Larger font for bigger circle
        ctx.textAlign = 'center';
        ctx.fillText('Photo', 400, 355);
      }
    } else {
      // Placeholder if no photo - match white circle size
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.arc(400, 350, 250, 0, Math.PI * 2); // Match white circle radius
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.font = '24px Arial'; // Larger font for bigger circle
      ctx.textAlign = 'center';
      ctx.fillText('No Photo', 400, 355);
    }

    // Add light blue wave shape at bottom
    ctx.fillStyle = '#60a5fa'; // Light blue
    ctx.beginPath();
    ctx.moveTo(200, 500);
    ctx.quadraticCurveTo(300, 480, 400, 500);
    ctx.quadraticCurveTo(500, 520, 600, 500);
    ctx.lineTo(600, 650);
    ctx.lineTo(200, 650);
    ctx.closePath();
    ctx.fill();

    // Add voting slogan in the wave
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("I'LL VOTE 100%", 400, 560);
    ctx.font = 'bold 20px Arial';
    ctx.fillText('MY VOTE MY PRIDE', 400, 590);

    // Add user name below photo
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(name, 400, 470);

    // Add phone number
    ctx.font = '20px Arial';
    ctx.fillText(phone, 400, 495);

    // Add voting date at bottom
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('VOTING DAY : APRIL 23, 2026', 400, 750);

    // Generate buffer
    const buffer = canvas.toBuffer('image/png');
    return buffer;

  } catch (error) {
    console.error('Voting badge generation error:', error);
    throw new Error('Failed to generate voting badge');
  }
}

export async function generateSimpleVotingBadge({ name, phone, userPhotoBuffer }) {
  try {
    // Simple circular voting badge
    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext('2d');

    // Dark blue outer circle
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(300, 300, 280, 0, Math.PI * 2);
    ctx.fill();

    // White inner circle
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(300, 300, 200, 0, Math.PI * 2);
    ctx.fill();

    // Add SWEEP logo (top)
    try {
      const sweepLogoPath = path.join(__dirname, 'assets', 'logos', 'sweep-logo.png');
      if (fs.existsSync(sweepLogoPath)) {
        const sweepLogo = await loadImage(sweepLogoPath);
        ctx.drawImage(sweepLogo, 240, 80, 120, 60); // Centered at top
      } else {
        // Fallback to text if logo not found
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SWEEP', 300, 110);
      }
    } catch (logoError) {
      console.error('Error loading SWEEP logo:', logoError);
      // Fallback to text if logo loading fails
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SWEEP', 300, 110);
    }

    // Add Election Commission logo (bottom)
    try {
      const electionLogoPath = path.join(__dirname, 'assets', 'logos', 'Election_Commission_of_India_Logo.png');
      if (fs.existsSync(electionLogoPath)) {
        const electionLogo = await loadImage(electionLogoPath);
        ctx.drawImage(electionLogo, 210, 480, 180, 60); // Position and size for bottom
      } else {
        // Fallback to text if logo not found
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Election Commission', 300, 510);
      }
    } catch (electionLogoError) {
      console.error('Error loading Election Commission logo:', electionLogoError);
      // Fallback to text if logo loading fails
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Election Commission', 300, 510);
    }

    // Add user photo
    if (userPhotoBuffer) {
      try {
        const photo = await loadImage(userPhotoBuffer);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 250, 200, 0, Math.PI * 2); // Match white circle radius
        ctx.closePath();
        ctx.clip();
        
        const whiteCircleRadius = 200;
        const photoSize = whiteCircleRadius * 2; // 400px to cover the circle
        const aspectRatio = photo.width / photo.height;
        let drawWidth = photoSize;
        let drawHeight = photoSize;
        let photoX = 300 - photoSize / 2;
        let photoY = 250 - photoSize / 2;
        
        if (aspectRatio > 1) {
          drawWidth = photoSize * aspectRatio;
          photoX = 300 - drawWidth / 2;
        } else {
          drawHeight = photoSize / aspectRatio;
          photoY = 250 - drawHeight / 2;
        }
        
        ctx.drawImage(photo, photoX, photoY, drawWidth, drawHeight);
        ctx.restore();
        
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(300, 250, 200, 0, Math.PI * 2); // Match white circle radius
        ctx.stroke();
        
      } catch (photoError) {
        console.error('Error loading user photo:', photoError);
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.arc(300, 250, 200, 0, Math.PI * 2); // Match white circle radius
        ctx.fill();
      }
    }

    // Add user name
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, 300, 350);

    // Add voting message
    ctx.font = 'bold 20px Arial';
    ctx.fillText("I'LL VOTE 100%", 300, 380);

    // Add voting date
    ctx.font = '16px Arial';
    ctx.fillText('APRIL 23, 2026', 300, 410);

    // Generate buffer
    const buffer = canvas.toBuffer('image/png');
    return buffer;

  } catch (error) {
    console.error('Simple voting badge generation error:', error);
    throw new Error('Failed to generate simple voting badge');
  }
}
