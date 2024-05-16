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

      boxShadow: {
        'inner-bottom': 'inset 30px 30px 20px 50px rgba(0, 0, 0, 0.1)', // Customize the values as needed
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out forwards',
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