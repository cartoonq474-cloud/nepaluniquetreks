import dns from 'dns';
import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  extractLivePostData,
  loadManifest,
  parseOnlyArg
} from './lib/blog-utils.mjs';

dns.setDefaultResultOrder('ipv4first');

const BASE_URL = 'https://www.nepaluniquetreks.com';

async function fetchWithTimeout(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: {
      'User-Agent': 'NepalUniqueTreks-ContentMigrator/1.0',
      'Connection': 'close'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res;
}

async function ensureAssetSynced(subdir, filename, liveFallbackUrl, localBackupPath = null) {
  if (!filename) return null;
  const decodedName = decodeURIComponent(filename);
  const publicPath = path.join(REPO_ROOT, 'public', subdir, decodedName);
  const rootPath = path.join(REPO_ROOT, subdir, decodedName);

  fs.mkdirSync(path.dirname(publicPath), { recursive: true });
  fs.mkdirSync(path.dirname(rootPath), { recursive: true });

  const hasPublic = fs.existsSync(publicPath);
  const hasRoot = fs.existsSync(rootPath);

  if (hasPublic && !hasRoot) {
    fs.copyFileSync(publicPath, rootPath);
    return { status: 'synced-to-root', file: decodedName };
  }
  if (!hasPublic && hasRoot) {
    fs.copyFileSync(rootPath, publicPath);
    return { status: 'synced-to-public', file: decodedName };
  }
  if (hasPublic && hasRoot) {
    return { status: 'present', file: decodedName };
  }

  const downloadUrl =
    liveFallbackUrl ||
    `${BASE_URL}/public/${subdir}/${encodeURIComponent(decodedName)}`;
  try {
    const res = await fetchWithTimeout(downloadUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(publicPath, buf);
    fs.writeFileSync(rootPath, buf);
    return { status: 'downloaded', file: decodedName, bytes: buf.length };
  } catch (err) {
    if (localBackupPath && fs.existsSync(localBackupPath)) {
      fs.copyFileSync(localBackupPath, publicPath);
      fs.copyFileSync(localBackupPath, rootPath);
      return { status: 'fallback-from-upload', file: decodedName };
    }
    throw err;
  }
}

async function fetchAndSaveSlug(slug, manifestEntry) {
  const sourceUrl = `${BASE_URL}/blog/${slug}`;
  const res = await fetchWithTimeout(sourceUrl);
  const html = await res.text();
  const extracted = extractLivePostData(html);

  let featuredImageFile = '';
  let featuredAssetStatus = null;
  if (extracted.featuredImageUrl) {
    const urlObj = new URL(extracted.featuredImageUrl, BASE_URL);
    featuredImageFile = decodeURIComponent(path.posix.basename(urlObj.pathname));
    featuredAssetStatus = await ensureAssetSynced('uploads', featuredImageFile, extracted.featuredImageUrl);
  }

  let thumbFile = manifestEntry?.thumb || featuredImageFile;
  let thumbAssetStatus = null;
  if (thumbFile) {
    const uploadBackup = featuredImageFile
      ? path.join(REPO_ROOT, 'public', 'uploads', decodeURIComponent(featuredImageFile))
      : null;
    thumbAssetStatus = await ensureAssetSynced('thumb', thumbFile, null, uploadBackup);
  }

  // Handle any inline <img> inside article body HTML (absolute or relative /public/ URLs)
  let bodyHtml = extracted.bodyHtml;
  const inlineImgMatches = [...bodyHtml.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)];
  for (const m of inlineImgMatches) {
    const rawSrc = m[1];
    if (/^data:/i.test(rawSrc)) continue;
    if (rawSrc.includes('nepaluniquetreks.com') || rawSrc.startsWith('/')) {
      const u = new URL(rawSrc, BASE_URL);
      const inlineFile = decodeURIComponent(path.posix.basename(u.pathname));
      const folder = u.pathname.includes('/thumb/') ? 'thumb' : u.pathname.includes('/images/') ? 'images' : 'uploads';
      try {
        await ensureAssetSynced(folder, inlineFile, u.href);
        bodyHtml = bodyHtml.replaceAll(rawSrc, `{{ROOT}}${folder}/${encodeURIComponent(inlineFile)}`);
      } catch (err) {
        console.warn(`[WARN] Dead inline image on live post (${slug}): ${u.href} (${err.message})`);
      }
    }
  }

  const outDir = path.join(REPO_ROOT, 'content', 'blogs');
  fs.mkdirSync(outDir, { recursive: true });

  const meta = {
    slug,
    sourceUrl,
    order: manifestEntry?.order ?? null,
    batch: manifestEntry?.batch ?? null,
    title: extracted.title || manifestEntry?.title || slug,
    seoTitle: extracted.seoTitle || extracted.title || slug,
    metaDescription: extracted.metaDescription || extracted.excerpt,
    category: extracted.category || manifestEntry?.category || 'Travel Information',
    datePublished: extracted.datePublished || manifestEntry?.date || '',
    author: extracted.author || 'Nepal Unique Treks',
    featuredImage: featuredImageFile ? `uploads/${featuredImageFile}` : '',
    featuredImageAlt: extracted.featuredImageAlt || extracted.title,
    thumbImage: thumbFile ? `thumb/${thumbFile}` : (featuredImageFile ? `uploads/${featuredImageFile}` : ''),
    excerpt: extracted.excerpt,
    wordCount: extracted.wordCount,
    sourcePlainText: extracted.sourcePlainText
  };

  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(meta, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, `${slug}.body.html`), bodyHtml + '\n', 'utf8');

  console.log(
    `[OK #${meta.order ?? '?'}] ${slug} | words=${meta.wordCount} | img=${featuredAssetStatus?.status || 'none'} | thumb=${thumbAssetStatus?.status || 'none'}`
  );
}

async function main() {
  const argv = process.argv.slice(2);
  const manifest = loadManifest();
  const bySlug = new Map(manifest.posts.map(p => [p.slug, p]));

  let targets = parseOnlyArg(argv);
  if (!targets && argv.includes('--missing')) {
    targets = manifest.posts
      .map(p => p.slug)
      .filter(s => !fs.existsSync(path.join(REPO_ROOT, 'content', 'blogs', `${s}.json`)));
  }
  if (!targets && argv.includes('--all')) {
    targets = manifest.posts.map(p => p.slug);
  }
  if (!targets) {
    targets = argv.filter(a => !a.startsWith('--'));
  }
  if (!targets || targets.length === 0) {
    console.error('Usage: node scripts/fetch-post.mjs <slug> | --only slug1,slug2 | --batch <1..7> | --all');
    process.exit(1);
  }

  for (const slug of targets) {
    await fetchAndSaveSlug(slug, bySlug.get(slug));
  }
}

main().catch(err => {
  console.error('[FETCH ERROR]', err);
  process.exit(1);
});
