import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TalentoBAQ',
    short_name: 'TalentoBAQ',
    description: 'Descubre tu pasión en Barranquilla. Clubes deportivos y culturales verificados.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2dd4bf',
    orientation: 'portrait-primary',
    icons: [
      {
        src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%232dd4bf" width="192" height="192"/><text x="96" y="120" font-size="100" font-weight="bold" text-anchor="middle" fill="white" font-family="sans-serif">T</text></svg>',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%232dd4bf" width="192" height="192"/><text x="96" y="120" font-size="100" font-weight="bold" text-anchor="middle" fill="white" font-family="sans-serif">T</text></svg>',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    categories: ['sports', 'education'],
    screenshots: [],
  };
}
