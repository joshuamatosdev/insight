/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Manual toggle (Light default)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          black: '#050505',   // Rich black for high contrast
          white: '#ffffff',
          gray: '#71717a',    // Zinc-500 equivalent for body text
          light: '#f4f4f5',   // Zinc-100 for subtle backgrounds
          border: '#e4e4e7',  // Zinc-200 for borders
        }
      },
      fontFamily: {
        // Mapped to your Typekit selections
        sans: ['"basic-sans"', '"unitext"', 'system-ui', 'sans-serif'],
        display: ['"gimlet-display-compressed"', 'sans-serif'],
        accent: ['"itc-avant-garde-gothic-pro"', 'sans-serif'],
      },
      fontSize: {
        // Massive sizes for the "Studio" headers
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        tighter: '-0.04em',
        widest: '0.1em', // For button uppercase text
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
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
