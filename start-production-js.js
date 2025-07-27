// Start production server without TypeScript compilation
const {
  spawn
} = require('child_process');

console.log('🚀 Starting VendorConnect Production Server (JavaScript mode)...\n');

// Start with JavaScript transpilation
const server = spawn('node', ['-r', 'ts-node/register', 'packages/backend/src/production-server.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TS_NODE_TRANSPILE_ONLY: 'true', // Skip type checking for faster startup
    TS_NODE_COMPILER_OPTIONS: JSON.stringify({
      "allowJs": true,
      "noImplicitAny": false,
      "skipLibCheck": true
    })
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n🔧 Trying alternative method...');

  // Try with npx ts-node
  const altServer = spawn('npx', ['ts-node', '--transpile-only', 'packages/backend/src/production-server.ts'], {
    stdio: 'inherit',
    shell: true
  });

  altServer.on('error', (altError) => {
    console.error('❌ Alternative method also failed:', altError.message);
    console.log('\n💡 Manual steps:');
    console.log('1. cd packages/backend');
    console.log('2. npx ts-node --transpile-only src/production-server.ts');
  });
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