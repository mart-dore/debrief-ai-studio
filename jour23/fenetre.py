"""Décode des fenêtres de temps précises de voix_brute.wav (pour lever un doute sur un mot).
Usage : python fenetre.py 3.2-6.0 [7-9.5 ...]  (modèle non quantifié)"""
import pathlib, subprocess, sys, numpy as np, sherpa_onnx
M = str(pathlib.Path(__file__).resolve().parent.parent / "_env" / "asr" / "sherpa-onnx-whisper-small") + "/"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+"small-encoder.onnx", decoder=M+"small-decoder.onnx",
    tokens=M+"small-tokens.txt", language="fr", task="transcribe", num_threads=4)
raw = subprocess.check_output(["ffmpeg","-v","error","-i","voix_brute.wav","-ac","1","-ar","16000","-f","f32le","-"])
a = np.frombuffer(raw, np.float32)
for spec in sys.argv[1:]:
    s, e = map(float, spec.split("-"))
    seg = np.concatenate([np.zeros(8000, np.float32), a[int(s*16000):int(e*16000)], np.zeros(8000, np.float32)])
    st = rec.create_stream(); st.accept_waveform(16000, seg); rec.decode_stream(st)
    print(f"[{s:5.2f}-{e:5.2f}]  {st.result.text.strip()}", flush=True)
