module.exports = {
  important: true,
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './hooks/**/*.{js,ts,jsx,tsx}'],
  darkMode: "class",
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code::before': false,
            'code::after': false,
            a: {
              color: theme('colors.indigo.500')
            },
            ul: {
              marginTop: '0',
              marginBottom: '0',
            },
            li: {
              marginTop: '0',
              marginBottom: '0',
            },
            '> ul > li > *:first-child': {
              marginTop: '0',
            },
            '> ul > li > *:last-child': {
              marginBottom: '0',
            },
            '> ol > li > *:first-child': {
              marginTop: '0',
            },
            '> ol > li > *:last-child': {
              marginBottom: '0',
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: '0',
              marginBottom: '0',
            },
            'li+li': {
              marginTop: '.25em',
            },
          }
        },
        sm: {
          css: {
            ul: {
              marginTop: '0',
              marginBottom: '0',
            },
            li: {
              marginTop: '0',
              marginBottom: '0',
            },
            '> ul > li > *:first-child': {
              marginTop: '0',
            },
            '> ul > li > *:last-child': {
              marginBottom: '0',
            },
            '> ol > li > *:first-child': {
              marginTop: '0',
            },
            '> ol > li > *:last-child': {
              marginBottom: '0',
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: '0',
              marginBottom: '0',
            },
            'li+li': {
              marginTop: '.25em',
            },
          },
        },
        lg: {
          css: {
            ul: {
              marginTop: '0',
              marginBottom: '0',
            },
            li: {
              marginTop: '0',
              marginBottom: '0',
            },
            '> ul > li > *:first-child': {
              marginTop: '0',
            },
            '> ul > li > *:last-child': {
              marginBottom: '0',
            },
            '> ol > li > *:first-child': {
              marginTop: '0',
            },
            '> ol > li > *:last-child': {
              marginBottom: '0',
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: '0',
              marginBottom: '0',
            },
            'li+li': {
              marginTop: '.25em',
            },
          },
        },
        xl: {
          css: {
            ul: {
              marginTop: '0',
              marginBottom: '0',
            },
            li: {
              marginTop: '0',
              marginBottom: '0',
            },
            '> ul > li > *:first-child': {
              marginTop: '0',
            },
            '> ul > li > *:last-child': {
              marginBottom: '0',
            },
            '> ol > li > *:first-child': {
              marginTop: '0',
            },
            '> ol > li > *:last-child': {
              marginBottom: '0',
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: '0',
              marginBottom: '0',
            },
            'li+li': {
              marginTop: '.25em',
            },
          },
        },
        '2xl': {
          css: {
            ul: {
              marginTop: '0',
              marginBottom: '0',
            },
            li: {
              marginTop: '0',
              marginBottom: '0',
            },
            '> ul > li > *:first-child': {
              marginTop: '0',
            },
            '> ul > li > *:last-child': {
              marginBottom: '0',
            },
            '> ol > li > *:first-child': {
              marginTop: '0',
            },
            '> ol > li > *:last-child': {
              marginBottom: '0',
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: '0',
              marginBottom: '0',
            },
            'li+li': {
              marginTop: '.25em',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            h1: {
              color: theme('colors.gray.100'),
            },
            h2: {
              color: theme('colors.gray.100'),
            },
            h3: {
              color: theme('colors.gray.100'),
            },
            h4: {
              color: theme('colors.gray.100'),
            },
            h5: {
              color: theme('colors.gray.100'),
            },
          },
        },
      }),
      screens: {
        'print': {'raw': 'print'},
      },
      width: {
        '47': '47%',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["checked"],
      borderColor: ["checked"],
      inset: ["checked"],
      zIndex: ["hover", "active"],
      typography: ['dark'],
      textColor: ['visited'],
    },
  },
  plugins: [require('@tailwindcss/typography'),],
  future: {
    purgeLayersByDefault: true,
  },
}
