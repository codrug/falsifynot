#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const backendDir = path.join(__dirname, '../backend');
const venvDir = path.join(backendDir, isWindows ? 'venv\\Scripts\\python.exe' : 'venv/bin/python');

console.log(`🚀 Starting backend server for ${os.platform()}...`);

// Check if venv exists
if (!fs.existsSync(venvDir)) {
  console.error(`❌ Virtual environment not found at ${venvDir}`);
  console.error('   Run this first: npm run setup');
  process.exit(1);
}

// Start the uvicorn server
const serverProcess = spawn(`"${venvDir}"`, [
  '-m', 'uvicorn', 'app.main:app',
  '--reload',
  '--host', '0.0.0.0',
  '--port', '8000'
], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

serverProcess.on('error', (error) => {
  console.error(`❌ Failed to start backend server:`, error.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down backend server...');
  serverProcess.kill();
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down backend server...');
  serverProcess.kill();
});
