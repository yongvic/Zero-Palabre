export const FREE_ACCORD_LIMIT = 3;
export const INVITE_EXPIRY_HOURS = 5;
export const SIGNATURE_EXPIRY_HOURS = 24;
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
  OVERDUE: "En retard",
  HONORED: "Honoré",
  DISPUTED: "Litige",
  AWAITING_INITIATOR_SIGN: "À signer (vous)",
  AWAITING_COUNTERPARTY_SIGN: "En attente contrepartie",
  DUAL_SIGNED: "Double signature",
  CANCELLED_TIMEOUT: "Annulé (délai)",
  ESCROW_FUNDED: "Fonds transférés",
  ACTIVE: "Actif",
  REPAYING: "Remboursement en cours",
  CLOSED: "Clôturé",
};

export const REPAYMENT_MODE_LABELS: Record<string, string> = {
  MUTUAL_CONFIRM: "Déclaration + confirmation",
  SCHEDULED_DEBIT: "Prélèvement à l'échéance",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  TMONEY: "Tmoney",
  FLOOZ: "Flooz",
  CASH: "Espèces",
  BANK_TRANSFER: "Virement bancaire",
  OTHER: "Autre",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CREATED: "Accord créé",
  SENT: "Invitation envoyée",
  VIEWED: "Document consulté",
  ACCEPTED: "Accord accepté",
  REJECTED: "Accord refusé",
  OVERDUE_MARKED: "Échéance dépassée",
  FULFILLMENT_DECLARED: "Remboursement déclaré",
  FULFILLMENT_CONFIRMED: "Remboursement confirmé",
  FULFILLMENT_REJECTED: "Déclaration refusée",
  HONORED: "Accord honoré",
  DISPUTED: "Litige ouvert",
  PARTY_SESSION_COMPLETED: "Parcours terminé",
};
