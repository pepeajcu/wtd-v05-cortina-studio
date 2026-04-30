import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3F4C42',
          foreground: '#FDFDFC',
        },
        secondary: {
          DEFAULT: '#D8CFC4',
          foreground: '#1A1A1A',
        },
        accent: {
          DEFAULT: '#B89B5E',
          foreground: '#1A1A1A',
        },
        background: '#FDFDFC',
        foreground: '#1A1A1A',
        muted: {
          DEFAULT: '#D8CFC4',
          foreground: '#1A1A1A',
        },
        border: '#D8CFC4',
      },
      fontFamily: {
        sans: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.06)',
        'medium': '0 4px 16px 0 rgb(0 0 0 / 0.08)',
        'strong': '0 8px 32px 0 rgb(0 0 0 / 0.12)',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'display-md': ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
    },
  },
  plugins: [],
};
export default config;
