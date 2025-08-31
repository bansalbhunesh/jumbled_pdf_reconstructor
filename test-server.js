const http = require('http');

console.log('🧪 Testing PDF Reconstructor Server...');

// Test if server is running
const testServer = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/jobs',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running! Status: ${res.statusCode}`);
    console.log(`📡 Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response body:`, data);
      console.log('🎉 Server test completed successfully!');
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Server test failed: ${err.message}`);
    console.log('💡 Make sure the server is running on port 3001');
    console.log('🚀 Start the server with: npm run api:start');
  });

  req.end();
};

// Wait a bit for server to start if it's starting
setTimeout(testServer, 2000);

console.log('⏳ Waiting 2 seconds for server to start...');
console.log('💡 If you see an error, make sure to start the server first:');
console.log('   1. npm run api:build');
console.log('   2. npm run api:start');
