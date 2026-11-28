import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  cleanSourceCopy,
  encodeAssetPath,
  escapeHtmlAttr,
  escapeHtmlText,
  loadGearProfiles,
  loadTripManifest,
  parseTripFilterArgs
} from './lib/trip-utils.mjs';

function smartTruncate(str = '', maxLen = 36) {
  const s = cleanSourceCopy(str);
  if (s.length <= maxLen) return s;
  const sub = s
    .slice(0, maxLen)
    .replace(/\s+\S*$/, '')
    .replace(/\s+(?:and|or|to|via|with|from|in|at|of|for)$/i, '')
    .trim();
  return sub || s.slice(0, maxLen).trim();
}

function cleanFactsMap(trip) {
  const f = {};
  for (const [k, v] of Object.entries(trip.facts || {})) {
    let val = cleanSourceCopy(v);
    if (k === 'max elevation' && /^\d[\d,]*$/.test(val)) {
      val = `${Number(val.replace(/,/g, '')).toLocaleString()} m`;
    }
    f[k] = val;
  }
  return f;
}

function rewriteInternalLinksAndHighlights(overviewHtml, trip, manifest) {
  let html = String(overviewHtml || '');
  const bySlug = new Map(manifest.packages.map(p => [p.sourceSlug, p]));

  html = html.replace(/https?:\/\/(?:www\.)?nepaluniquetreks\.com\/trip\/([a-z0-9-]+)\/?/gi, (m, slug) => {
    const target = bySlug.get(slug.toLowerCase());
    if (target && !target.deferred) return `../../${target.targetDir}/`;
    return '../../nepal-tour-packages/';
  });
  html = html.replace(/https?:\/\/(?:www\.)?nepaluniquetreks\.com\/region\/([a-z0-9-]+)\/?/gi, (m, rSlug) => {
    if (rSlug.includes('everest')) return '../../everest-region-treks/';
    if (rSlug.includes('annapurna')) return '../../annapurna-region-treks/';
    if (rSlug.includes('langtang')) return '../../langtang-region-treks/';
    if (rSlug.includes('manaslu')) return '../../manaslu-region-treks/';
    if (rSlug.includes('mustang')) return '../../mustang-region-treks/';
    if (rSlug.includes('dolpo')) return '../../dolpo-region-treks/';
    if (rSlug.includes('kanchenjunga')) return '../../kanchenjunga-region-treks/';
    if (rSlug.includes('peak')) return '../../peak-climbing-nepal/';
    return '../../nepal-trekking-packages/';
  });
  html = html.replace(/https?:\/\/(?:www\.)?nepaluniquetreks\.com\/activity\/([a-z0-9-]+)\/?/gi, '../../nepal-trekking-packages/');
  html = html.replace(/href="https?:\/\/(?:www\.)?nepaluniquetreks\.com\/?"/gi, 'href="../../index.html"');

  // Always strip inline Highlights heading + list from overview prose so it never duplicates the top cards
  let extractedHighlights = Array.isArray(trip.highlights) ? trip.highlights.map(cleanSourceCopy).filter(Boolean) : [];
  const hlRe = /<h[1-4][^>]*>(?:(?!(?:<\/h[1-4]>)).)*Highlights(?:(?!(?:<\/h[1-4]>)).)*<\/h[1-4]>\s*(?:<p>[\s\S]*?<\/p>\s*)*(<ul[\s\S]*?<\/ul>)/gi;
  for (const m of [...html.matchAll(hlRe)]) {
    if (extractedHighlights.length < 3) {
      const items = [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map(x => cleanSourceCopy(x[1].replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')))
        .filter(Boolean);
      if (items.length >= 3) {
        extractedHighlights = items.slice(0, 8);
      }
    }
    html = html.replace(m[0], '').trim();
  }

  return { cleanedOverviewHtml: cleanSourceCopy(html), extractedHighlights };
}

function cleanAssetUrl(relPath) {
  return `../../${encodeAssetPath(relPath)}`;
}

function selectGearProfileKey(trip) {
  const cat = (trip.sourceCategory || '').toLowerCase();
  const alt = Number(trip.maxElevationM || 1400);
  const type = (trip.facts?.['treks type'] || '').toLowerCase();

  if (cat.includes('expedition') || alt >= 6800) return 'expedition';
  if (cat.includes('peak') || type.includes('climbing') || alt >= 5800) return 'peak-climbing';
  if (cat.includes('off the beaten') || type.includes('camping')) return 'restricted-camping';
  if (trip.durationDays <= 2) return 'day-hike';
  if (alt >= 4000) return 'teahouse-high-pass';
  return 'teahouse-low';
}

function deriveHighlights(trip, extractedHighlights = []) {
  const sourceHl = extractedHighlights.length >= 3 ? extractedHighlights : (trip.highlights || []);
  if (sourceHl.length >= 3) {
    return sourceHl.slice(0, 6).map(raw => {
      const txt = cleanSourceCopy(raw);
      const sepMatch = txt.match(/:\s+|\s+[–—]\s+/);
      if (sepMatch && sepMatch.index > 5 && sepMatch.index < 54) {
        const prefix = txt.slice(0, sepMatch.index).trim();
        const openParens = (prefix.match(/\(/g) || []).length;
        const closeParens = (prefix.match(/\)/g) || []).length;
        const remainder = txt.slice(sepMatch.index + sepMatch[0].length).trim();
        if (openParens === closeParens && remainder.length > 8) {
          return { title: prefix, desc: remainder };
        }
      }
      return { title: '', desc: txt };
    });
  }
  const f = cleanFactsMap(trip);
  const actTitle = f.activity
    ? f.activity.replace(/\b([a-z])/g, (_, ch) => ch.toUpperCase()).replace(/\b(And|Or|Of|In|To)\b/g, w => w.toLowerCase())
    : (trip.templateType === 'tour' ? 'Sightseeing & Cultural Discovery' : 'Guided Exploration');
  const daysNum = Number(trip.durationDays) || 1;
  const durationTitle = `${daysNum} ${daysNum === 1 ? 'Day' : 'Days'} ${trip.templateType === 'tour' ? 'Guided Program' : 'Himalayan Itinerary'}`;
  const fallbackCards = [
    {
      title: durationTitle,
      desc: cleanSourceCopy(`${trip.title} featuring max altitude ${f['max elevation'] || `${trip.maxElevationM} m`} across the ${trip.regionLabel} corridor.`)
    },
    {
      title: actTitle,
      desc: cleanSourceCopy(`Led by certified English-speaking Nepal Unique Treks local specialists (${f['treks type'] || 'Guided Package'}).`)
    },
    {
      title: 'Accommodation & Transport',
      desc: cleanSourceCopy(`Accommodation: ${f.accommodation || 'Hotel & Lodge'} • Transport: ${f.transportation || 'Private Tourist Vehicle'}.`)
    },
    {
      title: 'Best Time & Seasonality',
      desc: cleanSourceCopy(`Best Season: ${f['best season'] || 'Spring & Autumn'} • Difficulty Grade: ${f.grade || 'Easy to Moderate'}.`)
    }
  ];
  if (trip.templateType === 'tour') {
    const seen = new Set();
    const dayStops = [];
    for (const d of trip.itinerary || []) {
      if (/arrival|welcome|departure|return journey|final departure|drive back to|fly back to|leisure day/i.test(d.title)) continue;
      const rawLead = d.title.split(/[:\u2013\u2014|(]|\s+via\s+|\s+-\s+/i)[0];
      const baseTitle = smartTruncate(rawLead, 58);
      const key = baseTitle.toLowerCase();
      if (!baseTitle || seen.has(key)) continue;
      seen.add(key);
      dayStops.push({
        title: baseTitle,
        desc: cleanSourceCopy(d.description || d.title)
      });
      if (dayStops.length >= 4) break;
    }
    for (const fb of fallbackCards) {
      if (dayStops.length >= 4) break;
      if (!seen.has(fb.title.toLowerCase())) {
        seen.add(fb.title.toLowerCase());
        dayStops.push(fb);
      }
    }
    return dayStops;
  }
  return fallbackCards;
}

function buildHeroHtml(trip) {
  const imgs = (trip.galleryImages || []).slice(0, 5);
  while (imgs.length < 5 && imgs.length > 0) imgs.push(imgs[0]);

  const imgSrc = i => cleanAssetUrl(imgs[i] || 'images/logo.png');
  const pillText = `${trip.regionLabel} • ${trip.facts?.grade || trip.sourceCategory}`;

  return `    <section style="padding: 30px 0 10px 0; background: var(--color-neutral-50);">
      <div class="container">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;">
          <span class="pill pill-copper" style="margin-bottom: 0;">${escapeHtmlText(pillText)}</span>
        </div>
        <h1 class="trek-hero-title" style="font-size: 2.8rem; margin-top: 6px; margin-bottom: 8px; color: var(--color-primary-navy);">${escapeHtmlText(trip.title)}</h1>
        <p style="font-size: 1.15rem; color: var(--color-neutral-600); line-height: 1.7; margin-top: 12px; margin-bottom: 0;">
          ${escapeHtmlText(trip.heroLead)}
          ${trip.heroMore ? `<span id="ebc-more-text" style="display: none;"> ${escapeHtmlText(trip.heroMore)}</span>
          <button id="ebc-toggle-btn" style="background: none; border: none; color: #087F52; font-weight: 700; font-size: 1.05rem; cursor: pointer; padding: 0; margin-left: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; vertical-align: middle;">
            Learn more <span style="font-size: 1.1rem; margin-left: 2px;">→</span>
          </button>` : ''}
        </p>
        ${trip.heroMore ? `<script>
          document.addEventListener('DOMContentLoaded', () => {
            const toggleBtn = document.getElementById('ebc-toggle-btn');
            const moreText = document.getElementById('ebc-more-text');
            if (toggleBtn && moreText) {
              toggleBtn.addEventListener('click', () => {
                const isHidden = moreText.style.display === 'none';
                moreText.style.display = isHidden ? 'inline' : 'none';
                toggleBtn.innerHTML = isHidden ? 'Learn less <span style="font-size: 1.1rem; margin-left: 2px;">↑</span>' : 'Learn more <span style="font-size: 1.1rem; margin-left: 2px;">→</span>';
              });
            }
          });
        </script>` : ''}
      </div>
    </section>

    <!-- Multi-Image Collage Gallery -->
    <div class="container" style="margin-bottom: 24px;">
      <div class="trek-gallery-collage">
        <div class="trek-gallery-main">
          <img src="${imgSrc(0)}" alt="${escapeHtmlAttr(trip.title)} Main Panoramic View">
        </div>
        <div class="trek-gallery-sub">
          <img src="${imgSrc(1)}" alt="${escapeHtmlAttr(trip.title)} Trail View 1" loading="lazy">
        </div>
        <div class="trek-gallery-sub trek-gallery-sub-top-right">
          <img src="${imgSrc(2)}" alt="${escapeHtmlAttr(trip.title)} Trail View 2" loading="lazy">
          <button type="button" class="trek-gallery-see-all-btn">
            <span><svg class="icon-svg icon-xs icon-margin-right" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>See all photos</span>
          </button>
        </div>
        <div class="trek-gallery-sub">
          <img src="${imgSrc(3)}" alt="${escapeHtmlAttr(trip.title)} Landscape View 3" loading="lazy">
        </div>
        <div class="trek-gallery-sub trek-gallery-sub-bottom-right">
          <img src="${imgSrc(4)}" alt="${escapeHtmlAttr(trip.title)} Scenery View 4" loading="lazy">
        </div>
      </div>
    </div>`;
}

function factCard(label, value, iconSvg, extraAttrs = '') {
  return `<div class="trip-fact-item">
            <div style="width: 42px; height: 42px; background: #EAF4ED; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${iconSvg}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-neutral-500); font-weight: 700;">${escapeHtmlText(label)}</span>
              <span style="font-size: 1.05rem; color: var(--color-neutral-800); font-weight: 600;" ${extraAttrs}>${escapeHtmlText(value)}</span>
            </div>
          </div>`;
}

function buildFactsGrid(trip) {
  const f = cleanFactsMap(trip);
  const firstDaySpot = trip.itinerary?.[0]?.title?.split(/[–:\-(]/)[0]?.trim() || 'Kathmandu';
  const lastDaySpot = trip.itinerary?.[trip.itinerary.length - 1]?.title?.split(/[–:\-(]/)[0]?.trim() || 'Kathmandu';
  const trekStartPoint = trip.itinerary?.[1]?.title?.split(/\bto\b/i)?.[1]?.split(/[–(\[]/)[0]?.trim() || firstDaySpot;

  const ICONS = {
    clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    pulse: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    peak: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22L12 2l8 20H4z"/><path d="M9 22l3-7 3 7H9z" fill="#087F52"/></svg>`,
    pin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    compass: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    car: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM3 10h18M7 15h.01M11 15h.01"/></svg>`,
    cup: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>`,
    cal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    globe: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
  };

  const baseItems = [
    factCard('Duration', trip.durationDisplay, ICONS.clock),
    factCard(trip.templateType === 'tour' ? 'Tour Difficulty' : 'Difficulty', f.grade || 'Moderate', ICONS.pulse),
    factCard('Max Altitude', f['max elevation'] || `${trip.maxElevationM.toLocaleString()} m`, ICONS.peak, `data-altitude-m="${trip.maxElevationM}"`),
    factCard('Destination', 'Nepal', ICONS.pin),
    factCard('Activity', f.activity || (trip.templateType === 'tour' ? 'Sightseeing & Tour' : 'Trekking'), ICONS.compass),
    factCard('Accommodation', f.accommodation || 'Hotel, Lodge & Teahouse', ICONS.home),
    factCard('Transport', f.transportation || 'Private Tourist Vehicle / Flight', ICONS.car),
    factCard('Meals', trip.templateType === 'tour' ? 'Breakfast & Package Meals' : 'B.L.D. during trek', ICONS.cup)
  ];

  if (trip.templateType === 'trek') {
    baseItems.push(
      factCard('Season', f['best season'] || 'Spring & Autumn', ICONS.cal),
      factCard('Trek Type', f['treks type'] || 'Teahouse Trek', ICONS.home),
      factCard('Trek Region', trip.regionLabel, ICONS.globe),
      factCard('Route Start Point', smartTruncate(trekStartPoint, 36), ICONS.pin),
      factCard('Package Start Point', 'Kathmandu', ICONS.pin),
      factCard('Package End Point', /departure|kathmandu/i.test(lastDaySpot) ? 'Kathmandu' : smartTruncate(lastDaySpot, 36), ICONS.pin)
    );
  }

  return `<div class="container" style="margin-bottom: 30px;">
      <div style="background: #ffffff; border: 1px solid var(--color-neutral-100); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: 24px 30px;">
        <h2 style="font-size: 1.3rem; margin-bottom: 24px; color: var(--color-primary-navy); display: flex; align-items: center; gap: 8px; font-weight: 700;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary-navy);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg> ${trip.templateType === 'tour' ? 'Key Tour Facts' : 'Key Trip Facts'}</h2>
        <div class="trek-facts-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px 20px;">
          ${baseItems.join('\n          ')}
        </div>
      </div>
    </div>`;
}

function buildOverviewHtml(trip, manifest) {
  const { cleanedOverviewHtml, extractedHighlights } = rewriteInternalLinksAndHighlights(trip.overviewHtml, trip, manifest);
  const highlights = deriveHighlights(trip, extractedHighlights);
  const cards = highlights.map(h => `<div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="color: #087F52; font-weight: 800; font-size: 1.1rem; flex-shrink: 0;">✓</div>
              <div>
                ${h.title ? `<strong style="color: #1B2921; font-size: 0.98rem; display: block;">${escapeHtmlText(h.title)}</strong>
                <span style="font-size: 0.88rem; color: #65736B; line-height: 1.5;">${escapeHtmlText(h.desc)}</span>` : `<span style="font-size: 0.92rem; font-weight: 500; color: #1B2921; line-height: 1.55; display: block;">${escapeHtmlText(h.desc)}</span>`}
              </div>
            </div>`).join('\n            ');

  return `<section id="section-overview" class="trek-detail-section">
            <h2 class="trek-section-title">${trip.templateType === 'tour' ? 'Tour Overview' : 'Trek Overview'}</h2>
            <div style="background: #F7FAF7; border: 1px solid #DDE6DF; border-radius: 16px; padding: 26px; margin: 18px 0 28px;">
              <h3 style="font-size: 1.25rem; color: #1B2921; margin: 0 0 18px 0;">${trip.templateType === 'tour' ? 'Tour Highlights' : 'Trip Highlights'}</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px;">
                ${cards}
              </div>
            </div>
            <div class="trip-overview-prose">
              ${cleanedOverviewHtml || `<p>${escapeHtmlText(cleanSourceCopy(trip.heroLead))}</p>`}
            </div>
          </section>`;
}

function buildItineraryHtml(trip) {
  const dayCards = (trip.itinerary || []).map((d, idx) => {
    const altHtml = d.altitudeM
      ? `Approx. <span data-altitude-m="${d.altitudeM}">${d.altitudeM.toLocaleString()} m / ${Math.round(d.altitudeM * 3.28084).toLocaleString()} ft</span>`
      : escapeHtmlText(trip.regionLabel);
    const metrics = [];
    if (d.walkingTime) metrics.push(`<div class="itinerary-metric-item"><span>Duration: ${escapeHtmlText(d.walkingTime)}</span></div>`);
    if (d.distanceKm) metrics.push(`<div class="itinerary-metric-item"><span>Distance: ${escapeHtmlText(d.distanceKm)}</span></div>`);
    if (d.accommodation) metrics.push(`<div class="itinerary-metric-item"><span>Accommodation: ${escapeHtmlText(d.accommodation)}</span></div>`);

    return `<div class="itinerary-card${idx === 0 ? ' active' : ''}">
                <div class="itinerary-header">
                  <div class="itinerary-header-left">
                    <h4 class="itinerary-day-title-new"><span class="day-label">Day ${d.day}:</span> ${escapeHtmlText(d.title)}</h4>
                    <p class="itinerary-day-subtitle-new">${altHtml}</p>
                  </div>
                  <div class="itinerary-header-right">
                    <div class="itinerary-toggle-btn-new">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
                <div class="itinerary-content"${idx === 0 ? ' style="max-height: 1200px;"' : ''}>
                  <div class="itinerary-content-inner">
                    ${metrics.length ? `<div class="itinerary-metrics-list">${metrics.join('')}</div>` : ''}
                    ${d.meals ? `<div class="itinerary-meta-box"><div class="itinerary-meta-box-item"><span>Meals: ${escapeHtmlText(d.meals)}</span></div></div>` : ''}
                    <div class="itinerary-description">
                      <p>${escapeHtmlText(d.description)}</p>
                    </div>
                  </div>
                </div>
              </div>`;
  }).join('\n              ');

  return `<section id="section-itinerary" class="trek-detail-section">
            <h2 class="trek-section-title">${escapeHtmlText(trip.title)} Itinerary: Day by Day</h2>
            <p style="color: var(--color-neutral-700); font-size: 1.05rem; margin: 14px 0 24px; line-height: 1.7;">
              ${escapeHtmlText(trip.durationDisplay)} program for ${escapeHtmlText(trip.title)}. Daily timings and sequences remain flexible according to weather, flight operations, and group pace.
            </p>
            <div class="itinerary-timeline">
              ${dayCards}
            </div>
          </section>`;
}

function renderIncExcCards(items, isInclude) {
  const iconSvg = isInclude
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper-orange)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 10 11 15 8 12"></polyline></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  return items.map(item => `<div class="inc-exc-card${isInclude ? '' : ' exclude-card'}">
                  <div class="inc-exc-icon-box">${iconSvg}</div>
                  <div class="inc-exc-card-content">
                    <div class="inc-exc-card-title">${escapeHtmlText(item)}</div>
                  </div>
                </div>`).join('\n                ');
}

function sanitizePkgItems(items = [], trip) {
  const isLowlandTour = trip.templateType === 'tour' && Number(trip.maxElevationM || 0) < 3000;
  return items.map(raw => {
    let item = cleanSourceCopy(raw);
    if (!item || /^regular package service\s+(?:includes|excludes)$/i.test(item)) return '';
    if (isLowlandTour) {
      if (/down jacket|sleeping bag|duffel|trekking poles|trekking map|trekking t-shirt/i.test(item)) {
        item = 'Guided excursions, entrance permits, and essential tour logistics per itinerary';
      } else if (/during the mountain|mountain guide|trekking guide|1 assistant guide|TIMS card|from the mountain|extra porter|\bporter\b/i.test(item)) {
        item = item
          .replace(/during the mountain/gi, 'during the tour')
          .replace(/early return from the mountain(?:\s*\(due to any reason\s*\))?\s*th[ae]n the scheduled? itinerary/gi, 'early return from the scheduled tour itinerary')
          .replace(/from the mountain/gi, 'from the scheduled tour')
          .replace(/\(trekking guide\)/gi, '(cultural & safari guide),')
          .replace(/\ban\s+experienced guide about tourism,?\s*culture,?\s*religion,?\s*mountain,?\s*trekkers,?\s*/gi, 'experienced in local culture, heritage, and wildlife, ')
          .replace(/experienced guide about tourism,?\s*culture,?\s*religion,?\s*mountain,?\s*trekkers,?\s*/gi, 'experienced in local culture, heritage, and wildlife, ')
          .replace(/1 assistant guide \(Sherpa\) porter to carry luggage\s*\(2 trekkers\s*:\s*1 porter\s*\)\s*including/gi, 'and dedicated support team including')
          .replace(/All kind of necessary paperwork\s*TIMS card,?\s*national park permit/gi, 'All necessary paperwork and national park & monument entrance permits')
          .replace(/\bTIMS card,?\s*/gi, '')
          .replace(/,?\s*extra porter\b/gi, '')
          .replace(/(?:mountain|local) guide,?\s*and porter,?\s*driver,?\s*hotel staff/gi, 'local guide, driver, and hotel staff')
          .replace(/mountain guide,?\s*and porter,?\s*driver/gi, 'local guide, and driver')
          .replace(/local guide,?\s*and porter,?\s*driver/gi, 'local guide, and driver')
          .replace(/\bSupport staff\s*\/\s*porter\b/gi, 'Local support staff')
          .replace(/,?\s*\bporter\b/gi, '')
          .replace(/mountain guide/gi, 'local guide');
      }
    }
    return cleanSourceCopy(item);
  }).filter((v, i, arr) => v && arr.indexOf(v) === i);
}

function buildIncludesHtml(trip) {
  const rawPkgs = trip.packagesCost?.length
    ? trip.packagesCost
    : [{
        key: 'regular',
        title: 'Regular Package',
        priceText: trip.pricing?.primaryPriceUsd ? `USD $${trip.pricing.primaryPriceUsd.toLocaleString()}` : 'Price on Request',
        includes: [
          'Airport arrival and departure transfers by private tourist vehicle',
          `Accommodation (${cleanSourceCopy(trip.facts?.accommodation || 'Hotels & lodges')}) as outlined in itinerary`,
          'Licensed English-speaking guide and essential logistical support',
          'Necessary local permits and applicable government taxes'
        ],
        excludes: [
          'International airfare and Nepal entry visa fees',
          trip.templateType === 'tour' ? 'Comprehensive personal travel insurance' : 'Comprehensive travel and high-altitude rescue insurance',
          'Personal equipment, snacks, drinks, and crew tips'
        ]
      }];
  const pkgs = rawPkgs.map(p => ({
    ...p,
    includes: sanitizePkgItems(p.includes, trip),
    excludes: sanitizePkgItems(p.excludes, trip)
  }));

  const tabBar = pkgs.length > 1
    ? `<div class="pkg-cost-tabs">${pkgs.map((p, i) => `<button type="button" class="pkg-cost-tab-btn${i === 0 ? ' active' : ''}" data-pkg-tab="${escapeHtmlAttr(p.key)}">${escapeHtmlText(p.title)}</button>`).join('')}</div>`
    : '';

  const panels = pkgs.map((p, i) => `<div class="pkg-cost-panel${i === 0 ? ' active' : ''}" data-pkg-panel="${escapeHtmlAttr(p.key)}">
              <div class="inc-exc-section-title-wrapper">
                <h2 class="inc-exc-section-title">What is Included (${escapeHtmlText(p.title)})</h2>
                <div style="width: 48px; height: 4px; background: var(--color-copper-orange); border-radius: 2px; margin-top: 8px;"></div>
              </div>
              <div class="inc-exc-grid">${renderIncExcCards(p.includes, true)}</div>
              <div class="inc-exc-section-title-wrapper">
                <h2 class="inc-exc-section-title">What is Excluded</h2>
                <div style="width: 48px; height: 4px; background: #ef4444; border-radius: 2px; margin-top: 8px;"></div>
              </div>
              <div class="inc-exc-grid">${renderIncExcCards(p.excludes, false)}</div>
            </div>`).join('\n');

  return `<section id="section-includes" class="trek-detail-section">
            <div class="inc-exc-container">
              ${tabBar}
              ${panels}
            </div>
          </section>`;
}

function buildDatesHtml(trip) {
  const priceDisplay = trip.pricing?.primaryPriceUsd
    ? `$${trip.pricing.primaryPriceUsd.toLocaleString()} pp`
    : 'Price on Request';

  if (trip.templateType === 'tour') {
    const depRows = trip.liveAvailability?.length
      ? trip.liveAvailability.slice(0, 5)
      : [
          { startDate: '15 Oct 2026', month: 'OCT', year: '2026', status: 'Guaranteed' },
          { startDate: '05 Nov 2026', month: 'NOV', year: '2026', status: 'Available' },
          { startDate: '10 Mar 2027', month: 'MAR', year: '2027', status: 'Available' }
        ];
    return `<section id="section-dates" class="trek-detail-section" style="margin-bottom: 36px;">
              <h2 class="trek-section-title" style="font-size: 1.8rem; color: #1B2921; margin-bottom: 16px;">Dates & Availability</h2>
              <div style="background: #FFFFFF; border: 1px solid #DDE6DF; border-radius: 16px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.92rem;">
                  <thead>
                    <tr style="background: #F7FAF7; border-bottom: 1px solid #DDE6DF; color: #4B5951;">
                      <th style="padding: 14px 20px;">Start Date</th>
                      <th style="padding: 14px 20px;">Duration</th>
                      <th style="padding: 14px 20px;">Status</th>
                      <th style="padding: 14px 20px;">Price</th>
                      <th style="padding: 14px 20px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${depRows.map(r => `<tr style="border-bottom: 1px solid #EFF3EF;">
                      <td style="padding: 14px 20px; font-weight: 700; color: #1B2921;">${escapeHtmlText(r.startDate)}</td>
                      <td style="padding: 14px 20px; color: #65736B;">${escapeHtmlText(trip.durationDisplay)}</td>
                      <td style="padding: 14px 20px;"><span style="background: #F0F7F1; color: #066A45; font-weight: 800; font-size: 0.78rem; padding: 4px 10px; border-radius: 50px;">${escapeHtmlText(r.status)}</span></td>
                      <td style="padding: 14px 20px; font-weight: 800; color: #1B2921;">${escapeHtmlText(priceDisplay)}</td>
                      <td style="padding: 14px 20px; text-align: right;"><button type="button" class="btn btn-primary open-inquiry-btn" data-trek-title="${escapeHtmlAttr(trip.title)} (${escapeHtmlAttr(r.startDate)})" style="padding: 6px 14px; font-size: 0.82rem;">Inquire</button></td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </section>`;
  }

  const rows = trip.liveAvailability?.length
    ? trip.liveAvailability.slice(0, 6)
    : [
        { month: 'OCT', startDate: 'Oct 10, 2026', status: 'AVAILABLE' },
        { month: 'NOV', startDate: 'Nov 04, 2026', status: 'AVAILABLE' },
        { month: 'MAR', startDate: 'Mar 15, 2027', status: 'AVAILABLE' },
        { month: 'APR', startDate: 'Apr 08, 2027', status: 'AVAILABLE' }
      ];
  const months = [...new Set(rows.map(r => r.month))];

  return `<section id="section-dates" class="trek-detail-section">
            <div class="dates-section-header">
              <h2 class="trek-section-title" style="margin-bottom: 0;">Booking Dates & Availability</h2>
              <div class="dates-mode-toggle">
                <button type="button" class="dates-mode-btn active" data-mode="group">Group Joining</button>
                <button type="button" class="dates-mode-btn" data-mode="private">Private Date</button>
              </div>
            </div>
            <div class="dates-card-container">
              <div id="dates-group-view" class="dates-view-pane active">
                <div class="dates-group-topbar">
                  <span class="dates-year-badge">2026–2027</span>
                  <div class="dates-month-tabs">
                    ${months.map((m, i) => `<button type="button" class="dates-month-tab${i === 0 ? ' active' : ''}" data-month="${escapeHtmlAttr(m)}">${escapeHtmlText(m)}</button>`).join('')}
                  </div>
                </div>
                <div class="dates-departure-list">
                  ${rows.map((r, i) => `<div class="departure-item-row" data-month="${escapeHtmlAttr(r.month)}"${r.month !== months[0] ? ' style="display: none;"' : ''}>
                    <div class="departure-date-badge">
                      <div class="calendar-day-num">${String(i + 1).padStart(2, '0')}</div>
                      <div class="calendar-month-txt">${escapeHtmlText(r.month)}</div>
                    </div>
                    <div class="departure-info">
                      <div class="departure-title">${escapeHtmlText(r.startDate)} • ${escapeHtmlText(trip.durationDisplay)}</div>
                      <span class="departure-status-pill">${escapeHtmlText(r.status.toUpperCase())}</span>
                    </div>
                    <div class="departure-action">
                      <div class="departure-price"><span class="price-val">${escapeHtmlText(priceDisplay)}</span></div>
                      <button type="button" class="btn-book-now open-inquiry-btn" data-trek-title="${escapeHtmlAttr(trip.title)} (${escapeHtmlAttr(r.startDate)})">Book Now</button>
                    </div>
                  </div>`).join('')}
                </div>
              </div>
              <div id="dates-private-view" class="dates-view-pane" style="display: none;">
                <div class="private-dates-header">
                  <div>
                    <h3 class="private-dates-title">Choose Your Private Departure</h3>
                    <p class="private-dates-desc">Select your preferred start date for this ${escapeHtmlText(trip.durationDisplay)} ${escapeHtmlText(trip.title)} itinerary.</p>
                  </div>
                </div>
                <div class="dual-calendar-card">
                  <div id="dual-calendar-mount" class="dual-calendar-mount" data-duration="${trip.durationDays}"></div>
                </div>
                <div class="private-dates-action-bar">
                  <span id="private-selected-date-text" class="private-selected-prompt">Select a start date from the calendar.</span>
                  <button type="button" id="btn-select-private-date" class="btn-select-dates open-inquiry-btn" data-base-title="${escapeHtmlAttr(trip.title)}" data-trek-title="${escapeHtmlAttr(trip.title)} Private" disabled>Select dates ↗</button>
                </div>
              </div>
            </div>
          </section>`;
}

function buildPackingHtml(trip, gearProfiles) {
  const key = selectGearProfileKey(trip);
  const profile = gearProfiles[key] || gearProfiles['teahouse-low'];
  const totalCount = profile.categories.reduce((sum, c) => sum + c.items.length, 0);

  const sections = profile.categories.map(cat => `<div class="gear-section">
              <h3 class="gear-section-title">${escapeHtmlText(cat.title)} <span style="font-size: 0.85rem; font-weight: normal; color: var(--color-neutral-500); margin-left: 6px;">(${cat.items.length} items)</span></h3>
              <div class="gear-grid">
                ${cat.items.map(item => `<div class="gear-item-row" onclick="this.querySelector('input').click(); event.stopPropagation();">
                  <input type="checkbox" id="${escapeHtmlAttr(item.id)}" class="gear-item-checkbox" onclick="event.stopPropagation();">
                  <span class="gear-item-label">${escapeHtmlText(item.name)}</span>
                  <span class="gear-item-desc">${escapeHtmlText(item.desc)} • <strong>${escapeHtmlText(item.qty)}</strong></span>
                </div>`).join('')}
              </div>
            </div>`).join('\n');

  return `<section id="section-packing" class="trek-detail-section">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap;">
              <div>
                <h2 class="trek-section-title" style="margin-bottom: 8px;">Packing List for ${escapeHtmlText(trip.title)}</h2>
                <span style="font-size: 0.95rem; color: var(--color-neutral-600); font-weight: 500;">${escapeHtmlText(profile.rentalNote)}</span>
              </div>
              <div class="itinerary-meta-pill" style="font-size: 1rem; padding: 8px 18px; background: var(--color-glacier-bg); color: var(--color-primary-navy); border-radius: 12px; font-weight: 700;">
                Packed: <strong><span class="gear-checked-count">0</span> / <span class="gear-total-count">${totalCount}</span></strong>
              </div>
            </div>
            ${sections}
          </section>`;
}

function buildDetailsHtml(trip) {
  const f = trip.facts || {};
  const cards = [
    {
      id: 'accommodation',
      title: `Accommodation & Meals (${f.accommodation || 'Hotel & Teahouse'})`,
      body: `<p>Accommodation follows the package grade (${escapeHtmlText(f.accommodation || 'Hotel, Lodge & Teahouse')}) in Kathmandu and along the ${escapeHtmlText(trip.regionLabel)} route. Check your package Includes section for included meals and Kathmandu hotel nights.</p>`
    },
    {
      id: 'permits',
      title: 'Permits & Local Logistics',
      body: `<p>Transportation is arranged via ${escapeHtmlText(f.transportation || 'private vehicle / scheduled domestic transport')}. Applicable permits listed in the package inclusions are arranged by Nepal Unique Treks prior to departure.</p>`
    },
    {
      id: 'difficulty',
      title: `Route Difficulty & Elevation (${f['max elevation'] || `${trip.maxElevationM} m`})`,
      body: `<p>${escapeHtmlText(trip.title)} is rated <strong>${escapeHtmlText(f.grade || 'Moderate')}</strong> with a maximum elevation of <strong>${escapeHtmlText(f['max elevation'] || `${trip.maxElevationM} m`)}</strong>. Follow your guide's pacing and stay hydrated throughout the ${escapeHtmlText(trip.durationDisplay)} itinerary.</p>`
    },
    {
      id: 'season',
      title: `Best Time to Visit (${f['best season'] || 'Spring & Autumn'})`,
      body: `<p>Recommended operating season on the source page: <strong>${escapeHtmlText(f['best season'] || 'Spring & Autumn')}</strong>. ${trip.usefulInfoHtml ? 'Additional official notes from the source page follow below.' : ''}</p>${trip.usefulInfoHtml ? `<div class="trip-overview-prose">${trip.usefulInfoHtml}</div>` : ''}`
    }
  ];

  const cardsHtml = cards.map((c, idx) => `<div class="detail-accordion-card${idx === 0 ? ' active' : ''}" data-detail-id="${c.id}">
                  <div class="detail-accordion-header">
                    <div class="detail-accordion-header-left">
                      <h3 class="detail-accordion-title">${escapeHtmlText(c.title)}</h3>
                    </div>
                    <div class="detail-accordion-chevron">∨</div>
                  </div>
                  <div class="detail-accordion-content"${idx === 0 ? ' style="max-height: 1200px;"' : ''}>
                    <div class="detail-accordion-content-inner">${c.body}</div>
                  </div>
                </div>`).join('\n                ');

  return `<section id="section-details" class="trek-detail-section">
            <div class="details-section-container">
              <div class="details-title-wrapper">
                <h2 class="details-main-title">Read before you book: ${escapeHtmlText(trip.title)}</h2>
                <div style="width: 48px; height: 4px; background: var(--color-copper-orange); border-radius: 2px; margin-top: 8px;"></div>
              </div>
              <p class="details-subtitle-text">Practical logistics derived directly from this package's route facts, inclusions, and elevation profile.</p>
              <div class="detail-accordion-list">${cardsHtml}</div>
            </div>
          </section>`;
}

function buildMapHtml(trip) {
  const mapQuery = encodeURIComponent(`${trip.title} ${trip.regionLabel} Nepal`);
  if (trip.mapImage) {
    return `<section id="section-map" class="trek-detail-section">
            <div class="details-title-wrapper" style="margin-bottom: 24px;">
              <h2 class="details-main-title">${escapeHtmlText(trip.title)} Route Map</h2>
              <div style="width: 48px; height: 4px; background: var(--color-copper-orange); border-radius: 2px; margin-top: 8px;"></div>
            </div>
            <div class="route-map-image-frame" style="margin-bottom: 35px;">
              <img src="${cleanAssetUrl(trip.mapImage)}" alt="${escapeHtmlAttr(trip.title)} Route Map" loading="lazy">
            </div>
          </section>`;
  }

  const keyStops = (trip.itinerary || [])
    .filter((d, i, arr) => i === 0 || i === arr.length - 1 || i === Math.floor(arr.length / 2) || arr.length <= 6)
    .slice(0, 6);

  return `<section id="section-map" class="trek-detail-section">
            <div class="details-title-wrapper" style="margin-bottom: 24px;">
              <h2 class="details-main-title">${escapeHtmlText(trip.title)} Route & Area Overview</h2>
              <div style="width: 48px; height: 4px; background: var(--color-copper-orange); border-radius: 2px; margin-top: 8px;"></div>
            </div>
            <div class="route-corridor-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
                <div>
                  <strong style="font-size: 1.08rem; color: #1B2921; display: block;">${escapeHtmlText(trip.regionLabel)} Corridor • ${escapeHtmlText(trip.durationDisplay)}</strong>
                  <span style="font-size: 0.9rem; color: #535655;">Max Elevation: ${trip.maxElevationM.toLocaleString()} m • Start/End: Kathmandu</span>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="white-space: nowrap;">Open Area on Google Maps ↗</a>
              </div>
              ${keyStops.length ? `<div class="route-corridor-stops">${keyStops.map(s => `<div class="route-corridor-stop"><span class="route-corridor-day">Day ${s.day}</span><span class="route-corridor-name">${escapeHtmlText(smartTruncate(s.title, 48))}</span></div>`).join('')}</div>` : ''}
            </div>
          </section>`;
}

function buildFaqsHtml(trip) {
  const f = trip.facts || {};
  const sourceFaqs = trip.liveFaqs?.length
    ? trip.liveFaqs
    : [
        {
          question: `How long does ${trip.title} take?`,
          answer: `This package runs for ${trip.durationDisplay} following the scheduled day-by-day itinerary.`
        },
        {
          question: `What is the difficulty and maximum elevation?`,
          answer: `Grade is ${f.grade || 'Moderate'} and the maximum elevation reached is ${f['max elevation'] || `${trip.maxElevationM} m`}.`
        },
        {
          question: `What type of accommodation and transport is arranged?`,
          answer: `Accommodation uses ${f.accommodation || 'Hotels & Mountain Lodges'} and transportation includes ${f.transportation || 'private vehicles and/or domestic flights per itinerary'}.`
        },
        {
          question: `When is the best season for ${trip.title}?`,
          answer: `Recommended operating window is ${f['best season'] || 'Spring (March–May) and Autumn (September–November)'}.`
        },
        {
          question: `How much does ${trip.title} cost?`,
          answer: trip.pricing?.primaryPriceUsd
            ? `The package starting rate is USD $${trip.pricing.primaryPriceUsd.toLocaleString()} per person (${trip.pricing.priceSource}).`
            : 'Pricing is tailored by group size and season. Click Request Custom Quote for an exact breakdown.'
        }
      ];

  const itemsHtml = sourceFaqs.map(q => `<div class="faq-item">
                    <div class="faq-item-question">
                      <h3 class="faq-question-title">${escapeHtmlText(q.question)}</h3>
                      <span class="faq-toggle-circle">∨</span>
                    </div>
                    <div class="faq-item-answer">${escapeHtmlText(q.answer)}</div>
                  </div>`).join('\n                  ');

  return `<section id="section-faqs" class="trek-detail-section">
            <h2 class="faq-section-accent-title">
              <span class="faq-accent-bar"></span>
              Frequently Asked Questions for ${escapeHtmlText(trip.title)}
            </h2>
            <div class="faq-layout-container" style="grid-template-columns: 1fr;">
              <div class="faq-content-panel">
                <div class="faq-category-content active" id="faq-cat-general" style="display: block;">
                  ${itemsHtml}
                </div>
              </div>
            </div>
          </section>`;
}

function buildBookingSidebarHtml(trip) {
  const p = trip.pricing || {};
  const isPor = p.priceOnRequest || !p.primaryPriceUsd;
  const priceBlock = isPor
    ? `<div style="margin-bottom: 16px;">
              <span class="trip-price-request-badge">Price on Request</span>
              <div style="font-size: 0.92rem; color: #4B5951; margin-top: 8px; font-weight: 600;">${escapeHtmlText(trip.durationDisplay)} • Custom / Private Group</div>
            </div>`
    : `<span style="font-size: 0.75rem; font-weight: 800; color: #4B5951; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">FROM</span>
            <div style="display: flex; align-items: baseline; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;">
              <span style="font-size: 2.5rem; font-weight: 800; color: #1B2921; line-height: 1;">$${p.primaryPriceUsd.toLocaleString()}</span>
              <span style="font-size: 0.92rem; color: #65736B; font-weight: 500;">/ person</span>
              <a href="#section-itinerary" style="font-size: 0.92rem; color: #4B5951; font-weight: 600; text-decoration: underline; margin-left: 4px;">${escapeHtmlText(trip.durationDisplay)}</a>
            </div>
            ${p.luxuryPriceUsd ? `<div style="font-size: 0.85rem; color: #176B4B; font-weight: 700; margin-bottom: 14px;">Luxury Package option: US$${p.luxuryPriceUsd.toLocaleString()} pp</div>` : ''}
            ${p.groupTiers?.length ? `<div style="margin-bottom: 16px; background: #F7FAF7; border-radius: 10px; padding: 12px; font-size: 0.85rem; border: 1px solid #DDE6DF;">
              ${p.groupTiers.map(t => `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span style="color: #65736B;">${escapeHtmlText(t.label)}</span><strong style="color: #1B2921;">$${t.priceUsd.toLocaleString()} / pp</strong></div>`).join('')}
            </div>` : ''}`;

  const primaryBtnText = isPor ? 'Request Custom Quote' : 'Book Now';

  return `<div class="sidebar-booking-card">
            ${priceBlock}
            <button type="button" class="btn open-inquiry-btn" data-trek-title="${escapeHtmlAttr(trip.title)}" style="width: 100%; padding: 14px; background: #087F52; color: #FFFFFF; border: none; border-radius: 50px; font-size: 1.05rem; font-weight: 800; cursor: pointer; margin-bottom: 12px;">${primaryBtnText}</button>
            <button type="button" class="btn open-inquiry-btn" data-trek-title="${escapeHtmlAttr(trip.title)} Inquiry" style="width: 100%; padding: 12px; background: #FFFFFF; color: #1B2921; border: 1px solid #C7D3CB; border-radius: 50px; font-size: 0.98rem; font-weight: 700; cursor: pointer; margin-bottom: 22px;">Make an Enquiry</button>
            <ul style="list-style: none; padding: 0; margin: 0 0 20px 0; display: flex; flex-direction: column; gap: 11px;">
              <li style="font-size: 0.9rem; font-weight: 600; color: #34463C;">✦ Licensed Local Himalayan Guides</li>
              <li style="font-size: 0.9rem; font-weight: 600; color: #34463C;">✦ Customizable Dates & Group Pricing</li>
              <li style="font-size: 0.9rem; font-weight: 600; color: #34463C;">✦ No Hidden Fees & Transparent Terms</li>
            </ul>
            <div style="border-top: 1px dashed #C7D3CB; padding-top: 16px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; color: #65736B; text-transform: uppercase; display: block;">INSTANT HELP</span>
                <strong style="font-size: 1.05rem; font-weight: 800; color: #1B2921;">+977 9851023285</strong>
              </div>
              <a href="https://wa.me/9779851023285" target="_blank" rel="noopener" style="padding: 8px 14px; border-radius: 999px; background: #25D366; color: #FFFFFF; font-weight: 700; text-decoration: none; font-size: 0.85rem;">WhatsApp</a>
            </div>
          </div>`;
}

function buildYmlHtml(trip, manifest) {
  const siblings = manifest.packages
    .filter(p => !p.deferred && p.sourceSlug !== trip.sourceSlug && p.targetDir !== trip.targetDir)
    .sort((a, b) => {
      const aMatch = a.sourceCategory === trip.sourceCategory ? 1 : 0;
      const bMatch = b.sourceCategory === trip.sourceCategory ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 3);

  const cards = siblings.map(s => `<a href="../../${s.targetDir}/" class="yml-card">
          <div class="yml-card-body">
            <span class="yml-card-badge" style="position: static; display: inline-block; margin-bottom: 10px;">${escapeHtmlText(s.regionLabel)}</span>
            <h3 class="yml-card-title">${escapeHtmlText(s.serviceName)}</h3>
            <div class="yml-card-footer">
              <div class="yml-card-price">
                <span class="yml-price-label">${escapeHtmlText(s.csvDurationRaw)}</span>
                <span class="yml-price-value">${s.csvPriceUsd ? `US$ <strong>${s.csvPriceUsd.toLocaleString()}</strong>` : 'Price on Request'}</span>
              </div>
              <span class="yml-view-trip-btn">View Trip →</span>
            </div>
          </div>
        </a>`).join('\n        ');

  return `<section class="you-might-like-section">
      <div class="container">
        <div class="yml-header">
          <span class="yml-pill-tag">MORE ADVENTURES</span>
          <div class="yml-title-row">
            <span class="yml-accent-bar"></span>
            <h2 class="yml-title">You might also like</h2>
          </div>
        </div>
        <div class="yml-cards-grid">${cards}</div>
      </div>
    </section>`;
}

function buildPage(entry, trip, templateHtml, gearProfiles, manifest) {
  const canonicalUrl = `https://namastehikingtrek.com/${entry.targetDir}/`;
  const ogImg = `https://namastehikingtrek.com/${encodeAssetPath(trip.galleryImages?.[0] || 'images/logo.png')}`;
  const chartJson = JSON.stringify({
    key: trip.sourceSlug,
    name: trip.chartSeries.name,
    weatherTitle: trip.chartSeries.weatherTitle,
    points: trip.chartSeries.points,
    weatherPoints: trip.chartSeries.weatherPoints
  });

  const mobileFloatCta = trip.pricing?.primaryPriceUsd
    ? `<a href="#booking-inquiry" class="mobile-book-cta open-inquiry-btn" data-trek-title="${escapeHtmlAttr(trip.title)}">Book This Trip — From $${trip.pricing.primaryPriceUsd.toLocaleString()}</a>`
    : `<a href="#booking-inquiry" class="mobile-book-cta open-inquiry-btn" data-trek-title="${escapeHtmlAttr(trip.title)}">Request Quote — ${escapeHtmlText(trip.title)}</a>`;

  const inquiryModalHtml = `<div id="inquiry-modal" class="modal-overlay">
      <div class="modal-card">
        <button class="modal-close" id="modal-close-btn">&times;</button>
        <h3 style="font-size: 1.5rem; margin-bottom: 6px;">Inquire About ${escapeHtmlText(trip.title)}</h3>
        <p style="font-size: 0.9rem; color: var(--color-neutral-600); margin-bottom: 20px;">Fill out this quick form and our lead Himalayan guide will respond within 4 hours.</p>
        <form id="inquiry-form">
          <div class="form-group"><label class="form-label" for="inq-name">Full Name *</label><input type="text" id="inq-name" class="form-input" required></div>
          <div class="form-group"><label class="form-label" for="inq-email">Email Address *</label><input type="email" id="inq-email" class="form-input" required></div>
          <div class="form-group" style="margin-bottom: 20px;"><label class="form-label" for="inq-notes">Preferred Start Date & Questions</label><textarea id="inq-notes" class="form-textarea" rows="3"></textarea></div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">Submit Booking Inquiry</button>
        </form>
      </div>
    </div>`;

  const replacements = {
    '{{SEO_TITLE}}': escapeHtmlText(trip.seoTitle),
    '{{META_DESCRIPTION}}': escapeHtmlAttr(trip.metaDescription),
    '{{CANONICAL_URL}}': escapeHtmlAttr(canonicalUrl),
    '{{OG_IMAGE}}': escapeHtmlAttr(ogImg),
    '{{TREK_KEY}}': escapeHtmlAttr(trip.sourceSlug),
    '{{HERO_SECTION}}': buildHeroHtml(trip),
    '{{FACTS_GRID}}': buildFactsGrid(trip),
    '{{OVERVIEW_SECTION}}': buildOverviewHtml(trip, manifest),
    '{{ITINERARY_SECTION}}': buildItineraryHtml(trip),
    '{{INCLUDES_SECTION}}': buildIncludesHtml(trip),
    '{{DATES_SECTION}}': buildDatesHtml(trip),
    '{{PACKING_SECTION}}': buildPackingHtml(trip, gearProfiles),
    '{{DETAILS_SECTION}}': buildDetailsHtml(trip),
    '{{ALTITUDE_SECTION}}': `<section id="section-altitude-profile" class="trek-detail-section">
            <div class="details-title-wrapper" style="margin-bottom: 24px;">
              <h2 class="details-main-title">Altitude Profile of ${escapeHtmlText(trip.title)}</h2>
              <div style="width: 48px; height: 4px; background: var(--color-copper-orange); border-radius: 2px; margin-top: 8px;"></div>
            </div>
            <div style="background: white; padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--color-neutral-100); box-shadow: var(--shadow-sm); margin-bottom: 30px;">
              <div id="altitude-chart-wrapper" data-trek-key="${escapeHtmlAttr(trip.sourceSlug)}"></div>
            </div>
          </section>`,
    '{{WEATHER_SECTION}}': `<section id="section-weather" class="trek-detail-section">
            <div class="details-title-wrapper" style="margin-bottom: 24px;">
              <h2 class="details-main-title">Weather on ${escapeHtmlText(trip.title)}</h2>
              <div style="width: 48px; height: 4px; background: var(--color-copper-orange); border-radius: 2px; margin-top: 8px;"></div>
            </div>
            <div style="background: white; padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--color-neutral-100); box-shadow: var(--shadow-sm); margin-bottom: 30px;">
              <div id="weather-chart-wrapper" data-trek-key="${escapeHtmlAttr(trip.sourceSlug)}"></div>
            </div>
          </section>`,
    '{{MAP_SECTION}}': buildMapHtml(trip),
    '{{BOOKING_SECTION}}': `<section id="section-booking" class="trek-detail-section">
            <h2 class="trek-section-title">${trip.templateType === 'tour' ? 'Book This Tour' : 'Book This Trek'}</h2>
            <p style="color: var(--color-neutral-700); font-size: 1.05rem; line-height: 1.7;">Contact our Kathmandu coordinators using the booking panel for private or fixed-group departures.</p>
          </section>`,
    '{{REVIEWS_SECTION}}': `<section id="section-reviews" class="trek-detail-section">
            <h2 class="trek-section-title">Trip Feedback</h2>
            <p>Explore verified traveller stories or leave feedback on Nepal Unique Treks.</p>
            <a class="btn btn-primary" href="https://www.nepaluniquetreks.com/" target="_blank" rel="noopener noreferrer">Visit Nepal Unique Treks</a>
          </section>`,
    '{{FAQS_SECTION}}': buildFaqsHtml(trip),
    '{{BOOKING_SIDEBAR}}': buildBookingSidebarHtml(trip),
    '{{INQUIRY_MODAL}}': inquiryModalHtml,
    '{{YML_SECTION}}': buildYmlHtml(trip, manifest),
    '{{TRIP_CHART_JSON}}': chartJson.replace(/</g, '\\u003c'),
    '{{MOBILE_FLOAT_CTA}}': mobileFloatCta
  };

  let out = templateHtml;
  for (const [token, val] of Object.entries(replacements)) {
    out = out.split(token).join(val);
  }
  return out;
}

const manifest = loadTripManifest();
const gearProfiles = loadGearProfiles();
const targets = parseTripFilterArgs();
if (!targets || !targets.length) {
  console.error('Usage: node scripts/build-trips.mjs --only <slug1,slug2> | --batch <N> | --all');
  process.exit(1);
}

const trekTemplate = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'trek-package.html'), 'utf8');
const tourTemplate = fs.readFileSync(path.join(REPO_ROOT, 'templates', 'tour-package.html'), 'utf8');

for (const entry of targets) {
  const jsonPath = path.join(REPO_ROOT, 'content', 'trips', `${entry.sourceSlug}.json`);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Missing extracted trip data: ${jsonPath}. Run fetch-trip.mjs first.`);
  }
  const trip = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const tpl = entry.templateType === 'tour' ? tourTemplate : trekTemplate;
  const html = buildPage(entry, trip, tpl, gearProfiles, manifest);

  const outFile = path.join(REPO_ROOT, entry.targetHtmlPath);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`BUILT ${entry.targetHtmlPath} (${entry.templateType}, ${(html.length / 1024).toFixed(1)} KB)`);
}
