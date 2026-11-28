import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  encodeAssetPath,
  escapeHtmlAttr,
  escapeHtmlText,
  htmlToNormalizedPlainText,
  loadManifest,
  parseOnlyArg,
  slugifyHeading
} from './lib/blog-utils.mjs';

function prepareArticleBodyAndToc(bodyHtml, rootPrefix) {
  const tocItems = [];
  let headingCounter = 0;

  let rendered = bodyHtml.replace(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const plain = htmlToNormalizedPlainText(inner);
    const id = slugifyHeading(plain, headingCounter++);
    tocItems.push({ level: Number(level), id, text: plain });
    const cleanedAttrs = attrs.replace(/\s+id\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '').trim();
    return cleanedAttrs
      ? `<h${level} id="${id}" ${cleanedAttrs}>${inner}</h${level}>`
      : `<h${level} id="${id}">${inner}</h${level}>`;
  });

  // Wrap tables cleanly for horizontal scroll responsiveness on mobile
  rendered = rendered.replace(/<table\b[\s\S]*?<\/table>/gi, match => {
    return `<div class="blog-table-wrap">${match}</div>`;
  });

  rendered = rendered.replaceAll('{{ROOT}}', rootPrefix);
  return { renderedBodyHtml: rendered, tocItems };
}

function buildTocHtml(tocItems) {
  if (tocItems.length < 2) {
    return { inlineToc: '', sidebarToc: '' };
  }

  const inlineLinks = tocItems
    .map(item => {
      const cls = item.level === 3 ? ' class="blog-inline-toc-item-sub"' : '';
      return `          <li${cls}><a href="#${item.id}">${escapeHtmlText(item.text)}</a></li>`;
    })
    .join('\n');

  const inlineToc = `<details class="blog-inline-toc">
              <summary class="blog-inline-toc-summary">
                <span>Table of Contents (${tocItems.length})</span>
                <span>▾</span>
              </summary>
              <ul class="blog-inline-toc-list">
${inlineLinks}
              </ul>
            </details>`;

  const sidebarLinks = tocItems
    .map(item => {
      const cls = item.level === 3 ? ' class="blog-sidebar-toc-sub"' : '';
      return `                <li${cls}><a href="#${item.id}">${escapeHtmlText(item.text)}</a></li>`;
    })
    .join('\n');

  const sidebarToc = `<div class="blog-sidebar-card">
              <h2 class="blog-sidebar-heading">On This Page</h2>
              <ul class="blog-sidebar-toc-list">
${sidebarLinks}
              </ul>
            </div>`;

  return { inlineToc, sidebarToc };
}

function buildPrevNextHtml(slug, manifest, rootPrefix) {
  const idx = manifest.posts.findIndex(p => p.slug === slug);
  if (idx === -1) return '';

  const prev = idx > 0 ? manifest.posts[idx - 1] : null;
  const next = idx < manifest.posts.length - 1 ? manifest.posts[idx + 1] : null;

  const prevCard = prev
    ? `<a href="${rootPrefix}blog/${prev.slug}/" class="blog-prevnext-card">
                <span class="blog-prevnext-label">← Newer Article</span>
                <span class="blog-prevnext-title">${escapeHtmlText(prev.title)}</span>
              </a>`
    : '<div></div>';

  const nextCard = next
    ? `<a href="${rootPrefix}blog/${next.slug}/" class="blog-prevnext-card">
                <span class="blog-prevnext-label">Older Article →</span>
                <span class="blog-prevnext-title">${escapeHtmlText(next.title)}</span>
              </a>`
    : '<div></div>';

  return `<nav class="blog-post-bottom-nav" aria-label="Post navigation">
              ${prevCard}
              ${nextCard}
            </nav>`;
}

function renderSinglePost(slug, postTemplate, manifest) {
  const metaPath = path.join(REPO_ROOT, 'content', 'blogs', `${slug}.json`);
  const bodyPath = path.join(REPO_ROOT, 'content', 'blogs', `${slug}.body.html`);
  if (!fs.existsSync(metaPath) || !fs.existsSync(bodyPath)) {
    throw new Error(`Missing content files for "${slug}". Run scripts/fetch-post.mjs first.`);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const rawBody = fs.readFileSync(bodyPath, 'utf8');
  const rootPrefix = '../../';

  const { renderedBodyHtml, tocItems } = prepareArticleBodyAndToc(rawBody, rootPrefix);
  const { inlineToc, sidebarToc } = buildTocHtml(tocItems);
  const prevNextHtml = buildPrevNextHtml(slug, manifest, rootPrefix);

  const readMins = Math.max(1, Math.round((meta.wordCount || 200) / 220));
  const readTime = `${readMins} MIN READ`;

  const featuredBlock = meta.featuredImage
    ? `<figure class="blog-post-featured-figure">
              <img src="${rootPrefix}${encodeAssetPath(meta.featuredImage)}" alt="${escapeHtmlAttr(meta.featuredImageAlt || meta.title)}" class="blog-post-featured-img">
            </figure>`
    : '';

  const pageTitle = meta.title ? `${meta.title} — Nepal Unique Treks` : 'Blog — Nepal Unique Treks';

  let out = postTemplate
    .replaceAll('{{ROOT}}', rootPrefix)
    .replaceAll('{{PAGE_TITLE}}', escapeHtmlText(pageTitle))
    .replaceAll('{{META_DESCRIPTION}}', escapeHtmlAttr(meta.metaDescription || meta.excerpt || meta.title))
    .replaceAll('{{TITLE}}', escapeHtmlText(meta.title))
    .replaceAll('{{TITLE_ATTR}}', escapeHtmlAttr(meta.title))
    .replaceAll('{{CATEGORY}}', escapeHtmlText(meta.category || 'Travel Information'))
    .replaceAll('{{DATE}}', escapeHtmlText(meta.datePublished || ''))
    .replaceAll('{{AUTHOR}}', escapeHtmlText(meta.author || 'Nepal Unique Treks'))
    .replaceAll('{{READ_TIME}}', escapeHtmlText(readTime))
    .replace('{{FEATURED_IMAGE_BLOCK}}', featuredBlock)
    .replace('{{INLINE_TOC_BLOCK}}', inlineToc)
    .replace('{{BODY_HTML}}', renderedBodyHtml)
    .replace('{{PREV_NEXT_BLOCK}}', prevNextHtml)
    .replace('{{SIDEBAR_TOC_BLOCK}}', sidebarToc);

  const outFile = path.join(REPO_ROOT, 'blog', slug, 'index.html');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out, 'utf8');
  console.log(`[BUILT] blog/${slug}/index.html (${tocItems.length} TOC items, ${meta.wordCount} words)`);
}

function renderArchiveVariant(postTemplate, indexTemplate, migratedPosts, catCounts, { rootPrefix, cardPrefix, outRelPath }) {
  const headerMatch = postTemplate.match(/<header class="main-header">[\s\S]*?<div class="mobile-nav-backdrop"[^>]*><\/div>/i);
  const assocMatch = postTemplate.match(/<!-- Official Accreditations[\s\S]*?<\/section>/i);
  const footerMatch = postTemplate.match(/<!-- Master Footer -->[\s\S]*?<\/body>/i);

  if (!headerMatch || !assocMatch || !footerMatch) {
    throw new Error('Could not extract shared chrome blocks from templates/blog-post.html');
  }

  const headerHtml = headerMatch[0].replaceAll('{{ROOT}}', rootPrefix);
  const assocHtml = assocMatch[0].replaceAll('{{ROOT}}', rootPrefix);
  const footerHtml = footerMatch[0].replace(/<\/body>$/i, '').replaceAll('{{ROOT}}', rootPrefix);

  const pillsHtml = [
    `<button class="blog-cat-pill active" data-cat="all"><span>All Articles (${migratedPosts.length})</span></button>`,
    ...[...catCounts.entries()].map(
      ([cat, count]) =>
        `<button class="blog-cat-pill" data-cat="${escapeHtmlAttr(cat)}"><span>${escapeHtmlText(cat)} (${count})</span></button>`
    )
  ].join('\n          ');

  const cardsHtml = migratedPosts
    .map(p => {
      const readMins = Math.max(1, Math.round((p.wordCount || 200) / 220));
      const imgRel = p.thumbImage || p.featuredImage || 'images/hero-himalayas.jpg';
      const searchBlob = `${p.title} ${p.category} ${p.excerpt}`.toLowerCase();
      return `<a href="${cardPrefix}${p.slug}/" class="blog-card" data-category="${escapeHtmlAttr(p.category)}" data-search="${escapeHtmlAttr(searchBlob)}" style="text-decoration:none;">
            <div class="blog-card-media">
              <img src="${rootPrefix}${encodeAssetPath(imgRel)}" alt="${escapeHtmlAttr(p.featuredImageAlt || p.title)}" class="blog-card-img" loading="lazy">
              <span class="blog-card-badge badge-route">${escapeHtmlText(p.category)}</span>
              <span class="blog-card-readtime">${readMins} MIN READ</span>
            </div>
            <div class="blog-card-body">
              <div class="blog-card-meta">
                <span>${escapeHtmlText(p.datePublished)}</span>
                <span>&bull;</span>
                <span>${escapeHtmlText(p.category)}</span>
              </div>
              <h3 class="blog-card-title">${escapeHtmlText(p.title)}</h3>
              <p class="blog-card-excerpt">${escapeHtmlText(p.excerpt)}</p>
              <div class="blog-card-footer">
                <div class="blog-card-author">
                  <div>
                    <div class="blog-card-author-name">${escapeHtmlText(p.author || 'Nepal Unique Treks')}</div>
                    <div class="blog-card-author-role">Nepal Unique Treks</div>
                  </div>
                </div>
                <span class="blog-card-btn"><span>Read Article</span> →</span>
              </div>
            </div>
          </a>`;
    })
    .join('\n          ');

  const indexHtml = indexTemplate
    .replaceAll('{{ROOT}}', rootPrefix)
    .replace('{{SITE_HEADER}}', headerHtml)
    .replace('{{ASSOCIATED_WITH}}', assocHtml)
    .replace('{{SITE_FOOTER}}', footerHtml)
    .replaceAll('{{TOTAL_COUNT}}', String(migratedPosts.length))
    .replace('{{CATEGORY_PILLS}}', pillsHtml)
    .replace('{{ARTICLE_CARDS}}', cardsHtml);

  const outFile = path.join(REPO_ROOT, outRelPath);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, indexHtml, 'utf8');
  console.log(`[BUILT] ${outRelPath} (${migratedPosts.length} cards)`);
}

function buildArchiveIndex(postTemplate, indexTemplate, manifest) {
  const migratedPosts = [];
  for (const entry of manifest.posts) {
    const metaPath = path.join(REPO_ROOT, 'content', 'blogs', `${entry.slug}.json`);
    if (fs.existsSync(metaPath)) {
      migratedPosts.push(JSON.parse(fs.readFileSync(metaPath, 'utf8')));
    }
  }

  const catCounts = new Map();
  for (const p of migratedPosts) {
    const c = p.category || 'Travel Information';
    catCounts.set(c, (catCounts.get(c) || 0) + 1);
  }

  const targets = [
    { rootPrefix: '../', cardPrefix: './', outRelPath: 'blog/index.html' },
    { rootPrefix: '../', cardPrefix: '../blog/', outRelPath: 'blogs/index.html' },
    { rootPrefix: '', cardPrefix: 'blog/', outRelPath: 'blogs.html' }
  ];

  for (const target of targets) {
    renderArchiveVariant(postTemplate, indexTemplate, migratedPosts, catCounts, target);
  }
}

function main() {
  const argv = process.argv.slice(2);
  const manifest = loadManifest();
  const postTemplate = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'blog-post.html'), 'utf8');
  const indexTemplate = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'blog-index.html'), 'utf8');

  const onlySlugs = parseOnlyArg(argv);
  const buildIndexFlag = argv.includes('--index') || !onlySlugs;

  let targets = onlySlugs;
  if (!targets) {
    targets = manifest.posts
      .map(p => p.slug)
      .filter(slug => fs.existsSync(path.join(REPO_ROOT, 'content', 'blogs', `${slug}.json`)));
  }

  for (const slug of targets) {
    renderSinglePost(slug, postTemplate, manifest);
  }

  if (buildIndexFlag) {
    buildArchiveIndex(postTemplate, indexTemplate, manifest);
  }
}

main();
