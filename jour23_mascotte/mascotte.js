// ================================================================= MASCOTTE « Le Débrief IA » — dérivée du logo (bulle terminal >_)
// mascot(design, x, y, s, st) : x, y = point bas-centre du personnage ; s = échelle (1 ≈ 300 px de haut)
// st = { expr, mouth (0..1), arm ('none'|'pointL'|'pointR'|'pointUp'|'wave'|'cheer'|'cheeks'|'chin'), blink (0..1), look [dx,dy], t, squash }
// expr : neutre | content | choque | reflechit | clin | decu | malin | logo
const MG = { bg: '#0B0F0C', white: '#F2F5F3', green: '#3DFF8A', greenD: '#1FB862', ink: '#0B0F0C' };

function _arm(x0, y0, x1, y1, col, w, bend = 0.25) {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
  X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round';
  X.beginPath(); X.moveTo(x0, y0); X.quadraticCurveTo(mx, my, x1, y1); X.stroke();
  return [mx, my];
}
function _hand(x, y, r, col, point = null) {
  X.fillStyle = col; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill();
  if (point !== null) { X.strokeStyle = col; X.lineWidth = r * 0.75; X.lineCap = 'round'; X.beginPath(); X.moveTo(x, y); X.lineTo(x + Math.cos(point) * r * 2.1, y + Math.sin(point) * r * 2.1); X.stroke(); }
}
// bras : renvoie les positions (relatives au centre du corps) des deux mains selon la pose
function _armPose(arm, t, W2, H2) {
  const sw = Math.sin(t * 9);
  const L = { s: [-W2 + 6, 10], h: [-W2 - 40, 70], pt: null }, R = { s: [W2 - 6, 10], h: [W2 + 40, 70], pt: null };
  if (arm === 'pointR') { R.h = [W2 + 120, -30]; R.pt = -0.25; }
  if (arm === 'pointL') { L.h = [-W2 - 120, -30]; L.pt = Math.PI + 0.25; }
  if (arm === 'pointUp') { R.h = [W2 + 50, -H2 - 60]; R.pt = -Math.PI / 2 - 0.3; }
  if (arm === 'wave') { R.h = [W2 + 70 + 18 * sw, -H2 + 10]; }
  if (arm === 'cheer') { L.h = [-W2 - 60, -H2 - 40 + 10 * sw]; R.h = [W2 + 60, -H2 - 40 - 10 * sw]; }
  if (arm === 'cheeks') { L.h = [-W2 + 30, 40]; R.h = [W2 - 30, 40]; }
  if (arm === 'chin') { R.h = [W2 * 0.55, H2 + 18]; R.pt = -Math.PI / 2 - 0.5; }
  return [L, R];
}
// yeux / bouche dessinés dans un repère centré sur le visage (fy = hauteur des yeux)
function _face(expr, mouth, blink, look, fw, col, t, ink) {
  const [lx, ly] = look, ex = fw * 0.22, ey = -fw * 0.08;
  X.save(); X.translate(lx * fw * 0.06, ly * fw * 0.05);
  X.fillStyle = col; X.strokeStyle = col; X.lineCap = 'round'; X.lineJoin = 'round';
  const lw = fw * 0.075;
  const eye = (cx, kind) => {
    X.lineWidth = lw;
    if (kind === 'chev') { X.beginPath(); X.moveTo(cx - fw * 0.07, ey - fw * 0.09); X.lineTo(cx + fw * 0.06, ey); X.lineTo(cx - fw * 0.07, ey + fw * 0.09); X.stroke(); }
    else if (kind === 'chevL') { X.beginPath(); X.moveTo(cx + fw * 0.07, ey - fw * 0.09); X.lineTo(cx - fw * 0.06, ey); X.lineTo(cx + fw * 0.07, ey + fw * 0.09); X.stroke(); }
    else if (kind === 'happy') { X.beginPath(); X.moveTo(cx - fw * 0.08, ey + fw * 0.04); X.lineTo(cx, ey - fw * 0.06); X.lineTo(cx + fw * 0.08, ey + fw * 0.04); X.stroke(); }
    else if (kind === 'line') { X.beginPath(); X.moveTo(cx - fw * 0.08, ey); X.lineTo(cx + fw * 0.08, ey); X.stroke(); }
    else if (kind === 'big') { X.beginPath(); X.arc(cx, ey, fw * 0.1, 0, 7); X.fill(); X.fillStyle = ink; X.beginPath(); X.arc(cx + fw * 0.03, ey - fw * 0.035, fw * 0.03, 0, 7); X.fill(); X.fillStyle = col; }
    else if (kind === 'sad') { X.beginPath(); X.moveTo(cx - fw * 0.08, ey - fw * 0.02); X.lineTo(cx + fw * 0.08, ey + fw * 0.03); X.stroke(); }
    else { const h = fw * 0.16 * Math.max(0.12, 1 - blink); rr(cx - fw * 0.045, ey - h / 2, fw * 0.09, h, fw * 0.045); X.fill(); }
  };
  let eL = 'pill', eR = 'pill';
  if (expr === 'content') eL = eR = 'happy';
  if (expr === 'choque') eL = eR = 'big';
  if (expr === 'clin') { eR = 'chevL'; }
  if (expr === 'decu') { eL = eR = 'pill'; blink = Math.max(blink, 0.5); }
  if (expr === 'malin') { eL = 'pill'; eR = 'line'; }
  if (expr === 'logo') { eL = 'chev'; eR = 'none'; }
  if (expr === 'reflechit') { X.save(); X.translate(fw * 0.04, -fw * 0.05); }
  if (eL !== 'none') eye(-ex, eL); if (eR !== 'none') eye(ex, eR);
  // sourcils pour certaines expressions
  X.lineWidth = lw * 0.6;
  if (expr === 'choque') { [-ex, ex].forEach(cx => { X.beginPath(); X.moveTo(cx - fw * 0.08, ey - fw * 0.2); X.lineTo(cx + fw * 0.08, ey - fw * 0.22); X.stroke(); }); }
  if (expr === 'decu') { X.beginPath(); X.moveTo(-ex - fw * 0.08, ey - fw * 0.13); X.lineTo(-ex + fw * 0.07, ey - fw * 0.17); X.moveTo(ex + fw * 0.08, ey - fw * 0.13); X.lineTo(ex - fw * 0.07, ey - fw * 0.17); X.stroke(); }
  if (expr === 'reflechit') { X.beginPath(); X.moveTo(ex - fw * 0.08, ey - fw * 0.2); X.lineTo(ex + fw * 0.08, ey - fw * 0.15); X.stroke(); X.restore(); }
  // bouche : le curseur « _ » du logo, qui s'ouvre quand on parle
  const my = fw * 0.2, mw = fw * 0.26;
  X.lineWidth = lw;
  if (expr === 'choque') { const r = fw * (0.07 + 0.05 * mouth); X.beginPath(); X.ellipse(0, my, r * 0.8, r, 0, 0, 7); X.fill(); }
  else if (expr === 'content' || expr === 'clin') { const h = fw * (0.05 + 0.12 * mouth); X.beginPath(); X.moveTo(-mw / 2, my - h * 0.2); X.quadraticCurveTo(0, my + h * 1.6, mw / 2, my - h * 0.2); X.closePath(); X.fill(); }
  else if (expr === 'decu') { X.beginPath(); X.moveTo(-mw * 0.4, my + fw * 0.04); X.quadraticCurveTo(0, my - fw * 0.06 - fw * 0.06 * mouth, mw * 0.4, my + fw * 0.04); X.stroke(); }
  else if (expr === 'malin') { X.beginPath(); X.moveTo(-mw * 0.45, my); X.quadraticCurveTo(mw * 0.1, my + fw * 0.07, mw * 0.5, my - fw * 0.05); X.stroke(); }
  else if (expr === 'reflechit') { X.beginPath(); X.moveTo(-mw * 0.2, my + fw * 0.02); X.lineTo(mw * 0.3, my); X.stroke(); }
  else {   // neutre / logo : curseur ; ouvert = rectangle arrondi
    const h = fw * (0.045 + 0.15 * mouth), w = mw * (1 - 0.25 * mouth), on = true;
    if (on) { rr(-w / 2 + (expr === 'logo' ? fw * 0.12 : 0), my - fw * 0.022, w, h, Math.min(h, w) / 2); X.fill(); }
  }
  X.restore();
}
// ---- design A : « Bulle » — la bulle du logo devient le personnage (contour blanc, visage vert terminal)
function _bodyA(W2, H2, t) {
  X.lineWidth = 16; X.strokeStyle = MG.white; X.fillStyle = MG.bg; X.lineJoin = 'round';
  X.beginPath(); X.roundRect(-W2, -H2, W2 * 2, H2 * 2, 46); X.fill();
  X.beginPath(); X.moveTo(-W2 * 0.45, H2); X.lineTo(-W2 * 0.62, H2 + 46); X.lineTo(-W2 * 0.18, H2); X.closePath(); X.fill();
  X.beginPath(); X.moveTo(-W2 * 0.18, H2); X.lineTo(W2 - 46, H2); X.arcTo(W2, H2, W2, H2 - 46, 46); X.lineTo(W2, -H2 + 46); X.arcTo(W2, -H2, W2 - 46, -H2, 46);
  X.lineTo(-W2 + 46, -H2); X.arcTo(-W2, -H2, -W2, -H2 + 46, 46); X.lineTo(-W2, H2 - 46); X.arcTo(-W2, H2, -W2 + 46, H2, 46); X.lineTo(-W2 * 0.45, H2);
  X.lineTo(-W2 * 0.62, H2 + 46); X.lineTo(-W2 * 0.18, H2); X.stroke();
}
// ---- design B : « Terminal-bot » — tête = bulle du logo, petit corps de robot, antenne curseur
function _bodyB(W2, H2, t) {
  X.fillStyle = '#20262a'; X.strokeStyle = MG.white; X.lineWidth = 10;
  X.beginPath(); X.roundRect(-W2 * 0.55, H2 + 8, W2 * 1.1, 82, 22); X.fill(); X.stroke();
  X.fillStyle = MG.green; X.beginPath(); X.roundRect(-18, H2 + 34, 36, 12, 6); X.fill();
  X.strokeStyle = MG.white; X.lineWidth = 8; X.beginPath(); X.moveTo(0, -H2); X.lineTo(0, -H2 - 40); X.stroke();
  X.fillStyle = Math.floor(t * 2.2) % 2 ? MG.green : MG.greenD; X.save(); X.shadowColor = MG.green; X.shadowBlur = 18; X.beginPath(); X.roundRect(-14, -H2 - 58, 28, 18, 5); X.fill(); X.restore();
  X.lineWidth = 14; X.strokeStyle = MG.white; X.fillStyle = MG.bg;
  X.beginPath(); X.roundRect(-W2, -H2, W2 * 2, H2 * 2, 40); X.fill(); X.stroke();
  X.fillStyle = '#0f2a1b'; X.beginPath(); X.roundRect(-W2 + 22, -H2 + 22, W2 * 2 - 44, H2 * 2 - 44, 24); X.fill();
}
// ---- design C : « Blob » — bulle pleine vert terminal, visage sombre, plus cartoon
function _bodyC(W2, H2, t) {
  X.fillStyle = MG.green; X.save(); X.shadowColor = 'rgba(61,255,138,0.45)'; X.shadowBlur = 40;
  X.beginPath(); X.roundRect(-W2, -H2, W2 * 2, H2 * 2, 70); X.fill();
  X.beginPath(); X.moveTo(-W2 * 0.45, H2 - 4); X.lineTo(-W2 * 0.64, H2 + 50); X.lineTo(-W2 * 0.12, H2 - 4); X.closePath(); X.fill(); X.restore();
  X.fillStyle = 'rgba(255,255,255,0.35)'; X.beginPath(); X.ellipse(-W2 * 0.55, -H2 * 0.55, 22, 12, -0.6, 0, 7); X.fill();
}
function mascot(design, x, y, s, st) {
  if (s <= 0) return;
  const t = st.t || 0, expr = st.expr || 'neutre', mouth = clamp(st.mouth || 0), arm = st.arm || 'none';
  const W2 = 120, H2 = 92, sq = st.squash || 0;
  const bob = Math.sin(t * 2.4) * 6 + (st.hop || 0);
  X.save(); X.globalAlpha *= (st.a == null ? 1 : st.a); X.translate(x, y); X.scale(s, s);
  // ombre au sol
  X.fillStyle = 'rgba(0,0,0,0.35)'; X.beginPath(); X.ellipse(0, 0, 120 - bob, 16, 0, 0, 7); X.fill();
  const cy = -H2 - (design === 'B' ? 105 : 62) + bob;
  X.translate(0, cy); X.rotate((st.tilt || 0) + Math.sin(t * 1.7) * 0.02); X.scale(1 + sq * 0.08, 1 - sq * 0.08);
  const armCol = design === 'C' ? MG.green : MG.white, armW = design === 'C' ? 20 : 14;
  const [L, R] = _armPose(arm, t, W2, H2);
  // bras derrière le corps
  [L, R].forEach(A => { _arm(A.s[0], A.s[1], A.h[0], A.h[1], armCol, armW, A === L ? -0.2 : 0.2); });
  if (design === 'A') _bodyA(W2, H2, t); else if (design === 'B') _bodyB(W2, H2, t); else _bodyC(W2, H2, t);
  [L, R].forEach(A => _hand(A.h[0], A.h[1], design === 'C' ? 17 : 14, armCol, A.pt));
  // visage
  const faceCol = design === 'C' ? MG.ink : MG.green;
  X.save(); if (design !== 'C') { X.shadowColor = 'rgba(61,255,138,0.55)'; X.shadowBlur = 14; }
  _face(expr, mouth, st.blink || 0, st.look || [0, 0], 240, faceCol, t, design === 'C' ? MG.green : MG.bg);
  X.restore();
  // joues roses (content) / gouttes (choqué) / bulle de pensée (réfléchit)
  if (expr === 'content' || expr === 'clin') { X.fillStyle = design === 'C' ? 'rgba(255,120,140,0.55)' : 'rgba(255,110,140,0.35)'; [-1, 1].forEach(k => { X.beginPath(); X.ellipse(k * 78, 22, 18, 10, 0, 0, 7); X.fill(); }); }
  if (expr === 'choque') { X.fillStyle = '#7fd4ff'; X.beginPath(); X.moveTo(W2 - 4, -H2 + 10); X.quadraticCurveTo(W2 + 22, -H2 + 40, W2 + 6, -H2 + 52); X.quadraticCurveTo(W2 - 12, -H2 + 40, W2 - 4, -H2 + 10); X.fill(); }
  if (expr === 'reflechit') { X.fillStyle = MG.white; [[W2 + 10, -H2 - 6, 9], [W2 + 34, -H2 - 34, 13], [W2 + 70, -H2 - 70, 26]].forEach(([a, b, r]) => { X.beginPath(); X.arc(a, b, r, 0, 7); X.fill(); }); X.fillStyle = MG.bg; [-9, 0, 9].forEach(d => { X.beginPath(); X.arc(W2 + 70 + d, -H2 - 70, 3.5, 0, 7); X.fill(); }); }
  X.restore();
}
