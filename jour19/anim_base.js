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
