import crypto from 'crypto';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const ORIGIN = 'https://www.nepaluniquetreks.com';

const CRAWL_PATH = path.join(REPO_ROOT, 'content', 'media-archive-crawl.json');
const TRIP_MANIFEST_PATH = path.join(REPO_ROOT, 'content', 'trip-manifest.json');
const ARCHIVE_ROOT = path.join(REPO_ROOT, 'site-media-archive');
const IMAGES_ROOT = path.join(ARCHIVE_ROOT, 'images');

const SUBFOLDERS = [
  'brand-and-ui',
  'associations',
  'hero-and-banners',
  'treks/everest',
  'treks/annapurna',
  'treks/langtang-and-ganesh',
  'treks/manaslu',
  'treks/mustang',
  'treks/dolpo-and-remote',
  'treks/peak-climbing',
  'treks/kathmandu-and-foothills',
  'tours',
  'destinations-and-regions',
  'blog-and-travel-info',
  'team-and-about',
  'general-gallery'
];

function slugify(str = '') {
  return String(str || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function detectImageFormat(buf, contentType = '', urlPath = '') {
  if (!buf || buf.length < 12) return null;

  const headText = buf.subarray(0, 512).toString('utf8').trimStart();
  const lowerHead = headText.toLowerCase();
  if (lowerHead.startsWith('<!doctype') || lowerHead.startsWith('<html')) {
    return null;
  }

  // Binary magic headers
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  if (buf.subarray(0, 4).toString('ascii') === 'GIF8') {
    return { ext: 'gif', mime: 'image/gif' };
  }
  if (buf[0] === 0x00 && buf[1] === 0x00 && (buf[2] === 0x01 || buf[2] === 0x02) && buf[3] === 0x00) {
    return { ext: 'ico', mime: 'image/x-icon' };
  }
  if (buf.subarray(4, 12).toString('ascii').includes('ftypavif')) {
    return { ext: 'avif', mime: 'image/avif' };
  }
  if (buf[0] === 0x42 && buf[1] === 0x4d) {
    return { ext: 'bmp', mime: 'image/bmp' };
  }
  if (lowerHead.includes('<svg')) {
    // Skip SVG font definition files (e.g. slick.svg)
    if (lowerHead.includes('<font ') && !lowerHead.includes('<path') && !lowerHead.includes('<circle')) {
      return null;
    }
    return { ext: 'svg', mime: 'image/svg+xml' };
  }
  if (contentType.includes('image/')) {
    const ext = path.extname(urlPath).replace('.', '').toLowerCase() || 'bin';
    if (['jpg', 'jpeg', 'jfif'].includes(ext)) return { ext: 'jpg', mime: 'image/jpeg' };
    return { ext, mime: contentType.split(';')[0].trim() };
  }
  return null;
}

function getDimensions(buf, ext) {
  try {
    if (ext === 'png' && buf.length >= 24) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (ext === 'gif' && buf.length >= 10) {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    if (ext === 'jpg') {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
        }
        if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          i += 2;
          continue;
        }
        const len = buf.readUInt16BE(i + 2);
        if (len < 2) break;
        i += 2 + len;
      }
    }
    if (ext === 'webp' && buf.length >= 30) {
      const chunk = buf.subarray(12, 16).toString('ascii');
      if (chunk === 'VP8X') {
        const w = 1 + buf.readUIntLE(24, 3);
        const h = 1 + buf.readUIntLE(27, 3);
        return { width: w, height: h };
      }
      if (chunk === 'VP8 ' && buf.length >= 30) {
        return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      }
      if (chunk === 'VP8L' && buf.length >= 25) {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
    }
    if (ext === 'svg') {
      const text = buf.subarray(0, 2048).toString('utf8');
      const vb = text.match(/viewBox\s*=\s*["'][\d.\s-]+?\s+[\d.\s-]+?\s+([\d.]+)\s+([\d.]+)/i);
      if (vb) return { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])) };
    }
  } catch {}
  return { width: null, height: null };
}

async function fetchBinaryWithRetry(url, retries = 3) {
  let lastErr = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(25000),
        headers: {
          'User-Agent': 'NepalUniqueTreks-MediaArchiver/1.0',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*'
        }
      });
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const ctype = (res.headers.get('content-type') || '').toLowerCase();
      const buf = Buffer.from(await res.arrayBuffer());
      return { buf, contentType: ctype, finalUrl: res.url || url };
    } catch (err) {
      lastErr = err;
      if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) throw err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 400 * attempt));
      }
    }
  }
  throw lastErr;
}

function buildOriginalCandidates(rawUrl) {
  const candidates = [];
  const u = new URL(rawUrl);
  const p = u.pathname;
  if (p.startsWith('/public/thumb/') || p.startsWith('/thumb/')) {
    const rest = p.replace(/^\/(?:public\/)?thumb\//, '');
    candidates.push(`${ORIGIN}/public/uploads/${rest}`);
    candidates.push(`${ORIGIN}/public/images/${rest}`);
  } else if (p.startsWith('/uploads/')) {
    const rest = p.replace(/^\/uploads\//, '');
    candidates.push(`${ORIGIN}/public/uploads/${rest}`);
  }
  candidates.push(rawUrl);
  return [...new Set(candidates)];
}

function isCrypticOrGenericStem(stem = '') {
  if (!stem) return true;
  if (/^[0-9a-f]{16,}$/i.test(stem)) return true;
  if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(stem)) return true;
  if (/^att-[a-z0-9]{10,}$/i.test(stem)) return true;
  if (/^[0-9-]{1,10}$/.test(stem)) return true;
  if (/^(?:img|dscn?|dsc|whatsapp|gptempdownload|untitled|photo|image|picture|scan|dddd|screenshot)(?:-[a-z0-9]+)*$/i.test(stem)) return true;
  if (/^(?:\d{6,}|img|dscn?|dsc)(?:-[a-z0-9]+)*$/i.test(stem)) return true;
  if (/\d{7,}/.test(stem)) return true;
  return false;
}

function cleanRawFilenameStem(urlStr) {
  const pathname = new URL(urlStr).pathname;
  let base = decodeURIComponent(path.basename(pathname));
  base = base.replace(/\.(?:jpe?g|png|webp|gif|svg|avif|jfif|ico|bmp)$/i, '');
  base = base.replace(/\(\s*1366\s*x\s*768[^)]*\)/gi, '');
  base = base.replace(/\s*\(\d+\)\s*/g, ' ');
  base = base.replace(/^\d{9,14}[_-]/, '');
  base = base.replace(/-\d{3,4}x\d{3,4}(?:-\d{6,14})?$/i, '');
  base = base.replace(/_15032030$/i, '');
  let s = slugify(base)
    .replace(/\bgoverment\b/g, 'government')
    .replace(/\bvaley\b/g, 'valley')
    .replace(/\bvittof\b/g, 'vitof')
    .replace(/\badvisore\b/g, 'advisor')
    .replace(/\bmanasulu\b/g, 'manaslu');
  // Clean camera prefixes or trailing timestamp/hash fragments attached to meaningful words
  s = s.replace(/-\d{8,}$/, '').replace(/^[0-9]{2}(?=[a-z]{5,})/, '');
  return s;
}

function buildTripClassifier() {
  const manifest = JSON.parse(fs.readFileSync(TRIP_MANIFEST_PATH, 'utf8'));
  const map = new Map();
  for (const pkg of manifest.packages) {
    map.set(pkg.sourceSlug.toLowerCase(), pkg);
  }
  return function classifyTripSlug(slug) {
    const pkg = map.get(slug.toLowerCase());
    const cat = (pkg?.sourceCategory || '').toLowerCase();
    const reg = (pkg?.regionLabel || '').toLowerCase();
    const tType = (pkg?.templateType || '').toLowerCase();

    if (
      tType === 'tour' ||
      cat.includes('tour') ||
      cat.includes('tibet') ||
      /bhutan|lhasa|safari|helicopter|heli-tour|pilgrimage|honeymoon|luxury-holiday|village-tour|jeep-tour|vesak|christmas/i.test(slug)
    ) {
      return 'tours';
    }
    if (
      cat.includes('peak') ||
      reg.includes('peak climbing') ||
      /peak|expedition|cholatse/i.test(slug)
    ) {
      return 'treks/peak-climbing';
    }
    if (cat.includes('everest') || reg.includes('everest') || /everest|gokyo|ama-dablam|jiri|mani-rimdu/i.test(slug)) {
      return 'treks/everest';
    }
    if (cat.includes('annapurna') || reg.includes('annapurna') || /annapurna|mardi-himal|ghorepani|poon-hill|nar-phu|thorong|jomsom|tilicho|ghandruk/i.test(slug)) {
      return 'treks/annapurna';
    }
    if (cat.includes('langtang') || reg.includes('langtang') || /langtang|ganesh|ruby-valley|tamang|helambu|gosaikunda|fikuri/i.test(slug)) {
      return 'treks/langtang-and-ganesh';
    }
    if (cat.includes('manaslu') || reg.includes('manaslu') || /manaslu|tsum-valley/i.test(slug)) {
      return 'treks/manaslu';
    }
    if (cat.includes('mustang') || reg.includes('mustang') || /mustang/i.test(slug)) {
      return 'treks/mustang';
    }
    if (/chisapani|nagarkot|namobuddha|sivapuri|timal/i.test(slug)) {
      return 'treks/kathmandu-and-foothills';
    }
    if (/dolpo|kanchenjunga|makalu|rara|rolwaling|gorilla|panch-pokhari/i.test(slug) || cat.includes('off the beaten')) {
      return 'treks/dolpo-and-remote';
    }
    return 'treks/dolpo-and-remote';
  };
}

function pickPrimaryCategoryAndName(imageRecord, cleanStem, ext, classifyTripSlug) {
  const urlLower = decodeURIComponent(imageRecord.resolvedUrl).toLowerCase();
  const refs = imageRecord.references || [];

  let best = { priority: -1, folder: 'general-gallery', contextSlug: '', altText: '', role: 'content' };

  for (const r of refs) {
    const pagePath = new URL(r.pageUrl).pathname.toLowerCase();
    let priority = 10;
    let folder = 'general-gallery';
    let contextSlug = slugify(pagePath.split('/').filter(Boolean).pop() || 'site');

    // Global UI / Brand / Badges / Team & Legal checked cleanly with exact rules
    if (
      r.role === 'favicon' ||
      r.role === 'ui-icon' ||
      (urlLower.includes('/public/images/') && !/(back|welback)\.jpg$/i.test(urlLower)) ||
      /nepal-unique-treks-logo|ajax-loader|crvline|customer\.svg|plan\.svg|skill\.svg|price-tag|sustain\.svg|f-star\.svg|favicon/i.test(urlLower)
    ) {
      priority = 100;
      folder = 'brand-and-ui';
      contextSlug = 'brand';
    } else if (
      /ntb-logo|taan-logo|taan-1|nepal-gover?ment|keep\.svg|nma\.png|vitof-logo|vittof|gurung[\s_-]tourism[\s_-]entrepreneurs|tripadvisor-logo/i.test(urlLower) ||
      (r.role === 'association' && !/gurung[\s_-]heritage|dil[\s_-]gurung|arjun[\s_-]gurung|menuka|muna[\s_-]gurung|partap/i.test(urlLower))
    ) {
      priority = 95;
      folder = 'associations';
      contextSlug = 'partner';
    } else if (
      r.pageType === 'company' ||
      /^\/(?:page\/)?(?:our-team|about-us|message-from-founders|why-nepal-unique-treks|legal-documents|contact-us)/.test(pagePath) ||
      /dil[\s_-]gurung|arjun[\s_-]gurung|menuka|muna[\s_-]gurung|prakash[\s_-]ghale|budhi|partap|samyam|aman[\s_-]ghimire|kumod/i.test(urlLower)
    ) {
      priority = 90;
      folder = 'team-and-about';
      if (pagePath.includes('/our-team/')) {
        contextSlug = `team-${slugify(pagePath.split('/our-team/')[1].replace(/-\d+$/, ''))}`;
      } else if (/dil[\s_-]gurung|arjun[\s_-]gurung|menuka|muna[\s_-]gurung|prakash[\s_-]ghale|budhi|partap|samyam|aman[\s_-]ghimire|kumod/i.test(urlLower)) {
        contextSlug = 'team';
      } else if (pagePath.includes('legal')) {
        contextSlug = 'legal-document';
      } else if (pagePath === '/our-team') {
        contextSlug = 'team';
      } else {
        contextSlug = slugify(r.pageTitle || contextSlug) || 'company';
      }
    } else if (pagePath.startsWith('/trip/')) {
      const tripSlug = pagePath.replace(/^\/trip\//, '').split('/')[0];
      priority = r.role === 'thumb-card' ? 62 : 84;
      folder = classifyTripSlug(tripSlug);
      contextSlug = tripSlug;
    } else if (/^\/(?:hotel-in-nepal|tourist-vehicle)/.test(pagePath)) {
      priority = r.role === 'thumb-card' ? 58 : 78;
      folder = 'tours';
      contextSlug = slugify(pagePath.split('/').filter(Boolean).pop() || 'tour-service');
    } else if ((r.pageType === 'home' && (r.role === 'hero' || r.role === 'content')) || /(?:back|welback|annapurna-range)\.jpg$/i.test(urlLower)) {
      priority = r.role === 'thumb-card' ? 50 : 76;
      folder = 'hero-and-banners';
      contextSlug = 'hero';
    } else if (['region', 'destination', 'activity'].includes(r.pageType) || /^\/(?:regions?|destinations?|activities)/.test(pagePath)) {
      priority = r.role === 'thumb-card' ? 55 : 72;
      folder = 'destinations-and-regions';
      contextSlug = slugify(pagePath.split('/').filter(Boolean).pop() || 'region');
    } else if (
      r.pageType === 'blog' ||
      r.pageType === 'travel-info' ||
      /^\/page\/(?:how-to-book|terms-and-condition|cookies-policy|privacy-policy)/.test(pagePath)
    ) {
      priority = r.role === 'thumb-card' ? 52 : 66;
      folder = 'blog-and-travel-info';
      contextSlug = slugify(pagePath.split('/').filter(Boolean).pop() || 'guide');
    } else if (r.pageType === 'testimonials') {
      priority = 40;
      folder = 'general-gallery';
      contextSlug = 'testimonial';
    } else if (pagePath.startsWith('/make-enquiry')) {
      priority = 5;
      folder = 'general-gallery';
      contextSlug = 'gallery';
    }

    // Prefer rich descriptive alt text on the winning priority tier
    if (
      priority > best.priority ||
      (priority === best.priority && (r.alt || '').length > (best.altText || '').length)
    ) {
      best = { priority, folder, contextSlug, altText: r.alt || '', role: r.role };
    }
  }

  // Construct clean, meaningful base filename
  const altSlug = slugify(best.altText).split('-').slice(0, 6).join('-');
  const stemGood = cleanStem && !isCrypticOrGenericStem(cleanStem) ? cleanStem : '';

  let baseName = '';
  const mergePrefixAndStem = (prefix, stem) => {
    if (!stem) return prefix;
    if (!prefix) return stem;
    if (stem === prefix || stem.includes(prefix)) return stem;
    if (prefix.includes(stem)) return prefix;
    const pHead = prefix.split('-')[0];
    if (pHead && stem.startsWith(`${pHead}-`)) return stem;
    return `${prefix}-${stem}`;
  };

  if (best.folder === 'brand-and-ui' || best.folder === 'associations') {
    baseName = stemGood || (best.contextSlug + (altSlug ? `-${altSlug}` : '-asset'));
  } else if (best.folder === 'team-and-about') {
    baseName = mergePrefixAndStem(best.contextSlug, stemGood || (!isCrypticOrGenericStem(altSlug) ? altSlug : ''));
  } else if (best.folder.startsWith('treks/') || best.folder === 'tours') {
    const tripSlug = best.contextSlug;
    const isMap = best.role === 'map' || (stemGood && stemGood.includes('map'));
    if (isMap) {
      baseName = `${tripSlug}-route-map`;
    } else if (stemGood) {
      baseName = mergePrefixAndStem(tripSlug, stemGood);
    } else if (altSlug && !isCrypticOrGenericStem(altSlug)) {
      baseName = mergePrefixAndStem(tripSlug, altSlug);
    } else {
      baseName = tripSlug;
    }
  } else {
    if (stemGood) {
      baseName = mergePrefixAndStem(best.contextSlug, stemGood);
    } else if (altSlug && !isCrypticOrGenericStem(altSlug)) {
      baseName = mergePrefixAndStem(best.contextSlug, altSlug);
    } else {
      baseName = best.contextSlug || 'gallery-image';
    }
  }

  // Cap filename length cleanly at 90 chars before extension
  baseName = slugify(baseName).slice(0, 90).replace(/-+$/g, '') || 'image';

  return { folder: best.folder, baseName, ext, primaryRole: best.role };
}

function escapeCsv(val) {
  const s = val == null ? '' : String(val);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function main() {
  if (!fs.existsSync(CRAWL_PATH)) {
    throw new Error(`Missing crawl inventory at ${CRAWL_PATH}. Run crawl-image-urls.mjs first.`);
  }
  const crawl = JSON.parse(fs.readFileSync(CRAWL_PATH, 'utf8'));
  const classifyTripSlug = buildTripClassifier();
  const isLocalReorg = process.argv.includes('--local');

  let downloaded = [];
  let failed = [];
  let skippedNonImage = [];
  const rawImages = crawl.images || [];

  if (isLocalReorg) {
    const manifestPath = path.join(ARCHIVE_ROOT, 'manifest.json');
    if (!fs.existsSync(manifestPath)) throw new Error('Missing manifest.json for --local mode');
    const prev = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const crawlByUrl = new Map(rawImages.map(x => [x.url, x]));
    const stageDir = path.join(ARCHIVE_ROOT, '.tmp-stage');
    if (fs.existsSync(stageDir)) fs.rmSync(stageDir, { recursive: true, force: true });
    fs.mkdirSync(stageDir, { recursive: true });

    for (const f of prev.files) {
      const srcAbs = path.join(ARCHIVE_ROOT, f.relativePath);
      const stageAbs = path.join(stageDir, f.sha256 + '.' + f.ext);
      if (fs.existsSync(srcAbs)) fs.copyFileSync(srcAbs, stageAbs);
      const refs = [];
      for (const u of f.crawledSourceUrls || []) {
        const hit = crawlByUrl.get(u);
        if (hit && hit.references) refs.push(...hit.references);
      }
      downloaded.push({
        url: f.resolvedSourceUrl,
        resolvedUrl: f.resolvedSourceUrl,
        upgradedFromThumb: f.upgradedFromThumb,
        sourceUrls: f.crawledSourceUrls,
        buf: fs.readFileSync(stageAbs),
        ext: f.ext,
        mime: f.mime,
        sha256: f.sha256,
        bytes: f.bytes,
        dims: { width: f.width, height: f.height },
        references: refs
      });
    }
    failed = prev.failedUrls || [];
    skippedNonImage = prev.skippedNonImage || [];
    console.log(`Re-organizing ${downloaded.length} locally staged image binaries offline...`);
  } else {
    if (rawImages.length === 0) {
      throw new Error('Crawl inventory has 0 images; rerun crawl-image-urls.mjs with network access first.');
    }
    console.log(`Downloading and analyzing ${rawImages.length} crawled image URLs (upgrading /thumb/ -> full-res)...`);

    const CONCURRENCY = 6;
    for (let i = 0; i < rawImages.length; i += CONCURRENCY) {
      const batch = rawImages.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async item => {
          const candidates = buildOriginalCandidates(item.url);
          let chosen = null;
          let lastErr = null;

          for (const candUrl of candidates) {
            try {
              const res = await fetchBinaryWithRetry(candUrl, 2);
              const fmt = detectImageFormat(res.buf, res.contentType, new URL(candUrl).pathname);
              if (!fmt) continue;
              chosen = {
                resolvedUrl: candUrl,
                upgradedFromThumb: item.isThumb && candUrl !== item.url,
                buf: res.buf,
                fmt
              };
              break;
            } catch (err) {
              lastErr = err;
            }
          }

          if (!chosen) {
            if (lastErr) {
              failed.push({ url: item.url, candidatesTried: candidates, error: lastErr.message });
            } else {
              skippedNonImage.push({ url: item.url, reason: 'Invalid image header / HTML or font SVG' });
            }
            return;
          }

          const sha256 = crypto.createHash('sha256').update(chosen.buf).digest('hex');
          downloaded.push({
            ...item,
            resolvedUrl: chosen.resolvedUrl,
            upgradedFromThumb: chosen.upgradedFromThumb,
            buf: chosen.buf,
            ext: chosen.fmt.ext,
            mime: chosen.fmt.mime,
            sha256,
            bytes: chosen.buf.length,
            dims: getDimensions(chosen.buf, chosen.fmt.ext)
          });
        })
      );
      const done = Math.min(i + CONCURRENCY, rawImages.length);
      if (done % 60 === 0 || done === rawImages.length) {
        console.log(`Processed ${done}/${rawImages.length} URLs (valid: ${downloaded.length}, failed: ${failed.length})`);
      }
    }

    if (downloaded.length === 0) {
      throw new Error('Zero images downloaded; check network connectivity.');
    }
  }

  // Clean previous archive images directory to ensure reproducible organized structure
  if (fs.existsSync(IMAGES_ROOT)) {
    fs.rmSync(IMAGES_ROOT, { recursive: true, force: true });
  }
  for (const sub of SUBFOLDERS) {
    fs.mkdirSync(path.join(IMAGES_ROOT, sub), { recursive: true });
  }

  // Deduplicate identical binary hashes while preserving all source references & URL aliases
  const byHash = new Map();
  for (const d of downloaded) {
    let bucket = byHash.get(d.sha256);
    if (!bucket) {
      bucket = {
        sha256: d.sha256,
        buf: d.buf,
        ext: d.ext,
        mime: d.mime,
        bytes: d.bytes,
        dims: d.dims,
        resolvedUrl: d.resolvedUrl,
        sourceUrls: new Set(d.sourceUrls || [d.url]),
        upgradedFromThumb: d.upgradedFromThumb,
        references: [...d.references]
      };
      byHash.set(d.sha256, bucket);
    } else {
      for (const su of (d.sourceUrls || [d.url])) bucket.sourceUrls.add(su);
      if (d.upgradedFromThumb) bucket.upgradedFromThumb = true;
      if (!d.resolvedUrl.includes('/thumb/') && bucket.resolvedUrl.includes('/thumb/')) {
        bucket.resolvedUrl = d.resolvedUrl;
      }
      for (const ref of d.references) {
        const exists = bucket.references.some(
          x => x.pageUrl === ref.pageUrl && x.role === ref.role && x.alt === ref.alt
        );
        if (!exists) bucket.references.push(ref);
      }
    }
  }

  const usedPaths = new Map(); // folder/baseName -> next counter
  const manifestEntries = [];
  const folderCounts = Object.fromEntries(SUBFOLDERS.map(s => [s, 0]));

  // Sort deterministically by resolvedUrl before assigning sequence numbers
  const uniqueItems = [...byHash.values()].sort((a, b) => a.resolvedUrl.localeCompare(b.resolvedUrl));

  for (const item of uniqueItems) {
    const cleanStem = cleanRawFilenameStem(item.resolvedUrl);
    const { folder, baseName, ext, primaryRole } = pickPrimaryCategoryAndName(
      item,
      cleanStem,
      item.ext,
      classifyTripSlug
    );

    const key = `${folder}/${baseName}.${ext}`;
    const count = (usedPaths.get(key) || 0) + 1;
    usedPaths.set(key, count);

    const finalFilename = count === 1 ? `${baseName}.${ext}` : `${baseName}-${String(count).padStart(2, '0')}.${ext}`;
    const relPath = `images/${folder}/${finalFilename}`;
    const absPath = path.join(ARCHIVE_ROOT, relPath);

    fs.writeFileSync(absPath, item.buf);
    folderCounts[folder] = (folderCounts[folder] || 0) + 1;

    manifestEntries.push({
      id: manifestEntries.length + 1,
      relativePath: relPath,
      folder,
      filename: finalFilename,
      ext,
      mime: item.mime,
      bytes: item.bytes,
      width: item.dims.width,
      height: item.dims.height,
      sha256: item.sha256,
      primaryRole,
      resolvedSourceUrl: item.resolvedUrl,
      upgradedFromThumb: item.upgradedFromThumb,
      crawledSourceUrls: [...item.sourceUrls],
      referencedOnCount: item.references.length,
      referencedPages: [...new Set(item.references.map(r => r.pageUrl))].slice(0, 25)
    });
  }

  // Remove staging folder & any empty subfolders before writing manifest
  const stageDir = path.join(ARCHIVE_ROOT, '.tmp-stage');
  if (fs.existsSync(stageDir)) fs.rmSync(stageDir, { recursive: true, force: true });
  for (const [sub, cnt] of Object.entries(folderCounts)) {
    if (cnt === 0) {
      const subDir = path.join(IMAGES_ROOT, sub);
      if (fs.existsSync(subDir)) fs.rmSync(subDir, { recursive: true, force: true });
      delete folderCounts[sub];
    }
  }

  const manifest = {
    sourceOrigin: ORIGIN,
    generatedAt: new Date().toISOString(),
    summary: {
      crawledUniqueRawUrls: rawImages.length,
      downloadedValidResponses: downloaded.length,
      deduplicatedUniqueFilesSaved: manifestEntries.length,
      duplicatesRemovedBySha256: downloaded.length - manifestEntries.length,
      failedUrlsCount: failed.length,
      skippedNonImageCount: skippedNonImage.length,
      totalBytesSaved: manifestEntries.reduce((acc, x) => acc + x.bytes, 0),
      folderCounts
    },
    failedUrls: failed,
    skippedNonImage,
    files: manifestEntries
  };

  fs.writeFileSync(path.join(ARCHIVE_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const csvHeader = [
    'id',
    'relativePath',
    'folder',
    'filename',
    'ext',
    'mime',
    'bytes',
    'width',
    'height',
    'sha256',
    'primaryRole',
    'upgradedFromThumb',
    'resolvedSourceUrl',
    'crawledSourceUrls',
    'referencedOnCount',
    'samplePageUrl'
  ].join(',');
  const csvRows = manifestEntries.map(e =>
    [
      e.id,
      e.relativePath,
      e.folder,
      e.filename,
      e.ext,
      e.mime,
      e.bytes,
      e.width ?? '',
      e.height ?? '',
      e.sha256,
      e.primaryRole,
      e.upgradedFromThumb,
      e.resolvedSourceUrl,
      e.crawledSourceUrls.join(' | '),
      e.referencedOnCount,
      e.referencedPages[0] || ''
    ]
      .map(escapeCsv)
      .join(',')
  );
  fs.writeFileSync(path.join(ARCHIVE_ROOT, 'manifest.csv'), [csvHeader, ...csvRows].join('\n'), 'utf8');

  console.log('\n=== SITE MEDIA ARCHIVE SUMMARY ===');
  console.log(JSON.stringify(manifest.summary, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
