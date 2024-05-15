/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customyellow: '#f6e8295b',
        customRed: '#EF4444',
        customgreen_1: '#98D08F'
      },
    },

    variants: {
      extend: {
        backgroundColor: ['even', 'hover'],
      },
    },

    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Menlo', 'monospace'],
    },
  },
  plugins: [require("daisyui")],
}