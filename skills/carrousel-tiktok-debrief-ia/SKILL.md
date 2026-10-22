---
name: "carrousel-tiktok-debrief-ia"
description: "Créer un carrousel photo TikTok « Le Débrief IA » de Martin (benchmarks d'un modèle, comparatif, résultats chiffrés) : intro, une image par graphique, conclusion, abonnement, dans la zone visible TikTok."
---

# Carrousels photo TikTok « Le Débrief IA »

Images verticales **1080×1920 PNG**, publiées en mode Photo sur TikTok (et réutilisables ailleurs). Dossier du projet : `D:\Documents\Debrief-IA`. Modèle de référence : `outils/carrousel_kimi/gen.py` (carrousel Kimi K3.1 Pro, 12 images). Pour un nouveau carrousel : copier ce dossier en `outils/carrousel_<sujet>/`, remplacer les graphiques `c_*.png` et réécrire la liste `SLIDES`. Les images finales vont dans `carrousels/<sujet>/NN-<sujet>.png`.

## Structure obligatoire
1. **Image d'intro** (couverture) : logo du sujet, titre court (nom du modèle ou du sujet), une phrase d'accroche (souvent une question, ex. « Le nouveau modèle chinois, meilleur que Claude Opus 5.5 ? »), 3 chiffres clés maximum en cartes compactes, « swipe » manuscrit avec une flèche.
2. **Une image par graphique / benchmark** : d'abord les plus pertinents (pour un modèle : intelligence, vitesse, coût, éventuellement intelligence vs coût), puis les benchmarks où le sujet se démarque.
3. **Image de conclusion** (avant-dernière) : le verdict, par ex. un tableau duel « A vs B » ligne par ligne avec le gagnant coloré, le score de victoires et 2-3 lignes manuscrites de conclusion honnête (dire où l'autre gagne).
4. **Image abonnement** (dernière) : logo de la chaîne, « Ne rate plus aucune actu IA », bouton orange « Abonne-toi », et une **flèche manuscrite qui pointe directement sur la photo de profil TikTok** (colonne de droite, centre ≈ (995, 1150)), entourée à la main, avec « c'est juste ici ! ». Rappeler le rythme (une vidéo par jour, jour X / 365).

## Zone visible TikTok (impératif)
Mesurée sur capture d'écran de l'onglet « Pour toi » (iPhone). L'interface TikTok recouvre :
- **le haut** : onglets LIVE / Suivis / Pour toi → rien d'important au-dessus de **y = 330** ;
- **le bas** : points du carrousel, nom du compte, légende, barre d'onglets → rien sous **y = 1640** ;
- **la droite** : colonne avatar / like / commentaires / favoris / partage → rien au-delà de **x = 890** à partir de **y = 860**.

Donc : contenu entre x = 60 et x = 890 (jusqu'à 1020 seulement au-dessus de y = 860), y = 330 à 1640. Pas de bandeau d'en-tête (logo de chaîne, numéro de page « 2/10 ») : TikTok affiche déjà le compte et la position dans le carrousel. Contrôle systématique : `SAFE=1 python gen.py` écrit dans `ctrl/` les images avec les zones masquées en rouge et le cercle de l'avatar ; vérifier qu'aucun texte, flèche utile ou graphique n'y entre.

## Format compact, peu de texte
- Par image graphique : une catégorie (petit libellé orange en capitales), **un titre court** (≤ 2 lignes, Inter 800 56 px ; insécables ` ` / `&#8209;` pour éviter les coupures moches type « Terminal- / Bench » ou « qu'Opus / 5.5 »), le graphique, **2 à 3 notes manuscrites maximum**, la source en petit. Pas de sous-titre explicatif long.
- Les notes disent l'essentiel : valeur et rang du sujet, l'écart avec le concurrent principal, un fait marquant (progression vs version précédente, prix…). Une idée par ligne, ≤ ~30 caractères.

## Direction artistique (règles de la chaîne)
- Fond sombre en dégradé radial (#1f2130 → #10111a) avec poussière discrète ; palette : orange #F06E2D (accent), cyan #56BCD6 (le modèle étudié), jaune #F2C94C, vert #46C281, rouge #E5484D.
- **Inter** pour tout le texte imprimé (jamais d'italique, jamais de police à empattement). **Seule exception : les annotations manuscrites** en police **Caveat** (`outils/_env/fonts/caveat-latin-700-normal.woff2`), demandées par Martin pour les flèches explicatives.
- Flèches, cercles et soulignements **dessinés à la main** (fonctions `hand_arrow`, `circle`, `underline` de `gen.py` : courbe légèrement tremblée, pointe en deux traits). Flèche orange vers la barre / le point du sujet, blanche vers le concurrent, soulignement vert sous la conclusion chiffrée.
- **Vrais logos** pris dans `assets/` (jamais de pastille à initiales) ; logos blancs (Kimi, Moonshot) sur tuile sombre #20232f ; `anthropic.webp` pour Claude ; logo de la chaîne `Logo principal — vert terminal@1x.png`.
- N'écrire que des faits vérifiés ; pas de phrase « générée par IA » inutile.

## Graphiques : images directes d'Artificial Analysis
Martin veut les graphiques d'Artificial Analysis eux-mêmes (pas des graphiques refaits). Le site est bloqué depuis le conteneur cloud : passer par le **navigateur intégré** (Browser pane) sur la page `artificialanalysis.ai/models/<modele>` :
1. Laisser la taille du pane par défaut (`resize_window` preset desktop) ; défiler toute la page en JS pour charger les graphiques ; lister les `svg` > 300×150 et repérer ceux qui comptent (Intelligence Index, Output Speed, Cost per Intelligence Index Task, Intelligence vs Cost, cartes d'évaluations 513×260 : identifier chaque benchmark par le texte de la carte parente, et le rang du sujet via les `foreignObject`).
2. Pour capturer en bonne définition : sortir le `svg` en `position:fixed` sur un calque blanc plein écran, `transform: scale(1.5) translate(-ox,0)`, et capturer par tuiles de `584/1.5` px de large (une colonne = 800 px de capture). Ajouter dans un coin un **code-barres de contrôle** (carré rouge + 6 carrés noirs/gris = numéro de tuile) et attendre deux `requestAnimationFrame` + 300 ms avant chaque `computer screenshot` (scale 1) : sinon la capture renvoie une image périmée. Les captures arrivent dans `tool-results/*.jpg` ; vérifier le code de chaque tuile, recoller (les tuiles se juxtaposent tous les 800 px) puis recadrer autour du sujet (≈ 10-13 premiers modèles pour que les noms restent lisibles).
3. Garder la mise en évidence d'Artificial Analysis (barre du sujet en couleur, autres pâlies). Source en bas de chaque image : « Source : Artificial Analysis · date ».

## Vérification des faits
- Relever les valeurs sur les graphiques capturés (et la page texte du modèle) ; compléter par recherche web (annonce Artificial Analysis, presse) pour les comparaisons avec la version précédente.
- Être honnête : signaler les points faibles (ex. vitesse), les écarts minimes (1 point), le mode d'effort du concurrent (ex. « Opus 5.5 en effort max »), et le statut réel (ex. poids « promis » mais pas encore publiés).

## Rendu, contrôle, livraison
- `python gen.py` (Playwright + Chromium, polices chargées depuis `../_env/fonts`, logos depuis `../../assets`) ; `python gen.py 1,12` pour quelques images.
- Contrôle visuel : planche de toutes les images + `SAFE=1` ; corriger chevauchements titre / graphique, textes qui débordent, flèches qui visent à côté.
- Livrer les PNG dans `carrousels/<sujet>/` (les envoyer aussi dans la conversation) et ranger `gen.py` + `c_*.png` dans `outils/carrousel_<sujet>/`. Dire en une ligne ce qui est approximatif (écarts minimes, données hors Artificial Analysis).