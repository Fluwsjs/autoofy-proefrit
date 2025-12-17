import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Autoofy Proefrittenbeheer',
    short_name: 'Autoofy',
    description: 'Professioneel proefrittenbeheer voor autobedrijven',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#B22234',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

