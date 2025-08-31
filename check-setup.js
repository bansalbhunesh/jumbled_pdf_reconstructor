const fs = require('fs');
const path = require('path');

console.log('🔍 Checking PDF Reconstructor Setup...');
console.log('=====================================');

// Check required directories
const requiredDirs = [
  'uploads',
  'runs',
  'server/uploads',
  'server/runs'
];

console.log('\n📁 Checking required directories...');
let dirsOk = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/ exists`);
    
    // Check if writable
    try {
      const testFile = path.join(dir, '.test-write');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`   ✅ ${dir}/ is writable`);
    } catch (err) {
      console.log(`   ❌ ${dir}/ is not writable: ${err.message}`);
      dirsOk = false;
    }
  } else {
    console.log(`❌ ${dir}/ missing`);
    dirsOk = false;
  }
});

// Check package.json files
console.log('\n📦 Checking package.json files...');
const packageFiles = [
  'package.json',
  'server/package.json',
  'web/package.json'
];

packageFiles.forEach(pkg => {
  if (fs.existsSync(pkg)) {
    console.log(`✅ ${pkg} exists`);
  } else {
    console.log(`❌ ${pkg} missing`);
  }
});

// Check if node_modules exist
console.log('\n🔧 Checking dependencies...');
const nodeModules = [
  'node_modules',
  'server/node_modules',
  'web/node_modules'
];

nodeModules.forEach(nm => {
  if (fs.existsSync(nm)) {
    console.log(`✅ ${nm}/ exists`);
  } else {
    console.log(`❌ ${nm}/ missing - run 'npm install'`);
  }
});

// Check TypeScript config
console.log('\n⚙️ Checking TypeScript configuration...');
const tsConfigs = [
  'tsconfig.json',
  'server/tsconfig.json',
  'web/tsconfig.json'
];

tsConfigs.forEach(ts => {
  if (fs.existsSync(ts)) {
    console.log(`✅ ${ts} exists`);
  } else {
    console.log(`❌ ${ts} missing`);
  }
});

// Check if dist-server exists
console.log('\n🏗️ Checking build output...');
if (fs.existsSync('dist-server')) {
  console.log('✅ dist-server/ exists (server built)');
} else {
  console.log('❌ dist-server/ missing - run "npm run api:build"');
}

// Summary
console.log('\n📊 Setup Summary:');
if (dirsOk) {
  console.log('✅ All required directories are accessible');
} else {
  console.log('❌ Some directories have permission issues');
}

console.log('\n🚀 To start the app:');
console.log('   Windows: Double-click start-local.bat');
console.log('   Mac/Linux: ./start-local.sh');
console.log('\n📖 For manual setup, see QUICKSTART.md');

console.log('\n🎯 Next steps:');
console.log('   1. Install dependencies: npm install && cd web && npm install && cd ..');
console.log('   2. Build server: npm run api:build');
console.log('   3. Start services: npm run api:start (in one terminal)');
console.log('   4. Start web: cd web && npm run dev (in another terminal)');
console.log('   5. Open http://localhost:3000 in your browser');
