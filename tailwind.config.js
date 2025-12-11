export default {
  darkMode :'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        moveRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
      animation: {
        moveRight: 'moveRight 8s linear infinite',
        fadeOut: 'fadeOut 1s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
