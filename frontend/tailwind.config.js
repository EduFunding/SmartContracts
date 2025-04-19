/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F8FF',
          100: '#D1EFFF',
          200: '#AEE3FF',
          300: '#7BD4FF',
          400: '#35BBFF',
          500: '#0795FF',
          600: '#006EFF',
          700: '#0055FF',
          800: '#0046D7',
          900: '#003FA3',
          950: '#082865',
        },
      },
    },
  },
  plugins: [],
}
