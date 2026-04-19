/**
 * Utilitarios compartidos para el sistema PRONO2026
 */

/**
 * Valida que un valor sea un número válido para goles/penales
 * @param val - El valor a validar
 * @returns true si es un número válido >= 0
 */
export const isValidScore = (val: any): boolean => {
  if (val === null || val === undefined || val === "" || val === "-")
    return false;
  const n = Number(val);
  return !isNaN(n) && isFinite(n) && n >= 0;
};
