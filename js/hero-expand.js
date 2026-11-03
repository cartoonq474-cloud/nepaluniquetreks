// Hero Section Paragraph Inline Extension & History Navigation Handler
document.addEventListener('DOMContentLoaded', () => {
  const heroBtn = document.getElementById('hero-learn-more-btn');
  const heroExtra = document.getElementById('hero-extra-text');
  const heroP = document.getElementById('hero-subheading-p');
  const btnLabel = document.getElementById('hero-btn-label');
  const btnIcon = document.getElementById('hero-btn-icon');

  if (!heroBtn || !heroExtra || !heroP) return;

  function expandParagraph(pushState = true) {
    heroExtra.style.display = 'inline';
    requestAnimationFrame(() => {
      heroExtra.style.opacity = '1';
    });
    heroP.classList.add('expanded');
    if (btnLabel) btnLabel.textContent = 'Show less';
    if (btnIcon) btnIcon.textContent = '←';
    heroBtn.setAttribute('aria-expanded', 'true');

    if (pushState && window.history.pushState) {
      window.history.pushState({ heroExpanded: true }, '', '#hero-extended');
    }
  }

  function collapseParagraph(updateState = true) {
    heroExtra.style.opacity = '0';
    setTimeout(() => {
      if (heroBtn.getAttribute('aria-expanded') === 'false') {
        heroExtra.style.display = 'none';
      }
    }, 300);
    heroP.classList.remove('expanded');
    if (btnLabel) btnLabel.textContent = 'Learn more';
    if (btnIcon) btnIcon.textContent = '→';
    heroBtn.setAttribute('aria-expanded', 'false');

    if (updateState && window.location.hash === '#hero-extended') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  heroBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = heroBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      if (window.location.hash === '#hero-extended') {
        window.history.back();
      } else {
        collapseParagraph(true);
      }
    } else {
      expandParagraph(true);
    }
  });

  // Browser Back / Forward Button Handling
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.heroExpanded) {
      expandParagraph(false);
    } else {
      collapseParagraph(false);
    }
  });

  // Handle direct navigation with hash
  if (window.location.hash === '#hero-extended') {
    expandParagraph(false);
  }
});
