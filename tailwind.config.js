/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        // Genoa Academy custom colors
        'genoa-red': '#7A0A12',
        'genoa-red-dark': '#5A0810',
        'genoa-red-accent': '#9B1B24',
        'genoa-navy': '#0B1B3D',
        'genoa-navy-dark': '#060F25',
        'genoa-navy-mid': '#142850',
        'genoa-gold': '#C9A84C',
        'genoa-gold-light': '#E0C878',
        'genoa-gold-dark': '#A68B3A',
        'success-green': '#25D366',
        'genoa-white': '#F5F1EB',
        'genoa-pure-white': '#FFFFFF',
        'text-dark': '#0B1B3D',
        'text-muted': '#8A94A6',
      },
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'sans-serif'],
        'inter': ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'gold': '0 4px 20px rgba(201, 168, 76, 0.4)',
        'gold-lg': '0 8px 30px rgba(201, 168, 76, 0.5)',
        'whatsapp': '0 4px 20px rgba(37, 211, 102, 0.4)',
        'whatsapp-lg': '0 8px 30px rgba(37, 211, 102, 0.6)',
        'form': '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(122, 10, 18, 0.15)',
        'slide': '0 20px 60px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "grain": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "30%": { transform: "translate(3%, -15%)" },
          "50%": { transform: "translate(12%, 9%)" },
          "70%": { transform: "translate(9%, 4%)" },
          "90%": { transform: "translate(-1%, 7%)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.4" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "scroll-dot": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(36px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "grain": "grain 8s steps(10) infinite",
        "shimmer": "shimmer 0.8s ease-in-out",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "pulse-ring-delayed": "pulse-ring 2s ease-out infinite 0.6s",
        "scroll-dot": "scroll-dot 2s ease-in-out infinite",
        "spin-slow": "spin-slow 1.5s linear infinite",
        "shake": "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
