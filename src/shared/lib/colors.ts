const DARK_MODE_FACTOR = 0.6;
const LUMINANCE_THRESHOLD = 0.5;

export const COLORS = {
  DARK_TEXT: '#1a1a2e',
  LIGHT_TEXT: '#ffffff',
  PRIMARY: '#5f33e1',
} as const;

export const LIGHT_COLORS = ['#ffe5a4', '#ebe4ff', '#7dc8e7', '#77dd77'] as const;

export function isLightColor(color: string): boolean {
  return LIGHT_COLORS.includes(color as (typeof LIGHT_COLORS)[number]);
}

export function getDarkModeColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.round(r * DARK_MODE_FACTOR);
  const newG = Math.round(g * DARK_MODE_FACTOR);
  const newB = Math.round(b * DARK_MODE_FACTOR);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export function getContrastColor(hexColor: string, isDark: boolean): string {
  if (isDark) return COLORS.LIGHT_TEXT;

  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > LUMINANCE_THRESHOLD ? COLORS.DARK_TEXT : COLORS.LIGHT_TEXT;
}

export function getThemeAwareColor(hexColor: string, isDark: boolean): string {
  return isDark ? getDarkModeColor(hexColor) : hexColor;
}
