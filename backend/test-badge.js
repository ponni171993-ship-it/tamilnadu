import { generateVotingBadge } from './votingBadgeUtil.js';
import fs from 'fs';

// Test badge generation with dummy data
async function testBadgeGeneration() {
  try {
    console.log('Testing badge generation...');
    
    // Create a simple test image buffer (1x1 pixel)
    const testPhotoBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
      0x00, 0x00, 0x00, 0x0D, // IHDR length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // Width: 1
      0x00, 0x00, 0x00, 0x01, // Height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, // Image data
      0x00, 0x00, 0x00, 0x00, // IEND
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    const badgeBuffer = await generateVotingBadge({
      name: 'Test User',
      phone: '1234567890',
      userPhotoBuffer: testPhotoBuffer
    });
    
    console.log('Badge generated successfully!');
    console.log('Badge buffer size:', badgeBuffer.length);
    
    // Save test badge
    fs.writeFileSync('test-badge.png', badgeBuffer);
    console.log('Test badge saved as test-badge.png');
    
  } catch (error) {
    console.error('Badge generation test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

testBadgeGeneration();
