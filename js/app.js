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
  const fieldTee   = document.getElementById('fieldTee');
  const teeFieldGroup = document.getElementById('teeFieldGroup');

  let currentCourse = null;

  // ── Init ──
  function init() {
    const savedHI = Storage.getHI();
    if (savedHI !== null) fieldHI.value = savedHI;

    // Always show HI pill
    UI.showHIButton(savedHI);

    // Restore last viewed course
    const last = Storage.getLastCourse();
    if (last && savedHI !== null) {
      currentCourse     = last;
      searchInput.value = last.name;
      UI.showResults(last, savedHI, () => openModalForEstimated(last, savedHI));
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
      Storage.clearLastCourse();
      currentCourse = null;
      return;
    }
    searchTimeout = setTimeout(async () => {
      // Magic keywords — show all saved courses
      const magicPhrases = ['my courses', 'saved courses', 'saved', 'my saved'];
      if (magicPhrases.includes(q.toLowerCase())) {
        const all = Storage.getCourses();
        UI.showDropdown(all.length > 0 ? all : [], onCourseSelected);
        UI.hideSearchSpinner();
        return;
      }

      // Always show local results immediately
      const local = Storage.searchCourses(q);
      if (local.length > 0) UI.showDropdown(local, onCourseSelected);

      // Then fetch from API and merge
      try {
        UI.showSearchSpinner();
        const apiResults = await API.searchCourses(q);
        const normalised = apiResults.map(API.normaliseCourse);

        // Merge: local results first, then API results not already in local
        const localNames = local.map(c => c.name.toLowerCase());
        const fresh = normalised.filter(
          c => !localNames.includes(c.name.toLowerCase())
        );
        const merged = [...local, ...fresh];
        UI.showDropdown(merged, onCourseSelected);
      } catch (e) {
        // API failed — local results already showing, silently continue
      } finally {
        UI.hideSearchSpinner();
      }
    }, 350);
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
    course._fullPar  = course.par;
    course._apiHoles = 18;
    course.holes     = '18';

    // Restore last used tee for this course
    if (course._source === 'api' && course.allTees?.length > 0) {
      const lastTeeName = Storage.getLastTee(course.name);
      const lastTee     = lastTeeName
        ? course.allTees.find(t => t.tee_name === lastTeeName)
        : null;
      const tee = lastTee || course.allTees[1] || course.allTees[0];
      course.selectedTee = tee;
      course.stats18     = { par: tee.par_total, cr: tee.course_rating, sr: tee.slope_rating, estimated: false };
      course.statsFront  = {
        par: Math.round(tee.par_total / 2),
        cr:  tee.front_course_rating || parseFloat((tee.course_rating / 2).toFixed(1)),
        sr:  tee.front_slope_rating  || tee.slope_rating,
        estimated: !tee.front_course_rating
      };
      course.statsBack   = {
        par: Math.round(tee.par_total / 2),
        cr:  tee.back_course_rating  || parseFloat((tee.course_rating / 2).toFixed(1)),
        sr:  tee.back_slope_rating   || tee.slope_rating,
        estimated: !tee.back_course_rating
      };
    }

    currentCourse     = course;
    searchInput.value = course.name;

    const hi = Storage.getHI();
    if (hi !== null) {
      if (course._source === 'api' && course.selectedTee) {
        Storage.saveLastTee(course.name, course.selectedTee.tee_name);
      }
      Storage.saveLastCourse(course);
      UI.showResults(course, hi, () => openModalForEstimated(course, hi));
    } else {
      prefillModal(course);
      UI.openModal();
    }
  }

  // ── Auto-populate par when holes changes ──
  fieldHoles.addEventListener('change', () => {
    updateParForHoles(currentCourse);
  });

  // ── Tee change ──
  fieldTee.addEventListener('change', () => {
    if (!currentCourse?.allTees) return;
    const selected = currentCourse.allTees.find(t => t.tee_name === fieldTee.value);
    if (!selected) return;
    // Update currentCourse stats from selected tee
    currentCourse.selectedTee = selected;
    currentCourse.stats18     = {
      par: selected.par_total, cr: selected.course_rating, sr: selected.slope_rating, estimated: false
    };
    currentCourse.statsFront  = {
      par: Math.round(selected.par_total / 2),
      cr:  selected.front_course_rating || parseFloat((selected.course_rating / 2).toFixed(1)),
      sr:  selected.front_slope_rating  || selected.slope_rating,
      estimated: !selected.front_course_rating
    };
    currentCourse.statsBack   = {
      par: Math.round(selected.par_total / 2),
      cr:  selected.back_course_rating  || parseFloat((selected.course_rating / 2).toFixed(1)),
      sr:  selected.back_slope_rating   || selected.slope_rating,
      estimated: !selected.back_course_rating
    };
    updateParForHoles(currentCourse);
  });

  // ── Modal open/close ──
  openAddBtn.addEventListener('click', () => {
    clearModalForm();
    const savedHI = Storage.getHI();
    if (savedHI !== null) fieldHI.value = savedHI;
    fieldHoles.value = '18';
    updateModalActions(null);
    UI.openModal();
  });

  closeModalBtn.addEventListener('click', UI.closeModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) UI.closeModal();
  });

  Sheet.init();

  // ── Edit HI ──
  hiEditBtn.addEventListener('click', () => {
    const savedHI = Storage.getHI();
    if (savedHI !== null) fieldHI.value = savedHI;
    if (currentCourse) {
      prefillModal(currentCourse);
      const hi = Storage.getHI();
      if (hi !== null) {
        UI.showResults(currentCourse, hi, () => openModalForEstimated(currentCourse, hi));
      }
      updateModalActions(currentCourse);
    } else {
      clearModalForm();
      if (savedHI !== null) fieldHI.value = savedHI;
      updateModalActions(null);
      // Flag that this is a HI-only edit
      fieldName.placeholder = 'No course selected';
    }
    modalError.classList.add('hidden');
    UI.openModal();
  });

 // ── Submit ──
  submitBtn.addEventListener('click', () => {
    const name  = fieldName.value.trim();
    const holes = fieldHoles.value;
    const par   = parseFloat(fieldPar.value);
    const cr    = parseFloat(fieldCR.value);
    const sr    = parseFloat(fieldSR.value);
    const hi    = parseFloat(fieldHI.value);

    modalError.textContent = 'Please fill in all fields.';
    modalError.classList.add('hidden');
    document.getElementById('estimatedNote').classList.add('hidden');

    // HI-only save — no course loaded
    if (!currentCourse && !name) {
      if (isNaN(hi)) {
        modalError.classList.remove('hidden');
        return;
      }
      Storage.saveHI(hi);
      UI.showHIButton(hi);
      UI.closeModal();
      return;
    }

    if (!name || isNaN(par) || isNaN(cr) || isNaN(sr) || isNaN(hi)) {
      modalError.classList.remove('hidden');
      return;
    }

    Storage.saveHI(hi);

    // Rename — name changed (including case-only changes)
    if (currentCourse && name !== currentCourse.name &&
        currentCourse._source !== 'api') {
      const alreadyExists = Storage.getCourses()
        .find(c => c.name.toLowerCase() === name.toLowerCase());

      if (!alreadyExists) {
        // Prompt — update existing name or save as new course
        showSavePrompt(currentCourse.name, () => {
          // Rename existing
          Storage.deleteCourse(currentCourse.name);
          const renamed = { ...currentCourse, name, holes };
          Storage.saveCourse(renamed);
          currentCourse = renamed;
          searchInput.value = renamed.name;
          UI.closeModal();
          UI.showResults(renamed, hi, () => openModalForEstimated(renamed, hi));
        }, () => {
          // Save as new — keep old, create fresh
          const course = buildCourse(name, holes, par, cr, sr, null);
          Storage.saveCourse(course);
          currentCourse = course;
          currentCourse.holes = holes;
          searchInput.value = course.name;
          UI.closeModal();
          UI.showResults(course, hi, () => openModalForEstimated(course, hi));
        });
        return;
      }
      // Name already taken — fall through to doSave which will prompt
    }

    // If nothing has changed except holes or HI, just recalculate without saving
    if (currentCourse && name === currentCourse.name) {
      const existingStats = holes === 'front9' ? currentCourse.statsFront
                          : holes === 'back9'  ? currentCourse.statsBack
                          : currentCourse.stats18;
      const statsUnchanged = existingStats
        && parseFloat(existingStats.par) === par
        && parseFloat(existingStats.cr)  === cr
        && parseFloat(existingStats.sr)  === sr;

      if (statsUnchanged) {
        currentCourse.holes = holes;
        searchInput.value   = currentCourse.name;
        UI.closeModal();
        UI.showResults(currentCourse, hi, () => openModalForEstimated(currentCourse, hi));
        return;
      }
    }

    doSave(name, holes, par, cr, sr, hi);
  });

  function doSave(name, holes, par, cr, sr, hi) {
    // Block saving under the same name as the currently loaded API course
    if (currentCourse?._source === 'api' &&
        name.toLowerCase() === currentCourse.name.toLowerCase()) {
      fieldName.value = '';
      fieldName.placeholder = todayName();
      fieldName.focus();
      modalError.textContent = 'API courses cannot be overwritten — please save under a new name.';
      modalError.classList.remove('hidden');
      return;
    }

    const existingCourse = Storage.getCourses()
      .find(c => c.name.toLowerCase() === name.toLowerCase());
    // Only allow overwrite of manually saved courses, never API courses
    const isOverwrite = !!existingCourse && existingCourse._source === 'manual';

    if (isOverwrite) {
      showSavePrompt(name, () => {
        const merged = buildCourse(name, holes, par, cr, sr, existingCourse);
        Storage.saveCourse(merged);
        currentCourse = Storage.getCourses()
          .find(c => c.name.toLowerCase() === name.toLowerCase()) || merged;
        currentCourse.holes = holes;
        searchInput.value = currentCourse.name;
        UI.closeModal();
        UI.showResults(currentCourse, hi, () => openModalForEstimated(currentCourse, hi));
      }, () => {
        fieldName.value = '';
        fieldName.placeholder = todayName();
        fieldName.focus();
        modalError.textContent = 'Enter a new name to save as a separate course.';
        modalError.classList.remove('hidden');
      });
      return;
    }

    const course = buildCourse(name, holes, par, cr, sr, null);
    Storage.saveCourse(course);
    // Reload from storage so _source is correct for future edits
    currentCourse = Storage.getCourses()
      .find(c => c.name.toLowerCase() === name.toLowerCase()) || course;
    currentCourse.holes = holes;
    searchInput.value = currentCourse.name;
    if (currentCourse._source === 'api' && currentCourse.selectedTee) {
      Storage.saveLastTee(currentCourse.name, currentCourse.selectedTee.tee_name);
    }
    Storage.saveLastCourse(currentCourse);
    UI.closeModal();
    UI.showResults(currentCourse, hi, () => openModalForEstimated(currentCourse, hi));
  }

  function buildCourse(name, holes, par, cr, sr, existing) {
    const full18Par = holes === '18' ? par
                    : (existing?.stats18?.par || par * 2);
    const full18Cr  = holes === '18' ? cr
                    : (existing?.stats18?.cr  || parseFloat((cr * 2).toFixed(1)));
    const full18Sr  = holes === '18' ? sr : (existing?.stats18?.sr || sr);

    const stats18 = holes === '18'
      ? { par, cr, sr, estimated: false }
      : (existing?.stats18 || { par: full18Par, cr: full18Cr, sr: full18Sr, estimated: true });

    const statsFront = holes === 'front9'
      ? { par, cr, sr, estimated: false }
      : (existing?.statsFront || {
          par: Math.round(full18Par / 2),
          cr:  parseFloat((full18Cr / 2).toFixed(1)),
          sr:  full18Sr,
          estimated: true
        });

    const statsBack = holes === 'back9'
      ? { par, cr, sr, estimated: false }
      : (existing?.statsBack || {
          par: Math.round(full18Par / 2),
          cr:  parseFloat((full18Cr / 2).toFixed(1)),
          sr:  full18Sr,
          estimated: true
        });

    return {
      _source:    'manual',
      name,
      holes,
      stats18,
      statsFront,
      statsBack,
    };
  }

  function openModalForEstimated(course, hi) {
    prefillModal(course);
    const savedHI = Storage.getHI();
    if (savedHI !== null) fieldHI.value = savedHI;
    modalError.classList.add('hidden');
    UI.openModal();
  }

  function showSavePrompt(courseName, onOverwrite, onNew) {
    modalError.innerHTML = `Save as — <button class="inline-btn" id="promptOverwrite">update "${courseName}"</button> or <button class="inline-btn" id="promptNew">save as new course</button>?`;
    modalError.classList.remove('hidden');
    document.getElementById('promptOverwrite').addEventListener('click', onOverwrite);
    document.getElementById('promptNew').addEventListener('click', onNew);
  }

  function todayName() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(2);
    return `Course Name - ${dd}${mm}${yy}`;
  }

  // ── Helpers ──
  function clearModalForm() {
    fieldName.value        = '';
    fieldHoles.value       = '18';
    fieldPar.value         = '';
    fieldCR.value          = '';
    fieldSR.value          = '';
    fieldName.placeholder  = todayName();
    console.log('name typed:', name);
    console.log('currentCourse.name:', currentCourse?.name);
    console.log('match:', name === currentCourse?.name);
    modalError.textContent = 'Please fill in all fields.';
    modalError.classList.add('hidden');
  }

  function prefillModal(course) {
    fieldName.value       = course.name;
    fieldName.placeholder = todayName();

    const savedHoles = course.holes === 'front9' || course.holes === 'back9'
                       ? course.holes : '18';

    Array.from(fieldHoles.options).forEach(opt => {
      opt.hidden = opt.value === '9';
    });

    fieldHoles.value = savedHoles;

    // Tee dropdown — only for API courses
    if (course._source === 'api' && course.allTees?.length > 0) {
      teeFieldGroup.classList.remove('hidden');
      fieldTee.innerHTML = course.allTees
        .map(t => `<option value="${t.tee_name}">${t.tee_name}</option>`)
        .join('');
      const selectedName = course.selectedTee?.tee_name || course.allTees[1]?.tee_name || course.allTees[0]?.tee_name;
      fieldTee.value = selectedName;
    } else {
      teeFieldGroup.classList.add('hidden');
      fieldTee.innerHTML = '';
    }

    const stats = savedHoles === 'front9' ? course.statsFront
                : savedHoles === 'back9'  ? course.statsBack
                : course.stats18;

    fieldPar.value = stats?.par ?? course.par ?? '';
    fieldCR.value  = stats?.cr  ?? course.cr  ?? '';
    fieldSR.value  = stats?.sr  ?? course.sr  ?? '';

    const estimatedNote = document.getElementById('estimatedNote');
    if (stats?.estimated) {
      estimatedNote.classList.remove('hidden');
    } else {
      estimatedNote.classList.add('hidden');
    }
  }

  function updateParForHoles(course) {
    if (!course) return;
    const holes = fieldHoles.value;
    const stats = holes === 'front9' ? course.statsFront
                : holes === 'back9'  ? course.statsBack
                : course.stats18;

    const estimatedNote = document.getElementById('estimatedNote');

    if (stats) {
      fieldPar.value = stats.par ?? '';
      fieldCR.value  = stats.cr  ?? '';
      fieldSR.value  = stats.sr  ?? '';
      if (stats.estimated) {
        estimatedNote.classList.remove('hidden');
      } else {
        estimatedNote.classList.add('hidden');
      }
    } else {
      const fullPar  = course.par || '';
      fieldPar.value = holes === '18' ? fullPar : Math.round(fullPar / 2) || '';
      fieldCR.value  = course.cr || '';
      fieldSR.value  = course.sr || '';
      estimatedNote.classList.add('hidden');
    }
  }

  function updateModalActions(course) {
    const actions = document.getElementById('modalActions');
    const existing = document.getElementById('deleteBtn');
    if (existing) existing.remove();

    if (course?._source === 'manual') {
      const deleteBtn = document.createElement('button');
      deleteBtn.id        = 'deleteBtn';
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete "${course.name}"?`)) {
          Storage.deleteCourse(course.name);
          currentCourse = null;
          searchInput.value = '';
          UI.closeModal();
          UI.hideResults();
        }
      });
      actions.insertBefore(deleteBtn, actions.firstChild);
    }
  }

  // ── Start ──
  init();
})();
