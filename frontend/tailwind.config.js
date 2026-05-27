export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pastel: {
          // Primary pastel blues
          blue: {
            50: '#f0f7ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
          },
          // Soft pinks
          pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
          },
          // Mint greens
          mint: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
          },
          // Lavender purples
          lavender: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
          },
          // Peach/coral
          peach: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
          },
          // Soft yellows
          yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308',
          },
        },
      },
      backgroundImage: {
        'pastel-gradient': 'linear-gradient(135deg, #e0f2fe 0%, #fce7f3 50%, #f0fdf4 100%)',
        'pastel-gradient-2': 'linear-gradient(135deg, #faf5ff 0%, #e0f2fe 50%, #ffedd5 100%)',
        'pastel-gradient-3': 'linear-gradient(135deg, #dcfce7 0%, #bae6fd 50%, #fce7f3 100%)',
      },
      boxShadow: {
        'pastel': '0 4px 14px 0 rgba(139, 92, 246, 0.1)',
        'pastel-lg': '0 10px 25px -3px rgba(139, 92, 246, 0.15)',
        'pastel-xl': '0 20px 40px -10px rgba(139, 92, 246, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};