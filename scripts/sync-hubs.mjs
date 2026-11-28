import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  encodeAssetPath,
  escapeHtmlAttr,
  escapeHtmlText,
  htmlToNormalizedPlainText
} from './lib/trip-utils.mjs';

const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'content', 'trip-manifest.json'), 'utf8'));
const activeEntries = manifest.packages.filter(p => !p.deferred);
const tripsBySlug = new Map();

for (const entry of activeEntries) {
  const tripPath = path.join(REPO_ROOT, 'content', 'trips', `${entry.sourceSlug}.json`);
  const data = JSON.parse(fs.readFileSync(tripPath, 'utf8'));
  tripsBySlug.set(entry.sourceSlug, { entry, data });
}

function findBalancedEnd(html, startIdx, tag = 'div') {
  let depth = 0;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = startIdx;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1] === '/') {
      depth--;
      if (depth === 0) return m.index + m[0].length;
    } else if (!m[0].endsWith('/>')) {
      depth++;
    }
  }
  return -1;
}

function getShortDesc(data, maxLen = 155) {
  const txt = htmlToNormalizedPlainText(data.heroLead || data.metaDescription || data.title);
  if (txt.length <= maxLen) return txt;
  return `${txt.slice(0, maxLen - 3).replace(/\s+\S*$/, '')}...`;
}

function getHeroImg(data, prefix = '../') {
  const rel = data.galleryImages?.[0] || 'images/logo.png';
  return `${prefix}${encodeAssetPath(rel)}`;
}

function formatPriceText(data) {
  const p = data.pricing?.primaryPriceUsd;
  return p ? `$${p.toLocaleString()}` : 'Price on Request';
}

function mapTrekFilterRegion(entry) {
  const slug = entry.sourceSlug;
  const r = entry.regionLabel;
  if (r === 'Everest') return 'everest';
  if (r === 'Annapurna') return 'annapurna';
  if (r === 'Langtang') return 'langtang';
  if (r === 'Manaslu') return 'manaslu';
  if (r === 'Mustang') return 'mustang';
  if (/everest|gokyo|ama-dablam|island-peak|mera-peak|lobuche|cholatse/.test(slug)) return 'everest';
  if (/annapurna|ghorepani|mardi|jomsom|nar-phu|thorong|chulu|pisang|dhaulagiri|gurung/.test(slug)) return 'annapurna';
  if (/langtang|tamang|helambu|ganesh|ruby-valley|fikuri|naya-kang|paldor/.test(slug)) return 'langtang';
  if (/manaslu|tsum-valley/.test(slug)) return 'manaslu';
  if (/mustang/.test(slug)) return 'mustang';
  return 'remote';
}

const REGION_META = {
  everest: { label: 'Everest Khumbu', cls: 'region-everest' },
  annapurna: { label: 'Annapurna', cls: 'region-annapurna' },
  langtang: { label: 'Langtang & Ganesh', cls: 'region-langtang' },
  manaslu: { label: 'Manaslu Circuit', cls: 'region-manaslu' },
  mustang: { label: 'Mustang', cls: 'region-mustang' },
  remote: { label: 'Remote & Foothills', cls: 'region-remote' }
};

function mapDifficultyBucket(data) {
  const g = String(data.facts?.grade || '').toLowerCase();
  if (/strenuous|extreme|alpine|technical|expedition/.test(g) || data.maxElevationM >= 5600) return 'strenuous';
  if (/challenging|hard|demanding/.test(g) || data.maxElevationM >= 4900) return 'challenging';
  if (/easy/.test(g) && !/moderate/.test(g)) return 'easy-moderate';
  if (/moderate/.test(g)) return 'moderate';
  return data.maxElevationM >= 4800 ? 'challenging' : 'moderate';
}

function mapSeasonsAttr(data) {
  const s = String(data.facts?.['best season'] || 'Spring & Autumn').toLowerCase();
  const list = [];
  if (s.includes('spring') || s.includes('all')) list.push('spring');
  if (s.includes('autumn') || s.includes('fall') || s.includes('all')) list.push('autumn');
  if (s.includes('winter') || s.includes('december') || s.includes('all')) list.push('winter');
  if (s.includes('monsoon') || s.includes('summer') || s.includes('all')) list.push('summer');
  return list.length ? list.join(' ') : 'spring autumn';
}

function mapDurationBucket(days) {
  if (days <= 7) return 'short';
  if (days <= 12) return 'medium';
  return 'long';
}

// =========================================================================
// 1. Rebuild nepal-trekking-packages/index.html & nepal-trekking-packages.html
// =========================================================================
const activeTreks = activeEntries
  .filter(e => e.templateType === 'trek')
  .map(e => tripsBySlug.get(e.sourceSlug));

function formatSeasonSummary(raw = '') {
  const s = String(raw || '').toLowerCase();
  if (s.includes('all year') || s.includes('throughout') || s.includes('any')) return 'Year-Round';
  const list = [];
  if (s.includes('spring') || s.includes('mar')) list.push('Spring');
  if (s.includes('autumn') || s.includes('fall') || s.includes('sep')) list.push('Autumn');
  if (s.includes('winter') || s.includes('dec')) list.push('Winter');
  if (s.includes('monsoon') || s.includes('summer') || s.includes('jun')) list.push('Summer');
  if (!list.length) return 'Spring & Autumn';
  if (list.length === 1) return list[0];
  if (list.length === 4) return 'Year-Round';
  if (list.length === 3) {
    if (list.includes('Spring') && list.includes('Autumn') && list.includes('Winter')) return 'Sep – May';
    if (list.includes('Spring') && list.includes('Autumn') && list.includes('Summer')) return 'Mar – Nov';
    return `${list[0]} & ${list[1]}`;
  }
  return `${list[0]} & ${list[1]}`;
}

function renderTrekCatalogCard(item, idx, prefix) {
  const { entry, data } = item;
  const regKey = mapTrekFilterRegion(entry);
  const regInfo = REGION_META[regKey];
  const diff = mapDifficultyBucket(data);
  const diffLabel = diff === 'easy-moderate' ? 'Easy – Moderate' : diff.charAt(0).toUpperCase() + diff.slice(1);
  const diffClass = diff === 'strenuous' ? 'diff-strenuous' : (diff === 'challenging' ? 'diff-challenging' : 'diff-moderate');
  const days = data.durationDays || 1;
  const durBucket = mapDurationBucket(days);
  const altM = data.maxElevationM || 1400;
  const priceUsd = data.pricing?.primaryPriceUsd || 0;
  const seasonsAttr = mapSeasonsAttr(data);
  const seasonText = formatSeasonSummary(data.facts?.['best season']);
  const href = `${prefix}${entry.targetDir}/`;
  const imgUrl = getHeroImg(data, prefix);
  const title = entry.serviceName;
  const desc = getShortDesc(data, 145);
  const tags = [
    data.facts?.activity || entry.regionLabel,
    data.facts?.accommodation ? data.facts.accommodation.split(/[.,]/)[0].trim() : 'Guided Trek',
    `${days} ${days === 1 ? 'Day' : 'Days'}`
  ].filter(Boolean).slice(0, 3);

  return `          <article class="trek-catalog-card"
            data-id="${escapeHtmlAttr(entry.sourceSlug)}"
            data-title="${escapeHtmlAttr(title.toLowerCase())}"
            data-region="${regKey}"
            data-duration="${durBucket}"
            data-days="${days}"
            data-difficulty="${diff}"
            data-price="${priceUsd}"
            data-altitude="${altM}"
            data-seasons="${seasonsAttr}"
            data-popularity="${idx + 1}">
            <div class="card-img-wrapper">
              <a href="${escapeHtmlAttr(href)}" class="card-img-link" tabindex="-1" aria-hidden="true">
                <img src="${escapeHtmlAttr(imgUrl)}" alt="${escapeHtmlAttr(title)} — Nepal Unique Treks" loading="lazy" width="600" height="400">
              </a>
              <span class="card-duration-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${days} ${days === 1 ? 'DAY' : 'DAYS'}
              </span>
              <span class="card-region-tag ${regInfo.cls}">${escapeHtmlText(regInfo.label)}</span>
            </div>
            <div class="card-body-content">
              <div class="card-subregion">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${escapeHtmlText(entry.regionLabel)} Region • Nepal</span>
              </div>
              <h3 class="card-trek-title">
                <a href="${escapeHtmlAttr(href)}">${escapeHtmlText(title)}</a>
              </h3>
              <p class="card-trek-desc">${escapeHtmlText(desc)}</p>
              <div class="card-metrics-strip">
                <div class="metric-item" title="Maximum Elevation">
                  <span class="metric-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22845F" stroke-width="2.2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
                  </span>
                  <span class="metric-val"><strong>${altM.toLocaleString()} m</strong></span>
                </div>
                <div class="metric-item" title="Difficulty Level">
                  <span class="metric-badge ${diffClass}">${escapeHtmlText(diffLabel)}</span>
                </div>
                <div class="metric-item metric-season" title="Best Trekking Season">
                  <span class="metric-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E9A544" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                  </span>
                  <span class="metric-val">${escapeHtmlText(seasonText)}</span>
                </div>
              </div>
              <div class="card-tags-row">
                ${tags.map(t => `<span class="card-tag-pill">${escapeHtmlText(t)}</span>`).join('')}
              </div>
              <div class="card-footer-action">
                <div class="card-price-block">
                  ${priceUsd > 0
                    ? `<span class="price-from-label">Starting from</span><div class="price-figure-wrap"><strong class="price-figure">$${priceUsd.toLocaleString()}</strong><span class="price-unit">/ person</span></div>`
                    : `<span class="price-from-label">Custom Quote</span><div class="price-figure-wrap"><strong class="price-figure" style="font-size:1.05rem;">Price on Request</strong></div>`}
                </div>
                <div class="card-btn-group">
                  <a href="${escapeHtmlAttr(href)}" class="btn-card-details">Details ↗</a>
                  <button type="button" class="btn-card-inquire open-inquiry-btn" data-trek-title="${escapeHtmlAttr(title)}" aria-label="Inquire about ${escapeHtmlAttr(title)}">Inquire</button>
                </div>
              </div>
            </div>
          </article>`;
}

const regionCounts = { all: activeTreks.length, everest: 0, annapurna: 0, langtang: 0, manaslu: 0, mustang: 0, remote: 0 };
for (const it of activeTreks) regionCounts[mapTrekFilterRegion(it.entry)]++;

for (const [rel, prefix] of [['nepal-trekking-packages/index.html', '../'], ['nepal-trekking-packages.html', '']]) {
  const full = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, 'utf8');

  const gridMarker = '<div class="packages-catalog-grid" id="treks-container">';
  const start = html.indexOf(gridMarker);
  const end = findBalancedEnd(html, start, 'div');
  const empIdx = html.indexOf('<div class="catalog-empty-state" id="catalog-empty-state">', start);
  if (start === -1 || end === -1 || empIdx === -1) {
    throw new Error(`Could not locate treks-container or catalog-empty-state in ${rel}`);
  }
  const emptyBlock = html.slice(empIdx, end);

  const cardsHtml = activeTreks.map((it, i) => renderTrekCatalogCard(it, i, prefix)).join('\n\n');
  html = html.slice(0, start) + `${gridMarker}\n${cardsHtml}\n\n          <!-- Empty State (Hidden by default, shown if 0 matches) -->\n          ${emptyBlock}` + html.slice(end);

  // Update pill counts
  for (const [key, count] of Object.entries(regionCounts)) {
    const pillRe = new RegExp(`(<button[^>]*data-region=["']${key}["'][^>]*>[\\s\\S]*?<span class=["']pill-count["']>)\\d+(</span>)`, 'i');
    html = html.replace(pillRe, `$1${count}$2`);
  }

  // Update 34 count copy -> 91
  html = html
    .replace(/\b34\+\s*Handcrafted/g, `${activeTreks.length} Handcrafted`)
    .replace(/\ball 34 official Nepal/gi, `all ${activeTreks.length} official Nepal`)
    .replace(/\bfilter 34 Nepal trekking/gi, `filter ${activeTreks.length} Nepal trekking`)
    .replace(/\bExplore 34 official Nepal/gi, `Explore ${activeTreks.length} official Nepal`)
    .replace(/\bfilter 34\+ official Nepal/gi, `filter ${activeTreks.length} official Nepal`)
    .replace(/\bExplore 34 handcrafted/gi, `Explore ${activeTreks.length} handcrafted`)
    .replace(/\bExplore All 34\+ Trek Packages/gi, `Explore All ${activeTreks.length} Trek Packages`)
    .replace(/Search 34\+ treks/gi, `Search ${activeTreks.length} treks`)
    .replace(/id="results-count">34</g, `id="results-count">${activeTreks.length}<`)
    .replace(/of 34 Himalayan Trekking Packages/g, `of ${activeTreks.length} Himalayan Trekking Packages`)
    .replace(/these 34 trekking/g, `these ${activeTreks.length} trekking`)
    .replace('<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>')
    .replace('-webkit-appearance: none;\r\n      appearance: none;', '-webkit-appearance: none !important;\r\n      -moz-appearance: none !important;\r\n      appearance: none !important;')
    .replace('-webkit-appearance: none;\n      appearance: none;', '-webkit-appearance: none !important;\n      -moz-appearance: none !important;\n      appearance: none !important;');

  fs.writeFileSync(full, html, 'utf8');
  console.log(`SYNCED ${rel} (${activeTreks.length} trek cards, counts=${JSON.stringify(regionCounts)})`);
}

// =========================================================================
// 2. Rebuild nepal-tour-packages/index.html & nepal-tour-packages.html
// =========================================================================
const activeTours = activeEntries
  .filter(e => e.templateType === 'tour')
  .map(e => tripsBySlug.get(e.sourceSlug));

function classifyTourCats(item) {
  const { entry, data } = item;
  const s = `${entry.sourceSlug} ${entry.serviceName} ${data.heroLead}`.toLowerCase();
  const cats = new Set();
  if (/golden|kathmandu.*pokhara.*chitwan|nepal tours package|nepal experience/.test(s)) cats.add('golden-triangle');
  if (/heli|luxury|honeymoon|christmas/.test(s)) cats.add('luxury-heli');
  if (/safari|chitwan|bardiya|wildlife/.test(s)) cats.add('wildlife');
  if (/sunrise|nagarkot|pokhara|mustang|ghandruk|sarangkot|scenic/.test(s)) cats.add('scenic');
  if (/heritage|culture|cultural|lumbini|vesak|buddhist|temple|village|sirubari|ghale|family|valley|holiday|tour/.test(s)) cats.add('culture');
  if (!cats.size) cats.add('culture');
  return [...cats].join(' ');
}

function renderTourCard(item, idx, prefix) {
  const { entry, data } = item;
  const days = data.durationDays || 1;
  const nights = Math.max(0, days - 1);
  const priceUsd = data.pricing?.primaryPriceUsd || 0;
  const cats = classifyTourCats(item);
  const goldTag = cats.includes('luxury-heli') ? 'LUXURY / HELI' : (cats.includes('wildlife') ? 'WILDLIFE SAFARI' : (cats.includes('golden-triangle') ? 'GRAND TOUR' : (cats.includes('scenic') ? 'SCENIC HIMALAYA' : 'CULTURAL HERITAGE')));
  const href = `${prefix}${entry.targetDir}/`;
  const imgUrl = getHeroImg(data, prefix);
  const title = entry.serviceName;
  const desc = getShortDesc(data, 155);
  const grade = data.facts?.grade || 'Easy';
  const trans = data.facts?.transportation ? data.facts.transportation.split(/[.,]/)[0].trim() : 'Private Vehicle';
  const acc = data.facts?.accommodation ? data.facts.accommodation.split(/[.,]/)[0].trim() : 'Hotels & Resorts';
  const act = data.facts?.activity || 'Guided Tour';
  const searchStr = `${title} ${entry.regionLabel} ${cats} ${days} days`.toLowerCase();

  return `          <article class="tour-card" data-category="${escapeHtmlAttr(cats)}" data-days="${days}" data-price="${priceUsd}" data-order="${idx + 1}" data-search="${escapeHtmlAttr(searchStr)}">
            <div>
              <div class="tour-card-media">
                <img src="${escapeHtmlAttr(imgUrl)}" alt="${escapeHtmlAttr(title)}" class="tour-card-img" loading="lazy">
                <span class="tour-badge-duration">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>${days === 1 ? '1 Full Day' : `${days} Days / ${nights} Nights`}</span>
                </span>
                <div class="tour-badge-price-pill">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
                  <div class="price-pill-text">
                    <span class="price-pill-from">${priceUsd > 0 ? 'From' : 'Quote'}</span>
                    <span class="price-pill-amount">${priceUsd > 0 ? `$${priceUsd.toLocaleString()}` : 'On Request'}</span>
                  </div>
                </div>
                <span class="tour-badge-gold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"/></svg>
                  <span>${escapeHtmlText(goldTag)}</span>
                </span>
                <div class="tour-media-wave" aria-hidden="true">
                  <svg viewBox="0 0 500 50" preserveAspectRatio="none">
                    <path d="M0,22 C140,48 240,6 380,24 C430,30 470,20 500,24 L500,50 L0,50 Z" fill="#FFFFFF"/>
                  </svg>
                </div>
              </div>
              <div class="tour-card-body">
                <div class="tour-location-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0D7A57" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                  <span>${escapeHtmlText(entry.regionLabel)} • Nepal</span>
                </div>
                <h3 class="tour-card-title">
                  <a href="${escapeHtmlAttr(href)}">${escapeHtmlText(title)}</a>
                </h3>
                <div class="tour-title-accent" aria-hidden="true"></div>
                <p class="tour-desc">${escapeHtmlText(desc)}</p>
                <div class="tour-feat-grid">
                  <div class="tour-feat-box"><div class="tour-feat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3A5D" stroke-width="2.2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4 18h16"/></svg></div><span class="tour-feat-label">${escapeHtmlText(act)}</span></div>
                  <div class="tour-feat-box"><div class="tour-feat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3A5D" stroke-width="2.2"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20"/></svg></div><span class="tour-feat-label">${escapeHtmlText(acc)}</span></div>
                  <div class="tour-feat-box"><div class="tour-feat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3A5D" stroke-width="2.2"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-5l2-4h10l3 4h3v5h-2"/></svg></div><span class="tour-feat-label">${escapeHtmlText(trans)}</span></div>
                  <div class="tour-feat-box"><div class="tour-feat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3A5D" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><span class="tour-feat-label">${escapeHtmlText(grade)}</span></div>
                </div>
              </div>
            </div>
            <div class="tour-card-footer-capsule">
              <div class="tour-capsule-item">
                <div class="capsule-text-col">
                  <span class="capsule-label">DURATION</span>
                  <span class="capsule-val">${days} ${days === 1 ? 'Day' : 'Days'}</span>
                </div>
              </div>
              <div class="capsule-divider" aria-hidden="true"></div>
              <div class="tour-capsule-item">
                <div class="capsule-text-col">
                  <span class="capsule-label">STARTING</span>
                  <span class="capsule-val">${priceUsd > 0 ? `$${priceUsd.toLocaleString()}` : 'Request Quote'}</span>
                </div>
              </div>
              <a href="${escapeHtmlAttr(href)}" class="tour-btn-view-details">
                <span>View Details</span>
                <span class="btn-arrow-circle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803D" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
              </a>
            </div>
          </article>`;
}

for (const [rel, prefix] of [['nepal-tour-packages/index.html', '../'], ['nepal-tour-packages.html', '']]) {
  const full = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, 'utf8');
  const marker = 'id="tour-cards-container"';
  const mIdx = html.indexOf(marker);
  const divStart = html.lastIndexOf('<div', mIdx);
  const divEnd = findBalancedEnd(html, divStart, 'div');
  const openTagEnd = html.indexOf('>', divStart) + 1;
  const cardsHtml = activeTours.map((it, i) => renderTourCard(it, i, prefix)).join('\n\n');
  html = html.slice(0, openTagEnd) + `\n\n${cardsHtml}\n\n        ` + html.slice(divEnd - 6);
  html = html
    .replace(/Explore 6 official Nepal tour packages/gi, `Explore ${activeTours.length} official Nepal tour packages`)
    .replace(/id="tour-active-count">6</g, `id="tour-active-count">${activeTours.length}<`)
    .replace(/of 6 Handcrafted Nepal Tour Packages/g, `of ${activeTours.length} Handcrafted Nepal Tour Packages`);
  fs.writeFileSync(full, html, 'utf8');
  console.log(`SYNCED ${rel} (${activeTours.length} tour cards)`);
}

// =========================================================================
// 3. Sync 12 Peak & Region Hub Card Grids + Table/Anchor Fixes
// =========================================================================
function renderHubExoticCard(item) {
  const { entry, data } = item;
  const days = data.durationDays || 1;
  const priceStr = formatPriceText(data);
  const href = `../${entry.targetDir}/`;
  const imgUrl = getHeroImg(data, '../');
  const title = entry.serviceName;
  const desc = getShortDesc(data, 125);
  return `          <div class="exotic-trek-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="position: relative; height: 200px;"><img src="${escapeHtmlAttr(imgUrl)}" alt="${escapeHtmlAttr(title)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy"><span style="position: absolute; top: 12px; right: 12px; background: var(--color-primary-navy); color: white; padding: 4px 10px; border-radius: 14px; font-weight: 700; font-size: 0.75rem;">${days} ${days === 1 ? 'DAY' : 'DAYS'}</span></div>
            <div style="padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <div><h3 style="font-size: 1.25rem; color: var(--color-primary-navy); margin-bottom: 6px; font-weight: 700;">${escapeHtmlText(title)}</h3><p style="color: var(--color-neutral-600); font-size: 0.88rem; line-height: 1.5; margin-bottom: 16px;">${escapeHtmlText(desc)}</p></div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-neutral-100); padding-top: 14px;">
                <div><span style="font-size: 0.72rem; color: var(--color-neutral-500); text-transform: uppercase;">${data.pricing?.primaryPriceUsd ? 'From' : 'Quote'}</span><strong style="display: block; font-size: 1.15rem; color: var(--color-primary-navy);">${escapeHtmlText(priceStr)}</strong></div>
                <a href="${escapeHtmlAttr(href)}" style="color: #087F52; font-weight: 700; font-size: 0.9rem; text-decoration: none;">Explore →</a>
              </div>
            </div>
          </div>`;
}

const HUB_SLUGS = {
  'peak-climbing-nepal/index.html': [
    'island-peak-climbing', 'mera-peak-climbing', 'lobuche-peak-climbing', 'pisang-peak-climbing',
    'chulu-west-peak-climbing', 'chulu-far-east-peak-climbing', 'paldor-peak-climbing', 'naya-kang-peak-climb',
    'mt-cholatse-peak', 'mardi-himal-peak-climbing', 'dhaulagiri-trek-and-dhampus-peak',
    'everest-base-camp-with-island-peak-climbing', 'everest-base-camp-with-lobuche-peak-climbing',
    'everest-high-pass-with-island-peak'
  ],
  'everest-region-treks/index.html': activeEntries
    .filter(e => e.regionLabel === 'Everest' || ['island-peak-climbing', 'mt-cholatse-peak'].includes(e.sourceSlug))
    .map(e => e.sourceSlug),
  'annapurna-region-treks/index.html': activeEntries
    .filter(e => e.regionLabel === 'Annapurna' || /annapurna|dhaulagiri|mardi|chulu|pisang|gurung/.test(e.sourceSlug))
    .map(e => e.sourceSlug),
  'langtang-region-treks/index.html': activeEntries
    .filter(e => e.regionLabel === 'Langtang' || ['naya-kang-peak-climb', 'paldor-peak-climbing', 'chisapani-helambu-trek', 'panch-pokhari-trek'].includes(e.sourceSlug))
    .map(e => e.sourceSlug),
  'manaslu-region-treks/index.html': activeEntries
    .filter(e => e.regionLabel === 'Manaslu')
    .map(e => e.sourceSlug),
  'mustang-region-treks/index.html': activeEntries
    .filter(e => e.regionLabel === 'Mustang')
    .map(e => e.sourceSlug),
  'dolpo-region-treks/index.html': ['upper-dolpo-trek', 'lower-dolpo-trek'],
  'kanchenjunga-region-treks/index.html': ['kanchenjunga-base-camp-trek', 'kanchenjunga-trek'].filter(s => tripsBySlug.has(s)),
  'makalu-region-treks/index.html': ['makalu-base-camp-trek'],
  'ganesh-himal-region-treks/index.html': [
    'ganesh-himal-view-trek', 'ganesh-himal-base-camp-trek', 'ganesh-himal-rupina-la-trek',
    'ganesh-himal-singla-pass-trek', 'ganesh-himal-ruby-valley-trek', 'ruby-valley-trekking', 'paldor-peak-climbing'
  ],
  'rolwaling-region-treks/index.html': ['rolwaling-trek', 'mt-cholatse-peak', 'panch-pokhari-trek'],
  'restricted-area-treks-nepal/index.html': [
    'manaslu-circuit-trek', 'tsum-valley-trek', 'manaslu-circuit-trek-with-tsum-valley',
    'upper-mustang-trek', 'upper-dolpo-trek', 'lower-dolpo-trek',
    'kanchenjunga-trek', 'nar-phu-valley-trek', 'nar-phu-valley-kang-la-pass-trek', 'mustang-damodar-kunda-trek'
  ]
};

for (const [rel, slugList] of Object.entries(HUB_SLUGS)) {
  const full = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, 'utf8');
  const exIdx = html.indexOf('<div class="exotic-trek-card"');
  if (exIdx === -1) continue;
  const gridStart = html.lastIndexOf('<div', exIdx - 1);
  const gridEnd = findBalancedEnd(html, gridStart, 'div');
  const openTagEnd = html.indexOf('>', gridStart) + 1;

  const uniqueSlugs = [...new Set(slugList)].filter(s => tripsBySlug.has(s));
  const cardsHtml = uniqueSlugs.map(s => renderHubExoticCard(tripsBySlug.get(s))).join('\n');
  html = html.slice(0, openTagEnd) + `\n${cardsHtml}\n        </div>` + html.slice(gridEnd);

  // Fix stale links inside langtang-region-treks
  html = html
    .replace(/\.\.\/trek\/tamang-heritage-trail\//g, '../trek/tamang-heritage-trail-trek/')
    .replace(/\.\.\/trek\/helambu-circuit-trek\//g, '../trek/helambu-trek/');

  fs.writeFileSync(full, html, 'utf8');
  console.log(`SYNCED ${rel} (${uniqueSlugs.length} cards)`);
}

// =========================================================================
// 4. Sync index.html Carousels & Popular Treks Static Fallback Cards
// =========================================================================
{
  const full = path.join(REPO_ROOT, 'index.html');
  let html = fs.readFileSync(full, 'utf8');

  const cardUpdates = [
    // Popular Treks fallback cards (#treks-grid-container)
    { slug: 'everest-base-camp-trek', titleMatch: 'Everest Base Camp Trek' },
    { slug: 'annapurna-base-camp-trek', titleMatch: 'Annapurna Base Camp Trek' },
    { slug: 'manaslu-circuit-trek', titleMatch: 'Manaslu Circuit Trek' },
    { slug: 'mardi-himal-trek', titleMatch: 'Mardi Himal Ridge Trek' },
    { slug: 'everest-base-camp-cho-la-pass-gokyo-trek', titleMatch: 'Everest Base Camp with Cho La Pass' },
    { slug: 'langtang-valley-trek', titleMatch: 'Langtang Valley Trek' }
  ];

  // Rewrite #peak-carousel-container cards cleanly using real peak climbing packages
  const peakItems = [
    { slug: 'island-peak-climbing', badge: '99% Summit Success Rate', summit: '6,189m SUMMIT', reg: 'EVEREST REGION', sub: 'Solukhumbu, Everest Region' },
    { slug: 'mera-peak-climbing', badge: 'Highest Trekking Peak', summit: '6,476m SUMMIT', reg: 'EVEREST REGION', sub: 'Hinku Valley, Everest Region' },
    { slug: 'lobuche-peak-climbing', badge: 'Technical Alpine Climb', summit: '6,119m SUMMIT', reg: 'EVEREST REGION', sub: 'Khumbu Glacier, Everest Region' },
    { slug: 'naya-kang-peak-climb', badge: 'Langtang Summit Climb', summit: '5,844m SUMMIT', reg: 'LANGTANG REGION', sub: 'Rasuwa, Langtang Region' },
    { slug: 'pisang-peak-climbing', badge: 'Annapurna Summit', summit: '6,091m SUMMIT', reg: 'ANNAPURNA REGION', sub: 'Manang, Annapurna Region' }
  ].map(c => ({ ...c, ...tripsBySlug.get(c.slug) }));

  function renderCarouselCard(cfg, tagType = 'PEAK CLIMBING') {
    const { entry, data, badge, summit, reg, sub } = cfg;
    const days = data.durationDays || 1;
    const priceStr = formatPriceText(data);
    const imgUrl = getHeroImg(data, '');
    const href = `${entry.targetDir}/`;
    const desc = getShortDesc(data, 120);
    return `              <div class="exotic-trek-card peak-package-card">
                <div class="exotic-img-wrapper">
                  <img loading="lazy" src="${escapeHtmlAttr(imgUrl)}" alt="${escapeHtmlAttr(entry.serviceName)}">
                  <span class="duration-badge-top">${days} ${days === 1 ? 'DAY' : 'DAYS'}</span>
                  <div class="exotic-img-hover-overlay">
                    <div class="exotic-hover-tags">
                      <span class="exotic-hover-tag-pill">${escapeHtmlText(summit)}</span>
                      <span class="exotic-hover-tag-pill">${escapeHtmlText(reg)}</span>
                      <span class="exotic-hover-tag-pill">${escapeHtmlText(tagType)}</span>
                    </div>
                    <p class="exotic-hover-summary">${escapeHtmlText(desc)}</p>
                    <a href="${escapeHtmlAttr(href)}" class="act-hover-explore-btn" style="margin-top:8px;">View Package →</a>
                  </div>
                </div>
                <div class="exotic-card-content">
                  <div>
                    <h3 class="exotic-card-title"><a href="${escapeHtmlAttr(href)}" style="color:inherit;text-decoration:none;">${escapeHtmlText(entry.serviceName)}</a></h3>
                    <div class="exotic-card-subregion">${escapeHtmlText(sub)}</div>
                  </div>
                  <div class="exotic-card-footer">
                    <div class="price-group">
                      <span class="price-label">${data.pricing?.primaryPriceUsd ? 'Starting From' : 'Custom Quote'}</span>
                      <strong class="price-amount">${escapeHtmlText(priceStr)}</strong>
                    </div>
                    <a href="${escapeHtmlAttr(href)}" class="btn-inquire-orange" style="text-decoration:none;">Explore →</a>
                  </div>
                  <div class="peak-speed-badge"><span>${escapeHtmlText(badge)}</span></div>
                </div>
              </div>`;
  }

  // Update #peak-carousel-container
  {
    const pIdx = html.indexOf('id="peak-carousel-container"');
    const pStart = html.lastIndexOf('<div', pIdx);
    const pEnd = findBalancedEnd(html, pStart, 'div');
    const pOpenEnd = html.indexOf('>', pStart) + 1;
    html = html.slice(0, pOpenEnd) + '\n' + peakItems.map(it => renderCarouselCard(it, 'PEAK CLIMBING')).join('\n') + '\n            </div>' + html.slice(pEnd);
  }

  // Update #tour-carousel-container
  const tourCarouselItems = [
    { slug: 'kathmandu-pokhara-tour', badge: 'Best Seller Tour', summit: 'CULTURAL TOUR', reg: 'KATHMANDU & POKHARA', sub: 'Kathmandu & Pokhara Valley' },
    { slug: 'safari-holiday', badge: 'UNESCO Wildlife Park', summit: 'JUNGLE SAFARI', reg: 'CHITWAN NATIONAL PARK', sub: 'Chitwan National Park, Nepal' },
    { slug: 'kathmandu-lumbini-tours', badge: 'Spiritual Pilgrimage', summit: 'BUDDHA BIRTHPLACE', reg: 'LUMBINI HERITAGE', sub: 'Kathmandu & Lumbini, Nepal' },
    { slug: 'everest-base-camp-helicopter-tour', badge: 'Signature Heli Flight', summit: '1 DAY FLIGHT', reg: 'EVEREST HIMALAYA', sub: 'Everest View & Base Camp' },
    { slug: 'upper-mustang-overland-jeep-tour', badge: 'Trans-Himalayan Overland', summit: '4WD EXPEDITION', reg: 'UPPER MUSTANG', sub: 'Lo Manthang & Kali Gandaki' }
  ].map(c => ({ ...c, ...tripsBySlug.get(c.slug) }));

  {
    const tIdx = html.indexOf('id="tour-carousel-container"');
    const tStart = html.lastIndexOf('<div', tIdx);
    const tEnd = findBalancedEnd(html, tStart, 'div');
    const tOpenEnd = html.indexOf('>', tStart) + 1;
    html = html.slice(0, tOpenEnd) + '\n' + tourCarouselItems.map(it => renderCarouselCard(it, 'GUIDED TOUR')).join('\n') + '\n            </div>' + html.slice(tEnd);
  }

  // Update static fallback cards in #treks-grid-container to match js/trek-finder.js prices/days
  const tgStart = html.indexOf('id="treks-grid-container"');
  const tgEnd = findBalancedEnd(html, html.lastIndexOf('<div', tgStart), 'div');
  let tgSlice = html.slice(tgStart, tgEnd);
  const replacements = [
    ['Everest Base Camp Trek', '14 DAYS', '15 DAYS', '$1399', '$1,395', 'trek/everest-base-camp-trek/'],
    ['Annapurna Base Camp Trek', '11 DAYS', '13 DAYS', '$980', '$1,100', 'trek/annapurna-base-camp-trek/'],
    ['Manaslu Circuit Trek', '15 DAYS', '15 DAYS', '$1250', '$1,050', 'trek/manaslu-circuit-trek/'],
    ['Mardi Himal Ridge Trek', '7 DAYS', '10 DAYS', '$650', '$895', 'trek/mardi-himal-trek/'],
    ['Everest Base Camp with Cho La Pass', '16 DAYS', '18 DAYS', '$1490', '$1,595', 'trek/everest-base-camp-with-cho-la-pass-trek/'],
    ['Langtang Valley Trek', '9 DAYS', '10 DAYS', '$750', '$295', 'trek/langtang-valley-trek/']
  ];
  for (const [title, oldD, newD, oldP, newP, slugUrl] of replacements) {
    const tPos = tgSlice.indexOf(title);
    if (tPos === -1) continue;
    const cardStart = tgSlice.lastIndexOf('<div class="exotic-trek-card"', tPos);
    const nextCard = tgSlice.indexOf('<!-- Static Card', tPos);
    const segEnd = nextCard !== -1 ? nextCard : tgSlice.length;
    let card = tgSlice.slice(cardStart, segEnd);
    card = card.replace(oldD, newD).replace(oldP, newP).replace(`<h3 class="exotic-card-title">${title}</h3>`, `<h3 class="exotic-card-title"><a href="${slugUrl}" style="color:inherit;text-decoration:none;">${title}</a></h3>`);
    tgSlice = tgSlice.slice(0, cardStart) + card + tgSlice.slice(segEnd);
  }
  html = html.slice(0, tgStart) + tgSlice + html.slice(tgEnd);

  fs.writeFileSync(full, html, 'utf8');
  console.log('SYNCED index.html carousels & fallback cards');
}

// =========================================================================
// 5. Fix trekking-regions-nepal/index.html 38 legacy broken links
// =========================================================================
{
  const full = path.join(REPO_ROOT, 'trekking-regions-nepal/index.html');
  let html = fs.readFileSync(full, 'utf8');
  const remap = {
    '../trek/chisapani-nagarkot-trek/': '../trek/chisapani-nagarkot-hike/',
    '../trek/yala-peak-climbing/': '../trek/naya-kang-peak-climb/',
    '../trek/kanchenjunga-circuit-trek/': '../trek/kanchenjunga-base-camp-trek/',
    '../trek/annapurna-view-trek/': '../trek/annapurna-panorama-trekking/',
    '../trek/ebc-chola-pass-gokyo-trek/': '../trek/everest-base-camp-with-cho-la-pass-trek/',
    '../trek/everest-chola-and-renjo-la-pass-trek/': '../trek/everest-three-passes-trek/',
    '../trek/three-high-passes-with-island-peak-climb/': '../trek/everest-high-pass-with-island-peak/',
    '../trek/everest-base-camp-trek-with-island-peak-climb/': '../trek/everest-base-camp-with-island-peak-climbing/',
    '../trek/gokyo-lake-with-renjo-la-pass-trek/': '../trek/gokyo-renjo-la-pass-trek-15-days/',
    '../trek/gokyo-lake-trek-with-helicopter-return/': '../trek/everest-base-camp-trek-with-heli-return/',
    '../trek/tengboche-trek/': '../trek/everest-view-trek/',
    '../trek/gokyo-lakes-luxury-trek/': '../trek/everest-base-camp-luxury-trek/',
    '../trek/everest-base-camp-trek-heli-return/': '../trek/everest-base-camp-trek-with-heli-return/',
    '../trek/everest-base-camp-trek-16-days/': '../trek/everest-base-camp-trek/',
    '../trek/everest-base-camp-trek-without-flight/': '../trek/everest-base-camp-trek-by-road/',
    '../trek/short-annapurna-base-camp-trek/': '../trek/annapurna-base-camp-short-trek/',
    '../trek/north-annapurna-base-camp-trek/': '../trek/annapurna-base-camp-trek/',
    '../trek/annapurna-base-camp-heli-return/': '../trek/annapurna-base-camp-short-trek/',
    '../trek/classic-annapurna-circuit-trek/': '../trek/annapurna-circuit-trek/',
    '../trek/annapurna-circuit-with-tilicho-lake/': '../trek/annapurna-circuit-trek-with-tilicho-lake/',
    '../trek/ghorepani-poon-hill-with-mardi-himal-trek/': '../trek/mardi-himal-trek/',
    '../trek/abc-with-mardi-himal-trek/': '../trek/annapurna-base-camp-trek/',
    '../trek/annapurna-base-camp-trek-via-poon-hill/': '../trek/poon-hill-abc-trek/',
    '../trek/annapurna-luxury-trek/': '../trek/luxury-ghorepani-ghandruk-trek/',
    '../trek/annapurna-circuit-luxury-trek/': '../trek/annapurna-circuit-trek/',
    '../trek/manaslu-circuit-trek-12-days/': '../trek/short-manaslu-circuit-trek/',
    '../trek/gosaikunda-trek/': '../trek/langtang-gosaikunda-trek/',
    '../trek/tamang-heritage-trail-with-langtang-valley-trek/': '../trek/tamang-heritage-trail-trek/',
    '../trek/langtang-gosaikunda-helambu-trek/': '../trek/langtang-valley-ganjala-pass-helambu-trek/',
    '../tour/upper-mustang-jeep-tour/': '../tour/upper-mustang-overland-jeep-tour/',
    '../tour/upper-mustang-tiji-festival/': '../trek/mustang-tiji-festival-trek/',
    '../trek/kanchenjunga-trek-without-flight/': '../trek/kanchenjunga-base-camp-trek/',
    '../tour/one-day-kathmandu-city-tour/': '../tour/kathmandu-valley-day-tours/',
    '../tour/kailash-mansarovar-yatra/': '../nepal-tour-packages/',
    '../tour/cycling-tour-around-kathmandu-valley/': '../tour/kathmandu-valley-day-tours/',
    '../tour/jamacho-hike/': '../trek/sivapuri-hiking/',
    '../tour/rara-lake-jeep-tour/': '../trek/rara-lake-trek/',
    '../tour/7-day-rara-lake-jeep-tour/': '../trek/rara-lake-trek/'
  };
  for (const [oldHref, newHref] of Object.entries(remap)) {
    html = html.split(oldHref).join(newHref);
  }
  fs.writeFileSync(full, html, 'utf8');
  console.log('SYNCED trekking-regions-nepal/index.html legacy links');
}

// =========================================================================
// 6. Site-wide Mega-Menu & Header Dropdown Link Fix across non-batch HTML & Templates
//    (Batch pages will be rebuilt cleanly from templates right after)
// =========================================================================
const batchHtmlSet = new Set(activeEntries.map(e => e.targetHtmlPath.replace(/\\/g, '/')));
function safeWriteFileSync(filePath, content) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return;
    } catch (err) {
      if (attempt === 4) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 120 * attempt);
    }
  }
}

let menuFixCount = 0;
function walkFixHtml(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', 'scratch', 'public', 'content', 'uploads', 'thumb', 'images', 'video', '.cursor'].includes(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walkFixHtml(full);
    } else if (name.endsWith('.html')) {
      const rel = path.relative(REPO_ROOT, full).replace(/\\/g, '/');
      if (batchHtmlSet.has(rel)) continue;
      const orig = fs.readFileSync(full, 'utf8');
      let updated = orig
        .replace(/tour\/lumbini-birthplace-of-buddha-tour\/(" class="nav-dropdown-link"><span>Lumbini Buddhist Tour<\/span>\s*<span class="days-badge">)4 DAYS(<\/span>)/g, 'tour/kathmandu-lumbini-tours/$16 DAYS$2')
        .replace(/tour\/lumbini-birthplace-of-buddha-tour\//g, 'tour/kathmandu-lumbini-tours/')
        .replace(/(tour\/chitwan-national-park-safari\/" class="nav-dropdown-link"><span>Chitwan Jungle Safari<\/span>\s*<span class="days-badge">)3 DAYS(<\/span>)/g, '$17 DAYS$2');
      if (updated !== orig) {
        safeWriteFileSync(full, updated);
        menuFixCount++;
      }
    }
  }
}
walkFixHtml(REPO_ROOT);
console.log(`SYNCED header/mega-menu links across ${menuFixCount} non-batch HTML/template files`);

// =========================================================================
// 7. Fix legacy mega-menu links in bespoke trek/pikey-peak-trek/index.html
// =========================================================================
{
  const pikeyPath = path.join(REPO_ROOT, 'trek', 'pikey-peak-trek', 'index.html');
  if (fs.existsSync(pikeyPath)) {
    let html = fs.readFileSync(pikeyPath, 'utf8');
    const pikeyRemap = {
      '../../trek/tent-peak-climbing/': '../../peak-climbing-nepal/',
      '../../trek/everest-cho-la-pass-trek/': '../../trek/everest-base-camp-with-cho-la-pass-trek/',
      '../../trek/renjo-la-pass-trek/': '../../trek/gokyo-renjo-la-pass-trek-15-days/',
      '../../trek/everest-luxury-lodge-trek/': '../../trek/everest-base-camp-luxury-trek/',
      '../../trek/ebc-heli-trek/': '../../trek/everest-base-camp-trek-with-heli-return/',
      '../../trek/gokyo-renjo-la-luxury-trek/': '../../trek/gokyo-renjo-la-pass-trek-15-days/',
      '../../trek/abc-short-trek/': '../../trek/annapurna-base-camp-short-trek/',
      '../../trek/tilicho-lake-circuit-trek/': '../../trek/annapurna-circuit-trek-with-tilicho-lake/',
      '../../trek/nar-phu-annapurna-circuit/': '../../trek/nar-phu-valley-kang-la-pass-trek/',
      '../../trek/sikles-kapuche-lake-trek/': '../../annapurna-region-treks/',
      '../../trek/tamang-heritage-trail/': '../../trek/tamang-heritage-trail-trek/',
      '../../trek/helambu-cultural-trek/': '../../trek/helambu-trek/',
      '../../trek/khaptad-national-park-trek/': '../../trek/rara-lake-trek/'
    };
    for (const [oldH, newH] of Object.entries(pikeyRemap)) {
      html = html.split(oldH).join(newH);
    }
    safeWriteFileSync(pikeyPath, html);
    console.log('SYNCED trek/pikey-peak-trek/index.html legacy menu links');
  }
}

// =========================================================================
// 8. Ensure type="module" on hub scripts & strip dead missing footer tags
// =========================================================================
{
  const hubScriptTargets = [
    'index.html',
    'nepal-trekking-packages/index.html',
    'nepal-trekking-packages.html',
    'nepal-tour-packages/index.html',
    'nepal-tour-packages.html',
    'trekking-regions-nepal/index.html',
    ...Object.keys(HUB_SLUGS)
  ];
  let bundledScriptFixes = 0;
  for (const rel of hubScriptTargets) {
    const full = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const orig = fs.readFileSync(full, 'utf8');
    let updated = orig
      .replace(/<script\s+src="([^"]*\/?(?:js\/)?(?:header-scroll|mega-menu|hero-video|how-it-works-carousel|regions-hub)\.js[^"]*)"><\/script>/gi, '<script type="module" src="$1"></script>')
      .replace(/<link\b[^>]*href="\.\.\/footer\.css\?v=1"[^>]*>\s*/gi, '')
      .replace(/<script\b[^>]*src="\.\.\/js\/footer-interactions\.js"[^>]*><\/script>\s*/gi, '');
    if (updated !== orig) {
      safeWriteFileSync(full, updated);
      bundledScriptFixes++;
    }
  }
  console.log(`SYNCED Vite module script attributes across ${bundledScriptFixes} hub/landing pages`);
}
