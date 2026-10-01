# `_env/` — ressources locales (non versionnées)

Ces fichiers sont trop lourds ou soumis à leur propre licence : ils ne sont pas dans le dépôt.
Les scripts les cherchent en chemin relatif (`../_env/...` depuis un dossier d'épisode).

```
_env/
├── fonts/
│   ├── Inter-Regular.otf … Inter-Black.otf     # https://github.com/rsms/inter (OFL)
│   └── caveat-latin-700-normal.woff2           # https://fonts.google.com/specimen/Caveat (OFL)
└── asr/
    └── sherpa-onnx-whisper-small/              # Whisper small exporté pour sherpa-onnx
        ├── small-encoder.onnx / .int8.onnx
        ├── small-decoder.onnx / .int8.onnx
        └── small-tokens.txt
```

Modèle Whisper : archive `sherpa-onnx-whisper-small.tar.bz2` des
[releases sherpa-onnx (asr-models)](https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models), à décompresser dans `_env/asr/`.
