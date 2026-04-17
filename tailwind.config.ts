import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          bg: "hsl(var(--sidebar-bg))",
          "bg-hover": "hsl(var(--sidebar-bg-hover))",
          "bg-active": "hsl(var(--sidebar-bg-active))",
          text: "hsl(var(--sidebar-text))",
          "text-active": "hsl(var(--sidebar-text-active))",
          accent: "hsl(var(--sidebar-accent))",
          "progress-bg": "hsl(var(--sidebar-progress-bg))",
        },
        breadcrumb: "hsl(var(--breadcrumb))",
        "body-text": "hsl(var(--body-text))",
        heading: "hsl(var(--heading))",
      },
      fontSize: {
        xs:   ["1.125rem",  { lineHeight: "1.375rem" }],
        sm:   ["1.25rem",   { lineHeight: "1.625rem" }],
        base: ["1.375rem",  { lineHeight: "1.875rem" }],
        lg:   ["1.5625rem", { lineHeight: "2.125rem" }],
        xl:   ["1.6875rem", { lineHeight: "2.125rem" }],
        "2xl":["2rem",      { lineHeight: "2.625rem" }],
        "4xl":["2.875rem",  { lineHeight: "3.25rem" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
