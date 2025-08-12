const axios = require('axios');

// Test the server's test endpoint
async function testServerReachability() {
  try {
    console.log('Testing server reachability...');
    const response = await axios.get('http://localhost:5000/api/test');
    console.log('Server response:', response.data);
    return true;
  } catch (error) {
    console.error('Error testing server reachability:', error.message);
    return false;
  }
}

// Test the SecurityScorecard API endpoint
async function testSecurityScorecardAPI() {
  try {
    console.log('Testing SecurityScorecard API endpoint...');
    const response = await axios.get('http://localhost:5000/api/securityscorecards/portfolios', {
      headers: {
        'Authorization': 'Token test_token',
        'Accept': 'application/json'
      }
    });
    
    console.log('API response status:', response.status);
    console.log('API response:', response.data);
    return true;
  } catch (error) {
    console.error('Error testing SecurityScorecard API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run the tests
async function runTests() {
  const serverReachable = await testServerReachability();
  
  if (serverReachable) {
    await testSecurityScorecardAPI();
  } else {
    console.log('Server is not reachable. Make sure the server is running on port 5000.');
  }
}

runTests();
