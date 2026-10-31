
// ================================================================= TEST MASCOTTE — Jour 23 (design A « Bulle »)
// La mascotte vit en bas à gauche, au-dessus des sous-titres ; le reste de l'image est un peu réduit et plus calme
// (plus de tremblements d'écran ni de flashs, zooms « punch » divisés par deux).
const MDESIGN = 'A';
const MX = 190, MY = 1372, MS = 0.92;              // position (pieds) et échelle de la mascotte
// chorégraphie : [repère, expression, bras] — tient jusqu'au repère suivant
const MSEQ = () => [
  [0, 'malin', 'none'], ['hDoigt', 'malin', 'pointR'], ['hPense', 'reflechit', 'chin'], ['hNiv', 'decu', 'none'],
  ['h3', 'malin', 'none'], ['hTrois', 'neutre', 'pointR'], ['hMonde', 'content', 'cheer'],
  ['day', 'logo', 'wave'],
  ['ts', 'neutre', 'pointR'], ['tsLLM', 'malin', 'none'], ['tsLLMx', 'clin', 'none'], ['tsSerW', 'neutre', 'pointR'],
  ['icB', 'malin', 'none'], ['tsHist', 'neutre', 'pointR'], ['tsSuite', 'content', 'pointUp'], ['tsMarge', 'reflechit', 'chin'],
  ['tsFou', 'choque', 'cheeks'], ['ts209', 'choque', 'none'], ['tsPar', 'content', 'none'], ['tsPC', 'neutre', 'pointR'],
  ['tsOWo', 'content', 'cheer'], ['tsDL', 'clin', 'pointR'],
  ['vx', 'neutre', 'pointR'], ['vxTr', 'neutre', 'none'], ['vxLang', 'content', 'wave'], ['vxCal', 'neutre', 'none'],
  ['vxAA', 'neutre', 'pointR'], ['vxPod', 'content', 'cheer'], ['vx2', 'malin', 'pointR'], ['vxOW', 'reflechit', 'none'], ['vxOWx', 'decu', 'none'],
  ['oc', 'neutre', 'pointR'], ['ocPDF', 'neutre', 'none'], ['ocScan', 'choque', 'none'], ['ocStr', 'content', 'pointR'],
  ['oc170', 'choque', 'cheeks'], ['ocAnn', 'neutre', 'pointR'], ['oc72', 'content', 'none'],
  ['ocW', 'reflechit', 'none'], ['ocWx', 'decu', 'none'], ['ocAPI', 'neutre', 'pointR'],
  ['rb', 'reflechit', 'chin'], ['rbCour', 'content', 'cheer'], ['rbPrec', 'malin', 'none'], ['rbTS', 'neutre', 'pointR'],
  ['outro', 'content', 'wave'], ['abo', 'clin', 'pointR'], ['dem', 'content', 'none'],
].map(([k, e, a]) => [typeof k === 'number' ? k : CUE[k], e, a]).filter(x => x[0] != null).sort((a, b) => a[0] - b[0]);
let _MS = null;
function mascotState(t) {
  _MS = _MS || MSEQ();
  let cur = _MS[0], t0 = 0;
  for (const s of _MS) if (s[0] - 0.08 <= t) { cur = s; t0 = s[0] - 0.08; }
  const since = t - t0;
  const fi = Math.min(Math.floor(t * 30), (CUE.mouth || []).length - 1);
  let mouth = fi >= 0 && CUE.mouth ? CUE.mouth[fi] : 0;
  const ph = (t % 3.4) / 3.4, blink = ph > 0.955 ? Math.sin((ph - 0.955) / 0.045 * Math.PI) : 0;
  const hop = -18 * Math.sin(Math.PI * clamp(since / 0.28)) * (since < 0.28 ? 1 : 0);
  const squash = since < 0.12 ? 0.6 * (1 - since / 0.12) : 0;
  const look = cur[2] === 'pointR' ? [0.8, -0.4] : cur[2] === 'pointUp' ? [0.4, -0.9] : cur[1] === 'reflechit' ? [0.6, -0.8] : [0.3, 0];
  const tilt = cur[1] === 'choque' ? -0.06 : cur[1] === 'content' ? 0.04 * Math.sin(t * 6) : 0;
  return { expr: cur[1], arm: cur[2], mouth, blink, hop, squash, look, tilt, t };
}
function shakeAt(t) { return [0, 0]; }
async function draw(t) {
  NOW = t;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none';
  background(t, sceneTint(t), 0.1);
  const Z = 1 + (punch(t, [[CUE.hL4, 0.03], [CUE.tsN, 0.03], [CUE.ts209, 0.04], [CUE.vxN, 0.03], [CUE.vxOWx, 0.04], [CUE.ocN, 0.03], [CUE.ocWx, 0.04], [CUE.rbCour, 0.03]]) - 1) * 0.5;
  // contenu réduit (0,86) et décalé vers la droite pour laisser la place à la mascotte
  X.save(); X.translate(600, 610); X.scale(0.8 * Z, 0.8 * Z); X.translate(-540, -640);
  const S = (a, b, fn, fi = 0.2, fo = 0.25) => { if (t >= a - 0.1 && t < b + 0.1) fn(t, SC(t, a - 0.1, b + 0.05, fi, fo)); };
  if (t < CUE.hookEnd + 0.3) drawHook(t, 1 - P(t, CUE.hookEnd - 0.05, 0.3));
  drawDay(t, SC(t, CUE.day, CUE.ts, 0.2, 0.25));
  S(CUE.ts, CUE.tsSer, drawTS1); S(CUE.tsSer, CUE.tsFou, drawTS2); S(CUE.tsFou, CUE.tsOW, drawTS3); S(CUE.tsOW, CUE.vx, drawTS4);
  S(CUE.vx, CUE.vxCal, drawVX1); S(CUE.vxCal, CUE.vxOW, drawVX2); S(CUE.vxOW, CUE.oc, drawVX3);
  S(CUE.oc, CUE.oc170, drawOC1); S(CUE.oc170, CUE.ocW, drawOC2); S(CUE.ocW, CUE.rb, drawOC3);
  S(CUE.rb, CUE.outro, drawRB);
  X.restore();
  drawOutro(t, P(t, CUE.outro - 0.05, 0.35));
  mascot(MDESIGN, MX, MY, MS, mascotState(t));
}
window.draw = draw;
