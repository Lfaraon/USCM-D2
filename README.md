# USCM — suivi des saisons

Application statique de suivi des équipes US Collombey-Muraz.

## Saison active

- **2026–2027 : USCM C3**
- Données : `data/seasons.json`
- Interface : `index.html`, `assets/app.js`, `assets/styles.css`

## Archives

- **2025–2026 : USCM D2** — copie exacte de l’ancienne application dans `archive/2025-2026-d2/index.html`.

## Ajouter une nouvelle saison

1. Passer la saison active actuelle en `mode: "archive"` et lui attribuer un `archiveUrl`.
2. Conserver sa version complète dans `archive/<saison>-<equipe>/`.
3. Ajouter la nouvelle saison dans `data/seasons.json` avec `mode: "live"` et `current: true`.
4. Mettre à jour matchs, effectif, classement et prochain match dans ce même fichier.

Le code de l’interface ne doit normalement pas être modifié lors d’un simple changement de saison.
