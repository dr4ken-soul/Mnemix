import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        mono: ['Azeret Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#090b11',
          secondary: '#0f1219',
          surface: '#161b26',
          elevated: '#1e2435',
        },
        accent: {
          DEFAULT: '#72f0b4',
          hover: '#9af7cc',
          dim: '#2a7a5a',
        },
        text: {
          primary: '#e4eaf5',
          secondary: '#6a7a96',
          muted: '#2e3a52',
        },
      },
    },
  },
  plugins: [],
}

export default config
