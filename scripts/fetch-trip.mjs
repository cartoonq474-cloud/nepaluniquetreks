import dns from 'dns';
import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  extractLiveTripData,
  parseTripFilterArgs
} from './lib/trip-utils.mjs';

dns.setDefaultResultOrder('ipv4first');

const BASE_URL = 'https://www.nepaluniquetreks.com';

async function fetchWithTimeout(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: {
      'User-Agent': 'NepalUniqueTreks-TripMigrator/1.0',
      'Connection': 'close'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res;
}

async function ensureAssetSynced(subdir, filename, liveFallbackUrl) {
  if (!filename) return null;
  const decodedName = decodeURIComponent(filename).replace(/^\/+/, '');
  const publicPath = path.join(REPO_ROOT, 'public', subdir, decodedName);
  const rootPath = path.join(REPO_ROOT, subdir, decodedName);

  fs.mkdirSync(path.dirname(publicPath), { recursive: true });
  fs.mkdirSync(path.dirname(rootPath), { recursive: true });

  const hasPublic = fs.existsSync(publicPath);
  const hasRoot = fs.existsSync(rootPath);

  if (hasPublic && !hasRoot) {
    fs.copyFileSync(publicPath, rootPath);
    return { status: 'synced-to-root', relPath: `${subdir}/${decodedName}` };
  }
  if (!hasPublic && hasRoot) {
    fs.copyFileSync(rootPath, publicPath);
    return { status: 'synced-to-public', relPath: `${subdir}/${decodedName}` };
  }
  if (hasPublic && hasRoot) {
    return { status: 'present', relPath: `${subdir}/${decodedName}` };
  }

  const downloadUrl = liveFallbackUrl || `${BASE_URL}/public/${subdir}/${encodeURIComponent(decodedName)}`;
  console.log(`  [asset] downloading ${downloadUrl}`);
  const res = await fetchWithTimeout(downloadUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(publicPath, buf);
  fs.writeFileSync(rootPath, buf);
  return { status: 'downloaded', relPath: `${subdir}/${decodedName}`, bytes: buf.length };
}

function getRegionalFallbackImages(regionLabel, excludeFiles = new Set(), templateType = 'trek') {
  if (templateType === 'tour') {
    const tourUploads = [
      'uploads/safari-holiday.jpg',
      'uploads/nepal-chitwan-jungle-safari.jpg',
      'uploads/kathmandu-durbar-squire.jpg',
      'uploads/pokhara-himalayan-view-winter.jpg',
      'uploads/kathmandu pokhara lumbini tour.jpg',
      'uploads/nagarkot.JPG',
      'uploads/lumbini-1.jpg',
      'uploads/durbar-squire-in-kathmandu.jpg',
      'uploads/bardiya-national-park-tour.jpg'
    ];
    return tourUploads.filter(rel => !excludeFiles.has(rel) && fs.existsSync(path.join(REPO_ROOT, 'public', rel))).slice(0, 6);
  }
  const regionDirMap = {
    Everest: ['everest-base-camp', 'gokyo-lakes', 'everest-cho-la-pass'],
    'Peak Climbing': ['everest-base-camp', 'gokyo-lakes', 'mera-peak'],
    Annapurna: ['annapurna-base-camp', 'annapurna-circuit', 'ghorepani-poon-hill', 'mardi-himal'],
    Langtang: ['langtang-valley', 'langtang-gosaikunda', 'gosaikunda-lake'],
    Manaslu: ['manaslu-circuit'],
    Mustang: ['upper-mustang'],
    'Off The Beaten Trails': ['pikey-peak', 'manaslu-circuit', 'annapurna-circuit'],
    'Nepal Foothills': ['ghorepani-poon-hill', 'mardi-himal', 'langtang-valley'],
    Nepal: ['annapurna-base-camp', 'ghorepani-poon-hill', 'langtang-valley'],
    'Himalayan Expedition': ['everest-base-camp', 'manaslu-circuit', 'mera-peak']
  };
  const candidates = regionDirMap[regionLabel] || ['annapurna-base-camp', 'everest-base-camp'];
  const collected = [];
  for (const folder of candidates) {
    const dir = path.join(REPO_ROOT, 'images', 'treks', folder);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(jpe?g|webp|png)$/i.test(file) || /banner/i.test(file)) continue;
      const rel = `images/treks/${folder}/${file}`;
      if (!excludeFiles.has(rel)) collected.push(rel);
      if (collected.length >= 6) return collected;
    }
  }
  return collected;
}

async function fetchAndSaveTrip(entry) {
  const res = await fetchWithTimeout(entry.sourceUrl);
  const liveHtml = await res.text();
  const data = extractLiveTripData(liveHtml, entry);

  // Sync live gallery photos locally
  const localGallery = [];
  for (const rawUrl of data.galleryUrls) {
    try {
      const urlObj = new URL(rawUrl, BASE_URL);
      const basename = decodeURIComponent(path.posix.basename(urlObj.pathname));
      const subdir = /\/thumb\//i.test(urlObj.pathname) ? 'thumb' : 'uploads';
      const synced = await ensureAssetSynced(subdir, basename, rawUrl);
      if (synced?.relPath && !localGallery.includes(synced.relPath)) {
        localGallery.push(synced.relPath);
      }
    } catch (e) {
      console.warn(`  [warn] gallery asset skip (${rawUrl}): ${e.message}`);
    }
  }

  // Pad collage cleanly up to 5 photos using same-region verified assets if live URL had < 5 photos
  if (localGallery.length < 5) {
    const fallbacks = getRegionalFallbackImages(entry.regionLabel, new Set(localGallery), entry.templateType);
    for (const fb of fallbacks) {
      if (localGallery.length >= 5) break;
      if (!localGallery.includes(fb)) localGallery.push(fb);
    }
  }

  let localMapImage = '';
  if (data.liveMapImageUrl) {
    try {
      const urlObj = new URL(data.liveMapImageUrl, BASE_URL);
      const basename = decodeURIComponent(path.posix.basename(urlObj.pathname));
      const syncedMap = await ensureAssetSynced('uploads', basename, data.liveMapImageUrl);
      if (syncedMap?.relPath) localMapImage = syncedMap.relPath;
    } catch (e) {
      console.warn(`  [warn] map image skip (${data.liveMapImageUrl}): ${e.message}`);
    }
  }

  data.galleryImages = localGallery;
  data.mapImage = localMapImage;
  data.fetchedAt = new Date().toISOString();

  const outPath = path.join(REPO_ROOT, 'content', 'trips', `${entry.sourceSlug}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');

  console.log(
    `OK ${entry.sourceSlug} -> ${entry.targetDir} | days=${data.durationDays} (${data.itinerarySource}) | price=${data.pricing.primaryPriceUsd ?? 'Price on Request'} (${data.pricing.priceSource}) | imgs=${data.galleryImages.length} | words=${data.overviewPlainWordCount}`
  );
}

const targets = parseTripFilterArgs();
if (!targets || !targets.length) {
  console.error('Usage: node scripts/fetch-trip.mjs --only <slug1,slug2> | --batch <N> | --batches <N1,N2> | --all [--skip-existing]');
  process.exit(1);
}

const skipExisting = process.argv.includes('--skip-existing');
let failures = 0;

for (const entry of targets) {
  const outPath = path.join(REPO_ROOT, 'content', 'trips', `${entry.sourceSlug}.json`);
  if (skipExisting && fs.existsSync(outPath)) {
    console.log(`SKIP ${entry.sourceSlug} (JSON exists)`);
    continue;
  }
  try {
    await fetchAndSaveTrip(entry);
  } catch (err) {
    failures++;
    console.error(`ERR ${entry.sourceSlug}: ${err.message}`);
  }
}

if (failures > 0) {
  console.error(`\nFetch finished with ${failures} error(s).`);
  process.exit(1);
}
