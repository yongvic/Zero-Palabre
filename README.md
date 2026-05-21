# Zéro-Palabre

**La preuve simple des accords du quotidien** — plateforme web pour formaliser, valider et archiver des accords entre particuliers et professionnels (Togo & Afrique de l'Ouest).

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS**
- **Prisma** · **PostgreSQL** (Neon en production)
- **Auth.js** (magic link via Resend)
- **@react-pdf/renderer** · **Vercel**

## Documentation projet

| Fichier | Contenu |
|---------|---------|
| [`docs/NORMS-DEVELOPPEMENT.md`](docs/NORMS-DEVELOPPEMENT.md) | Normes de code, structure, sécurité, PR |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Design system (résumé opérationnel) |
| [`.cursor/rules/zero-palabre.mdc`](.cursor/rules/zero-palabre.mdc) | Règles Cursor Agent |
| `ZeroPalabre_CahierDesCharges_v1.0 (1).docx` | Cahier des charges MVP |

## Démarrage rapide

### 1. Prérequis

- Node.js 20+
- PostgreSQL (local via Docker ou compte [Neon](https://neon.tech))

### 2. Installation

```bash
cd "Zero Palabre"
npm install
cp .env.example .env
```

### 3. Base de données (Docker local)

```bash
docker compose up -d
```

Puis dans `.env` :

```env
DATABASE_URL="postgresql://zeropalabre:zeropalabre@localhost:5432/zeropalabre"
AUTH_SECRET="votre-secret-32-chars-minimum"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PAYMENT_MODE="simulation"
```

```bash
npx prisma db push
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### 4. Emails (optionnel en dev)

Sans `RESEND_API_KEY`, les emails sont **loggés dans la console** du serveur.

## Fonctionnalités MVP livrées

- Landing page (dark hero + sections teal)
- Inscription / connexion magic link
- Création d'accord multi-étapes
- Invitation email au destinataire
- Validation publique (`/valider/[token]`)
- PDF de preuve (`/api/accords/[id]/pdf`)
- Vérification publique (`/verifier/[token]`)
- Tableau de bord accords
- Score de fiabilité (base)
- Abonnements simulés (Tmoney-Moov MVP)

## Scripts

```bash
npm run dev          # Développement
npm run build        # Build production
npm run db:push      # Sync schéma Prisma
npm run db:studio    # Interface Prisma Studio
```

## Assets

Logos : `public/brand/logo-vert.png`, `logo-blanc.png`

## Déploiement Vercel

1. Connecter le repo GitHub
2. Variables d'environnement (voir `.env.example`)
3. `npx prisma migrate deploy` sur Neon
4. Domaine `zeropalabre.com`

---

© 2026 Zéro-Palabre — Document confidentiel
