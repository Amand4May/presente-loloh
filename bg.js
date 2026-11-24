/* Fundo em ASCII: noite estrelada com lua, nuvens, pétalas caindo e colinas floridas */
(() => {
  const cv = document.getElementById('bg');
  const ctx = cv.getContext('2d');
  const CW = 13, CH = 18;           // tamanho de cada "célula" de caractere
  let W, H, cols, rows, stars = [], petals = [], bursts = [];
  const mouse = { x: -999, y: -999 };

  const rnd = (a, b) => a + Math.random() * (b - a);
  const hash = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${CH - 3}px "Courier New", monospace`;
    ctx.textBaseline = 'top';
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH);

    stars = Array.from({ length: Math.floor(cols * rows * 0.03) }, () => ({
      c: Math.floor(rnd(0, cols)), r: Math.floor(rnd(0, rows * 0.75)),
      ph: rnd(0, 6.28), sp: rnd(0.8, 2.6),
    }));
    const n = Math.max(18, Math.floor(W / 38));
    petals = Array.from({ length: n }, () => newPetal(true));
  }

  const PETAL_CH = ['*', '.', '~', '<3', 'o', '+', '<3'];
  const PETAL_COL = ['#ff9db9', '#ffc2d6', '#fbeccb', '#ff7fa8'];
  function newPetal(anywhere) {
    return {
      x: rnd(0, W), y: anywhere ? rnd(-20, H) : -20,
      vy: rnd(18, 42), ph: rnd(0, 6.28), sw: rnd(10, 30),
      ch: PETAL_CH[Math.floor(rnd(0, PETAL_CH.length))],
      col: PETAL_COL[Math.floor(rnd(0, PETAL_COL.length))],
    };
  }

  /* chuva de corações quando o presente abre */
  window.burst = (x, y, n = 70) => {
    for (let i = 0; i < n; i++) {
      const a = rnd(-Math.PI * 0.95, -Math.PI * 0.05), s = rnd(160, 460);
      bursts.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(1.6, 3),
        t: 0, ch: ['<3', '*', '+', '.', '<3', '~'][Math.floor(rnd(0, 6))],
        col: PETAL_COL[Math.floor(rnd(0, 4))],
      });
    }
  };

  /* ---------- estrela cadente ---------- */
  let shoot = null, nextShoot = 3;
  function maybeShoot(t, dt) {
    nextShoot -= dt;
    if (nextShoot <= 0 && !shoot) {
      shoot = { x: rnd(W * 0.4, W), y: rnd(0, H * 0.3), t: 0 };
      nextShoot = rnd(6, 13);
    }
    if (!shoot) return;
    shoot.t += dt;
    const hx = shoot.x - shoot.t * 520, hy = shoot.y + shoot.t * 260;
    for (let i = 0; i < 14; i++) {
      const a = 1 - i / 14;
      ctx.fillStyle = `rgba(255,240,215,${a * Math.min(1, 2 - shoot.t * 2)})`;
      ctx.fillText(i === 0 ? '*' : i < 5 ? '-' : '.', hx + i * 14 - (hx % CW), hy - i * 7 - (hy % CH));
    }
    if (shoot.t > 1.4) shoot = null;
  }

  /* ---------- lua ---------- */
  const RAMP = ' .:-=+*#%@';
  function drawMoon(t) {
    const R = Math.max(5, Math.min(rows * 0.15, 10));
    const mc = Math.floor(cols * 0.82), mr = Math.floor(rows * 0.18 + Math.sin(t * 0.3) * 0.6);
    const rx = R * CH / CW;
    for (let r = -R - 3; r <= R + 3; r++) {
      for (let c = -Math.ceil(rx) - 4; c <= Math.ceil(rx) + 4; c++) {
        const dx = c / rx, dy = r / R, d = Math.hypot(dx, dy);
        let ch = null, a = 0;
        if (d <= 1) {
          const light = 1 - Math.hypot(dx + 0.35, dy + 0.3) / 1.6;
          const crater = hash(c * 3.1, r * 7.7) > 0.93 ? -0.25 : 0;
          const i = Math.max(1, Math.min(9, Math.floor((light + crater) * 9)));
          ch = RAMP[i]; a = 0.55 + light * 0.4;
        } else if (d < 1.35 && hash(c, r) > 0.55) { ch = '.'; a = 0.28 * (1.35 - d) * 3; }
        if (ch && ch !== ' ') {
          ctx.fillStyle = `rgba(255,243,214,${Math.min(1, a)})`;
          ctx.fillText(ch, (mc + c) * CW, (mr + r) * CH);
        }
      }
    }
  }

  /* ---------- nuvens ---------- */
  const CLOUDS = [
    ['    .--.        ', ' .-(    ).--.   ', '(___.__)__)___) '],
    ['   _  _     ', ' _( )( )__  ', '(_________) '],
  ];
  const clouds = [
    { art: 0, y: 0.12, sp: 9, off: 0.1 }, { art: 1, y: 0.30, sp: 5, off: 0.55 },
    { art: 0, y: 0.45, sp: 7, off: 0.85 },
  ];
  function drawClouds(t) {
    ctx.fillStyle = 'rgba(210,180,235,.22)';
    clouds.forEach(cl => {
      const art = CLOUDS[cl.art], w = art[0].length * CW;
      const x = ((cl.off * (W + w) + t * cl.sp) % (W + w)) - w;
      art.forEach((line, i) => ctx.fillText(line, Math.round(x / CW) * CW, Math.floor(rows * cl.y) * CH + i * CH));
    });
  }

  /* ---------- colinas ---------- */
  const HILLS = [
    { base: 0.78, amp: 2.6, f: 0.045, sp: 0.25, col: '#6f3d7c', flower: 0 },
    { base: 0.84, amp: 2.2, f: 0.07,  sp: 0.35, col: '#55306a', flower: 0.05 },
    { base: 0.91, amp: 1.8, f: 0.1,   sp: 0.45, col: '#3d2250', flower: 0.08 },
  ];
  const BLADES = ['^', '"', "'", '/', '\\', '|', 'v'];
  function drawHills(t) {
    HILLS.forEach((h, li) => {
      ctx.fillStyle = h.col;
      for (let c = 0; c < cols; c++) {
        const top = Math.floor(rows * h.base + Math.sin(c * h.f + li * 2) * h.amp + Math.sin(c * h.f * 2.3 + t * h.sp) * 0.8);
        const sway = Math.sin(t * 1.6 + c * 0.35 + li);
        const blade = BLADES[Math.floor(((sway + 1) / 2) * 0.99 * 5) % 5 + (hash(c, li) > 0.7 ? 1 : 0)] || '^';
        ctx.fillText(blade, c * CW, top * CH);
        for (let r = top + 1; r < rows; r++) {
          const k = hash(c, r + li * 50);
          if (k > 0.45) ctx.fillText(k > 0.8 ? ':' : k > 0.62 ? ',' : '.', c * CW, r * CH);
        }
        if (h.flower && hash(c * 1.7, li) < h.flower) {
          const fl = ['@', '*', 'o', '*'][Math.floor(hash(c, li * 9) * 4)];
          ctx.fillStyle = hash(c, 3) > 0.5 ? '#ff9db9' : '#fbeccb';
          ctx.fillText(fl, c * CW + sway * 1.5, (top - 1) * CH);
          ctx.fillStyle = h.col;
        }
      }
    });
  }

  /* ---------- loop ---------- */
  let last = performance.now(), t0 = last;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // estrelas
    stars.forEach(s => {
      let b = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
      const x = s.c * CW, y = s.r * CH;
      const d = Math.hypot(x - mouse.x, y - mouse.y);
      if (d < 110) b = Math.min(1, b + (1 - d / 110));
      ctx.fillStyle = `rgba(255,244,220,${0.15 + b * 0.8})`;
      ctx.fillText(b > 0.8 ? '*' : b > 0.45 ? '+' : '.', x, y);
    });

    drawMoon(t);
    drawClouds(t);
    maybeShoot(t, dt);

    // pétalas
    petals.forEach(p => {
      p.y += p.vy * dt;
      const x = p.x + Math.sin(t * 1.2 + p.ph) * p.sw;
      if (p.y > H + 20) Object.assign(p, newPetal(false));
      ctx.fillStyle = p.col;
      ctx.fillText(p.ch, Math.round(x / CW) * CW, Math.round(p.y / CH) * CH);
    });

    drawHills(t);

    // explosão de corações
    bursts = bursts.filter(b => (b.t += dt) < b.life);
    bursts.forEach(b => {
      b.vy += 380 * dt; b.vx *= 0.99;
      b.x += b.vx * dt; b.y += b.vy * dt;
      ctx.globalAlpha = Math.min(1, (b.life - b.t) * 1.5);
      ctx.fillStyle = b.col;
      ctx.fillText(b.ch, Math.round(b.x / CW) * CW, Math.round(b.y / CH) * CH);
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  resize();
  requestAnimationFrame(frame);
})();
