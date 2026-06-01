# Signature vocale (DeepSeek)

## Configuration

```env
DEEPSEEK_API_KEY="sk-..."
DEEPSEEK_MODEL="deepseek-chat"
# Optionnel
DEEPSEEK_BASE_URL="https://api.deepseek.com"
BLOB_READ_WRITE_TOKEN="..."  # archivage audio (Vercel Blob)
```

Clé API : [platform.deepseek.com](https://platform.deepseek.com)

## Parcours utilisateur

1. `/valider/[token]` → onglet **Signature vocale**
2. Choix accepter / refuser → consentement RGPD
3. Enregistrement + transcription navigateur (Web Speech API) ou saisie manuelle
4. Analyse DeepSeek → extraction JSON (nom, consentement, termes)
5. Si champs manquants → complément écrit ou nouvel enregistrement
6. Confirmation → `POST /api/accords/[token]/valider` avec `voiceSessionId`

## API

| Route | Rôle |
|-------|------|
| `POST .../voice/extract` | Transcription → DeepSeek → session |
| `POST .../voice/audio` | Upload preuve audio (Blob) |
| `POST .../valider` | Validation + `voiceSessionId` si signature vocale |

## Navigateurs

- Transcription live : Chrome, Edge (desktop)
- Fallback : saisie manuelle du texte
- Micro : HTTPS ou localhost
