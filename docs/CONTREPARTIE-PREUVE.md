# Brainstorm — Preuve quand la contrepartie remplit les termes

> Vocal désactivé en UI (`VOICE_FEATURES_ENABLED` absent ou ≠ `true`).  
> Cette spec décrit la **prochaine** fonctionnalité prioritaire.

## Problème

Aujourd’hui le destinataire **accepte ou refuse** un texte figé. Il n’y a pas de trace structurée quand il **relit, confirme ou ajuste** chaque terme avant de s’engager.

## Vision produit

**« Parcours de prise de position »** — un flux guidé, interactif, qui produit une **preuve horodatée** (comme le PDF actuel, enrichi).

```text
Initiateur crée l'accord
        ↓
Email + lien /valider/[token]
        ↓
Destinataire — parcours en 6 écrans (pas un seul clic)
        ↓
Preuve scellée (PDF + événements + hash)
```

---

## Parcours UX proposé (6 étapes)

| # | Écran | Interaction | Preuve enregistrée |
|---|--------|-------------|-------------------|
| 1 | **Bienvenue** | Confirmer identité (nom, email pré-remplis) | `PARTY_IDENTIFIED` |
| 2 | **Résumé** | Carte accord : titre, montant, échéance, initiateur | `DOCUMENT_VIEWED` |
| 3 | **Terme par terme** | Une carte à la fois : accepter tel quel / proposer modification | `TERM_ACK` ou `TERM_AMENDED` par champ |
| 4 | **Vos modifications** | Récap des changements vs version initiale | `AMENDMENTS_REVIEWED` |
| 5 | **Engagement** | Cases à cocher + signature tapée (nom complet) | `CONSENT_GIVEN`, `SIGNATURE_TYPED` |
| 6 | **Confirmation** | Animation succès + télécharger PDF + lien vérifier | `ACCEPTED` + hash final |

### Refus (branche parallèle)

À tout moment : bouton **« Je refuse »** → motif obligatoire → `REJECTED` avec snapshot des étapes déjà faites.

---

## UI / UX (interactif & dynamique)

- **Stepper horizontal** en haut (comme création d’accord) avec progression animée.
- **Une carte par clause** (montant, date, description) — swipe ou boutons « J’accepte ce terme » / « Je propose autre chose ».
- **Panneau latéral** (desktop) ou drawer (mobile) : « Version de l’initiateur » vs « Votre réponse ».
- **Micro-interactions** : Framer Motion entre étapes, checkmarks, confettis discrets à l’étape 6.
- **Accessibilité** : tout faisable au clavier ; pas de vocal requis.

---

## Modèle de données (MVP)

```prisma
model AccordPartySession {
  id            String   @id @default(cuid())
  sessionId     String   @unique @default(cuid())
  accordId      String
  role          String   // DESTINATAIRE
  status        String   // IN_PROGRESS | COMPLETED | REJECTED
  currentStep   Int      @default(1)
  fieldResponses Json    // { montant: { action, value, at }, ... }
  signatureName String?
  consentAt     DateTime?
  expiresAt     DateTime
  accord        Accord   @relation(...)
}

// AccordEvent existant :
// TERM_ACK, TERM_AMENDED, PARTY_SESSION_COMPLETED, ...
```

**Hash final** : inclure `fieldResponses` + `signatureName` + horodatages dans `contentHash` (comme aujourd’hui).

---

## Règles métier

| Cas | Comportement MVP |
|-----|------------------|
| Tout accepté tel quel | Validation classique + PDF |
| Au moins 1 terme modifié | **Option A** : bloquer jusqu’à réponse initiateur (phase 2) · **Option B** : accepter avec « version destinataire » dans le PDF (MVP plus simple) |
| Session expirée (5 h après envoi) | Lien et parcours indisponibles ; statut `EXPIRED` |
| Hors ligne | Lecture cache seulement ; pas de sauvegarde d’étape |

---

## API (esquisse)

| Route | Rôle |
|-------|------|
| `POST /api/accords/[token]/party-session` | Démarrer / reprendre session |
| `PATCH .../party-session/step` | Enregistrer réponse d’une étape |
| `POST .../party-session/complete` | Sceller + valider accord |
| `POST .../party-session/reject` | Refus avec motif |

---

## PDF enrichi

Sections additionnelles :

- Tableau **« Position du destinataire »** (champ / valeur proposée / acceptée ou modifiée / horodatage).
- **Signature tapée** + mention « Parcours guidé Zéro-Palabre ».
- QR inchangé vers `/verifier/[token]`.

---

## Phases de livraison

| Phase | Contenu |
|-------|---------|
| **MVP** | Étapes 1–3–5–6 si pas de modification ; refus ; events ; PDF basique |
| **2** | Étape 4 modifications + contre-proposition à l’initiateur |
| **3** | Signature dessinée (canvas) + OTP SMS identité |

---

## Implémenté (MVP)

- `src/components/accord/party-flow/party-accord-wizard.tsx`
- `src/app/valider/[token]/page.tsx` — parcours guidé actif
- `src/lib/party-session/*`
- `src/app/api/accords/[token]/party-session/*`
- Modèle Prisma `AccordPartySession`

---

## Réactivation du vocal (plus tard)

Dans `.env` :

```env
VOICE_FEATURES_ENABLED=true
GEMINI_API_KEY=...
```
