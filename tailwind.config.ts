import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      colors: {
        ink: "#221f1c",
        linen: "#fbf7f0",
        blush: "#d9a6a0",
        sage: "#89957a",
        gold: "#b58b4b"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(35, 31, 28, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
