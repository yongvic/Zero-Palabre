import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        geist: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        primary: {
          50: "oklch(var(--primary-50) / <alpha-value>)",
          100: "oklch(var(--primary-100) / <alpha-value>)",
          200: "oklch(var(--primary-200) / <alpha-value>)",
          300: "oklch(var(--primary-300) / <alpha-value>)",
          400: "oklch(var(--primary-400) / <alpha-value>)",
          500: "oklch(var(--primary-500) / <alpha-value>)",
          600: "oklch(var(--primary-600) / <alpha-value>)",
          700: "oklch(var(--primary-700) / <alpha-value>)",
          800: "oklch(var(--primary-800) / <alpha-value>)",
          900: "oklch(var(--primary-900) / <alpha-value>)",
          950: "oklch(var(--primary-950) / <alpha-value>)",
        },
        neutral: {
          0: "oklch(var(--neutral-0) / <alpha-value>)",
          50: "oklch(var(--neutral-50) / <alpha-value>)",
          100: "oklch(var(--neutral-100) / <alpha-value>)",
          200: "oklch(var(--neutral-200) / <alpha-value>)",
          300: "oklch(var(--neutral-300) / <alpha-value>)",
          400: "oklch(var(--neutral-400) / <alpha-value>)",
          500: "oklch(var(--neutral-500) / <alpha-value>)",
          600: "oklch(var(--neutral-600) / <alpha-value>)",
          700: "oklch(var(--neutral-700) / <alpha-value>)",
          800: "oklch(var(--neutral-800) / <alpha-value>)",
          900: "oklch(var(--neutral-900) / <alpha-value>)",
          950: "oklch(var(--neutral-950) / <alpha-value>)",
        },
        amber: {
          500: "oklch(var(--amber-500) / <alpha-value>)",
        },
        error: {
          600: "oklch(var(--error-600) / <alpha-value>)",
        },
        success: {
          600: "oklch(var(--success-600) / <alpha-value>)",
        },
        info: {
          600: "oklch(var(--info-600) / <alpha-value>)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        premium: "var(--shadow-premium)",
        glass: "var(--shadow-glass)",
        "glass-dark": "var(--shadow-glass-dark)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        drawer: "var(--ease-drawer)",
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        "fade-in": "fade-in 0.5s var(--ease-out) forwards",
        "slide-up": "slide-up 0.5s var(--ease-out) forwards",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

