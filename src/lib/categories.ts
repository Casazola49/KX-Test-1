// Categorías fijas para todos los formularios
export const FIXED_CATEGORIES = [
  'F200 MASTER',
  'F200 SUPER',
  'F200 STANDARD',
  '125cc PROFESIONAL',
  'MINI 60',
  'BABY KART',
  'INFANTIL 6.5',
  'VORTEX 100',
  'MASTER X30'
] as const;

export type CategoryType = typeof FIXED_CATEGORIES[number];