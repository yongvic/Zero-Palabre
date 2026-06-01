export function computeTrustLevel(hasProof: boolean): number {
  return hasProof ? 3 : 2;
}

export function trustLevelLabel(level: number): string {
  if (level >= 4) return "Vérifié opérateur";
  if (level >= 3) return "Confirmé avec justificatif";
  if (level >= 2) return "Confirmé par les deux parties";
  return "Déclaration en attente";
}
