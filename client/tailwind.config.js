/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warmBg: '#F7F7F3',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#171717',
          primary: '#171717',
          secondary: '#6B6B67',
          muted: '#8E8E89',
        },
        slateText: '#6B6B67',
        softBorder: '#E6E6E1',
        aiLime: {
          DEFAULT: '#C7F36B',
          hover: '#BCE85F',
          light: '#EAF9CC',
        },
        deepForest: {
          DEFAULT: '#16352B',
          hover: '#102820',
          light: '#1F473A',
        },
        successGreen: '#36A269',
        coralError: '#E85D5D',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        // Font hierarchy specifications
        'h1': ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1.12', letterSpacing: '-0.03em', fontWeight: '700' }], // 48-64px / Bold
        'h2': ['clamp(2rem, 3.5vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '600' }], // 32-40px / SemiBold
        'h3': ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }], // 22-28px / SemiBold
        'body-base': ['16px', { lineHeight: '1.5' }], // 15-16px Body
        'body-sm': ['14px', { lineHeight: '1.45' }], // 13-14px Small
        'label-xs': ['13px', { lineHeight: '1.3', fontWeight: '500' }], // 12-13px / Medium Labels
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(22, 53, 43, 0.08), 0 8px 10px -6px rgba(22, 53, 43, 0.04)',
        'modal': '0 25px 50px -12px rgba(22, 53, 43, 0.18)',
        'glow-lime': '0 0 20px -2px rgba(199, 243, 107, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
