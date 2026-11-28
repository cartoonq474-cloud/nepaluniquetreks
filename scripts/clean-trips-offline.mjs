import fs from 'fs';
import path from 'path';
import {
  REPO_ROOT,
  buildChartSeries,
  cleanSourceCopy,
  htmlToNormalizedPlainText
} from '../scripts/lib/trip-utils.mjs';

const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'content', 'trip-manifest.json'), 'utf8'));
const active = manifest.packages.filter(p => !p.deferred);

const SAFARI_IMAGES = [
  'uploads/safari-holiday.jpg',
  'uploads/nepal-chitwan-jungle-safari.jpg',
  'uploads/chitwan-national-park-12-XL.jpg',
  'uploads/bardiya-national-park-tour.jpg',
  'uploads/kathmandu pokhara lumbini tour.jpg',
  'uploads/kathmandu-durbar-squire.jpg'
];

const TOUR_IMAGES = [
  'uploads/kathmandu-durbar-squire.jpg',
  'uploads/pokhara-himalayan-view-winter.jpg',
  'uploads/kathmandu pokhara lumbini tour.jpg',
  'uploads/nagarkot.JPG',
  'uploads/nepal-chitwan-jungle-safari.jpg',
  'uploads/lumbini-1.jpg'
];

const KHUMBU_PEAK_FALLBACKS = [
  'images/treks/everest-base-camp/everest-base-camp-high-mountain-sunrise-13.jpg',
  'images/treks/everest-base-camp/everest-base-camp-mountain-cairn-view-18.jpg',
  'images/treks/everest-base-camp/everest-base-camp-snow-peak-clouds-16.jpg',
  'images/treks/everest-base-camp/everest-base-camp-mountain-valley-landscape-06.jpg',
  'images/treks/gokyo-lakes/gokyo-trek-turquoise-lake-panorama-13.jpg'
];

function splitSmartSentences(plain) {
  const safe = String(plain || '')
    .replace(/\bsq\.\s*km\b/gi, 'sq__km')
    .replace(/\bhrs\.\s*/gi, 'hrs__ ')
    .replace(/\bapprox\.\s*/gi, 'approx__ ');
  return safe
    .replace(/^(?:Overview|Highlights|.*?Overview)\s+/i, '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replace(/sq__km/g, 'sq. km').replace(/hrs__/g, 'hrs.').replace(/approx__/g, 'approx.').trim())
    .filter(s => s.length > 25 && !/^var\s|^function\b/i.test(s));
}

let updatedCount = 0;

for (const entry of active) {
  const filePath = path.join(REPO_ROOT, 'content', 'trips', `${entry.sourceSlug}.json`);
  const trip = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Clean facts
  if (trip.facts) {
    for (const k of Object.keys(trip.facts)) {
      let v = cleanSourceCopy(trip.facts[k]);
      if (k === 'max elevation' && /^\d[\d,]*$/.test(v)) {
        v = `${Number(v.replace(/,/g, '')).toLocaleString()} m`;
      }
      trip.facts[k] = v;
    }
  }

  // Extract explicit highlights from nested-tag headings if missing
  if (!trip.highlights || trip.highlights.length < 3) {
    const hlRe = /<h[1-4][^>]*>(?:(?!(?:<\/h[1-4]>)).)*Highlights(?:(?!(?:<\/h[1-4]>)).)*<\/h[1-4]>\s*(?:<p>[\s\S]*?<\/p>\s*)*(<ul[\s\S]*?<\/ul>)/i;
    const m = (trip.overviewHtml || '').match(hlRe);
    if (m) {
      const items = [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map(x => cleanSourceCopy(htmlToNormalizedPlainText(x[1])))
        .filter(Boolean);
      if (items.length >= 3) trip.highlights = items.slice(0, 8);
    }
  }

  // Re-split heroLead & heroMore cleanly without splitting "sq. km"
  const ovPlain = cleanSourceCopy(htmlToNormalizedPlainText(trip.overviewHtml || ''));
  const sents = splitSmartSentences(ovPlain);
  if (sents.length) {
    trip.heroLead = sents.slice(0, 2).join(' ');
    trip.heroMore = sents.slice(2, 4).join(' ');
  } else {
    trip.heroLead = cleanSourceCopy(trip.heroLead || '');
    trip.heroMore = cleanSourceCopy(trip.heroMore || '');
  }

  // Clean itinerary items & fix lowland Chitwan/Bardiya altitude
  if (Array.isArray(trip.itinerary)) {
    trip.itinerary = trip.itinerary.map(d => {
      const titleClean = cleanSourceCopy(d.title || '');
      const descClean = cleanSourceCopy(d.description || '');
      const isChitwanLowland = /chitwan|bardiya|lumbini/i.test(`${titleClean} ${trip.title}`) && !/kathmandu|pokhara|return|departure/i.test(titleClean);
      return {
        ...d,
        title: titleClean,
        meals: d.meals ? cleanSourceCopy(d.meals) : null,
        accommodation: d.accommodation ? cleanSourceCopy(d.accommodation) : null,
        altitudeM: isChitwanLowland && (!d.altitudeM || d.altitudeM > 500) ? 150 : d.altitudeM,
        description: descClean
      };
    });
  }

  // Clean packagesCost & liveFaqs
  if (Array.isArray(trip.packagesCost)) {
    trip.packagesCost = trip.packagesCost.map(p => ({
      ...p,
      title: cleanSourceCopy(p.title),
      includes: (p.includes || []).map(cleanSourceCopy),
      excludes: (p.excludes || []).map(cleanSourceCopy)
    }));
  }
  if (Array.isArray(trip.liveFaqs)) {
    trip.liveFaqs = trip.liveFaqs.map(q => ({
      question: cleanSourceCopy(q.question),
      answer: cleanSourceCopy(q.answer)
    }));
  }

  // Replace snowy mountain fallback photos on tours with genuine tour/safari uploads
  if (entry.templateType === 'tour' && Array.isArray(trip.galleryImages)) {
    const isWildlife = /safari|chitwan|bardiya|wildlife/i.test(`${entry.sourceSlug} ${trip.title}`);
    const pool = (isWildlife ? SAFARI_IMAGES : TOUR_IMAGES).filter(rel => fs.existsSync(path.join(REPO_ROOT, 'public', rel)));
    const keptOwn = trip.galleryImages.filter(rel => !rel.startsWith('images/treks/'));
    for (const candidate of pool) {
      if (keptOwn.length >= 5) break;
      if (!keptOwn.includes(candidate)) keptOwn.push(candidate);
    }
    trip.galleryImages = keptOwn;
  } else if (entry.templateType === 'trek' && !/mera/i.test(entry.sourceSlug) && Array.isArray(trip.galleryImages)) {
    const hasMeraOrBanner = trip.galleryImages.some(rel => rel.startsWith('images/treks/mera-peak/') || /banner/i.test(rel));
    if (hasMeraOrBanner) {
      const keptOwn = trip.galleryImages.filter(rel => !rel.startsWith('images/treks/mera-peak/') && !/banner/i.test(rel));
      const pool = KHUMBU_PEAK_FALLBACKS.filter(rel => fs.existsSync(path.join(REPO_ROOT, 'public', rel)));
      for (const candidate of pool) {
        if (keptOwn.length >= 5) break;
        if (!keptOwn.includes(candidate)) keptOwn.push(candidate);
      }
      trip.galleryImages = keptOwn;
    }
  }

  // Recompute chartSeries with fixed peak-day anchoring & Chitwan 150m lowlands
  trip.chartSeries = buildChartSeries(trip.itinerary || [], trip.facts || {}, trip.title);

  fs.writeFileSync(filePath, JSON.stringify(trip, null, 2), 'utf8');
  updatedCount++;
}

console.log(`Cleaned and updated ${updatedCount} trip JSON files in place.`);
