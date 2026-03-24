import { defineConfig } from '@pandacss/dev';
import {
  borderRadius,
  primitiveColors,
  primitiveTypography,
  semanticColors,
  shadows,
  spacing,
  textStyles,
} from './src/styles/theme';
import { shimmer, spin, slideDown } from './src/styles/keyframes';

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
        slideDown,
      },
      tokens: {
        colors: {
          ...primitiveColors,
          ...semanticColors,
        },
        shadows: { ...shadows },
        radii: { ...borderRadius },
        spacing,
        fontSizes: primitiveTypography.fontSizes,
        fontWeights: primitiveTypography.fontWeights,
        lineHeights: primitiveTypography.lineHeights,
        letterSpacings: primitiveTypography.letterSpacings,
      },
      textStyles,
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
});
