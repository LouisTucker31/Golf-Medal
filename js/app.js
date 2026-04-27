// ── App ──
(() => {

  // ── Elements ──
  const searchInput   = document.getElementById('searchInput');
  const openAddBtn    = document.getElementById('openAddCourse');
  const closeModalBtn = document.getElementById('closeModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const submitBtn     = document.getElementById('submitCourse');
  const hiEditBtn     = document.getElementById('hiEditBtn');
  const modalError    = document.getElementById('modalError');

  // Form fields
  const fieldName  = document.getElementById('fieldName');
  const fieldHoles = document.getElementById('fieldHoles');
  const fieldPar   = document.getElementById('fieldPar');
  const fieldCR    = document.getElementById('fieldCR');
  const fieldSR    = document.getElementById('fieldSR');
  const fieldHI    = document.getElementById('fieldHI');

  let currentCourse = null;

  // ── Init ──
  function init() {
    const savedHI = Storage.getHI();
    if (savedHI !== null) {
      fieldHI.value = savedHI;
    }
  }

  // ── Search ──
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length === 0) {
      UI.hideDropdown();
      UI.hideResults();
      currentCourse = null;
      return;
    }
    searchTimeout = setTimeout(() => {
      const results = Storage.searchCourses(q);
      UI.showDropdown(results, onCourseSelected);
    }, 120);
  });

  searchInput.addEventListener('focus', () => {
    const q = searchInput.value.trim();
    if (q.length > 0) {
      const results = Storage.searchCourses(q);
      UI.showDropdown(results, onCourseSelected);
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      UI.hideDropdown();
    }
  });

  function onCourseSelected(course) {
    currentCourse = course;
    searchInput.value = course.name;

    const hi = Storage.getHI();
    if (hi !== null) {
      UI.showResults(course, hi);
    } else {
      // No HI saved yet — open modal pre-filled with course data
      prefillModal(course);
      UI.openModal();
    }
  }

  // ── Modal open/close ──
  openAddBtn.addEventListener('click', () => {
    clearModalForm();
    const savedHI = Storage.getHI();
    if (savedHI !== null) fieldHI.value = savedHI;
    UI.openModal();
  });

  closeModalBtn.addEventListener('click', UI.closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) UI.closeModal();
  });

  Sheet.init();

  // ── Edit HI ──
  hiEditBtn.addEventListener('click', () => {
    clearModalForm();
    const savedHI = Storage.getHI();
    if (savedHI !== null) fieldHI.value = savedHI;
    if (currentCourse) prefillModal(currentCourse);
    UI.openModal();
  });

  // ── Submit ──
  submitBtn.addEventListener('click', () => {
    const name  = fieldName.value.trim();
    const holes = parseInt(fieldHoles.value, 10);
    const par   = parseFloat(fieldPar.value);
    const cr    = parseFloat(fieldCR.value);
    const sr    = parseFloat(fieldSR.value);
    const hi    = parseFloat(fieldHI.value);

    modalError.classList.add('hidden');

    if (!name || isNaN(par) || isNaN(cr) || isNaN(sr) || isNaN(hi)) {
      modalError.classList.remove('hidden');
      return;
    }

    const course = { name, holes, par, cr, sr };

    Storage.saveCourse(course);
    Storage.saveHI(hi);

    currentCourse = course;
    searchInput.value = course.name;

    UI.closeModal();
    UI.showResults(course, hi);
  });

  // ── Helpers ──
  function clearModalForm() {
    fieldName.value  = '';
    fieldHoles.value = '18';
    fieldPar.value   = '';
    fieldCR.value    = '';
    fieldSR.value    = '';
    modalError.classList.add('hidden');
  }

  function prefillModal(course) {
    fieldName.value  = course.name;
    fieldHoles.value = String(course.holes);
    fieldPar.value   = course.par;
    fieldCR.value    = course.cr;
    fieldSR.value    = course.sr;
  }

  // ── Start ──
  init();

})();
