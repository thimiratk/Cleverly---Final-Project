#!/usr/bin/env node

// Test comment creation with stance analysis
const fs = require('fs');
const path = require('path');

console.log('Testing comment creation and stance analysis integration...\n');

// Check if the stance service is reachable
async function testServiceReachability() {
  const { spawn } = require('child_process');
  
  console.log('1. Testing stance service reachability...');
  
  return new Promise((resolve) => {
    const curlProcess = spawn('curl', [
      '-s', '-o', '/dev/null', '-w', '%{http_code}',
      'http://localhost:8004/health'
    ]);

    let output = '';
    curlProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    curlProcess.on('close', (code) => {
      const httpCode = output.trim();
      if (httpCode === '200') {
        console.log('   ✓ Stance service is reachable (HTTP 200)');
      } else {
        console.log(`   ✗ Stance service not reachable (HTTP ${httpCode})`);
      }
      resolve(httpCode === '200');
    });
  });
}

// Check if API gateway routing works
async function testAPIGatewayRouting() {
  const { spawn } = require('child_process');
  
  console.log('2. Testing API gateway stance routing...');
  
  return new Promise((resolve) => {
    const curlProcess = spawn('curl', [
      '-s', '-o', '/dev/null', '-w', '%{http_code}',
      'http://localhost/api/stance/health'
    ]);

    let output = '';
    curlProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    curlProcess.on('close', (code) => {
      const httpCode = output.trim();
      if (httpCode === '200') {
        console.log('   ✓ API gateway stance routing works (HTTP 200)');
      } else {
        console.log(`   ✗ API gateway stance routing failed (HTTP ${httpCode})`);
      }
      resolve(httpCode === '200');
    });
  });
}

// Check stance analysis utility configuration
function testStanceAnalysisConfig() {
  console.log('3. Checking stance analysis utility configuration...');
  
  const stanceUtilPath = path.join(__dirname, 'Server/org/apps/review-service/src/utils/stance-analysis.ts');
  
  if (fs.existsSync(stanceUtilPath)) {
    console.log('   ✓ Stance analysis utility file exists');
    
    const content = fs.readFileSync(stanceUtilPath, 'utf8');
    
    if (content.includes('http://localhost:8004/detect-stance')) {
      console.log('   ✓ Default endpoint configuration is correct');
    } else {
      console.log('   ✗ Default endpoint configuration might be incorrect');
    }
    
    if (content.includes('export async function analyzeStance')) {
      console.log('   ✓ analyzeStance function is exported');
    } else {
      console.log('   ✗ analyzeStance function not found');
    }
    
    return true;
  } else {
    console.log('   ✗ Stance analysis utility file not found');
    return false;
  }
}

// Check comment controller integration
function testCommentControllerIntegration() {
  console.log('4. Checking comment controller integration...');
  
  const controllerPath = path.join(__dirname, 'Server/org/apps/review-service/src/controllers/comment_controller.ts');
  
  if (fs.existsSync(controllerPath)) {
    console.log('   ✓ Comment controller file exists');
    
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    if (content.includes('import { analyzeStance }')) {
      console.log('   ✓ analyzeStance is imported');
    } else {
      console.log('   ✗ analyzeStance import not found');
    }
    
    if (content.includes('analyzeStance({')) {
      console.log('   ✓ analyzeStance is called in createComment');
    } else {
      console.log('   ✗ analyzeStance call not found in createComment');
    }
    
    if (content.includes('stance: stanceResult.result.stance')) {
      console.log('   ✓ Stance data is being saved to database');
    } else {
      console.log('   ✗ Stance data saving code not found');
    }
    
    return true;
  } else {
    console.log('   ✗ Comment controller file not found');
    return false;
  }
}

// Main test function
async function runTests() {
  const serviceReachable = await testServiceReachability();
  const gatewayWorking = await testAPIGatewayRouting();
  const configOk = testStanceAnalysisConfig();
  const integrationOk = testCommentControllerIntegration();
  
  console.log('\n=== Test Summary ===');
  console.log(`Stance Service Reachable: ${serviceReachable ? '✓' : '✗'}`);
  console.log(`API Gateway Routing: ${gatewayWorking ? '✓' : '✗'}`);
  console.log(`Configuration: ${configOk ? '✓' : '✗'}`);
  console.log(`Integration: ${integrationOk ? '✓' : '✗'}`);
  
  if (serviceReachable && gatewayWorking && configOk && integrationOk) {
    console.log('\n🎉 All tests passed! The issue might be:');
    console.log('   - Backend server not running');
    console.log('   - Database connection issues');
    console.log('   - Async timing issues in comment creation');
    console.log('\nTry creating a comment through the API and check server logs.');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
  }
}

runTests();