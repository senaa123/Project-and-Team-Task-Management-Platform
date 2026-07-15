import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B37B7",
          light: "#8C6AE6",
          dark: "#4A2A9A",
          50: "#F2EFFE",
          100: "#E4DCFB",
        },
        accent: {
          orange: "#F97316",
          blue: "#3B82F6",
        },
        surface: "#FFFFFF",
        background: "#F8F7FC",
        muted: "#6B7280",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(124, 58, 237, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;