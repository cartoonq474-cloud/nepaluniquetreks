/**
 * Service Excellence Awards Carousel Controller
 * Handles prev/next scrolling, disabled states, mobile dots sync, and keyboard navigation.
 */
function initExcellenceCarousel() {
  const section = document.getElementById('service-excellence');
  if (!section) return;

  const viewport = section.querySelector('.excellence-carousel-viewport');
  const track = section.querySelector('.excellence-carousel-track');
  const cards = track ? Array.from(track.querySelectorAll('.excellence-card')) : [];
  const prevBtns = Array.from(section.querySelectorAll('.excellence-arrow--prev, .excellence-mobile-btn--prev'));
  const nextBtns = Array.from(section.querySelectorAll('.excellence-arrow--next, .excellence-mobile-btn--next'));
  const dotsWrap = section.querySelector('.excellence-dots');

  if (!viewport || !track || cards.length === 0) return;

  const getStepSize = () => {
    const firstCard = cards[0];
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '16') || 16;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const getVisibleSlots = () => {
    const step = getStepSize();
    if (!step) return 1;
    return Math.max(1, Math.floor((viewport.clientWidth + 12) / step));
  };

  const getStopCount = () => Math.max(1, cards.length - getVisibleSlots() + 1);

  const buildDots = () => {
    if (!dotsWrap) return [];
    const count = getStopCount();
    dotsWrap.innerHTML = '';
    const dots = [];
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'excellence-dot';
      dot.setAttribute('aria-label', `Show awards group ${i + 1} of ${count}`);
      dot.addEventListener('click', () => {
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const target = i === 0 ? 0 : Math.min(maxScroll, i * getStepSize());
        viewport.scrollTo({ left: target, behavior: 'smooth' });
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
    return dots;
  };

  let dots = buildDots();

  const updateControls = () => {
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const left = viewport.scrollLeft;
    const atStart = left <= 8;
    const atEnd = left >= maxScroll - 8;

    prevBtns.forEach((btn) => {
      btn.disabled = atStart;
    });
    nextBtns.forEach((btn) => {
      btn.disabled = atEnd;
    });

    if (dots.length > 0) {
      const step = getStepSize();
      const rawIdx = atStart ? 0 : (step > 0 ? Math.round(left / step) : 0);
      const activeIdx = atEnd ? dots.length - 1 : Math.min(dots.length - 1, Math.max(0, rawIdx));
      dots.forEach((dot, idx) => {
        const isActive = idx === activeIdx;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }
  };

  const scrollByCards = (direction) => {
    const step = getStepSize();
    const currentLeft = viewport.scrollLeft;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const target = Math.min(maxScroll, Math.max(0, currentLeft + direction * step));
    viewport.scrollTo({ left: target <= 8 ? 0 : target, behavior: 'smooth' });
  };

  prevBtns.forEach((btn) => btn.addEventListener('click', () => scrollByCards(-1)));
  nextBtns.forEach((btn) => btn.addEventListener('click', () => scrollByCards(1)));

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByCards(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByCards(1);
    }
  });

  let scrollRaf = 0;
  viewport.addEventListener(
    'scroll',
    () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        updateControls();
      });
    },
    { passive: true }
  );

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      dots = buildDots();
      updateControls();
    }, 140);
  });

  updateControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExcellenceCarousel);
} else {
  initExcellenceCarousel();
}
