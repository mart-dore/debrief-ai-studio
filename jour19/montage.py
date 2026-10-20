"""Montage final — Jour 19 · BATTLE Round 3 « Kimi K3.1 Pro vs Claude Opus 5.5 » (le site le plus stylé).
Entrées : voix_brute.wav, runs_texte.json (passages parlés détectés), txt.py (texte réellement dit), son_appli.wav (son de HOULE).
DRY=1 : voix resserrée + repères seulement. SKIP_RENDER=1 : sous-titres + assemblage à partir de video_calee.mp4."""
import json, subprocess, sys, math, re, os
from txt import TXT
VOIX = "voix_brute.wav"
RUNS = json.load(open("runs_texte.json", encoding="utf-8"))
RACINE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RACINE, "19-365-battle-round-3-site-style_final.mp4")
FPS = 30
assert len(TXT) == len(RUNS), (len(TXT), len(RUNS))
def run(cmd):
    subprocess.run(cmd, check=True)

# ---------- 1. resserrer les blancs ----------
MAXP = {0: 0.14, 1: 0.24, 2: 0.36, 3: 0.52, 4: 1.0}
GAP_SON = 4.6           # type 6 : la voix laisse la place au son de l'appli (encre jaune de HOULE)
PAD_IN, PAD_OUT = 0.04, 0.07
GARDE = [k for k in range(len(RUNS)) if TXT[k][1] != 5]
keep = [[max(0, RUNS[k]["debut"] - PAD_IN), RUNS[k]["fin"] + PAD_OUT] for k in GARDE]
segs = []
for j, (s, e) in enumerate(keep):
    segs.append(("voix", s, e))
    if j + 1 < len(keep):
        gap = keep[j + 1][0] - e
        k = GARDE[j]; ty = TXT[k][1]
        segs.append(("blanc", 1.45 if ty == 4 else GAP_SON if ty == 6 else max(0.0, min(gap, MAXP[ty])), ty))
LEAD = 0.15
mapping, t, SON_T0 = [], LEAD, None
for sg in segs:
    if sg[0] == "voix":
        mapping.append((sg[1], sg[2], t)); t += sg[2] - sg[1]
    else:
        if sg[2] == 6: SON_T0 = t
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
    try:
        run(["ffmpeg", "-v", "error", "-y", "-i", VOIX, "-/filter_complex", "audio_filter.txt", "-map", "[out]", "-ar", "48000", "voix_resserree.wav"])
    except subprocess.CalledProcessError:
        run(["ffmpeg", "-v", "error", "-y", "-i", VOIX, "-filter_complex_script", "audio_filter.txt", "-map", "[out]", "-ar", "48000", "voix_resserree.wav"])

U = [{"texte": TXT[k][0], "d": conv(r["debut"]), "f": conv(r["fin"])} for k, r in enumerate(RUNS)]
def at(i, frac=0.0, shift=0.0):  # i : numéro du passage (1 = premier)
    u = U[i - 1]
    return round(u["d"] + frac * (u["f"] - u["d"]) + shift, 3)

# ---------- 2. repères des animations ----------
def atw(i, mot, shift=0.0, after=0.0):  # repère sur un mot du passage i (position dans le texte)
    tx = TXT[i - 1][0]; k = tx.find(mot)
    assert k >= 0, (i, mot)
    return at(i, (k + after * len(mot)) / max(1, len(tx)) * 0.97 + 0.01, shift)
cues = {
    # accroche
    "hK": at(1, 0.0, -0.02), "hO": atw(1, "Opus"), "hGo": atw(1, "c'est parti"),
    "hookEnd": round(U[1]["d"] - 0.12, 3),
    # carte jour
    "day": round(U[1]["d"] - 0.12, 3), "dayN": atw(2, "19"), "dayM": atw(2, "deux modèles"), "dayReel": atw(2, "condition réelle"), "dayEnd": round(U[2]["d"] - 0.08, 3),
    # prompt
    "pr0": at(3, 0.0, -0.08), "prMeme": atw(3, "même prompt"), "prStyle": atw(3, "le plus stylé"), "prImp": atw(3, "impressionner"), "prEnd": at(3, 1.0),
    # efforts
    "kEff": atw(4, "Kimi", -0.12), "kMax": atw(4, "max"), "oEff": atw(4, "Opus", -0.12), "oExtra": atw(4, "extra"),
    # ellipse : 45 minutes plus tard
    "skip0": at(5, 0.0, -0.06), "skip45": atw(6, "45 minutes"), "skipEnd": at(6, 1.0, 0.05),
    # démo Kimi (AION)
    "k0": round(at(6, 1.0, 0.05), 3), "kName": atw(7, "Kimi"), "kPanel": atw(7, "propose"), "kEsp": atw(7, "espace"),
    "kMagn": atw(10, "magnifique"), "kDesign": atw(10, "design"), "kP3": atw(10, "page numéro 3"),
    "kTheme": atw(11, "thème"), "kVu": atw(11, "vu et revu"), "kVibe": atw(12, "vibe codé"),
    # démo Claude (HOULE)
    "c0": at(13, 0.0, -0.08), "c35": atw(13, "35 minutes"), "cName": atw(13, "Claude"), "cPanel": at(14, 0.0, -0.05),
    "cOrig": atw(16, "original"), "cDA": atw(16, "DA"), "cSon": atw(17, "son"),
    "cNotes": atw(18, "notes"), "cHarm": atw(19, "harmonies"), "cGenial": atw(19, "génial"),
    # coût
    "cost0": at(20, 0.0, -0.08), "oCost": atw(21, "Opus"), "o20": atw(21, "20 €"), "kCost": atw(22, "Kimi"), "k2": atw(22, "2 dollars"),
    # vote + verdict
    "v0": at(26, 0.0, -0.08), "vCom": atw(26, "commentaire"), "vVer": atw(26, "version"),
    "vMoi": atw(27, "Pour ma part"), "vCl": atw(27, "Claude"),
    "outro": at(27, 1.0, 0.75),
}
cues["sonT0"] = round(SON_T0, 3); cues["sonT1"] = round(SON_T0 + GAP_SON, 3)
total = round(cues["outro"] + 2.5, 3)
cues["end"] = total
# ---------- plans des captures (clip, début, fin, position source au début, vitesse, position source max) ----------
c = cues
def r(s0, s1, t0, t1): return (s1 - s0) / max(0.05, t1 - t0)
SH = [("oc", c["kEff"] - 0.1, c["oEff"] - 0.1, 1.2, 1.0, 3.5),
      ("cl", c["oEff"] - 0.1, c["skip0"] + 0.05, 0.6, 1.0, 2.3),
      ("run", c["skip0"] + 0.05, c["k0"] + 0.1, 0.0, r(0.0, 17.2, c["skip0"], c["skipEnd"]), 17.2),
      ("k", c["kPanel"] - 0.15, c["kP3"] - 0.15, 0.4, r(0.4, 13.6, c["kPanel"], c["kP3"] - 0.15), 13.4),
      ("k", c["kP3"] - 0.15, c["kVu"] - 0.1, 13.6, r(13.6, 19.6, c["kP3"], c["kVu"]), 19.6),
      ("k", c["kVu"] - 0.1, c["c0"] + 0.1, 20.1, r(20.1, 26.6, c["kVu"], c["c0"]), 26.6),
      ("c", c["cPanel"] - 0.15, c["cOrig"] - 0.1, 0.4, r(0.4, 9.5, c["cPanel"], c["cOrig"]), 9.8),
      ("c", c["cOrig"] - 0.1, c["sonT0"], 11.5, r(11.5, 24.3, c["cOrig"], c["sonT0"]), 24.3),
      ("c", c["sonT0"], c["sonT1"], 24.4, 1.0),                                   # son de l'appli : vitesse réelle
      ("c", c["sonT1"], c["cost0"] + 0.1, 24.4 + 4.6, 1.0, 34.0)]
cues["shots"] = [dict(zip(("clip", "t0", "t1", "s0", "rate", "smax"), sh)) for sh in SH]
cues["clips"] = json.load(open("clips.json"))
json.dump(cues, open("cues_final.json", "w"), indent=1)
for k, v in cues.items():
    if not isinstance(v, (list, dict)): print(f"{k:10s} {v:6.2f}")

# ---------- bruitages (repère, son, gain dB) ----------
SFX = [(c["hK"] - 0.06, "zoom", -9), (c["hK"], "impact", -6), (c["hO"] - 0.08, "whoosh", -12), (c["hO"], "impact", -8),
       (c["hGo"], "swish", -13), (c["hGo"] + 0.05, "glitch", -15),
       (c["day"], "whoosh", -15)] + [(c["day"] + 0.05 + 0.55 * k / 8, "tick", -20) for k in range(8)] + [(c["day"] + 0.62, "ding", -15),
       (c["dayM"], "pop", -15), (c["dayM"] + 0.15, "pop", -15),
       (c["pr0"], "whoosh", -14), (c["pr0"] + 0.3, "type", -16), (c["pr0"] + 1.0, "type", -17), (c["pr0"] + 1.7, "type", -17), (c["pr0"] + 2.4, "type", -18),
       (c["prStyle"], "pop", -15), (c["prImp"], "pop", -15),
       (c["kEff"], "whoosh", -13), (c["kMax"], "hit", -12), (c["oEff"], "whoosh", -13), (c["oExtra"], "hit", -12),
       (c["skip0"], "riser", -16)] + [(c["skip0"] + 0.18 * k, "tick", -21) for k in range(9)] + [(c["skip45"] + 0.35, "dingdong", -12),
       (c["kName"] - 0.08, "zoom", -10), (c["kName"], "impact", -7), (c["kPanel"], "whoosh", -15), (c["kEsp"], "pop", -15),
       (c["kMagn"], "ding", -15), (c["kP3"], "pop", -13), (c["kVu"], "hit", -12), (c["kVibe"] - 0.05, "impact", -8), (c["kVibe"], "glitch", -14),
       (c["c0"], "swish", -14), (c["c35"] + 0.3, "ding", -15), (c["cName"] - 0.08, "zoom", -9), (c["cName"], "impact", -5), (c["cPanel"], "whoosh", -15),
       (c["cDA"], "dingdong", -13), (c["cSon"], "pop", -15), (c["cNotes"], "pop", -15), (c["cGenial"], "ding", -13),
       (c["cost0"], "whoosh", -13), (c["oCost"], "pop", -14), (c["o20"] + 0.1, "ding", -15), (c["kCost"], "pop", -14), (c["k2"] + 0.1, "hit", -12),
       (c["v0"], "swish", -14), (c["vCom"] - 0.1, "pop", -13), (c["vVer"], "pop", -15), (c["vVer"] + 0.15, "pop", -15),
       (c["vCl"] - 0.08, "impact", -6), (c["vCl"], "dingdong", -12),
       (c["outro"], "whoosh", -14), (c["outro"] + 0.25, "pop", -13), (c["outro"] + 0.9, "tick", -12), (c["outro"] + 1.0, "ding", -14)]
SFX = [s for s in SFX if s[0] >= 0 and not (c["sonT0"] - 0.1 < s[0] < c["sonT1"])]   # rien par-dessus le son de l'appli

if os.environ.get("DRY"):
    sys.exit()
# ---------- 3. rendu de l'animation ----------
if not os.environ.get("SKIP_RENDER"):
    run([sys.executable, "render_par.py", "video_calee.mp4", "cues_final.json", str(max(2, (os.cpu_count() or 4) // 2))])

# ---------- 4. sous-titres (dès le début, accroche comprise) ----------
MOTS_CLES = ["Kimi K3.1", "Opus 5.5", "Kimi", "Opus", "Claude", "Jour 19", "condition réelle", "même prompt", "le plus stylé", "m'impressionner",
             "effort max", "effort extra", "45 minutes plus tard", "superbe site", "l'espace", "magnifique", "page numéro 3", "vu et revu",
             "très vibe codé", "35 minutes", "hyper original", "la DA", "profiter du son", "jouer des notes", "harmonies", "c'est génial",
             "coût", "20 € par mois", "2 dollars", "en commentaire", "celle de Claude"]
MAXC = 26
PROTEGE = ["on va poser", "max et Opus", "que je préfère", "Kimi K3.1", "Opus 5.5", "c'est parti", "Jour 19", "deux modèles", "en condition réelle", "pour ça", "le même prompt", "le site",
           "le plus stylé", "dans le but", "de m'impressionner", "effort max", "effort extra", "45 minutes", "plus tard", "a fini",
           "ce superbe site", "le thème", "de l'espace", "c'est magnifique", "le design", "la page numéro 3", "En revanche", "pour le thème",
           "je trouve", "un peu", "du vu et revu", "très vibe codé", "En 35 minutes", "avait fini", "hyper original", "la DA",
           "est magnifique", "du son", "je vous laisse", "je peux", "des notes", "différentes harmonies", "c'est génial", "en termes de coût",
           "j'ai accès", "mon abonnement", "20 € par mois", "mis à la tâche", "ça m'a coûté", "un peu plus", "de 2 dollars",
           "me dire", "en commentaire", "la version", "vous avez préférée", "Pour ma part", "j'avoue", "celle de Claude"]
def morceaux(t, dur):
    for m in sorted(PROTEGE, key=len, reverse=True):
        t = t.replace(m, m.replace(" ", " "))
    return [p.replace(" ", " ") for p in _morceaux(t, dur)]
def _morceaux(t, dur, extra=0):
    mots = t.split(" ")
    k = max(1, min(math.ceil(len(t) / MAXC) + extra, max(1, int(dur / 0.33)), len(mots)))
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
    out = [o for o in out if o]
    if max(len(o) for o in out) > 30 and extra < 3 and k < len(mots):
        return _morceaux(t, dur, extra + 1)
    return out
caps = []
for i, u in enumerate(U):
    if TXT[i][1] == 5:
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
MC_RE = re.compile(r"(?<!\w)(" + "|".join(re.escape(x) for x in sorted(MOTS_CLES, key=len, reverse=True)) + r")(?!\w)")
def couleur(t):  # un seul passage : pas de mot-clé recoloré à l'intérieur d'un autre
    return MC_RE.sub(lambda g: "{\\c&H2D6EF0&}" + g.group(1) + "{\\c&HFFFFFF&}", t)
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

# ---------- 4 bis. bruitages + son de l'appli mixés sous la voix ----------
import wave, numpy as np
def lire(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()
vx = lire("voix_resserree.wav"); N = int(total * 48000) + 1
mix = np.zeros(N, np.float32); mix[:min(N, len(vx))] = vx[:N]
fx = np.zeros(N, np.float32); cache = {}
for t0, n, g in SFX:
    s = cache.setdefault(n, lire(os.path.join("sfx", n + ".wav")))
    i = int(t0 * 48000); j = min(N, i + len(s))
    if i < N: fx[i:j] += s[:j - i] * 10 ** (g / 20)
mix += fx
# son de HOULE pendant la pause « profiter du son » (fondu d'entrée/sortie, niveau ramené à celui de la voix)
ap = lire("son_appli.wav")[: int((GAP_SON + 0.6) * 48000)]
rv = np.sqrt(np.mean(vx[vx != 0] ** 2)); ra = np.sqrt(np.mean(ap ** 2)) + 1e-9
ap = ap * (0.85 * rv / ra)
L = len(ap); fade = np.ones(L, np.float32); fi, fo = int(0.25 * 48000), int(0.6 * 48000)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
i0 = int((cues["sonT0"] - 0.1) * 48000); j0 = min(N, i0 + L)
mix[i0:j0] += (ap * fade)[: j0 - i0]
pk = np.max(np.abs(mix)); ab = np.abs(mix); mix = np.where(ab > 0.9, np.sign(mix) * (0.9 + 0.08 * np.tanh((ab - 0.9) / 0.08)), mix)
with wave.open("voix_sfx.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("bruitages :", len(SFX), "| crête", round(float(pk), 3))
if os.environ.get("AUDIO_ONLY"):
    sys.exit()

# ---------- 5. assemblage (une seule version : avec sous-titres) ----------
run(["ffmpeg", "-v", "error", "-y", "-i", "video_calee.mp4", "-i", "voix_sfx.wav",
     "-vf", "subtitles=st_final.ass:fontsdir=../_env/fonts", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "20", "-preset", "slow",
     "-pix_fmt", "yuv420p", "-af", "apad", "-c:a", "aac", "-b:a", "192k", "-t", str(total), OUT])
print("ok", OUT, "durée", total)
