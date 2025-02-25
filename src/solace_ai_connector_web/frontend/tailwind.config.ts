import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        'solace-blue' : '#0c2139',
        'solace-green' : '#00af83',
        'solace-dark-green' : '#068f6c',
        'solace-light-blue' : '#032034',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slideDown': 'slideDown 0.2s ease-out forwards',
      }
    }
  },
  plugins: [require('tailwind-scrollbar-hide'), require('@tailwindcss/typography')],
  darkMode: "class",
} satisfies Config;