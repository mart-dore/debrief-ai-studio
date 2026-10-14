---
name: "debrief-ia-video"
description: "Monter une vidéo TikTok/YouTube « Le Débrief IA » de Martin (actu quotidienne Jour X/365 ou hors-série concept) : script, animation, calage sur sa voix off, sous-titres."
---

# Vidéos « Le Débrief IA »

Vidéos verticales 1080×1920, 30 i/s. Le dossier de travail est la racine du projet (`D:\Documents\Debrief-IA`) : logos et images dans `assets`, outils dans `outils`. Travailler sur des copies.

## Environnement local (Windows, installé le 14/10/2026)
- `python` (3.12), pas `python3`. Paquets pip : `playwright` (+ `python -m playwright install chromium`), `sherpa-onnx`, `numpy`.
- ffmpeg 9 (winget `Gyan.FFmpeg`, avec libass). S'il n'est pas dans le PATH du shell (session ouverte avant l'installation), préfixer :
  `export PATH="/c/Users/Martin/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin:$PATH"`
- `outils/_env/fonts/` : Inter (Regular → Black, OTF), chargée par `index.html` en chemin relatif `../_env/fonts/` et par les sous-titres via `subtitles=st_final.ass:fontsdir=../_env/fonts`. Rien à installer dans Windows.
- `outils/_env/asr/sherpa-onnx-whisper-small/` : Whisper small (encodeur/décodeur normal et int8). Les scripts le trouvent en relatif (`../_env/asr/...`).
- Un dossier d'épisode doit donc rester à `outils/<episode>/` pour que les chemins relatifs marchent. Les logos sont lus directement dans `../../assets/` (pas de copie). Une image manquante est signalée dans la console (`IMAGE MANQUANTE : …`) sans bloquer le rendu.
- ffmpeg 9 : `-filter_complex_script` n'existe plus, utiliser `-/filter_complex fichier.txt`. `montage.py` essaie `-/filter_complex` puis bascule sur `-filter_complex_script` (ffmpeg plus ancien, ex. session cloud Linux où l'on lance `python3`).
- `render_par.py` a la garde `if __name__ == "__main__"` (obligatoire sous Windows). Machine 16 cœurs : `montage.py` lance le rendu sur `cpu_count // 2` processus (test : 120 images en ~7 s sur 4 processus).
- Session cloud reliée au PC sans shell distant : rapatrier dans le conteneur le modèle d'épisode, `_env/fonts`, le Whisper int8 (+ tokens) et les logos utiles, reproduire l'arborescence `Debrief-IA/outils/<episode>/` et `Debrief-IA/assets/`, travailler là (`python3`, `pip install --break-system-packages sherpa-onnx`), puis réécrire sur le PC le MP4 final à la racine et les scripts dans `outils/<episode>/` (remettre le modèle non quantifié et `num_threads=4` dans `fenetre.py`, `regroupe.py`, `passages.py` si on les avait passés en int8).

## Mode de travail : en deux temps, vidéo finale en one-shot

### Temps 1 — Martin donne un sujet → script en deux blocs (pas de vidéo)
1. **Vérifier les faits** d'abord (recherche web, sources primaires). Signaler ce qui est faux ou non recoupé et corriger dans le script. Sources en fin de message.
2. **Bloc 1 — « Script à lire »** : uniquement le texte que Martin va dire, phrase par phrase, oral, prêt à lire. Structure : accroche → « Jour X sur 365… » (ou carte HORS-SÉRIE) → partie 1 → partie 2 → partie 3 « à retenir » → fin (« Si tu ne veux rien manquer des actus IA, abonne-toi ! Demain, jour X+1… »). Pour un concept, toujours un exemple concret de ce que ça donne.
3. **Bloc 2 — « Script + storyboard »** : le même texte, avec sous chaque phrase (en texte seulement) ce qui apparaît à l'écran : schéma, animation, étiquettes, logos, effets (glitch, impact, tampon…), et le mot sur lequel l'animation se déclenche. Les parties servent à structurer le script : **aucun titre de partie à l'écran**.
- Pas d'animation ni de vidéo à ce stade : on attend la voix off.

### Temps 2 — Martin envoie sa voix off (audio séparé) → vidéo finale en one-shot
Enchaîner sans validation intermédiaire : transcription → montage audio (blancs, bégaiements, ratés, prises doublées) → animation calée sur la voix d'après le storyboard → sous-titres → assemblage → livraison. **Une seule version livrée : avec sous-titres incrustés.** Plus de version sans sous-titres (sauf si les sous-titres ne peuvent pas être calés, voir plus bas). Martin modifie souvent le texte en s'enregistrant : caler l'animation sur ce qu'il dit réellement, pas sur le script (retirer les scènes d'un passage qu'il n'a pas dit).

## Formats
- **Quotidienne** « Jour X / 365 » : ~1 min 30 d'actu IA. Le numéro du jour se lit dans le nom du fichier audio (ex. `13-365_no_cut.m4a`) ou dans la voix off.
- **Hors-série** : un concept clé de l'IA, ~30 s à 1 min. La carte « HORS-SÉRIE » remplace « Jour X / 365 ».
- Ordre : accroche d'abord (sa première image sert de vignette, son titre visible dès t = 0), puis la carte juste après, puis les parties (sans titre à l'écran), puis l'écran de fin (logo `Logo principal — vert terminal@1x.png`, bouton « Abonne-toi », « Demain · Jour X+1 » avec les points des jours).

## Règles de style (impératives)
- **Une seule police : Inter.** Jamais de police à empattement, jamais d'italique, y compris pour les chiffres et le code (pas de police mono).
- **Aucun titre en haut de l'écran.** Pas de titre de partie (« 1 · Le fonds », « 2 · … », « 3 · À retenir »), pas de barre de progression, pas de sommaire, pas de sourcil. Ne pas appeler `sectionTitle`, `progressBar` ni `eyebrow`. Seule exception : le titre de l'accroche, visible dès t = 0 pour la vignette.
- Pas de sous-titre sous un titre, pas de phrase d'accroche en italique, pas de phrase de conclusion à l'écran.
- **N'écrire à l'écran que ce que Martin dit** (ou des étiquettes courtes de schéma : noms de couches ou de boîtes, « INPUT », « OUTPUT », valeurs chiffrées, une ligne de code). Aucune phrase explicative que la voix off ne prononce pas : ça fait « généré par IA ».
- Palette : fond sombre (#10111a → #1d1e27 en dégradé radial), orange #F06E2D (accent), cyan #56BCD6 (modèle), jaune #F2C94C, rouge #E5484D, vert #46C281.
- Visuels précis et animés : schémas réels (réseau de neurones avec poids chiffrés qui changent, tokens → nombres, courbes boursières, compteurs, etc.), effets dans l'accroche (zoom, glitch, impacts, particules), tampons et ondes de choc sur les mots forts. Montage dynamique mais sobre.
- Contenu entre y≈450 et y≈1340 (les sous-titres occupent ~1380–1490).
- **Logos** : toujours les vrais logos pris dans `assets`, jamais de pastille ronde à initiales. Logo le plus proche si l'exact manque (ex. Codex → OpenAI). S'il en manque, le dire à Martin ou le chercher sur Internet. Attention : `anthropic.webp` est l'étoile Claude (sert pour Anthropic et les modèles Claude tant qu'il n'y a pas le logo « A\ ») ; `claude.png` est la mascotte Claude Code. Pas de photo d'une personne sans image dans `assets` : portrait générique (`avatar` dans `jour13/anim.js`) + son nom.
- Sujets sensibles (cybersécurité, piratage, armes) : visuels schématiques et abstraits (bac à sable, œil de surveillance, icônes), jamais de détail technique d'attaque à l'écran ni dans le script.

## Pipeline technique (Temps 2)
Modèle de référence : `outils/jour13/` (le plus récent : aucun titre à l'écran, pauses resserrées, prises doublées coupées, sous-titres dès le début ; fichiers `index.html`, `anim.js`, `render.py`, `render_par.py`, `montage.py`, `txt.py`, `transcrire.py`, `fenetre.py`, `regroupe.py`, `passages.py`, `planche.py`). Pour un nouvel épisode : copier `outils/jour13/` en `outils/jourX/` (ou `outils/hs_<concept>/`), y mettre la voix off en `voix_brute.wav` (convertir avec ffmpeg si m4a/mp3 : `-ac 1 -ar 48000`), puis réécrire `txt.py`, `OUT`, les repères, `MOTS_CLES` et `PROTEGE` de `montage.py`, et les scènes de `anim.js` (en gardant ses fonctions utilitaires : fond, cartes de logos `card`/`drawTile`, tampons, ondes de choc, fissures, courbes `stockLine`, calendrier, `weightsFile`, écran de fin). `jour11/` et les jours 4 à 10 restent des archives à consulter pour réutiliser des scènes (sans reprendre leurs titres de partie).
1. **Transcription** (`python transcrire.py`) : passages parlés via `ffmpeg silencedetect` (-38 dB, 0,25 s ; si la prise est bruitée et qu'un seul passage sort, relancer avec `SEUIL=-30 DMIN=0.4` ; on peut aussi fusionner des passages à la main dans `runs_texte.json`), puis Whisper small int8 passage par passage → `runs_texte.json`. Pour lever un doute sur un mot : `python fenetre.py 3.4-5.9 7.8-10` (décode des fenêtres de temps précises). Re-décoder ensuite par groupes (`python regroupe.py`, fenêtres ~7,5 s) ou sur des passages précis (`python passages.py 12-14`) pour avoir le contexte : le décodage passage par passage coupe les fins de mots. Écrire le texte réellement dit dans `txt.py` (un passage = une entrée, avec le type de pause qui suit), pas le script.
   - Passages longs (> 5 s) : repérer les micro-pauses internes (`silencedetect=noise=-36dB:d=0.06`) et les découper dans `runs_texte.json` (garder une copie `runs_texte_whisper.json`) pour mieux caler repères et sous-titres.
   - **Toux, raclement de gorge, souffle, raté** : ne jamais les transcrire comme un mot (Whisper invente « Bim ! », « Oh, hein »…). Tout passage court et isolé (< 0,6 s) dont le texte ne colle pas au script se vérifie avec `fenetre.py` ; si ce n'est pas une vraie parole, le marquer type 5 dans `txt.py` (ex. `("(toux)", 5)`) : `montage.py` le retire de la voix et des sous-titres. Mettre alors sur le passage d'avant le type de pause qui convient à ce qui suit.
   - **Bégaiements, phrases ratées, prises doublées** (Martin reprend souvent une phrase) : garder la meilleure prise, en général la dernière qui s'enchaîne d'un trait avec la suite, et marquer les autres type 5. Vérifier les raccords en re-décodant `voix_resserree.wav` autour des coupes, et la fin propre d'un passage gardé (énergie qui retombe sous ~-45 dB).
2. **Resserrer les blancs** pour donner du rythme : max 0,14 s (enchaîné), 0,24 s (virgule), 0,36 s (fin de phrase), 0,52 s (changement de partie), type 4 = pause marquée (1,45 s, clin d'œil), type 5 = passage coupé. Rythme vif mais naturel, jamais accéléré.
3. **Repères** : caler chaque animation du storyboard sur le mot prononcé (`at(passage, fraction)` dans `montage.py` → `cues_final.json`). `DRY=1 python montage.py` fait seulement voix resserrée + repères.
4. **Rendu** : d'abord des images de contrôle (`python render.py ctrl/c cues_final.json t1,t2,…`, planche avec `python planche.py ctrl/planche.png ctrl/c_*.png`) à regarder et corriger (chevauchements, rien en haut de l'écran) ; puis `python montage.py` (rendu parallèle + sous-titres + assemblage), en arrière-plan.
5. **Sous-titres** incrustés : Inter ExtraBold 74 px, blanc, contour noir 7, MarginV 430, ≤ 30 caractères par carton (2 lignes max), mots-clés en orange, **dès le début de la vidéo, accroche comprise**. Relire la liste des cartons imprimée par `montage.py` et ajouter à `PROTEGE` les groupes coupés bizarrement (ex. « l'actu IA », « un peu »). S'ils ne peuvent pas être calés précisément, les retirer et le dire franchement (Martin utilise alors les sous-titres auto de TikTok/YouTube) : dans ce cas seulement, livrer la version sans sous-titres.
6. **Livraison** : `SKIP_RENDER=1 python montage.py` pour refaire seulement voix + sous-titres + assemblage (`SKIP_AUDIO=1` en plus pour garder la voix déjà resserrée), ne garder que la version avec sous-titres. Vérifier quelques images du MP4 final, l'écrire à la racine du dossier (nom `X-365-sujet_final.mp4`) et donner son chemin à Martin, ranger les scripts dans `outils/jourX/`. Signaler en une ligne les mots de la transcription incertains avec leur minutage, et ce qui a été coupé (prises doublées, ratés).

## Outils existants (dans `outils`)
- `jour13/` : modèle actuel des quotidiennes (voir ci-dessus). `jour11/`, `jour10/` : anciens modèles (avec titres de partie à l'écran, à ne pas reprendre). `modele/` : ancien modèle (jour 9, avec barre de progression et sourcils). `_env/` : polices et Whisper.
- `jour2/` à `jour9/` et `hs_*/` : archives des épisodes (scripts écrits pour l'ancien environnement cloud Linux : chemins `/usr/share/fonts`, `/home/claude`, `/mnt/user-data` à ne pas réutiliser tels quels).
- `accroche.py` : écran d'accroche (titre Inter + tuiles de logos).
- `hs_entrainement/` : ancien modèle de hors-série en canvas (pour un hors-série, partir plutôt de `jour13/` et reprendre ses scènes) (`index.html`, `anim.js` avec repères `CUE`, `render.py` pour les images de contrôle, `montage_hs.py`).
- `transcrire.py`, `resserrer.py`, `aligner.py`, `sous_titres.py`, `st_final.py`, `montage_jour2.py`, `logos_video.py`, `icones.py` : anciens éléments du pipeline.