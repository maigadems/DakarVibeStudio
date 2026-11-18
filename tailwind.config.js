/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#09090A', 900: '#0E0E10', 800: '#141416', 700: '#1B1B1E', 600: '#26262A', 500: '#34343A' },
        bone: { DEFAULT: '#F3EFE8', 200: '#D9D4CB', 400: '#A39E95', 600: '#6F6A63' },
        ember: { DEFAULT: '#F26B21', 400: '#FF8A47', 600: '#D9531A', 700: '#B4410F' },
        crimson: { DEFAULT: '#D93A3A', 600: '#B92E2E' },
        sage: '#7FB59A',
        amberish: '#E8B04B'
      },
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      letterSpacing: { widest2: '0.32em' },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        wave: { '0%,100%': { transform: 'scaleY(.35)' }, '50%': { transform: 'scaleY(1)' } },
        'slide-in': { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        ring: { '0%': { transform: 'scale(.6)', opacity: '.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        shine: { '0%': { transform: 'translateX(-120%) skewX(-20deg)' }, '60%,100%': { transform: 'translateX(220%) skewX(-20deg)' } },
        glow: { '0%,100%': { opacity: '.35', transform: 'scale(.95)' }, '50%': { opacity: '.75', transform: 'scale(1.05)' } },
        eq: { '0%,100%': { transform: 'scaleY(.25)' }, '50%': { transform: 'scaleY(1)' } },
        breathe: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.06)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'slide-left': { '0%': { opacity: '0', transform: 'translateX(40px) scale(.98)' }, '100%': { opacity: '1', transform: 'none' } },
        'slide-right': { '0%': { opacity: '0', transform: 'translateX(-40px) scale(.98)' }, '100%': { opacity: '1', transform: 'none' } },
        'zoom-in': { '0%': { opacity: '0', transform: 'scale(.92)' }, '100%': { opacity: '1', transform: 'scale(1)' } }
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fade-in .4s ease both',
        'scale-in': 'scale-in .25s cubic-bezier(.2,.7,.2,1) both',
        marquee: 'marquee 40s linear infinite',
        wave: 'wave 1.3s ease-in-out infinite',
        'slide-in': 'slide-in .3s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 5s ease-in-out infinite',
        'spin-slow': 'spin-slow 14s linear infinite',
        'spin-slower': 'spin-slow 26s linear infinite reverse',
        ring: 'ring 3s cubic-bezier(.2,.7,.2,1) infinite',
        shine: 'shine 4.5s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite',
        eq: 'eq 1.2s ease-in-out infinite',
        breathe: 'breathe 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        'slide-left': 'slide-left .45s cubic-bezier(.2,.7,.2,1) both',
        'slide-right': 'slide-right .45s cubic-bezier(.2,.7,.2,1) both',
        'zoom-in': 'zoom-in .5s cubic-bezier(.2,.7,.2,1) both'
      }
    }
  },
  plugins: []
};
