"""Rendu parallèle : python render_par.py sortie.mp4 cues.json N"""
import sys, json, subprocess, pathlib
from concurrent.futures import ProcessPoolExecutor
FPS = 30
here = pathlib.Path(__file__).resolve().parent

def part(args):
    k, N, cues = args
    from playwright.sync_api import sync_playwright
    total = round(cues["end"] * FPS)
    a, b = total * k // N, total * (k + 1) // N
    out = f"part_{k}.mp4"
    with sync_playwright() as p:
        br = p.chromium.launch(args=["--allow-file-access-from-files", "--disable-web-security"])
        pg = br.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto((here / "index.html").as_uri())
        pg.evaluate("c => init(c)", cues)
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                                "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
        for i in range(a, b):
            pg.evaluate(f"draw({i / FPS})")
            enc.stdin.write(pg.screenshot(type="jpeg", quality=95))
            if (i - a) % 300 == 0:
                print(f"partie {k} : {i - a} / {b - a}", flush=True)
        enc.stdin.close(); enc.wait(); br.close()
    return out

if __name__ == "__main__":  # obligatoire sous Windows (processus lancés en « spawn »)
    OUT, CUES, N = sys.argv[1], sys.argv[2], int(sys.argv[3])
    cues = json.load(open(CUES, encoding="utf-8"))
    with ProcessPoolExecutor(N) as ex:
        parts = list(ex.map(part, [(k, N, cues) for k in range(N)]))
    open("parts.txt", "w").write("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "parts.txt", "-c", "copy", OUT], check=True)
    print("ok", OUT, round(cues["end"] * FPS), "images")
