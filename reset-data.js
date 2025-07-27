// Reset script to clear in-memory data
const axios = require('axios');

async function resetData() {
  console.log('🔄 Resetting in-memory data...\n');

  try {
    // This will restart the server and clear all in-memory data
    console.log('To reset data, restart the production server:');
    console.log('1. Press Ctrl+C in the server terminal');
    console.log('2. Run: node start-production-js.js');
    console.log('3. This will clear all registered users and start fresh');

    console.log('\n📋 Default users after reset:');
    console.log('Vendor: 9876543210 / password123');
    console.log('Supplier: 9876543211 / password123');
    console.log('\n✨ You can then register new suppliers with any mobile number!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetData();