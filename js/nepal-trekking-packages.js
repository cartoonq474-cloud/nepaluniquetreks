/**
 * Nepal Unique Treks — All Trekking Packages Discovery & Filter Controller
 * Zero-dependency, performant client-side filtering, live search, sorting, and modal integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const catalogSearchInput = document.getElementById('catalog-search-input');
  const catalogSearchClear = document.getElementById('catalog-search-clear');
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroSearchSubmit = document.getElementById('hero-search-submit');
  
  const regionPills = document.querySelectorAll('.region-pill');
  const filterDuration = document.getElementById('filter-duration');
  const filterDifficulty = document.getElementById('filter-difficulty');
  const filterSeason = document.getElementById('filter-season');
  const filterSort = document.getElementById('filter-sort');
  const resetBtn = document.getElementById('reset-all-filters-btn');
  const emptyResetBtn = document.getElementById('empty-reset-btn');
  
  const resultsCount = document.getElementById('results-count');
  const activeChips = document.getElementById('active-chips');
  const searchKbd = document.querySelector('.control-search-kbd');
  const filterBadge = document.getElementById('trek-active-filter-badge');
  const emptyState = document.getElementById('catalog-empty-state');
  const treksContainer = document.getElementById('treks-container');
  const cards = Array.from(document.querySelectorAll('.trek-catalog-card'));

  // Active state object
  const state = {
    search: '',
    region: 'all',
    duration: 'all',
    difficulty: 'all',
    season: 'all',
    sort: 'popularity'
  };

  // Helper to normalize strings
  const normalize = (str) => (str || '').toLowerCase().trim();

  // Render & Filter logic
  function applyFiltersAndSort() {
    let visibleCount = 0;
    const query = normalize(state.search);

    // Filter cards
    cards.forEach(card => {
      const title = card.getAttribute('data-title') || '';
      const region = card.getAttribute('data-region') || '';
      const duration = card.getAttribute('data-duration') || '';
      const difficulty = card.getAttribute('data-difficulty') || '';
      const seasons = (card.getAttribute('data-seasons') || '').split(' ');
      const desc = card.querySelector('.card-trek-desc') ? card.querySelector('.card-trek-desc').textContent.toLowerCase() : '';
      const subregion = card.querySelector('.card-subregion') ? card.querySelector('.card-subregion').textContent.toLowerCase() : '';

      // Match Region
      let matchRegion = true;
      if (state.region !== 'all') {
        matchRegion = (region === state.region);
      }

      // Match Duration
      let matchDuration = true;
      if (state.duration !== 'all') {
        matchDuration = (duration === state.duration);
      }

      // Match Difficulty
      let matchDifficulty = true;
      if (state.difficulty !== 'all') {
        if (state.difficulty === 'easy-moderate') {
          matchDifficulty = difficulty.includes('easy') || difficulty.includes('moderate');
        } else if (state.difficulty === 'moderate') {
          matchDifficulty = difficulty === 'moderate';
        } else if (state.difficulty === 'challenging') {
          matchDifficulty = difficulty.includes('challenging');
        } else if (state.difficulty === 'strenuous') {
          matchDifficulty = difficulty.includes('strenuous') || difficulty.includes('extreme');
        }
      }

      // Match Season
      let matchSeason = true;
      if (state.season !== 'all') {
        matchSeason = seasons.includes(state.season);
      }

      // Match Search Query
      let matchSearch = true;
      if (query) {
        matchSearch = title.includes(query) ||
                      region.includes(query) ||
                      subregion.includes(query) ||
                      desc.includes(query);
      }

      const isVisible = matchRegion && matchDuration && matchDifficulty && matchSeason && matchSearch;
      if (isVisible) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Sort visible cards
    const sortedCards = [...cards].sort((a, b) => {
      const getVal = (el, attr, isNum = true) => {
        const val = el.getAttribute(attr);
        return isNum ? parseFloat(val) || 0 : val;
      };

      switch (state.sort) {
        case 'duration-asc':
          return getVal(a, 'data-days') - getVal(b, 'data-days');
        case 'duration-desc':
          return getVal(b, 'data-days') - getVal(a, 'data-days');
        case 'price-asc':
          return getVal(a, 'data-price') - getVal(b, 'data-price');
        case 'price-desc':
          return getVal(b, 'data-price') - getVal(a, 'data-price');
        case 'altitude-desc':
          return getVal(b, 'data-altitude') - getVal(a, 'data-altitude');
        case 'popularity':
        default:
          return getVal(a, 'data-popularity') - getVal(b, 'data-popularity');
      }
    });

    // Re-append sorted cards in order
    sortedCards.forEach(card => treksContainer.appendChild(card));

    // Update count display
    if (resultsCount) {
      resultsCount.textContent = visibleCount;
    }

    // Toggle Empty State
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'block';
        treksContainer.appendChild(emptyState);
      } else {
        emptyState.style.display = 'none';
      }
    }

    // Render Active Filter Chips
    renderActiveChips();
    
    // Update active filter count badge on Reset button
    updateFilterBadge();
  }

  // Render removable active filter chips
  function renderActiveChips() {
    if (!activeChips) return;
    activeChips.innerHTML = '';

    const createChip = (label, onRemove) => {
      const chip = document.createElement('span');
      chip.className = 'active-chip';
      chip.innerHTML = `<span>${label}</span> <span class="active-chip-remove" aria-hidden="true">&times;</span>`;
      chip.addEventListener('click', onRemove);
      activeChips.appendChild(chip);
    };

    if (state.region !== 'all') {
      const regionNames = {
        everest: 'Everest Khumbu',
        annapurna: 'Annapurna Sanctuary',
        langtang: 'Langtang Valley',
        manaslu: 'Manaslu Circuit',
        mustang: 'Mustang Kingdom',
        remote: 'Remote Wilderness'
      };
      createChip(`Region: ${regionNames[state.region] || state.region}`, () => {
        setRegion('all');
      });
    }

    if (state.duration !== 'all') {
      const durNames = {
        short: '1 - 7 Days',
        medium: '8 - 12 Days',
        long: '13+ Days'
      };
      createChip(`Duration: ${durNames[state.duration] || state.duration}`, () => {
        if (filterDuration) filterDuration.value = 'all';
        state.duration = 'all';
        applyFiltersAndSort();
      });
    }

    if (state.difficulty !== 'all') {
      const diffNames = {
        'easy-moderate': 'Easy - Moderate',
        moderate: 'Moderate',
        challenging: 'Challenging',
        strenuous: 'Strenuous & Extreme'
      };
      createChip(`Difficulty: ${diffNames[state.difficulty] || state.difficulty}`, () => {
        if (filterDifficulty) filterDifficulty.value = 'all';
        state.difficulty = 'all';
        applyFiltersAndSort();
      });
    }

    if (state.season !== 'all') {
      const seasonNames = {
        spring: 'Spring (Mar-May)',
        autumn: 'Autumn (Sep-Nov)',
        winter: 'Winter (Dec-Feb)',
        summer: 'Monsoon / Rain-Shadow'
      };
      createChip(`Season: ${seasonNames[state.season] || state.season}`, () => {
        if (filterSeason) filterSeason.value = 'all';
        state.season = 'all';
        applyFiltersAndSort();
      });
    }

    if (state.search) {
      createChip(`Search: "${state.search}"`, () => {
        if (catalogSearchInput) catalogSearchInput.value = '';
        if (heroSearchInput) heroSearchInput.value = '';
        state.search = '';
        if (catalogSearchClear) catalogSearchClear.classList.remove('visible');
    if (searchKbd) searchKbd.style.display = 'block';
        applyFiltersAndSort();
      });
    }
  }

  // Set Region helper
  function setRegion(regionVal) {
    state.region = regionVal;
    regionPills.forEach(pill => {
      if (pill.getAttribute('data-region') === regionVal) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
    applyFiltersAndSort();
  }

  // Bind Region Pills
  regionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const reg = pill.getAttribute('data-region');
      setRegion(reg || 'all');
    });
  });

  // Bind Regional Showcase Hub Cards
  document.querySelectorAll('.regional-hub-card').forEach(card => {
    card.addEventListener('click', () => {
      const reg = card.getAttribute('data-filter-region');
      const dur = card.getAttribute('data-filter-duration');
      const diff = card.getAttribute('data-filter-difficulty');

      if (reg) {
        setRegion(reg);
      }
      if (dur && filterDuration) {
        filterDuration.value = dur;
        state.duration = dur;
      }
      if (diff && filterDifficulty) {
        filterDifficulty.value = diff;
        state.difficulty = diff;
      }

      applyFiltersAndSort();

      // Smooth scroll to catalog
      const catalogEl = document.getElementById('treks-catalog');
      if (catalogEl) {
        const yOffset = -80;
        const y = catalogEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // Bind Catalog Search Input
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      if (catalogSearchClear) {
        if (state.search) catalogSearchClear.classList.add('visible');
        else catalogSearchClear.classList.remove('visible');
      }
      applyFiltersAndSort();
    });
  }

  if (catalogSearchClear) {
    catalogSearchClear.addEventListener('click', () => {
      if (catalogSearchInput) catalogSearchInput.value = '';
      if (heroSearchInput) heroSearchInput.value = '';
      state.search = '';
      catalogSearchClear.classList.remove('visible');
      applyFiltersAndSort();
    });
  }

  // Bind Hero Search Input & Button
  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      if (catalogSearchInput) catalogSearchInput.value = e.target.value;
      if (catalogSearchClear) {
        if (state.search) catalogSearchClear.classList.add('visible');
        else catalogSearchClear.classList.remove('visible');
      }
      applyFiltersAndSort();
    });

    heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        scrollToCatalog();
      }
    });
  }

  if (heroSearchSubmit) {
    heroSearchSubmit.addEventListener('click', () => {
      scrollToCatalog();
    });
  }

  function scrollToCatalog() {
    const catalogEl = document.getElementById('treks-catalog');
    if (catalogEl) {
      const yOffset = -80;
      const y = catalogEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  // Bind Dropdown Selects
  if (filterDuration) {
    filterDuration.addEventListener('change', (e) => {
      state.duration = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (filterDifficulty) {
    filterDifficulty.addEventListener('change', (e) => {
      state.difficulty = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (filterSeason) {
    filterSeason.addEventListener('change', (e) => {
      state.season = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (filterSort) {
    filterSort.addEventListener('change', (e) => {
      state.sort = e.target.value;
      applyFiltersAndSort();
    });
  }

  // Dynamic active filter badge update
  function updateFilterBadge() {
    let count = 0;
    if (state.region !== 'all') count++;
    if (state.duration !== 'all') count++;
    if (state.difficulty !== 'all') count++;
    if (state.season !== 'all') count++;
    if (state.search) count++;
    if (state.sort !== 'popularity') count++;

    if (filterBadge) {
      if (count > 0) {
        filterBadge.textContent = count;
        filterBadge.style.display = 'inline-flex';
      } else {
        filterBadge.style.display = 'none';
      }
    }
    if (resetBtn) {
      if (count > 0) {
        resetBtn.classList.add('has-active');
      } else {
        resetBtn.classList.remove('has-active');
      }
    }
  }

  // Keyboard shortcut: '/' to focus search, 'Escape' to clear and blur
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== catalogSearchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (catalogSearchInput) {
        catalogSearchInput.focus();
        if (searchKbd) searchKbd.style.display = 'none';
      }
    } else if (e.key === 'Escape' && document.activeElement === catalogSearchInput) {
      if (catalogSearchInput) {
        catalogSearchInput.value = '';
        state.search = '';
        catalogSearchInput.blur();
        if (catalogSearchClear) catalogSearchClear.classList.remove('visible');
        if (searchKbd) searchKbd.style.display = 'block';
        applyFiltersAndSort();
      }
    }
  });

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('focus', () => {
      if (searchKbd) searchKbd.style.display = 'none';
    });
    catalogSearchInput.addEventListener('blur', () => {
      if (searchKbd && !catalogSearchInput.value) searchKbd.style.display = 'block';
    });
  }

  // Reset all filters function
  function resetAll() {
    state.search = '';
    state.region = 'all';
    state.duration = 'all';
    state.difficulty = 'all';
    state.season = 'all';
    state.sort = 'popularity';

    if (catalogSearchInput) catalogSearchInput.value = '';
    if (heroSearchInput) heroSearchInput.value = '';
    if (catalogSearchClear) catalogSearchClear.classList.remove('visible');
    if (filterDuration) filterDuration.value = 'all';
    if (filterDifficulty) filterDifficulty.value = 'all';
    if (filterSeason) filterSeason.value = 'all';
    if (filterSort) filterSort.value = 'popularity';

    regionPills.forEach(pill => {
      if (pill.getAttribute('data-region') === 'all') pill.classList.add('active');
      else pill.classList.remove('active');
    });

    applyFiltersAndSort();
  }

  if (resetBtn) resetBtn.addEventListener('click', resetAll);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAll);

  // Inquiry Modal dynamic trek title filling
  const inqTrekInput = document.getElementById('inq-trek');
  const inqNotes = document.getElementById('inq-notes');
  const inquiryModal = document.getElementById('inquiry-modal');

  document.querySelectorAll('.open-inquiry-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trekTitle = btn.getAttribute('data-trek-title') || 'General Himalayan Trek Inquiry';
      if (inqTrekInput) {
        inqTrekInput.value = trekTitle;
      }
      if (inqNotes && !inqNotes.value && trekTitle !== 'General Himalayan Trek Inquiry') {
        inqNotes.value = `Hi, I would like to inquire about the ${trekTitle}. Please provide available departure dates, group pricing, and itinerary details.`;
      }
      if (inquiryModal) {
        inquiryModal.classList.add('active');
        document.body.classList.add('mobile-nav-lock');
      }
    });
  });

  // Modal close handler
  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (modalCloseBtn && inquiryModal) {
    modalCloseBtn.addEventListener('click', () => {
      inquiryModal.classList.remove('active');
      document.body.classList.remove('mobile-nav-lock');
    });

    inquiryModal.addEventListener('click', (e) => {
      if (e.target === inquiryModal) {
        inquiryModal.classList.remove('active');
        document.body.classList.remove('mobile-nav-lock');
      }
    });
  }

  // FAQ Accordion Handlers
  document.querySelectorAll('.faq-accordion-item').forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close other items (optional: accordion behavior)
        document.querySelectorAll('.faq-accordion-item').forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-trigger');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        if (isActive) {
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // Parse URL search parameters on initial load
  const urlParams = new URLSearchParams(window.location.search);
  const paramRegion = urlParams.get('region');
  const paramDuration = urlParams.get('duration');
  const paramDifficulty = urlParams.get('difficulty');
  const paramSeason = urlParams.get('season');
  const paramQuery = urlParams.get('q') || urlParams.get('search');

  if (paramRegion) setRegion(paramRegion);
  if (paramDuration && filterDuration) {
    filterDuration.value = paramDuration;
    state.duration = paramDuration;
  }
  if (paramDifficulty && filterDifficulty) {
    filterDifficulty.value = paramDifficulty;
    state.difficulty = paramDifficulty;
  }
  if (paramSeason && filterSeason) {
    filterSeason.value = paramSeason;
    state.season = paramSeason;
  }
  if (paramQuery) {
    state.search = paramQuery;
    if (catalogSearchInput) catalogSearchInput.value = paramQuery;
    if (heroSearchInput) heroSearchInput.value = paramQuery;
    if (catalogSearchClear) catalogSearchClear.classList.add('visible');
  }

  // Initial trigger
  applyFiltersAndSort();
});
