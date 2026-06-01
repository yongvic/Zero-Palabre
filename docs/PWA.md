# Zéro-Palabre — PWA

## Architecture

| Phase | Fichiers | Comportement |
|-------|----------|--------------|
| **1** | `src/app/manifest.ts`, `public/sw.js`, `PwaProvider` | Installable, `standalone`, SW léger (shell offline uniquement) |
| **2** | `public/sw.js` (runtime), `OfflineBanner`, `OnlineGuard`, `src/lib/pwa/push.ts` | Mode hors ligne dashboard, cache pages visitées, push (VAPID) |

Pas de **Serwist / precache webpack** : évite la surcharge mémoire au build (`Array buffer allocation failed`).

## Test local

1. `npm run build && npm start` (le SW est plus fiable en production qu’en dev chaud)
2. Chrome → DevTools → **Application** → Manifest / Service Workers
3. Android : bannière « Installer » ou `/installer`
4. iOS : Safari → Partager → Sur l’écran d’accueil

## Phase 2 — Mode hors ligne

### Comportement

| Contexte | Hors ligne |
|----------|------------|
| Pages dashboard déjà visitées (`/accords`, `/profil`, …) | Affichage depuis le cache (dernière visite) |
| `/api/*` | Jamais mis en cache — pas de fausses données |
| Créer un accord | Bloqué (`OnlineGuard`) + bannière ambre |
| Assets `/_next/static` | Cache SWR (max 80 entrées) |

### Tester

1. `npm run build && npm start` (HTTPS ou localhost)
2. Se connecter, visiter `/accords` et `/profil`
3. DevTools → **Network** → cocher **Offline**
4. Recharger `/accords` → page en cache + bannière « Mode hors ligne »

### Fichiers

- `public/sw.js` — caches `zp-dashboard-v2`, `zp-assets-v2`
- `src/components/pwa/offline-banner.tsx`
- `src/components/pwa/online-guard.tsx`
- `src/hooks/use-online-status.ts`

## Phase 2 — Notifications push

1. Générer une paire VAPID (ex. `npx web-push generate-vapid-keys`)
2. Ajouter dans `.env` :
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
3. Appeler `subscribeToPush()` depuis le dashboard après consentement utilisateur
4. Envoyer les push depuis une API Route avec `web-push`

## Icônes

Sources maîtres (fond vert `#116454`) :

- `public/icons/icone 192×192.png`
- `public/icons/icone 512×512.png`

Copies servies par l’app (URLs sans espaces) :

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/apple-touch-icon.png`

Après modification des sources, recopier :

```powershell
cd public/icons
Copy-Item -LiteralPath "icone 192×192.png" -Destination icon-192.png -Force
Copy-Item -LiteralPath "icone 512×512.png" -Destination icon-512.png -Force
Copy-Item -LiteralPath "icone 192×192.png" -Destination ..\apple-touch-icon.png -Force
```
