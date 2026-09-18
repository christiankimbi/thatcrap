import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

console.log('Building static distribution for IIS / static hosting...');

// Clean and recreate dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy top-level HTML files
const rootFiles = [
  'index.html',
  'about-us.html',
  'privacy-notice.html',
  '401.html',
  '404.html'
];

for (const file of rootFiles) {
  const srcPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
    console.log(`✓ Copied ${file}`);
  }
}

// Copy asset directories
const assetDirs = ['css', 'js', 'wp-content'];
for (const dir of assetDirs) {
  const srcDir = path.join(rootDir, dir);
  if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, path.join(distDir, dir));
    console.log(`✓ Copied directory ${dir}/`);
  }
}

console.log('Build completed successfully! Distribution files are ready in /dist');
