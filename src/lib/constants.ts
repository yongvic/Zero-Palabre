export const FREE_ACCORD_LIMIT = 3;
export const INVITE_EXPIRY_HOURS = 72;
export const MAGIC_LINK_EXPIRY_MINUTES = 15;

export const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  STARTER: 20,
  PRO: 100,
  BUSINESS: 9999,
};

export const PLAN_PRICES_FCFA: Record<string, number> = {
  STARTER: 2500,
  PRO: 7500,
  BUSINESS: 25000,
};

export const ACCORD_TYPE_LABELS: Record<string, string> = {
  PRET: "Prêt d'argent",
  PRESTATION: "Prestation de service",
  LOCATION: "Location",
  COMMANDE: "Commande",
  AUTRE: "Autre",
};

export const ACCORD_STATUT_LABELS: Record<string, string> = {
  PENDING: "En attente",
  SENT: "Envoyé",
  VIEWED: "Consulté",
  ACCEPTED: "Validé",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
  HONORED: "Honoré",
  DISPUTED: "Litige",
};
