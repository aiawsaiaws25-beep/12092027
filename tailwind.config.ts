import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cine: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        cinema: {
          dark: "#0b0e14",
          card: "#121722",
          cardHover: "#182030",
          border: "#1f293d",
          accent: "#f59e0b",
          red: "#ef4444",
          green: "#10b981",
          seat: {
            available: "#2a3449",
            selected: "#f59e0b",
            held: "#f97316",
            booked: "#374151",
            vip: "#8b5cf6",
            recliner: "#06b6d4",
            accessible: "#3b82f6",
          }
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cinema-glow": "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)",
      },
      animation: {
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(245, 158, 11, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(245, 158, 11, 0.6)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
