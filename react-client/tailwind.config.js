/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx", "./src/App.tsx"],
  theme: {
    extend: {
      colors: {
        "background": "#1E1E2E",
        "list": "#28293D",
        "header": "#2C2C44",
        "card": "#3C3F58",
        "card-hover": "#4E527D",
        "primary-text": "#FFFFFF",
        "secondary-text": "#B0B0C0",
        "danger": "#FF4D4D",
        "success": "#28a745",
        "border": "#444466",
        'context-menu': '#2B2B3A',
        "context-menu-border": "#1F1F28",
        "button": "#2D2D3A",
        "button-hover": "#3A3A50"
      },
    },
  },
  plugins: [],
};
