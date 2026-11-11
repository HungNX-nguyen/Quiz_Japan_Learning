import React, { useEffect, useRef } from 'react';

// Falling sakura petals on a single canvas. Decorative only: aria-hidden,
// pointer-events none, paused when the tab is hidden, off for reduced motion.
const COLORS = [['#ffd6e4', '#ff9ec0'], ['#ffe4ee', '#f7a8c4'], ['#ffc8db', '#f48fb1'], ['#fff0f5', '#f9b4cd']];

function makePetal(w, h, anywhere) {
  const size = 7 + Math.random() * 9;
  return {
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : -20 - Math.random() * h * 0.3,
    size,
    vy: 0.35 + Math.random() * 0.7 + size * 0.02,
    vx: -0.2 + Math.random() * 0.6,
    swing: 0.6 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.03,
    angle: Math.random() * Math.PI * 2,
    flip: Math.random() * Math.PI * 2,
    flipSpeed: 0.01 + Math.random() * 0.03,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 0.55 + Math.random() * 0.4,
  };
}

function drawPetal(ctx, p) {
  const s = p.size;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.flip)));
  ctx.globalAlpha = p.alpha;
  const g = ctx.createLinearGradient(0, -s, 0, s);
  g.addColorStop(0, p.color[0]);
  g.addColorStop(1, p.color[1]);
  ctx.fillStyle = g;
  // Petal with the little notch at the tip, like a real sakura petal.
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(-s * 0.95, s * 0.35, -s * 0.8, -s * 0.7, -s * 0.22, -s);
  ctx.lineTo(0, -s * 0.72);
  ctx.lineTo(s * 0.22, -s);
  ctx.bezierCurveTo(s * 0.8, -s * 0.7, s * 0.95, s * 0.35, 0, s);
  ctx.fill();
  ctx.restore();
}

export function SakuraPetals({ enabled = true, front = false, night = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !enabled) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduce?.matches) return;
    const ctx = canvas.getContext('2d');
    // At night petals glow softly, like yozakura under lanterns.
    const glow = night ? 8 : 0;
    let w = 0, h = 0, petals = [], raf = 0, last = performance.now();
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(46, Math.max(16, w / 34)));
      while (petals.length < target) petals.push(makePetal(w, h, true));
      petals.length = target;
    }
    function frame(now) {
      const dt = Math.min(3, (now - last) / 16.67); last = now;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.phase += 0.012 * dt;
        p.x += (p.vx + Math.sin(p.phase) * p.swing * 0.5) * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        p.flip += p.flipSpeed * dt;
        if (p.y > h + 24 || p.x < -40 || p.x > w + 40) petals[i] = makePetal(w, h, false);
        if (glow) { ctx.shadowColor = '#ff8fb3'; ctx.shadowBlur = glow; }
        drawPetal(ctx, p);
      }
      raf = requestAnimationFrame(frame);
    }
    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }
    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      ctx.clearRect(0, 0, w, h);
    };
  }, [enabled, night]);
  return <canvas ref={ref} className={'sakura-canvas' + (front ? ' front' : '')} aria-hidden="true" />;
}
