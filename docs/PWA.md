# Zéro-Palabre — PWA

## Architecture

| Phase | Fichiers | Comportement |
|-------|----------|--------------|
| **1** | `src/app/manifest.ts`, `public/sw.js`, `PwaProvider` | Installable, `standalone`, SW léger (shell offline uniquement) |
| **2** | `public/sw.js` (runtime), `src/lib/pwa/push.ts` | Cache dashboard NetworkFirst, assets SWR, push (VAPID) |

Pas de **Serwist / precache webpack** : évite la surcharge mémoire au build (`Array buffer allocation failed`).

## Test local

1. `npm run build && npm start` (le SW est plus fiable en production qu’en dev chaud)
2. Chrome → DevTools → **Application** → Manifest / Service Workers
3. Android : bannière « Installer » ou `/installer`
4. iOS : Safari → Partager → Sur l’écran d’accueil

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
