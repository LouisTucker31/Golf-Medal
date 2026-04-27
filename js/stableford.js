// ── Stableford peek ──
const Stableford = (() => {

  const GOLD_LOW   = 39, GOLD_HIGH   = 43;
  const SILVER_LOW = 34, SILVER_HIGH = 38;
  const BRONZE_LOW = 29, BRONZE_HIGH = 33;

  let holdTimer    = null;
  let isShowing    = false;
  let grossRanges  = { gold: '', silver: '', bronze: '' };

  function init() {
    const btn = document.getElementById('stablefordBtn');
    if (!btn) return;

    // Store gross ranges before swapping
    function showStableford() {
      if (isShowing) return;
      isShowing = true;

      grossRanges = {
        gold:   document.getElementById('goldRange').textContent,
        silver: document.getElementById('silverRange').textContent,
        bronze: document.getElementById('bronzeRange').textContent,
      };

      document.getElementById('goldRange').textContent   = `${GOLD_LOW}–${GOLD_HIGH}`;
      document.getElementById('silverRange').textContent = `${SILVER_LOW}–${SILVER_HIGH}`;
      document.getElementById('bronzeRange').textContent = `${BRONZE_LOW}–${BRONZE_HIGH}`;
      btn.classList.add('active');
    }

    function hideStableford() {
      if (!isShowing) return;
      isShowing = false;

      document.getElementById('goldRange').textContent   = grossRanges.gold;
      document.getElementById('silverRange').textContent = grossRanges.silver;
      document.getElementById('bronzeRange').textContent = grossRanges.bronze;
      btn.classList.remove('active');
    }

    // Touch
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      holdTimer = setTimeout(showStableford, 0);
    }, { passive: false });

    btn.addEventListener('touchend', () => {
      clearTimeout(holdTimer);
      hideStableford();
    });

    btn.addEventListener('touchcancel', () => {
      clearTimeout(holdTimer);
      hideStableford();
    });

    // Mouse (desktop)
    btn.addEventListener('mousedown', () => {
      holdTimer = setTimeout(showStableford, 0);
    });

    btn.addEventListener('mouseup', () => {
      clearTimeout(holdTimer);
      hideStableford();
    });

    btn.addEventListener('mouseleave', () => {
      clearTimeout(holdTimer);
      hideStableford();
    });
  }

  return { init };
})();