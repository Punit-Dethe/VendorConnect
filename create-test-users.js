// Create test users with proper password hashing
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  console.log('🔐 Creating test users with proper password hashing...\n');

  try {
    // Hash the password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('Password:', password);
    console.log('Hashed:', hashedPassword);
    console.log('');

    // Test if the existing hash works
    const existingHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye';
    const isValid = await bcrypt.compare(password, existingHash);

    console.log('Testing existing hash:');
    console.log('Existing hash:', existingHash);
    console.log('Password matches:', isValid);
    console.log('');

    if (isValid) {
      console.log('✅ Existing hash is correct for password123');
    } else {
      console.log('❌ Existing hash does not match password123');
      console.log('New hash to use:', hashedPassword);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUsers();