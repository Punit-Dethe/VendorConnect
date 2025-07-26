#!/usr/bin/env node

const {
  execSync
} = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up VendorConnect platform...\n');

// Function to run commands
function runCommand(command, cwd = process.cwd()) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd
    });
    console.log('✅ Success\n');
  } catch (error) {
    console.error(`❌ Error running: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Check if we're in the right directory
if (!fs.existsSync('packages')) {
  console.error('❌ Please run this script from the root directory of the project');
  process.exit(1);
}

console.log('1. Installing root dependencies...');
runCommand('npm install');

console.log('2. Building shared package...');
runCommand('npm run build', 'packages/shared');

console.log('3. Installing backend dependencies...');
runCommand('npm install', 'packages/backend');

console.log('4. Installing frontend dependencies...');
runCommand('npm install', 'packages/frontend');

console.log('5. Creating environment files...');

// Create backend .env file if it doesn't exist
const backendEnvPath = path.join('packages', 'backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
  const envContent = `# Database (Optional - for future use)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vendor_supplier_db
DB_USER=postgres
DB_PASSWORD=password

# Redis (Optional - for future use)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
`;
  fs.writeFileSync(backendEnvPath, envContent);
  console.log('✅ Created backend .env file');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 To start the application:');
console.log('1. Run: npm run dev (starts both frontend and backend)');
console.log('\n📋 Or start services individually:');
console.log('- Backend: cd packages/backend && npm run dev');
console.log('- Frontend: cd packages/frontend && npm run dev');
console.log('\n🌐 Access points:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend: http://localhost:5000');
console.log('\n📝 Note: Database features will be added later. The app will run with mock data for now.');