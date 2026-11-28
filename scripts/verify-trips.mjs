import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  parseTripFilterArgs
} from './lib/trip-utils.mjs';

const targets = parseTripFilterArgs();
if (!targets || !targets.length) {
  console.error('Usage: node scripts/verify-trips.mjs --only <slug1,slug2> | --batch <N> | --all');
  process.exit(1);
}

let failures = 0;

for (const entry of targets) {
  const jsonPath = path.join(REPO_ROOT, 'content', 'trips', `${entry.sourceSlug}.json`);
  const htmlPath = path.join(REPO_ROOT, entry.targetHtmlPath);
  const issues = [];

  if (!fs.existsSync(jsonPath)) issues.push('Missing content/trips JSON');
  if (!fs.existsSync(htmlPath)) issues.push('Missing built HTML output');

  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const data = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : null;

    // 1. No unresolved placeholders
    const leftoverTokens = html.match(/\{\{[A-Z0-9_]+\}\}/g);
    if (leftoverTokens) issues.push(`Unresolved tokens: ${[...new Set(leftoverTokens)].join(', ')}`);

    // 2. Price on Request check for US$0 / blank
    if (data?.pricing?.priceOnRequest) {
      if (/>\$0\b|\bUS\$0\b/i.test(html)) issues.push('Leaked $0 price instead of Price on Request');
      if (!html.includes('Price on Request')) issues.push('Missing Price on Request badge');
    } else if (data?.pricing?.primaryPriceUsd) {
      const formatted = `$${data.pricing.primaryPriceUsd.toLocaleString()}`;
      if (!html.includes(formatted)) issues.push(`Expected live price ${formatted} missing in sidebar`);
    }

    // 3. No EBC stub leaks onto non-Everest/non-Makalu/non-Rolwaling packages
    if (!['Everest', 'Peak Climbing', 'Himalayan Expedition', 'Off The Beaten Trails'].includes(entry.regionLabel)) {
      if (/Kala Patthar|Gorak Shep/i.test(html)) {
        issues.push('Detected EBC placeholder text on non-Everest package');
      }
    }

    // 4. Local asset existence check
    const imgSrcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map(m => m[1]);
    for (const src of imgSrcs) {
      if (/^https?:\/\//i.test(src)) continue;
      const decodedRel = decodeURIComponent(src.replace(/^\.\.\/\.\.\//, ''));
      const onDiskPublic = fs.existsSync(path.join(REPO_ROOT, 'public', decodedRel));
      const onDiskRoot = fs.existsSync(path.join(REPO_ROOT, decodedRel));
      if (!onDiskPublic && !onDiskRoot) {
        issues.push(`Missing image on disk: ${decodedRel}`);
      }
    }

    // 5. Required content presence
    if (!data?.overviewPlainWordCount || data.overviewPlainWordCount < 30) {
      issues.push(`Too short overview (${data?.overviewPlainWordCount || 0} words)`);
    }
    if (!data?.itinerary?.length) {
      issues.push('Zero itinerary days rendered');
    }
  }

  if (issues.length) {
    failures++;
    console.error(`FAIL [${entry.sourceSlug}]: ${issues.join(' | ')}`);
  } else {
    console.log(`PASS [${entry.sourceSlug}] -> ${entry.targetHtmlPath}`);
  }
}

if (failures > 0) {
  console.error(`\nVerification FAILED (${failures} package(s) had errors).`);
  process.exit(1);
}

// Record per-batch verification receipts for fully verified batches
const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'content', 'trip-manifest.json'), 'utf8'));
const testedSlugs = new Set(targets.map(t => t.sourceSlug));
const batchesDir = path.join(REPO_ROOT, 'content', 'trip-batches');
fs.mkdirSync(batchesDir, { recursive: true });
const affectedBatches = [...new Set(targets.map(t => t.batch))].sort((a, b) => a - b);
for (const bNum of affectedBatches) {
  const expectedInBatch = manifest.packages.filter(p => !p.deferred && p.batch === bNum);
  if (expectedInBatch.length && expectedInBatch.every(p => testedSlugs.has(p.sourceSlug))) {
    const receipt = {
      batch: bNum,
      verifiedAt: new Date().toISOString(),
      count: expectedInBatch.length,
      packages: expectedInBatch.map(p => ({
        order: p.order,
        sourceSlug: p.sourceSlug,
        targetHtmlPath: p.targetHtmlPath
      }))
    };
    fs.writeFileSync(path.join(batchesDir, `batch-${bNum}.status.json`), JSON.stringify(receipt, null, 2), 'utf8');
  }
}

console.log(`\nALL ${targets.length} packages verified with 0 errors.`);
