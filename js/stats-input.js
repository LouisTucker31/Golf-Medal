// ── Stats Input Modal ──
const StatsInput = (() => {

  let currentStep    = 1;
  let selectedCourse = null;
  let selectedTee    = null;

  // ── Elements ──
  function el(id) { return document.getElementById(id); }

  function open() {
    reset();
    el('statsModalBackdrop').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showStep(1);
  }

  function close() {
    el('statsModalBackdrop').classList.add('hidden');
    document.body.style.overflow = '';
    reset();
  }

  function reset() {
    currentStep    = 1;
    selectedCourse = null;
    selectedTee    = null;

    // Step 1 fields
    if (el('roundCourseInput'))  el('roundCourseInput').value  = '';
    if (el('roundTeeSelect'))    el('roundTeeSelect').innerHTML = '';
    if (el('roundTeeGroup'))     el('roundTeeGroup').classList.add('hidden');
    if (el('roundHoles'))        el('roundHoles').value        = '18';
    if (el('roundDate'))         el('roundDate').value         = todayISO();
    if (el('roundGross'))        el('roundGross').value        = '';

    // Step 2 fields
    ['roundGIR', 'roundFairwaysHit', 'roundFairwaysTotal',
     'roundPutts', 'roundScramblingHit', 'roundScramblingTotal',
     'roundSandsaveHit', 'roundSandsaveTotal',
     'roundPenalties', 'roundBunkers', 'roundRecoveries'
    ].forEach(id => { if (el(id)) el(id).value = ''; });

    if (el('statsModalError')) el('statsModalError').textContent = '';
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function showStep(step) {
    currentStep = step;
    el('statsStep1').classList.toggle('hidden', step !== 1);
    el('statsStep2').classList.toggle('hidden', step !== 2);

    // Update step dots
    document.querySelectorAll('.step-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i + 1 === step);
    });

    el('statsModalTitle').textContent = step === 1 ? 'Add Round' : 'Shot Stats';
  }

  function onCourseSelected(course) {
    selectedCourse = course;
    populateTees(course);
  }

  function populateTees(course) {
    const teeGroup  = el('roundTeeGroup');
    const teeSelect = el('roundTeeSelect');
    if (!course.allTees?.length) {
      teeGroup.classList.add('hidden');
      return;
    }

    teeSelect.innerHTML = course.allTees
      .map(t => `<option value="${t.tee_name}">${t.tee_name}</option>`)
      .join('');

    // Default to second tee (same logic as medal page)
    const defaultTee = course.allTees[1] || course.allTees[0];
    teeSelect.value  = defaultTee.tee_name;
    selectedTee      = defaultTee;
    teeGroup.classList.remove('hidden');

    teeSelect.addEventListener('change', () => {
      selectedTee = course.allTees.find(t => t.tee_name === teeSelect.value) || null;
    });
  }

  function validateStep1() {
    const course = el('roundCourseInput')?.value.trim();
    const gross  = parseFloat(el('roundGross')?.value);
    const date   = el('roundDate')?.value;

    if (!course) {
      showError('Please enter a course name.'); return false;
    }
    if (!date) {
      showError('Please select a date.'); return false;
    }
    if (isNaN(gross) || gross < 50 || gross > 200) {
      showError('Please enter a valid gross score.'); return false;
    }
    return true;
  }

  function buildRound(skipStats) {
    const holes     = el('roundHoles').value;
    const is9       = holes !== '18';
    const gross     = parseFloat(el('roundGross').value);
    const date      = el('roundDate').value;
    const courseName = el('roundCourseInput').value.trim();

    // Get tee stats for differential
    let cr = null, sr = null, par = null;
    if (selectedTee) {
      if (holes === 'front9') {
        cr  = selectedTee.front_course_rating || selectedTee.course_rating / 2;
        sr  = selectedTee.front_slope_rating  || selectedTee.slope_rating;
        par = Math.round(selectedTee.par_total / 2);
      } else if (holes === 'back9') {
        cr  = selectedTee.back_course_rating  || selectedTee.course_rating / 2;
        sr  = selectedTee.back_slope_rating   || selectedTee.slope_rating;
        par = Math.round(selectedTee.par_total / 2);
      } else {
        cr  = selectedTee.course_rating;
        sr  = selectedTee.slope_rating;
        par = selectedTee.par_total;
      }
    }

    // Calculate differential
    let differential = null;
    if (cr !== null && sr !== null) {
      differential = parseFloat(((gross - cr) * (113 / sr) * (is9 ? 2 : 1)).toFixed(1));
    }

    const overPar = par !== null ? gross - par : null;

    // Shot stats — double if 9 holes
    const mult = is9 ? 2 : 1;

    const gir              = skipStats ? null : parseInt(el('roundGIR')?.value)              || null;
    const fairwaysHit      = skipStats ? null : parseInt(el('roundFairwaysHit')?.value)      || null;
    const fairwaysTotal    = skipStats ? null : parseInt(el('roundFairwaysTotal')?.value)     || null;
    const putts            = skipStats ? null : parseInt(el('roundPutts')?.value)             || null;
    const scramblingHit    = skipStats ? null : parseInt(el('roundScramblingHit')?.value)     || null;
    const scramblingTotal  = skipStats ? null : parseInt(el('roundScramblingTotal')?.value)   || null;
    const sandsaveHit      = skipStats ? null : parseInt(el('roundSandsaveHit')?.value)       || null;
    const sandsaveTotal    = skipStats ? null : parseInt(el('roundSandsaveTotal')?.value)     || null;
    const penalties        = skipStats ? null : parseInt(el('roundPenalties')?.value)         || null;
    const bunkers          = skipStats ? null : parseInt(el('roundBunkers')?.value)           || null;
    const recoveries       = skipStats ? null : parseInt(el('roundRecoveries')?.value)        || null;

    return {
      date,
      course:           courseName,
      tee:              selectedTee?.tee_name || null,
      holes,
      gross,
      overPar,
      par,
      differential,
      // Stats — doubled for 9-hole rounds
      girHit:           gir !== null ? gir * mult : null,
      girTotal:         is9 ? 18 : 18,
      fairwaysHit:      fairwaysHit !== null ? fairwaysHit * mult : null,
      fairwaysTotal:    fairwaysTotal !== null ? fairwaysTotal * mult : null,
      putts:            putts !== null ? putts * mult : null,
      scramblingHit:    scramblingHit !== null ? scramblingHit * mult : null,
      scramblingTotal:  scramblingTotal !== null ? scramblingTotal * mult : null,
      sandsaveHit:      sandsaveHit !== null ? sandsaveHit * mult : null,
      sandsaveTotal:    sandsaveTotal !== null ? sandsaveTotal * mult : null,
      penalties:        penalties !== null ? penalties * mult : null,
      bunkers:          bunkers !== null ? bunkers * mult : null,
      recoveries:       recoveries !== null ? recoveries * mult : null,
    };
  }

  function showError(msg) {
    if (el('statsModalError')) el('statsModalError').textContent = msg;
  }

  function init() {
    // Open button
    el('addRoundBtn')?.addEventListener('click', open);

    // Close button
    el('statsModalClose')?.addEventListener('click', close);

    // Backdrop click
    el('statsModalBackdrop')?.addEventListener('click', (e) => {
      if (e.target === el('statsModalBackdrop')) close();
    });

    // Swipe to dismiss
    const modalEl = el('statsModal');
    let startY = 0;
    modalEl?.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
    }, { passive: true });
    modalEl?.addEventListener('touchend', e => {
      if (e.changedTouches[0].clientY - startY > 80) close();
    }, { passive: true });

    // Course search
    StatsSearch.init('roundCourseInput', 'roundCourseDropdown', onCourseSelected);

    // Step 1 Next
    el('statsStep1Next')?.addEventListener('click', () => {
      if (!validateStep1()) return;
      showStep(2);
    });

    // Step 2 Save
    el('statsStep2Save')?.addEventListener('click', () => {
      const round = buildRound(false);
      StatsData.addRound(round);
      close();
      if (typeof StatsApp !== 'undefined') StatsApp.refresh();
    });

    // Step 2 Skip
    el('statsStep2Skip')?.addEventListener('click', () => {
      const round = buildRound(true);
      StatsData.addRound(round);
      close();
      if (typeof StatsApp !== 'undefined') StatsApp.refresh();
    });
  }

  return { init, open, close };
})();