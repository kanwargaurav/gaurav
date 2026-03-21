import { ViewStyle, TextStyle } from 'react-native';

export const Colors = {
  dark: {
    bg: '#07090F',
    surface: '#0E1219',
    surfaceHigh: '#131926',
    border: 'rgba(255,255,255,0.07)',
    borderBright: 'rgba(255,255,255,0.15)',
    text: '#EDE8DF',
    textMuted: 'rgba(237,232,223,0.50)',
    textFaint: 'rgba(237,232,223,0.20)',
  },
  light: {
    bg: '#F8F5F0',
    surface: '#FFFFFF',
    surfaceHigh: '#F0EBE3',
    border: 'rgba(0,0,0,0.08)',
    borderBright: 'rgba(0,0,0,0.12)',
    text: '#1A1208',
    textMuted: 'rgba(26,18,8,0.55)',
    textFaint: 'rgba(26,18,8,0.30)',
  },
  brand: {
    coral: '#FF5533',
    rose: '#EF3F6A',
    amber: '#F5A020',
    teal: '#0BBFA0',
    violet: '#7755F0',
    sky: '#0BAADF',
  },
};

export const Gradients = {
  primary: { colors: ['#FF5533', '#EF3F6A'], start: [0, 0], end: [1, 1] },
  cool: { colors: ['#7755F0', '#0BAADF'], start: [0, 0], end: [1, 1] },
  warm: { colors: ['#FF5533', '#F5A020'], start: [0, 0], end: [1, 1] },
  nature: { colors: ['#0BBFA0', '#0BAADF'], start: [0, 0], end: [1, 1] },
};

export const Typography = {
  fonts: {
    display: 'Cormorant Garamond',
    body: 'Outfit',
  },
  sizes: {
    displayLg: 72,
    displayMd: 52,
    displaySm: 36,
    h1: 32,
    h2: 26,
    h3: 22,
    bodyLg: 16,
    body: 15,
    label: 14,
    labelSm: 13,
    caption: 12,
    captionSm: 11,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
};

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 100,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
  lg: {
    shadowColor: '#FF5533',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  } as ViewStyle,
};

export const Animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
