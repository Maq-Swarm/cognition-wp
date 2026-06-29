/**
 * Copies non-TypeScript renderer assets (HTML, CSS, JS, images)
 * from src/renderer/ to dist/renderer/ so Electron can load them.
 *
 * TypeScript only compiles .ts files — HTML, CSS, plain JS, and
 * images are left behind unless we copy them explicitly.
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'renderer');
const destDir = path.join(__dirname, '..', 'dist', 'renderer');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`[copy-assets] Source not found: ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive(srcDir, destDir);
console.log('[copy-assets] Copied src/renderer/ -> dist/renderer/');
