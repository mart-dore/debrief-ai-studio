# texte réellement dit, passage par passage, et type de pause qui suit
# (0 enchaîné, 1 virgule, 2 phrase, 3 partie, 4 pause marquée, 5 passage coupé : toux, bruit, raté, prise doublée,
#  6 = pause « son de l'appli » : la voix s'arrête, on entend la capture)
TXT = [
 ("Kimi K3.1 contre Opus 5.5, c'est parti !", 3),                                  # 1  accroche
 ("Jour 19, on va tester les deux modèles en condition réelle.", 3),              # 2  carte JOUR
 ("Donc pour ça, on va poser le même prompt, fais-moi le site le plus stylé dans le but de m'impressionner.", 2),  # 3 prompt
 ("Kimi est en effort max et Opus est en effort extra.", 2),                       # 4  efforts entourés
 ("Donc…", 4),                                                                     # 5  ellipse temporelle
 ("environ 45 minutes plus tard,", 0),                                             # 6
 ("Kimi a fini et propose ce superbe site sur le thème de l'espace.", 2),          # 7  démo Kimi (AION)
 ("(1re prise : « Bon, c'est magnifique… »)", 5),                                  # 8  reprise en 10
 ("(toux)", 5),                                                                    # 9
 ("On voit, c'est magnifique, j'adore le design, surtout la page numéro 3.", 2),   # 10
 ("En revanche pour le thème, je trouve que c'est un peu du vu et revu", 0),       # 11
 ("et ça fait vraiment très vibe codé.", 3),                                       # 12
 ("En 35 minutes, lui, Claude avait fini", 0),                                     # 13 démo Claude (HOULE)
 ("et propose ce superbe site.", 1),                                               # 14
 ("Je trouve", 0),                                                                 # 15
 ("hyper original, la DA est magnifique", 1),                                      # 16
 ("et je vous laisse profiter du son.", 6),                                        # 17 -> son de l'appli (encre jaune)
 ("On voit que je peux jouer des notes", 0),                                       # 18
 ("et je vois différentes harmonies, c'est génial.", 3),                           # 19
 ("Maintenant, en termes de coût,", 1),                                            # 20 coût
 ("Opus, j'ai accès via mon abonnement à 20 € par mois,", 1),                      # 21
 ("Kimi, mis à la tâche, ça m'a coûté un peu plus de 2 dollars.", 3),                 # 22
 ("(1re prise : « Maintenant je vous laisse me dire en commentaire »)", 5),        # 23 reprise en 26
 ("(raclement)", 5),                                                               # 24
 ("(souffle)", 5),                                                                 # 25
 ("Donc maintenant, je vous laisse me dire en commentaire la version que vous avez préférée.", 2),  # 26 vote
 ("Pour ma part, j'avoue que je préfère celle de Claude.", 3),                     # 27 verdict
 ("(bruit)", 5),                                                                   # 28
]
