/**
 * Header Scroll & Navigation Menu Controller
 * Himalayan Gold Standard: Seamless slide drawer, backdrop, accordions, desktop pin states, and scroll thresholds
 */
(function () {
  // 1. Scroll Effect
  const header = document.querySelector('.main-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 30;

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
    // Ensure Backdrop Element Exists
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      backdrop.id = 'mobile-nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    function closeMobileMenu() {
      navMenu.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('mobile-nav-lock');
      document.documentElement.classList.remove('mobile-nav-lock');
    }

    function openMobileMenu() {
      navMenu.classList.add('active');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('mobile-nav-lock');
      document.documentElement.classList.add('mobile-nav-lock');
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close when tapping backdrop
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        closeMobileMenu();
      });
    }

    // Navigation Dropdown & Accordion Expansion
    const dropdownItems = navMenu.querySelectorAll('.nav-item-dropdown');

    dropdownItems.forEach(item => {
      const arrowBtn = item.querySelector('.mobile-dropdown-arrow');
      const navLink = item.querySelector('.nav-link');

      function toggleMobileAccordion(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const isOpen = item.classList.contains('dropdown-open');

        // Close other open accordions on mobile
        dropdownItems.forEach(other => {
          if (other !== item) other.classList.remove('dropdown-open');
        });

        item.classList.toggle('dropdown-open', !isOpen);
      }

      function toggleDesktopDropdown(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const isOpen = item.classList.contains('is-open');

        // Close other open dropdowns on desktop
        dropdownItems.forEach(other => {
          if (other !== item) other.classList.remove('is-open');
        });

        item.classList.toggle('is-open', !isOpen);
      }

      // Tapping arrow button toggles submenu accordion on mobile
      if (arrowBtn) {
        arrowBtn.addEventListener('click', (e) => {
          if (window.innerWidth <= 1024) {
            toggleMobileAccordion(e);
          }
        });
      }

            // Tapping navLink row toggles accordion on mobile, and toggles pinned dropdown on desktop!
      if (navLink) {
        navLink.addEventListener('click', (e) => {
          if (window.innerWidth <= 1024) {
            toggleMobileAccordion(e);
          } else {
            // On desktop:
            // If it's a span trigger (Company Info), toggle pinned dropdown
            if (navLink.tagName.toLowerCase() === 'span') {
              toggleDesktopDropdown(e);
            } else if (e.target.closest('.nav-link-arrow-desktop')) {
              // If user clicked specifically on the arrow chevron, toggle pinned dropdown
              toggleDesktopDropdown(e);
            }
            // Otherwise, allow standard navigation to overview page!
          }
        });
      }
    });

    // Close desktop dropdowns and mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      // Close desktop pinned dropdowns
      if (!e.target.closest('.nav-item-dropdown')) {
        dropdownItems.forEach(item => {
          item.classList.remove('is-open');
        });
      }

      // Close mobile menu
      if (
        navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !toggleBtn.contains(e.target) &&
        (!backdrop || !backdrop.contains(e.target))
      ) {
        closeMobileMenu();
      }
    });

    // Close menu or pinned dropdown when clicking leaf links
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        // If it's a dropdown toggle trigger, don't close
        if (link.classList.contains('mobile-dropdown-arrow')) return;
        if (link.classList.contains('nav-link') && link.closest('.nav-item-dropdown')) return;

        // Close desktop pinned dropdowns
        dropdownItems.forEach(item => {
          item.classList.remove('is-open');
        });

        // Close mobile drawer on navigation
        if (window.innerWidth <= 1024) {
          closeMobileMenu();
        }
      });
    });

    // Close drawer when an inquiry modal button is clicked
    navMenu.querySelectorAll('.open-inquiry-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dropdownItems.forEach(item => {
          item.classList.remove('is-open');
        });
        if (window.innerWidth <= 1024) {
          closeMobileMenu();
        }
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdownItems.forEach(item => {
          item.classList.remove('is-open');
        });
        if (navMenu.classList.contains('active')) {
          closeMobileMenu();
        }
      }
    });

    // Auto-close mobile drawer on viewport resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        if (navMenu.classList.contains('active')) {
          closeMobileMenu();
        }
      } else {
        dropdownItems.forEach(item => {
          item.classList.remove('is-open');
        });
      }
    });
  }
})();
