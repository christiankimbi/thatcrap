import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const rootDir = process.cwd();

// Pre-index filesystem paths in lowercase for case-insensitive file serving on Linux
const fileMap = new Map();

function indexDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
    fileMap.set(relPath.toLowerCase(), fullPath);
    if (entry.isDirectory()) {
      indexDirectory(fullPath);
    }
  }
}

try {
  indexDirectory(rootDir);
} catch (err) {
  console.error('Error indexing directory:', err);
}

// Case-insensitive static resolver middleware
app.use((req, res, next) => {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(req.path);
  } catch {
    return next();
  }

  // Strip leading slash
  const cleanPath = decodedPath.replace(/^\/+/, '');
  const lowerPath = cleanPath.toLowerCase();

  // Root path handling
  if (!cleanPath || cleanPath === 'index.html') {
    return res.sendFile(path.join(rootDir, 'index.html'));
  }

  // Exact or case-insensitive match
  if (fileMap.has(lowerPath)) {
    const targetFile = fileMap.get(lowerPath);
    const stat = fs.statSync(targetFile);
    if (stat.isFile()) {
      return res.sendFile(targetFile);
    }
  }

  // Try appending .html (e.g. /about-us -> about-us.html)
  const htmlPath = `${lowerPath}.html`;
  if (fileMap.has(htmlPath)) {
    const targetFile = fileMap.get(htmlPath);
    return res.sendFile(targetFile);
  }

  // Fallback for missing responsive image variants (e.g. name-p-500.ext -> name.ext)
  const responsiveRegex = /^(.*)-p-\d+(\.[a-z0-9]+)$/i;
  const match = lowerPath.match(responsiveRegex);
  if (match) {
    const baseVariant = `${match[1]}${match[2]}`;
    if (fileMap.has(baseVariant)) {
      return res.sendFile(fileMap.get(baseVariant));
    }
  }

  next();
});

// Auth login route
app.get('/auth/login', (req, res) => {
  res.redirect('https://www.madhibha.co.za/auth/login');
});

// Standard static files
app.use(express.static(rootDir, { extensions: ['html'] }));

// 404 fallback handler
app.use((req, res) => {
  const notFoundPage = path.join(rootDir, '404.html');
  if (fs.existsSync(notFoundPage)) {
    res.status(404).sendFile(notFoundPage);
  } else {
    res.status(404).send('Page not found');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
