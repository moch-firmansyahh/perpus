/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#DC2626', hover: '#B91C1C', soft: '#FEE2E2' },
        navy: { DEFAULT: '#14213D', 700: '#1E2D50', 500: '#3E4C78' },
        cream: '#F6F4F0',
        accent: '#F4B13E',
        success: { DEFAULT: '#16A34A', soft: '#DCFCE7' },
        warning: { DEFAULT: '#D97706', soft: '#FEF3C7' },
        danger: { DEFAULT: '#DC2626', soft: '#FEE2E2' },
        ink: { DEFAULT: '#111827', muted: '#6B7280', line: '#E5E7EB' },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
