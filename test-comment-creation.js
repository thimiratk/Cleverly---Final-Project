#!/usr/bin/env node

// Test comment creation with stance analysis
const { execSync, spawn } = require('child_process');

console.log('🧪 Testing Comment Creation with Stance Analysis...\n');

// Test data
const testCommentData = {
  content: "I completely agree with this review! The food was amazing and the service was excellent.",
  userId: "test-user-id", 
  reviewId: "test-review-id"
};

console.log('📝 Test Comment Data:');
console.log('   Content:', testCommentData.content.substring(0, 50) + '...');
console.log('   Expected Stance: AGREE (high confidence)\n');

// Test if server is running
console.log('1️⃣ Checking Review Service...');
try {
  const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:6002/api-docs', { encoding: 'utf8' });
  if (result.includes('200') || result.includes('302')) {
    console.log('   ✅ Review service is running on port 6002');
  } else {
    console.log('   ❌ Review service not responding properly');
  }
} catch (error) {
  console.log('   ❌ Review service is not reachable');
  console.log('   💡 Start with: cd Server/org && npm run dev');
  process.exit(1);
}

// Test comment creation endpoint
console.log('\n2️⃣ Testing Comment Creation...');

const curl = spawn('curl', [
  '-v',
  '-X', 'POST',
  'http://localhost:6002/comments',
  '-H', 'Content-Type: application/json',
  '-d', JSON.stringify(testCommentData)
], { stdio: 'inherit' });

curl.on('close', (code) => {
  console.log(`\n📊 Comment creation test completed with code: ${code}`);
  
  if (code === 0) {
    console.log('\n✅ Next Steps:');
    console.log('   1. Check server console logs for stance analysis messages');
    console.log('   2. Look for these log entries:');
    console.log('      • "Starting stance analysis for comment: [id]"');
    console.log('      • "Stance analysis result: ..."');
    console.log('      • "Comment updated successfully with stance data"');
    console.log('   3. If no logs appear, the stance analysis may not be triggered');
  } else {
    console.log('\n❌ Comment creation failed. Possible issues:');
    console.log('   • Invalid userId or reviewId (need real IDs from database)');
    console.log('   • Missing authentication');
    console.log('   • Database connection issues');
    console.log('   • Validation errors');
  }
  
  console.log('\n🔍 Debug Tips:');
  console.log('   • Check server logs in the terminal running npm run dev');
  console.log('   • Use existing user/review IDs from your database');
  console.log('   • Test with a simple GET request first');
});

console.log('\n⏱️ Running comment creation test...');