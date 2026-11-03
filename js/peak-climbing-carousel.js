/**
 * Interactive Carousel Slider for Summit Expeditions (Peak Climbing Section)
 * Displays 4 full cards per frame on desktop, 2 on tablet, 1 on mobile.
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('peak-carousel-container');
  const prevBtn = document.getElementById('peak-prev-btn');
  const nextBtn = document.getElementById('peak-next-btn');
  const dots = document.querySelectorAll('#peak-climbing .carousel-dot');

  if (!container) return;

  // Scroll distance calculation: 1 full container page scroll or card width + gap
  const getScrollAmount = () => {
    const card = container.querySelector('.peak-package-card');
    if (!card) return container.offsetWidth;
    return card.offsetWidth + 20; // card width + flex gap
  };

  // Scroll Left (Previous) Button Click
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      container.scrollBy({
        left: -getScrollAmount(),
        behavior: 'smooth'
      });
    });
  }

  // Scroll Right (Next) Button Click
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      container.scrollBy({
        left: getScrollAmount(),
        behavior: 'smooth'
      });
    });
  }

  // Pagination Dot Click & Scroll Observer
  if (dots.length > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const scrollTarget = index * getScrollAmount();
        container.scrollTo({
          left: scrollTarget,
          behavior: 'smooth'
        });
      });
    });

    // Update active dot on scroll
    container.addEventListener('scroll', () => {
      const scrollPosition = container.scrollLeft;
      const scrollAmount = getScrollAmount();
      const activeIndex = Math.min(
        Math.round(scrollPosition / scrollAmount),
        dots.length - 1
      );

      dots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.classList.add('active');
          dot.style.background = '#087F52';
          dot.style.width = '48px';
        } else {
          dot.classList.remove('active');
          dot.style.background = '#C7D3CB';
          dot.style.width = '8px';
        }
      });
    });
  }
});
