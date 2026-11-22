/**
 * Nepal Unique Treks — Desktop Mega Menu Controller
 * Seamless tab switching, keyboard navigation, and robust hover state management
 */
(function () {
  function initMegaMenu() {
    const megaNavItem = document.querySelector('.mega-nav-item');
    if (!megaNavItem) return;

    const sidebarItems = megaNavItem.querySelectorAll('.mega-sidebar-item');
    const tabContents = megaNavItem.querySelectorAll('.mega-tab-content');
    if (!sidebarItems.length || !tabContents.length) return;

    const defaultTabId = 'tab-popular';

    function switchTab(targetId) {
      if (!targetId) return;

      sidebarItems.forEach(item => {
        const isMatch = item.getAttribute('data-target') === targetId;
        item.classList.toggle('active', isMatch);
        item.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      tabContents.forEach(tab => {
        const isMatch = tab.id === targetId;
        tab.classList.toggle('active', isMatch);
      });
    }

    // Set initial ARIA attributes
    sidebarItems.forEach((item, index) => {
      item.setAttribute('role', 'tab');
      item.setAttribute('tabindex', '0');
      const targetId = item.getAttribute('data-target');
      const isActive = item.classList.contains('active');
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      item.setAttribute('aria-controls', targetId);

      // Mouse Hover & Click
      ['mouseenter', 'click'].forEach(evtType => {
        item.addEventListener(evtType, (e) => {
          if (evtType === 'click' && item.tagName.toLowerCase() === 'a') {
            e.preventDefault();
          }
          switchTab(targetId);
        });
      });

      // Keyboard Arrow Navigation between sidebar items
      item.addEventListener('keydown', (e) => {
        let nextIndex = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          nextIndex = (index + 1) % sidebarItems.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          nextIndex = (index - 1 + sidebarItems.length) % sidebarItems.length;
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchTab(targetId);
        }

        if (nextIndex !== null) {
          sidebarItems[nextIndex].focus();
          switchTab(sidebarItems[nextIndex].getAttribute('data-target'));
        }
      });
    });

    // Reset to Popular Treks when cursor leaves the mega menu
    let resetTimer = null;
    megaNavItem.addEventListener('mouseleave', () => {
      resetTimer = setTimeout(() => {
        switchTab(defaultTabId);
      }, 350);
    });

    megaNavItem.addEventListener('mouseenter', () => {
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMegaMenu);
  } else {
    initMegaMenu();
  }
})();
