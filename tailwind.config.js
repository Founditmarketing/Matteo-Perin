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
        'matteo-cream': '#F2EFE9', 
        'matteo-black': '#0A0A0A', 
        'matteo-charcoal': '#1C1C1C', 
        'matteo-stone': '#8C8C8C', 
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
