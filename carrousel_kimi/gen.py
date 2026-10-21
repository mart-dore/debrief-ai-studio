"""Carrousel TikTok « Kimi K3.1 Pro » — Le Débrief IA.
Images 1080x1920 ; tout le contenu reste dans la zone sûre TikTok (voir SAFE ci-dessous).
Usage : python gen.py            -> toutes les images dans ../../carrousels/kimi-k3-1-pro/
        python gen.py 1,11       -> seulement ces images
        SAFE=1 python gen.py     -> superpose les zones masquées par TikTok (contrôle)"""
import math, os, random, pathlib, sys
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent                      # D:\Documents\Debrief-IA
OUT = ROOT / 'carrousels' / 'kimi-k3-1-pro'
FONTS = (HERE.parent / '_env' / 'fonts').as_uri()
ASSETS = (ROOT / 'assets').as_uri()
NAME = 'kimi-k3-1-pro'
W, H = 1080, 1920

# Zones masquées par l'interface TikTok (onglet « Pour toi », iPhone, mesurées sur capture) :
#  - haut : onglets LIVE / Suivis / Pour toi  -> y < 320
#  - bas  : points du carrousel + légende + barre d'onglets -> y > 1660
#  - droite : colonne avatar / like / commentaires / favoris / partage -> x > 910 pour y > 860
#  - avatar du compte (bouton S'abonner) : centre ≈ (995, 1150)
SAFE = dict(top=330, bottom=1640, left=60, right=1020, right_low=890, right_low_from=860)
AVATAR = (995, 1150)

CSS = f"""
@font-face{{font-family:Inter;font-weight:500;src:url({FONTS}/Inter-Medium.otf)}}
@font-face{{font-family:Inter;font-weight:600;src:url({FONTS}/Inter-SemiBold.otf)}}
@font-face{{font-family:Inter;font-weight:700;src:url({FONTS}/Inter-Bold.otf)}}
@font-face{{font-family:Inter;font-weight:800;src:url({FONTS}/Inter-ExtraBold.otf)}}
@font-face{{font-family:Inter;font-weight:900;src:url({FONTS}/Inter-Black.otf)}}
@font-face{{font-family:Hand;font-weight:700;src:url({FONTS}/caveat-latin-700-normal.woff2)}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden}}
body{{font-family:Inter;color:#ECECF0;background:radial-gradient(ellipse 1150px 1300px at 540px 900px,#1f2130 0%,#10111a 100%);position:relative}}
.dust{{position:absolute;border-radius:50%;background:rgba(200,205,220,.10)}}
.abs{{position:absolute}}
.cat{{position:absolute;left:60px;top:340px;font-weight:800;font-size:28px;letter-spacing:4px;color:#F06E2D}}
.title{{position:absolute;left:60px;width:840px;top:382px;font-weight:800;font-size:56px;line-height:1.08;letter-spacing:-1px}}
.title b{{color:#56BCD6;font-weight:800}}
.card{{position:absolute;left:60px;width:830px;background:#fff;border-radius:28px;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.45)}}
.card img{{display:block;width:794px}}
.src{{position:absolute;left:60px;top:1590px;display:flex;align-items:center;gap:12px;font-weight:600;font-size:24px;color:#5E616D}}
.src img{{width:34px;height:34px;border-radius:8px;background:#fff;padding:3px}}
.hand{{position:absolute;font-family:Hand;font-weight:700;line-height:1.0;white-space:nowrap}}
svg.ov{{position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;overflow:visible}}
"""
COLS = {'o': '#F06E2D', 'y': '#F2C94C', 'c': '#56BCD6', 'g': '#46C281', 'w': '#ECECF0', 'r': '#E5484D'}
CARD_X, PAD, IMG_W = 60, 18, 794


def dust(seed):
    r = random.Random(seed)
    return ''.join(f'<div class="dust" style="left:{r.random()*W:.0f}px;top:{r.random()*H:.0f}px;width:{1+r.random()*3:.1f}px;height:{1+r.random()*3:.1f}px"></div>' for _ in range(46))


def hand_arrow(x1, y1, x2, y2, col, bend=0.25, seed=1, w=7):
    """Flèche dessinée à la main : courbe légèrement tremblée + pointe en deux traits."""
    r = random.Random(seed)
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy); nx, ny = -dy / L, dx / L
    cx, cy = (x1 + x2) / 2 + nx * L * bend, (y1 + y2) / 2 + ny * L * bend
    pts = []
    for i in range(25):
        t = i / 24
        x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2
        y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2
        j = 1.6 * math.sin(t * 9 + seed) * (1 - t)
        pts.append((x + nx * j, y + ny * j))
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    a = math.atan2(pts[-1][1] - pts[-3][1], pts[-1][0] - pts[-3][0]); hl = 30
    h1 = (x2 - hl * math.cos(a - 0.5) + r.uniform(-2, 2), y2 - hl * math.sin(a - 0.5) + r.uniform(-2, 2))
    h2 = (x2 - hl * math.cos(a + 0.45) + r.uniform(-2, 2), y2 - hl * math.sin(a + 0.45) + r.uniform(-2, 2))
    st = f'fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"'
    return f'<path d="{d}" {st}/><path d="M{h1[0]:.1f},{h1[1]:.1f} L{x2:.1f},{y2:.1f} L{h2[0]:.1f},{h2[1]:.1f}" {st}/>'


def circle(x, y, rx, ry, col, seed=1, w=6):
    r = random.Random(seed); pts = []
    for i in range(41):
        t = i / 40 * 2 * math.pi * 1.08 - 0.3
        k = 1 + 0.06 * math.sin(t * 3 + seed) + r.uniform(-0.015, 0.015)
        pts.append((x + rx * k * math.cos(t), y + ry * k * math.sin(t)))
    return '<path d="M' + ' L'.join(f'{a:.1f},{b:.1f}' for a, b in pts) + f'" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'


def underline(x1, x2, y, col, seed=1, w=7):
    r = random.Random(seed)
    pts = [(x1 + (x2 - x1) * i / 12, y + 4 * math.sin(i * 0.9 + seed) + r.uniform(-1, 1)) for i in range(13)]
    return '<path d="M' + ' L'.join(f'{a:.1f},{b:.1f}' for a, b in pts) + f'" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'


def src(txt='Source : Artificial Analysis · 25 oct. 2026'):
    return f'<div class="src"><img src="{ASSETS}/artificial-analysis.png">{txt}</div>'


def page(n, body):
    return f'<style>{CSS}</style>{dust(n)}{body}'


def chart_slide(n, cat, title, img, card_y, notes):
    """Une image = un benchmark : catégorie, titre court, graphique Artificial Analysis, 2-3 notes manuscrites."""
    im = Image.open(HERE / img)
    s = IMG_W / im.width
    ox, oy = CARD_X + PAD, card_y + PAD
    C = lambda cx, cy: (ox + cx * s, oy + cy * s)
    svg, texts = [], []
    for k, nt in enumerate(notes):
        kind = nt[0]
        if kind == 'text':
            _, x, y, txt, col, size, rot = nt
            texts.append(f'<div class="hand" style="left:{x}px;top:{y}px;font-size:{size}px;color:{COLS[col]};transform:rotate({rot}deg)">{txt}</div>')
        elif kind == 'arrow':
            _, x1, y1, tgt, col, bend = nt
            x2, y2 = C(*tgt[1:]) if tgt[0] == 'c' else tgt[1:]
            svg.append(hand_arrow(x1, y1, x2, y2, COLS[col], bend, seed=k + n * 7))
        elif kind == 'circle':
            _, tgt, rx, ry, col = nt
            svg.append(circle(*C(*tgt), rx, ry, COLS[col], seed=k + n))
        elif kind == 'under':
            _, x1, x2, y, col = nt
            svg.append(underline(x1, x2, y, COLS[col], seed=k + n))
    return page(n, f'<div class="cat">{cat}</div><div class="title">{title}</div>'
                   f'<div class="card" style="top:{card_y}px"><img src="{img}"></div>'
                   f'<svg class="ov" viewBox="0 0 1080 1920">{"".join(svg)}</svg>{"".join(texts)}{src()}')


# ------------------------------------------------------------------ 1 · INTRO
def intro():
    star = lambda x, y, r: '<polygon fill="#FFDE00" points="' + ' '.join(f'{x + (r if i % 2 == 0 else r * .42) * math.cos(-math.pi / 2 + i * math.pi / 5):.1f},{y + (r if i % 2 == 0 else r * .42) * math.sin(-math.pi / 2 + i * math.pi / 5):.1f}' for i in range(10)) + '"/>'
    flag = f'<svg class="abs" style="left:610px;top:350px" width="96" height="64"><rect width="96" height="64" rx="10" fill="#DE2910"/>{star(19,19,11)}{star(37,8,4)}{star(43,16,4)}{star(43,26,4)}{star(37,34,4)}</svg>'
    chips = [('55', 'Intelligence Index', '4e au monde'), ('67 %', 'Terminal-Bench 4.0', 'n°1 mondial'), ('2,11 $', 'par tâche', '5,98 $ pour Opus 5.5')]
    ch = ''.join(f'<div style="display:flex;align-items:center;gap:26px;background:#16171F;border:2px solid #2C2E3A;border-radius:24px;padding:16px 28px">'
                 f'<div style="font-weight:900;font-size:56px;color:#56BCD6;min-width:210px">{v}</div>'
                 f'<div style="font-weight:700;font-size:32px;line-height:1.15">{a}<div style="font-weight:500;font-size:26px;color:#9698A2">{b}</div></div></div>' for v, a, b in chips)
    svg = underline(484, 838, 962, '#F06E2D', seed=2) + hand_arrow(290, 1600, 470, 1570, '#F2C94C', -0.3, seed=4)
    return page(1,
        f'<div class="abs" style="left:390px;top:370px;width:300px;height:300px;border-radius:70px;background:#20232f;display:flex;align-items:center;justify-content:center;'
        f'box-shadow:0 0 120px rgba(86,188,214,.35),0 30px 80px rgba(0,0,0,.5);border:3px solid rgba(86,188,214,.35)"><img src="{ASSETS}/kimi.png" style="width:200px"></div>{flag}'
        '<div class="abs" style="left:0;right:0;top:715px;text-align:center;font-weight:900;font-size:108px;letter-spacing:-3px;line-height:1">Kimi <span style="color:#56BCD6">K3.1 Pro</span></div>'
        '<div class="abs" style="left:60px;right:60px;top:850px;text-align:center;font-weight:700;font-size:44px;line-height:1.25">Le nouveau modèle chinois,<br>meilleur que <span id="op" style="color:#F06E2D">Claude Opus 5.5</span> ?</div>'
        f'<div class="abs" style="left:60px;width:830px;top:1040px;display:flex;flex-direction:column;gap:16px">{ch}</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:90px;top:1560px;font-size:64px;color:#F2C94C;transform:rotate(-4deg)">swipe</div>')


# ------------------------------------------------------------------ CONCLUSION
def verdict(n):
    rows = [('Intelligence', '55', '58', 'o'), ('Terminal-Bench', '67 %', '60 %', 'k'), ('GDPval', '1 846', '1 866', 'o'),
            ('AutomationBench', '73 %', '70 %', 'k'), ('GDP.pdf', '31 %', '26 %', 'k'), ('Long contexte', '86 %', '85 %', 'k'),
            ('Vitesse (t/s)', '58', '96', 'o'), ('Coût / tâche', '2,11 $', '5,98 $', 'k')]
    r = ''
    for lab, k, o, w in rows:
        ck = '#56BCD6' if w == 'k' else '#5E616D'; co = '#F06E2D' if w == 'o' else '#5E616D'
        r += (f'<div style="display:grid;grid-template-columns:230px 1fr 230px;align-items:center;background:#16171F;border:2px solid #2C2E3A;border-radius:18px;height:72px">'
              f'<div style="text-align:center;font-weight:800;font-size:36px;color:{ck}">{k}</div><div style="text-align:center;font-weight:600;font-size:26px;color:#9698A2">{lab}</div>'
              f'<div style="text-align:center;font-weight:800;font-size:36px;color:{co}">{o}</div></div>')
    tile = lambda img, bg: f'<div style="width:96px;height:96px;border-radius:22px;background:{bg};display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(0,0,0,.45)"><img src="{img}" style="width:70%"></div>'
    head = (f'<div class="abs" style="left:60px;width:830px;top:465px;display:grid;grid-template-columns:230px 1fr 230px;align-items:center;justify-items:center">'
            f'{tile(ASSETS + "/kimi.png", "#20232f")}<div style="font-weight:900;font-size:60px;color:#E5484D">VS</div>{tile(ASSETS + "/anthropic.webp", "#FAF9F5")}</div>')
    svg = circle(175, 1278, 150, 46, '#56BCD6', seed=3)
    return page(n, '<div class="cat">LE VERDICT</div><div class="title">Kimi <b>vs</b> Opus 5.5</div>' + head +
        f'<div class="abs" style="left:60px;width:830px;top:585px;display:flex;flex-direction:column;gap:10px">{r}</div>'
        '<div class="abs" style="left:60px;width:830px;top:1252px;display:grid;grid-template-columns:230px 1fr 230px;font-weight:900;font-size:40px">'
        '<div style="text-align:center;color:#56BCD6">5 victoires</div><div></div><div style="text-align:center;color:#F06E2D">3 victoires</div></div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:70px;top:1345px;font-size:54px;color:#F2C94C;transform:rotate(-2deg)">Opus reste le plus intelligent…</div>'
        '<div class="hand" style="left:70px;top:1412px;font-size:54px;color:#F2C94C;transform:rotate(-2deg)">mais Kimi est presque au niveau,</div>'
        '<div class="hand" style="left:70px;top:1479px;font-size:54px;color:#46C281;transform:rotate(-2deg)">3× moins cher !</div>'
        + src('Opus 5.5 en effort max · Source : Artificial Analysis'))


# ------------------------------------------------------------------ ABONNEMENT
def abonnement(n, jour):
    ax, ay = AVATAR
    svg = hand_arrow(650, 1250, ax - 80, ay + 10, '#F2C94C', -0.35, seed=9, w=8) + circle(ax, ay, 78, 78, '#F2C94C', seed=5, w=6)
    return page(n,
        f'<div class="abs" style="left:390px;top:360px;width:300px;height:300px;border-radius:64px;overflow:hidden;box-shadow:0 0 110px rgba(70,255,140,.22),0 30px 80px rgba(0,0,0,.5)">'
        f'<img src="{ASSETS}/Logo principal — vert terminal@1x.png" style="width:100%;height:100%"></div>'
        '<div class="abs" style="left:60px;right:60px;top:720px;text-align:center;font-weight:800;font-size:62px;line-height:1.12">Ne rate plus aucune<br><span style="color:#46C281">actu IA</span></div>'
        '<div class="abs" style="left:150px;top:930px;width:540px;height:120px;border-radius:60px;background:#F06E2D;box-shadow:0 0 60px rgba(240,110,45,.5);'
        'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:58px;color:#10111a">Abonne-toi</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:250px;top:1100px;font-size:64px;color:#F2C94C;transform:rotate(-5deg)">c\'est juste ici !</div>'
        '<div class="abs" style="left:60px;width:830px;top:1340px;text-align:center;font-weight:600;font-size:36px;line-height:1.4;color:#9698A2">'
        f'Une vidéo <b style="color:#ECECF0">chaque jour</b><br>pendant <b style="color:#ECECF0">365 jours</b> · on en est au <b style="color:#F06E2D">jour {jour}</b></div>')


SLIDES = [intro()]
SLIDES.append(chart_slide(2, 'INTELLIGENCE', 'Le <b>4e</b> modèle le plus intelligent au monde', 'c_intel.png', 550, [
    ('circle', (316, 160), 62, 175, 'o'),
    ('arrow', 450, 1225, ('c', 330, 470), 'o', 0.2),
    ('text', 70, 1180, 'Kimi : 55 → #4 / 215', 'y', 68, -3),
    ('text', 70, 1290, 'à 3 points d\'Opus 5.5 (58)', 'w', 54, -2),
    ('text', 70, 1390, 'meilleur open weight dès le 4 nov. (+9 pts)', 'g', 46, -2)]))
SLIDES.append(chart_slide(3, 'VITESSE', 'Son point faible : il est <b>lent</b>', 'c_speed.png', 560, [
    ('circle', (544, 80), 40, 46, 'o'),
    ('arrow', 560, 960, ('c', 550, 150), 'o', 0.25),
    ('text', 70, 960, '58 tokens/s → #141 sur 186', 'y', 66, -3),
    ('text', 70, 1070, 'Claude Opus 5.5 : 96 tokens/s', 'w', 54, -2),
    ('text', 70, 1170, 'et très bavard : 150M tokens', 'c', 54, -2)]))
SLIDES.append(chart_slide(4, 'COÛT', 'Près de <b>3× moins cher</b> qu\'Opus&nbsp;5.5', 'c_cost.png', 550, [
    ('circle', (471, 330), 52, 70, 'o'),
    ('arrow', 360, 1185, ('c', 471, 420), 'o', -0.15),
    ('text', 70, 1180, 'Kimi : 2,11 $ / tâche', 'y', 66, -3),
    ('arrow', 620, 1300, ('c', 905, 300), 'w', 0.15),
    ('text', 70, 1290, 'Opus 5.5 : 5,98 $', 'w', 56, -2),
    ('text', 70, 1400, '≈ 2,8× moins cher', 'g', 64, -2), ('under', 70, 520, 1478, 'g')]))
SLIDES.append(chart_slide(5, 'RAPPORT QUALITÉ / PRIX', 'Sur la <b>frontière</b> intelligence&nbsp;/&nbsp;prix', 'c_scatter.png', 550, [
    ('circle', (692, 157), 34, 34, 'o'),
    ('arrow', 560, 1260, ('c', 700, 190), 'o', -0.2),
    ('text', 70, 1260, 'Kimi K3.1 Pro', 'y', 68, -3),
    ('text', 70, 1360, 'personne n\'est plus intelligent', 'w', 52, -2),
    ('text', 70, 1420, 'pour moins cher que lui', 'w', 52, -2), ('under', 70, 520, 1488, 'g')]))
SLIDES.append(chart_slide(6, 'AGENTS DE CODE', '<b>N°1 mondial</b> sur Terminal&#8209;Bench', 'c_tb.png', 550, [
    ('circle', (77, 30), 60, 34, 'o'),
    ('arrow', 210, 1170, ('c', 80, 320), 'o', -0.2),
    ('text', 230, 1150, '67 % : devant tout le monde', 'y', 62, -3),
    ('text', 70, 1280, 'Claude Sonnet 5.5 : 64 %', 'w', 54, -2),
    ('text', 70, 1390, 'Kimi K3 faisait… 13 %', 'g', 62, -2), ('under', 70, 600, 1468, 'g')]))
SLIDES.append(chart_slide(7, 'TRAVAIL RÉEL', '<b>3e</b> sur GDPval, au coude&#8209;à&#8209;coude avec Opus', 'c_gdpval.png', 550, [
    ('circle', (222, 25), 64, 32, 'o'),
    ('arrow', 300, 1170, ('c', 222, 320), 'o', -0.2),
    ('text', 320, 1150, '1 846 Elo', 'y', 68, -3),
    ('text', 70, 1280, 'Opus 5.5 : 1 866 (20 pts d\'écart)', 'w', 52, -2),
    ('text', 70, 1390, '+312 Elo vs Kimi K3', 'g', 62, -2), ('under', 70, 560, 1468, 'g')]))
SLIDES.append(chart_slide(8, 'AUTOMATISATION', '<b>2e</b> sur AutomationBench', 'c_auto.png', 550, [
    ('circle', (150, 32), 62, 34, 'o'),
    ('arrow', 300, 1170, ('c', 150, 320), 'o', -0.2),
    ('text', 320, 1150, '73 % : 2e sur 27', 'y', 66, -3),
    ('text', 70, 1280, 'devant Claude Opus 5.5 (70 %)', 'w', 52, -2),
    ('text', 70, 1390, 'Kimi K3 : 58 % → +15 pts', 'g', 62, -2), ('under', 70, 660, 1468, 'g')]))
SLIDES.append(chart_slide(9, 'DOCUMENTS PRO', '<b>2e</b> sur GDP.pdf', 'c_gdppdf.png', 550, [
    ('circle', (150, 32), 62, 34, 'o'),
    ('arrow', 300, 1170, ('c', 150, 320), 'o', -0.2),
    ('text', 320, 1150, '31 % : à 2 pts du n°1', 'y', 64, -3),
    ('text', 70, 1280, 'devant Claude Opus 5.5 (26 %)', 'w', 52, -2),
    ('text', 70, 1390, 'test très dur : max 33 %', 'c', 56, -2)]))
SLIDES.append(chart_slide(10, 'LONG CONTEXTE', 'Sur le <b>podium</b> en long contexte', 'c_lcr.png', 550, [
    ('circle', (222, 30), 64, 34, 'o'),
    ('arrow', 300, 1170, ('c', 222, 320), 'o', -0.2),
    ('text', 320, 1150, '86 % : 3e', 'y', 68, -3),
    ('text', 70, 1280, 'Claude Opus 5.5 : 85 %', 'w', 54, -2),
    ('text', 70, 1390, '1M tokens de contexte', 'c', 58, -2)]))
SLIDES.append(verdict(11))
SLIDES.append(abonnement(12, 18))

SAFE_OVERLAY = ('<div style="position:absolute;left:0;top:0;width:1080px;height:320px;background:rgba(255,0,0,.35)"></div>'
                '<div style="position:absolute;left:0;top:1660px;width:1080px;height:260px;background:rgba(255,0,0,.35)"></div>'
                '<div style="position:absolute;left:910px;top:860px;width:170px;height:800px;background:rgba(255,0,0,.35)"></div>'
                f'<div style="position:absolute;left:{AVATAR[0]-50}px;top:{AVATAR[1]-50}px;width:100px;height:100px;border-radius:50%;border:4px dashed #fff"></div>')

if __name__ == '__main__':
    only = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else range(1, len(SLIDES) + 1)
    safe = os.environ.get('SAFE')
    out = HERE / 'ctrl' if safe else OUT
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--allow-file-access-from-files'])
        pg = b.new_page(viewport={'width': W, 'height': H})
        for i in only:
            f = HERE / f'_slide_{i:02d}.html'
            f.write_text('<!doctype html><html><head><meta charset="utf-8"></head><body>' + SLIDES[i - 1] + (SAFE_OVERLAY if safe else '') + '</body></html>', encoding='utf-8')
            pg.goto(f.as_uri()); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
            pg.screenshot(path=str(out / f'{i:02d}-{NAME}.png'))
            f.unlink()
            print('ok', i, flush=True)
        b.close()
