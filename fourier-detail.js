// Presentation port: source I(t) points and saved letter_capital_i3 coefficients.
(() => {
  const original = document.querySelector('#fourier-original');
  const result = document.querySelector('#fourier-result');
  if (!original || !result) return;
  const slider = document.querySelector('#arrow-count');
  const output = document.querySelector('#arrow-count-value');
  const overlay = document.querySelector('#show-outline');
  const toggle = document.querySelector('#drawing-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let terms = [], outline = [], path = [], count = 8, elapsed = 0;
  let paused = reduced.matches, visible = false, frame = null, last = null;
  const samples = 1200, duration = 8, hold = 1.5;
  function chain(t) {
    let x = 0, y = 0;
    const points = [[x, y]];
    for (const [n, re, im] of terms.slice(0, count)) {
      const angle = n * Math.PI * t;
      x += re * Math.cos(angle) - im * Math.sin(angle);
      y += re * Math.sin(angle) + im * Math.cos(angle);
      points.push([x, y]);
    }
    return points;
  }
  function rebuild() {
    path = Array.from({length: samples + 1}, (_, i) => chain(2 * i / samples).at(-1));
    output.value = `${count} / ${terms.length}`;
    document.querySelector('#reconstruction-label').textContent = `${count} rotating ${count === 1 ? 'arrow' : 'arrows'}`;
    result.setAttribute('aria-label', `Letter I drawn with ${count} rotating ${count === 1 ? 'arrow' : 'arrows'}; ${overlay.checked ? 'with' : 'without'} the original outline`);
    render();
  }
  function draw(canvas, isOriginal) {
    const {width, height} = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Fixed bounds on both panels and at every term count: no misleading auto-fit.
    const scale = Math.min((width - 32) / 600, (height - 32) / 600);
    const X = x => width / 2 + x * scale, Y = y => height / 2 - y * scale;
    ctx.fillStyle = '#10201a'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#253d31'; ctx.lineWidth = 1;
    for (let n = -300; n <= 300; n += 60) {
      ctx.beginPath(); ctx.moveTo(X(n), 0); ctx.lineTo(X(n), height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, Y(n)); ctx.lineTo(width, Y(n)); ctx.stroke();
    }
    function stroke(points, colour, thickness, dash = []) {
      ctx.strokeStyle = colour; ctx.lineWidth = thickness; ctx.setLineDash(dash); ctx.beginPath();
      points.forEach(([x,y],i) => i ? ctx.lineTo(X(x),Y(y)) : ctx.moveTo(X(x),Y(y)));
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (isOriginal || overlay.checked) stroke([...outline,outline[0]], '#e1ce8c', 1.6, [5,5]);
    if (isOriginal) {
      ctx.fillStyle = '#e1ce8c';
      for (const [x,y] of outline) {ctx.beginPath();ctx.arc(X(x),Y(y),2.5,0,2*Math.PI);ctx.fill();}
      return;
    }
    const progress = Math.min((elapsed % (duration + hold)) / duration, 1);
    // Faint full reconstruction remains visible while the bright tip traces it.
    stroke(path, '#c3df8040', 1.4);
    const vectors = chain(progress * 2);
    for (let i = 0; i < count; i++) {
      const [x,y] = vectors[i], [xx,yy] = vectors[i+1];
      const radius = Math.hypot(xx-x,yy-y)*scale;
      if (radius > 1) {
        ctx.strokeStyle = '#71895a55';ctx.lineWidth=1;ctx.beginPath();ctx.arc(X(x),Y(y),radius,0,Math.PI*2);ctx.stroke();
      }
      stroke([[x,y],[xx,yy]], '#bbc69499', 1);
      // Arrowheads make the direction of the vector visible.
      if (radius > 8) {
        const angle=Math.atan2(Y(yy)-Y(y),X(xx)-X(x));
        ctx.beginPath();ctx.moveTo(X(xx)-5*Math.cos(angle-.5),Y(yy)-5*Math.sin(angle-.5));
        ctx.lineTo(X(xx),Y(yy));ctx.lineTo(X(xx)-5*Math.cos(angle+.5),Y(yy)-5*Math.sin(angle+.5));ctx.stroke();
      }
    }
    stroke(path.slice(0,Math.floor(progress*samples)+1), '#c3df80', 2.4);
    const [x,y]=vectors.at(-1);ctx.fillStyle='#eef0dc';ctx.beginPath();ctx.arc(X(x),Y(y),3,0,Math.PI*2);ctx.fill();
  }
  function render() {if(terms.length){draw(original,true);draw(result,false);}}
  function tick(now) {
    frame=null;
    if(last!==null) elapsed+=Math.min((now-last)/1000,.1);
    last=now;render();schedule();
  }
  function schedule() {
    if(terms.length && visible && !paused && !document.hidden) {
      if(frame===null) frame=requestAnimationFrame(tick);
    } else {if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;}
  }
  function syncToggle() {toggle.textContent=paused?'Play':'Pause';toggle.setAttribute('aria-label',`${paused?'Play':'Pause'} Fourier drawing`);}
  slider.addEventListener('input',()=>{count=Number(slider.value);rebuild();});
  overlay.addEventListener('change',rebuild);
  toggle.addEventListener('click',()=>{paused=!paused;syncToggle();schedule();});
  reduced.addEventListener('change',event=>{paused=event.matches;if(paused)elapsed=duration;syncToggle();render();schedule();});
  document.addEventListener('visibilitychange',schedule);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();}).observe(result);
  fetch('../assets/fourier-i.json').then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json();}).then(data=>{
    terms=data.terms;outline=data.outline;
    if(!terms.length || outline.length!==12)throw Error('Invalid drawing data');
    slider.max=terms.length;slider.disabled=false;toggle.disabled=false;
    if(paused)elapsed=duration;
    syncToggle();rebuild();new ResizeObserver(render).observe(document.querySelector('.fourier-comparison'));schedule();
  }).catch(()=>{slider.disabled=true;toggle.hidden=true;document.querySelector('#drawing-error').hidden=false;});
})();
