/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spa: {
          50: '#f4f8f6',
          100: '#e5f0ec',
          200: '#cae1d8',
          300: '#a1cbbe',
          400: '#71ad9d',
          500: '#4e9181',
          600: '#3c7568',
          700: '#325e55',
          800: '#2a4c45',
          900: '#25403b',
          950: '#142522',
        },
        sage: {
          50: '#f6f7f4',
          100: '#ebeee7',
          200: '#d7ded0',
          300: '#b9c6b0',
          400: '#9baa8e',
          500: '#7e9072',
          600: '#627258',
          700: '#4e5b47',
          800: '#404a3b',
          900: '#373f33',
        },
        sand: {
          50: '#faf8f5',
          100: '#f4efe8',
          200: '#e9decb',
          300: '#dbc8a9',
          400: '#cbb085',
          500: '#be9b68',
          600: '#b0885a',
          700: '#936e4b',
          800: '#775941',
          900: '#624a37',
        },
        gold: {
          50: '#fbf8ed',
          100: '#f5edd0',
          200: '#ecdaa3',
          300: '#e1c26f',
          400: '#d7ab45',
          500: '#c8942b',
          600: '#ab7422',
          700: '#88541e',
          800: '#70431e',
          900: '#5e381d',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
