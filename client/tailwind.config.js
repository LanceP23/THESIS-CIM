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
        customgreen_1: '#98D08F',
        custom_header: 'khaki',
        bg_gradient: 'background: linear-gradient(to right, #98D08F, #8FD0A1, #D0D08F)',
        green_gradient: 'background: linear-gradient(to right, rgba(0,191,99,1) 0%, rgba(0,0,0,1) 100%)',
      },

      boxShadow: {
        'inner-bottom': 'inset 30px 30px 20px 50px rgba(0, 0, 0, 0.1)', // Customize the values as needed
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        'text-reveal': {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out forwards',
        'text-reveal': 'text-reveal 0.5s ease-out forwards',
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