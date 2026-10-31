import os, pathlib, re, subprocess, json, numpy as np, sherpa_onnx
M = str(pathlib.Path(__file__).resolve().parent.parent / "_env" / "asr" / "sherpa-onnx-whisper-small") + "/"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+"small-encoder.int8.onnx", decoder=M+"small-decoder.int8.onnx",
    tokens=M+"small-tokens.txt", language="fr", task="transcribe", num_threads=4)
WAV = "voix_brute.wav"
# seuil de silence : -38 dB par défaut ; monter à -30 si la prise est bruitée (aucun blanc détecté)
SEUIL, DMIN = os.environ.get("SEUIL", "-38"), os.environ.get("DMIN", "0.25")
dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",WAV]))
log = subprocess.run(["ffmpeg","-hide_banner","-i",WAV,"-af",f"silencedetect=noise={SEUIL}dB:d={DMIN}","-f","null","-"],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)] + [dur]
runs, t = [], 0.0
for s0, e0 in zip(st, en):
    if s0 - t > 0.05: runs.append([t, s0])
    t = e0
if dur - t > 0.05: runs.append([t, dur])
raw = subprocess.check_output(["ffmpeg","-v","error","-i",WAV,"-ac","1","-ar","16000","-f","f32le","-"])
a = np.frombuffer(raw, np.float32)
out = []
for s, e in runs:
    seg = a[max(0,int((s-0.12)*16000)):int((e+0.12)*16000)]
    stt = rec.create_stream(); stt.accept_waveform(16000, seg); rec.decode_stream(stt)
    txt = stt.result.text.strip()
    out.append({"debut": round(s,3), "fin": round(e,3), "texte": txt})
    print(f"{s:6.2f}-{e:6.2f}  {txt}", flush=True)
json.dump(out, open("runs_texte.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
