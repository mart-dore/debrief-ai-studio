# texte réellement dit, passage par passage, et type de pause qui suit
# (0 enchaîné, 1 virgule, 2 phrase, 3 partie, 4 pause marquée, 5 passage coupé : toux, bruit, raté, prise doublée)
TXT = [
 ("(bruit)", 5),                                                                  # 1
 ("600 milliards de dollars,", 1),                                                # 2  accroche
 ("c'est ce qu'a perdu Nvidia en une journée", 0),                                # 3
 ("à cause de DeepSeek.", 3),                                                     # 4
 ("Jour 13 sur 365,", 1),                                                         # 5  carte
 ("et aujourd'hui on va voir comment un fonds spéculatif de moins de 200 personnes", 0),  # 6
 ("a pu faire trembler le géant américain.", 3),                                  # 7
 ("Tout commence avec Liang Wenfeng.", 2),                                        # 8  partie 1
 ("En 2015, il cofonde", 0),                                                      # 9
 ("High-Flyer,", 1),                                                              # 10
 ("un fonds qui va se servir de l'IA", 0),                                        # 11
 ("pour trader.", 2),                                                             # 12
 ("(1re prise)", 5),                                                              # 13 coupé
 ("(1re prise)", 5),                                                              # 14 coupé
 ("(1re prise)", 5),                                                              # 15 coupé
 ("(raté)", 5),                                                                   # 16 coupé
 ("(raclement)", 5),                                                              # 17 coupé
 ("Et pour ça,", 1),                                                              # 18
 ("il va avoir besoin d'acheter des milliers de cartes graphiques Nvidia.", 2),   # 19
 ("On parle de 10 000 A100,", 1),                                                 # 20
 ("et ce juste avant la restriction américaine.", 2),                             # 21
 ("Puis, en 2023, il va lancer DeepSeek,", 1),                                    # 22
 ("le tout financé sur ses fonds propres.", 3),                                   # 23
 ("Et le tremblement de terre arrive le 20 janvier 2025", 0),                     # 24 partie 2
 ("quand il publie R1,", 1),                                                      # 25
 ("un modèle de raisonnement aux poids ouverts.", 2),                             # 26
 ("En quelques jours, l'application passe numéro 1 aux États-Unis,", 1),          # 27
 ("ce qui fait qu'une semaine plus tard, le 27 janvier,", 0),                     # 28
 ("Nvidia perd près de 600 milliards de dollars de capitalisation boursière", 0), # 29
 ("en une seule séance.", 2),                                                     # 30
 ("C'est un record jamais vu.", 2),                                               # 31
 ("En même temps, DeepSeek avait annoncé que son entraînement", 0),               # 32
 ("avait coûté seulement 6 millions de dollars,", 1),                             # 33
 ("et à l'époque, c'est un chiffre sans précédent,", 1),                          # 34
 ("même si aujourd'hui c'est encore très débattu.", 3),                           # 35
 ("Et depuis, DeepSeek a un peu changé d'échelle,", 1),                           # 36 partie 3
 ("en accueillant pour la première fois des investisseurs extérieurs,", 1),       # 37
 ("(bruit)", 5),                                                                  # 38 coupé
 ("en levant environ 7 milliards de dollars,", 1),                                # 39
 ("(bruit)", 5),                                                                  # 40 coupé
 ("(raclement)", 5),                                                              # 41 coupé
 ("(bruit)", 5),                                                                  # 42 coupé
 ("(2e prise)", 5),                                                               # 43 coupé (doublon de 39 + 45)
 ("(raté)", 5),                                                                   # 44 coupé
 ("dont une partie vient d'un fonds étatique chinois,", 1),                       # 45
 ("ce qui lui accorde aujourd'hui une valorisation boursière de 50 milliards de dollars.", 3),  # 46 (« boursière » incertain)
 ("Pourtant,", 0),                                                                # 47
 ("son fondateur garde la main", 0),                                              # 48
 ("et dit vouloir continuer à publier des modèles en source ouverte.", 2),        # 49
 ("C'est ça, la mentalité chinoise.", 3),                                         # 50
 ("Si tu ne veux rien manquer de l'actu IA, abonne-toi !", 2),                    # 51 fin
 ("Demain, ce sera le jour 14,", 1),                                              # 52
 ("et justement on verra pourquoi tous les modèles chinois sont open source.", 3),  # 53
 ("(bruit)", 5),                                                                  # 54 coupé
 ("(porte)", 5),                                                                  # 55 coupé
]
