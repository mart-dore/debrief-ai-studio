"""Montage final — Jour 23 · Mistral : Timestral, Voxtral 3, Mistral OCR.
Entrées : voix_brute.wav, runs_texte.json (passages parlés détectés), txt.py (texte réellement dit).
DRY=1 : voix resserrée + repères seulement. SKIP_RENDER=1 : sous-titres + assemblage à partir de video_calee.mp4."""
import json, subprocess, sys, math, re, os
from txt import TXT
VOIX = "voix_brute.wav"
RUNS = json.load(open("runs_texte.json", encoding="utf-8"))
RACINE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RACINE, "23-365-mistral-3-modeles_final.mp4")
FPS = 30
assert len(TXT) == len(RUNS), (len(TXT), len(RUNS))
def run(cmd):
    subprocess.run(cmd, check=True)

# ---------- 1. resserrer les blancs ----------
MAXP = {0: 0.14, 1: 0.24, 2: 0.36, 3: 0.52, 4: 1.0}
GAP_SON = 0.0
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
filt.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1,highpass=f=120,lowshelf=f=220:g=-7,equalizer=f=320:t=q:w=1.4:g=-2,equalizer=f=3500:t=q:w=1:g=4,highshelf=f=9000:g=2,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9[out]")
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
    # accroche : Large 4 pointé du doigt, puis les 3 modèles spécialisés
    "hDoigt": atw(1, "pointe du doigt"), "hL4": atw(1, "Mistral Large 4", -0.05), "hPense": atw(2, "pense"), "hNiv": atw(2, "pas au niveau"), "hMeil": atw(2, "meilleurs modèles"),
    "h3": at(3, 0.0, -0.1), "hMis": atw(3, "Mistral"), "hTrois": atw(3, "trois", -0.05), "hSpec": atw(3, "spécialisés"), "hMonde": atw(3, "meilleurs au monde"),
    "hookEnd": round(U[3]["d"] - 0.12, 3),
    "day": round(U[3]["d"] - 0.12, 3), "dayN": atw(4, "Jour 23"),
    # Timestral
    "ts": at(12, 0.0, -0.12), "tsN": atw(12, "Timestral", -0.05), "tsCal": atw(13, "mi-octobre", -0.05),
    "tsLLM": at(14, 0.0, -0.1), "tsLLMx": atw(14, "langage"),
    "tsSer": at(15, 0.0, -0.1), "tsSerW": atw(15, "séries temporelles"),
    "icV": atw(16, "vente"), "icC": atw(17, "conso"), "icS": atw(18, "capteurs"), "icB": atw(19, "bourse"),
    "tsHist": atw(20, "historique", -0.05), "tsSuite": atw(20, "la suite", -0.05), "tsMarge": atw(20, "marge d'erreur", -0.05),
    "tsFou": at(21, 0.0, -0.1), "ts209": atw(21, "209", -0.08), "tsPar": atw(21, "paramètres"),
    "tsPC": atw(22, "n'importe quel PC", -0.05), "tsGPU": atw(23, "carte graphique", -0.1),
    "tsOW": at(24, 0.0, -0.1), "tsOWo": atw(24, "open weight"), "tsDL": atw(24, "télécharger", -0.05),
    # Voxtral
    "vx": at(26, 0.0, -0.12), "vxN": atw(26, "Voxtral", -0.05), "vxTr": atw(27, "transcrire"), "vxLang": atw(27, "toutes les langues"),
    "vxCal": atw(28, "20 octobre", -0.05), "vxAA": atw(29, "Artificial Analysis", -0.05), "vxPod": atw(29, "podium", -0.05),
    "vx2": atw(30, "2 %", -0.08), "vxMal": atw(30, "mal transcrits"),
    "vxOW": at(31, 0.0, -0.1), "vxOWx": atw(31, "pas open weight"),
    # Mistral OCR
    "oc": at(36, 0.0, -0.12), "ocN": atw(36, "Mistral OCR", -0.05), "ocPDF": atw(37, "PDF"), "ocScan": atw(37, "scan"), "ocStr": atw(37, "texte structuré", -0.05),
    "oc170": atw(38, "170", -0.08), "ocAnn": atw(39, "annotateurs"), "ocPref": atw(39, "préfèrent"), "oc72": atw(39, "72 %", -0.08),
    "ocW": at(40, 0.0, -0.1), "ocWx": atw(40, "pas publics", -0.05), "ocAPI": atw(41, "API", -0.05), "ocEnt": atw(42, "entreprises", -0.05),
    # à retenir
    "rb": at(43, 0.0, -0.12), "rbMod": atw(44, "meilleurs modèles"), "rbCour": atw(45, "cour des grands"), "rbPrec": atw(45, "bien plus précis"),
    "rbTS": atw(46, "séries temporelles"), "rbOC": atw(47, "l'OCR"), "rbVX": atw(47, "transcription de voix"),
    # fin
    "outro": at(48, 0.0, -0.1), "abo": atw(48, "abonne-toi", -0.05), "dem": at(49, 0.0, -0.05), "dem24": atw(49, "Jour 24", -0.05),
}
total = round(U[-1]["f"] + 1.3, 3)
cues["end"] = total
json.dump(cues, open("cues_final.json", "w"), indent=1)
for k, v in cues.items():
    print(f"{k:10s} {v:6.2f}")
c = cues
# ---------- bruitages (repère, son, gain dB) ----------
SFX = [(0.02, "zoom", -10), (0.05, "impact", -7), (c["hDoigt"], "pop", -13), (c["hL4"], "hit", -11), (c["hNiv"], "glitch", -15), (c["hMeil"], "pop", -15),
       (c["h3"], "whoosh", -15), (c["hTrois"], "pop", -13), (c["hTrois"] + 0.18, "pop", -13), (c["hTrois"] + 0.36, "pop", -13), (c["hMonde"], "ding", -14),
       (c["day"], "whoosh", -15)] + [(c["day"] + 0.05 + 0.55 * k / 8, "tick", -20) for k in range(8)] + [(c["day"] + 0.62, "ding", -15),
       (c["ts"], "whoosh", -14), (c["tsN"], "impact", -9), (c["tsCal"], "pop", -13), (c["tsLLMx"], "hit", -12),
       (c["tsSer"], "swish", -15), (c["tsSerW"], "type", -19), (c["icV"], "pop", -14), (c["icC"], "pop", -14), (c["icS"], "pop", -14), (c["icB"], "pop", -14),
       (c["tsHist"], "tick", -14), (c["tsSuite"], "riser", -17), (c["tsMarge"], "ding", -16),
       (c["tsFou"], "whoosh", -15), (c["ts209"], "impact", -9), (c["tsPC"], "pop", -14), (c["tsGPU"], "pop", -14),
       (c["tsOWo"], "dingdong", -13), (c["tsDL"], "pop", -14),
       (c["vx"], "whoosh", -14), (c["vxN"], "impact", -9), (c["vxLang"], "type", -18), (c["vxCal"], "pop", -13), (c["vxAA"], "swish", -15),
       (c["vxPod"], "ding", -13), (c["vx2"], "hit", -12), (c["vxOWx"], "hit", -10),
       (c["oc"], "whoosh", -14), (c["ocN"], "impact", -9), (c["ocScan"], "riser", -18), (c["ocStr"], "ding", -15),
       (c["oc170"], "pop", -13), (c["ocAnn"], "pop", -15), (c["oc72"], "ding", -14), (c["ocWx"], "hit", -10), (c["ocAPI"], "pop", -14), (c["ocEnt"], "pop", -14),
       (c["rb"], "whoosh", -15), (c["rbCour"], "dingdong", -14), (c["rbTS"], "pop", -14), (c["rbOC"], "pop", -14), (c["rbVX"], "pop", -14),
       (c["outro"], "whoosh", -14), (c["outro"] + 0.25, "pop", -13), (c["abo"], "tick", -12), (c["abo"] + 0.1, "ding", -14), (c["dem24"], "pop", -14)]
SFX = [s for s in SFX if s[0] >= 0]
# souffles (whoosh, swish, zoom, riser) : réservés aux vrais changements de scène, jamais moins de 2,5 s d'écart (demande de Martin)
SOUFFLES = {"whoosh", "swish", "zoom", "riser"}
SCENES = [0.0, c["h3"], c["day"], c["ts"], c["tsSer"], c["tsSuite"], c["tsFou"], c["vx"], c["vxAA"], c["oc"], c["ocScan"], c["rb"], c["outro"]]
garde, dernier = [], -9.0
for s_ in sorted(SFX):
    if s_[1] in SOUFFLES:
        if min(abs(s_[0] - x) for x in SCENES) > 0.15 or s_[0] - dernier < 2.5:
            continue
        dernier = s_[0]
    garde.append(s_)
SFX = garde
print("souffles gardés :", [round(x[0], 2) for x in SFX if x[1] in SOUFFLES])

if os.environ.get("DRY"):
    sys.exit()
# ---------- 3. rendu de l'animation ----------
if not os.environ.get("SKIP_RENDER"):
    run([sys.executable, "render_par.py", "video_calee.mp4", "cues_final.json", str(max(2, (os.cpu_count() or 4) // 2))])

# ---------- 4. sous-titres (dès le début, accroche comprise) ----------
MOTS_CLES = ["Mistral Large 4", "Mistral OCR", "Jour 23", "Jour 24", "Timestral", "Voxtral", "trois modèles spécialisés", "meilleurs au monde",
             "pas au niveau", "mi-octobre", "séries temporelles", "la vente", "la conso", "des capteurs", "la bourse", "l'historique", "la suite",
             "marge d'erreur", "209 millions", "carte graphique", "open weight", "télécharger", "toutes les langues", "20 octobre", "Artificial Analysis",
             "podium", "2 %", "mal transcrits", "PDF", "scan", "texte structuré", "170 langues", "72 %", "pas publics", "API", "entreprises",
             "cour des grands", "bien plus précis", "l'OCR", "transcription de voix", "abonne-toi", "modèle de langage", "n'importe quel PC"]
MAXC = 26
PROTEGE = ["Tout le monde", "pointe du doigt", "Mistral Large 4", "et pense", "pas au niveau", "des meilleurs", "modèles d'IA", "Mais pendant", "ce temps-là,",
           "Mistral a sorti", "trois modèles", "spécialisés,", "qui sont parmi", "les meilleurs au monde.", "On décrypte", "ça ensemble", "Jour 23.",
           "Le premier,", "c'est Timestral,", "il est sorti", "mi-octobre.", "C'est pas", "un modèle", "de langage,", "ce qu'il prédit,", "c'est les",
           "séries temporelles.", "ça peut être", "de la vente,", "de la conso,", "des capteurs", "et même", "de la bourse.", "Tu lui donnes", "l'historique,",
           "il te sort", "la suite", "une certaine", "marge d'erreur.", "Et le plus fou", "dans tout ça,", "il ne fait que", "209 millions", "de paramètres,",
           "il tourne", "n'importe quel PC,", "avec ou sans", "carte graphique.", "Il est open weight,", "donc tu peux", "d'ores et déjà", "le télécharger.",
           "Le deuxième,", "c'est Voxtral.", "son but,", "de transcrire", "de l'audio", "toutes les langues.", "le 20 octobre", "au classement",
           "d'Artificial Analysis,", "il est sur", "le podium,", "à peine", "2 %", "de mots", "mal transcrits.", "Par contre,", "il est pas", "open weight.",
           "Et le dernier,", "c'est Mistral OCR,", "qui peut", "n'importe quel", "PDF ou scan", "un texte", "texte structuré.", "Il fonctionne", "170 langues,",
           "et tous les", "annotateurs", "qui l'ont essayé", "le préfèrent", "à ses concurrents", "72 %", "des cas.", "là encore,", "ses poids",
           "pas publics.", "Pour l'instant,", "il ne marche", "par API", "une version", "à installer", "les entreprises.", "En bref,", "à défaut",
           "de fournir", "modèles de langage,", "Mistral joue", "la cour des grands", "des domaines", "bien plus précis :", "les séries", "l'OCR ou",
           "la transcription", "de voix.", "si tu ne veux", "rien manquer", "des actus IA,", "abonne-toi !", "ce sera", "le Jour 24", "on abordera",
           "un nouveau sujet."]
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

# ---------- 4 bis. bruitages mixés sous la voix ----------
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
pk = np.max(np.abs(mix)); ab = np.abs(mix); mix = np.where(ab > 0.9, np.sign(mix) * (0.9 + 0.08 * np.tanh((ab - 0.9) / 0.08)), mix)
with wave.open("voix_sfx.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("bruitages :", len(SFX), "| crête", round(float(pk), 3))
if os.environ.get("AUDIO_ONLY"):
    sys.exit()

# ---------- 5. assemblage (une seule version : avec sous-titres) ----------
run(["ffmpeg", "-v", "error", "-y", "-i", "video_calee.mp4", "-i", "voix_sfx.wav",
     "-vf", "subtitles=st_final.ass:fontsdir=../_env/fonts", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "20", "-preset", os.environ.get("PRESET", "slow"),
     "-pix_fmt", "yuv420p", "-af", "apad", "-c:a", "aac", "-b:a", "192k", "-t", str(total), OUT])
print("ok", OUT, "durée", total)
