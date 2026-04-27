// ── UI helpers ──
const UI = (() => {

  // Elements
  const resultsSection  = document.getElementById('resultsSection');
  const emptyState      = document.getElementById('emptyState');
  const displayCourseName     = document.getElementById('displayCourseName');
  const displayCourseMeta     = document.getElementById('displayCourseMeta');
  const displayCourseHandicap = document.getElementById('displayCourseHandicap');
  const goldRange   = document.getElementById('goldRange');
  const silverRange = document.getElementById('silverRange');
  const bronzeRange = document.getElementById('bronzeRange');
  const hiEditBtn   = document.getElementById('hiEditBtn');
  const hiEditValue = document.getElementById('hiEditValue');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const searchDropdown = document.getElementById('searchDropdown');

  function showResults(course, hi) {
    const ch     = Calculator.courseHandicap(hi, course.cr, course.sr, course.par, course.holes);
    const ranges = Calculator.scoreRanges(ch, course.par);

    displayCourseName.textContent = course.name;
    displayCourseMeta.textContent = `Par ${course.par} · CR ${course.cr} · SR ${course.sr} · ${course.holes} holes`;
    displayCourseHandicap.textContent = ch;

    goldRange.textContent   = `${ranges.gold.low}–${ranges.gold.high}`;
    silverRange.textContent = `${ranges.silver.low}–${ranges.silver.high}`;
    bronzeRange.textContent = `${ranges.bronze.low}–${ranges.bronze.high}`;

    emptyState.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    // Re-trigger animation
    resultsSection.style.animation = 'none';
    void resultsSection.offsetHeight;
    resultsSection.style.animation = '';

    updateHIButton(hi);
  }

  function hideResults() {
    resultsSection.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }

  function updateHIButton(hi) {
    hiEditValue.textContent = hi;
    hiEditBtn.classList.remove('hidden');
  }

  function showDropdown(courses, onSelect) {
    searchDropdown.innerHTML = '';

    if (courses.length === 0) {
      searchDropdown.innerHTML = '<div class="search-dropdown-empty">No saved courses found.</div>';
    } else {
      courses.forEach(course => {
        const item = document.createElement('div');
        item.className = 'search-dropdown-item';
        item.innerHTML = `
          <span class="item-name">${escapeHtml(course.name)}</span>
          <span class="item-meta">Par ${course.par} · CR ${course.cr} · SR ${course.sr} · ${course.holes} holes</span>
        `;
        item.addEventListener('click', () => {
          hideDropdown();
          onSelect(course);
        });
        searchDropdown.appendChild(item);
      });
    }

    searchDropdown.classList.remove('hidden');
  }

  function hideDropdown() {
    searchDropdown.classList.add('hidden');
  }

  function openModal() {
    modalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { showResults, hideResults, showDropdown, hideDropdown, openModal, closeModal, updateHIButton };
})();
