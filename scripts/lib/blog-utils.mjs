import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '..', '..');

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  bull: '•',
  deg: '°',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  times: '×',
  rarr: '→',
  larr: '←',
  frac12: '½',
  frac14: '¼',
  frac34: '¾'
};

export function decodeHtmlEntities(str = '') {
  return String(str).replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (full, entity) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith('#x')) {
      const code = parseInt(lower.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    if (lower.startsWith('#')) {
      const code = parseInt(lower.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, lower)
      ? NAMED_ENTITIES[lower]
      : full;
  });
}

export function escapeHtmlAttr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtmlText(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Normalizes HTML into plain text with consistent block-boundary spacing
 * so verbatim content parity can be verified mathematically.
 */
export function htmlToNormalizedPlainText(html = '') {
  const withBoundaries = String(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|td|th|caption|blockquote|thead|tbody|tfoot)>/gi, ' ')
    .replace(/<(li|td|th|tr|p|h[1-6])\b[^>]*>/gi, ' ');
  const stripped = withBoundaries.replace(/<[^>]+>/g, '');
  const decoded = decodeHtmlEntities(stripped);
  return decoded
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function removeBalancedBlock(html, openRegex, tagName) {
  const m = html.match(openRegex);
  if (!m) return html;
  const start = m.index;
  let depth = 0;
  const tokenRe = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi');
  tokenRe.lastIndex = start;
  let tok;
  while ((tok = tokenRe.exec(html)) !== null) {
    if (tok[1] === '/') {
      depth--;
      if (depth === 0) {
        return html.slice(0, start) + html.slice(tok.index + tok[0].length);
      }
    } else {
      depth++;
    }
  }
  return html;
}

export function cleanArticleBodyHtml(rawBodyHtml) {
  let html = String(rawBodyHtml);

  // Clean inline wrapper attributes while leaving all semantic tags and text untouched
  html = html.replace(/<\/?span\b[^>]*>/gi, '');
  html = html.replace(/<([a-z0-9]+)\b([^>]*)>/gi, (full, tag, attrs) => {
    const lowerTag = tag.toLowerCase();
    if (!attrs || !attrs.trim()) return `<${lowerTag}>`;

    let cleanedAttrs = attrs
      .replace(/\s+(?:style|class|id|data-[a-z0-9_-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .trim();

    return cleanedAttrs ? `<${lowerTag} ${cleanedAttrs}>` : `<${lowerTag}>`;
  });

  // Remove purely whitespace/empty paragraphs left behind by WYSIWYG editors
  html = html.replace(/<p>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>/gi, '');
  return html.trim();
}

export function extractLivePostData(liveHtml) {
  const seoTitleMatch = liveHtml.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch =
    liveHtml.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i) ||
    liveHtml.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']\s*\/?>/i);

  const catMatch = liveHtml.match(/<span\s+class=["'][^"']*article-hero__label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  const h1Match = liveHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const metaBlockMatch = liveHtml.match(/<div\s+class=["']article-meta["'][^>]*>([\s\S]*?)<\/div>/i);

  let datePublished = '';
  let author = 'Nepal Unique Treks';
  if (metaBlockMatch) {
    const spans = [...metaBlockMatch[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)].map(m =>
      htmlToNormalizedPlainText(m[1])
    );
    if (spans[0]) datePublished = spans[0];
    if (spans[1]) author = spans[1];
  }

  const artImgMatch = liveHtml.match(/<div\s+class=["']article-image["'][^>]*>[\s\S]*?<img\b([^>]*)>/i);
  let featuredImageUrl = '';
  let featuredImageAlt = '';
  if (artImgMatch) {
    const srcM = artImgMatch[1].match(/src=["']([^"']+)["']/i);
    const altM = artImgMatch[1].match(/alt=["']([^"']*)["']/i);
    featuredImageUrl = srcM ? decodeHtmlEntities(srcM[1]) : '';
    featuredImageAlt = altM ? decodeHtmlEntities(altM[1]) : '';
  }

  const startMarkerRegex = /<div\s+class=["'][^"']*article-body\s+singlepost[^"']*["'][^>]*>/i;
  const startMatch = liveHtml.match(startMarkerRegex);
  if (!startMatch) {
    throw new Error('Could not find <div class="article-body singlepost"> in live HTML');
  }

  const startIdx = startMatch.index + startMatch[0].length;
  const artEndIdx = liveHtml.indexOf('</article>', startIdx);
  if (artEndIdx === -1) {
    throw new Error('Could not find closing </article> tag');
  }
  const bodyEndIdx = liveHtml.lastIndexOf('</div>', artEndIdx);
  if (bodyEndIdx === -1 || bodyEndIdx <= startIdx) {
    throw new Error('Could not find closing </div> for article-body');
  }

  let rawBody = liveHtml.slice(startIdx, bodyEndIdx);
  rawBody = removeBalancedBlock(rawBody, /<div\b[^>]*class=["'][^"']*\btoc-container\b[^"']*["'][^>]*>/i, 'div');
  rawBody = removeBalancedBlock(rawBody, /<section\b[^>]*aria-label=["']Recommended trips["'][^>]*>/i, 'section');
  rawBody = removeBalancedBlock(rawBody, /<div\b[^>]*class=["'][^"']*\bblog-rec-trips\b[^"']*["'][^>]*>/i, 'div');

  const sourcePlainText = htmlToNormalizedPlainText(rawBody);
  const bodyHtml = cleanArticleBodyHtml(rawBody);
  const cleanedPlainText = htmlToNormalizedPlainText(bodyHtml);

  if (sourcePlainText !== cleanedPlainText) {
    throw new Error('Internal cleaning verification failed: cleaned text diverged from raw live text!');
  }

  const firstParaMatch = bodyHtml.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const firstParaText = firstParaMatch ? htmlToNormalizedPlainText(firstParaMatch[1]) : sourcePlainText;
  const excerpt = firstParaText.length > 180 ? firstParaText.slice(0, 177).replace(/\s+\S*$/, '') + '...' : firstParaText;

  return {
    title: htmlToNormalizedPlainText(h1Match ? h1Match[1] : ''),
    seoTitle: decodeHtmlEntities(seoTitleMatch ? seoTitleMatch[1] : '').trim(),
    metaDescription: decodeHtmlEntities(descMatch ? descMatch[1] : '').trim(),
    category: htmlToNormalizedPlainText(catMatch ? catMatch[1] : 'Travel Information'),
    datePublished,
    author,
    featuredImageUrl,
    featuredImageAlt: featuredImageAlt || htmlToNormalizedPlainText(h1Match ? h1Match[1] : ''),
    excerpt,
    wordCount: sourcePlainText ? sourcePlainText.split(/\s+/).length : 0,
    sourcePlainText,
    bodyHtml
  };
}

export function slugifyHeading(text, index) {
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56);
  return `sec-${index + 1}-${clean || 'section'}`;
}

export function encodeAssetPath(relativePath) {
  return relativePath
    .split('/')
    .map(seg => (seg === '.' || seg === '..' || seg === '' ? seg : encodeURIComponent(seg)))
    .join('/');
}

export function loadManifest() {
  const manifestPath = path.join(REPO_ROOT, 'content', 'batches', 'manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function parseOnlyArg(argv = process.argv.slice(2)) {
  const onlyIdx = argv.indexOf('--only');
  if (onlyIdx !== -1 && argv[onlyIdx + 1]) {
    return argv[onlyIdx + 1].split(',').map(s => s.trim()).filter(Boolean);
  }
  const batchIdx = argv.indexOf('--batch');
  if (batchIdx !== -1 && argv[batchIdx + 1]) {
    const batchNum = Number(argv[batchIdx + 1]);
    const manifest = loadManifest();
    return manifest.posts.filter(p => p.batch === batchNum).map(p => p.slug);
  }
  return null;
}
