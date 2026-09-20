# Résumé des préférences retenues (mémoire persistante Claude)

> Ce projet bénéficie d'une mémoire persistante Claude (dossier séparé, hors du repo — `C:\Users\asus\.claude\projects\...\memory\`). Un agent futur utilisant Claude Code sur ce projet la chargera automatiquement ; un agent qui n'a PAS accès à cette mémoire (autre outil, autre session sans le même mécanisme) doit au moins connaître les règles ci-dessous, qui sont aussi répétées dans `INDEX.md` section 1.

## Règles de travail retenues

1. **Ne jamais modifier ou supprimer de code sans confirmation explicite dans le message en cours** — même après approbation d'un plan global, redemander avant d'exécuter si le fil de la conversation le suggère. Le client a interrompu des `Edit` en cours plusieurs fois pour clarifier avant de continuer — c'est un fonctionnement normal avec ce client, pas un échec à éviter.
2. **Ne jamais supprimer de fichier dans `references/`**, quel que soit le contexte.
3. **Toujours écrire en tunisien transcrit en alphabet latin (AZERTY)**, jamais en écriture arabe Unicode — demandé explicitement après qu'une réponse ait dérivé vers l'arabe.
4. **Honnêteté brute plutôt que réassurance** — quand on demande "est-ce que tout est corrigé/vérifié à 100%", donner un état précis par catégorie (corrigé / ouvert / jamais vérifié), jamais une réponse plate "oui c'est bon".
5. **Une lecture "confirmée sur plusieurs pages" d'un scan basse résolution n'est pas une preuve** — un même artefact de compression peut se répéter identiquement. Ne traiter un chiffre comme acquis qu'après vérification sur une image nette, et le dire explicitement quand ce n'est pas le cas.
6. **Les prix sont une décision commerciale du client, pas quelque chose à copier automatiquement d'AtelierPro** — n'utiliser les données de prix d'AtelierPro que pour corriger une erreur de donnée confirmée (doublon, valeur à 0 par erreur), jamais pour remplacer un choix de prix intentionnel, sans demander.
7. **Publier un Artifact pour tout rapport de constats volumineux** (plutôt que de tout mettre dans le chat) — bien reçu pour le rapport "Audit AtelierPro" (~50 constats, filtrable par sévérité).
8. **Maintenir un journal de session vivant** dans le repo (`references/README_audit_session.md`, puis ce dossier `references/readme/`) — mis à jour à chaque étape importante (nouveau catalogue reçu, batch exécuté, décision prise), pas juste raconté dans le chat.

## Où sont les fichiers de mémoire (si accessible)

- `project_aluminum_audit.md` — état du projet : familles produit, statut catalogue par marque, décisions en cours.
- `feedback_aluminum_audit_workflow.md` — cette liste de règles, en version mémoire persistante.
- `feedback_writing_script.md` — la règle sur l'écriture en latin/AZERTY uniquement.

Si un agent futur a accès à ce mécanisme de mémoire, il devrait les lire au début de toute nouvelle session sur ce projet. S'il ne l'a pas, ce dossier `references/readme/` contient tout ce qui est nécessaire de toute façon.
