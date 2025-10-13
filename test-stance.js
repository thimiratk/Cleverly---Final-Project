#!/usr/bin/env node

// Simple test to check stance analysis functionality
const { spawn } = require('child_process');

// Test stance detection endpoint directly
async function testStanceEndpoint() {
  console.log('Testing stance detection endpoint...');
  
  const testData = {
    review_text: "This restaurant has amazing food and great service!",
    comment_text: "I completely agree, the pasta was incredible!"
  };

  try {
    const curlProcess = spawn('curl', [
      '-X', 'POST',
      'http://localhost:8004/detect-stance',
      '-H', 'Content-Type: application/json',
      '-d', JSON.stringify(testData)
    ], { stdio: 'inherit' });

    curlProcess.on('close', (code) => {
      console.log(`\nStance detection test completed with code: ${code}`);
    });
  } catch (error) {
    console.error('Error testing stance endpoint:', error);
  }
}

// Test stance analysis through API gateway  
async function testAPIGateway() {
  console.log('\nTesting stance detection through API gateway...');
  
  const testData = {
    review_text: "This product is terrible and broke immediately!",
    comment_text: "I totally disagree, mine works perfectly fine."
  };

  try {
    const curlProcess = spawn('curl', [
      '-X', 'POST', 
      'http://localhost/api/stance/detect-stance',
      '-H', 'Content-Type: application/json',
      '-d', JSON.stringify(testData)
    ], { stdio: 'inherit' });

    curlProcess.on('close', (code) => {
      console.log(`\nAPI Gateway test completed with code: ${code}`);
    });
  } catch (error) {
    console.error('Error testing API gateway:', error);
  }
}

console.log('Starting stance detection tests...\n');

testStanceEndpoint();

setTimeout(() => {
  testAPIGateway();
}, 3000);