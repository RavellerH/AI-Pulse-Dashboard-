/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: {
          1: '#161b22',
          2: '#21262d',
          3: '#2d333b',
        },
        'border-default': '#30363d',
        'border-subtle': '#21262d',
        'text-primary': '#e6edf3',
        'text-secondary': '#8b949e',
        'text-muted': '#6e7681',
        accent: {
          DEFAULT: '#2dd4bf',
          hover: '#5eead4',
          dim: '#0d3330',
        },
        fresh: '#3fb950',
        delayed: '#d29922',
        stale: '#f85149',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
}
