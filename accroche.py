"""Écran d'accroche Le Débrief IA — vidéo verticale 1080x1920, 30 i/s.

Usage :
    python3 accroche.py config.json <dossier_assets> sortie.mp4

config.json (exemple) :
{
  "ligne1": "C'est quoi",
  "ligne2": ["un ", "harnais", " IA ?"],     # le 2e élément = mot-clé en orange gras
  "logos": [{"fichier": "claude.png", "nom": "Claude Code"},
            {"fichier": "OpenClaw_logo.webp", "nom": "OpenClaw"}],
  "duree": 3.0
}
Le titre est visible dès la première image (elle sert de vignette).
Style : une seule police (Inter, jamais d'italique), un seul petit titre,
aucune phrase de sous-titre à l'écran que la voix off ne dit pas.
Tout le contenu reste dans la zone sûre TikTok (y 380 à 1500).
"""
import sys, os, json, glob, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CFG = json.load(open(sys.argv[1], encoding="utf-8"))
ASSETS, OUT_MP4 = sys.argv[2], sys.argv[3]
W, H, FPS = 1080, 1920, 30
DUR = float(CFG.get("duree", 3.0))

BG, BG_GLOW = (18, 18, 26), (27, 28, 36)
WHITE, GREY, ORANGE, CARD = (236, 236, 240), (150, 152, 162), (240, 110, 45), (255, 255, 255)

def font(patterns, size):
    for p in patterns:
        hits = glob.glob(p, recursive=True)
        if hits:
            return ImageFont.truetype(hits[0], size)
    return ImageFont.load_default(size)

SANS = ["/usr/share/fonts/**/Inter-SemiBold.otf", "/usr/share/fonts/**/DejaVuSans-Bold.ttf"]
TITRE = ["/usr/share/fonts/**/Inter-Bold.otf", "/usr/share/fonts/**/DejaVuSans-Bold.ttf"]
TITRE_B = ["/usr/share/fonts/**/Inter-ExtraBold.otf", "/usr/share/fonts/**/DejaVuSans-Bold.ttf"]

f_eyebrow, f_label = font(SANS, 34), font(SANS, 40)

# titre : taille réduite automatiquement si la ligne dépasse 920 px
probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
size = 104
while True:
    f_serif, f_serif_b = font(TITRE, size), font(TITRE_B, size)
    l2 = CFG["ligne2"]
    w2 = sum(probe.textlength(t, font=f_serif_b if i == 1 else f_serif) for i, t in enumerate(l2))
    if max(w2, probe.textlength(CFG["ligne1"], font=f_serif)) <= 920 or size <= 70:
        break
    size -= 4

logos = CFG.get("logos", [])
n = len(logos)
GAP = 36
TILE = min(270, int((960 - GAP * max(0, n - 1)) / max(1, n)))

def make_tile(path):
    tile = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    mask = Image.new("L", (TILE, TILE), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, TILE - 1, TILE - 1], int(TILE * 0.13), fill=255)
    tile.paste(Image.new("RGBA", (TILE, TILE), CARD + (255,)), (0, 0), mask)
    lg = Image.open(path).convert("RGBA")
    inner = int(TILE * 0.88)
    lg.thumbnail((inner, inner), Image.LANCZOS)
    tile.alpha_composite(lg, ((TILE - lg.width) // 2, (TILE - lg.height) // 2))
    return tile

tiles = [(make_tile(os.path.join(ASSETS, l["fichier"])), l["nom"]) for l in logos]

base = Image.new("RGB", (W, H), BG)
glow = Image.new("L", (W, H), 0)
ImageDraw.Draw(glow).ellipse([W/2-520, 700-520, W/2+520, 700+520], fill=255)
base = Image.composite(Image.new("RGB", (W, H), BG_GLOW), base, glow.filter(ImageFilter.GaussianBlur(160)))

ease = lambda x: 1 - (1 - max(0.0, min(1.0, x))) ** 3
def back(x):
    x = max(0.0, min(1.0, x)); c = 1.6
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def centered(d, y, text, f, fill):
    d.text(((W - d.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)
def mix(c, a):
    return tuple(int(c[k] * a + BG[k] * (1 - a)) for k in range(3))

def frame(t):
    im = base.copy().convert("RGBA")
    d = ImageDraw.Draw(im)
    d.rectangle([W/2 - 60, 0, W/2 + 60, 6], fill=ORANGE)
    centered(d, 380, "LE DÉBRIEF IA", f_eyebrow, GREY)
    d.rectangle([W/2 - 40, 432, W/2 + 40, 436], fill=ORANGE)

    centered(d, 500, CFG["ligne1"], f_serif, WHITE)
    l2 = CFG["ligne2"]
    fonts = [f_serif_b if i == 1 else f_serif for i in range(len(l2))]
    total = sum(d.textlength(t_, font=f) for t_, f in zip(l2, fonts))
    x = (W - total) / 2
    y2 = 500 + int(size * 1.25)
    kx = kw = 0
    for i, (t_, f) in enumerate(zip(l2, fonts)):
        if i == 1:
            kx, kw = x, d.textlength(t_, font=f)
        d.text((x, y2), t_, font=f, fill=ORANGE if i == 1 else WHITE)
        x += d.textlength(t_, font=f)
    u = ease(t / 0.45)
    yu = y2 + int(size * 1.45)
    if u > 0.01 and kw:
        d.rectangle([kx, yu, kx + kw * u, yu + 6], fill=ORANGE)

    row_w = n * TILE + (n - 1) * GAP
    x0 = (W - row_w) / 2
    cy = 1080
    for i, (tile, lab) in enumerate(tiles):
        p = back((t - 0.25 - i * 0.15) / 0.35)
        if p <= 0:
            continue
        tw = max(1, int(TILE * p))
        tt = tile.resize((tw, tw), Image.LANCZOS)
        a = min(1.0, (t - 0.25 - i * 0.15) / 0.2)
        if a < 1:
            tt.putalpha(tt.getchannel("A").point(lambda v: int(v * a)))
        cx = x0 + i * (TILE + GAP) + TILE / 2
        im.alpha_composite(tt, (int(cx - tw / 2), int(cy - tw / 2)))
        lw = d.textlength(lab, font=f_label)
        d.text((cx - lw / 2, cy + TILE / 2 + 26), lab, font=f_label, fill=mix(WHITE, min(1, a)))

    return im.convert("RGB")

with tempfile.TemporaryDirectory() as tmp:
    for i in range(int(DUR * FPS)):
        frame(i / FPS).save(os.path.join(tmp, f"h{i:04d}.png"))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", os.path.join(tmp, "h%04d.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", OUT_MP4], check=True)
print("accroche :", OUT_MP4)
