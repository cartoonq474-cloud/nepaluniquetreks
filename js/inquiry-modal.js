/**
 * Nepal Unique Treks & Expeditions Pvt. Ltd. — Simple & Fast Inquiry Modal
 * Streamlined, low-friction, high-converting booking form.
 */

import { upgradeStyledSelect, syncStyledSelect } from './custom-select.js';

const OFFICIAL_PHONE = '+9779851023285';
const OFFICIAL_PHONE_DISPLAY = '+977 9851023285';
const OFFICIAL_EMAIL = 'info@nepaluniquetreks.com';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getModalTemplate(trekTitle = "Everest Base Camp Trek", departureInfo = "") {
  const safeTitle = escapeHtml(trekTitle);
  const safeDeparture = escapeHtml(departureInfo);
  const encodedTitle = encodeURIComponent(trekTitle);

  return `
    <div class="modal-card easy-inq-card" role="dialog" aria-modal="true" aria-labelledby="modal-trek-title">
      <button id="modal-close-btn" class="modal-close" aria-label="Close Inquiry Modal" type="button">&times;</button>
      
      <div class="easy-inq-header">
        <div class="easy-inq-pill">
          <span class="easy-pill-dot"></span>
          <span>Quick Free Quote &bull; No Payment Required</span>
        </div>
        <h3 id="modal-trek-title" class="easy-inq-title">Plan Your Himalayan Trip</h3>
        <p class="easy-inq-subtitle">
          Receive a personalized route plan &amp; confirmed quotation within <strong>2–4 hours</strong> from Dil Gurung &amp; Kathmandu team.
        </p>

        <!-- Selected Trek Pill -->
        <div class="easy-selected-trek" id="inq-trip-badge-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22845F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span class="easy-trek-label">Trip:</span>
          <strong id="inq-badge-trek-name">${safeTitle}</strong>
          <span class="inq-departure-tag" id="inq-departure-tag" style="${safeDeparture ? 'display: inline-flex;' : 'display: none;'}">
            ${safeDeparture ? `📅 Departure: ${safeDeparture}` : ''}
          </span>
        </div>
      </div>

      <form id="custom-inquiry-form" class="easy-inq-form" action="https://formsubmit.co/info@nepaluniquetreks.com" method="POST" novalidate>
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_autoresponse" value="Namaste from Nepal Unique Treks & Expeditions! Thank you for inquiring. Founder & Managing Director Dil Gurung and our Senior Expedition Team in Kathmandu have received your details and are preparing your personalized route itinerary, gear list, and quotation. We will reach out within 2–4 hours.">
        <input type="hidden" id="inq-hidden-trek" name="trekTitle" value="${safeTitle}">
        <input type="hidden" id="inq-hidden-departure" name="departureDate" value="${safeDeparture}">

        <!-- Full Name -->
        <div class="easy-field">
          <label class="easy-label" for="inq-name">
            <span>Your Name <span class="req">*</span></span>
          </label>
          <input type="text" id="inq-name" name="name" class="easy-input" placeholder="e.g. Alex Smith" autocomplete="name" required>
          <span class="easy-err" id="inq-name-error">Please enter your name</span>
        </div>

        <!-- Contact: Email & WhatsApp in 2 columns -->
        <div class="easy-grid-2">
          <div class="easy-field">
            <label class="easy-label" for="inq-email">
              <span>Email Address <span class="req">*</span></span>
            </label>
            <input type="email" id="inq-email" name="email" class="easy-input" placeholder="alex@example.com" autocomplete="email" required>
            <span class="easy-err" id="inq-email-error">Please enter a valid email</span>
          </div>

          <div class="easy-field">
            <label class="easy-label" for="inq-phone">
              <span>WhatsApp / Phone <span class="req">*</span></span>
            </label>
            <input type="tel" id="inq-phone" name="phone" class="easy-input" placeholder="+1 (555) 000-0000" autocomplete="tel" required>
            <span class="easy-err" id="inq-phone-error">Please enter your phone number</span>
          </div>
        </div>

        <!-- Trip Details: Date & Trekkers in 2 columns -->
        <div class="easy-grid-2">
          <div class="easy-field">
            <label class="easy-label" for="inq-start-date">
              <span>Approx. Travel Date</span>
              <span class="opt">Optional</span>
            </label>
            <input type="text" id="inq-start-date" name="startDate" class="easy-input" placeholder="e.g. Oct 2026 or Spring 2027">
          </div>

          <div class="easy-field">
            <label class="easy-label" for="inq-trekkers">
              <span>Number of Travellers</span>
            </label>
            <div class="easy-select-wrap">
              <select id="inq-trekkers" name="trekkers" class="easy-select">
                <option value="1">1 Person (Solo)</option>
                <option value="2" selected>2 Persons</option>
                <option value="3-4">3–4 Persons</option>
                <option value="5-9">5–9 Persons (Group Deal)</option>
                <option value="10+">10+ Persons (Large Group)</option>
              </select>
              <span class="easy-select-chevron" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Trek Route Selection (Clean Dropdown) -->
        <div class="easy-field">
          <label class="easy-label" for="inq-package">
            <span>Trek / Tour Route</span>
            <span class="opt">Switch route if desired</span>
          </label>
          <div class="easy-select-wrap">
            <select id="inq-package" name="package" class="easy-select">
              <option value="Everest Base Camp Trek">Everest Base Camp Trek — 15 Days</option>
              <option value="Everest Base Camp with Cho La Pass Trek">Everest Base Camp &amp; Cho La Pass — 18 Days</option>
              <option value="Everest Three Passes Trek">Everest Three Passes Trek — 20 Days</option>
              <option value="Gokyo Lakes Trek">Gokyo Lakes Trek — 14 Days</option>
              <option value="Annapurna Base Camp Trek">Annapurna Base Camp Trek — 13 Days</option>
              <option value="Annapurna Circuit Trek">Annapurna Circuit Trek — 14 Days</option>
              <option value="Mardi Himal Trek">Mardi Himal Trek — 10 Days</option>
              <option value="Ghorepani Poon Hill Trek">Ghorepani Poon Hill Trek — 9 Days</option>
              <option value="Manaslu Circuit Trek">Manaslu Circuit Trek — 15 Days</option>
              <option value="Langtang Valley Trek">Langtang Valley Trek — 10 Days</option>
              <option value="Upper Mustang Trek">Upper Mustang Trek — 13 Days</option>
              <option value="Island Peak Climbing">Island Peak Climbing (6,189m) — 12 Days</option>
              <option value="Mera Peak Climbing">Mera Peak Climbing (6,476m) — 16 Days</option>
              <option value="Kathmandu Pokhara Tour">Kathmandu Pokhara Tour — 5 Days</option>
              <option value="Direct Inquiry with Dil Gurung">Direct Inquiry with Dil Gurung (Founder)</option>
              <option value="Tailor-Made Custom Himalayan Itinerary">Tailor-Made Custom Himalayan Itinerary</option>
              <option value="Other / Need Expert Advice">Other / Not Sure (Need Advice)</option>
            </select>
            <span class="easy-select-chevron" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
        </div>

        <!-- Message / Notes -->
        <div class="easy-field">
          <label class="easy-label" for="inq-notes">
            <span>Questions or Special Requests</span>
            <span class="opt">Optional</span>
          </label>
          <textarea id="inq-notes" name="notes" class="easy-textarea" rows="2" placeholder="Dietary needs, preferred pace, or questions for Dil Gurung..."></textarea>
        </div>

        <!-- Submit Button -->
        <button type="submit" id="inq-submit-btn" class="easy-submit-btn">
          <span>Get Free Custom Quote &amp; Itinerary &rarr;</span>
        </button>

        <!-- WhatsApp Quick Chat Link -->
        <a id="inq-whatsapp-link" href="https://wa.me/9779851023285?text=Hello%20Nepal%20Unique%20Treks%2C%20I%20would%20like%20to%20inquire%20about%20booking%20${encodedTitle}" target="_blank" rel="noopener" class="easy-whatsapp-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
          <span>Prefer instant reply? Chat on WhatsApp (${OFFICIAL_PHONE_DISPLAY}) &rarr;</span>
        </a>

        <!-- Simple Trust Row -->
        <div class="easy-trust-row">
          <span>🔒 100% Free &bull; No Obligation</span>
          <span>⚡ 2–4 Hr Reply</span>
          <span>⭐ 15+ Yrs Mountain Guide</span>
        </div>
      </form>
    </div>
  `;
}

function matchTitleToOption(title, selectEl) {
  if (!title || !selectEl || title.includes('Leave a Review')) return null;

  const rawNorm = title.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    if (!opt.value) continue;
    const optRawVal = opt.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const optRawText = opt.text.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rawNorm === optRawVal || rawNorm === optRawText || optRawVal.includes(rawNorm) || rawNorm.includes(optRawVal)) {
      return opt;
    }
  }

  // Check key words
  const words = rawNorm.split(/[^a-z0-9]+/).filter(w => w.length > 3);
  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    const optText = opt.text.toLowerCase();
    for (const w of words) {
      if (optText.includes(w)) {
        return opt;
      }
    }
  }

  return null;
}

export function setupInquiryModal() {
  let modalOverlay = document.getElementById('inquiry-modal');

  // Auto-inject or update modal
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'inquiry-modal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'none';
    modalOverlay.innerHTML = getModalTemplate();
    document.body.appendChild(modalOverlay);
  } else {
    // Always ensure easy template is loaded
    if (!modalOverlay.querySelector('.easy-inq-card')) {
      modalOverlay.className = 'modal-overlay';
      modalOverlay.style.display = 'none';
      modalOverlay.innerHTML = getModalTemplate();
    }
  }

  const modalTitle = document.getElementById('modal-trek-title');
  const badgeTrekName = document.getElementById('inq-badge-trek-name');
  const hiddenTrekInput = document.getElementById('inq-hidden-trek');
  const departureTag = document.getElementById('inq-departure-tag');
  const hiddenDepartureInput = document.getElementById('inq-hidden-departure');
  const whatsappLink = document.getElementById('inq-whatsapp-link');
  const packageSelect = document.getElementById('inq-package');
  const startDateInput = document.getElementById('inq-start-date');

  // Sync dropdown when user selects a different trek
  if (packageSelect) {
    packageSelect.addEventListener('change', () => {
      const selectedTrek = packageSelect.value;
      if (selectedTrek) {
        if (badgeTrekName) badgeTrekName.textContent = selectedTrek;
        if (hiddenTrekInput) hiddenTrekInput.value = selectedTrek;
        if (whatsappLink) {
          const dep = hiddenDepartureInput ? hiddenDepartureInput.value : '';
          const waMsg = dep
            ? `Hello Nepal Unique Treks, I would like to inquire about booking ${selectedTrek} for departure: ${dep}.`
            : `Hello Nepal Unique Treks, I would like to inquire about booking ${selectedTrek}.`;
          whatsappLink.href = `https://wa.me/9779851023285?text=${encodeURIComponent(waMsg)}`;
        }
      }
    });
  }

  const openModal = (title = "Everest Base Camp Trek", departure = "") => {
    // Clean up title for clean display
    let displayTitle = title;
    if (displayTitle.toLowerCase().includes('inquire about:') || displayTitle.toLowerCase().includes('book / inquire:')) {
      displayTitle = displayTitle.replace(/^(inquire about:|book \/ inquire:)\s*/i, '');
    }

    if (badgeTrekName) badgeTrekName.textContent = displayTitle;
    if (hiddenTrekInput) hiddenTrekInput.value = displayTitle;
    if (modalTitle) {
      modalTitle.textContent = displayTitle.toLowerCase().includes('dil gurung')
        ? "Inquire Directly with Dil Gurung"
        : `Plan Your ${displayTitle}`;
    }

    if (departureTag) {
      if (departure) {
        departureTag.textContent = `📅 Departure: ${departure}`;
        departureTag.style.display = 'inline-flex';
        if (hiddenDepartureInput) hiddenDepartureInput.value = departure;
        if (startDateInput) startDateInput.value = departure;
      } else {
        departureTag.textContent = '';
        departureTag.style.display = 'none';
        if (hiddenDepartureInput) hiddenDepartureInput.value = '';
      }
    }

    // Select the best matching option in the dropdown
    if (packageSelect) {
      const matchOpt = matchTitleToOption(displayTitle, packageSelect);
      if (matchOpt) {
        packageSelect.value = matchOpt.value;
      } else if (displayTitle.toLowerCase().includes('dil gurung') || displayTitle.toLowerCase().includes('founder')) {
        packageSelect.value = "Direct Inquiry with Dil Gurung";
      } else if (displayTitle.toLowerCase().includes('custom')) {
        packageSelect.value = "Tailor-Made Custom Himalayan Itinerary";
      } else if (displayTitle) {
        const newOpt = document.createElement('option');
        newOpt.value = displayTitle;
        newOpt.text = displayTitle;
        newOpt.selected = true;
        packageSelect.insertBefore(newOpt, packageSelect.firstChild);
      }
      upgradeStyledSelect(packageSelect);
      syncStyledSelect(packageSelect);
    }
    upgradeStyledSelect(document.getElementById('inq-trekkers'));

    if (whatsappLink) {
      const waMsg = departure
        ? `Hello Nepal Unique Treks, I would like to inquire about booking ${displayTitle} for departure: ${departure}.`
        : `Hello Nepal Unique Treks, I would like to inquire about booking ${displayTitle}.`;
      whatsappLink.href = `https://wa.me/9779851023285?text=${encodeURIComponent(waMsg)}`;
    }

    // Reset errors
    clearFormErrors();

    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
      requestAnimationFrame(() => {
        modalOverlay.classList.add('active');
      });
    }
    document.body.style.overflow = 'hidden';

    // Autofocus name
    setTimeout(() => {
      const nameInput = document.getElementById('inq-name');
      if (nameInput) nameInput.focus();
    }, 100);
  };

  const closeModal = () => {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      setTimeout(() => {
        modalOverlay.style.display = 'none';
      }, 200);
    }
    document.body.style.overflow = '';
  };

  function clearFormErrors() {
    const errorInputs = modalOverlay ? modalOverlay.querySelectorAll('.has-error') : [];
    errorInputs.forEach(el => el.classList.remove('has-error'));
    const errorMsgs = modalOverlay ? modalOverlay.querySelectorAll('.easy-err') : [];
    errorMsgs.forEach(el => { el.style.display = 'none'; });
  }

  // Live error clearing
  modalOverlay.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.classList.contains('has-error')) {
      target.classList.remove('has-error');
      const errEl = document.getElementById(`${target.id}-error`);
      if (errEl) errEl.style.display = 'none';
    }
  });

  // Global click listener for inquiry buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.play-video-trigger, .video-card, .video-story-card, .video-thumb-card, .how-works-video-wrapper, .video-review-card, [data-video-src], [data-video-url]')) {
      return;
    }

    const closeTrigger = e.target.closest('.modal-close, #modal-close-btn, #close-inquiry-modal, #inq-success-close-btn');
    if (closeTrigger && modalOverlay && modalOverlay.contains(closeTrigger)) {
      closeModal();
      return;
    }

    if (e.target === modalOverlay) {
      closeModal();
      return;
    }

    const btn = e.target.closest([
      '.open-inquiry-btn',
      '.open-inquiry-modal-btn',
      '.open-inquiry-modal-trigger',
      '.btn-journey-pill',
      '.btn-book-now',
      '#btn-select-private-date',
      '.btn-leave-review',
      '.founder-badge-link',
      '.founder-read-bio-btn',
      '.mega-talk-pill',
      '.mobile-drawer-cta',
      '[data-inquiry-type]'
    ].join(', '));

    if (btn) {
      e.preventDefault();

      let title = btn.getAttribute('data-trek-title') || btn.getAttribute('data-inquiry-type');
      let departureInfo = '';

      const depRow = btn.closest('.departure-item-row');
      if (depRow) {
        const depTitleEl = depRow.querySelector('.departure-title');
        const depPriceEl = depRow.querySelector('.departure-price');
        if (depTitleEl) {
          departureInfo = depTitleEl.textContent.trim();
          if (depPriceEl) departureInfo += ` (${depPriceEl.textContent.trim()})`;
        }
      }

      if (!title) {
        const pageH1 = document.querySelector('h1');
        const h1Text = pageH1 ? pageH1.textContent.trim().replace(/\s+/g, ' ') : '';
        const isGenericHeroH1 = !h1Text || h1Text.length > 55 || /local trekking agency/i.test(h1Text);
        title = isGenericHeroH1 ? "Tailor-Made Custom Himalayan Itinerary" : h1Text;
      }

      const inquiryMessage = btn.getAttribute('data-inquiry-message');
      const inquiryNotes = document.getElementById('inq-notes');
      if (inquiryMessage && inquiryNotes) {
        inquiryNotes.value = inquiryMessage;
      }

      openModal(title, departureInfo);
    }
  });

  // Escape key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Form Submission Handler
  const attachFormSubmit = () => {
    const inquiryForm = (modalOverlay && modalOverlay.querySelector('form')) ||
                        document.getElementById('custom-inquiry-form');
    if (!inquiryForm) return;

    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEl = document.getElementById('inq-name');
      const emailEl = document.getElementById('inq-email');
      const phoneEl = document.getElementById('inq-phone');
      const trekkersEl = document.getElementById('inq-trekkers');
      const packageEl = document.getElementById('inq-package');
      const startDateEl = document.getElementById('inq-start-date');
      const notesEl = document.getElementById('inq-notes');
      const hiddenTrekEl = document.getElementById('inq-hidden-trek');
      const hiddenDepEl = document.getElementById('inq-hidden-departure');
      const submitBtn = document.getElementById('inq-submit-btn');

      let isValid = true;
      let firstInvalid = null;

      // Validate Name
      const nameVal = nameEl ? nameEl.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        isValid = false;
        if (nameEl) nameEl.classList.add('has-error');
        const err = document.getElementById('inq-name-error');
        if (err) err.style.display = 'block';
        if (!firstInvalid) firstInvalid = nameEl;
      }

      // Validate Email
      const emailVal = emailEl ? emailEl.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        isValid = false;
        if (emailEl) emailEl.classList.add('has-error');
        const err = document.getElementById('inq-email-error');
        if (err) err.style.display = 'block';
        if (!firstInvalid) firstInvalid = emailEl;
      }

      // Validate Phone
      const phoneVal = phoneEl ? phoneEl.value.trim() : '';
      if (!phoneVal || phoneVal.replace(/\D/g, '').length < 6) {
        isValid = false;
        if (phoneEl) phoneEl.classList.add('has-error');
        const err = document.getElementById('inq-phone-error');
        if (err) err.style.display = 'block';
        if (!firstInvalid) firstInvalid = phoneEl;
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const selectedPackage = packageEl && packageEl.value ? packageEl.value : (hiddenTrekEl ? hiddenTrekEl.value : 'Custom Himalayan Trip');
      const departureDate = hiddenDepEl ? hiddenDepEl.value : '';
      const startDate = startDateEl ? startDateEl.value.trim() : '';
      const trekkers = trekkersEl ? trekkersEl.options[trekkersEl.selectedIndex].text : '2 Persons';
      const notes = notesEl ? notesEl.value.trim() : '';

      try {
        const payload = {
          trekTitle: selectedPackage,
          departureDate,
          startDate,
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          trekkers,
          notes,
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem('nepal_unique_last_inquiry', JSON.stringify(payload));
      } catch (err) {}

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="easy-spinner"></div>
          <span>Sending Your Inquiry...</span>
        `;
      }

      const waSummary = `Namaste Nepal Unique Treks! I just sent a quick inquiry on your website.\n\n` +
        `• Name: ${nameVal}\n` +
        `• Trip: ${selectedPackage}\n` +
        (startDate ? `• Approx. Date: ${startDate}\n` : '') +
        `• Travellers: ${trekkers}\n` +
        (notes ? `• Notes: ${notes}\n` : '');

      const waUrl = `https://wa.me/9779851023285?text=${encodeURIComponent(waSummary)}`;

      const emailPayload = {
        "Trip / Package": selectedPackage,
        "Full Name": nameVal,
        "Email Address": emailVal,
        "WhatsApp / Phone": phoneVal,
        "Approx. Travel Date": startDate || departureDate || "Flexible",
        "Number of Travellers": trekkers,
        "Questions & Notes": notes || "None provided",
        "Source Page": window.location.href,
        "Submitted At (NPT)": new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }) + ' (NPT)',
        "_subject": `[Quick Trip Inquiry] ${selectedPackage} - ${nameVal}`,
        "_replyto": emailVal,
        "_template": "table",
        "_captcha": "false"
      };

      try {
        fetch('https://formsubmit.co/ajax/info@nepaluniquetreks.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(emailPayload)
        }).catch(err => console.warn('Dispatch note:', err));
      } catch (err) {}

      setTimeout(() => {
        const card = inquiryForm.closest('.modal-card');
        if (!card) {
          alert('Thank you! Your inquiry has been submitted. Dil Gurung will contact you shortly.');
          closeModal();
          inquiryForm.reset();
          return;
        }

        const originalHTML = card.innerHTML;

        card.innerHTML = `
          <div class="easy-success-wrap">
            <div class="easy-success-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22845F" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 class="easy-success-title">Inquiry Sent! Namaste, ${escapeHtml(nameVal)}</h3>
            <p class="easy-success-desc">
              Dil Gurung and our Kathmandu team have received your inquiry for <strong>${escapeHtml(selectedPackage)}</strong>.
              <br><br>
              We are preparing your custom day-by-day itinerary and quotation. You will hear from us within <strong>2–4 hours</strong> on WhatsApp and Email.
            </p>
            <div class="easy-success-actions">
              <a href="${waUrl}" target="_blank" rel="noopener" class="easy-submit-btn" style="text-decoration: none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
                <span>Chat on WhatsApp for Instant Reply</span>
              </a>
              <button type="button" id="inq-success-done-btn" class="easy-close-page-btn">
                Close &amp; Back to Page
              </button>
            </div>
            <div class="easy-success-foot">
              Direct Phone / WhatsApp: <a href="tel:${OFFICIAL_PHONE}">${OFFICIAL_PHONE_DISPLAY}</a> &bull; Email: <a href="mailto:${OFFICIAL_EMAIL}">${OFFICIAL_EMAIL}</a>
            </div>
          </div>
        `;

        const doneBtn = card.querySelector('#inq-success-done-btn');
        if (doneBtn) {
          doneBtn.addEventListener('click', () => {
            closeModal();
            setTimeout(() => {
              card.innerHTML = originalHTML;
              attachFormSubmit();
              upgradeStyledSelect(document.getElementById('inq-trekkers'));
              upgradeStyledSelect(document.getElementById('inq-package'));
            }, 300);
          });
        }
      }, 500);
    });
  };

  attachFormSubmit();
  upgradeStyledSelect(document.getElementById('inq-trekkers'));
  upgradeStyledSelect(document.getElementById('inq-package'));

  if (typeof window !== 'undefined' && ['#inquiry-modal', '#book', '#inquire'].includes(window.location.hash)) {
    const pageH1 = document.querySelector('h1');
    const autoTitle = pageH1 && pageH1.textContent.trim() ? pageH1.textContent.trim() : "Everest Base Camp Trek";
    openModal(autoTitle);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupInquiryModal);
} else {
  setupInquiryModal();
}
