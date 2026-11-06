/**
 * Interactive Review Section Handler for Homepage (index.html)
 * Controls Main Tabs (Video, Customer, Platform) & Platform Subtabs (Google, TripAdvisor, Trustpilot, Facebook)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Main 3-Tab Switcher (.review-tab-btn)
  const tabBtns = document.querySelectorAll('.review-tab-btn');
  const tabPanels = document.querySelectorAll('.review-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => {
        const isSelected = b === btn;
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-selected', String(isSelected));
        b.tabIndex = isSelected ? 0 : -1;
      });
      tabPanels.forEach(panel => {
        const isSelected = panel.id === targetId;
        panel.classList.toggle('active', isSelected);
        panel.setAttribute('aria-hidden', String(!isSelected));
      });

      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.setAttribute('aria-hidden', 'false');
      }
    });

    btn.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...tabBtns];
      const currentIndex = tabs.indexOf(btn);
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  // Platform Sub-Tabs Switcher (.platform-subtab-btn)
  const subtabBtns = document.querySelectorAll('.platform-subtab-btn');
  const platformContents = document.querySelectorAll('.platform-reviews-content');

  subtabBtns.forEach(subBtn => {
    subBtn.addEventListener('click', () => {
      const platformKey = subBtn.getAttribute('data-platform');

      subtabBtns.forEach(b => {
        const isSelected = b === subBtn;
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-selected', String(isSelected));
        b.tabIndex = isSelected ? 0 : -1;
      });
      platformContents.forEach(content => {
        const isSelected = content.getAttribute('data-platform') === platformKey;
        content.classList.toggle('active', isSelected);
        content.setAttribute('aria-hidden', String(!isSelected));
      });
      const targetContent = document.querySelector(`.platform-reviews-content[data-platform="${platformKey}"]`);
      if (targetContent) {
        targetContent.setAttribute('aria-hidden', 'false');
      }
    });

    subBtn.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...subtabBtns];
      const currentIndex = tabs.indexOf(subBtn);
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  const videoDialog = document.querySelector('.home-review-video-dialog');
  const reviewVideo = videoDialog?.querySelector('video');
  const videoStatus = videoDialog?.querySelector('.home-review-video-status');
  document.querySelectorAll('[data-review-video]').forEach(button => {
    button.addEventListener('click', () => {
      if (!videoDialog || !reviewVideo) return;
      reviewVideo.src = button.getAttribute('data-review-video');
      if (videoStatus) {
        videoStatus.hidden = true;
        videoStatus.textContent = '';
      }
      videoDialog.showModal();
      reviewVideo.play().catch(() => {
        if (videoStatus) {
          videoStatus.textContent = 'Press play to start this trekking film.';
          videoStatus.hidden = false;
        }
      });
    });
  });

  reviewVideo?.addEventListener('play', () => {
    if (videoStatus) videoStatus.hidden = true;
  });

  videoDialog?.addEventListener('close', () => {
    reviewVideo?.pause();
    if (reviewVideo) {
      reviewVideo.removeAttribute('src');
      reviewVideo.load();
    }
  });

  videoDialog?.addEventListener('click', event => {
    if (event.target === videoDialog) videoDialog.close();
  });

  // FAQ Category Pill Switcher
  const faqCatBtns = document.querySelectorAll('.faq-category-btn');
  const faqPanels = document.querySelectorAll('.faq-category-panel');

  faqCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const catKey = btn.getAttribute('data-faq-cat');

      faqCatBtns.forEach(b => b.classList.remove('active'));
      faqPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetFaqPanel = document.getElementById(`faq-cat-${catKey}`);
      if (targetFaqPanel) {
        targetFaqPanel.classList.add('active');
      }
    });
  });

  // FAQ Accordion Card Toggle
  const accordionItems = document.querySelectorAll('.faq-accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.faq-accordion-header');
    if (header) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        const parentPanel = item.closest('.faq-category-panel');
        if (parentPanel) {
          parentPanel.querySelectorAll('.faq-accordion-item').forEach(sibling => {
            sibling.classList.remove('active');
          });
        }

        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });

  // Resources Subtab Handler
  const resTabBtns = document.querySelectorAll('.res-tab-btn');
  const resourceData = {
    webinars: [
      {
        title: "Everest Base Camp High-Altitude Trekking: Safety and Gear",
        img: "images/treks/everest-base-camp/everest-base-camp-trekkers-team-circle-02.jpg"
      },
      {
        title: "Revealing Altitude Tactics You Already Know To Pass Thorong La In Annapurna Circuit",
        img: "images/treks/annapurna-circuit/annapurna-circuit-tilicho-lake-trekking-group-tilicho-lake-11.jpg"
      },
      {
        title: "Nepal Trekking Playbook: Exact Steps We Followed to Keep Our Trekkers Safe & Hydrated",
        img: "images/treks/manaslu-circuit/manaslu-circuit-mountain-sunrise-04.jpg"
      }
    ],
    blogs: [
      {
        title: "Top 10 Essential Teahouse Etiquette Tips Every First-Time Everest Trekker Must Know",
        img: "images/treks/everest-base-camp/everest-base-camp-yak-mountain-view-15.jpg"
      },
      {
        title: "Autumn vs Spring in Nepal: How to Pick the Perfect Trekking Season for Clear Mountain Views",
        img: "images/treks/mardi-himal/mardi-himal-annapurna-range-sunrise-clouds-22.jpg"
      },
      {
        title: "Manaslu Circuit vs Annapurna Circuit: Comprehensive Route Breakdown and Permit Guide",
        img: "uploads/manaslu.jpg"
      }
    ],
    checklists: [
      {
        title: "Ultimate High-Altitude Gear & Packing Checklist for Everest Base Camp (Printable PDF)",
        img: "images/treks/mardi-himal/mardi-himal-trekking-backpacks-mountain-view-12.jpg"
      },
      {
        title: "First-Aid Kit & Altitude Sickness Prevention Checklist for Himalayan Remote Expeditions",
        img: "uploads/everest-base-camp-trek-gear-listt.jpg"
      },
      {
        title: "Kathmandu Rental Guide: What Sleeping Bags & Down Jackets to Rent in Thamel",
        img: "uploads/kathmandu-durbar-squire.jpg"
      }
    ]
  };

  resTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const catKey = btn.getAttribute('data-res-cat');
      resTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const grid = document.querySelector('.resources-grid');
      const blogsShowcase = document.getElementById('res-blogs-showcase');

      if (catKey === 'blogs') {
        if (grid) grid.style.display = 'none';
        if (blogsShowcase) blogsShowcase.style.display = 'block';
      } else {
        if (blogsShowcase) blogsShowcase.style.display = 'none';
        if (grid) {
          grid.style.display = 'grid';
          const items = resourceData[catKey] || resourceData.webinars;
          grid.innerHTML = items.map(item => `
            <div class="resource-card open-inquiry-btn">
              <div class="resource-thumb-wrapper" style="background-image: url('${item.img}');">
                <div class="yt-play-button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="9.5,7.5 16.5,12 9.5,16.5"/></svg>
                </div>
              </div>
              <div class="resource-card-content">
                <h3 class="resource-card-title">${item.title}</h3>
              </div>
            </div>
          `).join('');
        }
      }
    });
  });
});
