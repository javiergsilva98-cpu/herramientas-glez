/** Formato español: +34 seguido de 9 dígitos. Acepta también sin el prefijo. */
const SPANISH_PHONE_REGEX = /^(\+34)?[6789]\d{8}$/;

export function isValidSpanishPhone(value: string): boolean {
  return SPANISH_PHONE_REGEX.test(value.replace(/\s/g, ""));
}

export function normalizePhone(value: string): string {
  const trimmed = value.replace(/\s/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  return `+34${trimmed}`;
}
