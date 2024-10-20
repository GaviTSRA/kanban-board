/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "background-primary": "#1E1E2E",
        "background-secondary": "#28293D",
        "header-bar": "#2C2C44",
        "card-background": "#3C3F58",
        "card-hover": "#4E527D",
        "primary-text": "#FFFFFF",
        "secondary-text": "#B0B0C0",
        "accent-primary": "#FF6666",
        "accent-secondary": "#77DD77",
        "border-color": "#444466",
      },
    },
  },
  plugins: [],
};
