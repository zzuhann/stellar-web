import { defineConfig } from '@pandacss/dev';
import { borderRadius, colors, shadows } from './src/styles/theme';
import { shimmer, spin } from './src/styles/keyframes';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      keyframes: {
        spin,
        shimmer,
      },
      tokens: {
        colors: { ...colors },
        shadows: { ...shadows },
        // border-radius
        radii: { ...borderRadius },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
});
