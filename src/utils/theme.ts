// Dynamic Theme and Color System for SingShot
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const BRAND_COLOR_PRESETS = [
  { name: 'Soho Gold', hex: '#EAB308', desc: 'Warm luxury & nightlife glow' },
  { name: 'Cyber Cyan', hex: '#06B6D4', desc: 'Electric futuristic nightclub' },
  { name: 'VIP Violet', hex: '#8B5CF6', desc: 'Opulent lounge & cocktail bar' },
  { name: 'Neon Pink', hex: '#EC4899', desc: 'Vibrant pop & karaoke energy' },
  { name: 'Emerald Velvet', hex: '#10B981', desc: 'Upscale speakeasy & casino' },
  { name: 'Ruby Laser', hex: '#EF4444', desc: 'High-intensity rock & live stage' },
  { name: 'Royal Sapphire', hex: '#3B82F6', desc: 'Modern sleek broadcast' },
  { name: 'Tangerine Glow', hex: '#F97316', desc: 'Warm retro disco & festival' }
];

export function hexToRgb(hex: string): RgbColor {
  const sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return { r: isNaN(r) ? 234 : r, g: isNaN(g) ? 179 : g, b: isNaN(b) ? 8 : b };
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    return { r: isNaN(r) ? 234 : r, g: isNaN(g) ? 179 : g, b: isNaN(b) ? 8 : b };
  }
  return { r: 234, g: 179, b: 8 };
}

export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

export function getContrastTextColor(hex: string): '#000000' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(hex);
  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#000000' : '#FFFFFF';
}

export function generateClubInitials(name: string): string {
  if (!name || !name.trim()) return 'LKC';
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
}

/**
 * Injects CSS custom properties into document.documentElement so all views
 * dynamically update their theme in real-time.
 */
export function applyThemeToDOM(primaryColor: string) {
  if (typeof document === 'undefined') return;
  
  const validHex = primaryColor?.startsWith('#') ? primaryColor : `#${primaryColor || 'EAB308'}`;
  const rgb = hexToRgb(validHex);
  const light = adjustBrightness(validHex, 28);
  const dark = adjustBrightness(validHex, -28);
  const contrast = getContrastTextColor(validHex);

  const root = document.documentElement;
  root.style.setProperty('--brand-primary', validHex);
  root.style.setProperty('--brand-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty('--brand-primary-light', light);
  root.style.setProperty('--brand-primary-dark', dark);
  root.style.setProperty('--brand-contrast', contrast);
}
