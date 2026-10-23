"""Carrousel TikTok « GPT-6.1 Terra » — Le Débrief IA.
Images 1080x1920 ; tout le contenu reste dans la zone sûre TikTok (voir SAFE ci-dessous).
Usage : python gen.py            -> toutes les images dans ../../carrousels/gpt-6-1-terra/
        python gen.py 1,11       -> seulement ces images
        SAFE=1 python gen.py     -> superpose les zones masquées par TikTok (contrôle)"""
import math, os, random, pathlib, sys
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent                      # D:\Documents\Debrief-IA
OUT = ROOT / 'carrousels' / 'gpt-6-1-terra'
FONTS = (HERE.parent / '_env' / 'fonts').as_uri()
ASSETS = (ROOT / 'assets').as_uri()
NAME = 'gpt-6-1-terra'
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


def src(txt='Source : Artificial Analysis · 27 oct. 2026'):
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


# ------------------------------------------------------------------ 1 · INTRO (hook)
def intro():
    chips = [('0,40 $', 'par tâche', 'Opus 5.5 : 5,98 $'),
             ('62 %', 'sans hallucination', 'Opus 5.5 : 41 %'),
             ('91 t/s', 'de vitesse', 'plus rapide que GPT&#8209;6.1 Sol')]
    ch = ''.join(f'<div style="display:flex;align-items:center;gap:26px;background:#16171F;border:2px solid #2C2E3A;border-radius:24px;padding:14px 28px">'
                 f'<div style="font-weight:900;font-size:54px;color:#56BCD6;min-width:220px">{v}</div>'
                 f'<div style="font-weight:700;font-size:32px;line-height:1.15">{a}<div style="font-weight:500;font-size:26px;color:#9698A2">{b}</div></div></div>' for v, a, b in chips)
    svg = underline(150, 590, 897, '#F06E2D', seed=2) + hand_arrow(290, 1590, 470, 1560, '#F2C94C', -0.3, seed=4)
    return page(1,
        '<div class="abs" style="left:0;right:0;top:350px;display:flex;justify-content:center">'
        '<div style="background:#F06E2D;color:#10111a;font-weight:800;font-size:28px;letter-spacing:3px;padding:10px 26px;border-radius:40px">SORTI AUJOURD\'HUI</div></div>'
        f'<div class="abs" style="left:420px;top:430px;width:240px;height:240px;border-radius:60px;background:#fff;display:flex;align-items:center;justify-content:center;'
        f'box-shadow:0 0 120px rgba(86,188,214,.40),0 30px 80px rgba(0,0,0,.5)"><img src="{ASSETS}/openai.jpg" style="width:170px"></div>'
        '<div class="abs" style="left:0;right:0;top:700px;text-align:center;font-weight:900;font-size:104px;letter-spacing:-3px;line-height:1;white-space:nowrap">GPT-6.1 <span style="color:#56BCD6">Terra</span></div>'
        '<div class="abs" style="left:60px;right:60px;top:822px;text-align:center;font-weight:800;font-size:52px;line-height:1.38">'
        '<span style="color:#F06E2D">15× moins cher</span> qu\'Opus&nbsp;5.5…<br>mais est&#8209;il vraiment bon&nbsp;?</div>'
        f'<div class="abs" style="left:60px;width:830px;top:1010px;display:flex;flex-direction:column;gap:14px">{ch}</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:90px;top:1545px;font-size:64px;color:#F2C94C;transform:rotate(-4deg)">swipe</div>')


# ------------------------------------------------------------------ CONCLUSION
def verdict(n):
    rows = [('Intelligence', '48', '58', 'o'), ('Coût / tâche', '0,40 $', '5,98 $', 'k'), ('Vitesse (t/s)', '91', '98', 'o'),
            ('Sans hallucination', '62 %', '41 %', 'k'), ('Terminal-Bench', '56 %', '60 %', 'o'), ('TB-Science', '58 %', '59 %', 'o'),
            ('GDP.pdf', '29 %', '26 %', 'k'), ('GDPval (Elo)', '1 476', '1 866', 'o')]
    r = ''
    for lab, k, o, w in rows:
        ck = '#56BCD6' if w == 'k' else '#5E616D'; co = '#F06E2D' if w == 'o' else '#5E616D'
        r += (f'<div style="display:grid;grid-template-columns:230px 1fr 230px;align-items:center;background:#16171F;border:2px solid #2C2E3A;border-radius:18px;height:72px">'
              f'<div style="text-align:center;font-weight:800;font-size:36px;color:{ck}">{k}</div><div style="text-align:center;font-weight:600;font-size:26px;color:#9698A2">{lab}</div>'
              f'<div style="text-align:center;font-weight:800;font-size:36px;color:{co}">{o}</div></div>')
    tile = lambda img, bg: f'<div style="width:96px;height:96px;border-radius:22px;background:{bg};display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(0,0,0,.45)"><img src="{img}" style="width:70%"></div>'
    head = (f'<div class="abs" style="left:60px;width:830px;top:465px;display:grid;grid-template-columns:230px 1fr 230px;align-items:center;justify-items:center">'
            f'{tile(ASSETS + "/openai.jpg", "#fff")}<div style="font-weight:900;font-size:60px;color:#E5484D">VS</div>{tile(ASSETS + "/anthropic.webp", "#FAF9F5")}</div>')
    svg = circle(709, 1278, 150, 46, '#F06E2D', seed=3)
    return page(n, '<div class="cat">LE VERDICT</div><div class="title">Terra <b>vs</b> Opus 5.5</div>' + head +
        f'<div class="abs" style="left:60px;width:830px;top:585px;display:flex;flex-direction:column;gap:10px">{r}</div>'
        '<div class="abs" style="left:60px;width:830px;top:1252px;display:grid;grid-template-columns:230px 1fr 230px;font-weight:900;font-size:40px">'
        '<div style="text-align:center;color:#56BCD6">3 victoires</div><div></div><div style="text-align:center;color:#F06E2D">5 victoires</div></div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:70px;top:1345px;font-size:54px;color:#F2C94C;transform:rotate(-2deg)">Opus reste nettement au-dessus…</div>'
        '<div class="hand" style="left:70px;top:1412px;font-size:54px;color:#F2C94C;transform:rotate(-2deg)">mais Terra = 83 % de son niveau</div>'
        '<div class="hand" style="left:70px;top:1479px;font-size:54px;color:#46C281;transform:rotate(-2deg)">pour 15× moins cher !</div>'
        + src('Opus 5.5 et Terra en effort max · Source : Artificial Analysis'))


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
SLIDES.append(chart_slide(2, 'INTELLIGENCE', 'Pas le plus intelligent&nbsp;: <b>48</b>&nbsp;points', 'c_intel.png', 550, [
    ('circle', (454, 150), 44, 100, 'o'),
    ('arrow', 470, 1095, ('c', 454, 262), 'o', -0.2),
    ('text', 70, 1080, '48 → 25e / 221', 'y', 68, -3),
    ('text', 70, 1190, 'Opus 5.5 : 58 · GPT&#8209;6.1 Sol : 52', 'w', 52, -2),
    ('text', 70, 1290, 'mais regarde le prix… →', 'c', 56, -2)]))
SLIDES.append(chart_slide(3, 'COÛT', '<b>15× moins cher</b> qu\'Opus&nbsp;5.5', 'c_cost.png', 550, [
    ('circle', (210, 215), 46, 40, 'o'),
    ('arrow', 300, 1100, ('c', 210, 262), 'o', -0.15),
    ('text', 70, 1095, '0,40 $ / tâche', 'y', 70, -3),
    ('arrow', 620, 1205, ('c', 722, 330), 'w', 0.2),
    ('text', 70, 1200, 'Opus 5.5 : 5,98 $', 'w', 56, -2),
    ('text', 70, 1305, '8× moins cher que GPT&#8209;6 Astra', 'g', 54, -2), ('under', 70, 760, 1378, 'g')]))
SLIDES.append(chart_slide(4, 'VITESSE', 'Rapide&nbsp;: <b>91 tokens/s</b>', 'c_speed.png', 550, [
    ('circle', (338, 190), 46, 60, 'o'),
    ('arrow', 380, 1085, ('c', 338, 262), 'o', -0.15),
    ('text', 70, 1080, '91 tokens/s', 'y', 70, -3),
    ('text', 70, 1190, 'Opus 5.5 : 98 · Sol : 73 · Astra : 66', 'w', 50, -2),
    ('text', 70, 1290, 'contexte : 1M tokens', 'c', 56, -2)]))
SLIDES.append(chart_slide(5, 'FIABILITÉ', 'Il hallucine <b>moins qu\'Opus</b>', 'c_halluc.png', 550, [
    ('circle', (70, 62), 44, 34, 'o'),
    ('arrow', 260, 1150, ('c', 70, 290), 'o', -0.2),
    ('arrow', 660, 1255, ('c', 547, 290), 'w', 0.25),
    ('text', 280, 1130, '62 % sans hallucination', 'y', 62, -3),
    ('text', 70, 1250, 'Opus 5.5 : 41 % · Sol : 46 %', 'w', 54, -2),
    ('text', 70, 1350, 'le + fiable des GPT', 'g', 62, -2), ('under', 70, 520, 1428, 'g')]))
SLIDES.append(chart_slide(6, 'RECHERCHE SCIENTIFIQUE', '<b>4e</b> sur Terminal&#8209;Bench&#8209;Science', 'c_tbsci.png', 550, [
    ('circle', (189, 44), 44, 30, 'o'),
    ('arrow', 260, 1150, ('c', 189, 290), 'o', -0.2),
    ('text', 280, 1130, '58 %, comme Sol', 'y', 66, -3),
    ('text', 70, 1250, 'Opus 5.5 : 59 % (1 pt !)', 'w', 54, -2),
    ('text', 70, 1350, 'devant Sonnet 5.5 et Gemini 4', 'g', 54, -2)]))
SLIDES.append(chart_slide(7, 'AGENTS DE CODE', '<b>56 %</b> sur Terminal&#8209;Bench', 'c_tb.png', 550, [
    ('circle', (363, 48), 44, 30, 'o'),
    ('arrow', 420, 1150, ('c', 363, 290), 'o', 0.2),
    ('text', 70, 1130, '56 % : 8e', 'y', 66, -3),
    ('text', 70, 1240, 'pile le niveau de GPT&#8209;6.1 Sol', 'w', 54, -2),
    ('text', 70, 1340, 'Opus 5.5 : 60 % · Kimi : 67 %', 'c', 54, -2)]))
SLIDES.append(chart_slide(8, 'DOCUMENTS PRO', '<b>6e</b> sur GDP.pdf, devant Opus', 'c_gdppdf.png', 550, [
    ('circle', (276, 36), 44, 30, 'o'),
    ('arrow', 330, 1170, ('c', 276, 300), 'o', -0.15),
    ('text', 70, 1160, '29 %', 'y', 70, -3),
    ('text', 70, 1270, 'Claude Opus 5.5 : 26 %', 'w', 54, -2),
    ('text', 70, 1370, 'test très dur : max 33 %', 'c', 54, -2)]))
SLIDES.append(verdict(9))
SLIDES.append(abonnement(10, 19))

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
