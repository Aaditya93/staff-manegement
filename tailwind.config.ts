/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "slide-in-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "translateY(15px) scale(0.95)", opacity: "0" },
          "50%": { transform: "translateY(-5px) scale(1.02)" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
      animation: {
        "slide-in-up": "slide-in-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-in",
        "bounce-in": "bounce-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
