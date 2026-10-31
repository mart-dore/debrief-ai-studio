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

// ================================================================= JOUR 23 — MISTRAL : Timestral, Voxtral 3, Mistral OCR
// Martin n'aime pas l'onde de choc (petit point qui s'agrandit en cercle) : désactivée.
function shockwave() {}
const SC = (t, a, b, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
function punch(t, list) {
  let z = 0;
  list.forEach(([t0, k, d = 0.45]) => { const u = (t - t0) / d; if (u >= 0 && u < 1) z = Math.max(z, k * Math.sin(Math.PI * Math.min(1, u * 2.2)) * (1 - u) * 1.6); });
  return 1 + z;
}
function flashAt(t, list) { list.forEach(([c, k]) => { const d = t - c; if (d >= 0 && d < 0.22) { X.fillStyle = `rgba(255,255,255,${k * (1 - d / 0.22)})`; X.fillRect(-40, -40, W + 80, H + 80); } }); }
const MIS = [250, 130, 0];            // orange Mistral
const TSC = RGB.orange, VXC = RGB.cyan, OCC = RGB.yellow;
const pop = (t, t0, d = 0.4) => back(P(t, t0, d));

// ---------------------------------------------------------------- icônes du jour
function chartGlyph(x, y, s, col, a = 1, u = 1) {          // courbe + prévision pointillée
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.lineCap = 'round'; X.lineJoin = 'round';
  X.strokeStyle = col; X.lineWidth = 7;
  X.beginPath(); X.moveTo(-60, 46); X.lineTo(-60, -50); X.moveTo(-60, 46); X.lineTo(64, 46); X.stroke();
  const pts = [[-50, 22], [-34, 4], [-20, 14], [-6, -8], [8, 2]];
  X.lineWidth = 8; X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke();
  X.setLineDash([3, 14]); X.lineWidth = 8; X.beginPath(); X.moveTo(8, 2); X.lineTo(26, -18); X.lineTo(52, -30); X.stroke(); X.setLineDash([]);
  X.restore();
}
function waveGlyph(x, y, s, col, a = 1, t = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.fillStyle = col;
  for (let k = 0; k < 9; k++) { const h = 16 + 70 * Math.abs(Math.sin(k * 1.3 + t * 7)) * (1 - Math.abs(k - 4) / 6); rr(-62 + k * 14, -h / 2, 8, h, 4); X.fill(); }
  X.restore();
}
function ocrGlyph(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  docIcon(-38, -50, 76, 100, col, 1);
  X.strokeStyle = col; X.lineWidth = 6; X.lineCap = 'round';
  [[-62, -60, 1, 1], [62, -60, -1, 1], [-62, 60, 1, -1], [62, 60, -1, -1]].forEach(([cx, cy, dx, dy]) => { X.beginPath(); X.moveTo(cx, cy + 20 * dy); X.lineTo(cx, cy); X.lineTo(cx + 20 * dx, cy); X.stroke(); });
  X.restore();
}
function modelCard(x, y, s, rgb, label, glyph, a = 1, on = 1, t = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  const c = css(mixc(RGB.dim, rgb, on));
  X.save(); X.shadowColor = css(rgb, 0.45 * on); X.shadowBlur = 50 * on; X.fillStyle = css(mixc([22, 23, 31], mixc([22, 23, 31], rgb, 0.16), on)); rr(-140, -150, 280, 300, 34); X.fill(); X.restore();
  X.strokeStyle = css(mixc(RGB.faint, rgb, on)); X.lineWidth = 5; rr(-140, -150, 280, 300, 34); X.stroke();
  if (glyph === 'chart') chartGlyph(0, -30, 1.15, c);
  else if (glyph === 'wave') waveGlyph(0, -30, 1.25, c, 1, t);
  else ocrGlyph(0, -30, 1.0, c);
  txt(label, 0, 112, '800 40px Inter', css(mixc(RGB.grey, RGB.white, on)), 'center');
  X.restore();
}
function crown(x, y, s, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.shadowColor = css(GOLD, 0.8); X.shadowBlur = 36; X.fillStyle = COL.yellow;
  X.beginPath(); X.moveTo(-80, 40); X.lineTo(-90, -36); X.lineTo(-42, 4); X.lineTo(0, -56); X.lineTo(42, 4); X.lineTo(90, -36); X.lineTo(80, 40); X.closePath(); X.fill();
  X.shadowBlur = 0; X.fillStyle = '#c99a1d'; rr(-80, 40, 160, 22, 6); X.fill();
  X.restore();
}
function cartIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = 7; X.lineJoin = 'round'; X.lineCap = 'round';
  X.beginPath(); X.moveTo(-48, -34); X.lineTo(-34, -34); X.lineTo(-22, 18); X.lineTo(34, 18); X.lineTo(44, -18); X.lineTo(-28, -18); X.stroke();
  X.fillStyle = col; X.beginPath(); X.arc(-16, 34, 8, 0, 7); X.fill(); X.beginPath(); X.arc(28, 34, 8, 0, 7); X.fill();
  X.restore();
}
function boltIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.fillStyle = col; X.shadowColor = col; X.shadowBlur = 16;
  X.beginPath(); X.moveTo(10, -48); X.lineTo(-30, 8); X.lineTo(-2, 8); X.lineTo(-12, 48); X.lineTo(30, -10); X.lineTo(2, -10); X.closePath(); X.fill();
  X.restore();
}
function sensorIcon(x, y, s, col, a = 1, t = 0) {        // thermomètre / capteur
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.strokeStyle = col; X.lineWidth = 6;
  rr(-12, -46, 24, 70, 12); X.stroke(); X.beginPath(); X.arc(0, 32, 18, 0, 7); X.stroke();
  X.fillStyle = col; X.beginPath(); X.arc(0, 32, 10, 0, 7); X.fill(); const lv = 30 + 18 * Math.sin(t * 3); X.fillRect(-4, 32 - lv, 8, lv);
  X.restore();
}
function candleIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.lineWidth = 4;
  [[-30, 10, 30, COL.red], [0, -8, 34, COL.green], [30, -24, 30, COL.green]].forEach(([cx, cy, h, c]) => {
    X.strokeStyle = c; X.fillStyle = c; X.beginPath(); X.moveTo(cx, cy - h / 2 - 12); X.lineTo(cx, cy + h / 2 + 12); X.stroke(); rr(cx - 9, cy - h / 2, 18, h, 3); X.fill();
  });
  X.restore();
}
function laptopIcon(x, y, s, col, a = 1) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = COL.panel2; X.strokeStyle = col; X.lineWidth = 7; rr(-110, -90, 220, 140, 14); X.fill(); X.stroke();
  X.fillStyle = col; X.beginPath(); X.moveTo(-140, 62); X.lineTo(140, 62); X.lineTo(122, 84); X.lineTo(-122, 84); X.closePath(); X.fill();
  X.restore();
}
function gpuIcon(x, y, s, col, a = 1, t = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = COL.panel2; X.strokeStyle = col; X.lineWidth = 7; rr(-120, -58, 240, 116, 14); X.fill(); X.stroke();
  [-52, 46].forEach(cx => { X.beginPath(); X.arc(cx, 0, 36, 0, 7); X.stroke(); X.save(); X.translate(cx, 0); X.rotate(t * 6); for (let k = 0; k < 5; k++) { X.rotate(1.2566); X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(14, -10, 6, -30); X.stroke(); } X.restore(); });
  X.fillStyle = col; X.fillRect(-90, 58, 120, 14);
  X.restore();
}
function chatBubble(x, y, s, col, a = 1, t = 0) {
  if (a <= 0 || s <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  X.fillStyle = COL.panel2; X.strokeStyle = col; X.lineWidth = 7; rr(-120, -70, 240, 130, 34); X.fill(); X.stroke();
  X.beginPath(); X.moveTo(-60, 58); X.lineTo(-84, 96); X.lineTo(-24, 60); X.fillStyle = COL.panel2; X.fill(); X.stroke();
  for (let k = 0; k < 3; k++) { const b = 0.5 + 0.5 * Math.sin(t * 8 - k * 0.9); X.fillStyle = col; X.globalAlpha = a * (0.4 + 0.6 * b); X.beginPath(); X.arc(-44 + k * 44, -6, 14, 0, 7); X.fill(); }
  X.restore();
}
function bigCross(x, y, s, u, a = 1) {
  if (u <= 0) return;
  X.save(); X.globalAlpha *= a; X.strokeStyle = COL.red; X.lineWidth = 22; X.lineCap = 'round'; X.shadowColor = css(RGB.red, 0.6); X.shadowBlur = 20;
  const k = eo(u * 2), k2 = eo(u * 2 - 1);
  X.beginPath(); X.moveTo(x - s, y - s); X.lineTo(x - s + 2 * s * k, y - s + 2 * s * k); X.stroke();
  if (k2 > 0) { X.beginPath(); X.moveTo(x + s, y - s); X.lineTo(x + s - 2 * s * k2, y - s + 2 * s * k2); X.stroke(); }
  X.restore();
}
function counterTxt(v, x, y, font, col, a = 1, suf = '') { txt(String(v) + suf, x, y, font, col, 'center', a); }
function tileLogo(key, cx, cy, size, a = 1, glow = null) { drawTile(key, cx, cy, size, a, glow); }

// ---------------------------------------------------------------- données réelles : passagers aériens mensuels (milliers), 1949–1960 (série « AirPassengers », Box & Jenkins)
const AIR = [112,118,132,129,121,135,148,148,136,119,104,118, 115,126,141,135,125,149,170,170,158,133,114,140, 145,150,178,163,172,178,199,199,184,162,146,166,
  171,180,193,181,183,218,230,242,209,191,172,194, 196,196,236,235,229,243,264,272,237,211,180,201, 204,188,235,227,234,264,302,293,259,229,203,229,
  242,233,267,269,270,315,364,347,312,274,237,278, 284,277,317,313,318,374,413,405,355,306,271,306, 315,301,356,348,355,422,465,467,404,347,305,336,
  340,318,362,348,363,435,491,505,404,359,310,337, 360,342,406,396,420,472,548,559,463,407,362,405, 417,391,419,461,472,535,622,606,508,461,390,432];
const NH = 120, NF = 24;
// prévision (tendance log-linéaire + saisonnalité mensuelle estimées sur l'historique), avec intervalle qui s'élargit
const FC = (() => {
  const L = AIR.slice(0, NH).map(Math.log), n = NH, xs = [...Array(n).keys()];
  const mx = (n - 1) / 2, my = L.reduce((a, b) => a + b) / n;
  const b = xs.reduce((s, x) => s + (x - mx) * (L[x] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0), a0 = my - b * mx;
  const seas = Array(12).fill(0), cnt = Array(12).fill(0);
  xs.forEach(x => { seas[x % 12] += L[x] - (a0 + b * x); cnt[x % 12]++; });
  for (let m = 0; m < 12; m++) seas[m] /= cnt[m];
  const out = [];
  for (let h = 0; h < NF; h++) { const x = n + h, m = a0 + b * x + seas[x % 12], w = 0.05 + 0.006 * h; out.push([Math.exp(m), Math.exp(m - w), Math.exp(m + w)]); }
  return out;
})();
const CH = { x0: 130, x1: 960, y0: 1210, y1: 790, vmin: 80, vmax: 760 };
const cx_ = i => lerp(CH.x0, CH.x1, i / (NH + NF - 1)), cy_ = v => lerp(CH.y0, CH.y1, (v - CH.vmin) / (CH.vmax - CH.vmin));
function airChart(t, a) {
  if (a <= 0) return;
  X.save(); X.globalAlpha *= a;
  chartPanel(90, 700, 900, 580, css(RGB.faint), 1);
  // axe des temps
  line(CH.x0, CH.y0 + 22, CH.x1, CH.y0 + 22, 'rgba(255,255,255,0.18)', 3);
  [1950, 1952, 1954, 1956, 1958, 1960].forEach(yr => { const i = (yr - 1949) * 12; txt(String(yr), cx_(i), CH.y0 + 58, '600 26px Inter', COL.dim, 'center'); });
  // historique : se dessine au fil de la phrase « séries temporelles … bourse », puis surligné sur « l'historique »
  const u = eo(P(t, CUE.tsSerW - 0.2, Math.max(1.2, CUE.tsHist - CUE.tsSerW)));
  const n = Math.max(2, Math.round(NH * u)), hl = P(t, CUE.tsHist, 0.3);
  const lcol = mixc(RGB.white, RGB.white, 0);
  X.save();
  const g = X.createLinearGradient(0, CH.y1, 0, CH.y0); g.addColorStop(0, css(RGB.white, 0.10 + 0.08 * hl)); g.addColorStop(1, css(RGB.white, 0));
  X.fillStyle = g; X.beginPath(); X.moveTo(cx_(0), CH.y0); for (let i = 0; i < n; i++) X.lineTo(cx_(i), cy_(AIR[i])); X.lineTo(cx_(n - 1), CH.y0); X.closePath(); X.fill();
  X.strokeStyle = css(lcol, 0.85 + 0.15 * hl); X.lineWidth = 5 + 2 * hl; X.lineJoin = 'round'; X.shadowColor = css(RGB.white, 0.5 * hl); X.shadowBlur = 16 * hl;
  X.beginPath(); for (let i = 0; i < n; i++) i ? X.lineTo(cx_(i), cy_(AIR[i])) : X.moveTo(cx_(i), cy_(AIR[i])); X.stroke();
  X.restore();
  glowDot(cx_(n - 1), cy_(AIR[n - 1]), 9, COL.white, 1, 16);
  if (hl > 0) { X.save(); X.globalAlpha *= hl; pill('HISTORIQUE', 380, 800, COL.white, 1, '800 34px Inter'); X.restore(); }
  // « maintenant »
  const xn = cx_(NH - 1), nu = P(t, CUE.tsSuite - 0.15, 0.3);
  if (nu > 0) line(xn, lerp(CH.y0, CH.y1 - 10, eo(nu)), xn, CH.y0, 'rgba(255,255,255,0.35)', 3, 1, [10, 10]);
  // intervalle d'incertitude (« marge d'erreur »)
  const mu = eo(P(t, CUE.tsMarge - 0.1, 0.6)), fu = eo(P(t, CUE.tsSuite, 0.8));
  const nf = Math.max(1, Math.round(NF * fu));
  if (mu > 0) {
    X.save(); X.fillStyle = css(RGB.cyan, 0.26); X.beginPath();
    X.moveTo(xn, cy_(AIR[NH - 1]));
    for (let h = 0; h < NF; h++) { const [m, lo, hi] = FC[h]; X.lineTo(cx_(NH + h), cy_(lerp(m, hi, mu))); }
    for (let h = NF - 1; h >= 0; h--) { const [m, lo, hi] = FC[h]; X.lineTo(cx_(NH + h), cy_(lerp(m, lo, mu))); }
    X.closePath(); X.fill();
    X.strokeStyle = css(RGB.cyan, 0.7); X.lineWidth = 2; X.stroke(); X.restore();
    X.save(); X.globalAlpha *= mu; pill("MARGE D'ERREUR", 720, 1150, COL.cyan, 1, '800 30px Inter'); X.restore();
  }
  // la suite prédite
  if (fu > 0) {
    X.save(); X.strokeStyle = COL.orange; X.lineWidth = 7; X.lineJoin = 'round'; X.lineCap = 'round'; X.shadowColor = css(RGB.orange, 0.8); X.shadowBlur = 22;
    X.beginPath(); X.moveTo(xn, cy_(AIR[NH - 1])); for (let h = 0; h < nf; h++) X.lineTo(cx_(NH + h), cy_(FC[h][0])); X.stroke(); X.restore();
    glowDot(cx_(NH + nf - 1), cy_(FC[nf - 1][0]), 10, COL.orange, 1, 22);
    X.save(); X.globalAlpha *= P(t, CUE.tsSuite, 0.3); pill('PRÉVISION', 820, 800, COL.orange, 1, '800 34px Inter'); X.restore();
  }
  // les vraies valeurs qui tombent dans la marge (données réelles 1959–1960)
  const ru = P(t, CUE.tsMarge + 0.5, 0.9);
  for (let h = 0; h < NF; h++) { const k = clamp(ru * NF - h); if (k <= 0) break; glowDot(cx_(NH + h), cy_(AIR[NH + h]), 6, COL.white, 0.9 * k, 6); }
  X.restore();
}

// ================================================================= ACCROCHE — titre visible dès t = 0
function drawHook(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const g = t < 0.45 ? 0.9 * (1 - t / 0.45) : clamp(1 - Math.abs(t - CUE.hNiv) / 0.2) * 0.7;
  X.save(); X.shadowColor = 'rgba(0,0,0,.7)'; X.shadowBlur = 40;
  glitchText('MISTRAL', 540, 600, '900 178px Inter', COL.white, g);
  txt('CACHE SON JEU', 540, 712, '900 86px Inter', COL.orange, 'center', 1, 4);
  X.restore();
  // 1) Large 4 pointé du doigt
  const p1 = 1 - P(t, CUE.hPense - 0.2, 0.3);
  if (p1 > 0) {
    const s = 1 + 0.05 * Math.sin(t * 2), gl = clamp(1 - Math.abs(t - 0.1) / 0.3);
    X.save(); X.globalAlpha *= p1;
    card('mistral', 540, 1010, s, 1, MIS, gl);
    pill('Mistral Large 4', 540, 1240, COL.white, P(t, 0, 0.2), '800 40px Inter');
    // doigts pointés : flèches qui arrivent de trois côtés
    [[150, 860, 360, 940], [930, 870, 720, 950], [160, 1200, 370, 1100]].forEach(([x1, y1, x2, y2], k) => {
      const u = eo(P(t, CUE.hDoigt + k * 0.14, 0.3)), wob = Math.sin(t * 12 + k) * 6;
      if (u > 0) arrow(x1, y1, lerp(x1, x2, u) + wob, lerp(y1, y2, u), COL.red, 1, u, 9);
    });
    X.restore();
  }
  // 2) « pas au niveau des meilleurs » : classement où Large 4 est en dessous
  const p2 = P(t, CUE.hPense - 0.15, 0.3) * (1 - P(t, CUE.h3 - 0.05, 0.3));
  if (p2 > 0) {
    X.save(); X.globalAlpha *= p2;
    const bars = [['openai', 0.92], ['google', 0.88], ['alibaba', 0.83], ['mistral', 0.83]];
    bars.forEach(([k, h], i) => {
      const x = 225 + i * 210, gu = eo(P(t, CUE.hPense + i * 0.08, 0.5));
      let hh = h;
      if (k === 'mistral') hh = lerp(h, 0.58, eio(P(t, CUE.hNiv, 0.5)));
      const top = 1230 - 400 * hh * gu, col = k === 'mistral' ? RGB.orange : RGB.grey;
      X.fillStyle = css(col, k === 'mistral' ? 0.95 : 0.55); rr(x - 62, top, 124, 1230 - top, 14); X.fill();
      tileLogo('t_' + k, x, top - 70, 104, gu);
    });
    const du = P(t, CUE.hNiv + 0.1, 0.3);
    if (du > 0) { X.save(); X.globalAlpha *= du; arrow(968, 880, 968, 1000 + 20 * Math.sin(t * 8), COL.red, 1, 1, 12); X.restore(); }
    X.restore();
  }
  // 3) « pendant ce temps-là » : trois modèles spécialisés
  const p3 = P(t, CUE.h3 - 0.05, 0.3);
  if (p3 > 0) {
    X.save(); X.globalAlpha *= p3;
    tileLogo('t_mistral', 540, 900, 125 * pop(t, CUE.hMis - 0.1), 1, MIS);
    const items = [[TSC, 'Timestral', 'chart'], [VXC, 'Voxtral', 'wave'], [OCC, 'OCR', 'ocr']];
    const mon = P(t, CUE.hMonde, 0.4);
    items.forEach(([rgb, lb, gl], i) => modelCard(205 + i * 335, 1150, 0.92 * pop(t, CUE.hTrois + i * 0.18), rgb, lb, gl, 1, 0.55 + 0.45 * mon, t));
    if (mon > 0) { crown(540, 800, 0.55 * back(mon), 1); [[150, 990], [930, 990], [540, 1340]].forEach(([x, y], k) => sparkle(x, y, 0.8 * back(P(t, CUE.hMonde + 0.1 * k, 0.4)), COL.yellow, 1)); }
    X.restore();
  }
  X.restore();
}
// ================================================================= CARTE JOUR 23 / 365
function drawDay(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const u = t - CUE.day, s = back(u / 0.4), N = 23;
  const n = Math.max(1, Math.min(N, Math.round(N * eo(P(t, CUE.day + 0.05, 0.55)))));
  txt('JOUR', 540, 700, '800 64px Inter', COL.grey, 'center', clamp(u / 0.25), 14);
  popIn(540, 850, s, () => txt(String(n), 540, 930, '900 250px Inter', COL.orange, 'center'));
  txt('/ 365', 540, 1060, '700 76px Inter', COL.white, 'center', P(t, CUE.dayN - 0.1, 0.3));
  for (let i = 0; i < N; i++) { const on = i < n; glowDot(540 - (N - 1) / 2 * 34 + i * 34, 1160, on ? 9 : 6, on ? COL.orange : COL.faint, clamp(u / 0.3), on ? 12 : 0); }
  X.restore();
}
// ================================================================= TIMESTRAL
function drawTS1(t, A) {           // nom, date, « pas un modèle de langage »
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const s = pop(t, CUE.ts + 0.1);
  modelCard(540, 720, 1.05 * s, TSC, 'Timestral', 'chart', 1, 1, t);
  tileLogo('t_mistral', 690, 590, 84 * s, 1);
  const c1 = SC(t, CUE.tsCal - 0.05, CUE.tsLLM + 0.1, 0.2, 0.2);
  calendar2(540, 1130, 0.85 * pop(t, CUE.tsCal - 0.05), c1, '15', 'OCT. 2026');
  const c2 = P(t, CUE.tsLLM, 0.25);
  if (c2 > 0) { chatBubble(540, 1120, pop(t, CUE.tsLLM), COL.grey, c2, t); bigCross(540, 1130, 130, P(t, CUE.tsLLMx, 0.35)); }
  X.restore();
}
function drawTS2(t, A) {           // la courbe : historique → suite → marge d'erreur
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const icA = 1 - P(t, CUE.tsHist - 0.25, 0.3);
  const ics = [[CUE.icV, 'vente', (x, y, c, a) => cartIcon(x, y, 0.9, c, a)], [CUE.icC, 'conso', (x, y, c, a) => boltIcon(x, y, 0.85, c, a)],
               [CUE.icS, 'capteurs', (x, y, c, a) => sensorIcon(x, y, 0.85, c, a, t)], [CUE.icB, 'bourse', (x, y, c, a) => candleIcon(x, y, 0.95, c, a)]];
  if (icA > 0) ics.forEach(([t0, lb, fn], i) => {
    const x = 175 + i * 243, s = pop(t, t0 - 0.05), y = 560;
    if (s <= 0) return;
    popIn(x, y, s, () => { X.save(); X.globalAlpha *= icA; X.fillStyle = 'rgba(22,23,31,0.92)'; rr(x - 105, y - 95, 210, 190, 26); X.fill(); X.strokeStyle = COL.orange; X.lineWidth = 4; rr(x - 105, y - 95, 210, 190, 26); X.stroke();
      fn(x, y - 22, COL.orange, 1); txt(lb, x, y + 68, '700 34px Inter', COL.white, 'center'); X.restore(); });
  });
  airChart(t, P(t, CUE.tsSer, 0.3));
  X.restore();
}
function drawTS3(t, A) {           // 209 millions de paramètres, tourne sur n'importe quel PC
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  modelCard(540, 600, 0.62 * pop(t, CUE.tsFou + 0.05), TSC, 'Timestral', 'chart', 1, 1, t);
  const cu = eo(P(t, CUE.ts209 - 0.05, 0.7)), v = Math.round(209 * cu);
  popIn(540, 830, pop(t, CUE.ts209 - 0.08, 0.35), () => {
    X.save(); X.shadowColor = css(RGB.orange, 0.6); X.shadowBlur = 40; txt(v + ' M', 540, 890, '900 190px Inter', COL.orange, 'center'); X.restore();
  });
  txt('paramètres', 540, 970, '700 52px Inter', COL.white, 'center', P(t, CUE.tsPar - 0.1, 0.3));
  const pc = pop(t, CUE.tsPC - 0.05);
  if (pc > 0) { laptopIcon(330, 1170, pc, COL.green, 1); chipMini(330, 1155, 1.6 * pc, RGB.green, 1); }
  const gu = P(t, CUE.tsGPU - 0.05, 0.3);
  if (gu > 0) {
    gpuIcon(760, 1160, 0.95 * pop(t, CUE.tsGPU - 0.05), COL.grey, 1, t);
    const on = Math.floor((t - CUE.tsGPU) / 0.45) % 2 === 0;    // « avec ou sans » : bascule ✓ / ✗
    if (on) checkIcon(760, 1290, 1.1, COL.green, 1, gu); else crossIcon(760, 1290, 0.9, COL.red, gu);
  }
  X.restore();
}
function drawTS4(t, A) {           // open weight → téléchargeable
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const s = pop(t, CUE.tsOW - 0.05);
  padlock(540, 760, 2.4 * s, P(t, CUE.tsOWo, 0.4), COL.green, 1);
  pill('OPEN WEIGHT', 540, 980, COL.green, P(t, CUE.tsOWo, 0.3), '800 52px Inter');
  const du = P(t, CUE.tsDL - 0.05, 0.3);
  if (du > 0) {
    tileLogo('t_huggingface', 380, 1180, 150 * pop(t, CUE.tsDL - 0.05), 1);
    const k = (t - CUE.tsDL) % 1.1 / 1.1;
    downloadIcon(680, 1170 + 30 * eio(k), 1.5 * pop(t, CUE.tsDL), COL.green, du);
  }
  X.restore();
}
// ================================================================= VOXTRAL
const LANGS = ['Bonjour', 'Hello', 'Hola', 'Привет', 'Ciao', 'Hallo', 'Olá', 'Γειά', 'Merhaba', 'Cześć'];
function drawVX1(t, A) {           // nom, transcrire l'audio dans toutes les langues
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const s = pop(t, CUE.vx + 0.1);
  modelCard(540, 640, 1.0 * s, VXC, 'Voxtral', 'wave', 1, 1, t);
  tileLogo('t_mistral', 685, 515, 80 * s, 1);
  const wu = P(t, CUE.vxTr - 0.2, 0.4);
  if (wu > 0) {
    X.save(); X.globalAlpha *= wu;
    for (let k = 0; k < 40; k++) { const x = 120 + k * 21.5, h = 20 + 120 * Math.abs(Math.sin(k * 0.7 + t * 9)) * Math.abs(Math.sin(k * 0.23 + t * 1.3)); X.fillStyle = css(RGB.cyan, 0.85); rr(x - 6, 1020 - h / 2, 12, h, 6); X.fill(); }
    X.restore();
    const lu = P(t, CUE.vxLang - 0.1, 0.2);
    if (lu > 0) LANGS.forEach((w, i) => {
      const d = (t - CUE.vxLang) - i * 0.16; if (d < 0) return;
      const x = 190 + (i % 5) * 175 + (Math.floor(i / 5) % 2) * 60, y = 1180 + (i % 2) * 70 + d * 60, a = clamp(d * 4) * (1 - clamp((d - 1.2) / 0.4));
      txt(w, x, y, '800 50px Inter', COL.white, 'center', a * lu);
    });
  }
  X.restore();
}
function drawVX2(t, A) {           // 20 octobre, podium Artificial Analysis, 2 % d'erreur
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const ca = 1 - P(t, CUE.vxAA - 0.15, 0.25);
  if (ca > 0) calendar2(540, 880, 1.1 * pop(t, CUE.vxCal - 0.05), ca, '20', 'OCT. 2026');
  const pa = P(t, CUE.vxAA - 0.1, 0.3) * (1 - P(t, CUE.vx2 - 0.15, 0.3));
  if (pa > 0) {
    X.save(); X.globalAlpha *= pa;
    if (IMG.aa) { const w = 120; X.drawImage(IMG.aa, 315 - w / 2, 560 - w / 2, w, w); }
    txt('Artificial Analysis', 395, 578, '800 46px Inter', COL.white, 'left', 1);
    // podium
    const pu = eo(P(t, CUE.vxAA, 0.6));
    [[540, 300, '1'], [300, 220, '2'], [780, 160, '3']].forEach(([x, h, n], i) => {
      const hh = h * pu, y0 = 1280;
      X.fillStyle = i === 2 ? css(RGB.cyan, 0.35) : 'rgba(44,46,58,0.9)'; rr(x - 115, y0 - hh, 230, hh, 12); X.fill();
      X.strokeStyle = i === 2 ? COL.cyan : COL.faint; X.lineWidth = 4; rr(x - 115, y0 - hh, 230, hh, 12); X.stroke();
      txt(n, x, y0 - hh + 80, '900 70px Inter', i === 2 ? COL.cyan : COL.dim, 'center', pu);
    });
    const vd = eo(P(t, CUE.vxPod - 0.1, 0.45));
    if (vd > 0) { X.save(); X.translate(780, lerp(700, 1000, vd)); modelCard(0, 0, 0.6, VXC, 'Voxtral', 'wave', 1, 1, t); X.restore(); if (vd > 0.95) [[640, 900], [920, 900]].forEach(([x, y], k) => sparkle(x, y, 0.7 * back(P(t, CUE.vxPod + 0.35 + 0.1 * k, 0.4)), COL.cyan, 1)); }
    X.restore();
  }
  const ga = P(t, CUE.vx2 - 0.1, 0.3);
  if (ga > 0) {                     // 2 % : 1 mot raté sur 50
    X.save(); X.globalAlpha *= ga;
    const cu = eo(P(t, CUE.vx2, 0.5));
    popIn(540, 700, pop(t, CUE.vx2 - 0.08, 0.35), () => { X.save(); X.shadowColor = css(RGB.cyan, 0.5); X.shadowBlur = 36; txt('2 %', 540, 770, '900 190px Inter', COL.cyan, 'center'); X.restore(); });
    const r = rng(5), bad = 37, mu = P(t, CUE.vxMal - 0.1, 0.3);
    for (let i = 0; i < 50; i++) {
      const row = Math.floor(i / 10), col = i % 10, w = 54 + r() * 28, x = 140 + col * 81, y = 920 + row * 70;
      const k = clamp(P(t, CUE.vx2 - 0.1, 0.8) * 50 - i);
      if (k <= 0) continue;
      const isBad = i === bad && mu > 0, c = isBad ? mixc(RGB.dim, RGB.red, mu) : RGB.dim;
      X.fillStyle = css(c, k); rr(x - w / 2 + 36, y, w, 26, 13); X.fill();
      if (isBad) { X.save(); X.strokeStyle = COL.red; X.lineWidth = 4; X.globalAlpha *= mu; rr(x - w / 2 + 26, y - 10, w + 20, 46, 18); X.stroke(); X.restore(); }
    }
    X.restore();
  }
  X.restore();
}
function drawVX3(t, A) {           // pas open weight
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  modelCard(540, 700, 0.85, VXC, 'Voxtral', 'wave', 1, 1, t);
  const cl = P(t, CUE.vxOWx - 0.1, 0.35);
  padlock(540, 1080, 2.1 * pop(t, CUE.vxOW), 1 - eo(cl), cl > 0 ? css(mixc(RGB.green, RGB.red, cl)) : COL.green, 1);
  if (t >= CUE.vxOWx) stamp('PAS OPEN WEIGHT', 540, 1290, t, CUE.vxOWx + 0.15, COL.red, '229,72,77', 62, -0.05);
  X.restore();
}
// ================================================================= MISTRAL OCR
function scannedPage(x, y, w, h, a, t) {     // page scannée : penchée, grisâtre, bruitée
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.rotate(-0.06);
  X.fillStyle = '#c9c6bd'; X.shadowColor = 'rgba(0,0,0,.5)'; X.shadowBlur = 30; X.fillRect(-w / 2, -h / 2, w, h); X.shadowBlur = 0;
  const r = rng(11);
  X.fillStyle = 'rgba(60,58,52,0.85)'; X.fillRect(-w / 2 + 28, -h / 2 + 30, w * 0.62, 26);
  for (let k = 0; k < 6; k++) X.fillRect(-w / 2 + 28, -h / 2 + 84 + k * 22, (w - 56) * (0.7 + 0.3 * r()), 9);
  X.strokeStyle = 'rgba(60,58,52,0.8)'; X.lineWidth = 2;
  for (let rI = 0; rI < 4; rI++) for (let c = 0; c < 3; c++) X.strokeRect(-w / 2 + 28 + c * (w - 56) / 3, -h / 2 + 232 + rI * 26, (w - 56) / 3, 26);
  for (let k = 0; k < 3; k++) X.fillRect(-w / 2 + 28, -h / 2 + 356 + k * 22, (w - 56) * (0.6 + 0.4 * r()), 9);
  for (let k = 0; k < 140; k++) { X.fillStyle = `rgba(40,40,40,${0.12 * r()})`; X.fillRect(-w / 2 + r() * w, -h / 2 + r() * h, 3, 3); }
  X.restore();
}
function structPage(x, y, w, h, t, u) {      // sortie : blocs typés avec boîtes englobantes
  X.save(); X.translate(x, y);
  X.fillStyle = 'rgba(22,23,31,0.95)'; rr(-w / 2, -h / 2, w, h, 18); X.fill(); X.strokeStyle = COL.faint; X.lineWidth = 3; rr(-w / 2, -h / 2, w, h, 18); X.stroke();
  const blocks = [[COL.orange, -h / 2 + 24, 44, 'TITRE'], [COL.cyan, -h / 2 + 84, 136, 'TEXTE'], [COL.yellow, -h / 2 + 236, 110, 'TABLEAU'], [COL.cyan, -h / 2 + 362, 76, 'TEXTE']];
  blocks.forEach(([c, by, bh, lb], i) => {
    const k = clamp(u * 4 - i); if (k <= 0) return;
    X.save(); X.globalAlpha *= k;
    X.fillStyle = c === COL.orange ? COL.white : COL.grey;
    if (lb === 'TITRE') rr(-w / 2 + 34, by + 10, w * 0.55, 24, 6), X.fill();
    else if (lb === 'TABLEAU') { X.strokeStyle = COL.grey; X.lineWidth = 2; for (let rI = 0; rI < 3; rI++) for (let cI = 0; cI < 3; cI++) X.strokeRect(-w / 2 + 34 + cI * (w - 68) / 3, by + 14 + rI * 28, (w - 68) / 3, 28); }
    else for (let l = 0; l < Math.floor(bh / 22); l++) { rr(-w / 2 + 34, by + 12 + l * 22, (w - 68) * (l % 3 === 2 ? 0.6 : 1), 9, 4); X.fill(); }
    X.strokeStyle = c; X.lineWidth = 4; X.setLineDash([12, 8]); rr(-w / 2 + 18, by, w - 36, bh, 8); X.stroke(); X.setLineDash([]);
    const f = '800 22px Inter', lw = tw(lb, f) + 20; X.fillStyle = c; rr(w / 2 - 18 - lw, by - 14, lw, 30, 8); X.fill(); txt(lb, w / 2 - 18 - lw / 2, by + 8, f, '#10111a', 'center');
    X.restore();
  });
  X.restore();
}
function drawOC1(t, A) {           // nom, PDF ou scan → texte structuré
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const head = 1 - P(t, CUE.ocPDF - 0.3, 0.35);
  if (head > 0) { const s = pop(t, CUE.oc + 0.1); X.save(); X.globalAlpha *= head; modelCard(540, 850, 1.15 * s, OCC, 'Mistral OCR', 'ocr', 1, 1, t); tileLogo('t_mistral', 710, 705, 92 * s, 1); X.restore(); }
  const pa = P(t, CUE.ocPDF - 0.25, 0.3);
  if (pa > 0) {
    X.save(); X.globalAlpha *= pa;
    scannedPage(285, 960, 360, 470, 1, t);
    pill('PDF', 200, 640, COL.white, P(t, CUE.ocPDF - 0.05, 0.25), '800 38px Inter');
    pill('SCAN', 370, 640, COL.white, P(t, CUE.ocScan - 0.05, 0.25), '800 38px Inter');
    // faisceau de scan
    const su = P(t, CUE.ocScan, 1.0);
    if (su > 0 && su < 1) { const yy = lerp(725, 1195, su); X.save(); X.shadowColor = css(RGB.yellow); X.shadowBlur = 30; line(85, yy, 485, yy, COL.yellow, 6); X.restore(); X.fillStyle = css(RGB.yellow, 0.12); X.fillRect(85, 725, 400, yy - 725); }
    const au = eo(P(t, CUE.ocScan + 0.2, 0.4));
    if (au > 0) arrow(490, 960, lerp(490, 570, au), 960, COL.yellow, 1, au, 9);
    structPage(800, 960, 380, 470, t, P(t, CUE.ocStr - 0.3, 1.0));
    X.restore();
  }
  X.restore();
}
const GLYPHS = ['Aa', 'Жж', 'Ωω', 'Ğğ', 'Łł', 'Ææ', 'Ññ', 'Ђђ', 'Ŵŵ', 'Ëë'];
function drawOC2(t, A) {           // 170 langues ; annotateurs 72 %
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const la = 1 - P(t, CUE.ocAnn - 0.2, 0.3);
  if (la > 0) {
    X.save(); X.globalAlpha *= la;
    const v = Math.round(170 * eo(P(t, CUE.oc170 - 0.05, 0.8)));
    popIn(540, 880, pop(t, CUE.oc170 - 0.08, 0.35), () => { X.save(); X.shadowColor = css(RGB.yellow, 0.5); X.shadowBlur = 36; txt(String(v), 540, 940, '900 230px Inter', COL.yellow, 'center'); X.restore(); });
    txt('langues', 540, 1030, '700 56px Inter', COL.white, 'center', P(t, CUE.oc170, 0.3));
    GLYPHS.forEach((gph, i) => { const an = i / GLYPHS.length * 6.283 + t * 0.5, k = P(t, CUE.oc170 + 0.06 * i, 0.3); txt(gph, 540 + Math.cos(an) * 400, 880 + Math.sin(an) * 330, '800 54px Inter', COL.grey, 'center', 0.8 * k); });
    X.restore();
  }
  const aa = P(t, CUE.ocAnn - 0.15, 0.3);
  if (aa > 0) {
    X.save(); X.globalAlpha *= aa;
    // jauge 72 %
    const gu = eo(P(t, CUE.oc72 - 0.1, 0.8));
    X.lineCap = 'round'; X.strokeStyle = COL.faint; X.lineWidth = 34; X.beginPath(); X.arc(540, 760, 190, 0, 7); X.stroke();
    if (gu > 0) { X.save(); X.strokeStyle = COL.yellow; X.shadowColor = css(RGB.yellow, 0.6); X.shadowBlur = 24; X.beginPath(); X.arc(540, 760, 190, -Math.PI / 2, -Math.PI / 2 + 6.2832 * 0.72 * gu); X.stroke(); X.restore(); }
    if (gu > 0) txt(Math.round(72 * gu) + ' %', 540, 795, '900 110px Inter', COL.yellow, 'center');
    // annotateurs
    for (let i = 0; i < 10; i++) {
      const x = 150 + (i % 5) * 195, y = 1080 + Math.floor(i / 5) * 165, s = pop(t, CUE.ocAnn + i * 0.05, 0.35);
      if (s <= 0) continue;
      person(x, y, 1.6 * s, COL.grey, 1);
      const pk = P(t, CUE.ocPref + i * 0.06, 0.3);
      if (pk > 0) { const good = (i * 7) % 10 < 7; if (good) checkIcon(x + 50, y - 50, 0.7, COL.green, pk, 1, 6); else crossIcon(x + 50, y - 50, 0.5, COL.dim, pk, 6); }
    }
    X.restore();
  }
  X.restore();
}
function drawOC3(t, A) {           // poids pas publics : API ou version entreprises
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const cl = P(t, CUE.ocWx - 0.1, 0.35);
  padlock(540, 720, 2.2 * pop(t, CUE.ocW), 1 - eo(cl), cl > 0 ? css(mixc(RGB.green, RGB.red, cl)) : COL.green, 1);
  if (t >= CUE.ocWx) stamp('PAS PUBLICS', 540, 930, t, CUE.ocWx + 0.15, COL.red, '229,72,77', 62, -0.05);
  const ap = pop(t, CUE.ocAPI - 0.05);
  if (ap > 0) { cloudIcon(300, 1140, 1.6 * ap, COL.cyan, 1); pill('API', 300, 1270, COL.cyan, P(t, CUE.ocAPI, 0.25), '800 40px Inter'); }
  const ep = pop(t, CUE.ocEnt - 0.05);
  if (ep > 0) { building(780, 1130, 0.95 * ep, COL.yellow, 1); pill('ENTREPRISES', 780, 1270, COL.yellow, P(t, CUE.ocEnt, 0.25), '800 40px Inter'); }
  X.restore();
}
// ================================================================= À RETENIR
function drawRB(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  const lu = pop(t, CUE.rb - 0.05), dim = P(t, CUE.rbMod, 0.4) * (1 - P(t, CUE.rbCour - 0.3, 0.4));
  if (1 - P(t, CUE.rbCour - 0.3, 0.4) > 0) {
    X.save(); X.globalAlpha *= 1 - P(t, CUE.rbCour - 0.3, 0.4);
    X.filter = dim > 0 ? `grayscale(${dim})` : 'none';
    card('mistral', 540, 800, 0.8 * lu, 1 - 0.45 * dim, null);
    X.filter = 'none';
    pill('Mistral Large 4', 540, 1010, COL.grey, lu, '800 40px Inter');
    X.restore();
  }
  const cu = P(t, CUE.rbCour - 0.2, 0.35);
  if (cu > 0) {
    X.save(); X.globalAlpha *= cu;
    crown(540, 700, 0.95 * back(P(t, CUE.rbCour, 0.45)), 1);
    const on = [P(t, CUE.rbTS, 0.3), P(t, CUE.rbOC, 0.3), P(t, CUE.rbVX, 0.3)];
    const items = [[TSC, 'Timestral', 'chart'], [OCC, 'OCR', 'ocr'], [VXC, 'Voxtral', 'wave']];
    items.forEach(([rgb, lb, gl], i) => { const s = pop(t, CUE.rbCour + 0.1 + i * 0.12) * (1 + 0.08 * Math.sin(Math.PI * clamp((t - [CUE.rbTS, CUE.rbOC, CUE.rbVX][i]) / 0.4))); modelCard(205 + i * 335, 1050, 0.92 * s, rgb, lb, gl, 1, 0.35 + 0.65 * on[i], t); });
    X.restore();
  }
  X.restore();
}
// ================================================================= FIN
function drawOutro(t, A) {
  if (A <= 0) return;
  X.save(); X.globalAlpha *= A;
  X.fillStyle = 'rgba(15,16,24,0.9)'; X.fillRect(0, 0, W, H);
  const lp = back(P(t, CUE.outro, 0.5));
  popIn(540, 700, lp, () => { X.save(); X.shadowColor = 'rgba(70,255,140,0.25)'; X.shadowBlur = 40; X.drawImage(IMG.tileLogo, 390, 550, 300, 300); X.restore(); });
  const ab = back(P(t, CUE.outro + 0.25, 0.45));
  const press = Math.sin(Math.PI * P(t, CUE.abo + 0.05, 0.3));
  popIn(540, 1000, ab, () => subscribeBtn(540, 1000, 1, 1, press));
  const cu = eo(P(t, CUE.abo - 0.45, 0.45));
  cursorHand(lerp(900, 640, cu), lerp(1160, 1015, cu), 1.1, clamp(cu * 2));
  burst(540, 1000, t, CUE.abo + 0.1, 71, [COL.orange, COL.yellow, '#fff'], 26, 520, 0.8);
  const du = P(t, CUE.dem - 0.05, 0.35);
  if (du > 0) {
    txt2('Demain · ', 'Jour 24', 1230, '700 54px Inter', '800 54px Inter', COL.grey, COL.orange, du);
    for (let i = 0; i < 24; i++) { const on = i < 23 || P(t, CUE.dem24, 0.3) > 0; const last = i === 23; glowDot(540 - 23 / 2 * 32 + i * 32, 1310, last ? 6 + 4 * back(P(t, CUE.dem24, 0.4)) : 7, on ? (last ? COL.orange : COL.orange) : COL.faint, du * (last ? clamp(0.3 + P(t, CUE.dem24, 0.3)) : 0.8), last ? 14 : 6); }
  }
  X.restore();
}
// ================================================================= ORCHESTRATION
const IMPACTS = () => [[0.05, 0.6], [CUE.hL4, 0.3], [CUE.tsN, 0.4], [CUE.tsLLMx, 0.3], [CUE.ts209, 0.4], [CUE.vxN, 0.4], [CUE.vxOWx, 0.45], [CUE.ocN, 0.4], [CUE.ocWx, 0.45]];
function shakeAt(t) {
  let s = 0; IMPACTS().forEach(([ti, k]) => { const d = t - ti; if (d >= 0 && d < 0.3) s = Math.max(s, k * (1 - d / 0.3)); });
  return [Math.sin(t * 90) * 12 * s, Math.cos(t * 70) * 8 * s];
}
const sceneTint = t => t < CUE.ts ? RGB.orange : t < CUE.vx ? TSC : t < CUE.oc ? VXC : t < CUE.rb ? OCC : RGB.orange;
async function draw(t) {
  NOW = t;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none';
  background(t, sceneTint(t), 0.1);
  const [sx, sy] = shakeAt(t);
  const Z = punch(t, [[0.05, 0.05], [CUE.hL4, 0.03], [CUE.hMonde, 0.03], [CUE.tsN, 0.04], [CUE.tsSuite, 0.02], [CUE.ts209, 0.05], [CUE.tsOWo, 0.03],
                      [CUE.vxN, 0.04], [CUE.vxPod, 0.03], [CUE.vxOWx, 0.05], [CUE.ocN, 0.04], [CUE.ocStr, 0.03], [CUE.oc72, 0.03], [CUE.ocWx, 0.05], [CUE.rbCour, 0.04]]);
  X.save(); X.translate(540 + sx, 900 + sy); X.scale(Z, Z); X.translate(-540, -900);
  const S = (a, b, fn, fi = 0.2, fo = 0.25) => { if (t >= a - 0.1 && t < b + 0.1) fn(t, SC(t, a - 0.1, b + 0.05, fi, fo)); };
  if (t < CUE.hookEnd + 0.3) drawHook(t, 1 - P(t, CUE.hookEnd - 0.05, 0.3));
  drawDay(t, SC(t, CUE.day, CUE.ts, 0.2, 0.25));
  S(CUE.ts, CUE.tsSer, drawTS1);
  S(CUE.tsSer, CUE.tsFou, drawTS2);
  S(CUE.tsFou, CUE.tsOW, drawTS3);
  S(CUE.tsOW, CUE.vx, drawTS4);
  S(CUE.vx, CUE.vxCal, drawVX1);
  S(CUE.vxCal, CUE.vxOW, drawVX2);
  S(CUE.vxOW, CUE.oc, drawVX3);
  S(CUE.oc, CUE.oc170, drawOC1);
  S(CUE.oc170, CUE.ocW, drawOC2);
  S(CUE.ocW, CUE.rb, drawOC3);
  S(CUE.rb, CUE.outro, drawRB);
  drawOutro(t, P(t, CUE.outro - 0.05, 0.35));
  flashAt(t, [[0.03, 0.5], [CUE.h3 - 0.05, 0.2], [CUE.hookEnd, 0.2], [CUE.tsN, 0.2], [CUE.vxN, 0.2], [CUE.ocN, 0.2], [CUE.rbCour, 0.15]]);
  X.restore();
}
async function init(cues) {
  CUE = Object.assign(CUE, cues || {});
  const A = '../../assets/';
  await Promise.all([loadImg('logo', A + 'Logo principal — vert terminal@1x.png'), loadImg('mistral', A + 'mistral.png'), loadImg('openai', A + 'openai.jpg'),
    loadImg('google', A + 'google.png'), loadImg('alibaba', A + 'alibaba.png'), loadImg('huggingface', A + 'huggingface.png'), loadImg('aa', A + 'artificial-analysis.png')]);
  const fonts = ['400 24px Inter', '500 24px Inter', '600 24px Inter', '700 24px Inter', '800 24px Inter', '900 24px Inter'];
  await Promise.all(fonts.map(f => document.fonts.load(f, 'AÉéêàç0123≈−°·€$"?%ЖжΩωĞğ')));
  await document.fonts.ready;
  IMG.tileLogo = tile('logo', 420, 0.0, 0.16, '#0a0e0c');
  ['mistral', 'openai', 'google', 'alibaba', 'huggingface'].forEach(k => { if (IMG[k]) IMG['t_' + k] = tile(k, 240, k === 'openai' ? 0.06 : 0.14, 0.22); });
  if (IMG.mistral) CARD.mistral = mkCard('mistral', 300, 300, 0.16);
  return CUE;
}
window.init = init; window.draw = draw;
