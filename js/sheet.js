// ── Sheet drag-to-dismiss ──
const Sheet = (() => {

  const modalEl   = document.getElementById('addCourseModal');
  const backdrop  = document.getElementById('modalBackdrop');

  let startY      = 0;
  let currentY    = 0;
  let dragging    = false;

  function init() {
    modalEl.addEventListener('touchstart', onTouchStart, { passive: true });
    modalEl.addEventListener('touchmove',  onTouchMove,  { passive: true });
    modalEl.addEventListener('touchend',   onTouchEnd,   { passive: true });
  }

  function onTouchStart(e) {
    startY   = e.touches[0].clientY;
    currentY = e.touches[0].clientY;
    dragging = true;
    modalEl.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!dragging) return;
    currentY = e.touches[0].clientY;
    const delta = Math.max(0, currentY - startY); // only allow downward drag
    modalEl.style.transform = `translateY(${delta}px)`;

    // Fade backdrop as sheet is dragged down
    const progress = Math.min(delta / 300, 1);
    backdrop.style.opacity = 1 - progress * 0.5;
  }

  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;

    const delta = currentY - startY;
    modalEl.style.transition = '';

    if (delta > 120) {
      // Dragged far enough — dismiss
      modalEl.style.transform = `translateY(100%)`;
      backdrop.style.opacity  = '0';
      setTimeout(() => {
        UI.closeModal();
        modalEl.style.transform = '';
        backdrop.style.opacity  = '';
      }, 280);
    } else {
      // Not far enough — spring back
      modalEl.style.transform = '';
      backdrop.style.opacity  = '';
    }
  }

  return { init };
})();