#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const backendDir = path.join(__dirname, '../backend');
const venvDir = path.join(backendDir, isWindows ? 'venv\\Scripts\\python.exe' : 'venv/bin/python');

console.log(`🔧 Setting up backend dependencies for ${os.platform()}...`);

try {
  // Check if venv exists
  if (!fs.existsSync(venvDir)) {
    console.error(`❌ Virtual environment not found at ${venvDir}`);
    console.error('   Run this first: python3.11 -m venv backend/venv');
    process.exit(1);
  }

  // Install requirements using the venv Python directly
  const pipCommand = `"${venvDir}" -m pip install -r requirements.txt`;
  
  console.log(`📦 Installing Python packages...`);
  console.log(`   Command: ${pipCommand}`);
  
  execSync(pipCommand, {
    cwd: backendDir,
    stdio: 'inherit',
  });

  console.log(`✅ Backend dependencies installed successfully!`);
} catch (error) {
  console.error(`❌ Failed to install backend dependencies`);
  console.error(error.message);
  process.exit(1);
}
