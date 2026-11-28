import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const ORIGIN = 'https://www.nepaluniquetreks.com';
const OUTPUT_PATH = path.join(REPO_ROOT, 'content', 'media-archive-crawl.json');

const DISALLOWED_PREFIXES = [
  '/make-booking',
  '/request-booking',
  '/book-now',
  '/reserve-seat',
  '/booking_confirmed'
];

const NON_HTML_EXT_RE = /\.(?:jpe?g|png|webp|gif|svg|avif|jfif|ico|bmp|tiff?|pdf|zip|rar|mp4|webm|mov|mp3|css|js|json|xml|woff2?|ttf|eot|otf)$/i;
const IMAGE_EXT_RE = /\.(?:jpe?g|png|webp|gif|svg|avif|jfif|ico|bmp)(?:$|\?)/i;

function decodeHtmlEntities(str = '') {
  return String(str || '')
    .replace(/&amp;/gi, '&')
    .replace(/&#38;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(str = '') {
  return decodeHtmlEntities(String(str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function normalizePageUrl(rawUrl, baseUrl = ORIGIN) {
  if (!rawUrl) return null;
  const cleaned = decodeHtmlEntities(rawUrl.trim());
  if (!cleaned || /^(mailto:|tel:|javascript:|data:|#)/i.test(cleaned)) return null;
  try {
    const u = new URL(cleaned, baseUrl);
    if (!/^(www\.)?nepaluniquetreks\.com$/i.test(u.hostname)) return null;
    u.protocol = 'https:';
    u.hostname = 'www.nepaluniquetreks.com';
    u.hash = '';
    if (DISALLOWED_PREFIXES.some(prefix => u.pathname.toLowerCase().startsWith(prefix))) {
      return null;
    }
    if (NON_HTML_EXT_RE.test(u.pathname)) return null;
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return null;
  }
}

function normalizeAssetUrl(rawUrl, baseUrl = ORIGIN) {
  if (!rawUrl) return null;
  let cleaned = decodeHtmlEntities(rawUrl.trim()).replace(/^['"]|['"]$/g, '');
  if (!cleaned || /^(data:|blob:|javascript:|about:|mailto:|tel:|#)/i.test(cleaned)) return null;
  if (cleaned.startsWith('//')) cleaned = `https:${cleaned}`;
  try {
    const u = new URL(cleaned, baseUrl);
    if (!/^(www\.)?nepaluniquetreks\.com$/i.test(u.hostname)) return null;
    u.protocol = 'https:';
    u.hostname = 'www.nepaluniquetreks.com';
    u.hash = '';
    if (/\.(?:woff2?|ttf|eot|otf|css|js)(?:$|\?)/i.test(u.pathname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function parseAttr(tag, attrName) {
  const re = new RegExp(`\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const m = tag.match(re);
  return m ? decodeHtmlEntities((m[1] ?? m[2] ?? m[3] ?? '').trim()) : '';
}

function parseSrcsetUrls(srcset = '') {
  return String(srcset || '')
    .split(',')
    .map(part => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractCssUrls(cssText = '', cssBaseUrl) {
  const results = [];
  const cleanCss = String(cssText || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi;
  let m;
  while ((m = re.exec(cleanCss)) !== null) {
    const raw = (m[2] || '').trim();
    if (!raw || raw.startsWith('data:')) continue;
    const normalized = normalizeAssetUrl(raw, cssBaseUrl);
    if (normalized) results.push(normalized);
  }
  return results;
}

async function fetchTextWithRetry(url, retries = 3) {
  let lastErr = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20000),
        headers: {
          'User-Agent': 'NepalUniqueTreks-MediaArchiver/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml,text/css,*/*'
        }
      });
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const ctype = (res.headers.get('content-type') || '').toLowerCase();
      const text = await res.text();
      return { text, contentType: ctype, finalUrl: res.url || url };
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

async function seedFromSitemaps() {
  const seeds = new Set([ORIGIN]);
  const visitedSitemaps = new Set();
  const sitemapQueue = [`${ORIGIN}/sitemap.xml`];

  while (sitemapQueue.length) {
    const smUrl = sitemapQueue.shift();
    if (visitedSitemaps.has(smUrl)) continue;
    visitedSitemaps.add(smUrl);
    try {
      const { text } = await fetchTextWithRetry(smUrl, 2);
      const locs = [...text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => decodeHtmlEntities(m[1].trim()));
      for (const loc of locs) {
        if (/\.xml(?:$|\?)/i.test(loc)) {
          if (!visitedSitemaps.has(loc)) sitemapQueue.push(loc);
        } else {
          const norm = normalizePageUrl(loc, ORIGIN);
          if (norm) seeds.add(norm);
        }
      }
    } catch (err) {
      console.warn(`WARN sitemap ${smUrl}: ${err.message}`);
    }
  }
  return [...seeds];
}

function classifyPageRoute(pageUrl) {
  const pathname = new URL(pageUrl).pathname;
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/trip/')) return 'trip';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/travel-information')) return 'travel-info';
  if (pathname.startsWith('/region') || pathname.startsWith('/regions')) return 'region';
  if (pathname.startsWith('/destination') || pathname.startsWith('/destinations')) return 'destination';
  if (pathname.startsWith('/activity') || pathname.startsWith('/activities')) return 'activity';
  if (/^\/(?:our-team|about-us|message-from-founders|why-nepal-unique-treks|legal-documents|contact-us)/.test(pathname)) {
    return 'company';
  }
  if (/^\/(?:hotel-in-nepal|tourist-vehicle)/.test(pathname)) return 'tour-service';
  if (pathname.startsWith('/testimonials')) return 'testimonials';
  return 'page';
}

function detectContextRole(rawUrl, tagStr = '', pageType = 'page') {
  const lowerUrl = rawUrl.toLowerCase();
  const lowerTag = tagStr.toLowerCase();
  if (/rel=["'][^"']*icon/i.test(lowerTag) || /favicon/i.test(lowerUrl)) return 'favicon';
  if (/footer|header|navbar|brand/i.test(lowerTag) && /logo/i.test(lowerUrl + lowerTag)) return 'logo';
  if (/ntb|taan|nma|keep|vitof|vittof|gurung.?tourism|goverment|government|associated|partner/i.test(lowerUrl + lowerTag)) return 'association';
  if (/customer\.svg|plan\.svg|skill\.svg|price-tag|sustain\.svg|f-star|crvline/i.test(lowerUrl)) return 'ui-icon';
  if (/og:image|twitter:image/i.test(lowerTag)) return 'og-image';
  if (/map/i.test(lowerUrl + ' ' + parseAttr(tagStr, 'alt'))) return 'map';
  if (/hero|banner|slider|carousel/i.test(lowerUrl + lowerTag)) return 'hero';
  if (pageType === 'company') return 'team-or-company';
  if (lowerUrl.includes('/thumb/')) return 'thumb-card';
  return 'content';
}

function extractPageSignals(html, pageUrl) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const pageTitle = stripTags(h1Match?.[1] || titleMatch?.[1] || '');
  const pageType = classifyPageRoute(pageUrl);

  const discoveredLinks = new Set();
  const stylesheetUrls = new Set();
  const assetRefs = [];

  // Internal anchor links
  const anchorRe = /<a\b[^>]*>/gi;
  let m;
  while ((m = anchorRe.exec(html)) !== null) {
    const tag = m[0];
    const href = parseAttr(tag, 'href');
    if (href && IMAGE_EXT_RE.test(href)) {
      const imgUrl = normalizeAssetUrl(href, pageUrl);
      if (imgUrl) {
        assetRefs.push({
          url: imgUrl,
          alt: parseAttr(tag, 'title') || parseAttr(tag, 'aria-label') || '',
          role: detectContextRole(imgUrl, tag, pageType),
          isThumb: imgUrl.includes('/thumb/')
        });
      }
    } else if (href) {
      const pageNorm = normalizePageUrl(href, pageUrl);
      if (pageNorm) discoveredLinks.add(pageNorm);
    }

    for (const dataAttr of ['data-src', 'data-thumb', 'data-image']) {
      const val = parseAttr(tag, dataAttr);
      if (val && IMAGE_EXT_RE.test(val)) {
        const imgUrl = normalizeAssetUrl(val, pageUrl);
        if (imgUrl) {
          assetRefs.push({
            url: imgUrl,
            alt: parseAttr(tag, 'title') || '',
            role: detectContextRole(imgUrl, tag, pageType),
            isThumb: imgUrl.includes('/thumb/')
          });
        }
      }
    }
  }

  // <img> tags
  const imgRe = /<img\b[^>]*>/gi;
  while ((m = imgRe.exec(html)) !== null) {
    const tag = m[0];
    const alt = parseAttr(tag, 'alt') || parseAttr(tag, 'title') || '';
    const candidates = [
      parseAttr(tag, 'src'),
      parseAttr(tag, 'data-src'),
      parseAttr(tag, 'data-original'),
      parseAttr(tag, 'data-lazy-src'),
      ...parseSrcsetUrls(parseAttr(tag, 'srcset')),
      ...parseSrcsetUrls(parseAttr(tag, 'data-srcset'))
    ].filter(Boolean);

    for (const cand of candidates) {
      const assetUrl = normalizeAssetUrl(cand, pageUrl);
      if (assetUrl) {
        assetRefs.push({
          url: assetUrl,
          alt,
          role: detectContextRole(assetUrl, tag, pageType),
          isThumb: assetUrl.includes('/thumb/')
        });
      }
    }
  }

  // <source> tags
  const sourceRe = /<source\b[^>]*>/gi;
  while ((m = sourceRe.exec(html)) !== null) {
    const tag = m[0];
    const candidates = [
      parseAttr(tag, 'src'),
      parseAttr(tag, 'data-src'),
      ...parseSrcsetUrls(parseAttr(tag, 'srcset')),
      ...parseSrcsetUrls(parseAttr(tag, 'data-srcset'))
    ].filter(Boolean);
    for (const cand of candidates) {
      if (!IMAGE_EXT_RE.test(cand)) continue;
      const assetUrl = normalizeAssetUrl(cand, pageUrl);
      if (assetUrl) {
        assetRefs.push({
          url: assetUrl,
          alt: '',
          role: detectContextRole(assetUrl, tag, pageType),
          isThumb: assetUrl.includes('/thumb/')
        });
      }
    }
  }

  // <video poster>
  const videoRe = /<video\b[^>]*>/gi;
  while ((m = videoRe.exec(html)) !== null) {
    const poster = parseAttr(m[0], 'poster');
    if (poster) {
      const assetUrl = normalizeAssetUrl(poster, pageUrl);
      if (assetUrl) {
        assetRefs.push({ url: assetUrl, alt: '', role: 'hero', isThumb: assetUrl.includes('/thumb/') });
      }
    }
  }

  // <meta> image tags
  const metaRe = /<meta\b[^>]*>/gi;
  while ((m = metaRe.exec(html)) !== null) {
    const tag = m[0];
    const prop = (parseAttr(tag, 'property') || parseAttr(tag, 'name') || '').toLowerCase();
    if (['og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image', 'msapplication-tileimage'].includes(prop)) {
      const content = parseAttr(tag, 'content');
      const assetUrl = normalizeAssetUrl(content, pageUrl);
      if (assetUrl) {
        assetRefs.push({ url: assetUrl, alt: '', role: 'og-image', isThumb: assetUrl.includes('/thumb/') });
      }
    }
  }

  // <link> stylesheets and icons
  const linkRe = /<link\b[^>]*>/gi;
  while ((m = linkRe.exec(html)) !== null) {
    const tag = m[0];
    const rel = (parseAttr(tag, 'rel') || '').toLowerCase();
    const href = parseAttr(tag, 'href');
    if (!href) continue;
    if (rel.includes('stylesheet')) {
      try {
        const cssU = new URL(decodeHtmlEntities(href), pageUrl);
        if (/^(www\.)?nepaluniquetreks\.com$/i.test(cssU.hostname)) {
          cssU.protocol = 'https:';
          cssU.hostname = 'www.nepaluniquetreks.com';
          stylesheetUrls.add(cssU.toString());
        }
      } catch {}
    } else if (rel.includes('icon')) {
      const assetUrl = normalizeAssetUrl(href, pageUrl);
      if (assetUrl) {
        assetRefs.push({ url: assetUrl, alt: '', role: 'favicon', isThumb: false });
      }
    }
  }

  // Inline styles & <style> blocks
  const styleBlockRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleBlockRe.exec(html)) !== null) {
    for (const cssImg of extractCssUrls(m[1], pageUrl)) {
      assetRefs.push({ url: cssImg, alt: '', role: 'css-bg', isThumb: cssImg.includes('/thumb/') });
    }
  }
  const inlineStyleRe = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  while ((m = inlineStyleRe.exec(html)) !== null) {
    const styleVal = m[1] || m[2] || '';
    if (styleVal.includes('url(')) {
      for (const cssImg of extractCssUrls(styleVal, pageUrl)) {
        assetRefs.push({ url: cssImg, alt: '', role: 'css-bg', isThumb: cssImg.includes('/thumb/') });
      }
    }
  }

  return {
    pageTitle,
    pageType,
    discoveredLinks: [...discoveredLinks],
    stylesheetUrls: [...stylesheetUrls],
    assetRefs
  };
}

async function main() {
  console.log('Seeding URLs from sitemap.xml...');
  const seeds = await seedFromSitemaps();
  console.log(`Seeded ${seeds.length} initial page URLs.`);

  const visitedPages = new Map();
  const failedPages = [];
  const queue = [...seeds];
  const seenQueued = new Set(seeds);
  const stylesheetQueue = new Set();
  const imagesByUrl = new Map();

  const MAX_PAGES = 650;
  const CONCURRENCY = 6;

  function recordAssetRef(assetUrl, refInfo) {
    let entry = imagesByUrl.get(assetUrl);
    if (!entry) {
      entry = {
        url: assetUrl,
        isThumb: assetUrl.includes('/thumb/'),
        references: []
      };
      imagesByUrl.set(assetUrl, entry);
    }
    const dup = entry.references.some(
      r => r.pageUrl === refInfo.pageUrl && r.role === refInfo.role && r.alt === refInfo.alt
    );
    if (!dup) entry.references.push(refInfo);
  }

  let processedCount = 0;
  while (queue.length > 0 && processedCount < MAX_PAGES) {
    const batch = queue.splice(0, CONCURRENCY);
    await Promise.all(
      batch.map(async pageUrl => {
        if (visitedPages.has(pageUrl) || processedCount >= MAX_PAGES) return;
        processedCount++;
        try {
          const { text, contentType } = await fetchTextWithRetry(pageUrl, 2);
          if (contentType && !contentType.includes('html') && !contentType.includes('xml')) {
            return;
          }
          const signals = extractPageSignals(text, pageUrl);
          visitedPages.set(pageUrl, {
            pageType: signals.pageType,
            title: signals.pageTitle,
            imageRefCount: signals.assetRefs.length
          });

          for (const nextLink of signals.discoveredLinks) {
            if (!seenQueued.has(nextLink) && seenQueued.size < MAX_PAGES) {
              seenQueued.add(nextLink);
              queue.push(nextLink);
            }
          }
          for (const cssUrl of signals.stylesheetUrls) {
            stylesheetQueue.add(cssUrl);
          }
          for (const ref of signals.assetRefs) {
            recordAssetRef(ref.url, {
              pageUrl,
              pageType: signals.pageType,
              pageTitle: signals.pageTitle,
              alt: ref.alt,
              role: ref.role
            });
          }
        } catch (err) {
          failedPages.push({ pageUrl, error: err.message });
        }
      })
    );
    if (processedCount % 30 === 0 || queue.length === 0) {
      console.log(`Crawled ${visitedPages.size} pages (queued: ${queue.length}, unique image URLs: ${imagesByUrl.size})`);
    }
  }

  // Extract CSS background / UI image references from all discovered local stylesheets
  const visitedStylesheets = [];
  for (const cssUrl of stylesheetQueue) {
    try {
      const { text } = await fetchTextWithRetry(cssUrl, 2);
      const cssImgs = extractCssUrls(text, cssUrl);
      visitedStylesheets.push({ cssUrl, imagesFound: cssImgs.length });
      for (const imgUrl of cssImgs) {
        recordAssetRef(imgUrl, {
          pageUrl: cssUrl,
          pageType: 'stylesheet',
          pageTitle: path.basename(new URL(cssUrl).pathname),
          alt: '',
          role: 'css-bg'
        });
      }
    } catch (err) {
      visitedStylesheets.push({ cssUrl, error: err.message });
    }
  }

  const output = {
    origin: ORIGIN,
    crawledAt: new Date().toISOString(),
    stats: {
      pagesVisited: visitedPages.size,
      failedPages: failedPages.length,
      stylesheetsVisited: visitedStylesheets.length,
      uniqueRawImageUrls: imagesByUrl.size
    },
    pages: Object.fromEntries(visitedPages),
    failedPages,
    stylesheets: visitedStylesheets,
    images: [...imagesByUrl.values()]
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Saved crawl inventory -> ${path.relative(REPO_ROOT, OUTPUT_PATH)}`);
  console.log(JSON.stringify(output.stats, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
