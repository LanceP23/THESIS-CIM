/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media', // or 'class' if you toggle dark mode manually
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {

      backgroundImage: {
        'custom-radial': 'radial-gradient(circle at top left, rgba(124, 255, 192, 0.404) 0%, white 100%)',
      },
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
  plugins: [require("daisyui")
  
  ], 
}