/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        'matteo-orange': '#CB5C38',
        // Text-grade accent for light surfaces — #CB5C38 reads 3.57:1 on cream
        // (AA failure); #A0421F reads 5.56:1. Keep matteo-orange for rules,
        // focus rings, and dark surfaces only.
        'matteo-orange-ink': '#A0421F',
        'matteo-cream': '#F2EFE9',
        'matteo-black': '#0A0A0A',
        'matteo-charcoal': '#1C1C1C',
        'matteo-stone': '#8C8C8C',
        // Text-grade stone for light surfaces — #8C8C8C is 2.93:1 on cream;
        // #6B665F is 4.96:1. Keep matteo-stone for hairlines and dark surfaces.
        'matteo-stone-ink': '#6B665F',
        'matteo-sand': '#E5E2DC',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.2em', 
      },
      lineHeight: {
        'relaxed-luxury': '1.8',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 60s linear infinite',
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'cinematic-reveal': 'cinematicReveal 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cinematicReveal: {
          '0%': { opacity: '0', transform: 'scale(0.98) translateY(15px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' },
        }
      }
    }
  },
  plugins: [],
}
