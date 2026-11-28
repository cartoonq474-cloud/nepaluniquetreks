/**
 * Mirrors the active <select> option label onto a flex-centered visual face
 * while keeping the real <select> interactive at opacity 0.001 on top.
 * Guarantees consistent single-chevron rendering and centered text across engines.
 */
export function syncStyledSelect(selectEl) {
  if (!selectEl) return;
  const faceText = selectEl.parentElement && selectEl.parentElement.querySelector('.styled-select-text');
  if (!faceText) return;
  const idx = selectEl.selectedIndex;
  const opt = idx >= 0 && selectEl.options ? selectEl.options[idx] : null;
  faceText.textContent = opt ? opt.textContent.trim() : '';
}

export function upgradeStyledSelect(selectEl) {
  if (!selectEl || !selectEl.parentElement) return;
  const wrap = selectEl.parentElement;
  if (!wrap.querySelector('.styled-select-face')) {
    const face = document.createElement('span');
    face.className = 'styled-select-face';
    face.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'styled-select-text';
    face.appendChild(label);
    wrap.insertBefore(face, selectEl);
    wrap.classList.add('has-styled-select');
    selectEl.addEventListener('change', () => syncStyledSelect(selectEl));
  }
  syncStyledSelect(selectEl);
}
