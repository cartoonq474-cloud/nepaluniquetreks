/**
 * Nepal Unique Treks — Contact Page Interactive Logic
 * Handles:
 * - Quick Trip Chip selectors
 * - Rich Trek Inquiry Form validation & submission
 * - Instant WhatsApp message generator
 * - Smooth FAQ Accordion interactions
 * - Copy to clipboard quick helpers
 */

function initContactPage() {
  initContactChips();
  initContactForm();
  initContactFaq();
  initCopyHelpers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactPage);
} else {
  initContactPage();
}

/**
 * Quick Trip Tag Chips
 * Clicking a chip updates the destination dropdown and highlights the chip
 */
function initContactChips() {
  const chips = document.querySelectorAll('.contact-chip-btn');
  const trekSelect = document.getElementById('contact-destination');
  const messageBox = document.getElementById('contact-message');

  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const targetVal = chip.getAttribute('data-value');
      const label = chip.getAttribute('data-label') || chip.textContent.trim().replace(/^\+\s*/, '');

      // Toggle active status among chips
      const wasActive = chip.classList.contains('active');
      chips.forEach(c => c.classList.remove('active'));

      if (!wasActive) {
        chip.classList.add('active');

        // Update select dropdown if matching option exists
        if (trekSelect && targetVal) {
          const match = Array.from(trekSelect.options).find(opt => opt.value === targetVal);
          if (match) {
            trekSelect.value = targetVal;
            trekSelect.dispatchEvent(new Event('change'));
          }
        }

        // Add subtle note to message if message box is empty
        if (messageBox && !messageBox.value.trim()) {
          messageBox.value = `Hello Nepal Unique Treks team, I am interested in planning a trip for ${label}. Please advise on the best itinerary and prices.`;
        }
      }
    });
  });
}

/**
 * Contact & Inquiry Form handling
 */
function initContactForm() {
  const form = document.getElementById('contact-page-form');
  const successCard = document.getElementById('contact-success-card');
  const formCard = document.getElementById('contact-form-container');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.contact-submit-btn');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const destInput = document.getElementById('contact-destination');
    const seasonInput = document.getElementById('contact-season');
    const groupInput = document.getElementById('contact-group-size');
    const methodInput = form.querySelector('input[name="preferred_channel"]:checked');
    const messageInput = document.getElementById('contact-message');

    const name = nameInput ? nameInput.value.trim() : 'Adventurer';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const destText = destInput && destInput.options[destInput.selectedIndex] ? destInput.options[destInput.selectedIndex].text : 'Himalayan Trek';
    const season = seasonInput ? seasonInput.value : 'Upcoming Season';
    const group = groupInput ? groupInput.value : 'Trekker';
    const method = methodInput ? methodInput.value : 'WhatsApp';
    const message = messageInput ? messageInput.value.trim() : '';

    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        <span>Sending Your Inquiry...</span>
      `;
    }

    // Simulate reliable dispatch
    setTimeout(() => {
      // Build WhatsApp pre-filled text
      const waText = encodeURIComponent(
        `Hi Nepal Unique Treks! I just submitted an inquiry on your website.\n\n` +
        `*Name:* ${name}\n` +
        `*Email:* ${email}\n` +
        `*Phone:* ${phone}\n` +
        `*Interest:* ${destText}\n` +
        `*Season / Dates:* ${season}\n` +
        `*Group Size:* ${group}\n` +
        `*Preferred Contact:* ${method}\n\n` +
        (message ? `*Notes:* ${message}` : '')
      );

      const waLink = `https://wa.me/9779851023285?text=${waText}`;

      // Populate summary in success card
      const summaryName = document.getElementById('success-summary-name');
      const summaryTrek = document.getElementById('success-summary-trek');
      const summaryChannel = document.getElementById('success-summary-channel');
      const waBtn = document.getElementById('success-wa-link');

      if (summaryName) summaryName.textContent = name;
      if (summaryTrek) summaryTrek.textContent = destText;
      if (summaryChannel) summaryChannel.textContent = method;
      if (waBtn) waBtn.href = waLink;

      // Swap view with smooth fade
      if (formCard && successCard) {
        formCard.style.display = 'none';
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = `<span>Submit Inquiry Now</span> <span class="arrow-circle">↗</span>`;
      }
    }, 850);
  });

  // Reset / Send another message button
  const resetBtn = document.getElementById('contact-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      if (formCard && successCard) {
        successCard.style.display = 'none';
        formCard.style.display = 'block';
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

/**
 * Interactive FAQ Accordion
 */
function initContactFaq() {
  const faqItems = document.querySelectorAll('.contact-faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.contact-faq-trigger');
    const panel = item.querySelector('.contact-faq-panel');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other items for a clean single-open accordion experience
      faqItems.forEach(other => {
        const otherTrigger = other.querySelector('.contact-faq-trigger');
        const otherPanel = other.querySelector('.contact-faq-panel');
        if (otherTrigger && otherPanel && other !== item) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          other.classList.remove('active');
          otherPanel.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
        panel.style.maxHeight = null;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Copy Phone / Email helpers with subtle visual feedback
 */
function initCopyHelpers() {
  const copyButtons = document.querySelectorAll('[data-copy-target]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy-target');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span style="color: #22845F;">✓ Copied!</span>`;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
      }).catch(() => {
        // Fallback if clipboard API is restricted
      });
    });
  });
}
