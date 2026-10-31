import type { Config } from "tailwindcss";

// Colors are RGB channels defined in app/globals.css, so light/dark switch there
// and Tailwind opacity modifiers (e.g. border-ink/25) still work.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        "paper-raised": token("paper-raised"),
        ink: token("ink"),
        muted: token("ink-muted"),
        rule: token("rule"),
        redline: token("redline"),
        accent: token("accent"),
        "on-accent": token("on-accent"),
        highlight: token("highlight"),
        "on-highlight": token("on-highlight"),
        danger: token("danger"),
      },
      fontFamily: {
        serif: ["var(--font-literata)", "Georgia", "serif"],
        sans: ["var(--font-onest)", "system-ui", "sans-serif"],
      },
      spacing: {
        line: "var(--line)",
      },
      lineHeight: {
        line: "var(--line)",
      },
    },
  },
  plugins: [],
} satisfies Config;
