import { spawn } from 'child_process';
import path from 'path';

const rootDir = process.cwd();

console.log('🚀 Starting QRFY Link Hub (Backend + Frontend)...\n');

const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true
});

const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  backendProcess.kill();
  frontendProcess.kill();
  process.exit();
});
