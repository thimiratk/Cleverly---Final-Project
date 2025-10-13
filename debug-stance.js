#!/usr/bin/env node

// Test if stance analysis is working by simulating the flow
const { execSync } = require('child_process');

console.log('🧪 Testing Stance Analysis Flow...\n');

// Test 1: Check if stance service is running
console.log('1️⃣ Testing Stance Service...');
try {
  const result = execSync('curl -s http://localhost:8004/health', { encoding: 'utf8' });
  const healthData = JSON.parse(result);
  if (healthData.status === 'ok') {
    console.log('   ✅ Stance service is running and healthy');
  } else {
    console.log('   ❌ Stance service is not healthy');
  }
} catch (error) {
  console.log('   ❌ Stance service is not reachable');
  console.log('   💡 Make sure Docker containers are running: docker-compose up -d');
}

// Test 2: Test stance detection endpoint
console.log('\n2️⃣ Testing Stance Detection...');
try {
  const testData = JSON.stringify({
    review_text: "This restaurant has amazing food!",
    comment_text: "I totally agree with this review!"
  });
  
  const result = execSync(`curl -s -X POST http://localhost:8004/detect-stance -H "Content-Type: application/json" -d '${testData}'`, { encoding: 'utf8' });
  const stanceResult = JSON.parse(result);
  
  if (stanceResult.stance && stanceResult.confidence) {
    console.log('   ✅ Stance detection working:', {
      stance: stanceResult.stance,
      confidence: stanceResult.confidence
    });
  } else {
    console.log('   ❌ Stance detection returned unexpected format:', stanceResult);
  }
} catch (error) {
  console.log('   ❌ Stance detection failed:', error.message);
}

// Test 3: Check if backend server is running
console.log('\n3️⃣ Checking Backend Server...');
try {
  // Try to reach the backend health endpoint (assuming it exists)
  const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health', { encoding: 'utf8' });
  if (result === '200') {
    console.log('   ✅ Backend server is running on port 8080');
  } else {
    console.log('   ⚠️ Backend server might not be running on port 8080');
  }
} catch (error) {
  console.log('   ❌ Backend server is not reachable');
  console.log('   💡 Start the backend server with: cd Server/org && npm run dev');
}

// Test 4: Manual stance analysis test
console.log('\n4️⃣ Manual Integration Test...');
console.log('   📝 To test comment creation with stance analysis:');
console.log('   1. Start backend server: cd Server/org && npm run dev');
console.log('   2. Create a comment via API and watch console logs');
console.log('   3. Check database for stance fields');

console.log('\n📋 Debugging Steps:');
console.log('   • Check server logs for stance analysis messages');
console.log('   • Verify STANCE_SERVICE_URL in .env file');
console.log('   • Ensure MongoDB connection is working');
console.log('   • Check if comment creation triggers stance analysis');

console.log('\n🔍 Current Environment:');
console.log('   STANCE_SERVICE_URL: http://localhost:8004');
console.log('   STANCE_ANALYSIS_TIMEOUT_MS: 10000');
console.log('   Database: MongoDB (from .env)');