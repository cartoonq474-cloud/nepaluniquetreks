import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const REPO_ROOT = process.cwd();
const ARCHIVE_ROOT = path.join(REPO_ROOT, 'site-media-archive');
const MANIFEST_PATH = path.join(ARCHIVE_ROOT, 'manifest.json');
const TRIPS_DIR = path.join(REPO_ROOT, 'content', 'trips');
const TRIP_MANIFEST_PATH = path.join(REPO_ROOT, 'content', 'trip-manifest.json');
const REPORT_PATH = path.join(REPO_ROOT, 'site-media-archive', 'integration-report.json');
const FFMPEG_BIN = 'C:\\Users\\ASUS\\.local\\bin\\ffmpeg.exe';

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const tripManifest = JSON.parse(fs.readFileSync(TRIP_MANIFEST_PATH, 'utf8'));
const activeSlugs = new Set(tripManifest.packages.filter(p => !p.deferred).map(p => p.sourceSlug));

const archiveFiles = manifest.files;
const byArchiveRel = new Map(archiveFiles.map(f => [f.relativePath, f]));

function slugifyName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'image';
}

function stableHash(str) {
  return crypto.createHash('md5').update(String(str)).digest().readUInt32BE(0);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeDualCopy(srcTmpOrFile, destRel) {
  const normRel = destRel.replace(/\\/g, '/').replace(/^\/+/, '');
  const p1 = path.join(REPO_ROOT, normRel);
  const p2 = path.join(REPO_ROOT, 'public', normRel);
  ensureDir(path.dirname(p1));
  ensureDir(path.dirname(p2));
  fs.copyFileSync(srcTmpOrFile, p1);
  fs.copyFileSync(srcTmpOrFile, p2);
}

const optimizeQueue = [];
const scheduledTargets = new Set();

function scheduleAsset(srcAbsPath, destRel, opts = {}) {
  const normRel = destRel.replace(/\\/g, '/').replace(/^\/+/, '');
  if (scheduledTargets.has(normRel)) return normRel;
  scheduledTargets.add(normRel);
  optimizeQueue.push({ srcAbsPath, destRel: normRel, ...opts });
  return normRel;
}

async function processQueueItem(item) {
  const { srcAbsPath, destRel, maxWidth = 1400, quality = 4, forceJpg = false } = item;
  if (!fs.existsSync(srcAbsPath)) {
    throw new Error(`Missing source file: ${srcAbsPath}`);
  }
  const srcBytes = fs.statSync(srcAbsPath).size;
  const ext = path.extname(srcAbsPath).toLowerCase();
  const destExt = path.extname(destRel).toLowerCase();

  // Direct verbatim copy for SVG, GIF, or tiny PNG UI badges
  if (ext === '.svg' || ext === '.gif' || (destExt === '.png' && srcBytes < 65000 && !forceJpg)) {
    writeDualCopy(srcAbsPath, destRel);
    const outBytes = fs.statSync(path.join(REPO_ROOT, destRel)).size;
    return { destRel, srcBytes, outBytes, mode: 'copy' };
  }

  const tmpOut = path.join(REPO_ROOT, 'site-media-archive', '.tmp-' + crypto.randomBytes(6).toString('hex') + (forceJpg ? '.jpg' : destExt));
  ensureDir(path.dirname(tmpOut));
  try {
    const scaleExpr = `scale='min(${maxWidth},iw)':-2`;
    const args = ['-y', '-i', srcAbsPath, '-map_metadata', '-1', '-vf', scaleExpr];
    if (destExt === '.webp') {
      args.push('-c:v', 'libwebp', '-quality', '82', '-compression_level', '5');
    } else if (destExt === '.png') {
      args.push('-compression_level', '9');
    } else {
      args.push('-q:v', String(quality));
    }
    args.push(tmpOut);
    await execFileAsync(FFMPEG_BIN, args, { windowsHide: true });

    const optimizedBytes = fs.statSync(tmpOut).size;
    // Never inflate an already tiny optimized same-format image beyond source size unless reformatting PNG->JPG
    if (!forceJpg && ext === destExt && optimizedBytes > srcBytes && srcBytes < 350000) {
      writeDualCopy(srcAbsPath, destRel);
      return { destRel, srcBytes, outBytes: srcBytes, mode: 'kept-smaller-orig' };
    } else {
      writeDualCopy(tmpOut, destRel);
      return { destRel, srcBytes, outBytes: optimizedBytes, mode: 'ffmpeg' };
    }
  } finally {
    if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
  }
}

async function runPool(items, concurrency = 4) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await processQueueItem(items[i]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

// =========================================================================
// 1. Curated Site-Wide Assets: Team, About, Legal, Trust, Banners, Regions, Blog
// =========================================================================
const CURATED_MAPPINGS = [
  // Team portraits (maxWidth 800)
  ['images/team-and-about/team-dil-gurung.jpg', 'images/team/team-dil-gurung.jpg', 800, 4, false],
  ['images/team-and-about/team-arjun-gurung.jpg', 'images/team/team-arjun-gurung.jpg', 800, 4, false],
  ['images/team-and-about/team-menuka-gurung.jpg', 'images/team/team-menuka-gurung.jpg', 800, 4, false],
  ['images/team-and-about/team-muna-gurung.jpg', 'images/team/team-muna-gurung.jpg', 800, 4, false],
  ['images/team-and-about/team-prakash-ghale.jpg', 'images/team/team-prakash-ghale.jpg', 800, 4, false],
  ['images/team-and-about/team-budhi-lama-rumba.jpg', 'images/team/team-buddhi-lama.jpg', 800, 4, false],
  ['images/team-and-about/team-partap.jpg', 'images/team/team-partap-gurung.jpg', 800, 4, false],
  ['images/team-and-about/team-samyam-rumba.jpg', 'images/team/team-samyam-rumba.jpg', 800, 4, false],
  ['images/team-and-about/team-aman-ghimire.jpg', 'images/team/team-aman-ghimire.jpg', 800, 4, false],
  ['images/team-and-about/team-kumod.jpg', 'images/team/team-kumoda-adhikari.jpg', 800, 4, false],

  // About & Legal Certificates (maxWidth 1400, PNG legal doc converted to compressed JPG)
  ['images/team-and-about/about-us.jpg', 'images/about/about-us.jpg', 1400, 4, false],
  ['images/team-and-about/message-from-founders.jpg', 'images/about/message-from-founders.jpg', 1400, 4, false],
  ['images/team-and-about/why-nepal-unique-treks.jpg', 'images/about/why-nepal-unique-treks.jpg', 1400, 4, false],
  ['images/team-and-about/legal-document-company-registered.jpg', 'images/about/legal-company-registration.jpg', 1400, 5, false],
  ['images/team-and-about/legal-document-nepal-unique-treks.png', 'images/about/legal-industry-commerce.jpg', 1400, 5, true],
  ['images/team-and-about/legal-document-nut-document.jpg', 'images/about/legal-tourism-license.jpg', 1400, 5, false],
  ['images/team-and-about/legal-document-nut-doc.jpg', 'images/about/legal-tax-pan.jpg', 1400, 5, false],
  ['images/associations/taan-1.jpg', 'images/about/legal-taan-membership.jpg', 1400, 5, false],
  ['images/associations/vitof.jpg', 'images/about/legal-vitof-membership.jpg', 1400, 5, false],
  ['images/team-and-about/legal-document-trekking-guide-license.jpg', 'images/about/legal-guide-license.jpg', 1400, 5, false],
  ['images/team-and-about/legal-document-award-from-tripadvisor.jpg', 'images/about/legal-tripadvisor-award.jpg', 1400, 5, false],
  ['images/team-and-about/legal-document-appreciation-from-health-post.jpg', 'images/about/legal-community-appreciation.jpg', 1400, 5, false],
  ['images/team-and-about/legal-document-gtean.jpg', 'images/about/legal-gtean-certificate.jpg', 1400, 5, false],

  // Trust & Associations
  ['images/brand-and-ui/tripadvisor-choice-2023.jpg', 'images/trust/tripadvisor-choice-2023.jpg', 400, 4, false],
  ['images/brand-and-ui/tripadvisor-excellence-2023.svg', 'images/trust/tripadvisor-excellence-2023.svg', 400, 4, false],
  ['images/brand-and-ui/tripadvisor-star.svg', 'images/trust/tripadvisor-star.svg', 400, 4, false],
  ['images/brand-and-ui/google-logo.svg', 'images/trust/google-logo.svg', 400, 4, false],
  ['images/brand-and-ui/google-star.svg', 'images/trust/google-star.svg', 400, 4, false],
  ['images/brand-and-ui/facebook-logo.svg', 'images/trust/facebook-logo.svg', 400, 4, false],
  ['images/brand-and-ui/facebook-star.svg', 'images/trust/facebook-star.svg', 400, 4, false],
  ['images/associations/ntb-logo.png', 'images/trust/ntb-logo.png', 400, 4, false],
  ['images/associations/taan-logo.svg', 'images/trust/taan-logo.svg', 400, 4, false],
  ['images/associations/vitof-logo.png', 'images/trust/vitof-logo.png', 400, 4, false],
  ['images/associations/nma.png', 'images/trust/nma.png', 400, 4, false],
  ['images/associations/keep.svg', 'images/trust/keep.svg', 400, 4, false],
  ['images/associations/nepal-government.svg', 'images/trust/nepal-government.svg', 400, 4, false],

  // Banners (maxWidth 1600)
  ['images/hero-and-banners/hero-back.jpg', 'images/banners/hero-back.jpg', 1600, 4, false],
  ['images/hero-and-banners/hero-annapurna-range.jpg', 'images/banners/hero-annapurna-range.jpg', 1600, 4, false],
  ['images/hero-and-banners/hero-everest-tea-house-trek.jpg', 'images/banners/hero-everest-tea-house-trek.jpg', 1600, 4, false],
  ['images/hero-and-banners/hero-dscn5485.jpg', 'images/banners/hero-himalayan-panorama.jpg', 1600, 4, false],
  ['images/blog-and-travel-info/local-trekking-guide-nepal.jpg', 'images/banners/local-trekking-guide.jpg', 1400, 4, false],
  ['images/blog-and-travel-info/best-winter-treks-in-nepal.jpg', 'images/banners/winter-treks-banner.jpg', 1600, 4, false],

  // Regions (maxWidth 1400)
  ['images/destinations-and-regions/everest-region-trek-0.jpg', 'images/regions/everest-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/annapurna-region-trekking.jpg', 'images/regions/annapurna-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/langtang-region-treks.jpg', 'images/regions/langtang-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/manaslu-trek-73.jpg', 'images/regions/manaslu-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/mustang-region-trek-upper-mustang-trek-1.jpg', 'images/regions/mustang-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/off-the-beaten-trek-in-nepal.jpg', 'images/regions/off-the-beaten-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/short-easy-trekking-routes-in-nepal.jpg', 'images/regions/short-easy-treks.jpg', 1400, 4, false],
  ['images/destinations-and-regions/peak-climbing-in-nepal-everest-expedition-2025-spring-session-1366-x-900-px-1366-x-1000-px.jpg', 'images/regions/peak-climbing-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/expeditions-in-nepal-everest-expedition-2025-spring-session-1.jpg', 'images/regions/expeditions-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/tour-in-nepal-tours-in-nepal.jpg', 'images/regions/nepal-tours-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/day-tours-in-nepal.jpg', 'images/regions/day-tours-region.jpg', 1400, 4, false],
  ['images/destinations-and-regions/tibet.jpg', 'images/regions/tibet.jpg', 1200, 4, false],
  ['images/destinations-and-regions/bhutan.jpg', 'images/regions/bhutan.jpg', 1200, 4, false],
  ['images/destinations-and-regions/nepali.jpg', 'images/regions/nepali-culture.jpg', 1400, 4, false],
  ['images/destinations-and-regions/trekking-in-nepal.jpg', 'images/regions/trekking-in-nepal.jpg', 1400, 4, false],

  // Full-res blog journal covers & homepage visual variety (maxWidth 1200)
  ['images/blog-and-travel-info/best-time-for-everest-base-camp-trek.jpg', 'images/blog-live/best-time-everest-base-camp.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/best-time-to-do-manaslu-circuit-trek.jpg', 'images/blog-live/best-time-manaslu-circuit.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/everest-base-camp-trek-altitude-1.webp', 'images/blog-live/everest-altitude-guide.webp', 1200, 4, false],
  ['images/blog-and-travel-info/best-time-to-do-manaslu-circuit-trek-larke-pass-trek.jpg', 'images/blog-live/larke-pass-journal.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/annapurna-base-camp-trek-altitude-himalayan-view-on-the-way.webp', 'images/blog-live/annapurna-altitude-trail.webp', 1200, 4, false],
  ['images/blog-and-travel-info/best-treks-in-nepal-for-beginners-ghorepani-poonhill-trekking.jpg', 'images/blog-live/poon-hill-sunrise-guide.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/nepal-trekking-session.jpg', 'images/blog-live/nepal-trekking-seasons-hd.jpg', 1400, 4, false],
  ['images/blog-and-travel-info/best-selling-treks-package-in-nepal.jpg', 'images/blog-live/himalayan-trail-community.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/lumbini-nepal-buddhist-spiritual-journey-from-vietnam-tour.jpg', 'images/blog-live/lumbini-peace-pagoda.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/best-trekking-agency-in-nepal.jpg', 'images/blog-live/team-briefing-kathmandu.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/nepali-tradisnael-food.jpg', 'images/blog-live/dal-bhat-teahouse-meal.jpg', 1200, 4, false],
  ['images/blog-and-travel-info/a-complete-guide-for-everest-base-camp-trek.jpg', 'images/blog-live/khumbu-trail-porters.jpg', 1200, 4, false],
];

for (const [archRel, destRel, maxW, q, forceJpg] of CURATED_MAPPINGS) {
  const srcAbs = path.join(ARCHIVE_ROOT, archRel);
  scheduleAsset(srcAbs, destRel, { maxWidth: maxW, quality: q, forceJpg });
}

// =========================================================================
// 2. Index Archive Package Photos & Route Maps by /trip/<slug> & Folder Pool
// =========================================================================
const tripToArchiveFiles = new Map();
const routeMapsByKey = new Map();
const folderPhotoPools = new Map();

function isUsablePackagePhoto(f) {
  if (!f.folder.startsWith('treks/') && f.folder !== 'tours') return false;
  if (/route-map/i.test(f.filename) || /map/i.test(f.filename) && f.height > f.width * 1.2) return false;
  if ((f.width || 0) < 550) return false;
  return true;
}

for (const f of archiveFiles) {
  const isMap = /route-map/i.test(f.filename) || (/map/i.test((f.resolvedSourceUrl || '').split('/').pop()) && f.height > f.width);
  if (isMap && (f.folder.startsWith('treks/') || f.folder === 'tours')) {
    const baseKey = slugifyName(f.filename.replace(/-route-map/i, ''));
    routeMapsByKey.set(baseKey, f);
  }
  if (isUsablePackagePhoto(f)) {
    if (!folderPhotoPools.has(f.folder)) folderPhotoPools.set(f.folder, []);
    folderPhotoPools.get(f.folder).push(f);
  }
  for (const pageUrl of f.referencedPages || []) {
    const m = pageUrl.match(/\/trip\/([^/?#]+)/i);
    if (!m) continue;
    const slug = m[1].toLowerCase();
    if (!tripToArchiveFiles.has(slug)) tripToArchiveFiles.set(slug, []);
    tripToArchiveFiles.get(slug).push(f);
  }
}

function getPoolFolderForTrip(entry, data) {
  if (entry.templateType === 'tour') return 'tours';
  const s = `${entry.sourceSlug} ${entry.regionLabel} ${data.sourceCategory || ''}`.toLowerCase();
  if (/peak|climb|island-peak|mera-peak|lobuche|pisang|chulu|cholatse|naya-kang|paldor|mardi-himal-peak|expedition|himlung|ama-dablam/.test(s)) return 'treks/peak-climbing';
  if (/everest|gokyo|renjo|cho-la|jiri|pikey|namche|mani-rimdu/.test(s)) return 'treks/everest';
  if (/annapurna|ghorepani|poon|mardi|nar-phu|tilicho|thorong|dhaulagiri|mohare|khopra|royal|sikles|panchase/.test(s)) return 'treks/annapurna';
  if (/langtang|tamang|helambu|gosaikunda|ganesh|ruby-valley|fikuri|singla/.test(s)) return 'treks/langtang-and-ganesh';
  if (/manaslu|tsum/.test(s)) return 'treks/manaslu';
  if (/mustang|tiji|damodar|muktinath/.test(s)) return 'treks/mustang';
  return 'treks/dolpo-and-remote';
}

function findBestArchiveMap(slug, matchedArchiveFiles) {
  // 1. Exact route-map referenced on the trip page
  const onPageMaps = matchedArchiveFiles.filter(f => /route-map/i.test(f.filename));
  if (onPageMaps.length) return onPageMaps[0];

  // 2. Exact slug key or common slug equivalence
  if (routeMapsByKey.has(slug)) return routeMapsByKey.get(slug);
  const aliases = [
    slug.replace(/-package$/, ''),
    slug.replace(/-with-/, '-trek-with-'),
    slug.replace(/-trekking$/, '-trek'),
    slug.replace(/-climb$/, '-climbing'),
    slug.replace('gokyo-chola-pass-trek-via-ebc', 'gokyo-cho-la-pass-trek-via-ebc'),
    slug.replace('annapurna-base-camp-trek-package', 'annapurna-base-camp-trek'),
    slug.replace('everest-base-camp-trek-by-road', 'everest-base-camp-trek'),
    slug.replace('everest-base-camp-short-trek', 'everest-mini-trek'),
  ];
  for (const a of aliases) {
    if (routeMapsByKey.has(a)) return routeMapsByKey.get(a);
  }
  return null;
}

const messyNameRe = /GPTempDownload|dddd|\b000\b|Untitled|WhatsApp|EVEREST%20EXPEDITION.*px/i;

function resolveLocalPath(rel) {
  const decoded = decodeURIComponent(String(rel || '').replace(/^\/+/, ''));
  for (const root of [path.join(REPO_ROOT, 'public'), REPO_ROOT]) {
    const p = path.join(root, decoded);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

let tripsModified = 0;
let mapsSet = 0;
const tripStats = [];

for (const entry of tripManifest.packages.filter(p => !p.deferred)) {
  const slug = entry.sourceSlug;
  const jsonPath = path.join(TRIPS_DIR, `${slug}.json`);
  const trip = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const poolFolder = getPoolFolderForTrip(entry, trip);
  const onPage = tripToArchiveFiles.get(slug.toLowerCase()) || [];

  // Map image promotion / matching
  const bestArchiveMap = findBestArchiveMap(slug, onPage);
  if (bestArchiveMap) {
    const mapDest = `images/packages/maps/${slug}-route-map.jpg`;
    scheduleAsset(path.join(ARCHIVE_ROOT, bestArchiveMap.relativePath), mapDest, { maxWidth: 1600, quality: 4 });
    trip.mapImage = mapDest;
    mapsSet++;
  } else if (trip.mapImage) {
    const localMap = resolveLocalPath(trip.mapImage);
    if (localMap) {
      const mapDest = `images/packages/maps/${slug}-route-map.jpg`;
      scheduleAsset(localMap, mapDest, { maxWidth: 1600, quality: 4 });
      trip.mapImage = mapDest;
      mapsSet++;
    }
  }

  // Build clean diverse galleryImages (prefer landscape package photos from archive first)
  const bucketPrefix = entry.templateType === 'tour' ? 'tours' : poolFolder;
  const archivePhotos = onPage
    .filter(f => isUsablePackagePhoto(f))
    .sort((a, b) => {
      const aExact = a.filename.startsWith(slug) ? 1 : 0;
      const bExact = b.filename.startsWith(slug) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      const aLand = a.width >= a.height ? 1 : 0;
      const bLand = b.width >= b.height ? 1 : 0;
      if (aLand !== bLand) return bLand - aLand;
      return (b.width || 0) - (a.width || 0);
    });

  const newGallery = [];
  const usedHashes = new Set();

  function addArchivePhoto(f, seq) {
    if (usedHashes.has(f.sha256)) return;
    usedHashes.add(f.sha256);
    const cleanBase = slugifyName(f.filename.replace(/-\d+$/, ''));
    const suffix = seq === 0 ? '' : `-${String(seq + 1).padStart(2, '0')}`;
    const targetName = cleanBase.includes(slug.slice(0, 12)) ? slugifyName(f.filename) : `${slug}-${cleanBase}${suffix}`;
    const ext = f.ext === 'webp' ? 'webp' : 'jpg';
    const destRel = `images/packages/${bucketPrefix}/${targetName}.${ext}`;
    scheduleAsset(path.join(ARCHIVE_ROOT, f.relativePath), destRel, { maxWidth: 1400, quality: 4 });
    if (!newGallery.includes(destRel)) newGallery.push(destRel);
  }

  for (let i = 0; i < archivePhotos.length && newGallery.length < 6; i++) {
    addArchivePhoto(archivePhotos[i], i);
  }

  // Keep clean existing curated images (images/treks/* specific or non-messy local files) if needed to reach 5
  const existing = trip.galleryImages || [];
  for (const rel of existing) {
    if (newGallery.length >= 6) break;
    if (messyNameRe.test(rel)) continue;
    // Skip generic cross-region trek fallback on tours, or other-trek generic fallback unless matched
    if (entry.templateType === 'tour' && rel.startsWith('images/treks/')) continue;
    if (rel.startsWith('images/treks/')) {
      if (!newGallery.includes(rel) && resolveLocalPath(rel)) {
        newGallery.push(rel);
      }
      continue;
    }
    const localSrc = resolveLocalPath(rel);
    if (localSrc && !messyNameRe.test(rel)) {
      const destRel = `images/packages/${bucketPrefix}/${slug}-trail-${newGallery.length + 1}.jpg`;
      scheduleAsset(localSrc, destRel, { maxWidth: 1400, quality: 4 });
      if (!newGallery.includes(destRel)) newGallery.push(destRel);
    }
  }

  // Backfill up to 5 with deterministic non-repetitive landscape picks from the same archive folder pool
  if (newGallery.length < 5) {
    const pool = (folderPhotoPools.get(poolFolder) || []).filter(f => f.width >= f.height && f.width >= 800);
    if (pool.length) {
      const offset = stableHash(slug) % pool.length;
      for (let step = 0; step < pool.length && newGallery.length < 5; step++) {
        const candidate = pool[(offset + step * 7) % pool.length];
        if (!usedHashes.has(candidate.sha256)) {
          usedHashes.add(candidate.sha256);
          const cleanName = slugifyName(candidate.filename);
          const ext = candidate.ext === 'webp' ? 'webp' : 'jpg';
          const destRel = `images/packages/${bucketPrefix}/${cleanName}.${ext}`;
          scheduleAsset(path.join(ARCHIVE_ROOT, candidate.relativePath), destRel, { maxWidth: 1400, quality: 4 });
          if (!newGallery.includes(destRel)) newGallery.push(destRel);
        }
      }
    }
  }

  if (newGallery.length >= 1) {
    trip.galleryImages = newGallery.slice(0, 6);
    fs.writeFileSync(jsonPath, JSON.stringify(trip, null, 2), 'utf8');
    tripsModified++;
  }
  tripStats.push({ slug, galleryCount: trip.galleryImages.length, mapImage: trip.mapImage || null });
}

// Execute FFmpeg / copy pool
console.log(`Scheduled ${optimizeQueue.length} unique optimized site assets across ${tripsModified} packages (${mapsSet} route maps wired). Running ffmpeg pool...`);
const results = await runPool(optimizeQueue, 4);

const totalSrcBytes = results.reduce((s, r) => s + r.srcBytes, 0);
const totalOutBytes = results.reduce((s, r) => s + r.outBytes, 0);
const savingsPct = totalSrcBytes ? (((totalSrcBytes - totalOutBytes) / totalSrcBytes) * 100).toFixed(1) : '0.0';

fs.writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      promotedAssetsCount: results.length,
      tripsUpdated: tripsModified,
      routeMapsWired: mapsSet,
      totalSourceMB: Number((totalSrcBytes / (1024 * 1024)).toFixed(2)),
      totalOptimizedMB: Number((totalOutBytes / (1024 * 1024)).toFixed(2)),
      savingsPercent: Number(savingsPct),
      samplesLargestSaved: results
        .map(r => ({ ...r, savedKB: Math.round((r.srcBytes - r.outBytes) / 1024) }))
        .sort((a, b) => b.savedKB - a.savedKB)
        .slice(0, 20),
      tripStats
    },
    null,
    2
  ),
  'utf8'
);

console.log(`DONE: ${results.length} assets written to images/ and public/images/ | Source ${(totalSrcBytes/1048576).toFixed(2)} MB -> Optimized ${(totalOutBytes/1048576).toFixed(2)} MB (${savingsPct}% saved).`);
