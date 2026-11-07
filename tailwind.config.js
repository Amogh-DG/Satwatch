/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#15171A',
        panel: '#181B1D',
        amber: {
          DEFAULT: '#E8A33D',
          hover: '#D4922F',
        },
        offwhite: '#E8E4D8',
        muted: '#8E918B',
        hairline: '#3A3E40',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Schibsted Grotesk"', 'sans-serif'],
      },
      borderWidth: {
        hairline: '1px',
      },
      borderRadius: {
        none: '0px',
      }
    },
  },
  plugins: [],
}

