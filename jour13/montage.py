"""Montage final — Jour 13 « L'histoire de DeepSeek ».
Entrées : voix_brute.wav, runs_texte.json (passages parlés détectés), txt.py (texte réellement dit).
DRY=1 : voix resserrée + repères seulement. SKIP_RENDER=1 : sous-titres + assemblage à partir de video_calee.mp4."""
import json, subprocess, sys, math, re, os
from txt import TXT
VOIX = "voix_brute.wav"
RUNS = json.load(open("runs_texte.json", encoding="utf-8"))
RACINE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RACINE, "13-365-histoire-deepseek_final.mp4")
FPS = 30
assert len(TXT) == len(RUNS), (len(TXT), len(RUNS))
def run(cmd):
    subprocess.run(cmd, check=True)

# ---------- 1. resserrer les blancs ----------
MAXP = {0: 0.14, 1: 0.24, 2: 0.36, 3: 0.52, 4: 1.0}  # resserré pour plus de rythme
PAD_IN, PAD_OUT = 0.04, 0.07
# type 5 = passage coupé (toux, bruit, raté) : retiré de la voix et des sous-titres
GARDE = [k for k in range(len(RUNS)) if TXT[k][1] != 5]
keep = [[max(0, RUNS[k]["debut"] - PAD_IN), RUNS[k]["fin"] + PAD_OUT] for k in GARDE]
segs = []
for j, (s, e) in enumerate(keep):
    segs.append(("voix", s, e))
    if j + 1 < len(keep):
        gap = keep[j + 1][0] - e
        k = GARDE[j]
        segs.append(("blanc", 1.45 if TXT[k][1] == 4 else max(0.0, min(gap, MAXP[TXT[k][1]]))))
LEAD = 0.15
mapping, t = [], LEAD
for sg in segs:
    if sg[0] == "voix":
        mapping.append((sg[1], sg[2], t)); t += sg[2] - sg[1]
    else:
        t += sg[1]
voice_len = t
def conv(x):
    for a, b, n in mapping:
        if x < a:
            return n
        if x <= b:
            return n + (x - a)
    a, b, n = mapping[-1]
    return n + (b - a)

filt, labels = [f"anullsrc=r=48000:cl=mono,atrim=0:{LEAD}[s0]"], ["[s0]"]
for k, sg in enumerate(segs):
    if sg[0] == "voix":
        d = sg[2] - sg[1]
        filt.append(f"[0:a]atrim={sg[1]:.3f}:{sg[2]:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={max(0, d - 0.03):.3f}:d=0.03[v{k}]")
        labels.append(f"[v{k}]")
    elif sg[1] > 0.005:
        filt.append(f"anullsrc=r=48000:cl=mono,atrim=0:{sg[1]:.3f}[b{k}]"); labels.append(f"[b{k}]")
filt.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1,highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=9[out]")
open("audio_filter.txt", "w").write(";\n".join(filt))
if not os.environ.get("SKIP_AUDIO"):
    # ffmpeg ≥ 7 : « -/filter_complex fichier » ; versions plus anciennes : « -filter_complex_script fichier »
    try:
        run(["ffmpeg", "-v", "error", "-y", "-i", VOIX, "-/filter_complex", "audio_filter.txt", "-map", "[out]", "-ar", "48000", "voix_resserree.wav"])
    except subprocess.CalledProcessError:
        run(["ffmpeg", "-v", "error", "-y", "-i", VOIX, "-filter_complex_script", "audio_filter.txt", "-map", "[out]", "-ar", "48000", "voix_resserree.wav"])

U = [{"texte": TXT[k][0], "d": conv(r["debut"]), "f": conv(r["fin"])} for k, r in enumerate(RUNS)]
def at(i, frac=0.0, shift=0.0):  # i : numéro du passage (1 = premier)
    u = U[i - 1]
    return round(u["d"] + frac * (u["f"] - u["d"]) + shift, 3)

# ---------- 2. repères des animations ----------
hook_end = round(U[4]["d"] - 0.12, 3)  # avant « Jour 13 sur 365 »
cues = {
    "hookEnd": hook_end, "card": hook_end,
    "hPerdu": at(3, 0.32),          # « ce qu'a perdu Nvidia »
    "hJour": at(3, 0.78),           # « en une journée »
    "hDS": at(4, 0.5),              # « à cause de DeepSeek »
    "s0": at(6, shift=-0.05),       # « et aujourd'hui on va voir… »
    "fonds": at(6, 0.45),           # « un fonds spéculatif »
    "p200": at(6, 0.74),            # « moins de 200 personnes »
    "trembler": at(7, 0.3),         # « faire trembler »
    "geant": at(7, 0.68),           # « le géant américain »
    "s1": at(8, shift=-0.1),        # « Tout commence avec… »
    "liang": at(8, 0.55),           # « Liang Wenfeng »
    "y2015": at(9, 0.15),           # « En 2015 »
    "hf": at(10, 0.0),              # « High-Flyer »
    "ia": at(11, 0.78),             # « de l'IA »
    "trader": at(12, 0.25),         # « pour trader »
    "sB": at(18, shift=-0.1),       # « Et pour ça »
    "milliers": at(19, 0.45),       # « des milliers de cartes graphiques »
    "nvidia": at(19, 0.86),         # « Nvidia »
    "a100": at(20, 0.4),            # « 10 000 A100 »
    "restr": at(21, 0.55),          # « la restriction américaine »
    "sC": at(22, shift=-0.1),       # « Puis, en 2023 »
    "y2023": at(22, 0.25),          # « en 2023 »
    "dsLaunch": at(22, 0.82),       # « il va lancer DeepSeek »
    "finance": at(23, 0.3),         # « financé »
    "propres": at(23, 0.78),        # « ses fonds propres »
    "s2": at(24, shift=-0.1),       # « Et le tremblement de terre… »
    "seisme": at(24, 0.3),          # « tremblement de terre »
    "date20": at(24, 0.68),         # « le 20 janvier 2025 »
    "r1": at(25, 0.7),              # « R1 »
    "raison": at(26, 0.3),          # « un modèle de raisonnement »
    "ouverts": at(26, 0.82),        # « aux poids ouverts »
    "app": at(27, 0.3),             # « l'application »
    "n1": at(27, 0.62),             # « numéro 1 »
    "j27": at(28, 0.78),            # « le 27 janvier »
    "nvPerd": at(29, 0.08),         # « Nvidia perd »
    "md600": at(29, 0.32),          # « 600 milliards de dollars »
    "seance": at(30, 0.4),          # « en une seule séance »
    "record": at(31, 0.4),          # « un record »
    "sSix": at(32, shift=-0.1),     # « En même temps, DeepSeek avait annoncé »
    "entr": at(32, 0.8),            # « son entraînement »
    "sixM": at(33, 0.55),           # « 6 millions de dollars »
    "preced": at(34, 0.75),         # « sans précédent »
    "debat": at(35, 0.82),          # « très débattu »
    "s3": at(36, shift=-0.1),       # « Et depuis… »
    "echelle": at(36, 0.78),        # « changé d'échelle »
    "ext": at(37, 0.72),            # « des investisseurs extérieurs »
    "md7": at(39, 0.45),            # « 7 milliards de dollars »
    "etat": at(45, 0.62),           # « un fonds étatique chinois »
    "valo": at(46, 0.45),           # « une valorisation »
    "md50": at(46, 0.72),           # « 50 milliards de dollars »
    "fondateur": at(48, 0.1),       # « son fondateur »
    "main": at(48, 0.8),            # « garde la main »
    "publier": at(49, 0.55),        # « continuer à publier »
    "ouverte": at(49, 0.86),        # « en source ouverte »
    "chine": at(50, 0.55),          # « la mentalité chinoise »
    "outro": at(51, shift=-0.1),    # « Si tu ne veux rien manquer… »
    "abo": at(51, 0.82),            # « abonne-toi »
    "next": at(52, 0.05),           # « Demain »
    "j14": at(52, 0.7),             # « le jour 14 »
}
total = round(max(voice_len, U[-1]["f"]) + 1.3, 3)
cues["end"] = total
json.dump(cues, open("cues_final.json", "w"), indent=1)
for k, v in cues.items():
    print(f"{k:10s} {v:6.2f}")

if os.environ.get("DRY"):
    sys.exit()
# ---------- 3. rendu de l'animation ----------
if not os.environ.get("SKIP_RENDER"):
    run([sys.executable, "render_par.py", "video_calee.mp4", "cues_final.json", str(max(2, (os.cpu_count() or 4) // 2))])

# ---------- 4. sous-titres (dès le début, accroche comprise) ----------
MOTS_CLES = ["600 milliards de dollars", "Nvidia", "DeepSeek", "Jour 13", "fonds spéculatif", "200 personnes", "géant américain",
             "Liang Wenfeng", "2015", "High-Flyer", "l'IA", "trader", "cartes graphiques", "10 000 A100", "restriction américaine", "2023",
             "fonds propres", "tremblement de terre", "20 janvier 2025", "R1", "poids ouverts", "numéro 1", "27 janvier", "une seule séance",
             "record", "6 millions de dollars", "sans précédent", "débattu", "d'échelle", "investisseurs extérieurs", "7 milliards de dollars",
             "fonds étatique chinois", "50 milliards de dollars", "garde la main", "source ouverte", "mentalité chinoise", "abonne-toi",
             "jour 14", "open source"]
MAXC = 26
PROTEGE = ["600 milliards", "milliards de dollars", "millions de dollars", "Jour 13", "sur 365", "fonds spéculatif", "200 personnes", "géant américain",
           "Liang Wenfeng", "En 2015", "de l'IA", "pour trader", "cartes graphiques", "10 000 A100", "restriction américaine", "en 2023", "fonds propres",
           "de terre", "20 janvier 2025", "poids ouverts", "numéro 1", "États-Unis", "27 janvier", "une seule séance", "un record", "6 millions",
           "sans précédent", "très débattu", "d'échelle", "investisseurs extérieurs", "7 milliards", "fonds étatique chinois", "50 milliards",
           "garde la main", "source ouverte", "mentalité chinoise", "abonne-toi", "jour 14", "open source", "son entraînement", "valorisation boursière", "l'actu IA", "un peu", "la mentalité chinoise"]
def morceaux(t, dur):
    for m in PROTEGE:
        t = t.replace(m, m.replace(" ", "\u00a0"))
    return [p.replace("\u00a0", " ") for p in _morceaux(t, dur)]
def _morceaux(t, dur):
    mots = t.split(" ")
    k = max(1, min(math.ceil(len(t) / MAXC), max(1, int(dur / 0.33)), len(mots)))
    if k == 1:
        return [t]
    cible = len(t) / k
    out, ligne = [], ""
    for w in mots:
        if ligne and len(out) < k - 1 and len(ligne + " " + w) > cible + 3:
            out.append(ligne); ligne = w
        else:
            ligne = (ligne + " " + w).strip()
    out.append(ligne)
    return [o for o in out if o]
caps = []
for i, u in enumerate(U):
    if TXT[i][1] == 5:            # passage coupé
        continue
    parts = morceaux(u["texte"], u["f"] - u["d"])
    tot = sum(len(p) + 2 for p in parts)
    t0 = u["d"]
    for p in parts:
        e = t0 + (len(p) + 2) / tot * (u["f"] - u["d"])
        caps.append([p, t0, e]); t0 = e
for a, b in zip(caps, caps[1:]):
    if b[1] - a[2] < 0.6:
        a[2] = b[1]
    a[2] = min(max(a[2], a[1] + 0.5), b[1])
caps[-1][2] += 0.6
def ts(x):
    return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
def couleur(t):
    for m in sorted(MOTS_CLES, key=len, reverse=True):
        t = re.sub(rf"(?<![\w{{]){re.escape(m)}(?![\w}}])", r"{\\c&H2D6EF0&}" + m + r"{\\c&HFFFFFF&}", t)
    return t
with open("st_final.ass", "w", encoding="utf-8") as f:
    f.write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ST,Inter ExtraBold,74,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,7,2,2,110,170,430,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
    for p, a, b in caps:
        f.write(f"Dialogue: 0,{ts(a)},{ts(b)},ST,,0,0,0,,{{\\fad(50,0)}}{couleur(p)}\n")
print(len(caps), "sous-titres")
for p, a, b in caps:
    print(f"{a:6.2f}-{b:6.2f} {p}")

# ---------- 5. assemblage (une seule version : avec sous-titres) ----------
run(["ffmpeg", "-v", "error", "-y", "-i", "video_calee.mp4", "-i", "voix_resserree.wav",
     "-vf", "subtitles=st_final.ass:fontsdir=../_env/fonts", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "17", "-preset", "medium",
     "-pix_fmt", "yuv420p", "-af", "apad", "-c:a", "aac", "-b:a", "192k", "-t", str(total), OUT])
print("ok", OUT, "durée", total)
