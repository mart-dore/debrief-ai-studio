import pathlib, json, subprocess, sys, numpy as np, sherpa_onnx
M = str(pathlib.Path(__file__).resolve().parent.parent / "_env" / "asr" / "sherpa-onnx-whisper-small") + "/"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+"small-encoder.onnx", decoder=M+"small-decoder.onnx",
    tokens=M+"small-tokens.txt", language="fr", task="transcribe", num_threads=4)
runs = json.load(open("runs_texte.json", encoding="utf-8"))
raw = subprocess.check_output(["ffmpeg","-v","error","-i","voix_brute.wav","-ac","1","-ar","16000","-f","f32le","-"])
a = np.frombuffer(raw, np.float32)
for spec in sys.argv[1:]:
    i, j = map(int, spec.split("-")) if "-" in spec else (int(spec), int(spec))
    s, e = runs[i-1]["debut"], runs[j-1]["fin"]
    seg = np.concatenate([np.zeros(8000, np.float32), a[max(0,int((s-0.2)*16000)):int((e+0.35)*16000)], np.zeros(8000, np.float32)])
    st = rec.create_stream(); st.accept_waveform(16000, seg); rec.decode_stream(st)
    print(f"[{spec}] {s:6.2f}-{e:6.2f}  {st.result.text.strip()}", flush=True)
