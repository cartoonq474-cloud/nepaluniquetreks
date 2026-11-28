import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const ARCHIVE_ROOT = path.join(REPO_ROOT, 'site-media-archive');
const IMAGES_ROOT = path.join(ARCHIVE_ROOT, 'images');
const MANIFEST_PATH = path.join(ARCHIVE_ROOT, 'manifest.json');
const CSV_PATH = path.join(ARCHIVE_ROOT, 'manifest.csv');

function isValidImageBinary(buf, ext) {
  if (!buf || buf.length < 12) return false;
  const head = buf.subarray(0, 512).toString('utf8').trimStart().toLowerCase();
  if (head.startsWith('<!doctype') || head.startsWith('<html')) return false;
  if (ext === 'jpg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === 'png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (ext === 'webp') return buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
  if (ext === 'gif') return buf.subarray(0, 4).toString('ascii') === 'GIF8';
  if (ext === 'svg') return head.includes('<svg');
  if (ext === 'ico') return buf[0] === 0x00 && buf[1] === 0x00 && (buf[2] === 0x01 || buf[2] === 0x02);
  if (ext === 'bmp') return buf[0] === 0x42 && buf[1] === 0x4d;
  return true;
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) throw new Error('Missing manifest.json');
  if (!fs.existsSync(CSV_PATH)) throw new Error('Missing manifest.csv');

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const errors = [];
  const seenHashes = new Set();
  const seenPaths = new Set();

  for (const entry of manifest.files) {
    const absPath = path.join(ARCHIVE_ROOT, entry.relativePath);
    if (!fs.existsSync(absPath)) {
      errors.push(`Missing file: ${entry.relativePath}`);
      continue;
    }
    if (seenPaths.has(entry.relativePath)) {
      errors.push(`Duplicate path: ${entry.relativePath}`);
    }
    seenPaths.add(entry.relativePath);

    if (seenHashes.has(entry.sha256)) {
      errors.push(`Duplicate SHA-256 hash stored: ${entry.relativePath}`);
    }
    seenHashes.add(entry.sha256);

    if (/[A-Z\s()]/.test(entry.filename)) {
      errors.push(`Unnormalized filename characters in: ${entry.filename}`);
    }

    const buf = fs.readFileSync(absPath);
    if (buf.length !== entry.bytes || buf.length === 0) {
      errors.push(`Byte mismatch on ${entry.relativePath}: expected ${entry.bytes}, got ${buf.length}`);
    }
    const actualSha = crypto.createHash('sha256').update(buf).digest('hex');
    if (actualSha !== entry.sha256) {
      errors.push(`SHA-256 mismatch on ${entry.relativePath}`);
    }
    if (!isValidImageBinary(buf, entry.ext)) {
      errors.push(`Invalid magic header for .${entry.ext} on ${entry.relativePath}`);
    }
  }

  // Ensure zero orphan files exist on disk under images/
  const diskFiles = [];
  (function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else diskFiles.push(path.relative(ARCHIVE_ROOT, full).replace(/\\/g, '/'));
    }
  })(IMAGES_ROOT);

  for (const f of diskFiles) {
    if (!seenPaths.has(f)) errors.push(`Orphan disk file not in manifest: ${f}`);
  }

  if (errors.length) {
    console.error('ARCHIVE VERIFICATION FAILED:', errors.slice(0, 30));
    process.exit(1);
  }

  console.log(`VERIFIED ${manifest.files.length} organized image files across ${Object.keys(manifest.summary.folderCounts).length} categories with 0 errors.`);
  console.log(`Total disk size: ${(manifest.summary.totalBytesSaved / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Folder breakdown:`, manifest.summary.folderCounts);
}

main();
