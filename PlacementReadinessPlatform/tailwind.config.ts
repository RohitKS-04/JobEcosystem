import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(245 58% 51%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
