import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#111827",
        muted: "#6b7280",
        accent: {
          DEFAULT: "#2563eb",
          pink: "#ec4899"
        }
      }
    }
  },
  plugins: []
};
export default config;
