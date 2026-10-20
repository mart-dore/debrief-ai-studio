
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
