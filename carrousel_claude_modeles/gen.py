"""Carrousel TikTok « Les modèles Claude » (Jour 20) — Le Débrief IA.
Peu de chiffres, des exemples concrets. Usage : python gen.py ; SAFE=1 python gen.py (contrôle)."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from _lib import *  # noqa

NAME = 'claude-modeles'
JOUR = 20
M = {  # couleur, rôle
    'Haiku':  ('#46C281', 'le sprinteur'),
    'Sonnet': ('#56BCD6', 'le bosseur'),
    'Opus':   ('#F06E2D', 'le stratège'),
    'Fable':  ('#F2C94C', 'le génie'),
}
STAR = f'{ASSETS}/anthropic.webp'


def tile(size, radius, glow='rgba(240,110,45,.35)'):
    return (f'<div style="width:{size}px;height:{size}px;border-radius:{radius}px;background:#FAF9F5;display:flex;align-items:center;justify-content:center;'
            f'box-shadow:0 0 110px {glow},0 24px 60px rgba(0,0,0,.5)"><img src="{STAR}" style="width:66%"></div>')


def dollars(k, col):
    return ''.join(f'<span style="color:{col if i < k else "#3A3C48"}">$</span>' for i in range(4))


def dots(k, col):
    return ''.join(f'<span style="display:inline-block;width:26px;height:26px;border-radius:50%;margin-right:8px;background:{col if i < k else "#3A3C48"}"></span>' for i in range(4))


# ------------------------------------------------------------------ 1 · HOOK
def intro():
    cards = ''
    for i, (m, (col, role)) in enumerate(M.items()):
        cards += (f'<div style="background:#16171F;border:2px solid #2C2E3A;border-left:10px solid {col};border-radius:24px;padding:22px 26px">'
                  f'<div style="font-weight:900;font-size:50px;color:{col}">{m}</div>'
                  f'<div style="font-weight:600;font-size:30px;color:#9698A2;margin-top:4px">{role}</div>'
                  f'<div style="font-weight:900;font-size:36px;margin-top:10px;letter-spacing:4px">{dollars(i + 1, col)}</div></div>')
    svg = underline(300, 610, 868, '#F06E2D', seed=2) + hand_arrow(300, 1560, 480, 1530, '#F2C94C', -0.3, seed=4)
    return page(1,
        '<div class="abs" style="left:0;right:0;top:350px;display:flex;justify-content:center">'
        '<div style="background:#F06E2D;color:#10111a;font-weight:800;font-size:28px;letter-spacing:3px;padding:10px 26px;border-radius:40px">4 MODÈLES · 4 MÉTIERS</div></div>'
        f'<div class="abs" style="left:440px;top:425px">{tile(200, 50)}</div>'
        '<div class="abs" style="left:0;right:0;top:660px;text-align:center;font-weight:900;font-size:94px;letter-spacing:-3px;line-height:1.02">'
        'Tu utilises<br>le <span style="color:#F06E2D">mauvais</span> Claude&nbsp;?</div>'
        f'<div class="abs" style="left:60px;width:830px;top:930px;display:grid;grid-template-columns:1fr 1fr;gap:16px">{cards}</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:90px;top:1515px;font-size:64px;color:#F2C94C;transform:rotate(-4deg)">swipe</div>'
        '<div class="hand" style="left:520px;top:1500px;font-size:46px;color:#9698A2;transform:rotate(-3deg)">lequel pour toi ?</div>')


# ------------------------------------------------------------------ 2 · L'ÉCHELLE
def echelle(n):
    bars = ''
    for i, (m, (col, role)) in enumerate(M.items()):
        h = 230 + i * 120
        x = 60 + i * 212
        bars += (f'<div class="abs" style="left:{x}px;top:{1380 - h}px;width:194px;height:{h}px;border-radius:22px 22px 8px 8px;'
                 f'background:linear-gradient(180deg,{col} 0%,{col}55 100%);box-shadow:0 0 50px {col}33">'
                 f'<div style="padding:18px 14px;font-weight:900;font-size:40px;color:#10111a">{m}</div>'
                 f'<div style="padding:0 14px;font-weight:700;font-size:24px;color:#10111acc">{role}</div></div>'
                 f'<div class="abs" style="left:{x}px;width:194px;top:1400px;text-align:center;font-weight:900;font-size:40px;letter-spacing:3px">{dollars(i + 1, col)}</div>')
    svg = hand_arrow(120, 1500, 760, 1500, '#ECECF0', -0.08, seed=3, w=5)
    return page(n, '<div class="cat">LA FAMILLE CLAUDE</div><div class="title">Du plus <b>rapide</b><br>au plus <span style="color:#F2C94C">puissant</span></div>'
        + bars + f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:250px;top:1520px;font-size:46px;color:#9698A2;transform:rotate(-1deg)">plus cher, plus puissant</div>'
        '<div class="hand" style="left:70px;top:600px;font-size:56px;color:#F2C94C;transform:rotate(-3deg)">Fable coûte 100× plus</div>'
        '<div class="hand" style="left:70px;top:665px;font-size:56px;color:#F2C94C;transform:rotate(-3deg)">cher que Haiku !</div>'
        + src('Prix par token · Source : docs Claude · oct. 2026'))


# ------------------------------------------------------------------ 3-6 · UN MODÈLE
def model_slide(n, m, version, tagline, power, price, uses, wow, note=None):
    col, role = M[m]
    u = ''.join(f'<div style="display:flex;align-items:center;gap:22px;background:#16171F;border:2px solid #2C2E3A;border-radius:22px;padding:18px 24px">'
                f'<div style="flex:none;width:52px;height:52px;border-radius:14px;background:{col};color:#10111a;font-weight:900;font-size:30px;display:flex;align-items:center;justify-content:center">{k + 1}</div>'
                f'<div style="font-weight:700;font-size:34px;line-height:1.2">{t}</div></div>' for k, t in enumerate(uses))
    w = ''.join(f'<div class="hand" style="left:80px;top:{1230 + k * 88}px;font-size:{70 if k == 0 else 56}px;color:{col if k == 0 else "#ECECF0"};transform:rotate(-2deg)">{t}</div>' for k, t in enumerate(wow))
    svg = underline(80, 80 + min(780, 30 * len(wow[0])), 1315, col, seed=n)
    return page(n,
        f'<div class="cat" style="color:{col}">{role.upper()}</div>'
        f'<div class="title" style="font-size:76px;width:760px">Claude <span style="color:{col}">{m} {version}</span></div>'
        f'<div class="abs" style="left:860px;top:350px">{tile(140, 36, col + "55")}</div>'
        f'<div class="abs" style="left:60px;width:790px;top:480px;font-weight:600;font-size:36px;color:#9698A2;line-height:1.3">{tagline}</div>'
        f'<div class="abs" style="left:60px;width:830px;top:580px;display:flex;gap:40px;align-items:center;font-weight:700;font-size:30px;color:#9698A2">'
        f'<div>Puissance&nbsp;&nbsp;{dots(power, col)}</div><div>Prix&nbsp;&nbsp;<span style="font-weight:900;font-size:40px;letter-spacing:3px">{dollars(price, col)}</span></div></div>'
        '<div class="abs" style="left:60px;top:665px;font-weight:800;font-size:28px;letter-spacing:4px;color:#ECECF0">POUR QUOI FAIRE ?</div>'
        f'<div class="abs" style="left:60px;width:830px;top:715px;display:flex;flex-direction:column;gap:14px">{u}</div>'
        f'<div class="abs" style="left:60px;top:1160px;font-weight:800;font-size:28px;letter-spacing:4px;color:{col}">L\'EFFET WOW</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>{w}'
        + (f'<div class="abs" style="left:60px;width:830px;top:1560px;font-weight:600;font-size:22px;color:#5E616D">{note}</div>' if note else ''))


# ------------------------------------------------------------------ 7 · LEQUEL CHOISIR
def choisir(n):
    rows = [('Trier, extraire, répondre en direct, en masse', 'Haiku'),
            ('Coder, analyser, rédiger au quotidien', 'Sonnet'),
            ('Gros projet, agent qui bosse des heures', 'Opus'),
            ('Opus bloque ? Zéro droit à l\'erreur ?', 'Fable')]
    r = ''.join(f'<div style="display:grid;grid-template-columns:1fr 70px 200px;align-items:center;background:#16171F;border:2px solid #2C2E3A;border-radius:22px;padding:22px 24px">'
                f'<div style="font-weight:700;font-size:32px;line-height:1.2">{q}</div><div style="text-align:center;font-weight:900;font-size:40px;color:#5E616D">→</div>'
                f'<div style="text-align:center;background:{M[m][0]};color:#10111a;border-radius:16px;padding:12px 0;font-weight:900;font-size:36px">{m}</div></div>' for q, m in rows)
    svg = underline(80, 700, 1440, '#46C281', seed=7)
    return page(n, '<div class="cat">LE GUIDE</div><div class="title">Lequel <b>choisir</b>&nbsp;?</div>'
        f'<div class="abs" style="left:60px;width:830px;top:520px;display:flex;flex-direction:column;gap:18px">{r}</div>'
        f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:80px;top:1290px;font-size:52px;color:#ECECF0;transform:rotate(-2deg)">Le conseil d\'Anthropic :</div>'
        '<div class="hand" style="left:80px;top:1365px;font-size:62px;color:#46C281;transform:rotate(-2deg)">commence par Opus 5.5</div>'
        + src('Source : docs Claude, « Choosing the right model »'))


# ------------------------------------------------------------------ 8 · ASTUCE EFFORT
def effort(n):
    lv = ['low', 'medium', 'high', 'xhigh', 'max']
    ticks = ''.join(f'<div class="abs" style="left:{90 + i * 180}px;top:820px;width:120px;text-align:center;font-weight:800;font-size:30px;color:{"#ECECF0" if i in (1, 2) else "#9698A2"}">{l}</div>' for i, l in enumerate(lv))
    knobs = ''.join(f'<div class="abs" style="left:{132 + i * 180}px;top:740px;width:36px;height:36px;border-radius:50%;background:{"#F06E2D" if i <= 2 else "#3A3C48"}"></div>' for i in range(5))
    svg = hand_arrow(180, 690, 860, 690, '#F2C94C', -0.06, seed=5)
    return page(n, '<div class="cat">L\'ASTUCE BONUS</div><div class="title">Avant de changer de modèle…<br><b>monte l\'effort</b></div>'
        '<div class="abs" style="left:150px;top:752px;width:720px;height:12px;border-radius:6px;background:linear-gradient(90deg,#F06E2D 0%,#F06E2D 50%,#3A3C48 50%)"></div>'
        + knobs + ticks + f'<svg class="ov" viewBox="0 0 1080 1920">{svg}</svg>'
        '<div class="hand" style="left:330px;top:590px;font-size:54px;color:#F2C94C;transform:rotate(-2deg)">plus de réflexion</div>'
        '<div class="abs" style="left:60px;width:830px;top:960px;font-weight:700;font-size:40px;line-height:1.35">'
        'Chaque Claude peut réfléchir <span style="color:#56BCD6">plus ou moins longtemps</span> avant de répondre.</div>'
        '<div class="abs" style="left:60px;width:830px;top:1140px;font-weight:600;font-size:34px;line-height:1.45;color:#9698A2">'
        'Par défaut, Opus 5.5 est en <b style="color:#ECECF0">medium</b>.<br>Sur une tâche dure, monte en <b style="color:#ECECF0">high</b> ou <b style="color:#ECECF0">max</b>.</div>'
        '<div class="hand" style="left:80px;top:1330px;font-size:56px;color:#46C281;transform:rotate(-2deg)">souvent mieux que changer de modèle</div>'
        + src('Dans Claude Code et l\'API · Source : docs Claude'))


SLIDES = [
    intro(),
    echelle(2),
    model_slide(3, 'Haiku', '5.5', 'Ultra rapide, ultra pas cher : le roi du volume.', 1, 1,
                ['Trier des milliers d\'e-mails ou de tickets', 'Extraire les infos d\'une facture', 'Chatbot qui répond en temps réel'],
                ['10 000 tickets triés', 'pour moins de 20 centimes', '10× moins cher que Haiku 4.5'],
                'Estimation : ~150 tokens lus et ~5 écrits par ticket, au tarif API.'),
    model_slide(4, 'Sonnet', '5.5', 'Le meilleur rapport vitesse / intelligence.', 2, 2,
                ['Coder une fonctionnalité', 'Analyser un fichier de données', 'Rédiger un rapport ou une présentation'],
                ['Il bat Opus 5.5 en agent de code', '(Terminal-Bench : 64 % vs 60 %)', 'pour 2× moins cher'],
                'Terminal-Bench 4.0, effort max · Source : Artificial Analysis'),
    model_slide(5, 'Opus', '5.5', 'Pour les projets longs et complexes.', 3, 3,
                ['Un agent qui code seul pendant des heures', 'Refondre une appli entière', 'Relire un contrat et trouver les failles'],
                ['N°1 mondial en intelligence', 'lit ~1 500 pages d\'un coup', '(1 million de tokens de contexte)'],
                'Artificial Analysis Intelligence Index, oct. 2026 · Contexte : docs Claude'),
    model_slide(6, 'Fable', '5.1', 'Le plus puissant ouvert au public.', 4, 4,
                ['Quand Opus bloque sur un problème', 'Recherche approfondie en plusieurs étapes', 'Livrer un doc, un tableur ou un deck fini'],
                ['Le même cerveau que Mythos', 'que seules quelques organisations', 'peuvent utiliser (+ garde-fous)'],
                'Mythos 5.1 est réservé à des organisations vérifiées · Source : Anthropic'),
    choisir(7),
    effort(8),
    abonnement(9, JOUR),
]

if __name__ == '__main__':
    run(SLIDES, NAME, __file__)
