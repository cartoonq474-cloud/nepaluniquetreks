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
        return priceA - priceB;
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

  // Category Pill Clicks
  catPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-cat') || 'all';
      filterAndSortTours();
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

      catPills.forEach(p => {
        if (p.getAttribute('data-cat') === 'all') {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      if (searchInput) searchInput.value = '';
      if (durationSelect) durationSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'recommended';

      filterAndSortTours();
    });
  }

  // FAQ Accordion Handler
  const faqItems = document.querySelectorAll('.tour-faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.tour-faq-btn');
    const answer = item.querySelector('.tour-faq-answer');

    if (btn && answer) {
      btn.addEventListener('click', () => {
        const isCurrentActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(other => {
          if (other !== item && other.classList.contains('active')) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.tour-faq-btn');
            const otherAnswer = other.querySelector('.tour-faq-answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAnswer) otherAnswer.style.maxHeight = '0px';
          }
        });

        // Toggle this item
        if (isCurrentActive) {
          item.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // Sticky subnav active link scrollspy
  const subnavLinks = document.querySelectorAll('.tour-subnav-link');
  const sections = Array.from(subnavLinks)
    .map(link => {
      const id = link.getAttribute('href')?.replace('#', '');
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (sections.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 140;
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
