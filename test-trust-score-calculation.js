/**
 * Test Trust Score Calculation
 * 
 * This script tests the real-time trust score calculation
 * Run with: node test-trust-score-calculation.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:6004/api';

// Test user IDs (replace with actual user IDs from your database)
const TEST_USER_IDS = [
  '68d7786a0b386ba69a76d33e',
  '68ea7a9b59a450318a536af6',
  '68ee11fdc9db38d7aec26625'
];

async function testTrustScoreCalculation() {
  console.log('🧪 Testing Trust Score Calculation\n');
  console.log('=' .repeat(60));

  for (const userId of TEST_USER_IDS) {
    try {
      console.log(`\n📊 Testing User: ${userId}`);
      
      // Test 1: Get trust score directly
      console.log('  Test 1: GET /profile/:userId/trust-score');
      const trustScoreResponse = await axios.get(`${BASE_URL}/profile/${userId}/trust-score`);
      console.log('  ✅ Trust Score:', trustScoreResponse.data.trustScore);
      console.log('  📈 Breakdown:', JSON.stringify(trustScoreResponse.data.breakdown, null, 2));

      // Test 2: Get user profile (should include trust score)
      console.log('\n  Test 2: GET /profile/:userId');
      const profileResponse = await axios.get(`${BASE_URL}/profile/${userId}`);
      console.log('  ✅ Profile Trust Score:', profileResponse.data.trustScore);
      console.log('  👤 Username:', profileResponse.data.username);

      // Test 3: Get user badges (should include trust score)
      console.log('\n  Test 3: GET /profile/:userId/badges');
      const badgesResponse = await axios.get(`${BASE_URL}/profile/${userId}/badges`);
      console.log('  ✅ Badges Trust Score:', badgesResponse.data.trustScore);
      console.log('  🏆 Badges Count:', badgesResponse.data.badges.length);

      // Verify consistency
      if (trustScoreResponse.data.trustScore === profileResponse.data.trustScore &&
          trustScoreResponse.data.trustScore === badgesResponse.data.trustScore) {
        console.log('\n  ✅ PASS: All endpoints return consistent trust score');
      } else {
        console.log('\n  ❌ FAIL: Trust scores are inconsistent!');
        console.log('    - Trust Score Endpoint:', trustScoreResponse.data.trustScore);
        console.log('    - Profile Endpoint:', profileResponse.data.trustScore);
        console.log('    - Badges Endpoint:', badgesResponse.data.trustScore);
      }

    } catch (error) {
      console.log(`  ❌ Error testing user ${userId}:`, error.message);
      if (error.response) {
        console.log('    Response:', error.response.data);
      }
    }
    
    console.log('  ' + '-'.repeat(58));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Trust Score Calculation Test Complete!\n');
}

// Run tests
testTrustScoreCalculation().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
