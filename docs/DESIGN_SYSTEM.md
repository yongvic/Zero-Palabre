# Zéro-Palabre — Design System

Référence visuelle absolue. Qualité cible : Stripe, Linear, Vercel — sensibilité africaine contemporaine.

## Typographie

**Plus Jakarta Sans** (Google Fonts) — seule police autorisée.

| Niveau | Taille | Graisse | Line-height | Letter-spacing |
|--------|--------|---------|-------------|----------------|
| Display XL | 56–72px | 800 | 1.05 | -0.03em |
| Display L | 40–48px | 700 | 1.1 | -0.025em |
| Heading XL | 32px | 700 | 1.15 | -0.02em |
| Heading L | 24px | 600 | 1.25 | -0.015em |
| Heading M | 20px | 600 | 1.3 | -0.01em |
| Heading S | 18px | 600 | 1.35 | -0.005em |
| Body L | 17px | 400 | 1.6 | 0 |
| Body M | 16px | 400 | 1.6 | 0 |
| Body S | 15px | 400 | 1.55 | 0 |
| Label L | 14px | 500 | 1.4 | 0.01em |
| Label M | 13px | 500 | 1.35 | 0.015em |
| Label S | 12px | 500 | 1.3 | 0.02em |
| Caption | 11px | 400 | 1.4 | 0.025em |

## Couleurs (tokens)

Implémentation : `src/app/globals.css` → classes Tailwind `primary`, `neutral`, `amber`, etc.

- Primaire : teal `--color-primary-800` (#0F6E56)
- Secondaire attente : ambre `--color-amber-600`
- Fond page : `--color-neutral-50` ou `--color-neutral-0`
- Texte : `--color-neutral-900` / secondaire `--color-neutral-600`

## Espacement

Base 8px. Padding page : 16px mobile / 40px tablet / 80px desktop. Max-width conteneur : 1280px.

## Composants

- Boutons : `radius-md` (8px), hauteur 44px min
- Cartes : fond blanc, `radius-lg`, `shadow-xs` → `shadow-md` au hover
- Formulaires : label visible au-dessus, focus ring teal

## Badges statut accord

| Statut | Couleurs |
|--------|----------|
| PENDING | ambre |
| SENT | bleu info |
| VIEWED | violet |
| ACCEPTED | vert succès |
| REJECTED | rouge erreur |
| EXPIRED | gris neutre |
| HONORED | teal |
| DISPUTED | orange ambre foncé |

## Interdictions

Gradients rainbow, Inter/Roboto, emoji UI, deux CTA primaires, placeholder sans label, couleurs hex en dur, animations sur `all`.

## Checklist livraison

Voir section 20 du prompt design initial — validée à chaque PR.
