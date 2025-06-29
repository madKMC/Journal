import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette matching your specifications
        sand: {
          50: '#faf9f6',
          100: '#f5f2e7', // Main background
          200: '#ebe5d4',
          300: '#ddd4be',
          400: '#ccc0a3',
          500: '#b8a888',
          600: '#a3926f',
          700: '#8a7a5c',
          800: '#72654e',
          900: '#5e5442',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e8ede8',
          200: '#d4e2d4', // Header bar
          300: '#b8d0b8',
          400: '#96b896',
          500: '#7a9f7a',
          600: '#638563',
          700: '#526e52',
          800: '#455a45',
          900: '#3a4b3a',
        },
        mistblue: {
          50: '#f3f7f6',
          100: '#e6efed',
          200: '#bfd8d2', // Button
          300: '#9cc4bc',
          400: '#7ab0a6',
          500: '#5a9c90',
          600: '#4a8379',
          700: '#3e6d65',
          800: '#345a54',
          900: '#2c4a46',
        },
        darkersage: {
          50: '#f1f4f1',
          100: '#e2e8e2',
          200: '#c8d3c8',
          300: '#a8bba1', // Button hover
          400: '#8ca085',
          500: '#72856c',
          600: '#5c6d57',
          700: '#4c5a48',
          800: '#3f4a3c',
          900: '#353e33',
        },
        charcoal: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#333333', // Text
        },
        mutedgray: {
          50: '#f9f9f9',
          100: '#efefef',
          200: '#dcdcdc',
          300: '#bdbdbd',
          400: '#989898',
          500: '#7d7d7d', // Secondary text
          600: '#656565',
          700: '#525252',
          800: '#464646',
          900: '#3d3d3d',
        },
        blushrose: {
          50: '#fdf8f7',
          100: '#faf0ee',
          200: '#f4ddd9',
          300: '#edc4bd',
          400: '#e9c9c3', // Accent (Tags)
          500: '#dfa89f',
          600: '#d18a7e',
          700: '#be6f61',
          800: '#9e5a4f',
          900: '#824c44',
        },
        // Keep existing shadcn colors for compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;