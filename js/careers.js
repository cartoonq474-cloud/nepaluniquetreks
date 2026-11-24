/**
 * Careers Page Interactive Application & Filtering Handler
 * Nepal Unique Treks — Expedition Careers Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const jobModal = document.getElementById('career-application-modal');
  const closeBtn = document.getElementById('career-modal-close-btn');
  const applyBtns = document.querySelectorAll('.apply-job-btn');
  const positionSelect = document.getElementById('app-position');
  const appForm = document.getElementById('career-application-form');
  const filterTabs = document.querySelectorAll('.careers-tab-btn');
  const searchInput = document.getElementById('careers-job-search');
  const jobCards = document.querySelectorAll('.job-card');
  const toggleDetailBtns = document.querySelectorAll('.job-toggle-details-btn');
  const faqHeaders = document.querySelectorAll('.faq-accordion-header');

  let activeDepartment = 'all';
  let searchQuery = '';

  // Filter & Search Logic
  function filterJobs() {
    let visibleCount = 0;

    jobCards.forEach(card => {
      const cardDept = card.getAttribute('data-department') || '';
      const cardText = card.textContent.toLowerCase();

      const matchesDept = activeDepartment === 'all' || cardDept === activeDepartment;
      const matchesSearch = !searchQuery || cardText.includes(searchQuery);

      if (matchesDept && matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResultsMsg = document.getElementById('no-jobs-found-msg');
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Department Tab Clicks
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeDepartment = tab.getAttribute('data-filter') || 'all';
      filterJobs();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterJobs();
    });
  }

  // Role Details Accordion Toggle
  toggleDetailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.job-card');
      if (!card) return;

      const isExpanded = card.classList.contains('expanded');
      if (isExpanded) {
        card.classList.remove('expanded');
        btn.innerHTML = `<span>Role Details</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        card.classList.add('expanded');
        btn.innerHTML = `<span>Hide Details</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Open Modal & Pre-select Job Position
  function openModal(jobTitle) {
    if (positionSelect && jobTitle) {
      let found = false;
      for (let i = 0; i < positionSelect.options.length; i++) {
        if (
          positionSelect.options[i].value === jobTitle ||
          positionSelect.options[i].text.toLowerCase().includes(jobTitle.toLowerCase())
        ) {
          positionSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        positionSelect.value = 'General Application';
      }
    }

    if (jobModal) {
      jobModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const firstInput = jobModal.querySelector('input');
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    }
  }

  function closeModal() {
    if (jobModal) {
      jobModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  applyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const jobTitle = btn.getAttribute('data-job-title') || 'General Application';
      openModal(jobTitle);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (jobModal) {
    jobModal.addEventListener('click', (e) => {
      if (e.target === jobModal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && jobModal && jobModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Form Submission Handler
  if (appForm) {
    appForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = appForm.querySelector('button[type="submit"]');
      const candidateName = document.getElementById('app-name')?.value || 'Applicant';
      const candidatePosition = document.getElementById('app-position')?.value || 'the selected position';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="display:inline-block; animation: spin 1s linear infinite; margin-right:8px; vertical-align:middle;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Submitting Application...
        `;
      }

      setTimeout(() => {
        appForm.innerHTML = `
          <div style="text-align: center; padding: 36px 12px;">
            <div style="width: 68px; height: 68px; background: #EAF4EF; color: #176B4B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(23, 107, 75, 0.15);">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#176B4B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 style="font-size: 1.6rem; color: #10271F; margin-bottom: 10px; font-weight: 800;">Application Received, ${candidateName}!</h3>
            <p style="color: #535655; font-size: 0.98rem; line-height: 1.65; max-width: 480px; margin: 0 auto 24px auto;">
              Thank you for applying for <strong>${candidatePosition}</strong>. Our expedition HR team will review your qualifications and reach out via email or WhatsApp within 3 to 5 business days.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <button id="close-success-modal-btn" class="btn btn-primary" style="padding: 12px 28px; font-size: 0.95rem;">Done</button>
            </div>
          </div>
        `;

        const closeSuccessBtn = document.getElementById('close-success-modal-btn');
        if (closeSuccessBtn) {
          closeSuccessBtn.addEventListener('click', closeModal);
        }
      }, 1100);
    });
  }

  // FAQ Accordion Toggle
  faqHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const item = header.parentElement;
      const isOpen = item.classList.contains('open') || item.classList.contains('active');

      document.querySelectorAll('.faq-accordion-item').forEach(el => {
        el.classList.remove('open', 'active');
      });

      if (!isOpen) {
        item.classList.add('open', 'active');
      }
    });
  });
});
