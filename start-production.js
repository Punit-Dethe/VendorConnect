// Start the production server
const {
  spawn
} = require('child_process');
const path = require('path');

console.log('🚀 Starting VendorConnect Production Server...\n');

// Kill any existing processes on port 5000
const killPort = spawn('npx', ['kill-port', '5000'], {
  stdio: 'inherit'
});

killPort.on('close', (code) => {
  console.log('📡 Port 5000 cleared, starting production server...\n');

  // Start the production server
  const server = spawn('npx', ['ts-node', 'packages/backend/src/production-server.ts'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
});

killPort.on('error', (error) => {
  console.log('⚠️  Could not kill existing processes, continuing...');

  // Start the production server anyway
  const server = spawn('npx', ['ts-node', 'packages/backend/src/production-server.ts'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });
});