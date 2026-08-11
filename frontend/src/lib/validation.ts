export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8;
}

export function isValidCoordinate(value: number | null): boolean {
  return value !== null && Number.isFinite(value);
}

export function isValidLatitude(value: number | null): boolean {
  return value !== null && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number | null): boolean {
  return value !== null && value >= -180 && value <= 180;
}

export function isValidPhone(value: string): boolean {
  return /^[+]?[\d\s-]{7,15}$/.test(value.trim());
}

export function formatCoordinate(value: number | null, decimals = 5): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toFixed(decimals);
}
