/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"SF Pro"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'SFMono-Regular', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        handwriting: ['"Caveat"', '"Kalam"', 'cursive', 'sans-serif'],
      },
      colors: {
        apple: {
          blue: '#0071e3',
          'blue-hover': '#0077ed',
          'blue-dark': '#2997ff',
          'blue-soft': 'rgba(41, 151, 255, 0.12)',
          canvas: '#000000',
          tile: '#161618',
          card: '#1c1c1e',
          'card-hover': '#242426',
          border: 'rgba(255, 255, 255, 0.10)',
          'border-subtle': 'rgba(255, 255, 255, 0.06)',
          input: 'rgba(255, 255, 255, 0.06)',
          'input-focus': 'rgba(255, 255, 255, 0.09)',
          text: '#f5f5f7',
          muted: '#86868b',
          dim: '#6e6e73',
          green: '#30d158',
          orange: '#ff9f0a',
          red: '#ff453a',
          purple: '#bf5af2',
          teal: '#64d2ff'
        }
      },
      boxShadow: {
        'apple-card': '0 4px 24px -1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'apple-light-card': '0 2px 14px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'apple-hover': '0 8px 28px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        'apple-glow': '0 0 35px -5px rgba(0, 113, 227, 0.35)',
        'apple-focus': '0 0 0 3px rgba(0, 113, 227, 0.25)',
      }
    },
  },
  plugins: [],
}
