// Mega Menu Tab Switching Logic
document.addEventListener('DOMContentLoaded', () => {
  const sidebarItems = document.querySelectorAll('.mega-sidebar-item');
  const tabContents = document.querySelectorAll('.mega-tab-content');

  sidebarItems.forEach(item => {
    // Switch tab on hover or click
    ['mouseenter', 'click'].forEach(evtType => {
      item.addEventListener(evtType, (e) => {
        const targetId = item.getAttribute('data-target');
        if (!targetId) return;

        // Deactivate all sidebar items & tabs
        sidebarItems.forEach(i => i.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Activate hovered/clicked item & target tab
        item.classList.add('active');
        const targetTab = document.getElementById(targetId);
        if (targetTab) {
          targetTab.classList.add('active');
        }
      });
    });
  });
});
