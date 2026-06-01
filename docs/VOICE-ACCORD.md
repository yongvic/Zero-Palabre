# Création d'accord par la voix (Gemini)

## Configuration

```env
GEMINI_API_KEY="AIza..."
# ou alias :
# GOOGLE_GENERATIVE_AI_API_KEY="AIza..."
GEMINI_MODEL="gemini-2.0-flash"
```

Clé gratuite : [Google AI Studio](https://aistudio.google.com/apikey)

## Où

- **Page** : `/accords/nouveau` (utilisateur connecté)
- **Onglet** : « Par la voix » (si `GEMINI_API_KEY` est définie)

## Parcours

1. Consentement enregistrement
2. Déclaration vocale (micro + transcription navigateur)
3. Analyse Gemini → champs accord
4. Compléments si manquants (voix ou écrit)
5. Aperçu modifiable → envoi `POST /api/accords`

## API

| Route | Auth | Rôle |
|-------|------|------|
| `POST /api/accords/voice/extract` | Oui | Transcription → extraction |
| `POST /api/accords/voice/audio` | Oui | Archivage audio (Blob, optionnel) |

## Dépannage

| Symptôme | Action |
|----------|--------|
| « Clé API invalide » | Vérifier `GEMINI_API_KEY` dans `.env` et Vercel |
| « Quota dépassé » | Attendre ou vérifier les limites sur AI Studio |
| Test API | `node scripts/test-gemini.mjs` |

## Distinction

| Fonction | Page |
|----------|------|
| **Initier** un accord (ce doc) | `/accords/nouveau` |
| **Signer** / valider | `/valider/[token]` — voir `VOICE-SIGNATURE.md` |
