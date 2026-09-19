# USCM — suivi des saisons

Application statique de suivi des équipes US Collombey-Muraz.

## Saison active

- **2026–2027 : USCM C3**
- Interface : reprise directe du tableau de bord historique D2 afin de conserver le même design et les mêmes fonctionnalités.
- Données actuelles intégrées dans `index.html` : classement, résultats, prochain match, effectif et compositions disponibles.

## Archives

- **2025–2026 : USCM D2** — copie exacte de l’ancienne application dans `archive/2025-2026-d2/index.html`.
- Le sélecteur de saison dans le header de l’application permet d’ouvrir l’archive.

## Principe pour les saisons suivantes

1. Copier la version finale de la saison active dans `archive/<saison>-<equipe>/index.html`.
2. Conserver `index.html` comme application active et remplacer uniquement les données de saison.
3. Ajouter la saison archivée au sélecteur sans refaire l’interface.
