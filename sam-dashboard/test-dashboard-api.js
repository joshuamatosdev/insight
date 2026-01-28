/**
 * Test script to diagnose dashboard API issues
 * Run with: node test-dashboard-api.js
 */

const API_BASE = 'http://localhost:8080/';

// Get token from localStorage simulation (you'll need to replace this with actual token)
const TOKEN = 'YOUR_TOKEN_HERE';

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS - Response:`, JSON.stringify(data).substring(0, 200));
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ FAILED - Error:`, errorText.substring(0, 200));
      return { success: false, status: response.status, error: errorText };
    }
  } catch (err) {
    console.log(`   ❌ NETWORK ERROR:`, err.message);
    return { success: false, error: err.message };
  }
}

async function runTests() {
  console.log('========================================');
  console.log('Dashboard API Diagnostic Test');
  console.log('========================================');

  // Test all dashboard endpoints
  const tests = [
    { name: 'Active Contracts', url: `${API_BASE}/contracts/active?page=0&size=100` },
    { name: 'Expiring Contracts', url: `${API_BASE}/contracts/expiring?daysAhead=30` },
    { name: 'Expiring Certifications', url: `${API_BASE}/certifications/expiring?daysAhead=30` },
    { name: 'Expiring Clearances', url: `${API_BASE}/clearances/expiring?daysAhead=90` },
  ];

  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    results.push({ ...test, ...result });
  }

  console.log('\n========================================');
  console.log('Summary:');
  console.log('========================================');

  results.forEach(r => {
    const status = r.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${r.name} (${r.status || 'no response'})`);
  });

  const allSuccess = results.every(r => r.success);

  if (!allSuccess) {
    console.log('\n⚠️  Some endpoints failed. Common issues:');
    console.log('  1. Backend not running (run: ./gradlew bootRun)');
    console.log('  2. Invalid auth token (login to get a valid token)');
    console.log('  3. Insufficient permissions (clearances require ADMIN role)');
    console.log('  4. No data in database (create some test data)');
  } else {
    console.log('\n✅ All endpoints working correctly!');
  }
}

runTests().catch(console.error);
