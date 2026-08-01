const canvas = document.querySelector("#trajectoryCanvas");
const ctx = canvas.getContext("2d");
const gravity = document.querySelector("#gravity");
const velocity = document.querySelector("#velocity");
const horizontal = document.querySelector("#horizontal");
const launchButton = document.querySelector("#launchButton");
const outputs = {
  gravity: document.querySelector("#gravityOutput"), velocity: document.querySelector("#velocityOutput"), horizontal: document.querySelector("#horizontalOutput"),
  height: document.querySelector("#heightMetric"), time: document.querySelector("#timeMetric"), range: document.querySelector("#rangeMetric"), flight: document.querySelector("#flightMetric")
};
let animation = 0;

function model() {
  return { g: Number(gravity.value), v0: -Number(velocity.value), vx: Number(horizontal.value) };
}

function metrics({ g, v0, vx }) {
  const peakTime = -v0 / g;
  const height = v0 * v0 / (2 * g);
  const flight = peakTime * 2;
  return { peakTime, height, flight, range: vx * flight };
}

function draw(progress = 1) {
  const m = model(); const stat = metrics(m);
  const W = canvas.width, H = canvas.height, pad = 62, baseY = H - 60;
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#0b111d"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#1d293d"; ctx.lineWidth = 1;
  for (let x = pad; x < W; x += 70) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, baseY); ctx.stroke(); }
  for (let y = 40; y <= baseY; y += 60) { ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - 20, y); ctx.stroke(); }
  ctx.strokeStyle = "#536078"; ctx.beginPath(); ctx.moveTo(pad, 25); ctx.lineTo(pad, baseY); ctx.lineTo(W - 22, baseY); ctx.stroke();
  ctx.fillStyle = "#718097"; ctx.font = "12px DM Mono"; ctx.fillText("HEIGHT", 14, 28); ctx.fillText("RANGE", W - 70, baseY + 35);
  const usableW = W - pad - 45, usableH = H - 110;
  const scaleX = usableW / Math.max(stat.range * 1.12, 1), scaleY = usableH / Math.max(stat.height * 1.18, 1);
  const endT = stat.flight * progress;
  ctx.strokeStyle = "#f2c66d"; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= 160; i++) {
    const t = stat.flight * (i / 160); if (t > endT) break;
    const x = pad + m.vx * t * scaleX; const y = baseY - (m.v0 * t + .5 * m.g * t * t) * -scaleY;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  } ctx.stroke();
  let x = 0, y = 0, vy = m.v0; ctx.strokeStyle = "#70e1c8"; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(pad, baseY);
  const points = [{ x, y }];
  for (let frame = 0; frame < 180 && y <= 0; frame++) { vy += m.g; x += m.vx; y += vy; points.push({ x, y }); }
  const visiblePoints = Math.ceil(points.length * progress);
  points.slice(0, visiblePoints).forEach((p, i) => { const px = pad + p.x * scaleX, py = baseY + p.y * scaleY; if (i) ctx.lineTo(px, py); });
  ctx.stroke(); ctx.setLineDash([]);
  const last = points[Math.max(0, visiblePoints - 1)];
  ctx.fillStyle = "#f4f6ff"; ctx.fillRect(pad + last.x * scaleX - 7, baseY + last.y * scaleY - 11, 14, 19);
  ctx.fillStyle = "#70e1c8"; ctx.fillRect(pad + last.x * scaleX + 1, baseY + last.y * scaleY - 7, 3, 3);
  ctx.fillStyle = "rgba(112,225,200,.08)"; ctx.fillRect(pad, baseY, usableW, 8);
}

function update() {
  const m = model(), stat = metrics(m);
  outputs.gravity.textContent = m.g.toFixed(2); outputs.velocity.textContent = `−${Math.abs(m.v0).toFixed(2)}`; outputs.horizontal.textContent = m.vx.toFixed(2);
  outputs.height.textContent = stat.height.toFixed(1); outputs.time.textContent = stat.peakTime.toFixed(1); outputs.range.textContent = stat.range.toFixed(1); outputs.flight.textContent = stat.flight.toFixed(1); draw();
}

[gravity, velocity, horizontal].forEach(input => input.addEventListener("input", update));
launchButton.addEventListener("click", () => { cancelAnimationFrame(animation); const start = performance.now(); const animate = now => { const p = Math.min(1, (now - start) / 1100); draw(1 - Math.pow(1 - p, 3)); if (p < 1) animation = requestAnimationFrame(animate); }; animation = requestAnimationFrame(animate); });

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); }), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
update();
