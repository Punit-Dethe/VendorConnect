// Simple production server starter
const {
  exec,
  spawn
} = require('child_process');

console.log('🚀 Starting VendorConnect Production Server...\n');

// Kill any existing processes on port 5000
console.log('📡 Clearing port 5000...');
exec('npx kill-port 5000', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Could not kill existing processes, continuing...');
  } else {
    console.log('✅ Port 5000 cleared');
  }

  console.log('🔄 Starting production server...\n');

  // Start the production server
  const server = spawn('npx', ['ts-node', 'packages/backend/src/production-server.ts'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have ts-node installed: npm install -g ts-node');
    console.log('2. Or try: cd packages/backend && npm install');
    console.log('3. Or use: node -r ts-node/register packages/backend/src/production-server.ts');
  });

  server.on('close', (code) => {
    if (code !== 0) {
      console.log(`❌ Server process exited with code ${code}`);
    }
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
});