/* tailwind.config.ts */

import type { Config } from 'tailwindcss'

import defaultTheme from "tailwindcss/defaultTheme";
import plugin from 'tailwindcss/plugin'


export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    /* --- theme START --- */
    extend: {

      animation: {
        blink: 'blink 1.4s infinite both',
        fade: 'fade 1.4s infinite both',
        scale: 'scale 2s infinite',
        perspective: 'perspective 1.2s infinite',
        fadeIn: 'fadeIn 1.2s ease-in-out infinite both',
      },
      keyframes: {
        blink: {
          '0%': {
            opacity: '0.2',
          },
          '20%': {
            opacity: '1',
          },
          '100%': {
            opacity: ' 0.2',
          },
        },
        fade: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: ' 0.3',
          },
        },
        fadeIn: {
          '0%, 39%, 100%': {
            opacity: '0',
          },
          '40%': {
            opacity: '1',
          },
        },
        scale: {
          '0%, 100%': {
            transform: 'scale(1.0)',
          },
          '50%': {
            transform: 'scale(0)',
          },
        },
        perspective: {
          '0%': { transform: 'perspective(120px)' },
          ' 50%': { transform: 'perspective(120px) rotateY(180deg)' },
          '100%': { transform: 'perspective(120px) rotateY(180deg)  rotateX(180deg)' },
        },
      }, // keyframes

      scale: {
        '85': '0.85',
      },
      /* --- colors START --- */
      colors:
      {
      },
      /* --- colors END --- */ 

      /* --- fontFamily START --- */
      fontFamily: {
        'sans-serif': ['Kanit',  ...defaultTheme.fontFamily.sans,],
        'sans': [ "Kanit",  ...defaultTheme.fontFamily.sans,],
      },
      /* --- fontFamily END --- */
    
    }, // extend
  }, // theme
  /* --- theme END --- */
  /* --- variants START --- */
  variants: {
    extend: {},
  },
  /* --- variants END --- */

  // daisyUI config (optional - here are the default values)
  daisyui: {

    themes: [
      'dark', 'light',
      {
        /*
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          'warning' : '#b35f00',
          'warning-content' : '#000',
        },
        dark: {
          ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
          'warning' : '#b35f00',
          'warning-content' : '#000',
        },*/
        realOrange: {
          'primary' : '#000',           /* Primary color */
          'primary-focus' : '#8462f4',     /* Primary color - focused */
          'primary-content' : '#ffffff',   /* Foreground content color to use on primary color */

          'secondary' : '#f6d860',         /* Secondary color */
          'secondary-focus' : '#f3cc30',   /* Secondary color - focused */
          'secondary-content' : '#ffffff', /* Foreground content color to use on secondary color */

          'accent' : '#37cdbe',            /* Accent color */
          'accent-focus' : '#2aa79b',      /* Accent color - focused */
          'accent-content' : '#000',    /* Foreground content color to use on accent color */

          'neutral' : '#3d4451',           /* Neutral color */
          'neutral-focus' : '#2a2e37',     /* Neutral color - focused */
          'neutral-content' : '#fff',   /* Foreground content color to use on neutral color */

          'base-100' : '#FF9801',          /* Base color of page, used for blank backgrounds */
          'base-200' : '#F98B01',          /* Base color, a little darker */
          'base-300' : '#F27F01',          /* Base color, even more darker */
          'base-content' : '#000',      /* Foreground content color to use on base color */

          'info' : '#486178',              /* Info */
          'info-content' : '#FFF',
          'success' : '#249494',           /* Success */
          'success-content' : '#FFF',   /* Will be a readable tone of success if not specified */
          'warning' : '#EF6400',           /* Warning */
          'warning-content' : '#FFF',
          'error' : '#FE4006',             /* Error */
          'error-content' : '#FFF',     /* Will be a readable tone of error if not specified */
        }
      },
    ],

    // darkTheme: 'realOrange', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },

  /* --- plugins START --- */
  plugins: [
    require("daisyui"),
    /* https://github.com/adoxography/tailwind-scrollbar */
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('tailwind-scrollbar')({ nocompatible: true }),
    // require('tailwind-scrollbar-hide'),
    // !!!! This plugin should be copied for all loading spinners !!!!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin(({ matchUtilities, theme }:any) => {
      matchUtilities(
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          'animation-delay': (value:any) => {
            return {
              'animation-delay': value,
            }
          },
        },
        {
          values: theme('transitionDelay'),
        }
      )
    }),

  ],
  /* --- plugins END --- */
} satisfies Config