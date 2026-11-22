// Activity Packages Category Switcher with Clean Card Design & Interactive Controls
document.addEventListener('DOMContentLoaded', () => {
  const categoryBtns = document.querySelectorAll('.act-category-btn');
  const packagesContainer = document.getElementById('act-packages-grid');
  const exploreLink = document.getElementById('act-category-all-link');
  const exploreText = document.getElementById('act-explore-link-text');

  if (!categoryBtns.length || !packagesContainer) return;

  const categoryExploreLinks = {
    trekking: {
      url: "nepal-trekking-packages/",
      text: "Explore All 40+ Himalayan Trekking Packages"
    },
    climbing: {
      url: "peak-climbing-nepal/",
      text: "Explore All Peak Climbing Expeditions (10+)"
    },
    tours: {
      url: "nepal-tour-packages/",
      text: "Explore All Nepal Cultural Tours & Safaris"
    },
    hikes: {
      url: "nepal-tour-packages/",
      text: "Explore All Nepal Day Hikes & Short Treks"
    },
    heli: {
      url: "everest-region-treks/",
      text: "Explore All Scenic Helicopter Expeditions"
    }
  };

  const activityData = {
    trekking: [
      {
        image: "images/treks/everest-base-camp/everest-base-camp-trekkers-team-circle-02.jpg",
        duration: "14 DAYS",
        tags: ["CLASSIC", "HIGH ALTITUDE", "TEAHOUSE"],
        name: "Everest Base Camp Trek",
        link: "trek/everest-base-camp-trek/",
        region: "Khumbu Region, Nepal",
        altitude: "5545 m",
        difficulty: "challenging",
        summary: "Trek to the foot of Mt. Everest through Sherpa villages, Tengboche Monastery, and Kala Patthar viewpoint.",
        price: "$1399",
        reviews: "142"
      },
      {
        image: "images/treks/annapurna-circuit/annapurna-circuit-tilicho-lake-trekking-group-tilicho-lake-11.jpg",
        duration: "12 DAYS",
        tags: ["SCENIC", "PASS CROSSING", "LODGE"],
        name: "Annapurna Circuit Expedition",
        link: "trek/annapurna-circuit-trek/",
        region: "Annapurna Massif, Nepal",
        altitude: "5416 m",
        difficulty: "moderate",
        summary: "Traverse diverse eco-zones from lush rhododendron forests to the dramatic Thorong La Pass high-altitude desert.",
        price: "$1150",
        reviews: "118"
      },
      {
        image: "images/treks/manaslu-circuit/manaslu-circuit-mountain-sunrise-04.jpg",
        duration: "16 DAYS",
        tags: ["RESTRICTED", "REMOTE", "CULTURE"],
        name: "Manaslu Circuit & Larke Pass",
        link: "trek/manaslu-circuit-trek/",
        region: "Manaslu Conservation Area",
        altitude: "5106 m",
        difficulty: "challenging",
        summary: "Unspoiled Tibetan Buddhist culture around Mt. Manaslu (8,163m) with crossing of snow-bound Larke La Pass.",
        price: "$1399",
        reviews: "64"
      }
    ],
    climbing: [
      {
        image: "uploads/island.jpg",
        duration: "19 DAYS",
        tags: ["GLACIER", "SUMMIT", "TECHNICAL"],
        name: "Island Peak Climbing (6,189m)",
        link: "peak-climbing-nepal/",
        region: "Imja Valley, Everest Region",
        altitude: "6189 m",
        difficulty: "strenuous",
        summary: "Combine Everest Base Camp trekking with a thrilling 6,000m+ Himalayan summit climb using crampons and fixed ropes.",
        price: "$1899",
        reviews: "56"
      },
      {
        image: "images/treks/mera-peak/mera-peak-climbers-summit-11.jpg",
        duration: "18 DAYS",
        tags: ["TREKKING PEAK", "HIGH PASS", "EXPEDITION"],
        name: "Mera Peak Expedition (6,476m)",
        link: "trek/mera-peak-climbing/",
        region: "Hinku Valley, Nepal",
        altitude: "6476 m",
        difficulty: "challenging",
        summary: "Nepal's highest non-technical trekking peak offering panoramic summit views of 5 of the world's 14 8,000m peaks.",
        price: "$1999",
        reviews: "48"
      },
      {
        image: "uploads/lobuche-east-peak-summit-6119m.jpg",
        duration: "21 DAYS",
        tags: ["EVEREST REGION", "ICE CLIMB", "ALPINE"],
        name: "Lobuche East Peak (6,119m)",
        link: "peak-climbing-nepal/",
        region: "Khumbu Valley, Nepal",
        altitude: "6119 m",
        difficulty: "strenuous",
        summary: "Technical alpine ridge climbing overlooking Everest, Lhotse, Nuptse, and Ama Dablam from the Lobuche High Camp.",
        price: "$2199",
        reviews: "39"
      }
    ],
    tours: [
      {
        image: "uploads/kathmandu-durbar-squire.jpg",
        duration: "7 DAYS",
        tags: ["HERITAGE", "TEMPLE", "EASY"],
        name: "Kathmandu & Pokhara Heritage",
        link: "nepal-tour-packages/",
        region: "Kathmandu & Pokhara Valley",
        altitude: "1400 m",
        difficulty: "easy",
        summary: "Discover UNESCO World Heritage durbar squares, ancient stupas, Fewa Lake boating, and Himalayan sunrise views.",
        price: "$699",
        reviews: "124"
      },
      {
        image: "uploads/nepal-chitwan-jungle-safari.jpg",
        duration: "10 DAYS",
        tags: ["SAFARI", "PILGRIMAGE", "NATURE"],
        name: "Nepal Wildlife & Lumbini Tour",
        link: "nepal-tour-packages/",
        region: "Chitwan & Lumbini, Nepal",
        altitude: "820 m",
        difficulty: "easy",
        summary: "Jungle safari with rhinos & tigers in Chitwan National Park followed by spiritual pilgrimage to Lord Buddha's birthplace.",
        price: "$899",
        reviews: "82"
      },
      {
        image: "uploads/nepal-bhutan-tour-package.jpg",
        duration: "12 DAYS",
        tags: ["CROSS BORDER", "DRAGON KINGDOM", "CULTURE"],
        name: "Bhutan & Nepal Combined Tour",
        link: "tours-nepal/",
        region: "Kathmandu & Paro/Thimphu",
        altitude: "2320 m",
        difficulty: "moderate",
        summary: "Experience Kathmandu's historic temples and fly into Bhutan to hike Tiger's Nest Monastery in the Land of the Thunder Dragon.",
        price: "$1799",
        reviews: "67"
      }
    ],
    hikes: [
      {
        image: "uploads/nagarkot.JPG",
        duration: "1 DAY",
        tags: ["SUNRISE", "VALLEY VIEW", "DAY TRIP"],
        name: "Nagarkot Sunrise & Changunarayan",
        link: "nepal-tour-packages/",
        region: "Kathmandu Rim, Nepal",
        altitude: "2175 m",
        difficulty: "easy",
        summary: "Early morning mountain panorama from Nagarkot tower followed by a scenic downhill walk to Nepal's oldest temple.",
        price: "$89",
        reviews: "91"
      },
      {
        image: "uploads/namobudha-hiking.jpg",
        duration: "1 DAY",
        tags: ["MONASTERY", "RIDGE WALK", "FOREST"],
        name: "Champadevi Ridge & Monastery Trail",
        link: "nepal-tour-packages/",
        region: "Southern Kathmandu Valley",
        altitude: "2280 m",
        difficulty: "moderate",
        summary: "Peaceful forest trail passing Buddhist stupas and pine ridges with panoramic views of Langtang and Ganesh Himal.",
        price: "$79",
        reviews: "53"
      },
      {
        image: "uploads/shivapuri-hiking.jpg",
        duration: "2 DAYS",
        tags: ["NATIONAL PARK", "OVERNIGHT", "FLORA"],
        name: "Shivapuri Peak & Chisapani Hike",
        link: "nepal-tour-packages/",
        region: "Shivapuri National Park",
        altitude: "2732 m",
        difficulty: "moderate",
        summary: "Overnight trek through pristine oak watershed forests to Chisapani for breathtaking Himalayan sunset and sunrise vistas.",
        price: "$169",
        reviews: "77"
      }
    ],
    heli: [
      {
        image: "uploads/everest-base-camp-trek-with-heli-return.jpg",
        duration: "1 DAY",
        tags: ["HELI TOUR", "EVEREST", "LUXURY"],
        name: "Everest Base Camp Heli Flyover",
        link: "everest-region-treks/",
        region: "Khumbu Valley, Nepal",
        altitude: "5364 m",
        difficulty: "easy",
        summary: "Fly directly over Everest Base Camp & Khumbu Icefall with breakfast landing at Hotel Everest View (3,880m).",
        price: "$999",
        reviews: "88"
      },
      {
        image: "images/treks/annapurna-base-camp/annapurna-base-camp-annapurna-range-sunrise-03.jpg",
        duration: "1 DAY",
        tags: ["ANNAPURNA", "PANORAMA", "EXPRESS"],
        name: "Annapurna Base Camp Heli Sightseeing",
        link: "annapurna-region-treks/",
        region: "Annapurna Sanctuary",
        altitude: "4130 m",
        difficulty: "easy",
        summary: "Direct morning helicopter shuttle from Pokhara into the heart of the 360-degree Annapurna mountain amphitheater.",
        price: "$749",
        reviews: "72"
      },
      {
        image: "uploads/langtang-gosaikunda-lake-trek.jpg",
        duration: "1 DAY",
        tags: ["SACRED LAKE", "LANGTANG", "CHARTER"],
        name: "Langtang Gosainkunda Heli Charter",
        link: "langtang-region-treks/",
        region: "Langtang National Park",
        altitude: "4380 m",
        difficulty: "easy",
        summary: "Scenic flight over Kathmandu Valley landing at sacred alpine Gosainkunda Lake for holy dip and Himalayan photography.",
        price: "$649",
        reviews: "45"
      }
    ]
  };

  function renderCategoryPackages(categoryKey) {
    const packages = activityData[categoryKey] || activityData.trekking;

    // Update bottom explore button
    const linkInfo = categoryExploreLinks[categoryKey] || categoryExploreLinks.trekking;
    if (exploreLink && exploreText) {
      exploreLink.href = linkInfo.url;
      exploreText.textContent = linkInfo.text;
    }

    packagesContainer.style.opacity = '0';
    packagesContainer.style.transform = 'translateY(10px)';

    setTimeout(() => {
      packagesContainer.innerHTML = packages.map(pkg => `
        <div class="act-package-card">
          <!-- Top Photo Banner with Duration Badge & Hover Overlay -->
          <div class="act-card-img-wrapper">
            <img src="${pkg.image}" alt="${pkg.name}" class="act-card-img" loading="lazy">
            <div class="act-card-duration-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${pkg.duration}</span>
            </div>
            <span class="act-card-feature-badge">${pkg.tags[0]}</span>

            <!-- Glassmorphism Hover Info Overlay -->
            <div class="act-img-hover-overlay">
              <div class="act-hover-tags">
                ${pkg.tags.map(t => `<span class="act-hover-tag-pill">${t}</span>`).join('')}
              </div>
              <div class="act-hover-meta">
                <div class="act-hover-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Max: <strong>${pkg.altitude}</strong></span>
                </div>
                <div class="act-hover-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F2A623" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span>${pkg.difficulty}</span>
                </div>
              </div>
              <p class="act-hover-summary">${pkg.summary}</p>
              <a href="${pkg.link}" class="act-hover-explore-btn">
                <span>View Full Itinerary</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
          </div>

          <!-- Card Body -->
          <div class="act-card-content">
            <div class="act-card-top-content">
              <!-- Rating & Verified Row -->
              <div class="package-rating-row">
                <div class="act-stars-group">
                  <span class="stars-gold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </span>
                  <span class="rating-score">5.0</span>
                  <span class="reviews-count">(${pkg.reviews || '95'})</span>
                </div>
                <span class="act-guaranteed-badge">Guaranteed</span>
              </div>

              <!-- Title with Link -->
              <h3 class="act-card-title">
                <a href="${pkg.link}" class="act-title-link">${pkg.name}</a>
              </h3>

              <!-- Location / Subregion -->
              <div class="act-card-subregion">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22845F" stroke-width="2.2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${pkg.region}</span>
              </div>

              <!-- Specs Chips -->
              <div class="act-chips-row">
                <span class="act-spec-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
                  ${pkg.altitude}
                </span>
                <span class="act-spec-chip act-grade-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  ${pkg.difficulty}
                </span>
              </div>
            </div>

            <!-- Bottom Price & CTA Row -->
            <div class="act-card-bottom-row">
              <div class="act-price-box">
                <span class="act-starting-label">Starting From</span>
                <div class="act-price-display">
                  <span class="act-price-val">${pkg.price}</span>
                  <span class="act-price-period">/ pax</span>
                </div>
              </div>
              <div class="act-card-actions">
                <a href="${pkg.link}" class="act-btn-details" title="View details of ${pkg.name}">Details</a>
                <button class="btn-inquire-now open-inquiry-btn" data-trek-title="${pkg.name}">Inquire</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      packagesContainer.style.opacity = '1';
      packagesContainer.style.transform = 'translateY(0)';
    }, 180);
  }

  categoryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const catKey = btn.getAttribute('data-act-cat');
      renderCategoryPackages(catKey);
    });
  });

  // Initial render
  renderCategoryPackages('trekking');
});
