/**
 * Header Scroll & Mobile Navigation Menu Controller
 * Seamless mobile drawer, accordions, and scroll states
 */
(function () {
  // 1. Scroll Effect
  const header = document.querySelector('.main-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 40;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on page load

  // 2. Mobile Hamburger Toggle Menu & Accordion Controller
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    function closeMobileMenu() {
      navMenu.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-nav-lock');
    }

    function openMobileMenu() {
      navMenu.classList.add('active');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-nav-lock');
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Mobile Accordion Expansion
    const dropdownItems = navMenu.querySelectorAll('.nav-item-dropdown');

    dropdownItems.forEach(item => {
      const arrowBtn = item.querySelector('.mobile-dropdown-arrow');
      const navLink = item.querySelector('.nav-link');

      // Tapping arrow button toggles submenu accordion
      if (arrowBtn) {
        arrowBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = item.classList.contains('dropdown-open');

          // Close other open accordions on mobile
          dropdownItems.forEach(other => {
            if (other !== item) other.classList.remove('dropdown-open');
          });

          item.classList.toggle('dropdown-open', !isOpen);
        });
      }

      // If Company Info (span trigger with no href), clicking label also toggles accordion
      if (navLink && navLink.tagName.toLowerCase() === 'span') {
        navLink.addEventListener('click', (e) => {
          if (window.innerWidth <= 1024) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = item.classList.contains('dropdown-open');
            dropdownItems.forEach(other => {
              if (other !== item) other.classList.remove('dropdown-open');
            });
            item.classList.toggle('dropdown-open', !isOpen);
          }
        });
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close menu when clicking leaf links
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        // If it's a mobile accordion toggle, don't close
        if (link.classList.contains('mobile-dropdown-arrow')) return;

        // Close mobile drawer on navigation
        if (window.innerWidth <= 1024) {
          closeMobileMenu();
        }
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }
})();
