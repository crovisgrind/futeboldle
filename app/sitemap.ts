// app/sitemap.ts
import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://craquedodia.com.br',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}