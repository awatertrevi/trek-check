// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',

      title: 'TrekCheck - Controleer of je de combinatie mag rijden met jouw rijbewijs',
        meta: [
            // General
            { name: 'keywords', content: 'TrekCheck, rijbewijs, auto, caravan, combinatie, controle"' },
            { name: 'author', content: 'Trevi Awater' },
            { name: 'description', content: 'Controleer of je de combinatie auto/aanhangwagen mag rijden met jouw rijbewijs.' },
        
            // Open Graph / Facebook
            { property: 'og:title', content: 'TrekCheck' },
            { property: 'og:description', content: 'Controleer snel of je de combinatie van auto en caravan mag rijden met je huidige rijbewijs.' },
            { property: 'og:url', content: 'https://trek-check.nl' },
            { property: 'og:type', content: 'website' },

            // Twitter
            { property: 'twitter:card', content: 'summary' },
            { property: 'twitter:title', content: 'TrekCheck' },
            { property: 'twitter:description', content: 'Controleer snel of je de combinatie van auto en caravan mag rijden met je huidige rijbewijs.' },
            { property: 'twitter:url', content: 'https://trek-check.nl' },
        ],
    },
  },

  css: ['~/assets/css/main.css'],
  
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
