/**
 * How It Works — Carousel Controller
 * Shows 4 cards at a time on desktop, slides to reveal the 5th.
 * Responsive: 3 on tablet, 1 on mobile.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.how-works-cards-grid.grid-5');
    const track = document.querySelector('.how-works-cards-track');
    const prevBtn = document.querySelector('.how-works-bottom-bar .prev-btn');
    const nextBtn = document.querySelector('.how-works-bottom-bar .next-btn');
    const progressFill = document.querySelector('.how-progress-line-fill');

    if (!container || !track || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.how-step-card');
    const totalCards = cards.length;
    const gap = 20; // matches CSS gap
    let currentIndex = 0;

    function getVisibleCount() {
      const width = window.innerWidth;
      if (width <= 640) return 1;
      if (width <= 1024) return 3;
      return 4;
    }

    function getMaxIndex() {
      return Math.max(0, totalCards - getVisibleCount());
    }

    function updateCarousel() {
      const visibleCount = getVisibleCount();
      const maxIndex = getMaxIndex();

      // Clamp current index
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      // Calculate card width from actual rendered size
      const cardWidth = cards[0].offsetWidth;
      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';

      // Update button states
      if (currentIndex <= 0) {
        prevBtn.classList.add('disabled');
      } else {
        prevBtn.classList.remove('disabled');
      }

      if (currentIndex >= maxIndex) {
        nextBtn.classList.add('disabled');
      } else {
        nextBtn.classList.remove('disabled');
      }

      // Update progress bar
      if (progressFill) {
        const progress = maxIndex === 0 ? 100 : ((currentIndex + visibleCount) / totalCards) * 100;
        progressFill.style.width = Math.min(progress, 100) + '%';
      }
    }

    prevBtn.addEventListener('click', function () {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener('click', function () {
      if (currentIndex < getMaxIndex()) {
        currentIndex++;
        updateCarousel();
      }
    });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        updateCarousel();
      }, 150);
    });

    // Initial state
    updateCarousel();
  });
})();
