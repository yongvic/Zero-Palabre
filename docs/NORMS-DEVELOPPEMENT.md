# Zéro-Palabre — Normes de développement

Document de référence obligatoire pour tout contributeur (humain ou IA). En cas de conflit avec une intuition personnelle, **ce document et le design system priment**.

## 1. Stack et versions

| Couche | Technologie | Règle |
|--------|-------------|-------|
| Framework | Next.js 14+ App Router | Pas de Pages Router pour le nouveau code |
| Langage | TypeScript strict | `any` interdit sauf justification documentée |
| ORM | Prisma 5.x | Schéma = source de vérité des modèles |
| Base | PostgreSQL (Neon prod) | Jamais de SQL brut hors migrations Prisma |
| Auth | Auth.js (NextAuth v5) | Magic link email uniquement en MVP |
| Email | Resend + React Email | Templates dans `src/components/emails/` |
| UI | Tailwind + composants maison | Tokens CSS, pas de couleurs hex en dur |
| Icônes | Lucide React | `strokeWidth={1.5}` par défaut |
| Validation | Zod | Schémas partagés `src/lib/validations/` |
| PDF | @react-pdf/renderer | Template dans `src/components/pdf/` |

## 2. Structure des dossiers

```
src/
├── app/                    # Routes App Router uniquement
│   ├── (marketing)/        # Landing, pages publiques
│   ├── (auth)/             # login, register
│   ├── (dashboard)/        # espace connecté
│   └── api/                # Route handlers REST
├── components/
│   ├── ui/                 # Primitives (Button, Input, Card…)
│   ├── accord/             # Métier accords
│   ├── layout/             # Header, Sidebar, Footer
│   ├── emails/             # React Email
│   └── pdf/                # React PDF
├── lib/                    # Clients singleton, auth, utils
├── hooks/                  # Hooks React réutilisables
└── types/                  # Types TS dérivés de Prisma/Zod
```

**Interdit :** logique métier lourde dans les fichiers `page.tsx` — extraire vers `lib/` ou Server Actions dédiées.

## 3. Conventions de code

### Nommage

- Fichiers composants : `PascalCase.tsx` (`AccordCard.tsx`)
- Fichiers utilitaires : `kebab-case.ts` (`reliability-score.ts`)
- Routes : segments en français URL (`/accords/nouveau`) — slugs métier cohérents avec le produit
- Variables d’environnement : `SCREAMING_SNAKE_CASE` dans `.env`

### Composants React

- Server Components par défaut ; `"use client"` uniquement si interaction (formulaire, modal, animation)
- Props typées avec interface exportée si réutilisé
- Pas de `useEffect` pour fetch — préférer Server Components + `fetch` ou Server Actions

### API Routes

- Validation Zod sur **tous** les body/query
- Réponses JSON : `{ data }` ou `{ error: { code, message } }`
- Codes HTTP corrects (400, 401, 403, 404, 429, 500)
- Rate limit : 100 req/min/IP sur routes sensibles (middleware)

### Base de données

- Migrations nommées : `npx prisma migrate dev --name description_snake`
- Jamais modifier un accord `ACCEPTED` (immutabilité cahier des charges)
- Chaque transition de statut → entrée `AccordEvent`
- `publicToken` : CUID unique pour liens publics

### Sécurité

- Secrets uniquement côté serveur
- Hash SHA-256 du contenu accord stocké à la validation
- Sessions JWT 30 jours, magic link 15 minutes
- RGPD : consentement CGU à l’inscription, endpoint suppression compte (phase 2)

## 4. Design et UI

- Référence unique : [`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
- Police : **Plus Jakarta Sans** exclusivement
- Couleurs : **custom properties** `--color-*` — jamais `#0F6E56` en dur dans les composants
- Mobile-first : styles base = mobile, `md:` / `lg:` pour desktop
- Un seul bouton **primaire** par vue
- États vides obligatoires sur toute liste
- `prefers-reduced-motion` respecté

## 5. Git et livraison

- Branche `main` = production Vercel
- Messages de commit en français ou anglais, impératif : `feat: ajout validation accord destinataire`
- PR : description + plan de test manuel
- Avant merge : `npm run lint` et `npm run build` verts
- Migrations : `prisma migrate deploy` avant déploiement prod

## 6. Tests (phase 2)

- Jest + Testing Library pour composants critiques
- Tests E2E Playwright pour flux accord (création → validation → PDF)

## 7. Checklist PR

- [ ] Design system respecté (police, tokens, contrastes)
- [ ] Zod sur entrées API
- [ ] Accord immuable après ACCEPTED
- [ ] AccordEvent loggé
- [ ] Mobile testé (≥ 360px)
- [ ] État vide si liste
- [ ] Pas de secret commité
- [ ] `aria-label` sur boutons icône seuls

## 8. Références projet

- Cahier des charges : `ZeroPalabre_CahierDesCharges_v1.0 (1).docx`
- Logos : `public/brand/`
- Inspirations UI : dossier `docs/inspirations/` (captures fournies)

---

*Dernière mise à jour : Mai 2026 — v1.0 MVP*
