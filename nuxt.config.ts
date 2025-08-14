// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  
  // SEO and Performance optimizations for GitHub Pages
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  
  // GitHub Pages specific optimizations
  target: 'static',
  ssr: false, // GitHub Pages serves static files only
  
  // Enable experimental features for better SEO
  experimental: {
    payloadExtraction: false // Better for SEO as it reduces JS payload
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',

      title: 'TrekCheck - Controleer of je de combinatie mag rijden met jouw rijbewijs',
        meta: [
            // General SEO
            { name: 'keywords', content: 'rijbewijs controle, auto aanhangwagen combinatie, caravan rijbewijs, aanhangwagen gewicht controle, BE rijbewijs, trekgewicht checker, RDW kenteken, rijbewijs Nederland, aanhangwagen regels' },
            { name: 'author', content: 'Trevi Awater' },
            { name: 'description', content: 'Gratis online tool om te controleren of je auto/aanhangwagen combinatie mag rijden met jouw rijbewijs. Gebruikt officiële RDW data voor betrouwbare resultaten.' },
            { name: 'robots', content: 'index, follow' },
            { name: 'language', content: 'nl-NL' },
            { name: 'geo.region', content: 'NL' },
            { name: 'geo.placename', content: 'Nederland' },
            
            // Structured data hints
            { name: 'application-name', content: 'TrekCheck' },
            { name: 'subject', content: 'Rijbewijs en voertuig combinatie controle' },
            { name: 'rating', content: 'general' },
            { name: 'distribution', content: 'global' },
        
            // Favicon and PWA
            { name: 'apple-touch-icon', content: '/apple-touch-icon.png' },
            { name: 'icon', content: '/favicon-32x32.png' },
            { name: 'icon', content: '/favicon-16x16.png' },
            { name: 'manifest', content: '/site.webmanifest' },
            { name: 'msapplication-TileColor', content: '#da532c' },
            { name: 'theme-color', content: '#ffffff' },

            // Enhanced Open Graph
            { property: 'og:title', content: 'TrekCheck - Gratis Rijbewijs & Aanhangwagen Combinatie Checker' },
            { property: 'og:description', content: 'Controleer direct of je auto/aanhangwagen combinatie toegestaan is met jouw rijbewijs. Gebruikt officiële RDW kenteken data.' },
            { property: 'og:url', content: 'https://trek-check.nl' },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'TrekCheck' },
            { property: 'og:locale', content: 'nl_NL' },
            { property: 'og:image', content: 'https://trek-check.nl/caravan.jpg' },

            // Enhanced Twitter Cards
            { property: 'twitter:card', content: 'summary_large_image' },
            { property: 'twitter:title', content: 'TrekCheck - Gratis Rijbewijs & Aanhangwagen Checker' },
            { property: 'twitter:description', content: 'Controleer direct of je auto/aanhangwagen combinatie toegestaan is met jouw rijbewijs. Gebruikt officiële RDW data.' },
            { property: 'twitter:url', content: 'https://trek-check.nl' },
            { property: 'twitter:image', content: 'https://trek-check.nl/caravan.jpg' },
            { property: 'twitter:site', content: '@trekcheck' },
            { property: 'twitter:creator', content: '@awatertrevi' },
        ],
        script: [
            // JSON-LD Structured Data
            {
                type: 'application/ld+json',
                children: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "TrekCheck",
                    "description": "Gratis online tool om te controleren of je auto/aanhangwagen combinatie mag rijden met jouw rijbewijs",
                    "url": "https://trek-check.nl",
                    "applicationCategory": "UtilityApplication",
                    "operatingSystem": "Web Browser",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "EUR"
                    },
                    "author": {
                        "@type": "Person",
                        "name": "Trevi Awater",
                        "url": "https://github.com/awatertrevi"
                    },
                    "publisher": {
                        "@type": "Person",
                        "name": "Trevi Awater"
                    },
                    "inLanguage": "nl-NL",
                    "potentialAction": {
                        "@type": "UseAction",
                        "target": "https://trek-check.nl",
                        "description": "Controleer rijbewijs combinatie"
                    }
                })
            }
        ],
    },
  },

  css: ['~/assets/css/main.css'],
  
  // Performance optimizations
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'axios']
          }
        }
      }
    }
  },
  
  // Image optimization
  image: {
    // Enable image optimization
    quality: 80,
    format: ['webp', 'png', 'jpg']
  },
  
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
