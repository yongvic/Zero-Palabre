# Signature vocale — validation destinataire (Gemini)

> Pour **créer** un accord à la voix (initiateur), voir [`VOICE-ACCORD.md`](./VOICE-ACCORD.md).

## Configuration

```env
GEMINI_API_KEY="AIza..."
GEMINI_MODEL="gemini-2.0-flash"
```

Clé : [Google AI Studio](https://aistudio.google.com/apikey)

## Parcours

1. `/valider/[token]` → onglet **Signature vocale**
2. Enregistrement + transcription navigateur
3. Analyse Gemini → extraction JSON
4. Compléments si manquants
5. Confirmation → `POST /api/accords/[token]/valider`

## API

| Route | Rôle |
|-------|------|
| `POST .../voice/extract` | Transcription → Gemini → session |
| `POST .../voice/audio` | Archivage audio (optionnel) |
