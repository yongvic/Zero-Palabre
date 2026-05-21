# Instructions agent — Zéro-Palabre

Avant toute modification UI ou feature :

1. Lire **`docs/NORMS-DEVELOPPEMENT.md`**
2. Lire **`docs/DESIGN_SYSTEM.md`**
3. Respecter **`.cursor/rules/zero-palabre.mdc`**

## Produit

Formalisation d'accords verbaux → preuve PDF horodatée + vérification publique. Utilisateurs : artisans, commerçants, particuliers, freelances (Togo / Afrique de l'Ouest).

## Règles non négociables

- Plus Jakarta Sans · Lucide · tokens CSS teal/ambre
- Mobile-first · 44px touch targets
- Zod sur toutes les API · Accord immuable après ACCEPTED
- AccordEvent sur chaque transition de statut

## Structure clé

- `src/app/(marketing)/` — landing
- `src/app/(dashboard)/` — espace connecté
- `src/app/valider/[token]` — validation destinataire sans login
- `src/app/verifier/[token]` — vérification publique
- `prisma/schema.prisma` — modèles

## Cahier des charges

`ZeroPalabre_CahierDesCharges_v1.0 (1).docx` à la racine du projet.
