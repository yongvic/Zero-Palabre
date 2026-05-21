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
      },
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        amber: {
          50: "var(--color-amber-50)",
          100: "var(--color-amber-100)",
          200: "var(--color-amber-200)",
          400: "var(--color-amber-400)",
          600: "var(--color-amber-600)",
          700: "var(--color-amber-700)",
          900: "var(--color-amber-900)",
        },
        neutral: {
          0: "var(--color-neutral-0)",
          50: "var(--color-neutral-50)",
          75: "var(--color-neutral-75)",
          100: "var(--color-neutral-100)",
          150: "var(--color-neutral-150)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
        success: {
          50: "var(--color-success-50)",
          100: "var(--color-success-100)",
          600: "var(--color-success-600)",
          800: "var(--color-success-800)",
        },
        error: {
          50: "var(--color-error-50)",
          100: "var(--color-error-100)",
          600: "var(--color-error-600)",
          800: "var(--color-error-800)",
        },
        info: {
          50: "var(--color-info-50)",
          100: "var(--color-info-100)",
          600: "var(--color-info-600)",
        },
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "focus-primary": "var(--shadow-focus-primary)",
        "focus-error": "var(--shadow-focus-error)",
      },
      maxWidth: {
        container: "1280px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
