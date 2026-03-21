/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark palette
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
        // Light palette
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
        // Brand accents
        coral: '#FF5533',
        rose: '#EF3F6A',
        amber: '#F5A020',
        teal: '#0BBFA0',
        violet: '#7755F0',
        sky: '#0BAADF',
      },
      fontSize: {
        // Display typography
        'display-lg': ['72px', '88px'],
        'display-md': ['52px', '64px'],
        'display-sm': ['36px', '44px'],
        // Heading typography
        'h1': ['32px', '40px'],
        'h2': ['26px', '32px'],
        'h3': ['22px', '28px'],
        // Body typography
        'body-lg': ['16px', '24px'],
        'body': ['15px', '24px'],
        'label': ['14px', '20px'],
        'label-sm': ['13px', '18px'],
        'caption': ['12px', '16px'],
        'caption-sm': ['11px', '14px'],
      },
      spacing: {
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '100px',
      },
      shadows: {
        'sm': {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 2,
        },
        'md': {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.20,
          shadowRadius: 16,
          elevation: 8,
        },
        'lg': {
          shadowColor: '#FF5533',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 32,
          elevation: 12,
        },
      },
    },
  },
  plugins: [],
};
