/**
 * Nepal Tourist Visa Page Interactive Module
 * Includes: Live Visa Fee & Currency Calculator, Interactive KTM Airport Timeline,
 * Carry-On Document Checklist, Searchable Nationality Eligibility Filter, and Accordion FAQs.
 */

document.addEventListener('DOMContentLoaded', () => {
  initVisaCalculator();
  initDocumentChecklist();
  initNationalityFilter();
  initFaqAccordions();
  initScrollspy();
});

/* ==========================================================================
   1. Live Visa Fee & Currency Calculator
   ========================================================================== */
function initVisaCalculator() {
  const daysSlider = document.getElementById('visa-days-slider');
  const daysValueSpan = document.getElementById('visa-days-value');
  const currencySelect = document.getElementById('visa-currency-select');
  const resultTier = document.getElementById('visa-calc-tier');
  const resultPrice = document.getElementById('visa-calc-price');
  const resultConverted = document.getElementById('visa-calc-converted');
  const resultBuffer = document.getElementById('visa-calc-buffer');
  const presetPills = document.querySelectorAll('.visa-preset-pill');

  if (!daysSlider || !daysValueSpan) return;

  // Approximate FX conversion rates relative to USD
  const rates = {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    AUD: { symbol: 'A$', rate: 1.52 },
    CAD: { symbol: 'C$', rate: 1.37 },
    INR: { symbol: '₹', rate: 86.5 }
  };

  function calculate(days, currency) {
    let tierTitle = '';
    let feeUSD = 0;
    let bufferMsg = '';
    let tierBadge = '';

    days = parseInt(days, 10);
    daysValueSpan.textContent = `${days} Day${days > 1 ? 's' : ''}`;

    if (days <= 15) {
      tierTitle = '15-Day Multiple Entry Tourist Visa';
      feeUSD = 30;
      tierBadge = '15 Days Tier';
      if (days >= 12 && days <= 15) {
        bufferMsg = '⚠️ <strong>Flight Delay Safety Buffer:</strong> If your planned trek or holiday is 12–15 days (e.g. Everest Base Camp or Langtang Valley), we strongly recommend buying the <strong>30-Day Visa ($50)</strong>. Mountain flight delays at Lukla or road delays can easily add 1–2 days, causing costly overstay fines ($45+ extension) on a 15-day visa.';
      }
    } else if (days <= 30) {
      tierTitle = '30-Day Multiple Entry Tourist Visa (Most Popular)';
      feeUSD = 50;
      tierBadge = '30 Days Tier • Recommended';
      if (days >= 27 && days <= 30) {
        bufferMsg = '💡 <strong>Extended Buffer Tip:</strong> If your trip is 28–30 days, consider extending your visa in Kathmandu/Pokhara or opting for the 90-day visa ($125) if you plan side excursions into Bhutan or India.';
      }
    } else if (days <= 90) {
      tierTitle = '90-Day Multiple Entry Tourist Visa';
      feeUSD = 125;
      tierBadge = '90 Days Tier';
    } else {
      const extraDays = days - 90;
      const extensionUSD = 45 + Math.max(0, extraDays - 15) * 3;
      tierTitle = `90-Day Visa + ${extraDays} Days In-Country Extension`;
      feeUSD = 125 + extensionUSD;
      tierBadge = 'Extended Stay (Max 150 Days)';
      bufferMsg = 'ℹ️ <strong>In-Country Extension Required:</strong> The Department of Immigration issues a maximum 90-day visa upon arrival. For stays beyond 90 days, you must visit the Immigration Office in Kathmandu or Pokhara to extend at $45 for 15 days + $3/day thereafter (up to the 150-day calendar year maximum).';
    }

    const { symbol, rate } = rates[currency] || rates.USD;
    const convertedAmount = Math.round(feeUSD * rate);

    resultTier.textContent = tierTitle;
    resultPrice.textContent = `$${feeUSD} USD`;

    if (currency !== 'USD') {
      resultConverted.textContent = `Approx. ${symbol}${convertedAmount} ${currency} (Subject to live bank counter FX rates)`;
      resultConverted.style.display = 'block';
    } else {
      resultConverted.textContent = 'Payable in crisp cash USD or major foreign currencies (EUR, GBP, AUD, CAD) at KTM airport bank desk.';
      resultConverted.style.display = 'block';
    }

    if (bufferMsg) {
      resultBuffer.innerHTML = bufferMsg;
      resultBuffer.style.display = 'block';
    } else {
      resultBuffer.style.display = 'none';
    }
  }

  daysSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    // Unset preset active unless matches
    presetPills.forEach(pill => {
      pill.classList.toggle('active', parseInt(pill.dataset.days, 10) === val);
    });
    calculate(val, currencySelect.value);
  });

  currencySelect.addEventListener('change', () => {
    calculate(daysSlider.value, currencySelect.value);
  });

  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const days = parseInt(pill.dataset.days, 10);
      daysSlider.value = days;
      calculate(days, currencySelect.value);
    });
  });

  // Initial run
  calculate(daysSlider.value, currencySelect.value);
}

/* ==========================================================================
   2. Interactive Document Checklist
   ========================================================================== */
function initDocumentChecklist() {
  const checkItems = document.querySelectorAll('.visa-check-item');
  const countSpan = document.getElementById('visa-check-count');
  const percentSpan = document.getElementById('visa-check-percent');
  const fillBar = document.getElementById('visa-check-fill');
  const resetBtn = document.getElementById('visa-check-reset');
  const printBtn = document.getElementById('visa-check-print');

  if (!checkItems.length || !countSpan) return;

  const total = checkItems.length;
  const STORAGE_KEY = 'nepal_visa_checklist_saved';

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    saved = {};
  }

  function updateProgress() {
    let checkedCount = 0;
    checkItems.forEach((item, idx) => {
      if (item.classList.contains('checked')) {
        checkedCount++;
        saved[idx] = true;
      } else {
        delete saved[idx];
      }
    });

    const percent = Math.round((checkedCount / total) * 100);
    countSpan.textContent = `${checkedCount} of ${total} items ready`;
    percentSpan.textContent = `${percent}%`;
    fillBar.style.width = `${percent}%`;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {}
  }

  // Restore saved
  checkItems.forEach((item, idx) => {
    if (saved[idx]) {
      item.classList.add('checked');
    }
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      updateProgress();
    });
  });

  updateProgress();

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      checkItems.forEach(item => item.classList.remove('checked'));
      saved = {};
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      updateProgress();
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   3. Searchable Nationality & Eligibility Filter
   ========================================================================== */
function initNationalityFilter() {
  const searchInput = document.getElementById('visa-nat-search');
  const filterPills = document.querySelectorAll('.visa-nat-pill');
  const resultsGrid = document.getElementById('visa-nat-results');

  if (!resultsGrid) return;

  const countryData = [
    { country: 'United States', flag: '🇺🇸', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'United Kingdom', flag: '🇬🇧', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Australia', flag: '🇦🇺', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Canada', flag: '🇨🇦', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Germany', flag: '🇩🇪', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'France', flag: '🇫🇷', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Netherlands', flag: '🇳🇱', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Switzerland', flag: '🇨🇭', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'India', flag: '🇮🇳', cat: 'exempt', status: 'Visa Exempt', fee: 'Free (No Visa)', note: 'No visa required. Must present valid Indian Passport or Voter ID Card.' },
    { country: 'Bangladesh', flag: '🇧🇩', cat: 'saarc', status: 'Gratis 30 Days', fee: 'Free (First 30 Days)', note: 'SAARC Member: First 30 days in a calendar year gratis (free of charge).' },
    { country: 'Bhutan', flag: '🇧🇹', cat: 'saarc', status: 'Gratis 30 Days', fee: 'Free (First 30 Days)', note: 'SAARC Member: First 30 days in a calendar year gratis (free of charge).' },
    { country: 'Sri Lanka', flag: '🇱🇰', cat: 'saarc', status: 'Gratis 30 Days', fee: 'Free (First 30 Days)', note: 'SAARC Member: First 30 days in a calendar year gratis (free of charge).' },
    { country: 'Maldives', flag: '🇲🇻', cat: 'saarc', status: 'Gratis 30 Days', fee: 'Free (First 30 Days)', note: 'SAARC Member: First 30 days in a calendar year gratis (free of charge).' },
    { country: 'Pakistan', flag: '🇵🇰', cat: 'saarc', status: 'Gratis 30 Days', fee: 'Free (First 30 Days)', note: 'SAARC Member: First 30 days gratis. Standard entry clearance rules apply.' },
    { country: 'China', flag: '🇨🇳', cat: 'gratis-cn', status: 'Gratis Visa', fee: 'Free of Charge', note: 'Chinese citizens receive gratis (free) tourist visa on arrival under bilateral pact.' },
    { country: 'Japan', flag: '🇯🇵', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'South Korea', flag: '🇰🇷', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Singapore', flag: '🇸🇬', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Malaysia', flag: '🇲🇾', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Spain', flag: '🇪🇸', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Italy', flag: '🇮🇹', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'New Zealand', flag: '🇳🇿', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Norway', flag: '🇳🇴', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Sweden', flag: '🇸🇪', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Denmark', flag: '🇩🇰', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Austria', flag: '🇦🇹', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Belgium', flag: '🇧🇪', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Ireland', flag: '🇮🇪', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Israel', flag: '🇮🇱', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'South Africa', flag: '🇿🇦', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Brazil', flag: '🇧🇷', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Argentina', flag: '🇦🇷', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Mexico', flag: '🇲🇽', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Poland', flag: '🇵🇱', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Czech Republic', flag: '🇨🇿', cat: 'voa', status: 'On-Arrival', fee: '$30 / $50 / $125', note: 'Eligible for 15, 30, or 90 days visa on arrival at KTM.' },
    { country: 'Nigeria', flag: '🇳🇬', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Ghana', flag: '🇬🇭', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Zimbabwe', flag: '🇿🇼', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Cameroon', flag: '🇨🇲', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Ethiopia', flag: '🇪🇹', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Somalia', flag: '🇸🇴', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Liberia', flag: '🇱🇷', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Iraq', flag: '🇮🇶', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Afghanistan', flag: '🇦🇫', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Syria', flag: '🇸🇾', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' },
    { country: 'Palestine', flag: '🇵🇸', cat: 'embassy', status: 'Embassy Visa', fee: 'Advance Only', note: '⚠️ NOT eligible for On-Arrival. Must secure visa at a Nepalese Embassy before travel.' }
  ];

  let currentCategory = 'all';
  let searchQuery = '';

  function renderCountries() {
    resultsGrid.innerHTML = '';

    const filtered = countryData.filter(item => {
      const matchCat = (currentCategory === 'all') ||
        (currentCategory === 'voa' && (item.cat === 'voa' || item.cat === 'gratis-cn')) ||
        (currentCategory === 'saarc' && item.cat === 'saarc') ||
        (currentCategory === 'exempt' && item.cat === 'exempt') ||
        (currentCategory === 'embassy' && item.cat === 'embassy');

      const matchSearch = item.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      resultsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #65736B;">
          <p style="margin: 0; font-size: 1rem; font-weight: 700; color: #1B2921;">No nationality match found for "${searchQuery}".</p>
          <p style="margin: 4px 0 0 0; font-size: 0.88rem;">Citizens of most countries not listed in the 12 advance visa nations are fully eligible for Visa on Arrival at KTM.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      let badgeClass = 'visa-status-voa';
      if (item.cat === 'saarc' || item.cat === 'gratis-cn') badgeClass = 'visa-status-gratis';
      if (item.cat === 'exempt') badgeClass = 'visa-status-exempt';
      if (item.cat === 'embassy') badgeClass = 'visa-status-embassy';

      const card = document.createElement('div');
      card.className = 'visa-country-card';
      card.innerHTML = `
        <div class="visa-country-top">
          <span class="visa-country-name">${item.flag} ${item.country}</span>
          <span class="visa-badge-status ${badgeClass}">${item.status}</span>
        </div>
        <p class="visa-country-desc">
          <strong>Fee:</strong> ${item.fee}<br>
          ${item.note}
        </p>
      `;
      resultsGrid.appendChild(card);
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.cat;
      renderCountries();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderCountries();
    });
  }

  // Initial render
  renderCountries();
}

/* ==========================================================================
   4. FAQ Accordions
   ========================================================================== */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll('.visa-faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.visa-faq-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close others for clean single-view accordion experience
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   5. Scrollspy for Sticky Sub-Navigation
   ========================================================================== */
function initScrollspy() {
  const links = document.querySelectorAll('.visa-subnav-link');
  const sections = [];

  links.forEach(link => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      const section = document.querySelector(targetId);
      if (section) {
        sections.push({ id: targetId, section, link });
      }
    }
  });

  if (!sections.length) return;

  function onScroll() {
    const scrollPos = window.scrollY + 160;

    sections.forEach(({ section, link }) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
