"""Extrait les images des captures utilisées (recadrées, à la taille d'affichage) -> frames/<clip>/0001.jpg et écrit clips.json.
Les recadrages évitent tout ce qui est personnel (barre latérale de Claude, « Martin · Pro », historique)."""
import json, os, subprocess
A = os.path.join("..", "..", "assets", "VIBECODINGBATTLE", "Round3")
PR, DEMO = os.path.join(A, "round3.1.mp4"), os.path.join(A, "Round3_2.mp4")
#          nom     source  début  fin   recadrage (x, y, w, h)       largeur affichée
CLIPS = [("cl",   PR,   2.3,  4.7,  (540, 1040, 680, 250),    1000),   # Claude : prompt + « Opus 5.5 Extra »
         ("oc",   PR,   7.0, 10.4,  (196, 545, 640, 160),     1000),   # OpenCode : « Kimi K3.1 Pro OpenRouter · max »
         ("run",  PR,  10.6, 27.9,  (8, 180, 1400, 840),      1000),   # Kimi qui réfléchit (accéléré)
         ("k",    DEMO, 0.0, 26.8,  (0, 128, 1472, 1208),     1000),   # AION (Kimi) localhost:8001
         ("c",    DEMO, 29.6, 63.7, (34, 112, 1412, 1224),    1000)]   # HOULE (Claude) localhost:8003
out = {}
for name, src, a, b, (x, y, w, h), dw in CLIPS:
    d = os.path.join("frames", name); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    dh = round(h * dw / w / 2) * 2
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-t", str(b - a), "-i", src,
                    "-vf", f"fps=30,crop={w}:{h}:{x}:{y},scale={dw}:{dh}:flags=lanczos", "-q:v", "3", os.path.join(d, "%04d.jpg")], check=True)
    n = len(os.listdir(d))
    out[name] = {"start": a, "n": n, "w": dw, "h": dh, "sx": dw / w, "cx": x, "cy": y}
    print(name, n, dw, dh, flush=True)
json.dump(out, open("clips.json", "w"), indent=1)
