import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getHtmlEntries(dir = __dirname, entryMap = {}) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'scratch' || file === 'public' || file === '.cursor') continue;
    const fullPath = resolve(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getHtmlEntries(fullPath, entryMap);
    } else if (file.endsWith('.html')) {
      const relPath = fullPath.substring(__dirname.length).replace(/^[\\/]/, '').replace(/\\/g, '/');
      const entryKey = relPath.replace(/\.html$/, '').replace(/[\\/]/g, '_');
      entryMap[entryKey] = fullPath;
    }
  }
  return entryMap;
}

export default defineConfig({
  publicDir: 'public',
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  build: {
    rollupOptions: {
      input: getHtmlEntries()
    }
  }
});

