/**
 * Fonctionnalités vocales (création + validation).
 * Code conservé ; UI visible uniquement si VOICE_FEATURES_ENABLED=true
 */
export function isVoiceFeaturesEnabled(): boolean {
  return process.env.VOICE_FEATURES_ENABLED === "true";
}
