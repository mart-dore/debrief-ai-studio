"""Carrousel TikTok « Les skills Claude à installer » (Jour 21) — Le Débrief IA.
Usage : python gen.py ; SAFE=1 python gen.py (contrôle des zones TikTok)."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from _lib import *  # noqa

NAME = 'claude-skills'
JOUR = 21
C = {'ponytail': '#56BCD6', 'caveman': '#F06E2D', 'impeccable': '#F2C94C', 'creator': '#46C281'}


def logo(img, size, bg='#16171F', pad=0.72, glow='rgba(86,188,214,.25)'):
    return (f'<div style="flex:none;width:{size}px;height:{size}px;border-radius:{int(size * .24)}px;background:{bg};display:flex;align-items:center;justify-content:center;'
            f'overflow:hidden;border:2px solid #2C2E3A;box-shadow:0 0 80px {glow},0 18px 50px rgba(0,0,0,.5)"><img src="{ASSETS}/{img}" style="width:{int(pad * 100)}%"></div>')


def cmd(lines, top, col):
    rows = ''.join(f'<div><span style="color:{col}">›</span>&nbsp; {l}</div>' for l in lines)
    return (f'<div class="abs" style="left:60px;width:830px;top:{top}px;background:#0B0C12;border:2px solid #2C2E3A;border-radius:20px;padding:20px 26px">'
            '<div style="font-weight:800;font-size:22px;letter-spacing:4px;color:#5E616D;margin-bottom:10px">INSTALLATION</div>'
            f'<div style="font-weight:600;font-size:29px;line-height:1.5;color:#ECECF0">{rows}</div></div>')


def head(cat, col, title, img, bg='#16171F', pad=0.72):
    return (f'<div class="cat" style="color:{col}">{cat}</div>'
            f'<div class="title" style="width:740px">{title}</div>'
            f'<div class="abs" style="left:850px;top:345px">{logo(img, 150, bg, pad, col + "44")}</div>')


# ------------------------------------------------------------------ 1 · HOOK
def intro():
    chips = [('ponytail.png', '#16171F', .8, C['ponytail'], '−53 % de code', 'Ponytail'),
             ('caveman.png', '#0B0C12', 1, C['caveman'], '63 → 20 tokens', 'Caveman'),
             ('impeccable.png', '#0E0E0E', 1, C['impeccable'], 'fini le design « IA »', 'Impeccable')]
    ch = ''.join(f'<div style="display:flex;align-items:center;gap:26px;background:#16171F;border:2px solid #2C2E3A;border-radius:24px;padding:14px 24px">'
                 f'{logo(img, 84, bg, pad, "transparent")}<div><div style="font-weight:900;font-size:44px;color:{col}">{v}</div>'
                 f'<div style="font-weight:600;font-size:28px;color:#9698A2">{n}</div></div></div>' for img, bg, pad, col, v, n in chips)
    svg = underline(255, 560, 868, '#F06E2D', seed=2) + hand_arrow(300, 1580, 480, 1550, '#F2C94C', -0.3, seed=4)
    return page(1,
        '<div class="abs" style="left:0;right:0;top:350px;display:flex;justify-content:center">'
        '<div style="background:#F06E2D;color:#10111a;font-weight:800;font-size:28px;letter-spacing:3px;padding:10px 26px;border-radius:40px">CLAUDE CODE · 3 SKILLS GRATUITS</div></div>'
        f'<div class="abs" style="left:450px;top:430px">{logo("claude.png", 180, "#16171F", .7, "rgba(240,110,45,.35)")}</div>'
        '<div class="abs" style="left:0;right:0;top:650px;text-align:center;font-weight:900;font-size:88px;letter-spacing:-3px;line-height:1.05">'
        'Ton Claude gaspille<br><span style="color:#F06E2D">la moitié</span> de tes tokens</div>'
        f'<div class="abs" style="left:60px;width:830px;top:930px;display:flex;flex-direction:column;gap:14px">{ch}</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:90px;top:1535px;font-size:64px;color:#F2C94C;transform:rotate(-4deg)">swipe</div>'
        '<div class="hand" style="left:520px;top:1520px;font-size:46px;color:#9698A2;transform:rotate(-3deg)">à installer ce soir</div>')


# ------------------------------------------------------------------ 2 · C'EST QUOI UN SKILL
def definition(n):
    doc = ('<div class="abs" style="left:110px;top:560px;width:230px;height:290px;border-radius:20px;background:#ECECF0;box-shadow:0 24px 60px rgba(0,0,0,.5);padding:26px 22px">'
           '<div style="font-weight:900;font-size:30px;color:#10111a">SKILL.md</div>'
           + ''.join(f'<div style="height:12px;border-radius:6px;background:#C9CAD2;margin-top:{22 if i == 0 else 16}px;width:{[90, 70, 85, 60, 78, 50][i]}%"></div>' for i in range(6)) + '</div>')
    svg = hand_arrow(380, 700, 580, 700, '#F2C94C', -0.15, seed=3)
    pts = [('Un fichier d\'<b>instructions</b> que Claude lit quand il en a besoin', '#56BCD6'),
           ('Il apprend une <b>façon de travailler</b> : coder court, parler court, designer propre…', '#F06E2D'),
           ('S\'installe en <b>une commande</b>, marche à chaque session', '#46C281')]
    p = ''.join(f'<div style="display:flex;gap:22px;align-items:flex-start"><div style="flex:none;width:18px;height:18px;border-radius:50%;background:{c};margin-top:14px"></div>'
                f'<div style="font-weight:600;font-size:36px;line-height:1.3">{t}</div></div>' for t, c in pts)
    return page(n, '<div class="cat">LA BASE</div><div class="title">C\'est quoi <b>un skill</b>&nbsp;?</div>' + doc
        + f'<div class="abs" style="left:620px;top:580px">{logo("claude.png", 230, "#16171F", .7, "rgba(240,110,45,.35)")}</div>'
        + f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:390px;top:610px;font-size:44px;color:#F2C94C;transform:rotate(-4deg)">lit</div>'
        f'<div class="abs" style="left:60px;width:820px;top:950px;display:flex;flex-direction:column;gap:30px">{p}</div>'
        '<div class="hand" style="left:80px;top:1440px;font-size:56px;color:#F2C94C;transform:rotate(-2deg)">un super-pouvoir en 1 commande</div>')


# ------------------------------------------------------------------ 3 · PONYTAIL
def ponytail(n):
    col = C['ponytail']
    bars = ('<div class="abs" style="left:60px;width:830px;top:560px;font-weight:700;font-size:32px;color:#9698A2">Tu demandes : <span style="color:#ECECF0">« Ajoute un sélecteur de date »</span></div>'
            '<div class="abs" style="left:60px;top:640px;font-weight:700;font-size:28px;color:#9698A2">Sans skill</div>'
            '<div class="abs" style="left:60px;top:685px;width:830px;height:74px;border-radius:14px;background:#3A3C48;display:flex;align-items:center;justify-content:flex-end;padding-right:24px;font-weight:900;font-size:40px">335 lignes</div>'
            f'<div class="abs" style="left:60px;top:790px;font-weight:700;font-size:28px;color:{col}">Avec Ponytail</div>'
            f'<div class="abs" style="left:60px;top:835px;width:44px;height:74px;border-radius:14px;background:{col};box-shadow:0 0 40px {col}88"></div>'
            f'<div class="abs" style="left:126px;top:845px;font-weight:900;font-size:48px;color:{col}">10 lignes</div>')
    stats = ''.join(f'<div style="flex:1;background:#16171F;border:2px solid #2C2E3A;border-radius:20px;padding:16px 0;text-align:center">'
                    f'<div style="font-weight:900;font-size:46px;color:{col}">{v}</div><div style="font-weight:600;font-size:26px;color:#9698A2">{l}</div></div>'
                    for v, l in [('−53 %', 'de code'), ('−41 %', 'de temps'), ('−26 %', 'de coût')])
    svg = hand_arrow(560, 1000, 420, 880, '#F2C94C', 0.25, seed=6)
    return page(n, head('SKILL N°1 · PONYTAIL', col, 'Le dev senior <b>flemmard</b>', 'ponytail.png', '#16171F', .82) + bars
        + f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:500px;top:985px;font-size:48px;color:#F2C94C;transform:rotate(-3deg)">il utilise le navigateur !</div>'
        f'<div class="abs" style="left:60px;width:830px;top:1080px;display:flex;gap:16px">{stats}</div>'
        '<div class="hand" style="left:80px;top:1235px;font-size:48px;color:#46C281;transform:rotate(-2deg)">et 98 % du code risqué testé (68 % sans)</div>'
        + cmd(['/plugin marketplace add DietrichGebert/ponytail', '/plugin install ponytail@ponytail'], 1325, col)
        + src('Benchmark du créateur : 39 tâches, Opus 5.5, Claude Code · github.com/DietrichGebert/ponytail'))


# ------------------------------------------------------------------ 4 · CAVEMAN
def caveman(n):
    col = C['caveman']
    bub = lambda txt, who, tok, c, bg, top, h: (
        f'<div class="abs" style="left:60px;width:830px;top:{top}px;height:{h}px;background:{bg};border:2px solid {c};border-radius:24px;padding:20px 26px">'
        f'<div style="display:flex;justify-content:space-between;font-weight:800;font-size:24px;letter-spacing:3px;color:{c}"><span>{who}</span><span>{tok}</span></div>'
        f'<div style="font-weight:600;font-size:30px;line-height:1.35;margin-top:10px">{txt}</div></div>')
    svg = underline(80, 520, 1132, '#46C281', seed=4)
    return page(n, head('SKILL N°2 · CAVEMAN', col, 'Claude parle comme un <b>homme des cavernes</b>', 'caveman.png', '#0B0C12', 1.0)
        + bub('Ton composant React se re-rend probablement parce que tu crées une nouvelle référence d\'objet à chaque rendu. '
              'En passant un objet en prop, React le voit comme différent à chaque fois… Je te recommande useMemo.', 'CLAUDE NORMAL', '63 TOKENS', '#5E616D', '#16171F', 560, 270)
        + bub('Nouvel objet à chaque rendu → React re-rend. Mets la prop dans <b>useMemo</b>.', 'CAVEMAN', '20 TOKENS', col, '#2A1A12', 860, 150)
        + f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:80px;top:1040px;font-size:62px;color:#46C281;transform:rotate(-2deg)">même correctif, 3× plus court</div>'
        '<div class="hand" style="left:80px;top:1150px;font-size:50px;color:#ECECF0;transform:rotate(-2deg)">mode Auto : −54 % de coût, même score</div>'
        + cmd(['npx skills add JuliusBrussee/caveman -g'], 1260, col)
        + '<div class="abs" style="left:60px;width:830px;top:1440px;font-weight:600;font-size:24px;line-height:1.4;color:#5E616D">'
          'Exemple traduit du repo (tokens comptés en anglais). JetBrains : aucune perte de qualité mesurée sur 86 tâches.</div>'
        + src('Source : github.com/JuliusBrussee/caveman'))


# ------------------------------------------------------------------ 5 · IMPECCABLE
def impeccable(n):
    col = C['impeccable']
    slop = ['Dégradés violet → bleu partout', 'Des cartes dans des cartes', 'Texte gris sur fond coloré', 'La même icône au-dessus de chaque titre']
    s = ''.join(f'<div style="display:flex;align-items:center;gap:20px;font-weight:600;font-size:32px">'
                f'<div style="flex:none;width:44px;height:44px;border-radius:12px;background:#E5484D22;border:2px solid #E5484D;color:#E5484D;font-weight:900;font-size:30px;display:flex;align-items:center;justify-content:center">×</div>{t}</div>' for t in slop)
    cmds = ''.join(f'<div style="background:#16171F;border:2px solid {col}66;border-radius:14px;padding:10px 18px;font-weight:700;font-size:28px;color:{col}">/{c}</div>'
                   for c in ['audit', 'critique', 'polish', 'bolder', 'animate', 'typeset'])
    return page(n, head('SKILL N°3 · IMPECCABLE', col, 'Fini le design <b>« fait par IA »</b>', 'impeccable.png', '#0E0E0E', 1.0)
        + '<div class="abs" style="left:60px;top:560px;font-weight:800;font-size:26px;letter-spacing:4px;color:#E5484D">CE QU\'IL CHASSE</div>'
        f'<div class="abs" style="left:60px;width:830px;top:610px;display:flex;flex-direction:column;gap:18px">{s}</div>'
        f'<div class="abs" style="left:60px;top:900px;font-weight:800;font-size:26px;letter-spacing:4px;color:{col}">24 COMMANDES, DONT…</div>'
        f'<div class="abs" style="left:60px;width:830px;top:950px;display:flex;flex-wrap:wrap;gap:12px">{cmds}</div>'
        '<div class="hand" style="left:80px;top:1105px;font-size:54px;color:#F2C94C;transform:rotate(-2deg)">62 règles anti « AI slop »</div>'
        + cmd(['npx impeccable install', '/impeccable init'], 1215, col)
        + src('Source : github.com/pbakaus/impeccable · impeccable.style'))


# ------------------------------------------------------------------ 6 · BONUS
def creator(n):
    col = C['creator']
    return page(n, head('BONUS · OFFICIEL ANTHROPIC', col, 'Crée <b>ton propre</b> skill', 'anthropic.webp', '#FAF9F5', .66)
        + '<div class="abs" style="left:60px;width:830px;top:560px;font-weight:600;font-size:34px;line-height:1.35;color:#9698A2">'
          'Le skill <b style="color:#ECECF0">skill-creator</b> transforme une demande en skill réutilisable.</div>'
        '<div class="abs" style="left:160px;width:730px;top:720px;background:#F06E2D;color:#10111a;border-radius:28px 28px 6px 28px;padding:24px 28px;font-weight:700;font-size:32px;line-height:1.3">'
        '« Crée un skill qui fait mes carrousels TikTok avec mon style »</div>'
        f'<div class="abs" style="left:60px;width:730px;top:900px;background:#16171F;border:2px solid {col};border-radius:28px 28px 28px 6px;padding:24px 28px;font-weight:600;font-size:30px;line-height:1.35">'
        f'<span style="color:{col};font-weight:800">Claude</span> écrit le SKILL.md : ta charte, tes polices, tes règles… et l\'utilise à chaque fois.</div>'
        '<div class="hand" style="left:80px;top:1130px;font-size:58px;color:#F2C94C;transform:rotate(-2deg)">ce carrousel ? fait avec</div>'
        '<div class="hand" style="left:80px;top:1205px;font-size:58px;color:#F2C94C;transform:rotate(-2deg)">mon propre skill</div>'
        + f'<svg class="ov" viewBox="0 0 1080 1920">{underline(80, 520, 1283, col, seed=8)}</svg>'
        + src('skill-creator : dispo dans Claude et sur github.com/anthropics/skills'))


# ------------------------------------------------------------------ 7 · RÉCAP
def recap(n):
    rows = [('ponytail.png', '#16171F', .82, 'Ponytail', 'Moins de code', C['ponytail']),
            ('caveman.png', '#0B0C12', 1, 'Caveman', 'Moins de tokens', C['caveman']),
            ('impeccable.png', '#0E0E0E', 1, 'Impeccable', 'Des interfaces propres', C['impeccable']),
            ('anthropic.webp', '#FAF9F5', .66, 'skill-creator', 'Tes propres skills', C['creator'])]
    r = ''.join(f'<div style="display:flex;align-items:center;gap:24px;background:#16171F;border:2px solid #2C2E3A;border-radius:22px;padding:14px 22px">'
                f'{logo(img, 80, bg, pad, "transparent")}<div style="flex:1;font-weight:900;font-size:40px;color:{c}">{nm}</div>'
                f'<div style="font-weight:600;font-size:30px;color:#ECECF0">{what}</div></div>' for img, bg, pad, nm, what, c in rows)
    return page(n, '<div class="cat">LE RÉCAP</div><div class="title">Ton <b>kit</b> Claude Code</div>'
        f'<div class="abs" style="left:60px;width:830px;top:520px;display:flex;flex-direction:column;gap:16px">{r}</div>'
        '<div class="hand" style="left:80px;top:1060px;font-size:56px;color:#ECECF0;transform:rotate(-2deg)">Tous gratuits et open source</div>'
        '<div class="hand" style="left:80px;top:1170px;font-size:64px;color:#F2C94C;transform:rotate(-2deg)">Lequel tu installes en 1er ?</div>'
        '<div class="hand" style="left:80px;top:1255px;font-size:52px;color:#9698A2;transform:rotate(-2deg)">dis-le en commentaire</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{underline(80, 760, 1248, "#F2C94C", seed=9)}</svg>')


SLIDES = [intro(), definition(2), ponytail(3), caveman(4), impeccable(5), creator(6), recap(7), abonnement(8, JOUR)]

if __name__ == '__main__':
    run(SLIDES, NAME, __file__)
