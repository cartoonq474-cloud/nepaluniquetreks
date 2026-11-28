import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  cleanArticleBodyHtml,
  decodeHtmlEntities,
  encodeAssetPath,
  escapeHtmlAttr,
  escapeHtmlText,
  htmlToNormalizedPlainText,
  removeBalancedBlock
} from './blog-utils.mjs';

export {
  REPO_ROOT,
  decodeHtmlEntities,
  encodeAssetPath,
  escapeHtmlAttr,
  escapeHtmlText,
  htmlToNormalizedPlainText
};

export function cleanSourceCopy(str = '') {
  return String(str || '')
    .replace(/\bPrivet\b/gi, m => (m[0] === 'P' ? 'Private' : 'private'))
    .replace(/\bAccomodation\b/gi, m => (m[0] === 'A' ? 'Accommodation' : 'accommodation'))
    .replace(/\bInternatoional\b/gi, 'International')
    .replace(/\bpripration\b/gi, 'preparation')
    .replace(/\bdomestice\b/gi, 'domestic')
    .replace(/\bProfesnal\b/gi, 'Professional')
    .replace(/\blicen\s*holder\b/gi, 'licensed')
    .replace(/\bSagarmatah\b/gi, 'Sagarmatha')
    .replace(/\btrekking\s*polls?\b/gi, 'trekking poles')
    .replace(/\bpoals\b/gi, 'poles')
    .replace(/\bbottel\b/gi, 'bottle')
    .replace(/\baccdent\b/gi, 'accident')
    .replace(/\bevaiputation\b/gi, 'evacuation')
    .replace(/\bHospitam\b/gi, 'Hospital')
    .replace(/\bpersion\b/gi, 'person')
    .replace(/\bMinaral\b/gi, 'Mineral')
    .replace(/\bComunity\b/gi, 'Community')
    .replace(/\bwell\s+come\b/gi, 'welcome')
    .replace(/\bpaper\s+work\b/gi, 'paperwork')
    .replace(/\btimes\s+card\b/gi, 'TIMS card')
    .replace(/\beatery\s+visa\b/gi, 'entry visa')
    .replace(/\bafter\s+tripe\b/gi, 'after trip')
    .replace(/\btothe\b/gi, 'to the')
    .replace(/\bSailun,g\b/gi, 'Sailung')
    .replace(/([a-z])\.([A-Z])/g, '$1. $2')
    .replace(/\s+\.(?=[a-zA-Z])/g, ' ')
    .replace(/\.jungle\b/gi, 'jungle')
    .replace(/Hotel\.\s*Lodge\s*\.?\s*Tea\s*House/gi, 'Hotel, Lodge & Tea House')
    .replace(/Hotel\.\s*Lodge\s*\.?\s*Homestay/gi, 'Hotel, Lodge & Homestay')
    .replace(/Flight\.\s*Priv(?:et|ate)\s*Car/gi, 'Flight & Private Car')
    .replace(/,\s*And\b/g, ' &')
    .replace(/\bAdventures\b/g, 'Adventurous')
    .replace(/\b(?:seasonable|Sessional)\b/gi, m => (m[0] === 'S' ? 'Seasonal' : 'seasonal'))
    .replace(/\bSessionable\b/gi, 'Seasonal')
    .replace(/Seasonal fresh fruits,\s*After dinner/gi, 'Seasonal fresh fruits after dinner')
    .replace(/\bPersnal\b/gi, 'Personal')
    .replace(/\bsnaks\b/gi, 'snacks')
    .replace(/\bsafty\b/gi, 'safety')
    .replace(/\bdesert\b/gi, 'dessert')
    .replace(/\bAppriciated\b/gi, 'Appreciated')
    .replace(/\bNessecery\b/gi, 'Necessary')
    .replace(/\bTishert\b/gi, 'T-shirt')
    .replace(/Nepal'?s unique treks\b/gi, 'Nepal Unique Treks')
    .replace(/\b3\s*star\b/gi, '3-star')
    .replace(/\brs\s*:\s*(\d+)/gi, 'NPR $1')
    .replace(/\b(?:incase|encase)\b/gi, 'in case')
    .replace(/\bYou have won food\b/gi, 'Your own meals')
    .replace(/\bthen the (scheduled? itinerary)\b/gi, 'than the $1')
    .replace(/\s*--\s*expected\.?\s*as an award/gi, ' (expected appreciation)')
    .replace(/\s*etc:/gi, ', etc.')
    .replace(/([a-zA-Z]),([a-zA-Z])/g, '$1, $2')
    .replace(/,,+\s*/g, ', ')
    .replace(/\(([^()]+,\s*etc\.)(?!\))/gi, '($1)')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function loadTripManifest() {
  const manifestPath = path.join(REPO_ROOT, 'content', 'trip-manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function loadGearProfiles() {
  const gearPath = path.join(REPO_ROOT, 'content', 'gear-profiles.json');
  return JSON.parse(fs.readFileSync(gearPath, 'utf8')).profiles;
}

export function parseTripFilterArgs(argv = process.argv.slice(2)) {
  const manifest = loadTripManifest();
  const activePackages = manifest.packages.filter(p => !p.deferred);

  const onlyIdx = argv.indexOf('--only');
  if (onlyIdx !== -1 && argv[onlyIdx + 1]) {
    const tokens = argv[onlyIdx + 1].split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return activePackages.filter(
      p => tokens.includes(p.sourceSlug.toLowerCase()) || tokens.includes(p.targetDir.toLowerCase())
    );
  }

  const batchIdx = argv.indexOf('--batch');
  if (batchIdx !== -1 && argv[batchIdx + 1]) {
    const batchNum = Number(argv[batchIdx + 1]);
    return activePackages.filter(p => p.batch === batchNum);
  }

  const batchesIdx = argv.indexOf('--batches');
  if (batchesIdx !== -1 && argv[batchesIdx + 1]) {
    const nums = new Set(argv[batchesIdx + 1].split(',').map(s => Number(s.trim())).filter(Number.isFinite));
    return activePackages.filter(p => nums.has(p.batch));
  }

  if (argv.includes('--all')) {
    return activePackages;
  }

  return null;
}

/**
 * Extracts a balanced HTML element starting from a matching opening tag regex.
 */
export function extractBalancedTag(html, openRegex, tagName = 'div') {
  const m = html.match(openRegex);
  if (!m) return '';
  const start = m.index;
  let depth = 0;
  const tokenRe = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi');
  tokenRe.lastIndex = start;
  let tok;
  while ((tok = tokenRe.exec(html)) !== null) {
    if (tok[1] === '/') {
      depth--;
      if (depth === 0) {
        return html.slice(start, tok.index + tok[0].length);
      }
    } else if (!tok[0].endsWith('/>')) {
      depth++;
    }
  }
  return html.slice(start);
}

/**
 * Strips script/style blocks and inline Xenatech/Bootstrap attributes cleanly while preserving semantic text.
 */
export function sanitizeLiveProse(rawHtml) {
  let html = String(rawHtml || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ');
  html = removeBalancedBlock(html, /<div\b[^>]*class=["'][^"']*\btoc-container\b[^"']*["'][^>]*>/i, 'div');
  html = removeBalancedBlock(html, /<div\b[^>]*class=["'][^"']*\blogo-area\b[^"']*["'][^>]*>/i, 'div');
  html = cleanArticleBodyHtml(html);
  // Normalize obvious HTML entity spaces and repeated breaks
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function extractMoneyNumber(str = '') {
  const m = String(str).match(/(?:US\$|\$|USD)\s*([0-9,]+(?:\.[0-9]+)?)/i);
  if (!m) return null;
  const val = Number(m[1].replace(/,/g, ''));
  return Number.isFinite(val) ? val : null;
}

export function extractLiveGalleryUrls(liveHtml) {
  const overviewIdx = liveHtml.search(/<div[^>]+id=["']overview["']/i);
  const heroSlice = overviewIdx > 0 ? liveHtml.slice(0, overviewIdx) : liveHtml.slice(0, 45000);
  const urls = [];
  const imgRe = /<img\b[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = imgRe.exec(heroSlice)) !== null) {
    const src = decodeHtmlEntities(m[1]);
    if (!/(?:\/public\/uploads\/|\/uploads\/)/i.test(src)) continue;
    if (/logo|icon|flag|taan|ntb|tripadvisor|google|avatar/i.test(src)) continue;
    if (!urls.includes(src)) urls.push(src);
  }
  return urls;
}

export function extractLiveFacts(liveHtml) {
  const facts = {};
  const tfBlock = extractBalancedTag(liveHtml, /<div[^>]+class=["'][^"']*trip-facts-card[^"']*["'][^>]*>/i, 'div');
  if (!tfBlock) return facts;

  const itemRe = /<span[^>]*class=["']fact-label["'][^>]*>([\s\S]*?)<\/span>\s*<strong[^>]*>([\s\S]*?)<\/strong>/gi;
  let m;
  while ((m = itemRe.exec(tfBlock)) !== null) {
    const key = htmlToNormalizedPlainText(m[1]).replace(/[:]+$/, '').trim().toLowerCase();
    const val = htmlToNormalizedPlainText(m[2]).trim();
    if (key && val) facts[key] = val;
  }
  return facts;
}

export function extractLivePricing(liveHtml, manifestEntry) {
  const sideIdx = liveHtml.search(/class=["'][^"']*side-section-main/i);
  const priceZone = sideIdx !== -1 ? liveHtml.slice(sideIdx, sideIdx + 9000) : '';
  const pkgOptions = [];
  const optRe = /<label[^>]*class=["'][^"']*pkg-option[^"']*["'][^>]*>([\s\S]*?)<\/label>/gi;
  let m;
  while ((m = optRe.exec(priceZone)) !== null) {
    const inner = m[1];
    const name = htmlToNormalizedPlainText(inner.match(/class=["']pkg-option__name["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || 'Regular');
    const tagline = htmlToNormalizedPlainText(inner.match(/class=["']pkg-option__tagline["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
    const priceText = htmlToNormalizedPlainText(inner.match(/class=["']pkg-option__price["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
    const priceUsd = extractMoneyNumber(priceText);
    pkgOptions.push({ name, tagline, priceText, priceUsd });
  }

  const groupTiers = [];
  const tierRe = /<div[^>]*class=["']grp-price-row["'][^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/div>/gi;
  while ((m = tierRe.exec(priceZone)) !== null) {
    const label = htmlToNormalizedPlainText(m[1]);
    const valText = htmlToNormalizedPlainText(m[2]);
    const valUsd = extractMoneyNumber(valText);
    if (label && valUsd && !/no\.\s*of\s*people/i.test(label)) {
      groupTiers.push({ label, priceUsd: valUsd });
    }
  }

  // Decide source of truth per User Decision A1 + A4:
  // 1) Live page sidebar price (> 0) wins.
  // 2) If live sidebar has NO pkg-option price box at all (blank), fall back to CSV price if > 0.
  // 3) If live sidebar shows US$0 (or both live & CSV are blank/0), Price on Request.
  const regularOpt = pkgOptions.find(o => /regular/i.test(o.name)) || pkgOptions[0] || null;
  const luxuryOpt = pkgOptions.find(o => /luxury/i.test(o.name)) || null;

  let primaryPriceUsd = null;
  let priceSource = 'price-on-request';

  if (regularOpt && regularOpt.priceUsd !== null) {
    if (regularOpt.priceUsd > 0) {
      primaryPriceUsd = regularOpt.priceUsd;
      priceSource = 'live-page';
    } else {
      primaryPriceUsd = null;
      priceSource = 'price-on-request';
    }
  } else {
    // Live sidebar omitted price box completely
    const looseMatch = extractMoneyNumber(priceZone);
    if (looseMatch && looseMatch > 0) {
      primaryPriceUsd = looseMatch;
      priceSource = 'live-page';
    } else if (manifestEntry.csvPriceUsd && manifestEntry.csvPriceUsd > 0) {
      primaryPriceUsd = manifestEntry.csvPriceUsd;
      priceSource = 'csv-fallback';
    }
  }

  return {
    primaryPriceUsd,
    priceOnRequest: primaryPriceUsd === null,
    priceSource,
    luxuryPriceUsd: luxuryOpt && luxuryOpt.priceUsd > 0 ? luxuryOpt.priceUsd : null,
    packages: pkgOptions,
    groupTiers: groupTiers.slice(0, 6)
  };
}

export function extractOverviewAndHighlights(liveHtml, serviceName) {
  const ovRaw = extractBalancedTag(liveHtml, /<div[^>]+id=["']overview["'][^>]*>/i, 'div');
  let cleaned = sanitizeLiveProse(ovRaw);

  // Extract explicit bullet highlights even when heading contains nested <strong>/<span>
  const highlights = [];
  const hlRe = /<h[1-4][^>]*>(?:(?!(?:<\/h[1-4]>)).)*Highlights(?:(?!(?:<\/h[1-4]>)).)*<\/h[1-4]>\s*(?:<p>[\s\S]*?<\/p>\s*)*(<ul[\s\S]*?<\/ul>)/i;
  const hlSection = cleaned.match(hlRe);
  if (hlSection) {
    for (const li of hlSection[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
      const txt = cleanSourceCopy(htmlToNormalizedPlainText(li[1]));
      if (txt) highlights.push(txt);
    }
    if (highlights.length >= 3) {
      cleaned = cleaned.replace(hlSection[0], '').trim();
    }
  }

  const plain = cleanSourceCopy(htmlToNormalizedPlainText(cleaned));

  // Pull concrete sentences for concise Hero subtitle + expandable "Learn more"
  const sentences = plain
    .replace(/^(?:Overview|Highlights|.*?Overview)\s+/i, '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && !/^var\s|^function\b/i.test(s));

  const heroLead = sentences.slice(0, 2).join(' ') || `Explore ${serviceName} with local Himalayan guides from Nepal Unique Treks.`;
  const heroMore = sentences.slice(2, 4).join(' ');

  return { overviewHtml: cleaned, plainText: plain, heroLead, heroMore, highlights: highlights.slice(0, 8) };
}

function synthesizeOverviewFromPageData(serviceName, metaDescription, facts, durationDays, itineraryDays) {
  const stopTitles = itineraryDays
    .map(d => d.title.replace(/\s*\d+\s*m.*$/i, '').trim())
    .filter(t => t && !/arrival|departure|international airport/i.test(t));
  const leadSentence = (metaDescription && metaDescription.length > 35)
    ? metaDescription
    : `${serviceName} is a ${durationDays}-day ${facts.activity || 'guided'} program operated with local guides from Nepal Unique Treks.`;
  const logisticsLine = `Featuring ${facts.accommodation || 'comfortable accommodations'}, ${facts.transportation || 'dedicated local transport'}, and an overall grade of ${facts.grade || 'Easy to Moderate'}, the itinerary spans ${facts['max elevation'] ? `up to ${facts['max elevation']}` : 'key scenic and cultural highlights'} across ${facts['best season'] || 'Spring and Autumn seasons'}.`;
  const daySnippets = itineraryDays
    .map(d => d.description)
    .filter(d => d && d.length > 40)
    .slice(0, 3);
  const bullets = (stopTitles.length ? stopTitles : itineraryDays.map(d => d.title))
    .slice(0, 6);

  const overviewHtml = [
    `<div><h2><strong>${escapeHtmlText(serviceName)} Overview</strong></h2>`,
    `<p>${escapeHtmlText(leadSentence)}</p>`,
    `<p>${escapeHtmlText(logisticsLine)}</p>`,
    daySnippets.length ? `<p>${escapeHtmlText(daySnippets[0])}</p>` : '',
    bullets.length
      ? `<h3><strong>Key Itinerary Highlights</strong></h3><ul>${bullets.map(b => `<li>${escapeHtmlText(b)}</li>`).join('')}</ul>`
      : '',
    `</div>`
  ].join('');

  const plainText = [leadSentence, logisticsLine, ...daySnippets, ...bullets].join(' ').trim();
  const sentences = plainText.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 20);
  return {
    overviewHtml,
    plainText,
    heroLead: sentences.slice(0, 2).join(' ') || leadSentence,
    heroMore: sentences.slice(2, 4).join(' '),
    highlights: bullets.slice(0, 8)
  };
}

export function extractItineraryDays(liveHtml, facts, serviceName, durationDays, overviewPlain) {
  const itIdx = liveHtml.search(/<div[^>]+id=["']itinerary["']/i);
  if (itIdx === -1) {
    return {
      source: 'derived-from-overview',
      days: synthesizeItineraryDays(serviceName, durationDays, facts, overviewPlain)
    };
  }

  const nextSectionRe = /<div[^>]+id=["'](?:cost|availability|map|info|faqs|review)["']/gi;
  nextSectionRe.lastIndex = itIdx + 10;
  const nextM = nextSectionRe.exec(liveHtml);
  const itBlock = nextM ? liveHtml.slice(itIdx, nextM.index) : extractBalancedTag(liveHtml.slice(itIdx), /<div[^>]+id=["']itinerary["'][^>]*>/i, 'div');

  const days = [];
  // Match Detailed Itinerary accordion items: button/header + collapse body
  const itemRe = /<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]{0,600}?<div[^>]+id=["']itinerary-collapse-\d+["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["']accordion-item|<h2\b|$)/gi;
  let m;
  while ((m = itemRe.exec(itBlock)) !== null) {
    const rawHeading = htmlToNormalizedPlainText(m[1]).replace(/^DAY\s*0*(\d+)\s*:?\s*/i, '');
    const bodyHtmlClean = sanitizeLiveProse(m[2]);
    const bodyPlain = htmlToNormalizedPlainText(bodyHtmlClean);

    const foodMatch = bodyPlain.match(/(?:Food|Meals)\s*:\s*([\s\S]*?)(?=\s*(?:Accomm?odation|Elevation)\s*:|\.|$)/i);
    const accDayMatch = bodyPlain.match(/Accomm?odation\s*:\s*([\s\S]*?)(?=\s*(?:Food|Meals|Elevation)\s*:|\.|$)/i);
    const elevDayMatch = bodyPlain.match(/Elevation\s*:\s*(\d[\d,]*)\s*(?:m\b|meters|masl)/i);
    const cleanDesc = bodyPlain.replace(/\s*(?:Food|Meals|Accomm?odation|Elevation)\s*:[\s\S]*$/i, '').trim();

    const altMatch = (rawHeading + ' ' + cleanDesc).match(/(\d[\d,]*)\s*(?:m\b|meters|masl)/i);
    const altitudeM = elevDayMatch
      ? Number(elevDayMatch[1].replace(/,/g, ''))
      : (altMatch ? Number(altMatch[1].replace(/,/g, '')) : null);
    const durMatch = rawHeading.match(/(\d+(?:[–\-/]\d+)?\s*(?:hrs?|hours?))/i);
    const distMatch = rawHeading.match(/(\d+(?:[–\-]\d+)?\s*km)/i);

    days.push({
      day: days.length + 1,
      title: rawHeading,
      altitudeM,
      walkingTime: durMatch ? durMatch[1] : null,
      distanceKm: distMatch ? distMatch[1] : null,
      meals: foodMatch ? foodMatch[1].replace(/\.$/, '').trim() : null,
      accommodation: accDayMatch ? accDayMatch[1].replace(/\.$/, '').trim() : (facts.accommodation || null),
      description: cleanDesc || rawHeading
    });
  }

  // Fallback to Short Itinerary items if accordion markup differed
  if (!days.length) {
    const shortRe = /<div[^>]*class=["']days["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class=["']cont["'][^>]*>([\s\S]*?)<\/div>/gi;
    while ((m = shortRe.exec(itBlock)) !== null) {
      const title = htmlToNormalizedPlainText(m[2]);
      const altMatch = title.match(/(\d[\d,]*)\s*(?:m\b|meters|masl)/i);
      days.push({
        day: days.length + 1,
        title,
        altitudeM: altMatch ? Number(altMatch[1].replace(/,/g, '')) : null,
        walkingTime: null,
        distanceKm: null,
        meals: null,
        accommodation: facts.accommodation || null,
        description: title
      });
    }
  }

  if (!days.length) {
    return {
      source: 'derived-from-overview',
      days: synthesizeItineraryDays(serviceName, durationDays, facts, overviewPlain)
    };
  }

  return { source: 'live-itinerary', days };
}

function synthesizeItineraryDays(serviceName, durationDays, facts, overviewPlain) {
  const n = Math.max(1, Number(durationDays) || 1);
  const acc = facts.accommodation || 'Hotel / Lodge';
  const trans = facts.transportation || 'Private Tourist Vehicle';
  const maxAltNum = extractAltitudeNum(facts['max elevation']) || 1400;

  if (n === 1) {
    return [{
      day: 1,
      title: `${serviceName} Full-Day Program`,
      altitudeM: maxAltNum,
      walkingTime: 'Full day excursion',
      distanceKm: null,
      meals: 'According to package',
      accommodation: 'Return / No overnight',
      description: overviewPlain.slice(0, 380) || `Complete your guided ${serviceName} excursion using ${trans}.`
    }];
  }

  // Extract concrete place phrases from overview to keep synthesized days anchored to source page entities
  const placeCandidates = [...new Set(
    (overviewPlain.match(/\b(?:Kathmandu|Pokhara|Chitwan(?:\s+National\s+Park)?|Lumbini|Bhaktapur|Patan|Nagarkot|Sarangkot|Ghandruk|Bandipur|Bardiya|Janakpur|Mustang|Lo Manthang|Rapti|Timal|Namobuddha|Sailung|Syabrubesi|Langtang|Gosaikunda|Jomsom|Muktinath|Sirubari|Ghale Gaun)\b/gi) || [])
      .map(s => s.trim().replace(/\b\w/g, c => c.toUpperCase()))
  )];
  const mainDest = placeCandidates.find(p => !/kathmandu/i.test(p)) || serviceName;

  const days = [];
  for (let d = 1; d <= n; d++) {
    if (d === 1) {
      days.push({
        day: 1,
        title: `Arrival in Kathmandu & Transfer to Hotel`,
        altitudeM: 1355,
        walkingTime: null,
        distanceKm: null,
        meals: 'Welcome Dinner',
        accommodation: acc,
        description: `Arrive at Tribhuvan International Airport in Kathmandu where our representative welcomes you and transfers you to your hotel. Evening trip briefing for ${serviceName}.`
      });
    } else if (d === 2 && n >= 4) {
      days.push({
        day: 2,
        title: `Transfer from Kathmandu to ${mainDest} via ${trans}`,
        altitudeM: Math.round((1355 + maxAltNum) / 2),
        walkingTime: null,
        distanceKm: null,
        meals: 'Breakfast',
        accommodation: acc,
        description: `Travel toward ${mainDest} (${trans}) and check into your accommodation as outlined in our ${serviceName} program.`
      });
    } else if (d === n) {
      days.push({
        day: n,
        title: `Final Departure from Kathmandu`,
        altitudeM: 1355,
        walkingTime: null,
        distanceKm: null,
        meals: 'Breakfast',
        accommodation: 'Departure',
        description: `Airport transfer from your Kathmandu hotel to Tribhuvan International Airport for onward departure.`
      });
    } else if (d === n - 1 && n >= 3) {
      days.push({
        day: d,
        title: `Return Journey to Kathmandu`,
        altitudeM: 1355,
        walkingTime: null,
        distanceKm: null,
        meals: 'Breakfast & Farewell Dinner',
        accommodation: acc,
        description: `Travel back to Kathmandu (${trans}) with free evening time in Thamel.`
      });
    } else {
      const activityTxt = facts.activity || serviceName;
      days.push({
        day: d,
        title: `${mainDest} Exploration — ${activityTxt} (Day ${d})`,
        altitudeM: maxAltNum,
        walkingTime: null,
        distanceKm: null,
        meals: 'Breakfast (plus package meals where included)',
        accommodation: acc,
        description: `Guided ${activityTxt.toLowerCase()} activities around ${mainDest}, experiencing the core highlights described in the ${serviceName} overview.`
      });
    }
  }
  return days;
}

export function extractIncludesExcludes(liveHtml) {
  const costBlock = extractBalancedTag(liveHtml, /<div[^>]+id=["']cost["'][^>]*>/i, 'div');
  if (!costBlock) return { packages: [] };

  const packages = [];
  const paneRe = /<div[^>]+class=["'][^"']*tab-pane[^"']*["'][^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["'][^"']*tab-pane|$)/gi;
  let m;
  while ((m = paneRe.exec(costBlock)) !== null) {
    const paneHtml = m[2];
    const pkgTitle = htmlToNormalizedPlainText(paneHtml.match(/class=["']package-cost-summary["'][^>]*>[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>/i)?.[1] || 'Regular Package');
    const pkgPriceText = htmlToNormalizedPlainText(paneHtml.match(/class=["']package-cost-summary["'][^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');

    const incBlock = extractBalancedTag(paneHtml, /<div[^>]+class=["'][^"']*included[^"']*["'][^>]*>/i, 'div');
    const excBlock = extractBalancedTag(paneHtml, /<div[^>]+class=["'][^"']*excluded[^"']*["'][^>]*>/i, 'div');

    const parseLis = block => [...block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(x => htmlToNormalizedPlainText(x[1]))
      .map(t => t.replace(/first add kid/gi, 'first aid kit').replace(/trekking t short/gi, 'trekking t-shirt'))
      .filter(Boolean);

    const includes = parseLis(incBlock);
    const excludes = parseLis(excBlock);
    if (includes.length || excludes.length) {
      packages.push({ key: m[1], title: pkgTitle, priceText: pkgPriceText, includes, excludes });
    }
  }

  return { packages };
}

export function extractLiveFaqs(liveHtml) {
  const faqBlock = extractBalancedTag(liveHtml, /<div[^>]+id=["']faqs["'][^>]*>/i, 'div');
  if (!faqBlock) return [];
  const faqs = [];
  const qRe = /class=["']faq-q-text["'][^>]*>([\s\S]*?)<\/span>[\s\S]*?class=["']faq-answer__content["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m;
  while ((m = qRe.exec(faqBlock)) !== null) {
    const question = htmlToNormalizedPlainText(m[1]);
    const answer = htmlToNormalizedPlainText(m[2]);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

export function extractLiveUsefulInfo(liveHtml) {
  const infoBlock = extractBalancedTag(liveHtml, /<div[^>]+id=["']info["'][^>]*>/i, 'div');
  if (!infoBlock) return '';
  return sanitizeLiveProse(infoBlock);
}

export function extractLiveMapImage(liveHtml) {
  const mapBlock = extractBalancedTag(liveHtml, /<div[^>]+id=["']map["'][^>]*>/i, 'div');
  if (!mapBlock) return '';
  const m = mapBlock.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? decodeHtmlEntities(m[1]) : '';
}

export function extractLiveAvailability(liveHtml) {
  const availBlock = extractBalancedTag(liveHtml, /<div[^>]+id=["']availability["'][^>]*>/i, 'div');
  if (!availBlock) return [];
  const rows = [];
  const monthRe = /<div[^>]+id=["']trip-([A-Za-z]{3})-(\d{4})["'][^>]*>([\s\S]*?)(?=<div[^>]+id=["']trip-|<\/div>\s*<\/div>\s*<\/div>|$)/gi;
  let mm;
  while ((mm = monthRe.exec(availBlock)) !== null) {
    const monthShort = mm[1].toUpperCase();
    const year = mm[2];
    const rowRe = /Start Date\s*:\s*<\/span>([^<]+)<\/div>[\s\S]*?Availability\s*:\s*<\/span>([^<]+)<\/div>/gi;
    let rm;
    while ((rm = rowRe.exec(mm[3])) !== null) {
      rows.push({
        month: monthShort,
        year,
        startDate: htmlToNormalizedPlainText(rm[1]),
        status: htmlToNormalizedPlainText(rm[2]) || 'Available'
      });
    }
  }
  return rows;
}

export function extractAltitudeNum(str = '') {
  const m = String(str).match(/(\d[\d,]*)/);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

export function buildChartSeries(itineraryDays, facts, serviceName) {
  const maxAlt = extractAltitudeNum(facts['max elevation']) || 1400;
  let points = itineraryDays.map(d => {
    const isChitwanLowland = /chitwan|bardiya|lumbini/i.test(`${d.title} ${serviceName}`) && !/kathmandu|pokhara|return|departure/i.test(d.title);
    const altM = isChitwanLowland && (!d.altitudeM || d.altitudeM > 500) ? 150 : (d.altitudeM || 1355);
    const spotRaw = d.title.split(/[–:\-(]/)[0].trim();
    const spot = spotRaw.length > 24 ? `${spotRaw.slice(0, 22)}..` : spotRaw;
    return {
      day: `Day ${d.day}`,
      spot: spot || `Day ${d.day}`,
      altitudeM: altM,
      altitudeFt: Math.round(altM * 3.28084)
    };
  });

  if (points.length === 1) {
    const peakM = Math.max(points[0].altitudeM, maxAlt);
    points = [
      { day: 'Start', spot: 'Trailhead', altitudeM: Math.min(1400, peakM), altitudeFt: Math.round(Math.min(1400, peakM) * 3.28084) },
      { day: 'Peak', spot: points[0].spot, altitudeM: peakM, altitudeFt: Math.round(peakM * 3.28084) },
      { day: 'End', spot: 'Finish', altitudeM: Math.min(1400, peakM), altitudeFt: Math.round(Math.min(1400, peakM) * 3.28084) }
    ];
  } else if (points.length > 1 && Math.max(...points.map(p => p.altitudeM)) < maxAlt && !/chitwan|bardiya|safari/i.test(serviceName)) {
    // Anchor max elevation onto the genuine high-point day (Base Camp / Kala Patthar / Pass / Summit)
    let peakIdx = -1;
    let bestPeakScore = -1;
    itineraryDays.forEach((d, idx) => {
      const txt = `${d.title} ${d.description || ''}`;
      let score = points[idx].altitudeM;
      if (/kala\s*patthar|summit|gokyo\s*ri|high\s*pass/i.test(txt)) {
        score += 20000;
      } else if (/base\s*camp|\bpass\b|larke|thorong|renjo|cho\s*la|kang\s*la|peak/i.test(txt)) {
        score += 10000;
      }
      if (idx > 0 && idx < itineraryDays.length - 1 && score > bestPeakScore) {
        bestPeakScore = score;
        peakIdx = idx;
      }
    });
    if (peakIdx === -1) peakIdx = Math.floor(points.length / 2);
    points[peakIdx].altitudeM = maxAlt;
    points[peakIdx].altitudeFt = Math.round(maxAlt * 3.28084);
  }

  // Atmospheric lapse rate (-6.5C per 1000m above 1400m winter base min 5C/max 19C)
  const weatherPoints = points.map(p => {
    const deltaKm = (p.altitudeM - 1400) / 1000;
    const min = Math.round(5 - deltaKm * 6.5);
    const max = Math.round(19 - deltaKm * 6.0);
    return { label: `${p.day} (${p.altitudeM} m)`, min, max };
  });

  return {
    name: `${serviceName} (${itineraryDays.length} Days)`,
    weatherTitle: `${serviceName} Seasonal Averages`,
    points,
    weatherPoints
  };
}

export function extractLiveTripData(liveHtml, manifestEntry) {
  const seoTitle = decodeHtmlEntities(liveHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || manifestEntry.serviceName).trim();
  const metaDescription = decodeHtmlEntities(
    liveHtml.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i)?.[1] ||
    liveHtml.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']/i)?.[1] || ''
  ).trim();
  const h1Title = htmlToNormalizedPlainText(liveHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '') || manifestEntry.serviceName;

  const facts = extractLiveFacts(liveHtml);
  const durationDays = extractAltitudeNum(facts.duration) || manifestEntry.csvDurationDays || 1;
  const pricing = extractLivePricing(liveHtml, manifestEntry);
  let overview = extractOverviewAndHighlights(liveHtml, h1Title);
  const itinerary = extractItineraryDays(liveHtml, facts, h1Title, durationDays, overview.plainText);
  if (!overview.plainText || overview.plainText.split(/\s+/).filter(Boolean).length < 25) {
    overview = synthesizeOverviewFromPageData(h1Title, metaDescription, facts, durationDays, itinerary.days);
  }
  const inclusions = extractIncludesExcludes(liveHtml);
  const liveFaqs = extractLiveFaqs(liveHtml);
  const usefulInfoHtml = extractLiveUsefulInfo(liveHtml);
  const liveMapImageUrl = extractLiveMapImage(liveHtml);
  const liveAvailability = extractLiveAvailability(liveHtml);
  const liveGalleryUrls = extractLiveGalleryUrls(liveHtml);
  const chartSeries = buildChartSeries(itinerary.days, facts, h1Title);

  return {
    schemaVersion: 1,
    order: manifestEntry.order,
    batch: manifestEntry.batch,
    sourceSlug: manifestEntry.sourceSlug,
    sourceUrl: manifestEntry.sourceUrl,
    targetDir: manifestEntry.targetDir,
    templateType: manifestEntry.templateType,
    regionLabel: manifestEntry.regionLabel,
    sourceCategory: manifestEntry.sourceCategory,
    title: h1Title,
    seoTitle,
    metaDescription: metaDescription || overview.heroLead,
    heroLead: overview.heroLead,
    heroMore: overview.heroMore,
    durationDays,
    durationDisplay: facts.duration || manifestEntry.csvDurationRaw || `${durationDays} Days`,
    maxElevationM: extractAltitudeNum(facts['max elevation']) || chartSeries.points.reduce((m, p) => Math.max(m, p.altitudeM), 1400),
    facts,
    pricing,
    galleryUrls: liveGalleryUrls,
    highlights: overview.highlights,
    overviewHtml: overview.overviewHtml,
    overviewPlainWordCount: overview.plainText ? overview.plainText.split(/\s+/).length : 0,
    itinerarySource: itinerary.source,
    itinerary: itinerary.days,
    packagesCost: inclusions.packages,
    liveAvailability,
    usefulInfoHtml,
    liveMapImageUrl,
    liveFaqs,
    chartSeries
  };
}
