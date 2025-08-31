#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PDF Reconstructor - Auto Setup & Run');
console.log('========================================');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Check if Node.js and npm are available
const checkPrerequisites = () => {
  log('cyan', '\n🔍 Checking prerequisites...');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    log('green', `✅ Node.js: ${nodeVersion}`);
    log('green', `✅ npm: ${npmVersion}`);
    return true;
  } catch (error) {
    log('red', '❌ Node.js or npm not found. Please install Node.js first.');
    return false;
  }
};

// Install dependencies
const installDependencies = () => {
  log('cyan', '\n📦 Installing dependencies...');
  
  try {
    log('yellow', 'Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    log('yellow', 'Installing web dependencies...');
    execSync('npm install', { cwd: 'web', stdio: 'inherit' });
    
    log('green', '✅ All dependencies installed successfully!');
    return true;
  } catch (error) {
    log('red', '❌ Failed to install dependencies');
    return false;
  }
};

// Build the server
const buildServer = () => {
  log('cyan', '\n🔨 Building server...');
  
  try {
    execSync('npm run api:build', { stdio: 'inherit' });
    log('green', '✅ Server built successfully!');
    return true;
  } catch (error) {
    log('red', '❌ Failed to build server');
    return false;
  }
};

// Check if ports are available
const checkPorts = () => {
  log('cyan', '\n🔌 Checking port availability...');
  
  const checkPort = (port) => {
    try {
      execSync(`netstat -an | findstr :${port}`, { stdio: 'pipe' });
      return false; // Port is in use
    } catch {
      return true; // Port is available
    }
  };
  
  const port3000 = checkPort(3000);
  const port3001 = checkPort(3001);
  
  if (port3000 && port3001) {
    log('green', '✅ Ports 3000 and 3001 are available');
    return true;
  } else {
    log('red', '❌ Ports 3000 or 3001 are already in use');
    log('yellow', '💡 Please close other applications using these ports');
    return false;
  }
};

// Start the API server
const startApiServer = () => {
  log('cyan', '\n🚀 Starting API server...');
  
  const apiProcess = spawn('npm', ['run', 'api:start'], {
    stdio: 'pipe',
    shell: true
  });
  
  apiProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('running on')) {
      log('green', '✅ API server started successfully!');
    }
    process.stdout.write(output);
  });
  
  apiProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  return apiProcess;
};

// Start the web frontend
const startWebFrontend = () => {
  log('cyan', '\n🌐 Starting web frontend...');
  
  const webProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    cwd: 'web'
  });
  
  webProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ready')) {
      log('green', '✅ Web frontend started successfully!');
    }
    process.stdout.write(output);
  });
  
  webProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  return webProcess;
};

// Main execution
const main = async () => {
  try {
    // Check prerequisites
    if (!checkPrerequisites()) {
      process.exit(1);
    }
    
    // Check ports
    if (!checkPorts()) {
      process.exit(1);
    }
    
    // Install dependencies
    if (!installDependencies()) {
      process.exit(1);
    }
    
    // Build server
    if (!buildServer()) {
      process.exit(1);
    }
    
    // Wait a moment for build to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start API server
    const apiProcess = startApiServer();
    
    // Wait for API server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Start web frontend
    const webProcess = startWebFrontend();
    
    // Wait for web frontend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Success message
    log('green', '\n🎉 PDF Reconstructor is now running!');
    log('cyan', '\n📱 Open your browser and go to:');
    log('bright', '   🌐 http://localhost:3000');
    log('cyan', '\n🔌 API server is running on:');
    log('bright', '   🚀 http://localhost:3001');
    log('cyan', '\n📁 Upload a PDF to test the system!');
    
    // Handle process termination
    const cleanup = () => {
      log('yellow', '\n🛑 Shutting down services...');
      apiProcess.kill();
      webProcess.kill();
      log('green', '✅ Services stopped');
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    // Keep the script running
    log('cyan', '\n💡 Press Ctrl+C to stop all services');
    
  } catch (error) {
    log('red', `❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
};

// Run the main function
main();
