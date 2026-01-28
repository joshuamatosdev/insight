/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          black: '#050505',
          white: '#ffffff',
          gray: '#71717a',
          light: '#f4f4f5',
          border: '#e4e4e7',
        }
      },
      fontFamily: {
        sans: ['"basic-sans"', '"unitext"', 'system-ui', 'sans-serif'],
        display: ['"gimlet-display-compressed"', 'sans-serif'],
        accent: ['"itc-avant-garde-gothic-pro"', 'sans-serif'],
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        tighter: '-0.04em',
        widest: '0.1em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'pill': '9999px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // STRATEGY CLASS IS CRITICAL: prevents plugin from overriding your custom inputs
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/aspect-ratio'),
  ],
}
