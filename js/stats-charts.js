// ── Stats Charts ──
const StatsCharts = (() => {

  function render(containerId, userStats, bandAverages, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const hasData = items.some(item => userStats[item.key] !== null);

    if (!hasData || !bandAverages) {
      container.innerHTML = '<p class="chart-empty">Not enough data yet.</p>';
      return;
    }

    container.innerHTML = '';

    const svgNS   = 'http://www.w3.org/2000/svg';
    const width   = container.clientWidth || 320;
    const height  = 180;
    const barW    = 28;
    const gap     = 8;
    const groupW  = barW * 2 + gap + 24;
    const totalW  = items.length * groupW;
    const padL    = 32;
    const padB    = 40;
    const padT    = 16;
    const chartH  = height - padB - padT;

    // Centre the bars
    const startX  = padL + Math.max(0, (width - padL - totalW) / 2);

    const allVals = items.flatMap(item => [
      userStats[item.key] ?? 0,
      bandAverages[item.key] ?? 0
    ]);
    const maxVal = Math.max(...allVals, 1);

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.style.overflow = 'visible';

    // Tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute; background: var(--accent); color: #fff;
      padding: 5px 10px; border-radius: 8px; font-size: 0.75rem;
      pointer-events: none; opacity: 0; transition: opacity 0.15s;
      white-space: nowrap; font-family: var(--font-body);
      transform: translate(-50%, -100%); margin-top: -6px;
    `;
    container.style.position = 'relative';
    container.appendChild(tooltip);

    function showTooltip(e, text) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
      tooltip.style.left  = `${x}px`;
      tooltip.style.top   = `${y - 8}px`;
      tooltip.textContent = text;
      tooltip.style.opacity = '1';
    }

    function hideTooltip() {
      tooltip.style.opacity = '0';
    }

    // Gridlines
    [0, 25, 50, 75, 100].forEach(pct => {
      if (pct > maxVal + 5) return;
      const y = padT + chartH - (pct / maxVal) * chartH;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', padL);
      line.setAttribute('x2', width - 8);
      line.setAttribute('y1', y);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'var(--border-light)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', padL - 4);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '9');
      label.setAttribute('fill', 'var(--text-tertiary)');
      label.textContent = pct;
      svg.appendChild(label);
    });

    items.forEach((item, i) => {
      const x       = startX + i * groupW;
      const userVal = userStats[item.key] ?? 0;
      const bandVal = bandAverages[item.key] ?? 0;

      // User bar
      const userH   = Math.max((userVal / maxVal) * chartH, userVal > 0 ? 3 : 0);
      const userBar = document.createElementNS(svgNS, 'rect');
      userBar.setAttribute('x', x);
      userBar.setAttribute('y', padT + chartH - userH);
      userBar.setAttribute('width', barW);
      userBar.setAttribute('height', userH);
      userBar.setAttribute('rx', '3');
      userBar.setAttribute('fill', 'var(--accent)');
      userBar.setAttribute('opacity', '0.85');
      userBar.style.cursor = 'pointer';
      svg.appendChild(userBar);

      // Band bar
      const bandH   = Math.max((bandVal / maxVal) * chartH, bandVal > 0 ? 3 : 0);
      const bandBar = document.createElementNS(svgNS, 'rect');
      bandBar.setAttribute('x', x + barW + gap);
      bandBar.setAttribute('y', padT + chartH - bandH);
      bandBar.setAttribute('width', barW);
      bandBar.setAttribute('height', bandH);
      bandBar.setAttribute('rx', '3');
      bandBar.setAttribute('fill', 'var(--border)');
      bandBar.style.cursor = 'pointer';
      svg.appendChild(bandBar);

      // Tooltip events — user bar
      const userTip = `You: ${userVal}%`;
      userBar.addEventListener('mouseenter', e => showTooltip(e, userTip));
      userBar.addEventListener('mouseleave', hideTooltip);
      userBar.addEventListener('touchstart', e => { e.preventDefault(); showTooltip(e, userTip); }, { passive: false });
      userBar.addEventListener('touchend', hideTooltip);

      // Tooltip events — band bar
      const bandTip = `Avg: ${bandVal}%`;
      bandBar.addEventListener('mouseenter', e => showTooltip(e, bandTip));
      bandBar.addEventListener('mouseleave', hideTooltip);
      bandBar.addEventListener('touchstart', e => { e.preventDefault(); showTooltip(e, bandTip); }, { passive: false });
      bandBar.addEventListener('touchend', hideTooltip);

      // Label
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', x + barW + gap / 2);
      text.setAttribute('y', height - 8);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '9');
      text.setAttribute('fill', 'var(--text-tertiary)');
      text.textContent = item.label;
      svg.appendChild(text);
    });

    // Legend
    const legendY = height - 2;
    const legendX = width - 100;

    const r1 = document.createElementNS(svgNS, 'rect');
    r1.setAttribute('x', legendX); r1.setAttribute('y', legendY);
    r1.setAttribute('width', 10); r1.setAttribute('height', 10);
    r1.setAttribute('rx', '2'); r1.setAttribute('fill', 'var(--accent)');
    svg.appendChild(r1);

    const t1 = document.createElementNS(svgNS, 'text');
    t1.setAttribute('x', legendX + 14); t1.setAttribute('y', legendY + 9);
    t1.setAttribute('font-size', '9'); t1.setAttribute('fill', 'var(--text-secondary)');
    t1.textContent = 'You';
    svg.appendChild(t1);

    const r2 = document.createElementNS(svgNS, 'rect');
    r2.setAttribute('x', legendX + 40); r2.setAttribute('y', legendY);
    r2.setAttribute('width', 10); r2.setAttribute('height', r2.getAttribute('height') || 10);
    r2.setAttribute('height', 10);
    r2.setAttribute('rx', '2'); r2.setAttribute('fill', 'var(--border)');
    svg.appendChild(r2);

    const t2 = document.createElementNS(svgNS, 'text');
    t2.setAttribute('x', legendX + 54); t2.setAttribute('y', legendY + 9);
    t2.setAttribute('font-size', '9'); t2.setAttribute('fill', 'var(--text-secondary)');
    t2.textContent = 'Avg';
    svg.appendChild(t2);

    container.appendChild(svg);
  }

  return { render };
})();