/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080808',
          sidebar: '#111111',
          chat: '#080808',
          input: '#171717',
          card: '#151515',
          border: '#303030',
          text: '#FFFFFF',
          muted: '#A3A3A3',
          btn: '#FFFFFF',
          btnText: '#000000',
        },
        light: {
          bg: '#FFFFFF',
          sidebar: '#F5F5F5',
          chat: '#FFFFFF',
          input: '#F4F4F4',
          card: '#FAFAFA',
          border: '#E5E5E5',
          text: '#080808',
          muted: '#666666',
          btn: '#080808',
          btnText: '#FFFFFF',
        },
        mono: {
          50: '#F9F9F9',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1A1A1A',
          900: '#171717',
          925: '#151515',
          950: '#111111',
          990: '#080808',
          black: '#000000',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

