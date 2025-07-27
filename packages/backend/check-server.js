// Check which server is running
const axios = require('axios');

async function checkServer() {
  try {
    console.log('Checking server at http://localhost:5000...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Server response:', response.data);
  } catch (error) {
    console.log('❌ Server not responding:', error.message);

    // Try the simple server
    try {
      console.log('Trying simple server...');
      const simpleResponse = await axios.get('http://localhost:5000/');
      console.log('✅ Simple server response:', simpleResponse.data);
    } catch (simpleError) {
      console.log('❌ Simple server not responding:', simpleError.message);
    }
  }
}

checkServer();