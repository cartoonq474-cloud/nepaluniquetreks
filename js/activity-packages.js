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
      text: "Explore All 91 Himalayan Trekking Packages"
    },
    climbing: {
      url: "peak-climbing-nepal/",
      text: "Explore All Peak Climbing Expeditions"
    },
    tours: {
      url: "nepal-tour-packages/",
      text: "Explore All 24 Nepal Cultural Tours & Safaris"
    },
    hikes: {
      url: "nepal-trekking-packages/",
      text: "Explore All Nepal Day Hikes & Short Treks"
    },
    heli: {
      url: "tour/everest-base-camp-helicopter-tour/",
      text: "Explore All Scenic Helicopter Expeditions"
    }
  };

  const activityData = {
    trekking: [
      {
        image: "images/treks/everest-base-camp/everest-base-camp-trekkers-team-circle-02.jpg",
        duration: "15 DAYS",
        tags: ["CLASSIC", "HIGH ALTITUDE", "TEAHOUSE"],
        name: "Everest Base Camp Trek",
        link: "trek/everest-base-camp-trek/",
        region: "Khumbu Region, Nepal",
        altitude: "5545 m",
        difficulty: "challenging",
        summary: "Trek to the foot of Mt. Everest through Sherpa villages, Tengboche Monastery, and Kala Patthar viewpoint.",
        price: "$1,395",
        reviews: "142"
      },
      {
        image: "images/treks/annapurna-circuit/annapurna-circuit-tilicho-lake-trekking-group-tilicho-lake-11.jpg",
        duration: "14 DAYS",
        tags: ["SCENIC", "PASS CROSSING", "LODGE"],
        name: "Annapurna Circuit Trek",
        link: "trek/annapurna-circuit-trek/",
        region: "Annapurna Massif, Nepal",
        altitude: "5416 m",
        difficulty: "moderate",
        summary: "Traverse diverse eco-zones from lush rhododendron forests to the dramatic Thorong La Pass high-altitude desert.",
        price: "$1,295",
        reviews: "118"
      },
      {
        image: "images/treks/manaslu-circuit/manaslu-circuit-mountain-sunrise-04.jpg",
        duration: "15 DAYS",
        tags: ["RESTRICTED", "REMOTE", "CULTURE"],
        name: "Manaslu Circuit Trek",
        link: "trek/manaslu-circuit-trek/",
        region: "Manaslu Conservation Area",
        altitude: "5106 m",
        difficulty: "challenging",
        summary: "Unspoiled Tibetan Buddhist culture around Mt. Manaslu (8,163m) with crossing of snow-bound Larke La Pass.",
        price: "$1,050",
        reviews: "64"
      }
    ],
    climbing: [
      {
        image: "uploads/island.jpg",
        duration: "12 DAYS",
        tags: ["GLACIER", "SUMMIT", "TECHNICAL"],
        name: "Island Peak Climbing (6,189m)",
        link: "trek/island-peak-climbing/",
        region: "Imja Valley, Everest Region",
        altitude: "6189 m",
        difficulty: "strenuous",
        summary: "Attempt Nepal's most popular 6,000m+ Himalayan summit climb using crampons and fixed ropes facing Lhotse.",
        price: "$2,250",
        reviews: "56"
      },
      {
        image: "images/treks/mera-peak/mera-peak-climbers-summit-11.jpg",
        duration: "16 DAYS",
        tags: ["TREKKING PEAK", "HIGH PASS", "EXPEDITION"],
        name: "Mera Peak Climbing (6,476m)",
        link: "trek/mera-peak-climbing/",
        region: "Hinku Valley, Nepal",
        altitude: "6476 m",
        difficulty: "challenging",
        summary: "Nepal's highest non-technical trekking peak offering panoramic summit views of five of the world's 8,000m peaks.",
        price: "$2,700",
        reviews: "48"
      },
      {
        image: "uploads/lobuche-east-peak-summit-6119m.jpg",
        duration: "19 DAYS",
        tags: ["EVEREST REGION", "ICE CLIMB", "ALPINE"],
        name: "Lobuche Peak Climbing (6,119m)",
        link: "trek/lobuche-peak-climbing/",
        region: "Khumbu Valley, Nepal",
        altitude: "6119 m",
        difficulty: "strenuous",
        summary: "Technical alpine ridge climbing overlooking Everest, Lhotse, Nuptse, and Ama Dablam from Lobuche High Camp.",
        price: "$2,250",
        reviews: "39"
      }
    ],
    tours: [
      {
        image: "uploads/kathmandu-durbar-squire.jpg",
        duration: "5 DAYS",
        tags: ["HERITAGE", "TEMPLE", "EASY"],
        name: "Kathmandu Pokhara Tour",
        link: "tour/kathmandu-pokhara-tour/",
        region: "Kathmandu & Pokhara Valley",
        altitude: "1400 m",
        difficulty: "easy",
        summary: "Discover UNESCO World Heritage durbar squares, ancient stupas, Fewa Lake boating, and Himalayan sunrise views.",
        price: "$595",
        reviews: "124"
      },
      {
        image: "uploads/nepal-chitwan-jungle-safari.jpg",
        duration: "7 DAYS",
        tags: ["SAFARI", "WILDLIFE", "NATURE"],
        name: "Chitwan Jungle Safari Holiday",
        link: "tour/chitwan-national-park-safari/",
        region: "Chitwan National Park, Nepal",
        altitude: "415 m",
        difficulty: "easy",
        summary: "Explore UNESCO-listed Chitwan National Park for one-horned rhinos, Royal Bengal tigers, and Tharu village culture.",
        price: "Quote",
        reviews: "82"
      },
      {
        image: "uploads/kathmandu-pokhara-lumbini-tours.jpg",
        duration: "9 DAYS",
        tags: ["PILGRIMAGE", "HERITAGE", "CULTURE"],
        name: "Buddhist Pilgrimage Tour Of Nepal",
        link: "tour/buddhist-pilgrimage-tour-of-nepal/",
        region: "Kathmandu & Lumbini, Nepal",
        altitude: "1400 m",
        difficulty: "easy",
        summary: "Sacred pilgrimage tracing Boudhanath, Swayambhunath, Namobuddha, and Maya Devi Temple in Lumbini.",
        price: "$895",
        reviews: "67"
      }
    ],
    hikes: [
      {
        image: "uploads/nagarkot.JPG",
        duration: "3 DAYS",
        tags: ["SUNRISE", "VALLEY VIEW", "SHORT HIKE"],
        name: "Chisapani Nagarkot Hike",
        link: "trek/chisapani-nagarkot-hike/",
        region: "Kathmandu Valley Rim",
        altitude: "2175 m",
        difficulty: "easy",
        summary: "Classic 3-day ridge hike from Sundarijal through Shivapuri forest to Chisapani and Nagarkot sunrise viewpoint.",
        price: "$295",
        reviews: "91"
      },
      {
        image: "uploads/namobudha-hiking.jpg",
        duration: "6 DAYS",
        tags: ["MONASTERY", "RIDGE WALK", "HERITAGE"],
        name: "Namobuddha Hiking Tour",
        link: "trek/namobuddha-hiking/",
        region: "Kathmandu & Kavre Ridge",
        altitude: "1750 m",
        difficulty: "moderate",
        summary: "Scenic cultural walking trail linking sacred Namobuddha monastery, Dhulikhel, Panauti, and Balthali villages.",
        price: "Quote",
        reviews: "53"
      },
      {
        image: "uploads/shivapuri-hiking.jpg",
        duration: "1 DAY",
        tags: ["NATIONAL PARK", "DAY HIKE", "FOREST"],
        name: "Sivapuri Hiking Day Trip",
        link: "trek/sivapuri-hiking/",
        region: "Shivapuri National Park",
        altitude: "2732 m",
        difficulty: "moderate",
        summary: "Refreshing full-day summit hike from Budhanilkantha to Shivapuri Peak (2,732m) and Nagi Gompa monastery.",
        price: "Quote",
        reviews: "77"
      }
    ],
    heli: [
      {
        image: "uploads/everest-base-camp-trek-with-heli-return.jpg",
        duration: "1 DAY",
        tags: ["HELI TOUR", "EVEREST", "LUXURY"],
        name: "Everest Base Camp Helicopter Tour",
        link: "tour/everest-base-camp-helicopter-tour/",
        region: "Khumbu Valley, Nepal",
        altitude: "5545 m",
        difficulty: "easy",
        summary: "Fly directly from Kathmandu over Everest Base Camp & Khumbu Icefall with panoramic Kala Patthar flyover.",
        price: "$1,400",
        reviews: "88"
      },
      {
        image: "images/treks/everest-base-camp/everest-base-camp-trekking-group-mountain-panorama-11.jpg",
        duration: "1 DAY",
        tags: ["BREAKFAST", "EVEREST VIEW", "EXPRESS"],
        name: "Everest Helicopter Tour with Breakfast",
        link: "tour/everest-heli-tour-with-breakfast/",
        region: "Hotel Everest View (3,880m)",
        altitude: "5545 m",
        difficulty: "easy",
        summary: "Morning helicopter charter into the Khumbu Valley featuring gourmet champagne breakfast overlooking Mt. Everest.",
        price: "$1,200",
        reviews: "72"
      },
      {
        image: "uploads/everest-base-camp-trek-with-heli-return-1.jpg",
        duration: "12 DAYS",
        tags: ["TREK + HELI", "COMBO", "PREMIUM"],
        name: "EBC Trek with Heli Return",
        link: "trek/everest-base-camp-trek-with-heli-return/",
        region: "Everest Base Camp, Khumbu",
        altitude: "5545 m",
        difficulty: "challenging",
        summary: "Hike up to Everest Base Camp and Kala Patthar, then sweep back cleanly over the Khumbu Glacier by helicopter.",
        price: "$3,150",
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
