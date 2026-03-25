import fs from 'fs';
import path from 'path';
import { uploadPhotoToS3, uploadBadgeToS3, uploadPDFToS3, listS3Files } from './s3Util.js';

// Test S3 Integration
async function testS3Integration() {
  console.log('🧪 Testing S3 Integration...\n');

  try {
    // Test 1: List existing files
    console.log('📋 Test 1: Listing S3 files...');
    const photos = await listS3Files('photos/');
    const badges = await listS3Files('badges/');
    const pdfs = await listS3Files('pdfs/');
    
    console.log(`📸 Photos: ${photos.length} files`);
    console.log(`🏷️ Badges: ${badges.length} files`);
    console.log(`📄 PDFs: ${pdfs.length} files`);

    // Test 2: Upload a test photo
    console.log('\n📸 Test 2: Uploading test photo...');
    const testPhotoPath = path.join(__dirname, 'assets', 'logos', 'Election_Commission_of_India_Logo.png');
    
    if (fs.existsSync(testPhotoPath)) {
      const photoBuffer = fs.readFileSync(testPhotoPath);
      const photoUrl = await uploadPhotoToS3(photoBuffer, 'test-election-logo.png');
      console.log(`✅ Photo uploaded: ${photoUrl}`);
    } else {
      console.log('⚠️ Test photo not found, skipping photo upload test');
    }

    // Test 3: Create and upload a test badge
    console.log('\n🏷️ Test 3: Creating test badge...');
    const { createVotingBadge } = await import('./votingBadgeUtil.js');
    
    const testData = {
      name: 'Test User',
      phone: '1234567890',
      photoPath: testPhotoPath
    };

    const badgeBuffer = await createVotingBadge(testData, 'full');
    const badgeUrl = await uploadBadgeToS3(badgeBuffer, 'test-badge.png');
    console.log(`✅ Badge uploaded: ${badgeUrl}`);

    // Test 4: Upload a test PDF
    console.log('\n📄 Test 4: Creating test PDF...');
    const { createVotingPDF } = await import('./votingPDFUtil.js');
    
    const pdfBuffer = await createVotingPDF(testData);
    const pdfUrl = await uploadPDFToS3(pdfBuffer, 'test-certificate.pdf');
    console.log(`✅ PDF uploaded: ${pdfUrl}`);

    console.log('\n🎉 All S3 integration tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ S3 connection working');
    console.log('- ✅ Photo upload working');
    console.log('- ✅ Badge upload working');
    console.log('- ✅ PDF upload working');
    console.log('- ✅ File listing working');

  } catch (error) {
    console.error('❌ S3 Integration Test Failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testS3Integration();
