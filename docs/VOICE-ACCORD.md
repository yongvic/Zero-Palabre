# Création d'accord par la voix (DeepSeek)

## Où

- **Page** : `/accords/nouveau` (utilisateur connecté)
- **Onglet** : « Par la voix » (par défaut si `DEEPSEEK_API_KEY` est définie)

## Parcours

1. Consentement enregistrement
2. Déclaration vocale (micro + transcription navigateur)
3. Analyse DeepSeek → champs accord
4. Compléments si manquants (voix ou écrit)
5. Aperçu modifiable → envoi `POST /api/accords`

## API

| Route | Auth | Rôle |
|-------|------|------|
| `POST /api/accords/voice/extract` | Oui | Transcription → extraction |
| `POST /api/accords/voice/audio` | Oui | Archivage audio (Blob, optionnel) |

## Fichiers clés

- `src/components/accord/voice/create-accord-voice-flow.tsx`
- `src/lib/voice-accord/*`
- Modèle Prisma `VoiceAccordDraft`

## Distinction

| Fonction | Page |
|----------|------|
| **Initier** un accord (ce doc) | `/accords/nouveau` |
| **Signer** / valider (destinataire) | `/valider/[token]` — voir `VOICE-SIGNATURE.md` |
