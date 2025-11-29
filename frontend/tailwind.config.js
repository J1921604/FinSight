/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Neumorphism palette
        primary: {
          cyan: '#00D4FF',
          magenta: '#FF2ECC',
        },
        accent: {
          green: '#00FF84',
          red: '#FF4757',
          yellow: '#FFB800',
        },
        bg: {
          dark: '#0A0E27',
          card: '#1A1F3A',
        },
        text: {
          primary: '#E0E6F7',
          secondary: '#A0AEC0',
        },
      },
      boxShadow: {
        'neuro-sm': '3px 3px 6px #070A1A, -3px -3px 6px #0D1234',
        'neuro-md': '5px 5px 10px #070A1A, -5px -5px 10px #0D1234',
        'neuro-lg': '10px 10px 20px #070A1A, -10px -10px 20px #0D1234',
        'neuro-inset': 'inset 3px 3px 6px #070A1A, inset -3px -3px 6px #0D1234',
      },
    },
  },
  plugins: [],
}
