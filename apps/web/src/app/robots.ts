import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/submissions', '/reports', '/settings', '/onboarding', '/submit'],
    },
    sitemap: 'https://praxisdev.vercel.app/sitemap.xml',
  }
}
