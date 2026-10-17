"""Découpe les passages Whisper (runs_texte_whisper.json) aux micro-pauses -> runs_texte.json, puis décode chaque morceau.
DECODE=0 pour seulement écrire le json."""
import json, os, pathlib, subprocess, numpy as np
R = json.load(open("runs_texte_whisper.json", encoding="utf-8"))
# coupures internes (secondes, prises au milieu des micro-pauses)
CUTS = [3.24, 10.36, 12.36, 13.95, 16.28, 19.68, 23.86, 28.63, 32.62, 34.22, 35.34, 44.54, 59.10, 62.04, 62.72,
        78.85, 80.30, 85.01, 106.96, 109.18, 110.05, 113.04, 144.18, 168.25]
runs = []
for r in R:
    a, b = r["debut"], r["fin"]
    cs = [c for c in CUTS if a + 0.05 < c < b - 0.05]
    pts = [a] + cs + [b]
    for s, e in zip(pts, pts[1:]):
        runs.append({"debut": round(s, 3), "fin": round(e, 3), "texte": r["texte"] if not cs else ""})
# resserre chaque bord sur la parole (les coupes tombent au milieu d'un blanc)
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", "voix_brute.wav", "-af", "silencedetect=noise=-36dB:d=0.06", "-f", "null", "-"], capture_output=True, text=True).stderr
import re
sil = list(zip([float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)], [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]))
for r in runs:
    for s, e in sil:
        if s <= r["debut"] < e: r["debut"] = round(e, 3)
        if s < r["fin"] <= e: r["fin"] = round(s, 3)
if os.environ.get("DECODE", "1") == "1":
    import sherpa_onnx
    M = str(pathlib.Path(__file__).resolve().parent.parent / "_env" / "asr" / "sherpa-onnx-whisper-small") + "/"
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M + "small-encoder.int8.onnx", decoder=M + "small-decoder.int8.onnx",
        tokens=M + "small-tokens.txt", language="fr", task="transcribe", num_threads=4)
    a = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", "voix_brute.wav", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"]), np.float32)
    for r in runs:
        if r["texte"]: continue
        seg = np.concatenate([np.zeros(8000, np.float32), a[int((r["debut"] - 0.05) * 16000):int((r["fin"] + 0.12) * 16000)], np.zeros(8000, np.float32)])
        st = rec.create_stream(); st.accept_waveform(16000, seg); rec.decode_stream(st); r["texte"] = st.result.text.strip()
for i, r in enumerate(runs, 1):
    print(f"{i:3d} {r['debut']:7.2f}-{r['fin']:7.2f}  {r['texte']}", flush=True)
json.dump(runs, open("runs_texte.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
