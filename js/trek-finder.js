/**
 * Interactive Trek Finder & Search Filter (Pixel-Perfect Reference Card Design)
 */

const resolveImageUrl = (image) => {
  if (/^https?:\/\//i.test(image)) return image;
  const assetPath = image.replace(/^(?:\.\.\/)*images\//, "");
  const imageDirectory = new URL(import.meta.url);
  imageDirectory.pathname = imageDirectory.pathname.replace(/\/(?:js|assets)\/[^/]+$/, "/images/");
  return new URL(assetPath, imageDirectory).href;
};

export const sampleTreks = [
  {
    id: "dhaulagiri-circuit-trek",
    slug: "dhaulagiri-circuit-trek",
    title: "Dhaulagiri Circuit Trek",
    region: "dhaulagiri",
    subregion: "Myagdi & Kali Gandaki Valley",
    durationDays: 20,
    difficulty: "challenging",
    maxAltitudeM: 5360,
    basePriceUSD: 1999,
    summary: "Wilderness high-altitude expedition circuit crossing French Pass (5,360m) and Dhampus Pass (5,250m) with supported camping at Dhaulagiri Base Camp and Hidden Valley.",
    bestSeason: ["spring", "autumn"],
    image: "../../images/hero-himalayas.jpg",
    tags: ["EXPEDITION CAMPING", "HIGH PASSES", "REMOTE WILDERNESS", "CHALLENGING"],  },
  {
    id: "pikey-peak-trek",
    slug: "pikey-peak-trek",
    title: "Pikey Peak Trek",
    region: "everest",
    subregion: "Lower Everest / Solukhumbu",
    durationDays: 9,
    difficulty: "moderate",
    maxAltitudeM: 4065,
    basePriceUSD: 890,
    summary: "Overland Himalayan trek via Dhap to Pikey Peak (4,065m) for sunrise views of Everest, Kanchenjunga & Makalu, visiting ancient Sherpa villages & monasteries.",
    bestSeason: ["spring", "autumn"],
    image: "../../images/hero-himalayas.jpg",
    tags: ["PANORAMA", "SHERPA CULTURE", "OVERLAND", "EASY-MODERATE"],  },
  {
    id: "ebc-trek",
    slug: "everest-base-camp-trek",
    title: "Everest Base Camp Trek",
    region: "everest",
    subregion: "Solukhumbu, Everest Region",
    durationDays: 14,
    difficulty: "challenging",
    maxAltitudeM: 5545,
    basePriceUSD: 1399,
    summary: "Full teahouse trek to Everest Base Camp (5,364m) and Kala Patthar (5,545m) via Namche Bazaar & Tengboche monastery.",
    bestSeason: ["spring", "autumn"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    tags: ["CLASSIC", "HIGH ALTITUDE", "TEAHOUSE"],  },
  {
    id: "abc-trek",
    slug: "annapurna-base-camp-trek",
    title: "Annapurna Base Camp Trek",
    region: "annapurna",
    subregion: "Gandaki, Annapurna Region",
    durationDays: 11,
    difficulty: "moderate",
    maxAltitudeM: 4130,
    basePriceUSD: 980,
    summary: "Spectacular journey through rhododendron forests into the heart of Annapurna Sanctuary and natural Jhinu hot springs.",
    bestSeason: ["spring", "autumn", "winter"],
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
    tags: ["HOT SPRINGS", "SANCTUARY", "POPULAR"],  },
  {
    id: "manaslu-circuit",
    slug: "manaslu-circuit-trek",
    title: "Manaslu Circuit Trek",
    region: "manaslu",
    subregion: "Gorkha, Manaslu Region",
    durationDays: 15,
    difficulty: "challenging",
    maxAltitudeM: 5106,
    basePriceUSD: 1250,
    summary: "Pristine restricted circuit around Mount Manaslu (8,163m) crossing snow-covered Larke La Pass.",
    bestSeason: ["spring", "autumn"],
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    tags: ["RESTRICTED AREA", "CULTURE", "REMOTE"],  },
  {
    id: "mardi-himal",
    slug: null,
    title: "Mardi Himal Ridge Trek",
    region: "annapurna",
    subregion: "Kaski, Annapurna Region",
    durationDays: 7,
    difficulty: "moderate",
    maxAltitudeM: 4500,
    basePriceUSD: 650,
    summary: "Hidden gem ridge trail offering face-to-face vistas of Mount Fishtail (Machhapuchhre) and Annapurna South.",
    bestSeason: ["spring", "autumn", "winter"],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    tags: ["SHORT TREK", "RIDGE VIEW", "BEGINNER"],  },
  {
    id: "gokyo-lakes",
    slug: "gokyo-lakes-and-cho-la-pass",
    title: "Gokyo Lakes & Cho La Pass Trek",
    region: "everest",
    subregion: "Solukhumbu, Everest Region",
    durationDays: 16,
    difficulty: "challenging",
    maxAltitudeM: 5360,
    basePriceUSD: 1490,
    summary: "Breathtaking turquoise high-altitude lakes, Ngozumpa glacier, and technical Cho La pass crossing.",
    bestSeason: ["spring", "autumn"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    tags: ["TURQUOISE LAKES", "HIGH PASS", "GLACIER"],  },
  {
    id: "langtang-gosaikunda",
    slug: "langtang-gosaikunda-trek",
    title: "Langtang Gosaikunda Trek",
    region: "langtang",
    subregion: "Rasuwa, Langtang Region",
    durationDays: 15,
    difficulty: "moderate-strenuous",
    maxAltitudeM: 4610,
    basePriceUSD: 890,
    summary: "Combines the glacial valley of Langtang, sacred alpine lakes at Gosaikunda (4,380m), and scenic Laurebina Pass (4,610m).",
    bestSeason: ["spring", "autumn"],
    image: "../../images/treks/langtang-valley/langtang-trek-trekkers-mountain-view-01.jpg",
    tags: ["HOLY LAKES", "HIGH PASS", "TAMANG CULTURE"],  },
  {
    id: "langtang-valley",
    slug: "langtang-valley-trek",
    title: "Langtang Valley Trek",
    region: "langtang",
    subregion: "Rasuwa, Langtang Region",
    durationDays: 9,
    difficulty: "moderate",
    maxAltitudeM: 3870,
    basePriceUSD: 750,
    summary: "Valley of glaciers close to Kathmandu featuring rich Tamang heritage, yak cheese factories, and Kyanjin Gompa.",
    bestSeason: ["spring", "autumn"],
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80",
    tags: ["TAMANG CULTURE", "VALLEY", "SCENIC"],  }
];

export function initTrekFinder(containerId, treks = sampleTreks) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isTreksPage = window.location.pathname.includes('treks') || window.location.pathname.includes('nepal-trekking-packages');
  const linkPrefix = window.location.pathname.includes('/nepal-trekking-packages/') ? '../' : '';

  const renderCards = (filtered) => {
    if (filtered.length === 0) {
      container.innerHTML = `<div class="exotic-trek-card" style="padding: 40px; text-align: center; grid-column: 1 / -1;"><p style="color:#65736B;">No treks matched your selected destination. Please try selecting another category!</p></div>`;
      return;
    }

    container.innerHTML = filtered.map(t => `
      <div class="exotic-trek-card" data-trek-id="${t.id}" data-region="${t.region}">
        
        <!-- Image Banner with Duration Badge & Glassmorphism Hover Info Overlay -->
        <div class="exotic-img-wrapper">
          <img src="${resolveImageUrl(t.image)}" alt="${t.title}" loading="lazy">
          <span class="duration-badge-top">${t.durationDays} DAYS</span>

          <!-- Glassmorphism Hover Overlay -->
          <div class="exotic-img-hover-overlay">
            <div class="exotic-hover-tags">
              ${t.tags.map(tag => `<span class="exotic-hover-tag-pill">${tag}</span>`).join('')}
            </div>
            <div class="exotic-hover-meta">
              <div class="exotic-hover-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Max: <strong>${t.maxAltitudeM} m</strong></span>
              </div>
              <div class="exotic-hover-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>${t.difficulty}</span>
              </div>
            </div>
            <p class="exotic-hover-summary">${t.summary || 'Unforgettable mountain journey through high Himalayan passes, Sherpa settlements, and sacred alpine lakes.'}</p>
            <div class="exotic-hover-hint">Hovered for details</div>
          </div>
        </div>

        <!-- Clean Uncluttered Card Body -->
        <div class="exotic-card-content">
          <div>
            <h3 class="exotic-card-title">${t.title}</h3>
            <div class="exotic-card-subregion">${t.subregion || t.region.toUpperCase() + ' REGION'}</div>
          </div>

          <!-- Footer Row: Price & Inquire Button -->
          <div class="exotic-card-footer">
            <div class="price-group">
              <span class="price-label">Starting From</span>
              <strong class="price-amount">$${t.basePriceUSD}</strong>
            </div>
            <button class="btn-inquire-orange open-inquiry-btn" data-trek-title="${t.title}" onclick="document.getElementById('inquiry-modal').classList.add('active'); document.body.style.overflow='hidden';">
              Inquire Now
            </button>
            ${isTreksPage && t.slug ? `<a href="${linkPrefix}trek/${t.slug}/" class="btn-inquire-orange" style="text-decoration:none; text-align:center;">View Itinerary</a>` : ''}
          </div>

        </div>
      </div>
    `).join('');
  };

  renderCards(treks);

  // Bind Destination Pill Bar Buttons
  const pillBtns = document.querySelectorAll('.dest-pill-btn');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const region = btn.getAttribute('data-region');
      
      // Update Active State
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter Treks
      if (!region || region === 'all') {
        renderCards(treks);
      } else {
        renderCards(treks.filter(t => t.region === region));
      }
    });
  });

  // Bind Dropdown Filters & Search Treks Button
  const filterRegion = document.getElementById('filter-region');
  const filterDuration = document.getElementById('filter-duration');
  const filterDifficulty = document.getElementById('filter-difficulty');
  const filterSeason = document.getElementById('filter-season');
  const searchBtn = document.getElementById('reset-filters-btn');

  const applyFilters = () => {
    let result = [...treks];

    if (filterRegion && filterRegion.value !== 'all') {
      result = result.filter(t => t.region === filterRegion.value);
    }
    if (filterDuration && filterDuration.value !== 'all') {
      const dur = filterDuration.value;
      if (dur === 'short') result = result.filter(t => t.durationDays <= 7);
      else if (dur === 'medium') result = result.filter(t => t.durationDays >= 8 && t.durationDays <= 12);
      else if (dur === 'long') result = result.filter(t => t.durationDays >= 13);
    }
    if (filterDifficulty && filterDifficulty.value !== 'all') {
      result = result.filter(t => t.difficulty === filterDifficulty.value);
    }
    if (filterSeason && filterSeason.value !== 'all') {
      result = result.filter(t => t.bestSeason.includes(filterSeason.value));
    }

    renderCards(result);
  };

  if (searchBtn) searchBtn.addEventListener('click', applyFilters);
  if (filterRegion) filterRegion.addEventListener('change', applyFilters);
  if (filterDuration) filterDuration.addEventListener('change', applyFilters);
  if (filterDifficulty) filterDifficulty.addEventListener('change', applyFilters);
  if (filterSeason) filterSeason.addEventListener('change', applyFilters);
}

document.addEventListener('DOMContentLoaded', () => {
  initTrekFinder('treks-grid-container');
});
