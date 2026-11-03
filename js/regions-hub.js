/**
 * Trekking Regions Hub - Interactive Features
 * Handles FAQ accordion, Map hotspot smooth scroll, and Interactive Region Selection Tool
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. FAQ Accordion Toggle
  const faqHeaders = document.querySelectorAll('.faq-accordion-header');
  faqHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const item = header.parentElement;
      const isOpen = item.classList.contains('open') || item.classList.contains('active');
      
      // Close all other open items
      document.querySelectorAll('.faq-accordion-item').forEach(el => {
        el.classList.remove('open', 'active');
      });
      
      if (!isOpen) {
        item.classList.add('open', 'active');
      }
    });
  });

  // 2. Interactive Region Selection Tool Filter Logic
  const filterForm = document.getElementById('region-finder-form');
  const resultCards = document.querySelectorAll('.region-tool-card');
  const noResultMsg = document.getElementById('no-tool-results');

  if (filterForm) {
    const filterInputs = filterForm.querySelectorAll('select, input');
    
    function filterRegions() {
      const duration = document.getElementById('filter-duration')?.value || 'all';
      const difficulty = document.getElementById('filter-difficulty')?.value || 'all';
      const crowds = document.getElementById('filter-crowds')?.value || 'all';
      const interest = document.getElementById('filter-interest')?.value || 'all';

      let matchCount = 0;

      resultCards.forEach(card => {
        const cardDuration = card.getAttribute('data-duration');
        const cardDifficulty = card.getAttribute('data-difficulty');
        const cardCrowds = card.getAttribute('data-crowds');
        const cardInterests = card.getAttribute('data-interests') || '';

        const durationMatch = (duration === 'all') || (cardDuration && cardDuration.includes(duration));
        const difficultyMatch = (difficulty === 'all') || (cardDifficulty === difficulty);
        const crowdsMatch = (crowds === 'all') || (cardCrowds === crowds);
        const interestMatch = (interest === 'all') || cardInterests.includes(interest);

        if (durationMatch && difficultyMatch && crowdsMatch && interestMatch) {
          card.style.display = 'block';
          matchCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResultMsg) {
        noResultMsg.style.display = (matchCount === 0) ? 'block' : 'none';
      }
    }

    filterInputs.forEach(input => {
      input.addEventListener('change', filterRegions);
    });

    const resetBtn = document.getElementById('reset-filter-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filterForm.reset();
        filterRegions();
      });
    }
  }

  // 3. Smooth Scroll for anchor buttons
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && document.querySelector(targetId)) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
