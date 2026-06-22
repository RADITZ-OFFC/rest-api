/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9A93D3",
          hover:   "#8880c4",
          light:   "#b8b3e0",
        },
        secondary: {
          DEFAULT: "#A7B960",
          hover:   "#96a750",
          light:   "#c0cc85",
        },
        muted: {
          DEFAULT: "#A197B7",
          light:   "#C4BFDA",
        },
        surface: {
          DEFAULT: "#13121a",
          dark:    "#0a0a0f",
          card:    "#1a1825",
          hover:   "#1e1c2a",
          border:  "rgba(255,255,255,0.06)",
        },
        text: {
          primary: "#e8e6f0",
          muted:   "#8b87a8",
          faint:   "#4a4760",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl:  "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        glow:       "0 0 20px rgba(154,147,211,0.15)",
        "glow-sm":  "0 0 12px rgba(154,147,211,0.1)",
        "glow-green":"0 0 20px rgba(167,185,96,0.15)",
        card:       "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};
