/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /^text-(md|lg|xl|base)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'], // Responsive variants
    },
    {
      pattern: /^col-span-(8|10)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'], // Responsive variants
    },
    {
      pattern: /^w-(1\/2|2\/3|3\/4|full)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'], // Responsive variants
    },
    {
      pattern: /^max-w-(4xs|3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|base)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'], // Responsive variants
    },
    // Custom colors - ensure they're always included
    {
      pattern:
        /^(bg|text|border)-(text|bg|surface|surface-dark|offWhite|accent|border|crayonBlack)$/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern:
        /^from-(text|bg|surface|surface-dark|offWhite|accent|border|crayonBlack)$/,
    },
    {
      pattern:
        /^to-(text|bg|surface|surface-dark|offWhite|accent|border|crayonBlack)$/,
    },
    'font-ballPill', // Add the custom font class to safelist
    // Explicitly include surfaceDark classes
    'bg-surface-dark',
    'text-surface-dark',
    'border-surface-dark',
    // Animation classes
    'rotate-0',
    'rotate-180',
    'transition-transform',
    'duration-300',
    'duration-500',
    'ease-in-out',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-dark': 'var(--color-surface-dark)',
        text: 'var(--color-text)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        offWhite: '#EFEDE3', // Off White
        crayonBlack: '#141514', // Crayon Black
      },
      maxWidth: {
        '4xs': '8rem',
        '3xs': '12rem',
        '2xs': '16rem', // 256px
        xs: '20rem', // 320px
        sm: '24rem', // 384px
        md: '28rem', // 448px
        lg: '32rem', // 512px
        xl: '36rem', // 576px
        '2xl': '42rem', // 672px
        '3xl': '48rem', // 768px
        '4xl': '56rem', // 896px
        '5xl': '64rem', // 1024px
        '6xl': '72rem', // 1152px
        '7xl': '80rem', // 1280px
        '8xl': '90rem', // 1440px
        '9xl': '100rem', // 1600px
        full: '100%',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.15' }],
        sm: ['0.9rem', { lineHeight: '1.15' }],
        base: ['1rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }], // 24px
        md: ['1.2rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        lg: ['1.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }], // based on Monument Grotesk, globals.css variation for HAL Colant
        xl: [
          'clamp(2rem, 5vw, 3.25rem)',
          { lineHeight: '1.15', letterSpacing: '-0.02em' },
        ],
        '2xl': [
          'clamp(2.5rem, 6vw, 6rem)',
          { lineHeight: '1', letterSpacing: '-0.02em' },
        ],
        '3xl': [
          'clamp(2rem, 10vw, 8rem)',
          { lineHeight: '1', letterSpacing: '-0.02em' },
        ],
      },
      screens: {
        xs: { raw: '(min-width: 480px) and (max-width: 639px)' },
        shortest: { raw: '(max-height: 400px)' },
        shorter: { raw: '(min-height: 401px) and (max-height: 600px)' },
        short: { raw: '(min-height: 601px) and (max-height: 800px)' },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
        ballPill: ['var(--font-ballPill)'],
      },
      aspectRatio: {
        window: '5 / 7',
      },
      animation: {
        spin: 'spin 5s linear infinite reverse',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
