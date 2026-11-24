/**
 * Dedicated Reviews Page Interactive Script
 * Handles Region Filtering, Live Search, Helpful Vote Buttons, Modal, and FAQ Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('review-search-input');
  const filterPills = document.querySelectorAll('.filter-pill-btn');
  const reviewCards = document.querySelectorAll('.review-card-standalone');
  const noResultsEl = document.getElementById('no-reviews-found');
  const resetBtn = document.getElementById('reset-filter-btn');

  let activeRegion = 'all';

  function filterCards() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    reviewCards.forEach(card => {
      const cardRegion = card.getAttribute('data-region') || 'all';
      const cardText = card.innerText.toLowerCase();

      const matchesRegion = (activeRegion === 'all' || cardRegion === activeRegion);
      const matchesQuery = (query === '' || cardText.includes(query));

      if (matchesRegion && matchesQuery) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // 1. Region Filter Pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeRegion = pill.getAttribute('data-region') || 'all';
      filterCards();
    });
  });

  // 2. Live Search Input
  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  // 2b. Reset Filter Button in No-Results Box
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      filterPills.forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('.filter-pill-btn[data-region="all"]');
      if (allPill) allPill.classList.add('active');
      activeRegion = 'all';
      filterCards();
    });
  }

  // 3. Helpful Vote Counter
  const helpfulBtns = document.querySelectorAll('.review-helpful-btn');
  helpfulBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const countEl = btn.querySelector('.vote-count');
      if (countEl) {
        let currentCount = parseInt(countEl.innerText, 10) || 0;
        if (btn.classList.contains('voted')) {
          btn.classList.remove('voted');
          countEl.innerText = Math.max(0, currentCount - 1);
        } else {
          btn.classList.add('voted');
          countEl.innerText = currentCount + 1;
        }
      }
    });
  });

  // 4. Leave a Review Modal
  const reviewModal = document.getElementById('leave-review-modal');
  const openModalBtns = document.querySelectorAll('.open-review-modal-btn');
  const closeModalBtn = document.getElementById('review-modal-close-btn');
  const reviewForm = document.getElementById('leave-review-form');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (reviewModal) {
        reviewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeReviewModal() {
    if (reviewModal) {
      reviewModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeReviewModal);
  }

  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) {
        closeReviewModal();
      }
    });
  }

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewModal && reviewModal.classList.contains('active')) {
      closeReviewModal();
    }
  });

  // 4b. Modal Star Rating Selector
  const starBtns = document.querySelectorAll('.modal-star-btn');
  const starInput = document.getElementById('review-rating-input');
  starBtns.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.getAttribute('data-val'), 10) || 5;
      if (starInput) starInput.value = rating;
      starBtns.forEach(s => {
        const val = parseInt(s.getAttribute('data-val'), 10) || 0;
        s.style.color = val <= rating ? '#E9A544' : '#CBD5E1';
      });
    });
  });

  // 5. Form Submission Handler
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = reviewForm.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting Your Review...';
      }

      setTimeout(() => {
        if (reviewForm) {
          reviewForm.innerHTML = `
            <div style="text-align: center; padding: 32px 16px;">
              <div style="width: 68px; height: 68px; background: #F0F7F1; color: #087F52; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px; border: 2px solid #AAD9BD;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#087F52" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 style="font-size: 1.65rem; color: #1B2921; margin-bottom: 10px;">Review Submitted Successfully!</h3>
              <p style="color: #65736B; font-size: 1rem; line-height: 1.6; max-width: 480px; margin: 0 auto 24px auto;">
                Dhanyabad! Thank you for sharing your Himalayan expedition memories with Nepal Unique Treks. Your review has been submitted for verification.
              </p>
              <button type="button" id="review-success-close-btn" class="btn btn-primary" style="padding: 12px 30px; border-radius: 50px;">Close Window</button>
            </div>
          `;
          const successCloseBtn = document.getElementById('review-success-close-btn');
          if (successCloseBtn) {
            successCloseBtn.addEventListener('click', closeReviewModal);
          }
        }
      }, 900);
    });
  }

  // 6. FAQ Accordion Toggle
  const faqHeaders = document.querySelectorAll('.faq-accordion-header');
  faqHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const item = header.parentElement;
      const isOpen = item.classList.contains('open') || item.classList.contains('active');
      
      document.querySelectorAll('.faq-accordion-item').forEach(el => el.classList.remove('open', 'active'));
      
      if (!isOpen) {
        item.classList.add('open', 'active');
      }
    });
  });
});
