"""Rendu image par image de index.html -> MP4 (1080x1920, 30 i/s).
Usage : python3 render.py sortie.mp4 [cues.json] [t1,t2,... pour des images de contrôle]"""
import sys, json, subprocess, pathlib
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
cues = json.load(open(sys.argv[2])) if len(sys.argv) > 2 and sys.argv[2] != '-' else None
stills = [float(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 else None
FPS = 30
here = pathlib.Path(__file__).resolve().parent
with sync_playwright() as p:
    b = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.on("console", lambda m: print("console:", m.text))
    pg.on("pageerror", lambda e: print("PAGE ERROR:", e))
    pg.goto((here / "index.html").as_uri())
    CUE = pg.evaluate("c => init(c)", cues)
    if stills:
        for t in stills:
            pg.evaluate(f"draw({t})")
            pg.screenshot(path=f"{OUT}_{t:05.2f}.png")
    else:
        n = round(CUE["end"] * FPS)
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                                "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
        for i in range(n):
            pg.evaluate(f"draw({i / FPS})")
            enc.stdin.write(pg.screenshot(type="png"))
            if i % 150 == 0: print(i, "/", n, flush=True)
        enc.stdin.close(); enc.wait()
    b.close()
