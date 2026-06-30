import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0c0e14',
        surface: '#161922',
        accent: '#ff8c42',
      },
    },
  },
  plugins: [],
};

export default config;
