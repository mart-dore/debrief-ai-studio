// Jour 13 / 365 — « L’histoire de DeepSeek » — Le Débrief IA (sans titres de partie)
// Rendu image par image : draw(t). Repères (CUE) calés sur la voix off par montage.py.
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

// ================================================================= ACCROCHE
function drawHook(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const z = 1 + 0.05 * (1 - eo(t / 0.6));
  X.translate(540, 820); X.scale(z, z); X.translate(-540, -820);
  const cr = eio(P(t, CUE.hPerdu, 0.55)), g = P(t, CUE.hPerdu, 0.1) * (1 - P(t, CUE.hPerdu + 0.15, 0.45));
  const red = clamp(cr * 1.3);
  // titre visible dès t = 0
  X.save(); const sc = 1 + 0.1 * Math.sin(Math.PI * P(t, CUE.hPerdu, 0.3)); X.translate(540, 470); X.scale(sc, sc);
  glitchText('600 milliards $', 0, 0, '800 112px Inter', css(mixc(RGB.white, RGB.red, red)), g);
  X.restore();
  // Nvidia : sa courbe s'effondre
  const gd = P(t, CUE.hDS + 0.05, 0.1) * (1 - P(t, CUE.hDS + 0.15, 0.5));
  const jit = gd > 0.02 ? (hash(Math.floor(t * 30)) - .5) * 34 * gd : 0;
  card('nv', 300 + jit, 655, 0.85, 1, NVG, gd);
  const px = 140, py = 800, pw = 800, ph = 420;
  chartPanel(px, py, pw, ph, css(mixc(RGB.faint, RGB.red, red)));
  stockLine(px + 40, py + 40, pw - 80, ph - 80, 1, cr, 3, mixc(NVG, RGB.red, red));
  shockwave(860, 1150, t, CUE.hPerdu + 0.4, '229,72,77', 420, 0.6);
  pill('en une journée', 540, 1290, COL.red, back(P(t, CUE.hJour - 0.1, 0.35)));
  // DeepSeek débarque
  const ds = back(P(t, CUE.hDS - 0.05, 0.4));
  if (ds > 0) popIn(780, 655, ds, () => drawTile('t_ds', 780, 655, 220, 1, DSB));
  shockwave(780, 655, t, CUE.hDS + 0.12, '77,107,254', 460, 0.6);
  burst(780, 655, t, CUE.hDS + 0.12, 11, ['#4d6bfe', '#ffffff', '#8aa0ff'], 34, 620, 0.9);
  X.restore();
}

// ================================================================= CARTE JOUR 13 / 365
function drawCard(t, A) {
  if (A <= 0) return;
  const u = t - CUE.card;
  X.save(); X.globalAlpha *= A;
  txt('JOUR', 540, 560, '600 40px Inter', COL.grey, 'center', eo(u / 0.3), 4);
  const s = back(u / 0.45);
  const fN = '800 220px Inter', fD = '700 88px Inter', wn = tw('13', fN), wd = tw(' / 365', fD), x0 = (W - wn - wd) / 2;
  X.save(); X.translate(x0 + wn / 2, 760); X.scale(s, s); txt('13', 0, 0, fN, COL.orange, 'center', clamp(s)); X.restore();
  txt(' / 365', x0 + wn, 760, fD, COL.white, 'left', eo((u - 0.15) / 0.35));
  X.fillStyle = COL.orange; const lu = eo((u - 0.3) / 0.4); X.fillRect(540 - 170 * lu, 800, 340 * lu, 5);
  const cols = 25, sp = 27, gx = 540 - (cols - 1) * sp / 2, gy = 880;
  for (let i = 0; i < 365; i++) {
    const c = i % cols, r = Math.floor(i / cols), ap = P(u, 0.2 + (c + r) * 0.012, 0.2);
    if (ap <= 0) continue;
    const x = gx + c * sp, y = gy + r * sp;
    if (i < 12) glowDot(x, y, 6, COL.orange, ap * 0.6, 6);
    else if (i === 12) glowDot(x, y, 8 * (1 + 0.25 * Math.sin(u * 8)), COL.orange, ap, 22);
    else { X.fillStyle = `rgba(94,97,109,${0.55 * ap})`; X.beginPath(); X.arc(x, y, 4, 0, 7); X.fill(); }
  }
  X.restore();
  shockwave(540, 700, t, CUE.card + 0.3, '240,110,45', 520, 0.6);
}

// ================================================================= INTRO : UN FONDS DE < 200 PERSONNES CONTRE UN GÉANT
function drawIntro(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  pill('Fonds spéculatif', 540, 500, COL.cyan, back(P(t, CUE.fonds - 0.1, 0.35)), '700 46px Inter');
  // l'équipe : petite grille de silhouettes
  const cols = 6, rows = 5, sp = 56, gx = 290 - (cols - 1) * sp / 2, gy = 650;
  const lit = P(t, CUE.p200 - 0.1, 0.4);
  for (let i = 0; i < cols * rows; i++) {
    const c = i % cols, r = Math.floor(i / cols), s = back(P(t, CUE.s0 + 0.05 + (c + r) * 0.03, 0.3));
    person(gx + c * sp, gy + r * sp, 0.82 * s, css(mixc(RGB.dim, RGB.white, clamp(lit * 1.4 - (c + r) * 0.05))), 1);
  }
  const la = back(P(t, CUE.p200 - 0.05, 0.4));
  popIn(290, 1010, la, () => { txt('< 200', 290, 1040, '800 108px Inter', COL.orange, 'center'); txt('personnes', 290, 1100, '600 44px Inter', COL.grey, 'center'); });
  // le géant : Nvidia qui tremble
  const na = back(P(t, CUE.trembler - 0.25, 0.4));
  const amp = P(t, CUE.trembler - 0.05, 0.1) * (1 - P(t, CUE.trembler + 1.0, 0.9));
  const big = lerp(1.0, 1.22, eo(P(t, CUE.geant - 0.1, 0.5)));
  const jx = Math.sin(t * 83) * 16 * amp, jy = Math.cos(t * 71) * 9 * amp;
  popIn(785, 820, na, () => card('nv', 785 + jx, 820 + jy, big, 1, NVG, amp * 0.5));
  cracks(785, 820, t, CUE.trembler, 7);
  shockwave(785, 820, t, CUE.trembler, '118,185,0', 380, 0.55);
  X.restore();
}

// ================================================================= 1 · LE FONDS
function drawP1(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  // A : Liang Wenfeng → High-Flyer (2015), un fonds qui trade avec l'IA
  const aA = 1 - P(t, CUE.sB - 0.2, 0.3);
  if (aA > 0) {
    X.save(); X.globalAlpha *= aA;
    const av = back(P(t, CUE.liang - 0.4, 0.45));
    popIn(540, 600, av, () => avatar(540, 600, 95, 1, COL.orange, eo(P(t, CUE.liang - 0.2, 0.7))));
    txt('Liang Wenfeng', 540, 768, '800 58px Inter', COL.white, 'center', eo(P(t, CUE.liang - 0.15, 0.3)));
    pill('2015', 540, 850, COL.orange, back(P(t, CUE.y2015 - 0.05, 0.35)), '800 44px Inter');
    const hc = back(P(t, CUE.hf - 0.08, 0.4));
    if (hc > 0) popIn(540, 1110, hc, () => {
      const x = 190, y = 920, w = 700, h = 390;
      panel(x, y, w, h, COL.cyan, COL.panel, 26, 4);
      txt('High-Flyer', x + 40, y + 74, '800 52px Inter', COL.white);
      const cu = eo(P(t, CUE.trader - 0.2, 1.0));
      if (cu > 0) stockLine(x + 40, y + 120, w - 80, h - 150, cu, 0, 7, RGB.green, 1, 6);
      const ia = back(P(t, CUE.ia - 0.15, 0.35));
      popIn(x + w - 70, y + 60, ia, () => iaNode(x + w - 70, y + 60, 34, 1, eo(P(t, CUE.trader, 0.4))));
    });
    X.restore();
  }
  // B : des milliers de cartes graphiques Nvidia, 10 000 A100, puis la restriction
  const aB = W8(t, CUE.sB, CUE.sC);
  if (aB > 0) {
    X.save(); X.globalAlpha *= aB;
    const nv = back(P(t, CUE.nvidia - 0.2, 0.4));
    popIn(540, 548, nv, () => card('nv', 540, 548, 0.62, 1, NVG));
    const cols = 12, rows = 7, sp = 64, gx = 540 - (cols - 1) * sp / 2, gy = 690;
    const fill = eio(P(t, CUE.milliers - 0.35, Math.max(0.5, CUE.a100 - CUE.milliers + 0.35)));
    const stop = P(t, CUE.restr, 0.25);
    for (let i = 0; i < cols * rows; i++) {
      const c = i % cols, r = Math.floor(i / cols), k = (r * cols + c) / (cols * rows);
      const ap = clamp((fill * 1.12 - k) * 9); if (ap <= 0) continue;
      chipMini(gx + c * sp, gy + r * sp, 0.95 * back(ap), mixc(NVG, RGB.dim, stop * 0.7), 1);
    }
    const na = back(P(t, CUE.a100 - 0.15, 0.4));
    popIn(540, 1205, na, () => txt2('10 000', ' A100', 1240, '800 104px Inter', '800 104px Inter', COL.orange, COL.white));
    const ba = P(t, CUE.restr - 0.12, 0.22);
    barrier(540, lerp(480, 850, eo(ba)), 1040, -0.1, clamp(ba * 3));
    if (t >= CUE.restr) stamp('RESTRICTION', 540, 990, t, CUE.restr + 0.05, COL.red, '229,72,77', 62, -0.06);
    X.restore();
  }
  // C : 2023, DeepSeek, financé par High-Flyer
  const aC = W8(t, CUE.sC, CUE.s2 + 0.3);
  if (aC > 0) {
    X.save(); X.globalAlpha *= aC;
    pill('2023', 540, 560, COL.orange, back(P(t, CUE.y2023 - 0.1, 0.35)), '800 44px Inter');
    const hb = back(P(t, CUE.sC + 0.05, 0.4)), hl = Math.sin(Math.PI * P(t, CUE.propres - 0.1, 0.6));
    popIn(270, 860, hb, () => {
      panel(110, 780, 320, 160, css(mixc(RGB.cyan, RGB.yellow, hl)), COL.panel, 22, 4 + 3 * hl);
      txt('High-Flyer', 270, 877, '800 46px Inter', COL.white, 'center');
    });
    const ds = back(P(t, CUE.dsLaunch - 0.15, 0.45));
    popIn(810, 860, ds, () => drawTile('t_ds', 810, 860, 240, 1, DSB));
    shockwave(810, 860, t, CUE.dsLaunch + 0.12, '77,107,254', 360, 0.55);
    burst(810, 860, t, CUE.dsLaunch + 0.12, 21, ['#4d6bfe', '#ffffff'], 22, 460, 0.7);
    const fu = eo(P(t, CUE.finance - 0.15, 0.45));
    arrow(450, 860, 668, 860, COL.yellow, fu, 1, 6);
    if (t > CUE.finance) for (let k = 0; k < 4; k++) {
      const ph = ((t - CUE.finance) * 0.8 + k / 4) % 1, ca = Math.sin(Math.PI * ph) * clamp((t - CUE.finance) * 3);
      coin(lerp(460, 650, ph), 860 - 90 * Math.sin(Math.PI * ph), 0.42, ca, '$');
    }
    X.restore();
  }
  X.restore();
}

// ================================================================= 2 · LE CHOC
const RANK_Y = [650, 830, 1010];
function drawP2(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  // A : 20 janvier 2025, R1, poids ouverts
  const aA = 1 - P(t, CUE.app - 0.25, 0.3);
  if (aA > 0) {
    X.save(); X.globalAlpha *= aA;
    cracks(540, 820, t, CUE.seisme, 13);
    shockwave(540, 820, t, CUE.seisme, '240,110,45', 620, 0.7);
    const cal = back(P(t, CUE.date20 - 0.25, 0.45)), mv = eio(P(t, CUE.r1 - 0.35, 0.5));
    const cx = lerp(540, 250, mv), cy = lerp(760, 590, mv), cs = lerp(1.15, 0.62, mv);
    popIn(cx, cy, cal, () => calendar2(cx, cy, cs, 1, '20', 'JANV. 2025'));
    const r = back(P(t, CUE.r1 - 0.2, 0.4));
    popIn(520, 830, r, () => { drawTile('t_ds', 400, 830, 190, 1, DSB); txt('R1', 600, 884, '800 150px Inter', COL.cyan, 'left'); });
    const wf = back(P(t, CUE.raison - 0.1, 0.4));
    popIn(470, 1140, wf, () => weightsFile(470, 1140, 1.15, 1, P(t, CUE.ouverts - 0.05, 0.35)));
    burst(695, 1094, t, CUE.ouverts + 0.2, 31, [COL.green, '#ffffff'], 22, 420, 0.7);
    X.restore();
  }
  // B : l'application passe n°1 aux États-Unis
  const aB = W8(t, CUE.app - 0.1, CUE.j27 - 0.05);
  if (aB > 0) {
    X.save(); X.globalAlpha *= aB;
    const up = eio(P(t, CUE.n1 - 0.35, 0.6));
    const slot = [lerp(0, 1, up), lerp(1, 2, up), lerp(2, 0, up)];
    [0, 1, 2].forEach(i => txt(String(i + 1), 150, RANK_Y[i] + 20, '800 60px Inter', i === 0 ? COL.orange : COL.dim, 'center', back(P(t, CUE.app - 0.2 + i * 0.06, 0.35)) > 0 ? 1 : 0));
    [0, 1, 2].forEach(k => {
      const s = back(P(t, CUE.app - 0.2 + k * 0.08, 0.35)); if (s <= 0) return;
      const y = lerp(RANK_Y[0], RANK_Y[1], clamp(slot[k])) + (slot[k] > 1 ? (RANK_Y[2] - RANK_Y[1]) * (slot[k] - 1) : 0);
      const ds = k === 2, x0 = ds ? 18 * Math.sin(Math.PI * up) : 0;
      popIn(540, y, s, () => {
        X.save(); X.translate(x0, 0);
        panel(210, y - 70, 680, 140, ds ? css(DSB) : COL.faint, COL.panel, 26, ds ? 5 : 2);
        if (ds) drawTile('t_ds', 296, y, 100); else { X.fillStyle = '#2a2c38'; rr(246, y - 50, 100, 100, 22); X.fill(); }
        X.fillStyle = ds ? css(DSB, 0.9) : '#2e303c'; rr(380, y - 30, ds ? 280 : 280 - k * 50, 20, 10); X.fill();
        X.fillStyle = '#2a2c38'; rr(380, y + 10, 200, 16, 8); X.fill();
        X.restore();
      });
    });
    pill('n°1', 800, RANK_Y[0], COL.orange, back(P(t, CUE.n1 + 0.2, 0.35)), '800 46px Inter', COL.panel2);
    shockwave(540, RANK_Y[0], t, CUE.n1 + 0.25, '240,110,45', 460, 0.55);
    burst(800, RANK_Y[0], t, CUE.n1 + 0.25, 41, [COL.orange, COL.yellow, '#fff'], 26, 520, 0.8);
    X.restore();
  }
  // C : 27 janvier, Nvidia perd ~600 milliards $ en une séance, record
  const aC = W8(t, CUE.j27 - 0.05, CUE.sSix);
  if (aC > 0) {
    X.save(); X.globalAlpha *= aC;
    const cal = back(P(t, CUE.j27 - 0.3, 0.4));
    popIn(250, 590, cal, () => calendar2(250, 590, 0.62, 1, '27', 'JANV. 2025'));
    const cr = eio(P(t, CUE.nvPerd + 0.1, 0.8)), red = clamp(cr * 1.3);
    const gl = P(t, CUE.nvPerd + 0.25, 0.1) * (1 - P(t, CUE.nvPerd + 0.35, 0.5));
    const nv = back(P(t, CUE.nvPerd - 0.3, 0.4));
    popIn(770, 590, nv, () => card('nv', 770, 590, 0.75, 1, NVG, gl));
    const px = 140, py = 720, pw = 800, ph = 400;
    chartPanel(px, py, pw, ph, css(mixc(RGB.faint, RGB.red, red)), eo(P(t, CUE.j27 - 0.1, 0.3)));
    stockLine(px + 40, py + 40, pw - 80, ph - 80, eo(P(t, CUE.j27, 0.7)), cr, 5, mixc(NVG, RGB.red, red));
    const v = Math.round(lerp(0, 600, eio(P(t, CUE.md600 - 0.15, 0.8))));
    txt('−' + v + ' milliards $', 540, 1262, '800 88px Inter', COL.red, 'center', eo(P(t, CUE.md600 - 0.2, 0.25)));
    if (t >= CUE.record - 0.05) stamp('RECORD', 560, 925, t, CUE.record - 0.05, COL.red, '229,72,77', 120, -0.08);
    X.restore();
  }
  // D : « seulement 6 millions de dollars », très débattu
  const aD = W8(t, CUE.sSix, CUE.s3 + 0.3);
  if (aD > 0) {
    X.save(); X.globalAlpha *= aD;
    const ds = back(P(t, CUE.sSix + 0.05, 0.4));
    popIn(540, 610, ds, () => drawTile('t_ds', 540, 610, 190, 1, DSB));
    // barre d'entraînement
    const ea = eo(P(t, CUE.entr - 0.25, 0.3)), ef = eio(P(t, CUE.entr - 0.1, 1.2));
    if (ea > 0) {
      X.save(); X.globalAlpha *= ea;
      X.fillStyle = COL.panel2; rr(240, 778, 600, 34, 17); X.fill();
      X.fillStyle = COL.cyan; X.shadowColor = COL.cyan; X.shadowBlur = 16; rr(240, 778, 600 * ef, 34, 17); X.fill();
      X.restore();
    }
    const db = P(t, CUE.debat - 0.05, 0.15), shake = db * (1 - P(t, CUE.debat + 0.6, 0.6));
    const sixA = back(P(t, CUE.sixM - 0.2, 0.4));
    const n = Math.round(lerp(0, 6, eio(P(t, CUE.sixM - 0.2, 0.5))));
    const col = css(mixc(RGB.green, RGB.yellow, db));
    const jx = Math.sin(t * 70) * 14 * shake, rot = Math.sin(t * 40) * 0.03 * shake;
    const pr = Math.sin(Math.PI * P(t, CUE.preced - 0.1, 0.7));
    popIn(540, 990, sixA * (1 + 0.06 * pr), () => {
      X.save(); X.translate(540 + jx, 990); X.rotate(rot); X.translate(-540, -990);
      if (pr > 0) glowDot(540, 990, 220, css(RGB.yellow, 0.08 * pr), 1, 120);
      txt(n + ' millions $', 540, 1035, '800 124px Inter', col, 'center');
      X.restore();
    });
    sparkle(250, 900, eo(P(t, CUE.preced, 0.3)) * (1 - P(t, CUE.preced + 0.8, 0.4)), COL.yellow);
    sparkle(850, 1080, eo(P(t, CUE.preced + 0.1, 0.3)) * (1 - P(t, CUE.preced + 0.9, 0.4)) * 0.8, COL.yellow);
    if (t >= CUE.debat) {
      stamp('DÉBATTU', 600, 1210, t, CUE.debat + 0.05, COL.yellow, '242,201,76', 66, -0.1);
      [[140, 790, 0], [950, 820, 0.15], [190, 1250, 0.3]].forEach(([x, y, d], i) => {
        const q = back(P(t, CUE.debat + d, 0.35)); if (q <= 0) return;
        popIn(x, y, q, () => txt('?', x, y + 30 + Math.sin(t * 3 + i) * 8, '800 96px Inter', COL.yellow, 'center', 0.85));
      });
    }
    X.restore();
  }
  X.restore();
}

// ================================================================= 3 · À RETENIR
const INV = [[170, 560], [910, 560], [170, 1050], [910, 1050]];
const DSC = [540, 805];
function drawP3(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  // A : DeepSeek change d'échelle, investisseurs extérieurs, 7 Md$, fonds d'État, 50 Md$
  const aA = 1 - P(t, CUE.fondateur - 0.35, 0.35);
  if (aA > 0) {
    X.save(); X.globalAlpha *= aA;
    const grow = eo(P(t, CUE.echelle - 0.15, 0.5));
    INV.forEach(([x, y], i) => {
      const s = back(P(t, CUE.ext - 0.45 + i * 0.08, 0.35)); if (s <= 0) return;
      const st = i === 1 ? P(t, CUE.etat - 0.1, 0.3) : 0, col = css(mixc(RGB.grey, RGB.red, st));
      const au = eo(P(t, CUE.ext - 0.1 + i * 0.08, 0.4));
      const ex = lerp(x, DSC[0], 0.6), ey = lerp(y, DSC[1], 0.6);
      arrow(lerp(x, DSC[0], 0.2), lerp(y, DSC[1], 0.2), ex, ey, st > 0.5 ? COL.red : COL.yellow, au, 0.9, 6);
      popIn(x, y, s, () => bankIcon(x, y, 1, col, 1, st > 0.5 ? COL.red : COL.faint));
      if (t > CUE.md7 - 0.1) for (let k = 0; k < 2; k++) {
        const ph = ((t - CUE.md7) * 0.7 + k / 2 + i * 0.13) % 1, ca = Math.sin(Math.PI * ph) * clamp((t - CUE.md7 + 0.1) * 3);
        coin(lerp(lerp(x, DSC[0], 0.2), ex, ph), lerp(lerp(y, DSC[1], 0.2), ey, ph), 0.34, ca, '$');
      }
    });
    pill("Fonds d'État", 800, 680, COL.red, back(P(t, CUE.etat - 0.05, 0.35)), '700 40px Inter');
    const ds = back(P(t, CUE.s3 + 0.05, 0.4)), sz = lerp(170, 260, grow);
    popIn(DSC[0], DSC[1], ds, () => drawTile('t_ds', DSC[0], DSC[1], sz, 1, DSB));
    shockwave(DSC[0], DSC[1], t, CUE.echelle + 0.2, '77,107,254', 420, 0.6);
    // compteurs
    const r1 = eo(P(t, CUE.md7 - 0.2, 0.3)), v7 = Math.round(lerp(0, 7, eio(P(t, CUE.md7 - 0.2, 0.5))));
    if (r1 > 0) { txt('Levée', 150, 1205, '600 44px Inter', COL.grey, 'left', r1); txt('≈ ' + v7 + ' milliards $', 930, 1208, '800 64px Inter', COL.orange, 'right', r1); }
    const r2 = eo(P(t, CUE.valo - 0.2, 0.3)), v50 = Math.round(lerp(0, 50, eio(P(t, CUE.md50 - 0.25, 0.6))));
    if (r2 > 0) { txt('Valorisation', 150, 1305, '600 44px Inter', COL.grey, 'left', r2); txt(v50 + ' milliards $', 930, 1308, '800 64px Inter', COL.cyan, 'right', r2); }
    X.restore();
  }
  // B : le fondateur garde la main et veut continuer à publier en ouvert
  const aB = W8(t, CUE.fondateur - 0.25, CUE.outro);
  if (aB > 0) {
    X.save(); X.globalAlpha *= aB;
    const zz = 1 + 0.04 * eo(P(t, CUE.chine - 0.2, 0.8));
    X.translate(540, 820); X.scale(zz, zz); X.translate(-540, -820);
    const av = back(P(t, CUE.fondateur - 0.25, 0.45)), ring = eo(P(t, CUE.main - 0.35, 0.55));
    popIn(540, 690, av, () => avatar(540, 690, 130, 1, COL.orange, ring));
    txt('Liang Wenfeng', 540, 905, '800 54px Inter', COL.white, 'center', eo(P(t, CUE.fondateur - 0.1, 0.3)));
    [[220, 600], [860, 600], [220, 840], [860, 840]].forEach(([x, y], i) => {
      const s = back(P(t, CUE.fondateur - 0.1 + i * 0.05, 0.35)), push = 26 * eo(P(t, CUE.main, 0.35));
      const dx = x < 540 ? -push : push;
      popIn(x + dx, y, s * 0.72, () => bankIcon(x + dx, y, 1, i === 1 ? COL.red : COL.grey, 0.75, i === 1 ? COL.red : COL.faint));
    });
    shockwave(540, 690, t, CUE.main + 0.15, '240,110,45', 360, 0.55);
    const wf = back(P(t, CUE.publier - 0.2, 0.4));
    popIn(470, 1150, wf, () => weightsFile(470, 1150, 1.15, 1, P(t, CUE.ouverte - 0.05, 0.35)));
    burst(695, 1104, t, CUE.ouverte + 0.2, 61, [COL.green, '#ffffff'], 24, 440, 0.75);
    shockwave(540, 820, t, CUE.chine, '240,110,45', 560, 0.7);
    X.restore();
  }
  X.restore();
}

// ================================================================= FIN
function drawOutro(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const lp = back(P(t, CUE.outro, 0.5));
  popIn(540, 600, lp, () => { X.save(); X.shadowColor = 'rgba(70,255,140,0.25)'; X.shadowBlur = 40; X.drawImage(IMG.tileLogo, 380, 440, 320, 320); X.restore(); });
  const ab = back(P(t, CUE.outro + 0.25, 0.45));
  if (ab > 0) {
    const press = Math.sin(Math.PI * P(t, CUE.abo + 0.15, 0.3)), pulse = 1 + 0.08 * Math.sin(Math.PI * P(t, CUE.abo - 0.05, 0.35));
    popIn(540, 960, ab * pulse, () => subscribeBtn(540, 960, 1, 1, press));
    const cu = eo(P(t, CUE.abo - 0.4, 0.45));
    cursorHand(lerp(900, 640, cu), lerp(1120, 975, cu), 1.1, clamp(cu * 2) * (1 - P(t, CUE.abo + 1.0, 0.3)));
    shockwave(540, 960, t, CUE.abo + 0.2, '240,110,45', 320, 0.55);
    burst(540, 960, t, CUE.abo + 0.2, 71, [COL.orange, COL.yellow, '#fff'], 26, 520, 0.8);
  }
  const na = eo(P(t, CUE.next - 0.05, 0.4));
  if (na > 0) {
    X.save(); X.globalAlpha *= na; X.translate(0, 20 * (1 - na));
    txt2('Demain · ', 'Jour 14', 1185, '600 44px Inter', '800 64px Inter', COL.grey, COL.orange);
    for (let i = 0; i < 11; i++) {
      const x = 540 + (i - 5) * 34;
      if (i < 5) glowDot(x, 1245, 6, COL.orange, 0.6, 4);
      else if (i === 5) glowDot(x, 1245, 9 * (1 + 0.25 * Math.sin(t * 8)), COL.orange, 1, 20);
      else { X.fillStyle = 'rgba(94,97,109,.6)'; X.beginPath(); X.arc(x, 1245, 4.5, 0, 7); X.fill(); }
    }
    X.restore();
  }
  X.restore();
}

// ================================================================= ORCHESTRATION
const IMPACTS = () => [[CUE.hPerdu + 0.35, 0.6], [CUE.hDS + 0.12, 0.7], [CUE.trembler, 0.5], [CUE.restr + 0.05, 0.6], [CUE.seisme, 1.0],
  [CUE.n1 + 0.25, 0.3], [CUE.nvPerd + 0.4, 0.7], [CUE.record, 0.8], [CUE.debat, 0.45], [CUE.echelle + 0.2, 0.3], [CUE.etat, 0.3],
  [CUE.main + 0.15, 0.35], [CUE.abo + 0.2, 0.3]];
function shakeAt(t) {
  let s = 0; IMPACTS().forEach(([ti, k]) => { const d = t - ti; if (d >= 0 && d < 0.3) s = Math.max(s, k * (1 - d / 0.3)); });
  return [Math.sin(t * 90) * 10 * s, Math.cos(t * 70) * 7 * s];
}
function draw(t) {
  NOW = t;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  const red1 = t < CUE.hookEnd + 0.3 ? P(t, CUE.hPerdu + 0.2, 0.4) * (1 - P(t, CUE.hookEnd, 0.3)) : 0;
  const red2 = P(t, CUE.nvPerd + 0.3, 0.5) * (1 - P(t, CUE.sSix - 0.3, 0.4));
  const blue = P(t, CUE.s3, 0.5) * (1 - P(t, CUE.fondateur - 0.3, 0.5));
  if (red1 + red2 > 0.01) background(t, RGB.red, 0.14 * Math.max(red1, red2));
  else background(t, DSB, 0.1 * blue);
  const [sx, sy] = shakeAt(t);
  X.save(); X.translate(sx, sy);
  const hOut = P(t, CUE.hookEnd - 0.05, 0.3);
  if (t < CUE.hookEnd + 0.3) { X.save(); const z = 1 + 0.6 * eo(hOut); X.translate(540, 900); X.scale(z, z); X.translate(-540, -900); drawHook(t, 1 - hOut); X.restore(); }
  const fl = Math.max(P(t, CUE.hookEnd - 0.05, 0.1) * (1 - P(t, CUE.hookEnd + 0.05, 0.3)), 0);
  const cardA = W8(t, CUE.card + 0.05, CUE.s0 + 0.1, 0.25);
  if (cardA > 0) { X.save(); const z = lerp(0.92, 1, eo(P(t, CUE.card, 0.4))); X.translate(540, 900); X.scale(z, z); X.translate(-540, -900); drawCard(t, cardA); X.restore(); }
  drawIntro(t, W8(t, CUE.s0 + 0.05, CUE.s1));
  drawP1(t, W8(t, CUE.s1, CUE.s2));
  drawP2(t, W8(t, CUE.s2, CUE.s3));
  drawP3(t, W8(t, CUE.s3, CUE.outro));
  drawOutro(t, P(t, CUE.outro - 0.05, 0.35));
  if (fl > 0) { X.fillStyle = `rgba(255,255,255,${0.28 * fl})`; X.fillRect(-20, -20, W + 40, H + 40); }
  [[CUE.seisme, 0.3], [CUE.record, 0.22], [CUE.hDS + 0.12, 0.18]].forEach(([c, k]) => { const d = t - c; if (d >= 0 && d < 0.25) { X.fillStyle = `rgba(255,255,255,${k * (1 - d / 0.25)})`; X.fillRect(-20, -20, W + 40, H + 40); } });
  X.restore();
}

async function init(cues) {
  CUE = Object.assign(CUE, cues || {});
  const A = '../../assets/';
  await Promise.all([loadImg('ds', A + 'deepseek.png'), loadImg('nvidia', A + 'nvidia.png'), loadImg('logo', A + 'Logo principal — vert terminal@1x.png')]);
  const fonts = ['400 24px Inter', '500 24px Inter', '600 24px Inter', '700 24px Inter', '800 24px Inter'];
  await Promise.all(fonts.map(f => document.fonts.load(f, 'Aéêàç0123≈−°·')));
  await document.fonts.ready;
  IMG.tileLogo = tile('logo', 420, 0.0, 0.16, '#0a0e0c');
  IMG.t_ds = tile('ds', 256, 0.14, 0.22, '#ffffff');
  CARD.nv = mkCard('nvidia', 300, 210, 0.04);
  return CUE;
}
window.init = init; window.draw = draw;
