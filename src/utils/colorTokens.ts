// RestoMap - Color Design Tokens

export const colors = {
  // Primary Brand Colors
  orange: '#F97316',
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',

  // Neutrals
  slateDark: '#334155',
  slateLight: '#F1F5F9',
  white: '#FFFFFF',

  // UI Colors
  grayBorder: '#E2E8F0',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Semantic Colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Gradient stops
  gradientOrange: '#F97316',
  gradientRed: '#EF4444',
} as const;

export const gradients = {
  primary: `linear-gradient(to right, ${colors.orange}, ${colors.red})`,
  badge: `linear-gradient(to right, #FB923C, #F87171)`,
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
} as const;

export const borderRadius = {
  button: '12px',
  card: '12px',
  modal: '16px',
  pill: '999px',
  badge: '6px',
} as const;
