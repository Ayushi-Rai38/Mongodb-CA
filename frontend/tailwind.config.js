/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:  { DEFAULT: "#FDF6EC", dark: "#F5E9D4" },
        forest: {
          50:  "#f0f7f3",
          100: "#d9ede4",
          200: "#b3dbc9",
          300: "#82c2a8",
          400: "#50a484",
          500: "#2D6A4F",
          600: "#265d44",
          700: "#1e4d38",
          800: "#173d2c",
          900: "#0f2d21",
        },
        amber:  { DEFAULT: "#F4A261", light: "#FDDBB4" },
        coral:  { DEFAULT: "#E76F51" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        "card": "0 4px 24px rgba(45,106,79,0.10)",
        "card-hover": "0 8px 40px rgba(45,106,79,0.18)",
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp:   { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.7 } },
      },
    },
  },
  plugins: [],
};
