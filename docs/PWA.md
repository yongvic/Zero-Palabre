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

Remplacer `public/icons/icon-192.png` et `icon-512.png` par des exports carrés (fond `#F9F9F6` ou transparent) pour un rendu maskable optimal.
