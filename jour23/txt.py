# texte réellement dit, passage par passage, et type de pause qui suit
# (0 enchaîné, 1 virgule, 2 phrase, 3 partie, 4 pause marquée, 5 passage coupé : toux, bruit, raté, prise doublée)
# Martin a inversé l'ordre du script : Timestral, puis Voxtral, puis Mistral OCR.
TXT = [
 ("Tout le monde pointe du doigt Mistral Large 4", 0),                                # 1 accroche
 ("et pense qu'il n'est pas au niveau des meilleurs modèles d'IA.", 2),               # 2
 ("Mais pendant ce temps-là, Mistral a sorti trois modèles spécialisés, qui sont parmi les meilleurs au monde.", 2),  # 3
 ("On décrypte ça ensemble dans ce Jour 23.", 3),                                     # 4 carte jour
 ("(1re prise : « Le premier, c'est Timestral, il est sorti mi-… »)", 5),             # 5
 ("(toux)", 5),                                                                        # 6
 ("(bruit)", 5),                                                                       # 7
 ("(2e prise : « Le premier, c'est Timestral… »)", 5),                                # 8
 ("(« Lui, il est sorti mi-octobre… »)", 5),                                          # 9
 ("(« C'est pas… » raté)", 5),                                                         # 10
 ("(bruit)", 5),                                                                       # 11
 ("Le premier, c'est Timestral,", 1),                                                 # 12 Timestral
 ("il est sorti mi-octobre.", 2),                                                     # 13
 ("C'est pas un modèle de langage,", 1),                                              # 14
 ("lui, ce qu'il prédit, c'est les séries temporelles.", 1),                          # 15
 ("Donc ça peut être de la vente,", 1),                                               # 16
 ("de la conso,", 1),                                                                  # 17
 ("des capteurs", 0),                                                                  # 18
 ("et même de la bourse.", 2),                                                         # 19
 ("Tu lui donnes l'historique, il te sort la suite avec une certaine marge d'erreur.", 2),  # 20
 ("Et le plus fou dans tout ça, c'est qu'il ne fait que 209 millions de paramètres,", 1),   # 21
 ("donc il tourne sur n'importe quel PC,", 0),                                         # 22
 ("avec ou sans carte graphique.", 2),                                                 # 23
 ("Il est open weight, donc tu peux d'ores et déjà le télécharger.", 3),              # 24
 ("(bruit)", 5),                                                                       # 25
 ("Le deuxième, c'est Voxtral.", 2),                                                  # 26 Voxtral
 ("Lui, son but, c'est de transcrire de l'audio dans toutes les langues.", 2),        # 27
 ("Il est sorti le 20 octobre", 0),                                                    # 28
 ("et au classement d'Artificial Analysis, il est sur le podium,", 0),                 # 29
 ("avec à peine 2 % de mots qui sont mal transcrits.", 2),                             # 30
 ("Par contre, il est pas open weight.", 3),                                           # 31
 ("(bruit)", 5),                                                                       # 32
 ("(1re prise : « Et le dernier, c'est Mistral OCR… »)", 5),                          # 33
 ("(« …qui peut transformer n'importe qui… » raté)", 5),                              # 34
 ("(raclement de gorge)", 5),                                                          # 35
 ("Et le dernier, c'est Mistral OCR,", 0),                                            # 36 OCR
 ("qui peut transformer n'importe quel PDF ou scan en un texte structuré.", 2),       # 37
 ("Il fonctionne sur 170 langues,", 1),                                               # 38
 ("et tous les annotateurs qui l'ont essayé le préfèrent à ses concurrents dans 72 % des cas.", 2),  # 39
 ("Mais là encore, ses poids ne sont pas publics.", 2),                               # 40
 ("Pour l'instant, il ne marche que par API", 0),                                     # 41
 ("ou dans une version à installer pour les entreprises.", 3),                        # 42
 ("En bref,", 1),                                                                      # 43 à retenir
 ("à défaut de fournir les meilleurs modèles de langage,", 1),                        # 44
 ("Mistral joue dans la cour des grands sur des domaines bien plus précis :", 1),     # 45
 ("les séries temporelles,", 1),                                                       # 46
 ("l'OCR ou la transcription de voix.", 3),                                            # 47
 ("Donc si tu ne veux rien manquer des actus IA, abonne-toi !", 2),                   # 48 fin
 ("Demain, ce sera le Jour 24 et on abordera encore un nouveau sujet.", 2),           # 49
]
