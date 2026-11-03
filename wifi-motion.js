// A conceptual illustration, not a simulation or a recording of CSI measurements.
(() => {
  const canvas = document.querySelector('#wifi-motion');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const toggle = document.querySelector('#wifi-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const width = 720, height = 405, source = [360, 202];
  const receivers = [[86, 72], [634, 72], [86, 324], [634, 324]];
  canvas.width = width; canvas.height = height;
  let elapsed = 2.0, last = null, frame = null, visible = false, paused = reduced.matches;

  function board(x, y, number, affected = 0) {
    ctx.fillStyle = '#0e1c16'; ctx.fillRect(x-28, y-22, 56, 45);
    ctx.fillStyle = affected > .2 ? '#c78e55' : '#78945b';
    ctx.fillRect(x-24, y-18, 48, 36);
    ctx.fillStyle = '#213b2b'; ctx.fillRect(x-14, y-11, 28, 22);
    ctx.fillStyle = '#b8c3a7'; ctx.fillRect(x-10, y-8, 20, 13);
    ctx.fillStyle = '#e1ce8c';
    for (let n=0; n<4; n++) {
      ctx.fillRect(x-21+n*13, y-23, 4, 5);
      ctx.fillRect(x-21+n*13, y+18, 4, 5);
    }
    ctx.fillStyle = affected > .2 ? '#ffca82' : '#c3df80';
    ctx.fillRect(x+14, y+8, 5, 5);
    ctx.fillStyle = '#dbe5c8'; ctx.font = `${canvas.clientWidth < 450 ? 24 : 14}px monospace`; ctx.textAlign = 'center';
    ctx.fillText(`ESP ${number}`, x, y+48);
  }
  function person(x, y) {
    x = Math.round(x/2)*2; y = Math.round(y/2)*2;
    const step = Math.sin(elapsed*9), bob = Math.abs(step)> .65 ? -2 : 0;
    ctx.fillStyle = '#08130d66'; ctx.beginPath();ctx.ellipse(x,y+3,19,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle = '#293c32';
    ctx.fillRect(x-9,y-17,7,15+(step>0?0:3));
    ctx.fillRect(x+2,y-17,7,15+(step>0?3:0));
    ctx.fillStyle = '#d5d9bb';
    ctx.fillRect(x-10+(step>0?-3:0),y-3,10,4);
    ctx.fillRect(x+1+(step>0?0:3),y-3,10,4);
    ctx.fillStyle = '#c3df80';ctx.fillRect(x-11,y-39+bob,22,24);
    ctx.fillStyle = '#8ca563';ctx.fillRect(x-11,y-22+bob,22,7);
    ctx.fillStyle = '#e1ce8c';
    ctx.fillRect(x-17,y-36+bob+(step>0?3:0),6,19);
    ctx.fillRect(x+11,y-36+bob+(step>0?0:3),6,19);
    ctx.fillRect(x-8,y-55+bob,16,15);
    ctx.fillStyle = '#344a38';ctx.fillRect(x-9,y-59+bob,18,8);
  }
  function render() {
    const walker = [360+158*Math.cos(elapsed*.53), 217+88*Math.sin(elapsed*.53)];
    const body = [walker[0], walker[1]-26];
    ctx.fillStyle = '#172a23';ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = '#253e30';ctx.lineWidth = 1;
    for(let x=0;x<width;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
    for(let y=0;y<height;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    // Slow ripples make the area affected by the walker easy to spot.
    const halo = ctx.createRadialGradient(body[0],body[1],8,body[0],body[1],76);
    halo.addColorStop(0,'#e7ac592d');halo.addColorStop(1,'#e7ac5900');
    ctx.fillStyle=halo;ctx.fillRect(body[0]-76,body[1]-76,152,152);
    for(let ring=0;ring<2;ring++) {
      const progress=(elapsed*.42+ring/2)%1;
      ctx.strokeStyle=`rgba(245,190,116,${.26*(1-progress)})`;
      ctx.lineWidth=1.6;ctx.beginPath();
      ctx.ellipse(body[0],body[1],22+progress*58,18+progress*46,0,0,Math.PI*2);ctx.stroke();
    }
    const strengths = [];
    for (let i=0;i<receivers.length;i++) {
      const target = receivers[i], dx=target[0]-source[0], dy=target[1]-source[1];
      const length=Math.hypot(dx,dy), nx=-dy/length, ny=dx/length;
      const u=Math.max(0,Math.min(1,((body[0]-source[0])*dx+(body[1]-source[1])*dy)/(length*length)));
      const distance=Math.hypot(body[0]-source[0]-u*dx,body[1]-source[1]-u*dy);
      const strength=Math.max(0,1-distance/86);strengths.push(strength);
      function point(t) {
        const local=Math.exp(-Math.pow((t-u)*length/80,2));
        const bend=26*strength*local*Math.sin(t*Math.PI);
        const wave=Math.sin(t*42-elapsed*7)*Math.sin(t*Math.PI)*(1.5+48*strength*local)+bend;
        return [source[0]+dx*t+nx*wave,source[1]+dy*t+ny*wave];
      }
      const affected=strength>.18;
      ctx.beginPath();
      for(let n=0;n<=120;n++){const [x,y]=point(n/120);n?ctx.lineTo(x,y):ctx.moveTo(x,y);}
      if(affected) {
        ctx.strokeStyle=`rgba(255,176,93,${.12+.12*strength})`;
        ctx.lineWidth=11;ctx.stroke();
      }
      ctx.strokeStyle=affected?'#ffbd79':'#87ac67';
      ctx.lineWidth=affected?3.2+2*strength:1.6;ctx.stroke();
      // Moving dots suggest a signal travelling between the boards.
      for(let n=0;n<3;n++) {
        const t=(elapsed*.35+n/3)%1,[x,y]=point(t);
        ctx.fillStyle=affected?'#ffe1b0':'#c3df80';
        const size=affected?6:4;ctx.fillRect(Math.round(x)-size/2,Math.round(y)-size/2,size,size);
      }
    }
    receivers.forEach(([x,y],i)=>board(x,y,i+1,strengths[i]));
    board(...source,0);
    person(...walker);
    ctx.textAlign='left';ctx.font='10px monospace';ctx.fillStyle='#a8b9aa';
    ctx.fillText('SIGNAL SKETCH',18,24);
  }
  function syncToggle() {
    toggle.textContent=paused?'Play':'Pause';
    toggle.setAttribute('aria-label',`${paused?'Play':'Pause'} Wi-Fi illustration`);
  }
  function schedule() {
    if(visible && !paused && !document.hidden) {
      if(frame===null)frame=requestAnimationFrame(tick);
    } else {if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;}
  }
  function tick(now) {
    frame=null;if(last!==null)elapsed+=Math.min((now-last)/1000,.08);
    last=now;render();schedule();
  }
  toggle.addEventListener('click',()=>{paused=!paused;syncToggle();schedule();});
  reduced.addEventListener('change',event=>{paused=event.matches;syncToggle();render();schedule();});
  document.addEventListener('visibilitychange',schedule);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();}).observe(canvas);
  syncToggle();render();
})();
