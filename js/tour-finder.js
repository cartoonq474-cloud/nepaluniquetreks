/**
 * Nepal Unique Treks — Nepal Tour Packages Interactive Finder & Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const catPills = document.querySelectorAll('.tour-cat-pill');
  const searchInput = document.getElementById('tour-search-input');
  const durationSelect = document.getElementById('tour-duration-select');
  const sortSelect = document.getElementById('tour-sort-select');
  const resetBtn = document.getElementById('tour-reset-filters');
  const cardsContainer = document.getElementById('tour-cards-container');
  const resultsCounter = document.getElementById('tour-active-count');
  const noResultsBox = document.getElementById('tour-no-results');

  if (!cardsContainer) return;

  const tourCards = Array.from(cardsContainer.querySelectorAll('.tour-card'));

  let activeCategory = 'all';
  let activeDuration = 'all';
  let searchQuery = '';
  let activeSort = 'recommended';

  function filterAndSortTours() {
    let visibleCount = 0;
    const cleanQuery = searchQuery.trim().toLowerCase();

    // 1. Filter
    tourCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardDays = parseInt(card.getAttribute('data-days') || '0', 10);
      const cardSearchText = (card.getAttribute('data-search') || '').toLowerCase();
      const cardTitle = (card.querySelector('.tour-card-title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.tour-desc')?.textContent || '').toLowerCase();

      // Check Category
      const matchCategory = (activeCategory === 'all') || (cardCategory.split(' ').includes(activeCategory));

      // Check Duration
      let matchDuration = true;
      if (activeDuration === 'short') {
        matchDuration = cardDays <= 3;
      } else if (activeDuration === 'classic') {
        matchDuration = cardDays >= 4 && cardDays <= 5;
      } else if (activeDuration === 'grand') {
        matchDuration = cardDays >= 6;
      }

      // Check Search Query
      let matchSearch = true;
      if (cleanQuery) {
        matchSearch = cardTitle.includes(cleanQuery) ||
                      cardDesc.includes(cleanQuery) ||
                      cardSearchText.includes(cleanQuery);
      }

      if (matchCategory && matchDuration && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // 2. Sort visible cards
    const sortedCards = [...tourCards].sort((a, b) => {
      const priceA = parseInt(a.getAttribute('data-price') || '0', 10);
      const priceB = parseInt(b.getAttribute('data-price') || '0', 10);
      const daysA = parseInt(a.getAttribute('data-days') || '0', 10);
      const daysB = parseInt(b.getAttribute('data-days') || '0', 10);
      const defaultOrderA = parseInt(a.getAttribute('data-order') || '0', 10);
      const defaultOrderB = parseInt(b.getAttribute('data-order') || '0', 10);

      if (activeSort === 'price-low') {
        return (priceA || 9999999) - (priceB || 9999999);
      } else if (activeSort === 'price-high') {
        return priceB - priceA;
      } else if (activeSort === 'duration-short') {
        return daysA - daysB;
      } else if (activeSort === 'duration-long') {
        return daysB - daysA;
      }
      return defaultOrderA - defaultOrderB;
    });

    sortedCards.forEach(card => cardsContainer.appendChild(card));

    // Update Counter
    if (resultsCounter) {
      resultsCounter.textContent = visibleCount;
    }

    // Toggle No Results Message
    if (noResultsBox) {
      noResultsBox.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
  }

  function syncCategoryPills(targetCat, scrollIntoView = false) {
    catPills.forEach(p => {
      const isSelected = (p.getAttribute('data-cat') === targetCat);
      p.classList.toggle('active', isSelected);
      p.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      p.tabIndex = isSelected ? 0 : -1;
      if (isSelected && scrollIntoView) {
        try {
          p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch (_) {}
      }
    });
  }

  // Dynamic Badge Count Synchronization & ARIA Labels
  function initCategoryPillsData() {
    catPills.forEach(pill => {
      const cat = pill.getAttribute('data-cat');
      const badge = pill.querySelector('.pill-badge');
      if (!badge) return;
      if (cat === 'all') {
        badge.textContent = tourCards.length;
        badge.setAttribute('aria-label', `${tourCards.length} tours available`);
      } else {
        const count = tourCards.filter(c => (c.getAttribute('data-category') || '').split(/\s+/).includes(cat)).length;
        badge.textContent = count;
        badge.setAttribute('aria-label', `${count} tour${count === 1 ? '' : 's'} available`);
      }
    });
  }

  initCategoryPillsData();

  // Category Pills Interactive Selection & WAI-ARIA APG Tabs Navigation
  const pillsArray = Array.from(catPills);
  pillsArray.forEach((pill, idx) => {
    // Mouse / Touch Selection
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      activeCategory = pill.getAttribute('data-cat') || 'all';
      syncCategoryPills(activeCategory, true);
      filterAndSortTours();
    });

    // Arrow Key Navigation (Left / Right / Up / Down / Home / End)
    pill.addEventListener('keydown', (e) => {
      let nextIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (idx + 1) % pillsArray.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (idx - 1 + pillsArray.length) % pillsArray.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = pillsArray.length - 1;
      }

      if (nextIndex !== null) {
        const nextPill = pillsArray[nextIndex];
        nextPill.focus();
        activeCategory = nextPill.getAttribute('data-cat') || 'all';
        syncCategoryPills(activeCategory, true);
        filterAndSortTours();
      }
    });
  });

  // Search input live filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterAndSortTours();
    });
  }

  // Duration select
  if (durationSelect) {
    durationSelect.addEventListener('change', (e) => {
      activeDuration = e.target.value;
      filterAndSortTours();
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndSortTours();
    });
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      activeDuration = 'all';
      searchQuery = '';
      activeSort = 'recommended';

      syncCategoryPills('all', true);

      if (searchInput) searchInput.value = '';
      if (durationSelect) durationSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'recommended';

      filterAndSortTours();
    });
  }

  // Interactive FAQ Accordion, Category Filtering, and Live Search Controller
  const faqItems = Array.from(document.querySelectorAll('.tour-faq-item'));
  const faqCategoryPills = Array.from(document.querySelectorAll('.tour-faq-cat-pill'));
  const faqSearchInput = document.getElementById('tourFaqSearch');
  const faqSearchClear = document.getElementById('tourFaqSearchClear');
  const faqExpandAllBtn = document.getElementById('tourFaqExpandAll');
  const faqNoResults = document.getElementById('tourFaqNoResults');
  const faqResetSearchBtn = document.getElementById('tourFaqResetSearch');

  let activeFaqCategory = 'all';

  function filterFaqItems() {
    const query = faqSearchInput ? faqSearchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    if (faqSearchClear) {
      faqSearchClear.style.display = query.length > 0 ? 'block' : 'none';
    }

    faqItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category') || '';
      const questionText = (item.querySelector('.tour-faq-q-text')?.textContent || '').toLowerCase();
      const answerText = (item.querySelector('.tour-faq-answer-inner')?.textContent || '').toLowerCase();
      const badgeText = (item.querySelector('.tour-faq-cat-badge')?.textContent || '').toLowerCase();

      const matchesCategory = (activeFaqCategory === 'all' || itemCategory === activeFaqCategory);
      const matchesSearch = !query || questionText.includes(query) || answerText.includes(query) || badgeText.includes(query);

      if (matchesCategory && matchesSearch) {
        item.style.display = '';
        visibleCount++;
        // If searching and item matches, automatically open answer for easier reading
        if (query.length > 2) {
          const btn = item.querySelector('.tour-faq-btn');
          const answer = item.querySelector('.tour-faq-answer');
          if (btn && answer) {
            item.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            answer.style.maxHeight = answer.scrollHeight + 50 + 'px';
          }
        }
      } else {
        item.style.display = 'none';
      }
    });

    if (faqNoResults) {
      faqNoResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Accordion Toggle Handlers
  faqItems.forEach(item => {
    const btn = item.querySelector('.tour-faq-btn');
    const answer = item.querySelector('.tour-faq-answer');

    if (btn && answer) {
      btn.addEventListener('click', () => {
        const isCurrentActive = item.classList.contains('active');

        // Close other visible items in accordions
        faqItems.forEach(other => {
          if (other !== item && other.classList.contains('active')) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.tour-faq-btn');
            const otherAnswer = other.querySelector('.tour-faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAnswer) otherAnswer.style.maxHeight = '0px';
          }
        });

        // Toggle current item
        if (isCurrentActive) {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = (answer.scrollHeight + 40) + 'px';
        }
      });
    }
  });

  // Category Filtering
  faqCategoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      faqCategoryPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      activeFaqCategory = pill.getAttribute('data-category') || 'all';
      filterFaqItems();
    });
  });

  // Search Input
  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', () => {
      filterFaqItems();
    });
  }

  // Clear Search
  if (faqSearchClear) {
    faqSearchClear.addEventListener('click', () => {
      if (faqSearchInput) {
        faqSearchInput.value = '';
        faqSearchInput.focus();
      }
      filterFaqItems();
    });
  }

  // Reset Search from Empty State
  if (faqResetSearchBtn) {
    faqResetSearchBtn.addEventListener('click', () => {
      if (faqSearchInput) faqSearchInput.value = '';
      activeFaqCategory = 'all';
      faqCategoryPills.forEach(p => {
        const isAll = (p.getAttribute('data-category') || '') === 'all';
        p.classList.toggle('active', isAll);
        p.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      filterFaqItems();
    });
  }

  // Expand All / Collapse All Toggle
  if (faqExpandAllBtn) {
    faqExpandAllBtn.addEventListener('click', () => {
      const visibleItems = faqItems.filter(item => item.style.display !== 'none');
      const allVisibleExpanded = visibleItems.every(item => item.classList.contains('active'));
      const textSpan = faqExpandAllBtn.querySelector('.tour-faq-expand-text');

      visibleItems.forEach(item => {
        const btn = item.querySelector('.tour-faq-btn');
        const answer = item.querySelector('.tour-faq-answer');
        if (allVisibleExpanded) {
          item.classList.remove('active');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          if (answer) answer.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          if (btn) btn.setAttribute('aria-expanded', 'true');
          if (answer) answer.style.maxHeight = (answer.scrollHeight + 40) + 'px';
        }
      });

      if (textSpan) {
        textSpan.textContent = allVisibleExpanded ? 'Expand All' : 'Collapse All';
      }
    });
  }

  // Feedback Vote Buttons
  document.querySelectorAll('.tour-faq-vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!btn.classList.contains('voted')) {
        btn.classList.add('voted');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Helpful! Thank you';
      }
    });
  });

  // Helper: compute dynamic top offset (header height + sticky subnav height + margin)
  function getSubnavOffset() {
    const header = document.querySelector('.main-header');
    const subnav = document.querySelector('.tour-subnav-sticky');
    const headerHeight = header ? header.offsetHeight : 70;
    const subnavHeight = subnav ? subnav.offsetHeight : 52;
    return headerHeight + subnavHeight + 12;
  }

  // Smooth scroll handler for subnav links with precise offset
  const subnavLinks = document.querySelectorAll('.tour-subnav-link');
  subnavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const targetTop = target.getBoundingClientRect().top + window.scrollY - getSubnavOffset();
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth'
          });
          try {
            history.pushState(null, '', href);
          } catch (_) {}
        }
      }
    });
  });

  // Smooth scroll for hero explore CTA
  const heroExploreBtn = document.querySelector('.tour-hero-btn-primary[href="#all-tours"]');
  if (heroExploreBtn) {
    heroExploreBtn.addEventListener('click', (e) => {
      const target = document.getElementById('all-tours');
      if (target) {
        e.preventDefault();
        const targetTop = target.getBoundingClientRect().top + window.scrollY - getSubnavOffset();
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
        try {
          history.pushState(null, '', '#all-tours');
        } catch (_) {}
      }
    });
  }

  // Sticky subnav active link scrollspy
  const sections = Array.from(subnavLinks)
    .map(link => {
      const id = link.getAttribute('href')?.replace('#', '');
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (sections.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + getSubnavOffset() + 20;
      let currentSectionId = '';

      sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      subnavLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }, { passive: true });
  }
});
