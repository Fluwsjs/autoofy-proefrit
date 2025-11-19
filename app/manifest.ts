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
    icons: [
      {
        src: '/autoofy.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/autoofy.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}

