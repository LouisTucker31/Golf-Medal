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

    const svgNS  = 'http://www.w3.org/2000/svg';
    const width  = container.clientWidth || 320;
    const height = 180;
    const barW   = 28;
    const groupW = 80;
    const padL   = 32;
    const padB   = 40;
    const padT   = 16;
    const chartH = height - padB - padT;

    // Find max value for scale
    const allVals = items.flatMap(item => [
      userStats[item.key] ?? 0,
      bandAverages[item.key] ?? 0
    ]);
    const maxVal = Math.max(...allVals, 1);

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);

    // Y axis gridlines
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
      const x       = padL + i * groupW;
      const userVal = userStats[item.key] ?? 0;
      const bandVal = bandAverages[item.key] ?? 0;

      // User bar
      const userH = (userVal / maxVal) * chartH;
      const userBar = document.createElementNS(svgNS, 'rect');
      userBar.setAttribute('x', x + 4);
      userBar.setAttribute('y', padT + chartH - userH);
      userBar.setAttribute('width', barW);
      userBar.setAttribute('height', userH);
      userBar.setAttribute('rx', '3');
      userBar.setAttribute('fill', 'var(--accent)');
      userBar.setAttribute('opacity', '0.85');
      svg.appendChild(userBar);

      // Band average bar
      const bandH = (bandVal / maxVal) * chartH;
      const bandBar = document.createElementNS(svgNS, 'rect');
      bandBar.setAttribute('x', x + 4 + barW + 4);
      bandBar.setAttribute('y', padT + chartH - bandH);
      bandBar.setAttribute('width', barW);
      bandBar.setAttribute('height', bandH);
      bandBar.setAttribute('rx', '3');
      bandBar.setAttribute('fill', 'var(--border)');
      svg.appendChild(bandBar);

      // Label
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', x + 4 + barW + 2);
      text.setAttribute('y', height - 8);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '9');
      text.setAttribute('fill', 'var(--text-tertiary)');
      text.textContent = item.label;
      svg.appendChild(text);
    });

    // Legend
    const legendY = height - 24;
    const legendX = width - 120;

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
    r2.setAttribute('width', 10); r2.setAttribute('height', 10);
    r2.setAttribute('rx', '2'); r2.setAttribute('fill', 'var(--border)');
    svg.appendChild(r2);

    const t2 = document.createElementNS(svgNS, 'text');
    t2.setAttribute('x', legendX + 54); t2.setAttribute('y', legendY + 9);
    t2.setAttribute('font-size', '9'); t2.setAttribute('fill', 'var(--text-secondary)');
    t2.textContent = 'Avg';
    svg.appendChild(t2);

    container.innerHTML = '';
    container.appendChild(svg);
  }

  return { render };
})();