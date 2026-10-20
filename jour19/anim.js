// BATTLE · Round 2 — Paris en 3D : DeepSeek vs GLM vs Claude — Le Débrief IA
// Rendu image par image : draw(t) (async : charge les images des captures). Repères (CUE) calés sur la voix off par montage.py.
const C = document.getElementById('c'), X = C.getContext('2d');
const W = 1080, H = 1920;
let CUE = {};

const COL = {
  white: '#ECECF0', grey: '#9698A2', dim: '#5E616D', faint: '#2C2E3A',
  orange: '#F06E2D', cyan: '#56BCD6', yellow: '#F2C94C', red: '#E5484D', green: '#46C281',
  panel: '#16171F', panel2: '#1C1D27',
};
const RGB = {
  cyan: [86, 188, 214], orange: [240, 110, 45], white: [236, 236, 240], red: [229, 72, 77],
  green: [70, 194, 129], yellow: [242, 201, 76], grey: [150, 152, 162], dim: [94, 97, 109], faint: [44, 46, 58],
};

// ---------------------------------------------------------------- outils
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t, s, d) => clamp((t - s) / d);
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, u) => a + (b - a) * u;
const mixc = (a, b, u) => [0, 1, 2].map(i => Math.round(lerp(a[i], b[i], u)));
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
let NOW = 0;

function txt(s, x, y, font, col, align = 'left', a = 1, ls = 0) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.font = font; X.fillStyle = col; X.textAlign = align;
  X.textBaseline = 'alphabetic'; X.letterSpacing = ls + 'px'; X.fillText(s, x, y); X.restore();
}
function tw(s, font, ls = 0) { X.save(); X.font = font; X.letterSpacing = ls + 'px'; const w = X.measureText(s).width; X.restore(); return w; }
function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r); }
function glowDot(x, y, r, col, a = 1, blur = 18) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.shadowColor = col; X.shadowBlur = blur; X.fillStyle = col;
  X.beginPath(); X.arc(x, y, r, 0, 7); X.fill(); X.restore();
}
function line(x1, y1, x2, y2, col, w = 3, a = 1, dash = null) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round';
  if (dash) X.setLineDash(dash);
  X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); X.stroke(); X.restore();
}
function arrow(x1, y1, x2, y2, col, u = 1, a = 1, w = 4) {
  if (u <= 0 || a <= 0) return;
  const x = lerp(x1, x2, u), y = lerp(y1, y2, u), an = Math.atan2(y2 - y1, x2 - x1);
  line(x1, y1, x, y, col, w, a);
  X.save(); X.globalAlpha *= a; X.fillStyle = col; X.translate(x, y); X.rotate(an);
  X.beginPath(); X.moveTo(4, 0); X.lineTo(-14, -10); X.lineTo(-14, 10); X.closePath(); X.fill(); X.restore();
}
function panel(x, y, w, h, stroke = COL.faint, fill = COL.panel, r = 22, lw = 2) {
  X.fillStyle = fill; rr(x, y, w, h, r); X.fill();
  X.strokeStyle = stroke; X.lineWidth = lw; rr(x, y, w, h, r); X.stroke();
}
function popIn(x, y, s, fn) { if (s <= 0) return; X.save(); X.translate(x, y); X.scale(s, s); X.translate(-x, -y); fn(); X.restore(); }

// ---------------------------------------------------------------- icônes
function checkIcon(x, y, s, col, u = 1, a = 1, w = 7) {
  if (u <= 0 || a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = w;
  X.lineCap = 'round'; X.lineJoin = 'round';
  const L1 = Math.hypot(11, 11), L2 = Math.hypot(22, 24), L = (L1 + L2) * clamp(u);
  X.beginPath(); X.moveTo(-16, 1);
  if (L <= L1) X.lineTo(lerp(-16, -5, L / L1), lerp(1, 12, L / L1));
  else { X.lineTo(-5, 12); const v = (L - L1) / L2; X.lineTo(lerp(-5, 17, v), lerp(12, -12, v)); }
  X.stroke(); X.restore();
}
function crossIcon(x, y, s, col, a = 1, w = 7) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round';
  X.beginPath(); X.moveTo(-12, -12); X.lineTo(12, 12); X.moveTo(12, -12); X.lineTo(-12, 12); X.stroke(); X.restore();
}
function eyeIcon(x, y, s, col, open = 1, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = 5; X.lineCap = 'round';
  const o = Math.max(0.05, open);
  X.beginPath(); X.moveTo(-36, 0); X.quadraticCurveTo(0, -34 * o, 36, 0); X.quadraticCurveTo(0, 34 * o, -36, 0); X.stroke();
  if (open > 0.3) { X.fillStyle = col; X.beginPath(); X.arc(0, 0, 11 * clamp((open - 0.3) / 0.7), 0, 7); X.fill(); }
  X.restore();
}
function docIcon(x, y, w, h, col, lines = 1, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = 4; X.lineJoin = 'round';
  X.beginPath(); X.moveTo(x, y); X.lineTo(x + w - 18, y); X.lineTo(x + w, y + 18); X.lineTo(x + w, y + h); X.lineTo(x, y + h); X.closePath(); X.stroke();
  for (let i = 0; i < 4; i++) {
    const u = clamp(lines * 4 - i); if (u <= 0) break;
    X.fillStyle = col; rr(x + 12, y + 24 + i * ((h - 40) / 3) - 3, (w - 24) * (i === 3 ? 0.6 : 1) * u, 6, 3); X.fill();
  }
  X.restore();
}
function bulbIcon(x, y, s, col, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = 5; X.lineCap = 'round';
  X.beginPath(); X.arc(0, -10, 30, Math.PI * 0.8, Math.PI * 2.2); X.lineTo(12, 30); X.lineTo(-12, 30); X.closePath(); X.stroke();
  X.beginPath(); X.moveTo(-10, 40); X.lineTo(10, 40); X.moveTo(-6, 49); X.lineTo(6, 49); X.stroke();
  X.restore();
}
function warnIcon(x, y, s, col, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.strokeStyle = col; X.lineWidth = 7; X.lineJoin = 'round';
  X.beginPath(); X.moveTo(0, -38); X.lineTo(42, 34); X.lineTo(-42, 34); X.closePath(); X.stroke();
  X.fillStyle = col; rr(-3.5, -16, 7, 30, 3.5); X.fill(); X.beginPath(); X.arc(0, 23, 4.5, 0, 7); X.fill();
  X.restore();
}
function globeIcon(x, y, r, col, a = 1, rot = 0) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.strokeStyle = col; X.lineWidth = 4;
  X.beginPath(); X.arc(0, 0, r, 0, 7); X.stroke();
  X.beginPath(); X.moveTo(-r, 0); X.lineTo(r, 0); X.stroke();
  [-0.5, 0.5].forEach(k => { const yy = k * r, xx = Math.sqrt(r * r - yy * yy); X.beginPath(); X.moveTo(-xx, yy); X.lineTo(xx, yy); X.stroke(); });
  X.save(); X.beginPath(); X.arc(0, 0, r, 0, 7); X.clip();
  for (let k = 0; k < 3; k++) { const ph = ((rot + k / 3) % 1) * Math.PI, rx = Math.abs(Math.cos(ph)) * r; X.beginPath(); X.ellipse(0, 0, Math.max(1, rx), r, 0, 0, 7); X.stroke(); }
  X.restore(); X.restore();
}
function coin(x, y, s, a = 1, label = '+1') {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.shadowColor = COL.yellow; X.shadowBlur = 24; X.fillStyle = COL.yellow; X.beginPath(); X.arc(0, 0, 52, 0, 7); X.fill();
  X.shadowBlur = 0; X.strokeStyle = 'rgba(16,17,26,0.35)'; X.lineWidth = 5; X.beginPath(); X.arc(0, 0, 40, 0, 7); X.stroke();
  txt(label, 0, 17, '800 46px Inter', '#10111a', 'center');
  X.restore();
}

// ---------------------------------------------------------------- images
const IMG = {};
function loadImg(name, src) { return new Promise(r => { const i = new Image(); i.onload = () => { IMG[name] = i; r(); }; i.onerror = () => { console.log('IMAGE MANQUANTE : ' + src); r(); }; i.src = src; }); }
function tile(name, size, pad = 0.12, radius = 0.2, bg = '#fff') {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, size, size, size * radius); g.fill();
  const im = IMG[name], inner = size * (1 - 2 * pad), k = Math.min(inner / im.width, inner / im.height);
  g.save(); g.beginPath(); g.roundRect(0, 0, size, size, size * radius); g.clip();
  g.drawImage(im, (size - im.width * k) / 2, (size - im.height * k) / 2, im.width * k, im.height * k); g.restore();
  return c;
}
function tinted(src, rgb, amount) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d');
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = css(rgb, amount); g.fillRect(0, 0, c.width, c.height);
  return c;
}

// nœud « IA » générique (cyan) ; red : passage au rouge ; g : glitch
function iaNode(x, y, r, a = 1, glow = 0, red = 0, g = 0) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a;
  const c = mixc(RGB.cyan, RGB.red, red);
  const gr = X.createRadialGradient(x, y, 0, x, y, r * 2.3);
  gr.addColorStop(0, css(c, 0.22 + 0.35 * glow)); gr.addColorStop(1, css(c, 0));
  X.fillStyle = gr; X.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
  const body = (col, dx = 0, dy = 0) => {
    X.save(); X.translate(dx, dy);
    X.fillStyle = col ? 'rgba(0,0,0,0)' : css(mixc([30, 42, 51], [52, 24, 30], red)); X.strokeStyle = col || css(c); X.lineWidth = 4;
    X.beginPath(); X.arc(x, y, r, 0, 7); X.fill(); X.stroke();
    if (!col) for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3 + NOW * 0.5; glowDot(x + Math.cos(an) * r * 0.52, y + Math.sin(an) * r * 0.52, r * 0.065, css(c), 0.9, 8); }
    txt('IA', x, y + r * 0.21, `800 ${Math.round(r * 0.6)}px Inter`, col || COL.white, 'center');
    X.restore();
  };
  if (g > 0.02) { X.save(); X.globalAlpha *= 0.7; body('#ff2d55', -12 * g, -3 * g); body('#2de2ff', 12 * g, 3 * g); X.restore(); }
  body(null);
  X.restore();
}
// ---------------------------------------------------------------- fond, barre, sourcil, effets
const DUST = Array.from({ length: 46 }, (_, i) => [hash(i) * W, hash(i + 50) * H, 0.6 + hash(i + 99) * 1.8, 8 + hash(i + 7) * 22]);
function background(t, tint, k = 0.12) {
  const g = X.createRadialGradient(540, 860, 0, 540, 860, 1150);
  g.addColorStop(0, tint ? css(mixc([29, 30, 39], tint, k)) : '#1d1e27'); g.addColorStop(1, '#0f1018');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  DUST.forEach(([x, y, r, v]) => {
    const yy = ((y - t * v) % H + H) % H;
    X.fillStyle = 'rgba(200,205,220,0.10)'; X.beginPath(); X.arc(x + Math.sin(t * 0.5 + y) * 8, yy, r, 0, 7); X.fill();
  });
}
function progressBar(t) {
  X.fillStyle = COL.orange;
  if (t < CUE.hookEnd) X.fillRect(480, 0, 120, 6);
  else X.fillRect(0, 0, W * clamp((t - CUE.hookEnd) / (CUE.end - CUE.hookEnd)), 6);
}
function eyebrow(label, a, dx = 0) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(dx, 0);
  txt(label, 90, 242, '500 32px Inter', COL.grey);
  X.fillStyle = COL.orange; X.fillRect(90, 258, 70 * eo(a), 4);
  X.restore();
}
function shockwave(x, y, t, t0, col = '255,255,255', rmax = 260, dur = 0.6) {
  const d = t - t0; if (d < 0 || d > dur) return;
  const u = d / dur;
  X.save(); X.strokeStyle = `rgba(${col},${0.8 * (1 - u)})`; X.lineWidth = 7 * (1 - u);
  X.beginPath(); X.arc(x, y, 20 + rmax * eo(u), 0, 7); X.stroke(); X.restore();
}
function burst(x, y, t, t0, seed, cols, n = 30, sp = 520, dur = 0.9) {
  const d = t - t0; if (d < 0 || d > dur) return;
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const an = r() * 6.283, v = sp * (0.4 + r() * 0.8), s = 3 + r() * 7, c = cols[Math.floor(r() * cols.length)];
    X.save(); X.globalAlpha *= 1 - d / dur; X.fillStyle = c;
    X.translate(x + Math.cos(an) * v * d, y + Math.sin(an) * v * d + 260 * d * d); X.rotate(r() * 6 + d * 5);
    X.fillRect(-s / 2, -s / 2, s, s); X.restore();
  }
}
function stamp(label, x, y, t, t0, col, rgbStr, size = 92, rot = -0.07) {
  const st = P(t, t0, 0.28); if (st <= 0) return;
  const s = lerp(2.4, 1, eo(st)), a = clamp(st * 2);
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const f = `800 ${size}px Inter`, w = tw(label, f, 2) + 80, h = size * 1.5;
  X.fillStyle = 'rgba(16,17,26,0.88)'; rr(-w / 2, -h * 0.57, w, h, 18); X.fill();
  X.strokeStyle = col; X.lineWidth = 8; rr(-w / 2, -h * 0.57, w, h, 18); X.stroke();
  txt(label, 0, size * 0.24, f, col, 'center', 1, 2);
  X.restore();
  shockwave(x, y, t, t0 + 0.25, rgbStr, 520, 0.6);
}
function pill(label, x, y, col, a = 1, f = '700 40px Inter', fill = '#16171f') {
  if (a <= 0) return;
  const w = tw(label, f) + 80, h = 76;
  X.save(); X.globalAlpha *= a;
  X.fillStyle = fill; X.strokeStyle = col; X.lineWidth = 4; rr(x - w / 2, y - h / 2, w, h, h / 2); X.fill(); X.stroke();
  txt(label, x, y + 14, f, col, 'center');
  X.restore();
}
function glitchText(s, x, y, font, col, g, align = 'center') {
  if (g > 0.02) {
    X.save(); X.globalAlpha *= 0.7;
    txt(s, x - 12 * g, y - 4, font, '#ff2d55', align); txt(s, x + 12 * g, y + 4, font, '#2de2ff', align); X.restore();
    const w = tw(s, font), x0 = align === 'center' ? x - w / 2 : x;
    for (let k = 0; k < 4; k++) {
      const yy = y - 110 + k * 30, dx = (hash(Math.floor(NOW * 30) + k) - .5) * 46 * g;
      X.save(); X.beginPath(); X.rect(x0 - 30, yy, w + 60, 22); X.clip(); txt(s, x + dx, y, font, col, align); X.restore();
    }
  } else txt(s, x, y, font, col, align);
}
const fmt = n => n >= 1000 ? Math.floor(n / 1000) + ' ' + String(n % 1000).padStart(3, '0') : String(n);


// garde-fou : rayon jamais négatif (les courbes « back » dépassent légèrement sous 0)
{ const _arc = CanvasRenderingContext2D.prototype.arc; CanvasRenderingContext2D.prototype.arc = function (x, y, r, a0, a1, ccw) { return _arc.call(this, x, y, Math.max(0, r), a0, a1, ccw); };
  const _el = CanvasRenderingContext2D.prototype.ellipse; CanvasRenderingContext2D.prototype.ellipse = function (x, y, rx, ry, ...o) { return _el.call(this, x, y, Math.max(0, rx), Math.max(0, ry), ...o); }; }

function gear(x, y, r, col, rot, a = 1, teeth = 8) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.rotate(rot); X.fillStyle = col;
  X.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const an = i * Math.PI / teeth, rad = i % 2 ? r * 0.78 : r; X.lineTo(Math.cos(an - 0.12) * rad, Math.sin(an - 0.12) * rad); X.lineTo(Math.cos(an + 0.12) * rad, Math.sin(an + 0.12) * rad); }
  X.closePath(); X.fill();
  X.globalCompositeOperation = 'destination-out'; X.beginPath(); X.arc(0, 0, r * 0.34, 0, 7); X.fill();
  X.restore();
}
function sparkle(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.fillStyle = col; X.shadowColor = col; X.shadowBlur = 16;
  X.beginPath(); X.moveTo(0, -30); X.quadraticCurveTo(4, -4, 30, 0); X.quadraticCurveTo(4, 4, 0, 30); X.quadraticCurveTo(-4, 4, -30, 0); X.quadraticCurveTo(-4, -4, 0, -30); X.fill();
  X.restore();
}
function starShape(x, y, r, col, a = 1, glow = 20) {
  if (a <= 0 || r <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.fillStyle = col; X.shadowColor = col; X.shadowBlur = glow;
  X.beginPath(); for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; X.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); } X.closePath(); X.fill();
  X.restore();
}

// ================================================================= OUTILS DU JOUR 13
const W8 = (t, a, b, fi = 0.3, fo = 0.3) => P(t, a - 0.05, fi) * (1 - P(t, b - fo, fo));
const NVG = [118, 185, 0], DSB = [77, 107, 254];
function drawTile(key, cx, cy, size, a = 1, glow = null) {
  const T = IMG[key]; if (!T || a <= 0 || size <= 0) return;
  X.save(); X.globalAlpha *= a;
  if (glow) {
    const g = X.createRadialGradient(cx, cy, 0, cx, cy, size * 1.15);
    g.addColorStop(0, css(glow, 0.32)); g.addColorStop(1, css(glow, 0));
    X.fillStyle = g; X.fillRect(cx - size * 1.2, cy - size * 1.2, size * 2.4, size * 2.4);
  }
  X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 24;
  X.drawImage(T, cx - size / 2, cy - size / 2, size, size); X.restore();
}
// un seul petit titre par écran (au centre, dans la zone de contenu)
function sectionTitle(num, label, a) {
  if (a <= 0) return;
  const f1 = '800 54px Inter', f2 = '700 54px Inter', s1 = num ? num + ' · ' : '';
  const w1 = s1 ? tw(s1, f1) : 0, w2 = tw(label, f2), x0 = 540 - (w1 + w2) / 2, dy = 24 * (1 - eo(a));
  X.save(); X.globalAlpha *= a;
  if (s1) txt(s1, x0, 400 + dy, f1, COL.orange);
  txt(label, x0 + w1, 400 + dy, f2, COL.white);
  X.restore();
}
// logo sur carte blanche (logos larges : Nvidia)
const CARD = {};
function mkCard(name, w, h, pad = 0.12, bg = '#fff', radius = 0.18) {
  const k = 2, c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const g = c.getContext('2d');
  const r = Math.min(w, h) * radius * k;
  g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w * k, h * k, r); g.fill();
  const im = IMG[name];
  if (im) { const iw = w * k * (1 - 2 * pad), ih = h * k * (1 - 2 * pad * w / h * 0.6), s = Math.min(iw / im.width, ih / im.height);
    g.drawImage(im, (w * k - im.width * s) / 2, (h * k - im.height * s) / 2, im.width * s, im.height * s); }
  c.W = w; c.H = h; return c;
}
function card(key, x, y, s = 1, a = 1, glow = null, g = 0) {
  if (a <= 0 || s <= 0 || !CARD[key]) return;
  const c = CARD[key], w = c.W * s, h = c.H * s;
  X.save(); X.globalAlpha *= a;
  if (glow) { const gr = X.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.9); gr.addColorStop(0, css(glow, 0.32)); gr.addColorStop(1, css(glow, 0)); X.fillStyle = gr; X.fillRect(x - w * 1.2, y - w * 1.2, w * 2.4, w * 2.4); }
  if (g > 0.02) {
    X.save(); X.globalAlpha *= 0.65;
    X.fillStyle = '#ff2d55'; rr(x - w / 2 - 14 * g, y - h / 2 - 4 * g, w, h, Math.min(w, h) * 0.18); X.fill();
    X.fillStyle = '#2de2ff'; rr(x - w / 2 + 14 * g, y - h / 2 + 4 * g, w, h, Math.min(w, h) * 0.18); X.fill();
    X.restore();
  }
  X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 26; X.drawImage(c, x - w / 2, y - h / 2, w, h);
  X.restore();
  if (g > 0.05) for (let k = 0; k < 4; k++) {
    const yy = y - h / 2 + hash(Math.floor(NOW * 30) + k) * h, dx = (hash(k * 7 + Math.floor(NOW * 30)) - .5) * 60 * g;
    X.save(); X.globalAlpha *= a; X.beginPath(); X.rect(x - w, yy, w * 2, 12); X.clip(); X.drawImage(c, x - w / 2 + dx, y - h / 2, w, h); X.restore();
  }
}
// silhouette
function person(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.fillStyle = col;
  X.beginPath(); X.arc(0, -22, 16, 0, 7); X.fill();
  X.beginPath(); X.moveTo(-28, 30); X.quadraticCurveTo(-28, -2, 0, -2); X.quadraticCurveTo(28, -2, 28, 30); X.closePath(); X.fill();
  X.restore();
}
// portrait générique (pas de photo) ; ringU : anneau qui se referme
function avatar(x, y, r, a = 1, ring = COL.orange, ringU = 1) {
  if (a <= 0 || r <= 0) return;
  X.save(); X.globalAlpha *= a;
  X.save(); X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 30; X.fillStyle = '#22232e'; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill(); X.restore();
  X.save(); X.beginPath(); X.arc(x, y, r, 0, 7); X.clip(); person(x, y + r * 0.28, r / 40, '#8a8d99'); X.restore();
  X.strokeStyle = COL.faint; X.lineWidth = 7; X.beginPath(); X.arc(x, y, r, 0, 7); X.stroke();
  if (ringU > 0) { X.strokeStyle = ring; X.lineCap = 'round'; X.beginPath(); X.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + 6.2832 * clamp(ringU)); X.stroke(); }
  X.restore();
}
// courbe boursière : u = part tracée, crash = chute finale (0..1)
function stockLine(x, y, w, h, u, crash, seed, rgb, a = 1, lw = 7) {
  if (a <= 0 || u <= 0) return;
  const N = 64, n = Math.max(2, Math.round(N * clamp(u)));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const f = i / (N - 1);
    let v = 0.16 + 0.64 * f + 0.06 * Math.sin(i * 0.9 + seed) + 0.05 * (hash(i + seed * 13) - 0.5);
    if (f > 0.8) v -= crash * 0.95 * eio((f - 0.8) / 0.2);
    pts.push([x + f * w, y + h - clamp(v, 0.02, 1) * h]);
  }
  X.save(); X.globalAlpha *= a;
  const g = X.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, css(rgb, 0.26)); g.addColorStop(1, css(rgb, 0));
  X.fillStyle = g; X.beginPath(); X.moveTo(pts[0][0], y + h); pts.forEach(p => X.lineTo(p[0], p[1])); X.lineTo(pts[pts.length - 1][0], y + h); X.closePath(); X.fill();
  X.strokeStyle = css(rgb); X.lineWidth = lw; X.lineJoin = 'round'; X.lineCap = 'round'; X.shadowColor = css(rgb, 0.7); X.shadowBlur = 18;
  X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke();
  X.restore();
  const L = pts[pts.length - 1]; glowDot(L[0], L[1], 11, css(rgb), a, 24);
  return L;
}
function chartPanel(x, y, w, h, stroke, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a;
  X.fillStyle = 'rgba(22,23,31,0.9)'; rr(x, y, w, h, 26); X.fill(); X.strokeStyle = stroke; X.lineWidth = 3; rr(x, y, w, h, 26); X.stroke();
  for (let k = 1; k < 4; k++) line(x + 30, y + k * h / 4, x + w - 30, y + k * h / 4, 'rgba(255,255,255,0.06)', 2);
  X.restore();
}
// calendrier (date dite à l'oral)
function calendar2(x, y, s, a, day, month) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 26; X.fillStyle = '#ECECF0'; rr(-150, -130, 300, 260, 30); X.fill(); X.shadowBlur = 0;
  X.fillStyle = COL.red; X.beginPath(); X.roundRect(-150, -130, 300, 72, [30, 30, 0, 0]); X.fill();
  txt(month, 0, -80, '800 38px Inter', '#fff', 'center', 1, 2);
  txt(day, 0, 92, '800 140px Inter', '#10111a', 'center');
  X.restore();
}
// petite puce graphique
function chipMini(x, y, s, rgb, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.strokeStyle = css(rgb); X.lineWidth = 3;
  X.beginPath();
  for (let k = -1; k <= 1; k++) { X.moveTo(k * 9, -23); X.lineTo(k * 9, -16); X.moveTo(k * 9, 16); X.lineTo(k * 9, 23); X.moveTo(-23, k * 9); X.lineTo(-16, k * 9); X.moveTo(16, k * 9); X.lineTo(23, k * 9); }
  X.stroke();
  X.fillStyle = css(mixc([24, 30, 14], rgb, 0.18)); rr(-16, -16, 32, 32, 5); X.fill(); X.stroke();
  X.fillStyle = css(rgb, 0.55); rr(-7, -7, 14, 14, 3); X.fill();
  X.restore();
}
// barrière rayée
function barrier(x, y, w, ang, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.rotate(ang);
  X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 30; X.fillStyle = '#fff'; rr(-w / 2, -34, w, 68, 12); X.fill(); X.shadowBlur = 0;
  X.save(); rr(-w / 2, -34, w, 68, 12); X.clip(); X.fillStyle = COL.red;
  for (let k = -w / 2 - 80; k < w / 2 + 80; k += 80) { X.beginPath(); X.moveTo(k, -34); X.lineTo(k + 40, -34); X.lineTo(k, 34); X.lineTo(k - 40, 34); X.closePath(); X.fill(); }
  X.restore(); X.restore();
}
// investisseur (bâtiment)
function bankIcon(x, y, s, col, a = 1, ring = COL.faint) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = COL.panel2; X.beginPath(); X.arc(0, 0, 62, 0, 7); X.fill(); X.strokeStyle = ring; X.lineWidth = 4; X.stroke();
  X.fillStyle = col;
  X.beginPath(); X.moveTo(-36, -12); X.lineTo(0, -34); X.lineTo(36, -12); X.closePath(); X.fill();
  for (let k = -1; k <= 1; k++) X.fillRect(k * 23 - 5, -6, 10, 30);
  X.fillRect(-40, 27, 80, 8);
  X.restore();
}
// fissures (séisme) : tracé fixe, révélé progressivement
function cracks(cx, cy, t, t0, seed) {
  const d = t - t0; if (d < 0 || d > 1.7) return;
  const u = eo(d / 0.22), a = 1 - P(d, 1.0, 0.7), r = rng(seed);
  X.save(); X.globalAlpha *= 0.5 * a; X.strokeStyle = '#ECECF0'; X.lineWidth = 3; X.lineJoin = 'round';
  for (let k = 0; k < 8; k++) {
    let an = k * 0.785 + r() * 0.5, x = cx, y = cy; const n = 9;
    X.beginPath(); X.moveTo(x, y);
    for (let i = 0; i < n; i++) { const s = 34 + r() * 40; an += (r() - 0.5) * 0.9; x += Math.cos(an) * s; y += Math.sin(an) * s; if (i < n * u) X.lineTo(x, y); }
    X.stroke();
  }
  X.restore();
}
// fichier de poids + cadenas (repris du jour 10)
const fmtW = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
function weightsFile(x, y, s, a = 1, unlock = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = COL.panel2; X.strokeStyle = COL.cyan; X.lineWidth = 5; rr(-150, -100, 300, 200, 22); X.fill(); X.stroke();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) txt(fmtW(hash(r * 9 + c) * 1.8 - 0.9), -105 + c * 70, -52 + r * 42, '600 24px Inter', css(RGB.cyan, 0.85), 'center');
  const lx = 196, ly = -40, col = unlock > 0.5 ? COL.green : COL.grey;
  X.fillStyle = col; rr(lx - 40, ly - 10, 80, 64, 12); X.fill();
  X.strokeStyle = col; X.lineWidth = 10; X.lineCap = 'round';
  const lift = 26 * eo(unlock), rot = -0.6 * eo(unlock);
  X.save(); X.translate(lx + 24, ly - 10); X.rotate(rot); X.translate(-(lx + 24), -(ly - 10));
  X.beginPath(); X.moveTo(lx - 24, ly - 10 - lift * 0.2); X.lineTo(lx - 24, ly - 34 - lift); X.arc(lx, ly - 34 - lift, 24, Math.PI, 0); X.lineTo(lx + 24, ly - 10); X.stroke();
  X.restore();
  X.restore();
}
function subscribeBtn(x, y, s, a = 1, press = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s * (1 - 0.08 * press), s * (1 - 0.08 * press));
  const f = '800 56px Inter', w = tw('Abonne-toi', f) + 120, h = 116;
  X.shadowColor = css(RGB.orange, 0.6); X.shadowBlur = 40; X.fillStyle = COL.orange; rr(-w / 2, -h / 2, w, h, h / 2); X.fill(); X.shadowBlur = 0;
  txt('Abonne-toi', 0, 20, f, '#10111a', 'center');
  X.restore();
}
function cursorHand(x, y, s, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = '#fff'; X.strokeStyle = '#10111a'; X.lineWidth = 4; X.lineJoin = 'round';
  X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 64); X.lineTo(16, 50); X.lineTo(28, 76); X.lineTo(40, 70); X.lineTo(28, 45); X.lineTo(48, 44); X.closePath(); X.fill(); X.stroke();
  X.restore();
}
// texte en deux couleurs centré
function txt2(a1, a2, y, f1, f2, c1, c2, a = 1) {
  if (a <= 0) return;
  const w1 = tw(a1, f1), w2 = tw(a2, f2), x0 = 540 - (w1 + w2) / 2;
  txt(a1, x0, y, f1, c1, 'left', a); txt(a2, x0 + w1, y, f2, c2, 'left', a);
}

// ================================================================= OUTILS DU JOUR 14
const QW = [97, 92, 237], GOLD = [242, 201, 76];
// cadenas : open 0 → 1
function padlock(x, y, s, open, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = col; rr(-40, -10, 80, 64, 12); X.fill();
  X.fillStyle = 'rgba(16,17,26,0.55)'; X.beginPath(); X.arc(0, 16, 8, 0, 7); X.fill(); X.fillRect(-3, 18, 6, 16);
  X.strokeStyle = col; X.lineWidth = 10; X.lineCap = 'round';
  const lift = 26 * eo(open), rot = -0.6 * eo(open);
  X.save(); X.translate(24, -10); X.rotate(rot); X.translate(-24, 10);
  X.beginPath(); X.moveTo(-24, -10 - lift * 0.2); X.lineTo(-24, -34 - lift); X.arc(0, -34 - lift, 24, Math.PI, 0); X.lineTo(24, -10); X.stroke();
  X.restore(); X.restore();
}
// fichier de poids dont les nombres défilent
function weightsLive(x, y, s, a = 1, unlock = 0, t = 0, lockOn = true) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = COL.panel2; X.strokeStyle = COL.cyan; X.lineWidth = 5; rr(-150, -100, 300, 200, 22); X.fill(); X.stroke();
  X.save(); rr(-146, -96, 292, 192, 20); X.clip();
  const off = (t * 70) % 42, base = Math.floor(t * 70 / 42);
  for (let r = -1; r < 6; r++) for (let c = 0; c < 4; c++) {
    const v = hash((r + base) * 9 + c * 31) * 1.8 - 0.9;
    txt(fmtW(v), -105 + c * 70, -60 + r * 42 - off, '600 24px Inter', css(RGB.cyan, 0.85), 'center');
  }
  X.restore();
  if (lockOn) padlock(196, -40 + 22, 1, unlock, unlock > 0.5 ? COL.green : COL.grey);
  X.restore();
}
function giftIcon(x, y, s, a = 1, col = COL.green) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = col; rr(-70, -20, 140, 100, 12); X.fill(); rr(-80, -48, 160, 34, 10); X.fill();
  X.fillStyle = COL.white; X.fillRect(-12, -48, 24, 128);
  X.strokeStyle = COL.white; X.lineWidth = 10; X.lineCap = 'round';
  X.beginPath(); X.ellipse(-26, -66, 26, 15, -0.5, 0, 7); X.stroke(); X.beginPath(); X.ellipse(26, -66, 26, 15, 0.5, 0, 7); X.stroke();
  X.restore();
}
function priceTag(x, y, s, label, col, a = 1, rot = -0.18) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.rotate(rot); X.scale(s, s);
  X.shadowColor = css(GOLD, 0.5); X.shadowBlur = 30;
  X.fillStyle = col; X.beginPath(); X.moveTo(-110, -60); X.lineTo(80, -60); X.lineTo(130, 0); X.lineTo(80, 60); X.lineTo(-110, 60); X.closePath(); X.fill();
  X.shadowBlur = 0; X.fillStyle = '#10111a'; X.beginPath(); X.arc(88, 0, 11, 0, 7); X.fill();
  txt(label, -18, 24, '800 66px Inter', '#10111a', 'center');
  X.restore();
}
function downloadIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = 9; X.lineCap = 'round'; X.lineJoin = 'round';
  X.beginPath(); X.moveTo(0, -40); X.lineTo(0, 14); X.moveTo(-24, -10); X.lineTo(0, 14); X.lineTo(24, -10); X.stroke();
  X.beginPath(); X.moveTo(-40, 18); X.lineTo(-40, 38); X.lineTo(40, 38); X.lineTo(40, 18); X.stroke();
  X.restore();
}
function pencilIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.rotate(-0.78); X.scale(s, s); X.fillStyle = col;
  rr(-46, -13, 72, 26, 5); X.fill(); X.beginPath(); X.moveTo(30, -13); X.lineTo(54, 0); X.lineTo(30, 13); X.closePath(); X.fill();
  X.fillStyle = '#10111a'; X.fillRect(-30, -13, 5, 26);
  X.restore();
}
function cloudIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.fillStyle = col;
  X.beginPath(); X.arc(-26, 8, 26, 0, 7); X.arc(4, -10, 34, 0, 7); X.arc(34, 10, 24, 0, 7); X.fill(); rr(-50, 6, 106, 30, 15); X.fill();
  X.restore();
}
function cycleIcon(x, y, s, col, a = 1, rot = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.rotate(rot); X.strokeStyle = col; X.fillStyle = col; X.lineWidth = 9; X.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    X.save(); X.rotate(k * Math.PI);
    X.beginPath(); X.arc(0, 0, 36, 0.25, Math.PI - 0.35); X.stroke();
    const an = Math.PI - 0.35; X.translate(Math.cos(an) * 36, Math.sin(an) * 36); X.rotate(an + Math.PI / 2);
    X.beginPath(); X.moveTo(12, 0); X.lineTo(-8, -12); X.lineTo(-8, 12); X.closePath(); X.fill();
    X.restore();
  }
  X.restore();
}
function dbIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = 6;
  for (let k = 0; k < 3; k++) { X.beginPath(); X.ellipse(0, -36 + k * 32, 46, 14, 0, 0, Math.PI); X.stroke(); }
  X.beginPath(); X.ellipse(0, -36, 46, 14, 0, 0, 7); X.stroke();
  X.beginPath(); X.moveTo(-46, -36); X.lineTo(-46, 28); X.moveTo(46, -36); X.lineTo(46, 28); X.stroke();
  X.beginPath(); X.ellipse(0, 28, 46, 14, 0, 0, Math.PI); X.stroke();
  X.restore();
}
function building(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = COL.panel2; X.strokeStyle = col; X.lineWidth = 6; rr(-60, -80, 120, 160, 10); X.fill(); X.stroke();
  X.fillStyle = col;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { X.globalAlpha *= 1; rr(-40 + c * 30, -62 + r * 30, 20, 18, 3); X.fill(); }
  rr(-14, 50, 28, 30, 4); X.fill();
  X.restore();
}
function serverIcon(x, y, s, col, a = 1, t = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  for (let k = 0; k < 3; k++) {
    const yy = -84 + k * 58;
    X.fillStyle = COL.panel2; X.strokeStyle = col; X.lineWidth = 5; rr(-80, yy, 160, 48, 10); X.fill(); X.stroke();
    glowDot(-54, yy + 24, 6, hash(k + Math.floor(t * 6)) > 0.4 ? COL.green : COL.dim, 1, 8);
    X.fillStyle = css(RGB.dim); rr(-30, yy + 19, 86, 10, 5); X.fill();
  }
  X.restore();
}
function strike(x1, x2, y, u, col = COL.red, w = 10) { if (u > 0) line(x1, y, lerp(x1, x2, eo(u)), y - 6 * eo(u), col, w); }
function rowPanel(y, a, hl = 0, col = COL.faint) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; panel(100, y - 78, 880, 156, hl > 0 ? css(mixc(RGB.faint, RGB.orange, hl)) : col, COL.panel, 26, 3); X.restore();
}
function tag(label, x, y, col, a = 1, f = '700 38px Inter') { pill(label, x, y, col, a, f); }
function iconCard(x, y, w, h, on, rgb, label, drawIcon, a = 1) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a;
  const c = css(mixc(RGB.dim, rgb, on));
  X.fillStyle = css(mixc([22, 23, 31], mixc([22, 23, 31], rgb, 0.18), on)); rr(x - w / 2, y - h / 2, w, h, 26); X.fill();
  X.strokeStyle = css(mixc(RGB.faint, rgb, on)); X.lineWidth = 3 + 3 * on; rr(x - w / 2, y - h / 2, w, h, 26); X.stroke();
  if (on > 0.05) { X.save(); X.globalAlpha *= on; X.shadowColor = css(rgb); X.shadowBlur = 30 * on; X.restore(); }
  drawIcon(x, y - 30, c);
  txt(label, x, y + h / 2 - 34, '700 36px Inter', css(mixc(RGB.grey, RGB.white, on)), 'center');
  X.restore();
}

// ================================================================= BATTLE · ROUND 1 — GLM vs DeepSeek vs Claude (Flappy Bird)
const CLR = [217, 119, 87], GLMC = [236, 236, 240];
function tileB(name, size, pad, radius, bg, stroke) {
  const c = tile(name, size, pad, radius, bg);
  if (stroke) { const g = c.getContext('2d'); g.strokeStyle = stroke; g.lineWidth = size * 0.03; g.beginPath(); g.roundRect(size * 0.015, size * 0.015, size * 0.97, size * 0.97, size * radius); g.stroke(); }
  return c;
}
// ---------------------------------------------------------------- captures (images pré-extraites par prep_clips.py)
let CLIPS = {};
const FCACHE = new Map();
function frameImg(clip, s) {
  const c = CLIPS[clip]; const k = Math.max(1, Math.min(c.n, Math.round(s * 30) + 1));
  const key = clip + ':' + k; if (FCACHE.has(key)) return FCACHE.get(key);
  const p = new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => { console.log('IMAGE MANQUANTE : ' + key); r(null); }; i.src = `frames/${clip}/${String(k).padStart(4, '0')}.jpg`; });
  FCACHE.set(key, p); if (FCACHE.size > 80) FCACHE.delete(FCACHE.keys().next().value);
  return p;
}
const shotAt = t => (CUE.shots || []).find(s => t >= s.t0 && t < s.t1);
function srcPos(sh, t) { let s = sh.s0 + (t - sh.t0) * sh.rate; if (sh.smax != null) s = Math.min(s, sh.smax); return s; }
// capture dans une « fenêtre » arrondie ; z : zoom autour de (fx, fy) en coordonnées de l'image
function screenPanel(im, cx, cy, w, h, a = 1, z = 1, fx = 0.5, fy = 0.5, s = 1) {
  if (!im || a <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(cx, cy); X.scale(s, s);
  X.save(); X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 50; X.fillStyle = '#0b0c12'; rr(-w / 2, -h / 2, w, h, 26); X.fill(); X.restore();
  X.save(); rr(-w / 2, -h / 2, w, h, 26); X.clip();
  const dw = w * z, dh = h * z;
  X.drawImage(im, -w / 2 - (dw - w) * fx, -h / 2 - (dh - h) * fy, dw, dh);
  X.restore();
  X.strokeStyle = 'rgba(255,255,255,.14)'; X.lineWidth = 3; rr(-w / 2, -h / 2, w, h, 26); X.stroke();
  X.restore();
}
// position écran d'un point (px, py) de l'image affichée dans screenPanel
function spt(cx, cy, w, h, z, fx, fy, px, py, s = 1) {
  const dw = w * z, dh = h * z, x0 = -w / 2 - (dw - w) * fx, y0 = -h / 2 - (dh - h) * fy;
  return [cx + s * (x0 + px * z), cy + s * (y0 + py * z)];
}
// contour progressif (rectangle arrondi) pour entourer un mot
function hiBox(x1, y1, x2, y2, u, col = COL.orange, a = 1, lw = 7) {
  if (u <= 0 || a <= 0) return;
  const w = x2 - x1, h = y2 - y1, per = 2 * (w + h);
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = lw; X.lineJoin = 'round'; X.shadowColor = col; X.shadowBlur = 16;
  X.setLineDash([per * eo(u), per]); rr(x1, y1, w, h, 14); X.stroke(); X.restore();
}
function hiCircle(x, y, rx, ry, u, col = COL.orange, a = 1, lw = 7) {
  if (u <= 0 || a <= 0) return;
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = lw; X.lineCap = 'round'; X.shadowColor = col; X.shadowBlur = 18;
  X.beginPath(); X.ellipse(x, y, rx, ry, -0.05, -Math.PI / 2, -Math.PI / 2 + 6.4 * eo(u)); X.stroke(); X.restore();
}
function underline(x1, x2, y, u, col = COL.orange, a = 1, w = 8) {
  if (u <= 0 || a <= 0) return;
  X.save(); X.globalAlpha *= a; X.shadowColor = col; X.shadowBlur = 14; line(x1, y, lerp(x1, x2, eo(u)), y, col, w); X.restore();
}
// badge du modèle : tuile + nom
const MODEL = {
  cl: { tile: 't_ant', rgb: CLR, name: 'Claude Opus 5.5' },
  glm: { tile: 't_glm', rgb: GLMC, name: 'GLM 5.3 Flash' },
  ds: { tile: 't_ds', rgb: DSB, name: 'DeepSeek V4.1 Flash' },
};
function modelBadge(key, x, y, a = 1, s = 1, label = null) {
  if (a <= 0 || s <= 0) return;
  const m = MODEL[key], f = '800 44px Inter', lb = label === null ? m.name : label, tw0 = lb ? tw(lb, f) : 0;
  const h = 96, w = 96 + (lb ? tw0 + 56 : 0);
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.save(); X.shadowColor = 'rgba(0,0,0,.55)'; X.shadowBlur = 30; X.fillStyle = 'rgba(16,17,26,.94)'; rr(0, -h / 2, w, h, h / 2); X.fill(); X.restore();
  X.strokeStyle = css(m.rgb, 0.9); X.lineWidth = 4; rr(0, -h / 2, w, h, h / 2); X.stroke();
  if (IMG[m.tile]) { X.save(); X.beginPath(); X.arc(h / 2, 0, h / 2 - 9, 0, 7); X.clip(); X.drawImage(IMG[m.tile], 9, -h / 2 + 9, h - 18, h - 18); X.restore(); }
  if (lb) txt(lb, h + 14, 16, f, COL.white);
  X.restore();
}
function clockIcon(x, y, r, col, a = 1, t = 0) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = r * 0.16; X.lineCap = 'round';
  X.beginPath(); X.arc(x, y, r, 0, 7); X.stroke();
  const an = -Math.PI / 2 + t * 5; line(x, y, x + Math.cos(an) * r * 0.62, y + Math.sin(an) * r * 0.62, col, r * 0.15);
  line(x, y, x, y - r * 0.45, col, r * 0.15); X.restore();
}
function chrono(label, x, y, a = 1, s = 1, t = 0, col = COL.orange) {
  if (a <= 0 || s <= 0) return;
  const f = '800 50px Inter', w = tw(label, f) + 150, h = 96;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.save(); X.shadowColor = 'rgba(0,0,0,.55)'; X.shadowBlur = 30; X.fillStyle = 'rgba(16,17,26,.94)'; rr(-w, -h / 2, w, h, h / 2); X.fill(); X.restore();
  X.strokeStyle = col; X.lineWidth = 4; rr(-w, -h / 2, w, h, h / 2); X.stroke();
  clockIcon(-w + 56, 0, 24, col, 1, t);
  txt(label, -w + 100, 18, f, COL.white);
  X.restore();
}
function speaker(x, y, s, col, muted = 0, waves = 1, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.save(); X.shadowColor = 'rgba(0,0,0,.55)'; X.shadowBlur = 30; X.fillStyle = 'rgba(16,17,26,.94)'; X.beginPath(); X.arc(0, 0, 74, 0, 7); X.fill(); X.restore();
  X.strokeStyle = col; X.lineWidth = 5; X.beginPath(); X.arc(0, 0, 74, 0, 7); X.stroke();
  X.fillStyle = col; X.beginPath(); X.moveTo(-36, -14); X.lineTo(-18, -14); X.lineTo(4, -34); X.lineTo(4, 34); X.lineTo(-18, 14); X.lineTo(-36, 14); X.closePath(); X.fill();
  X.strokeStyle = col; X.lineWidth = 7; X.lineCap = 'round';
  if (muted > 0) { line(18, -18, 18 + 30 * eo(muted), -18 + 36 * eo(muted), col, 8); line(48, -18, 48 - 30 * eo(muted), -18 + 36 * eo(muted), col, 8); }
  else for (let k = 0; k < 2; k++) { const ph = clamp(waves * 2 - k); if (ph <= 0) continue; X.globalAlpha *= 1; X.beginPath(); X.arc(4, 0, 22 + k * 18, -0.75 * ph, 0.75 * ph); X.stroke(); }
  X.restore();
}

// ================================================================= BATTLE · ROUND 3 — le site le plus stylé (Kimi K3.1 Pro / Claude Opus 5.5)
// Martin n'aime pas l'onde de choc (petit point qui s'agrandit en cercle) : désactivée.
function shockwave() {}
const SC = (t, a, b, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
function punch(t, list) {
  let z = 0;
  list.forEach(([t0, k, d = 0.45]) => { const u = (t - t0) / d; if (u >= 0 && u < 1) z = Math.max(z, k * Math.sin(Math.PI * Math.min(1, u * 2.2)) * (1 - u) * 1.6); });
  return 1 + z;
}
function flashAt(t, list) { list.forEach(([c, k]) => { const d = t - c; if (d >= 0 && d < 0.22) { X.fillStyle = `rgba(255,255,255,${k * (1 - d / 0.22)})`; X.fillRect(-40, -40, W + 80, H + 80); } }); }
function tileGlitch(key, x, y, size, a, glow, g) {
  if (g > 0.03) {
    X.save(); X.globalAlpha *= 0.55 * a;
    X.fillStyle = '#ff2d55'; rr(x - size / 2 - 16 * g, y - size / 2 - 5 * g, size, size, size * 0.22); X.fill();
    X.fillStyle = '#2de2ff'; rr(x - size / 2 + 16 * g, y - size / 2 + 5 * g, size, size, size * 0.22); X.fill();
    X.restore();
  }
  drawTile(key, x, y, size, a, glow);
}
const KIMIC = [22, 119, 255];
MODEL.kimi = { tile: 't_kimi', rgb: KIMIC, name: 'Kimi K3.1 Pro' };
MODEL.cl.name = 'Claude Opus 5.5';
const LOGO = { kimi: 't_kimi', cl: 't_ant' };

// ================================================================= ACCROCHE : Kimi K3.1 contre Opus 5.5 — Round 3
const HX = { kimi: 300, cl: 780 }, HY = 960;
function hookScene(t, focus) {
  const rs = CUE.hGo, st = P(t, rs - 0.05, 0.3), s = t < rs - 0.05 ? 1 : lerp(1.9, 1, eo(st));
  const g = t < 0.35 ? 0 : clamp(1 - (t - rs) / 0.4) * (t >= rs - 0.05 ? 1 : 0);
  const fz = Math.max(focus.kimi || 0, focus.cl || 0);
  X.save(); X.globalAlpha *= 1 - fz; X.translate(540, 640); X.scale(s, s); glitchText('ROUND 3', 0, 0, '900 170px Inter', COL.orange, g); X.restore();
  [['kimi', 'Kimi K3.1', CUE.hK], ['cl', 'Opus 5.5', CUE.hO]].forEach(([k, lb, c], i) => {
    const m = MODEL[k], on = focus[k] || 0, b = 1 + 0.04 * Math.sin(t * 3 + i);
    tileGlitch(LOGO[k], HX[k], HY, 250 * b * (1 + 0.08 * on), 1, on > 0.2 ? m.rgb : null, on * clamp(1 - (t - c) / 0.35));
    txt(lb, HX[k], HY + 220, '800 56px Inter', COL.white, 'center');
  });
  txt('VS', 540, HY + 20, '900 56px Inter', COL.dim, 'center', 1 - fz);
}
function drawHook(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const keys = [[-1, 540, 1], [CUE.hK, HX.kimi, 1.9], [CUE.hO, HX.cl, 1.9], [CUE.hGo + 0.05, 540, 1]];
  let cx = 540, z = 1, vel = 0;
  for (let i = 1; i < keys.length; i++) {
    const [t0, x1, z1] = keys[i], [, x0, z0] = keys[i - 1], d = i === 1 ? 0.18 : 0.22, u = P(t, t0 - 0.04, d);
    if (t >= t0 - 0.04) { const e = i === 1 ? back(u) : eio(u); cx = lerp(x0, x1, e); z = lerp(z0, z1, e); vel = (u > 0 && u < 1) ? Math.abs(x1 - x0) / 300 * Math.sin(Math.PI * u) : 0; }
  }
  const focus = {}; [['kimi', CUE.hK, CUE.hO], ['cl', CUE.hO, CUE.hGo]].forEach(([k, a, b]) => { focus[k] = P(t, a - 0.04, 0.15) * (1 - P(t, b - 0.04, 0.15)); });
  const draw1 = (dx, a) => { X.save(); X.globalAlpha *= a; X.translate(540 + dx, HY); X.scale(z, z); X.translate(-cx, -HY); hookScene(t, focus); X.restore(); };
  if (vel > 0.05) { draw1(-60 * vel, 0.25); draw1(60 * vel, 0.25); }
  draw1(0, vel > 0.05 ? 0.7 : 1);
  burst(540, 640, t, CUE.hGo + 0.12, 11, [COL.orange, COL.yellow, '#fff'], 40, 700, 0.9);
  X.restore();
}
function hookBg(t) {   // les deux sites en fond, flous et assombris (vignette) : AION à gauche, HOULE à droite
  const a = 0.34 * (1 - P(t, CUE.hookEnd - 0.1, 0.4));
  if (a <= 0) return;
  [[IMG.bgK, 0], [IMG.bgC, 540]].forEach(([im, x0]) => {
    if (!im) return;
    X.save(); X.beginPath(); X.rect(x0, 0, 540, H); X.clip(); X.globalAlpha = a; X.filter = 'blur(6px)';
    const z = 1.0 + 0.04 * t, h = H * 0.75 * z, w = h * im.width / im.height;
    X.drawImage(im, x0 + 270 - w / 2, 900 - h / 2, w, h); X.filter = 'none'; X.restore();
  });
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(15,16,24,0.92)'); g.addColorStop(0.45, 'rgba(15,16,24,0.2)'); g.addColorStop(1, 'rgba(15,16,24,0.95)');
  X.save(); X.globalAlpha = a / 0.34; X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
}
// ================================================================= CARTE JOUR 19 / 365
function drawDay(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const u = t - CUE.day, s = back(u / 0.4);
  const n = Math.max(1, Math.min(19, Math.round(19 * eo(P(t, CUE.day + 0.05, 0.55)))));
  txt('JOUR', 540, 640, '800 64px Inter', COL.grey, 'center', clamp(u / 0.25), 14);
  popIn(540, 790, s, () => txt(String(n), 540, 870, '900 250px Inter', COL.orange, 'center'));
  txt('/ 365', 540, 1000, '700 76px Inter', COL.white, 'center', P(t, CUE.dayN - 0.1, 0.3));
  for (let i = 0; i < 19; i++) { const on = i < n; glowDot(540 - 9 * 34 + i * 34, 1095, on ? 9 : 6, on ? COL.orange : COL.faint, clamp(u / 0.3), on ? 12 : 0); }
  // les deux modèles
  [['kimi', 400], ['cl', 680]].forEach(([k, x], i) => { const p = back(P(t, CUE.dayM - 0.1 + i * 0.15, 0.4)); popIn(x, 1250, p, () => drawTile(LOGO[k], x, 1250, 130, 1, MODEL[k].rgb)); });
  txt('VS', 540, 1265, '900 40px Inter', COL.dim, 'center', P(t, CUE.dayM + 0.1, 0.3));
  X.restore();
}
// ================================================================= LE PROMPT
const PROMPT = ['Fait moi une page web la plus stylé possible, impressionne moi.', '', "--> Quand tu as fini, lance l'app sur le premier localhost >8000 dispo"];
const PF = '600 48px Inter', PLH = 66, PW = 860;
let PLAY = null;
function layoutPrompt() {
  const lines = []; let k = 0;
  PROMPT.forEach(par => {
    if (!par) { lines.push({ words: [] }); return; }
    let cur = [], cw = 0; const sw = tw(' ', PF);
    par.split(' ').forEach(w => { const ww = tw(w, PF); if (cur.length && cw + sw + ww > PW) { lines.push({ words: cur }); cur = []; cw = 0; } cur.push({ w, x: cur.length ? cw + sw : 0, ww, k: k }); cw = (cur.length > 1 ? cw + sw : 0) + ww; k += w.length + 1; });
    lines.push({ words: cur });
  });
  PLAY = { lines, total: k };
}
// groupes surlignés : [premier mot, dernier mot, repère, couleur]
const PHL = () => [['la', 'possible,', CUE.prStyle, COL.orange], ['impressionne', 'moi.', CUE.prImp, COL.yellow]];
function drawPrompt(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const pin = back(P(t, CUE.pr0 - 0.05, 0.45)), x0 = 110, y0 = 600, h = PLAY.lines.length * PLH + 120;
  X.save(); X.globalAlpha *= clamp(pin * 1.5); X.translate(540, 540 + h / 2); X.scale(lerp(0.9, 1, clamp(pin)), lerp(0.9, 1, clamp(pin))); X.translate(-540, -(540 + h / 2));
  panel(70, 540, 940, h, COL.faint, '#14151c', 28, 3);
  ['#E5484D', '#F2C94C', '#46C281'].forEach((c, i) => glowDot(110 + i * 34, 572, 9, c, 0.9, 0));
  const rev = PLAY.total * eio(P(t, CUE.pr0 + 0.2, CUE.prEnd - CUE.pr0 - 0.9));
  const all = PLAY.lines.flatMap(l => l.words);
  PLAY.lines.forEach((ln, li) => {
    const y = y0 + 40 + li * PLH;
    ln.words.forEach(o => {
      if (o.k > rev) return;
      let col = li >= 2 ? COL.grey : COL.white;
      PHL().forEach(([a, b, c, hc]) => {
        const fa = all.find(w => w.w === a), fb = all.find(w => w.w === b && w.k >= fa.k);
        if (fa && fb && o.k >= fa.k && o.k <= fb.k) { const u = P(t, c - 0.1, 0.35); if (u > 0) { X.save(); X.globalAlpha *= 0.26 * u; X.fillStyle = hc; rr(x0 + o.x - 6, y - 44, o.ww + 12, 60, 10); X.fill(); X.restore(); if (u > 0.3) col = hc; } }
      });
      txt(o.w, x0 + o.x, y, PF, col);
    });
  });
  X.restore();
  // « le même prompt » : envoyé aux deux modèles
  const by = 540 + h + 210;
  [['kimi', 330, 0], ['cl', 750, 0.15]].forEach(([k, x, d]) => {
    const p = back(P(t, CUE.prMeme - 0.1 + d, 0.4)); if (p <= 0) return;
    const u = eo(P(t, CUE.prMeme - 0.1 + d, 0.5));
    arrow(540, 540 + h + 20, lerp(540, x, u), lerp(540 + h + 20, by - 95, u), COL.dim, u, 0.9, 5);
    popIn(x, by, p, () => drawTile(LOGO[k], x, by, 150, 1, MODEL[k].rgb));
  });
  X.restore();
}
// ================================================================= LES EFFORTS : max / extra (captures entourées)
const OCP = { cx: 540, cy: 720, w: 1000, h: 250 }, CLP = { cx: 540, cy: 1130, w: 1000, h: 368 };
function pBox(Pn, x1, y1, x2, y2, u, col, a = 1) { const [a1, b1] = spt(Pn.cx, Pn.cy, Pn.w, Pn.h, 1, 0.5, 0.5, x1, y1), [a2, b2] = spt(Pn.cx, Pn.cy, Pn.w, Pn.h, 1, 0.5, 0.5, x2, y2); hiBox(a1, b1, a2, b2, u, col, a); }
function pCirc(Pn, x1, y1, x2, y2, u, col, a = 1) { const [a1, b1] = spt(Pn.cx, Pn.cy, Pn.w, Pn.h, 1, 0.5, 0.5, x1, y1), [a2, b2] = spt(Pn.cx, Pn.cy, Pn.w, Pn.h, 1, 0.5, 0.5, x2, y2); hiCircle((a1 + a2) / 2, (b1 + b2) / 2, (a2 - a1) / 2 + 22, (b2 - b1) / 2 + 22, u, col, a, 7); }
function drawEfforts(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const uo = P(t, CUE.kEff - 0.1, 0.35), uc = P(t, CUE.oEff - 0.1, 0.35);
  screenPanel(FR.oc, OCP.cx, OCP.cy + 70 * (1 - eo(uo)), OCP.w, OCP.h, eo(uo), 1, 0.5, 0.5, lerp(0.92, 1, eo(uo)));
  if (uo > 0.9) {
    pCirc(OCP, 236, 160, 526, 206, P(t, CUE.kEff + 0.15, 0.5), '#3d8bff');
    pBox(OCP, 818, 158, 906, 208, P(t, CUE.kMax - 0.08, 0.35), COL.orange);
  }
  modelBadge('kimi', 40, OCP.cy - OCP.h / 2 - 2, eo(uo), lerp(0.7, 0.82, back(uo)));
  const pm = back(P(t, CUE.kMax - 0.05, 0.4));
  popIn(880, OCP.cy - OCP.h / 2 - 2, pm, () => pill('max', 880, OCP.cy - OCP.h / 2 - 2, COL.orange, 1, '800 48px Inter'));
  screenPanel(FR.cl, CLP.cx, CLP.cy + 70 * (1 - eo(uc)), CLP.w, CLP.h, eo(uc), 1, 0.5, 0.5, lerp(0.92, 1, eo(uc)));
  if (uc > 0.9) {
    pCirc(CLP, 676, 300, 806, 344, P(t, CUE.oEff + 0.15, 0.5), css(CLR));
    pBox(CLP, 808, 298, 896, 346, P(t, CUE.oExtra - 0.08, 0.35), COL.orange);
  }
  modelBadge('cl', 40, CLP.cy - CLP.h / 2 - 2, eo(uc), lerp(0.7, 0.82, back(uc)));
  const pe = back(P(t, CUE.oExtra - 0.05, 0.4));
  popIn(880, CLP.cy - CLP.h / 2 - 2, pe, () => pill('extra', 880, CLP.cy - CLP.h / 2 - 2, COL.orange, 1, '800 48px Inter'));
  X.restore();
}
// ================================================================= ELLIPSE : 45 minutes plus tard (Kimi qui travaille, en accéléré)
function ffIcon(x, y, s, col, a = 1) {
  X.save(); X.globalAlpha *= a; X.fillStyle = col; X.translate(x, y); X.scale(s, s);
  [0, 46].forEach(dx => { X.beginPath(); X.moveTo(-46 + dx, -36); X.lineTo(0 + dx, 0); X.lineTo(-46 + dx, 36); X.closePath(); X.fill(); });
  X.restore();
}
function drawSkip(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const u = P(t, CUE.skip0, 0.35);
  if (FR.sh && FR.sh.clip === 'run') {
    X.save(); X.filter = 'brightness(0.65) saturate(0.8)';
    screenPanel(FR.main, 540, 760, 1000, 600, eo(u), 1.05, 0.2, 0.3, lerp(0.95, 1, eo(u)));
    X.filter = 'none'; X.restore();
    // bandes de vitesse
    for (let i = 0; i < 6; i++) { const y = 480 + i * 100 + 20 * Math.sin(i * 3.1), ph = ((t * 2.6 + i * 0.37) % 1); line(1080 * ph - 300, y, 1080 * ph, y, 'rgba(255,255,255,0.18)', 4, eo(u)); }
  }
  ffIcon(560, 760, 1.5 + 0.12 * Math.sin(t * 14), '#ffffff', 0.85 * eo(u));
  // compteur de minutes
  const m = Math.round(45 * eio(P(t, CUE.skip0 + 0.1, CUE.skip45 - CUE.skip0 + 0.25)));
  const lk = back(P(t, CUE.skip45 + 0.25, 0.35));
  X.save(); X.translate(540, 1200); const s = 1 + 0.12 * Math.sin(Math.PI * clamp(lk)); X.scale(s, s);
  txt(m + ' min', 0, 40, '900 150px Inter', m >= 45 ? COL.orange : COL.white, 'center', eo(u));
  X.restore();
  modelBadge('kimi', 40, 410, eo(u), 0.8);
  X.restore();
}
// ================================================================= DÉMOS
const APP = { cx: 540, cy: 862, w: 940, h: 771 };
const APC = { cx: 540, cy: 862, w: 940, h: 814 };
// intro d'un modèle : chrono, grande tuile qui claque, puis l'appli
function modelIntro(k, t, t0, tName, tPanel, chronoLb, tChrono) {
  const a = clamp((t - t0) / 0.2) * (1 - P(t, tPanel - 0.05, 0.25));
  if (a <= 0) return;
  const p = 0.8 * back(P(t, t0, 0.4)) + 0.2 * eo(P(t, tName - 0.08, 0.15));
  X.save(); X.globalAlpha *= a;
  const s = 1 + 0.25 * Math.sin(Math.PI * P(t, tName - 0.05, 0.3));
  popIn(540, 900, p, () => tileGlitch(LOGO[k], 540, 900, 330 * s, 1, MODEL[k].rgb, clamp(1 - (t - tName) / 0.3)));
  txt(MODEL[k].name, 540, 1160, '800 70px Inter', COL.white, 'center', P(t, tName - 0.05, 0.25));
  const cb = back(P(t, tChrono - 0.05, 0.4));
  if (cb > 0) { const w = tw(chronoLb, '800 50px Inter') + 150; popIn(540, 580, cb, () => chrono(chronoLb, 540 + w / 2, 580, 1, 1, t, COL.orange)); }
  X.restore();
}
function appView(Pn, k, t, tPanel, z, fx, fy) {
  const u = P(t, tPanel - 0.05, 0.35);
  screenPanel(FR.main, Pn.cx, Pn.cy + 80 * (1 - eo(u)), Pn.w, Pn.h, eo(u), z, fx, fy, lerp(0.92, 1, eo(u)));
  modelBadge(k, 40, Pn.cy + Pn.h / 2 + 40, eo(u), lerp(0.7, 0.86, back(u)));
}
function aPt(Pn, px, py, z, fx, fy) { return spt(Pn.cx, Pn.cy, Pn.w, Pn.h, z, fx, fy, px, py); }
function aBox(Pn, x1, y1, x2, y2, u, col, a, z, fx, fy) { const [a1, b1] = aPt(Pn, x1, y1, z, fx, fy), [a2, b2] = aPt(Pn, x2, y2, z, fx, fy); hiBox(a1, b1, a2, b2, u, col, a); }
function sparkles(t, t0, a, seed = 0) {
  if (a <= 0) return;
  [[250, 600, 1.1, 0], [830, 650, 0.8, 0.1], [330, 1050, 0.9, 0.2], [700, 540, 0.7, 0.15], [860, 1000, 1.0, 0.25]].forEach(([x, y, s, d], i) =>
    sparkle(x, y, back(P(t, t0 + d, 0.35)) * s * (0.85 + 0.15 * Math.sin(t * 8 + i + seed)), COL.yellow, a));
}
// coordonnées dans la capture affichée (AION : 1472 px -> 940 ; HOULE : 1412 px -> 940)
const KS = 940 / 1472, CS = 940 / 1412;
function drawDemoKimi(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  modelIntro('kimi', t, CUE.k0, CUE.kName, CUE.kPanel, '45 min', CUE.k0 + 0.05);
  if (t >= CUE.kPanel - 0.15 && FR.sh && FR.sh.clip === 'k') {
    let z = 1, fx = 0.5, fy = 0.5;
    if (t >= CUE.kP3 - 0.2 && t < CUE.kVu) { z = 1 + 0.12 * eio(P(t, CUE.kP3 - 0.2, 0.5)); fx = 0.9; fy = 0.55; }
    appView(APP, 'kimi', t, CUE.kPanel, z, fx, fy);
    sparkles(t, CUE.kMagn, P(t, CUE.kMagn - 0.1, 0.3) * (1 - P(t, CUE.kP3 - 0.2, 0.3)));
    if (t >= CUE.kP3 - 0.2 && t < CUE.kVu + 0.3) {
      const [ex, ey] = aPt(APP, 1418 * KS, (816 - 128) * KS, z, fx, fy);
      hiCircle(ex, ey, 64, 46, P(t, CUE.kP3, 0.45), COL.yellow, 1 - P(t, CUE.kVu, 0.3), 7);
    }
    stamp('VIBE CODÉ', 540, 880, t, CUE.kVibe - 0.05, COL.red, '229,72,77', 110, -0.08);
  }
  X.restore();
}
function drawDemoCl(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  modelIntro('cl', t, CUE.c0, CUE.cName, CUE.cPanel, '35 min', CUE.c35);
  if (t >= CUE.cPanel - 0.15 && FR.sh && FR.sh.clip === 'c') {
    let z = 1, fx = 0.5, fy = 0.5;
    if (t >= CUE.sonT0 - 0.2 && t < CUE.sonT1 + 0.2) { z = 1 + 0.1 * eio(P(t, CUE.sonT0 - 0.2, 1.2)) - 0.1 * eio(P(t, CUE.sonT1 - 0.4, 0.5)); fx = 0.45; fy = 0.3; }
    appView(APC, 'cl', t, CUE.cPanel, z, fx, fy);
    sparkles(t, CUE.cOrig, P(t, CUE.cOrig - 0.1, 0.3) * (1 - P(t, CUE.cSon - 0.2, 0.3)), 3);
    // « profiter du son » : haut-parleur qui vibre pendant que l'appli joue
    const sp = back(P(t, CUE.cSon - 0.1, 0.4)) * (1 - P(t, CUE.sonT1 + 0.2, 0.3));
    const wv = t < CUE.sonT0 ? 1 : 0.5 + 0.5 * Math.abs(Math.sin((t - CUE.sonT0) * 5.5));
    popIn(950, 560, sp, () => speaker(950, 560, 0.9, COL.yellow, 0, wv, 1));
    // notes et harmonies
    if (t >= CUE.cNotes - 0.1 && t < CUE.cHarm + 0.1) aBox(APC, (1022 - 34) * CS, (988 - 112) * CS, (1388 - 34) * CS, (1192 - 112) * CS, P(t, CUE.cNotes - 0.05, 0.4), COL.orange, 1, z, fx, fy);
    if (t >= CUE.cHarm - 0.1) aBox(APC, (292 - 34) * CS, (1236 - 112) * CS, (584 - 34) * CS, (1310 - 112) * CS, P(t, CUE.cHarm - 0.05, 0.4), COL.yellow, 1, z, fx, fy);
    const ck = back(P(t, CUE.cGenial - 0.05, 0.4));
    popIn(950, 560, ck, () => { X.save(); X.fillStyle = COL.green; X.shadowColor = css(RGB.green, 0.7); X.shadowBlur = 30; X.beginPath(); X.arc(950, 560, 64, 0, 7); X.fill(); X.restore(); checkIcon(950, 562, 1.8, '#10111a', P(t, CUE.cGenial + 0.05, 0.3), 1, 8); });
  }
  X.restore();
}
// ================================================================= COÛT
function drawCost(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const rows = [['cl', 650, CUE.oCost, CUE.o20, 'Abonnement', '20 € / mois', COL.green], ['kimi', 930, CUE.kCost, CUE.k2, 'OpenRouter', '2,65 $', COL.orange]];
  rows.forEach(([k, y, c1, c2, small, big, col], i) => {
    const u = back(P(t, CUE.cost0 + 0.05 + 0.15 * i, 0.45)); if (u <= 0) return;
    const hl = P(t, c1 - 0.1, 0.3); X.save(); X.globalAlpha *= 0.55 + 0.45 * hl;
    X.save(); X.globalAlpha *= clamp(u); panel(70, y - 115, 940, 230, COL.faint, '#15161e', 34, 3); X.restore();
    popIn(200, y, u, () => drawTile(LOGO[k], 200, y, 160, 1, MODEL[k].rgb));
    txt(small, 330, y - 30, '700 42px Inter', COL.grey, 'left', hl);
    const v = back(P(t, c2 - 0.05, 0.4));
    popIn(330, y + 50, v, () => txt(big, 330, y + 62, '900 96px Inter', col, 'left'));
    X.restore();
  });
  // la vraie facture de la session OpenCode
  const im = IMG.cout, u = back(P(t, CUE.k2 - 0.05, 0.45));
  if (im && u > 0) {
    const w = 1000, h = w * im.height / im.width, cy = 1200;
    X.save(); X.globalAlpha *= clamp(u); X.translate(540, cy); X.scale(lerp(0.85, 1, clamp(u)), lerp(0.85, 1, clamp(u)));
    X.save(); X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 40; rr(-w / 2, -h / 2, w, h, 20); X.clip(); X.drawImage(im, -w / 2, -h / 2, w, h); X.restore();
    X.strokeStyle = 'rgba(255,255,255,.14)'; X.lineWidth = 3; rr(-w / 2, -h / 2, w, h, 20); X.stroke();
    const sx = w / im.width;
    hiCircle(-w / 2 + 1190 * sx, -h / 2 + 165 * sx, 62, 34, P(t, CUE.k2 + 0.2, 0.45), COL.orange, 1, 6);
    X.restore();
  }
  X.restore();
}
// ================================================================= VOTE + VERDICT
function bubble(x, y, w, h, col, a = 1, s = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = '#16171f'; X.strokeStyle = col; X.lineWidth = 6;
  X.beginPath(); X.roundRect(-w / 2, -h / 2, w, h, 40); X.moveTo(-w * 0.18, h / 2 - 2); X.lineTo(-w * 0.28, h / 2 + 50); X.lineTo(-w * 0.02, h / 2 - 2);
  X.fill(); X.stroke(); X.restore();
}
function thumb(im, cx, cy, w, h, a, s, glow) {
  if (!im || a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(cx, cy); X.scale(s, s);
  X.save(); X.shadowColor = glow || 'rgba(0,0,0,.6)'; X.shadowBlur = glow ? 50 : 30; X.fillStyle = '#0b0c12'; rr(-w / 2, -h / 2, w, h, 24); X.fill(); X.restore();
  X.save(); rr(-w / 2, -h / 2, w, h, 24); X.clip();
  const r = Math.max(w / im.width, h / im.height); X.drawImage(im, -im.width * r / 2, -im.height * r / 2, im.width * r, im.height * r); X.restore();
  X.strokeStyle = glow || 'rgba(255,255,255,.18)'; X.lineWidth = glow ? 7 : 3; rr(-w / 2, -h / 2, w, h, 24); X.stroke();
  X.restore();
}
function drawVote(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const bA = back(P(t, CUE.v0 + 0.1, 0.45));
  bubble(540, 560, 300, 150, COL.orange, clamp(bA * 2), bA);
  if (bA > 0) [-70, 0, 70].forEach((dx, i) => glowDot(540 + dx, 560, 16, COL.white, clamp(bA) * (0.5 + 0.5 * Math.abs(Math.sin(t * 4 + i))), 0));
  const win = P(t, CUE.vCl - 0.08, 0.35);
  [['kimi', 290, IMG.thK, 0], ['cl', 790, IMG.thC, 0.15]].forEach(([k, x, im, d]) => {
    const p = back(P(t, CUE.vCom - 0.2 + d, 0.45)); if (p <= 0) return;
    const isW = k === 'cl', s = p * (isW ? 1 + 0.1 * eo(win) : 1 - 0.06 * eo(win)), al = isW ? 1 : 1 - 0.55 * win;
    X.save(); X.globalAlpha *= al;
    thumb(im, x, 900, 440, 380, clamp(p), s, isW && win > 0 ? css(CLR, 0.9 * win) : null);
    modelBadge(k, x - 200, 1160, clamp(p), 0.78, k === 'kimi' ? 'Kimi' : 'Claude');
    X.restore();
  });
  txt('VS', 540, 920, '900 56px Inter', COL.dim, 'center', P(t, CUE.vCom, 0.3) * (1 - win));
  // verdict : Claude
  const ck = back(P(t, CUE.vCl, 0.4));
  popIn(960, 730, ck, () => { X.save(); X.fillStyle = COL.green; X.shadowColor = css(RGB.green, 0.7); X.shadowBlur = 30; X.beginPath(); X.arc(960, 730, 60, 0, 7); X.fill(); X.restore(); checkIcon(960, 732, 1.7, '#10111a', P(t, CUE.vCl + 0.05, 0.3), 1, 8); });
  burst(790, 900, t, CUE.vCl + 0.05, 41, [COL.orange, COL.yellow, '#fff', '#D97757'], 44, 760, 1.0);
  X.restore();
}
// ================================================================= FIN
function drawOutro(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const lp = back(P(t, CUE.outro, 0.5));
  popIn(540, 760, lp, () => { X.save(); X.shadowColor = 'rgba(70,255,140,0.25)'; X.shadowBlur = 40; X.drawImage(IMG.tileLogo, 380, 600, 320, 320); X.restore(); });
  const ab = back(P(t, CUE.outro + 0.25, 0.45));
  const press = Math.sin(Math.PI * P(t, CUE.outro + 0.9, 0.3));
  popIn(540, 1110, ab, () => subscribeBtn(540, 1110, 1, 1, press));
  const cu = eo(P(t, CUE.outro + 0.4, 0.45));
  cursorHand(lerp(900, 640, cu), lerp(1270, 1125, cu), 1.1, clamp(cu * 2));
  burst(540, 1110, t, CUE.outro + 1.0, 71, [COL.orange, COL.yellow, '#fff'], 26, 520, 0.8);
  X.restore();
}
// ================================================================= ORCHESTRATION
let FR = {};
async function prepFrames(t) {
  FR = {};
  const sh = shotAt(t);
  if (sh) { FR.sh = sh; FR.main = await frameImg(sh.clip, srcPos(sh, t)); }
  if (t >= CUE.kEff - 0.3 && t < CUE.skip0 + 0.3) {
    FR.oc = await frameImg('oc', Math.min(2.5, Math.max(0, 1.2 + (t - CUE.kEff))));
    FR.cl = await frameImg('cl', Math.min(2.3, Math.max(0, 0.6 + (t - CUE.oEff))));
  }
}
const IMPACTS = () => [[CUE.hK, 0.6], [CUE.hO, 0.5], [CUE.hGo + 0.1, 0.8], [CUE.kMax, 0.25], [CUE.oExtra, 0.25], [CUE.kName, 0.5], [CUE.kVibe, 0.6], [CUE.cName, 0.8], [CUE.vCl, 0.6]];
function shakeAt(t) {
  let s = 0; IMPACTS().forEach(([ti, k]) => { const d = t - ti; if (d >= 0 && d < 0.3) s = Math.max(s, k * (1 - d / 0.3)); });
  return [Math.sin(t * 90) * 12 * s, Math.cos(t * 70) * 8 * s];
}
async function draw(t) {
  NOW = t;
  await prepFrames(t);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none';
  const org = P(t, CUE.hGo, 0.2) * (1 - P(t, CUE.dayEnd, 0.4)) + P(t, CUE.skip45, 0.2) * (1 - P(t, CUE.kPanel, 0.4));
  const grn = P(t, CUE.cGenial, 0.2) * (1 - P(t, CUE.cost0, 0.4)) + P(t, CUE.vCl, 0.2) * (1 - P(t, CUE.outro, 0.4));
  if (grn > 0.01) background(t, RGB.green, 0.1 * clamp(grn)); else background(t, RGB.orange, 0.12 * clamp(org));
  if (t < CUE.hookEnd + 0.4) hookBg(t);
  const [sx, sy] = shakeAt(t);
  const Z = punch(t, [[CUE.hK, 0.06], [CUE.hGo, 0.05], [CUE.kMax, 0.03], [CUE.oExtra, 0.03], [CUE.skip45 + 0.25, 0.05], [CUE.kVibe, 0.06], [CUE.cName, 0.07], [CUE.cDA, 0.04], [CUE.k2, 0.04], [CUE.vCl, 0.07]]);
  X.save(); X.translate(540 + sx, 900 + sy); X.scale(Z, Z); X.translate(-540, -900);
  const hOut = P(t, CUE.hookEnd - 0.05, 0.3);
  if (t < CUE.hookEnd + 0.3) { X.save(); const z = 1 + 0.4 * eo(hOut); X.translate(540, 900); X.scale(z, z); X.translate(-540, -900); drawHook(t, 1 - hOut); X.restore(); }
  drawDay(t, SC(t, CUE.day, CUE.dayEnd, 0.2, 0.25));
  if (t >= CUE.pr0 - 0.1 && t < CUE.kEff + 0.2) drawPrompt(t, SC(t, CUE.pr0 - 0.1, CUE.kEff + 0.15, 0.2, 0.25));
  if (t >= CUE.kEff - 0.2 && t < CUE.skip0 + 0.2) drawEfforts(t, SC(t, CUE.kEff - 0.2, CUE.skip0 + 0.15, 0.15, 0.25));
  if (t >= CUE.skip0 - 0.1 && t < CUE.k0 + 0.25) drawSkip(t, SC(t, CUE.skip0 - 0.1, CUE.k0 + 0.2, 0.2, 0.25));
  if (t >= CUE.k0 - 0.1 && t < CUE.c0 + 0.1) drawDemoKimi(t, SC(t, CUE.k0 - 0.1, CUE.c0 + 0.1, 0.2, 0.2));
  if (t >= CUE.c0 - 0.1 && t < CUE.cost0 + 0.1) drawDemoCl(t, SC(t, CUE.c0 - 0.1, CUE.cost0 + 0.1, 0.2, 0.2));
  if (t >= CUE.cost0 - 0.1 && t < CUE.v0 + 0.1) drawCost(t, SC(t, CUE.cost0 - 0.05, CUE.v0 + 0.05, 0.25, 0.3));
  if (t >= CUE.v0 - 0.1 && t < CUE.outro + 0.1) drawVote(t, SC(t, CUE.v0 - 0.05, CUE.outro, 0.25, 0.3));
  drawOutro(t, P(t, CUE.outro - 0.05, 0.35));
  flashAt(t, [[CUE.hK, 0.35], [CUE.hGo + 0.05, 0.3], [CUE.hookEnd, 0.2], [CUE.pr0, 0.12], [CUE.skip0, 0.15], [CUE.kName, 0.25], [CUE.kVibe, 0.2], [CUE.cName, 0.35], [CUE.cost0, 0.12], [CUE.vCl, 0.28]]);
  X.restore();
}
async function init(cues) {
  CUE = Object.assign(CUE, cues || {});
  CLIPS = CUE.clips;
  const A = '../../assets/';
  const L = [['kimi', 'kimi.png'], ['ant', 'anthropic.webp'], ['logo', 'Logo principal — vert terminal@1x.png']];
  await Promise.all(L.map(([k, f]) => loadImg(k, A + f)));
  await Promise.all([loadImg('cout', 'img/kimi_cout.png'), loadImg('bgK', 'frames/k/0130.jpg'), loadImg('bgC', 'frames/c/0270.jpg'),
                     loadImg('thK', 'frames/k/0700.jpg'), loadImg('thC', 'frames/c/0900.jpg')]);
  const fonts = ['400 24px Inter', '500 24px Inter', '600 24px Inter', '700 24px Inter', '800 24px Inter', '900 24px Inter'];
  await Promise.all(fonts.map(f => document.fonts.load(f, 'Aéêàç0123≈−°·€$"?%')));
  await document.fonts.ready;
  IMG.tileLogo = tile('logo', 420, 0.0, 0.16, '#0a0e0c');
  const mk = (k, pad = 0.14, bg = '#ffffff', st = null) => { if (IMG[k]) IMG['t_' + k] = tileB(k, 256, pad, 0.22, bg, st); };
  mk('kimi', 0.16, '#0d0d10', 'rgba(255,255,255,0.18)'); mk('ant');
  layoutPrompt();
  return CUE;
}
window.init = init; window.draw = draw;
