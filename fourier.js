// Browser rendering of William's letter_capital_i3, using the original n*pi*t basis.
// Only presentation changes: fit to the card, an eight-second drawing, and pause/replay.
(() => {
  const canvas = document.querySelector('#fourier-animation');
  if (!canvas) return;
  const toggle = document.querySelector('#fourier-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let terms = [], points = [], bounds, ctx, width, height;
  let elapsed = 0, last = null, frame = null, visible = false;
  let paused = reduced.matches;
  const samples = 1400, drawTime = 8, holdTime = 1.5;

  function chain(t) {
    let x = 0, y = 0;
    const vertices = [[0, 0]];
    for (const [n, re, im] of terms) {
      const a = n * Math.PI * t;
      x += re * Math.cos(a) - im * Math.sin(a);
      y += re * Math.sin(a) + im * Math.cos(a);
      vertices.push([x, y]);
    }
    return vertices;
  }

  function render() {
    if (!ctx || !bounds) return;
    const progress = Math.min((elapsed % (drawTime + holdTime)) / drawTime, 1);
    const scale = Math.min((width - 90) / bounds.w, (height - 72) / bounds.h);
    const X = x => width / 2 + (x - bounds.cx) * scale;
    const Y = y => height / 2 - (y - bounds.cy) * scale;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#2b221d'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#403228'; ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 28) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 28) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    const vectors = chain(progress * 2);
    for (let i = 0; i < terms.length; i++) {
      const [x, y] = vectors[i], [xx, yy] = vectors[i + 1];
      const radius = Math.hypot(xx - x, yy - y) * scale;
      if (radius > 1) {
        ctx.strokeStyle = '#b4946755'; ctx.beginPath();
        ctx.arc(X(x), Y(y), radius, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.strokeStyle = '#d1b88899'; ctx.beginPath();
      ctx.moveTo(X(x), Y(y)); ctx.lineTo(X(xx), Y(yy)); ctx.stroke();
    }
    ctx.strokeStyle = '#f0d79f'; ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round'; ctx.beginPath();
    const end = Math.floor(progress * samples);
    for (let i = 0; i <= end; i++) {
      const [x, y] = points[i];
      i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
    }
    ctx.stroke();
    const tip = vectors[vectors.length - 1];
    ctx.fillStyle = '#fff0cd'; ctx.beginPath();
    ctx.arc(X(tip[0]), Y(tip[1]), 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0aa8c'; ctx.font = '10px monospace';
    ctx.fillText('DRAWING THE LETTER I', 18, 24);
    ctx.fillText(`${terms.length} spinning arrows`, 18, height - 18);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); render();
  }
  function tick(now) {
    frame = null;
    if (last !== null) elapsed += Math.min((now - last) / 1000, 0.1);
    last = now; render(); schedule();
  }
  function schedule() {
    if (terms.length && visible && !paused && !document.hidden) {
      if (frame === null) frame = requestAnimationFrame(tick);
    } else {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; last = null;
    }
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.textContent = paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', paused ? 'Play Fourier animation' : 'Pause Fourier animation');
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => {
    paused = event.matches; if (paused) elapsed = drawTime;
    toggle.textContent = paused ? 'Play' : 'Pause'; render(); schedule();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; schedule();
  }).observe(canvas);
  fetch('assets/fourier-i.json').then(r => {
    if (!r.ok) throw new Error('Coefficient data unavailable');
    return r.json();
  }).then(data => {
    terms = data.terms;
    points = Array.from({length: samples + 1}, (_, i) => chain(2 * i / samples).at(-1));
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    bounds = {w: maxX - minX, h: maxY - minY, cx: (maxX + minX) / 2, cy: (maxY + minY) / 2};
    if (paused) elapsed = drawTime;
    toggle.disabled = false; toggle.textContent = paused ? 'Play' : 'Pause';
    new ResizeObserver(resize).observe(canvas); resize(); schedule();
  }).catch(() => {
    toggle.hidden = true; document.querySelector('#fourier-error').hidden = false;
  });
})();
