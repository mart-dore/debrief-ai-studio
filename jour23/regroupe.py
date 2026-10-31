import pathlib, json, subprocess, numpy as np, sherpa_onnx
M = str(pathlib.Path(__file__).resolve().parent.parent / "_env" / "asr" / "sherpa-onnx-whisper-small") + "/"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+"small-encoder.onnx", decoder=M+"small-decoder.onnx",
    tokens=M+"small-tokens.txt", language="fr", task="transcribe", num_threads=4)
runs = json.load(open("runs_texte.json", encoding="utf-8"))
raw = subprocess.check_output(["ffmpeg","-v","error","-i","voix_brute.wav","-ac","1","-ar","16000","-f","f32le","-"])
a = np.frombuffer(raw, np.float32)
groups, cur = [], []
for i, r in enumerate(runs):
    if cur and r["fin"] - runs[cur[0]]["debut"] > 7.5:
        groups.append(cur); cur = []
    cur.append(i)
groups.append(cur)
for g in groups:
    s, e = runs[g[0]]["debut"], runs[g[-1]]["fin"]
    seg = a[max(0,int((s-0.15)*16000)):int((e+0.25)*16000)]
    st = rec.create_stream(); st.accept_waveform(16000, seg); rec.decode_stream(st)
    print(f"[{g[0]+1}-{g[-1]+1}] {s:6.2f}-{e:6.2f}  {st.result.text.strip()}", flush=True)
