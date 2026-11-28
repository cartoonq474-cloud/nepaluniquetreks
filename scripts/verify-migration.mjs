import dns from 'dns';
import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  extractLivePostData,
  htmlToNormalizedPlainText,
  loadManifest,
  parseOnlyArg
} from './lib/blog-utils.mjs';

dns.setDefaultResultOrder('ipv4first');

function findFirstWordDiff(expectedStr, actualStr) {
  const a = expectedStr.split(/\s+/);
  const b = actualStr.split(/\s+/);
  const limit = Math.max(a.length, b.length);
  for (let i = 0; i < limit; i++) {
    if (a[i] !== b[i]) {
      return {
        wordIndex: i,
        expected: a.slice(Math.max(0, i - 3), i + 5).join(' '),
        actual: b.slice(Math.max(0, i - 3), i + 5).join(' ')
      };
    }
  }
  return null;
}

async function verifySlug(slug, checkLive) {
  const errors = [];
  const metaPath = path.join(REPO_ROOT, 'content', 'blogs', `${slug}.json`);
  const bodyPath = path.join(REPO_ROOT, 'content', 'blogs', `${slug}.body.html`);
  const htmlPath = path.join(REPO_ROOT, 'blog', slug, 'index.html');

  if (!fs.existsSync(metaPath)) errors.push(`Missing ${metaPath}`);
  if (!fs.existsSync(bodyPath)) errors.push(`Missing ${bodyPath}`);
  if (!fs.existsSync(htmlPath)) errors.push(`Missing ${htmlPath}`);

  if (errors.length > 0) {
    return { slug, ok: false, errors };
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const builtHtml = fs.readFileSync(htmlPath, 'utf8');

  // 1. Check featured & thumb image presence in both public/ and root
  for (const rel of [meta.featuredImage, meta.thumbImage].filter(Boolean)) {
    const decodedRel = decodeURIComponent(rel);
    const pubImg = path.join(REPO_ROOT, 'public', decodedRel);
    const rootImg = path.join(REPO_ROOT, decodedRel);
    if (!fs.existsSync(pubImg)) errors.push(`Missing public asset: public/${decodedRel}`);
    if (!fs.existsSync(rootImg)) errors.push(`Missing root asset: ${decodedRel}`);
  }

  // 2. Extract rendered article prose from built HTML
  const proseMatch = builtHtml.match(/<article class="blog-article-prose" id="article-prose-body">([\s\S]*?)<\/article>/i);
  if (!proseMatch) {
    errors.push('Missing <article class="blog-article-prose"> in built HTML');
  } else {
    const renderedProseHtml = proseMatch[1];
    if (/\btoc-container\b|\bblog-rec-trips\b/i.test(renderedProseHtml)) {
      errors.push('Leftover live widget markup (toc-container or blog-rec-trips) found inside article prose');
    }

    // Verify all inline <img> tags inside article prose resolve locally on disk
    for (const imgMatch of renderedProseHtml.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)) {
      const srcVal = imgMatch[1];
      if (/^https?:\/\//i.test(srcVal)) {
        errors.push(`Unlocalized external image in prose: ${srcVal}`);
      } else {
        const rel = decodeURIComponent(srcVal.replace(/^(\.\.\/)+/, ''));
        if (!fs.existsSync(path.join(REPO_ROOT, 'public', rel))) {
          errors.push(`Missing inline public asset: public/${rel}`);
        }
        if (!fs.existsSync(path.join(REPO_ROOT, rel))) {
          errors.push(`Missing inline root asset: ${rel}`);
        }
      }
    }

    const renderedPlain = htmlToNormalizedPlainText(renderedProseHtml);
    let referencePlain = meta.sourcePlainText;

    if (checkLive) {
      const res = await fetch(meta.sourceUrl, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': 'NepalUniqueTreks-Verifier/1.0', 'Connection': 'close' }
      });
      if (!res.ok) {
        errors.push(`Live verification HTTP ${res.status} for ${meta.sourceUrl}`);
      } else {
        const liveData = extractLivePostData(await res.text());
        referencePlain = liveData.sourcePlainText;
      }
    }

    if (renderedPlain !== referencePlain) {
      const diff = findFirstWordDiff(referencePlain, renderedPlain);
      errors.push(
        `Verbatim text mismatch at word #${diff?.wordIndex}: expected="${diff?.expected}" vs actual="${diff?.actual}"`
      );
    }
  }

  return { slug, ok: errors.length === 0, wordCount: meta.wordCount, errors };
}

async function main() {
  const argv = process.argv.slice(2);
  const checkLive = argv.includes('--live');
  const manifest = loadManifest();

  let targets = parseOnlyArg(argv);
  if (!targets) {
    targets = manifest.posts
      .map(p => p.slug)
      .filter(slug => fs.existsSync(path.join(REPO_ROOT, 'content', 'blogs', `${slug}.json`)));
  }

  if (targets.length === 0) {
    console.error('No migrated posts found to verify.');
    process.exit(1);
  }

  let failCount = 0;
  for (const slug of targets) {
    const res = await verifySlug(slug, checkLive);
    if (res.ok) {
      console.log(`[PASS] ${slug} (words=${res.wordCount}, verbatim=100%, assets=OK)`);
    } else {
      failCount++;
      console.error(`[FAIL] ${slug}:`);
      for (const e of res.errors) console.error(`   - ${e}`);
    }
  }

  if (failCount > 0) {
    process.exit(1);
  }
  console.log(`\nVerified ${targets.length} post(s) with 0 errors.`);
}

main().catch(err => {
  console.error('[VERIFY ERROR]', err);
  process.exit(1);
});
