export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      keyframes: {
        glow: { '0%,100%': { opacity: '.55' }, '50%': { opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-8px)' }, '75%': { transform: 'translateX(8px)' } },
        pop: { '0%': { transform: 'scale(.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        rise: { '0%': { transform: 'translateY(0)', opacity: '1' }, '100%': { transform: 'translateY(-50px)', opacity: '0' } },
      },
      animation: {
        glow: 'glow 2.4s ease-in-out infinite', float: 'float 5s ease-in-out infinite',
        shake: 'shake .4s', pop: 'pop .35s ease-out', rise: 'rise 1.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
