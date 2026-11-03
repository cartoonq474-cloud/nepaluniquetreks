// Activity Packages Category Switcher with Clean Card Design & Image Hover Overlay
document.addEventListener('DOMContentLoaded', () => {
  const categoryBtns = document.querySelectorAll('.act-category-btn');
  const packagesContainer = document.getElementById('act-packages-grid');
  const progressDots = document.querySelectorAll('.act-progress-dot');

  if (!categoryBtns.length || !packagesContainer) return;

  const activityData = {
    trekking: [
      {
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
        duration: "14 DAYS",
        tags: ["CLASSIC", "HIGH ALTITUDE", "TEAHOUSE"],
        name: "Everest Base Camp Trek",
        slug: "everest-base-camp-trek",
        region: "Khumbu Region, Nepal",
        altitude: "5545 m",
        difficulty: "challenging",
        summary: "Trek to the foot of Mt. Everest through Sherpa villages, Tengboche Monastery, and Kala Patthar viewpoint.",
        price: "$1399",      },
      {
        image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80",
        duration: "12 DAYS",
        tags: ["SCENIC", "PASS CROSSING", "LODGE"],
        name: "Annapurna Circuit Expedition",
        slug: "annapurna-circuit-trek",
        // Annapurna mountain image replacement
        region: "Annapurna Massif, Nepal",
        altitude: "5416 m",
        difficulty: "moderate",
        summary: "Traverse diverse eco-zones from lush rhododendron forests to the dramatic Thorong La Pass high-altitude desert.",
        price: "$1150",      },
      {
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
        duration: "16 DAYS",
        tags: ["RESTRICTED", "REMOTE", "CULTURE"],
        name: "Manaslu Circuit & Larke Pass",
        slug: "manaslu-circuit-trek",
        region: "Manaslu Conservation Area",
        altitude: "5106 m",
        difficulty: "challenging",
        summary: "Unspoiled Tibetan Buddhist culture around Mt. Manaslu (8,163m) with crossing of snow-bound Larke La Pass.",
        price: "$1399",      }
    ],
    climbing: [
      {
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        duration: "19 DAYS",
        tags: ["GLACIER", "SUMMIT", "TECHNICAL"],
        name: "Island Peak Climbing (6,189m)",
        region: "Imja Valley, Everest Region",
        altitude: "6189 m",
        difficulty: "strenuous",
        summary: "Combine Everest Base Camp trekking with a thrilling 6,000m+ Himalayan summit climb using crampons and fixed ropes.",
        price: "$1899",      },
      {
        image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=600&q=80",
        duration: "18 DAYS",
        tags: ["TREKKING PEAK", "HIGH PASS", "EXPEDITION"],
        name: "Mera Peak Expedition (6,476m)",
        region: "Hinku Valley, Nepal",
        altitude: "6476 m",
        difficulty: "challenging",
        summary: "Nepal's highest non-technical trekking peak offering panoramic summit views of 5 of the world's 14 8,000m peaks.",
        price: "$1999",      },
      {
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
        duration: "21 DAYS",
        tags: ["EVEREST REGION", "ICE CLIMB", "ALPINE"],
        name: "Lobuche East Peak (6,119m)",
        region: "Khumbu Valley, Nepal",
        altitude: "6119 m",
        difficulty: "strenuous",
        summary: "Technical alpine ridge climbing overlooking Everest, Lhotse, Nuptse, and Ama Dablam from the Lobuche High Camp.",
        price: "$2199",      }
    ],
    tours: [
      {
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
        duration: "7 DAYS",
        tags: ["HERITAGE", "TEMPLE", "EASY"],
        name: "Kathmandu & Pokhara Heritage",
        region: "Kathmandu & Pokhara Valley",
        altitude: "1400 m",
        difficulty: "easy",
        summary: "Discover UNESCO World Heritage durbar squares, ancient stupas, Fewa Lake boating, and Himalayan sunrise views.",
        price: "$699",      },
      {
        image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5?auto=format&fit=crop&w=600&q=80",
        duration: "10 DAYS",
        tags: ["SAFARI", "PILGRIMAGE", "NATURE"],
        name: "Nepal Wildlife & Lumbini Tour",
        region: "Chitwan & Lumbini, Nepal",
        altitude: "820 m",
        difficulty: "easy",
        summary: "Jungle safari with rhinos & tigers in Chitwan National Park followed by spiritual pilgrimage to Lord Buddha's birthplace.",
        price: "$899",      },
      {
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
        duration: "12 DAYS",
        tags: ["CROSS BORDER", "DRAGON KINGDOM", "CULTURE"],
        name: "Bhutan & Nepal Combined Tour",
        region: "Kathmandu & Paro/Thimphu",
        altitude: "2320 m",
        difficulty: "moderate",
        summary: "Experience Kathmandu's historic temples and fly into Bhutan to hike Tiger's Nest Monastery in the Land of the Thunder Dragon.",
        price: "$1799",      }
    ],
    hikes: [
      {
        image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=600&q=80",
        duration: "1 DAY",
        tags: ["SUNRISE", "VALLEY VIEW", "DAY TRIP"],
        name: "Nagarkot Sunrise & Changunarayan",
        region: "Kathmandu Rim, Nepal",
        altitude: "2175 m",
        difficulty: "easy",
        summary: "Early morning mountain panorama from Nagarkot tower followed by a scenic downhill walk to Nepal's oldest temple.",
        price: "$89",      },
      {
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
        duration: "1 DAY",
        tags: ["MONASTERY", "RIDGE WALK", "FOREST"],
        name: "Champadevi Ridge & Monastery Trail",
        region: "Southern Kathmandu Valley",
        altitude: "2280 m",
        difficulty: "moderate",
        summary: "Peaceful forest trail passing Buddhist stupas and pine ridges with panoramic views of Langtang and Ganesh Himal.",
        price: "$79",      },
      {
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
        duration: "2 DAYS",
        tags: ["NATIONAL PARK", "OVERNIGHT", "FLORA"],
        name: "Shivapuri Peak & Chisapani Hike",
        region: "Shivapuri National Park",
        altitude: "2732 m",
        difficulty: "moderate",
        summary: "Overnight trek through pristine oak watershed forests to Chisapani for breathtaking Himalayan sunset and sunrise vistas.",
        price: "$169",      }
    ],
    heli: [
      {
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
        duration: "1 DAY",
        tags: ["HELI TOUR", "EVEREST", "LUXURY"],
        name: "Everest Base Camp Heli Flyover",
        region: "Khumbu Valley, Nepal",
        altitude: "5364 m",
        difficulty: "easy",
        summary: "Fly directly over Everest Base Camp & Khumbu Icefall with breakfast landing at Hotel Everest View (3,880m).",
        price: "$999",      },
      {
        image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80",
        duration: "1 DAY",
        tags: ["ANNAPURNA", "PANORAMA", "EXPRESS"],
        name: "Annapurna Base Camp Heli Sightseeing",
        region: "Annapurna Sanctuary",
        altitude: "4130 m",
        difficulty: "easy",
        summary: "Direct morning helicopter shuttle from Pokhara into the heart of the 360-degree Annapurna mountain amphitheater.",
        price: "$749",      },
      {
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
        duration: "1 DAY",
        tags: ["SACRED LAKE", "LANGTANG", "CHARTER"],
        name: "Langtang Gosainkunda Heli Charter",
        region: "Langtang National Park",
        altitude: "4380 m",
        difficulty: "easy",
        summary: "Scenic flight over Kathmandu Valley landing at sacred alpine Gosainkunda Lake for holy dip and Himalayan photography.",
        price: "$649",      }
    ]
  };

  function renderCategoryPackages(categoryKey) {
    const packages = activityData[categoryKey] || activityData.trekking;
    
    packagesContainer.style.opacity = '0';
    packagesContainer.style.transition = 'opacity 0.2s ease';
    setTimeout(() => {
      packagesContainer.innerHTML = packages.map(pkg => `
        <div class="act-package-card">
          <!-- Top Photo Banner with Floating Duration Badge & Smooth Hover Overlay -->
          <div class="act-card-img-wrapper">
            <img src="${pkg.image}" alt="${pkg.name}" class="act-card-img" loading="lazy">
            <div class="act-card-duration-badge">${pkg.duration}</div>

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
              <div class="act-hover-hint">Hovered for details</div>
            </div>
          </div>

          <!-- Clean Card Body -->
          <div class="act-card-content">
            <div>
              <h3 class="act-card-title">${pkg.name}</h3>
              <div class="act-card-subregion">${pkg.region}</div>
            </div>

            <!-- Bottom Price & Inquire Now Row -->
            <div class="act-card-bottom-row">
              <div class="act-price-box">
                <span class="act-starting-label">Starting From</span>
                <span class="act-price-val">${pkg.price}</span>
              </div>
              <button class="btn-inquire-now open-inquiry-btn">Inquire Now</button>
            </div>
          </div>
        </div>
      `).join('');

      packagesContainer.style.opacity = '1';
    }, 180);
  }

  categoryBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      progressDots.forEach(d => d.classList.remove('active'));
      if (progressDots[index]) progressDots[index].classList.add('active');

      const catKey = btn.getAttribute('data-act-cat');
      renderCategoryPackages(catKey);
    });
  });

  // Initial render
  renderCategoryPackages('trekking');
});
