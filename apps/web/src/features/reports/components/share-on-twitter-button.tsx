'use client'

import { Button } from '@/components/ui/button'
import { buildSocialShareLinks } from '@/features/reports/utils/build-social-share-links'
import type { ReportShareSummary } from '@/features/reports/types'

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M12.6 0h2.454l-5.36 6.13L16 16h-4.937l-3.867-5.07L2.771 16H.316l5.733-6.553L0 0h5.063l3.495 4.633L12.6 0Zm-.86 14.376h1.36L4.323 1.39H2.865l8.875 12.986Z" />
    </svg>
  )
}

function RedditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 0C4.478 0 0 4.478 0 10s4.478 10 10 10 10-4.478 10-10S15.522 0 10 0Zm5.93 10.276a1.37 1.37 0 0 1 .07.434c0 2.224-2.59 4.03-5.785 4.03-3.193 0-5.784-1.806-5.784-4.03 0-.148.024-.292.068-.432a1.2 1.2 0 0 1-.348-.854 1.215 1.215 0 0 1 2.067-.858c1.014-.65 2.408-1.066 3.944-1.113l.748-3.19.044-.003 2.198.465a.857.857 0 1 1-.046.473l-1.96-.415-.664 2.83c1.503.063 2.866.48 3.861 1.123a1.215 1.215 0 0 1 2.067.858c0 .325-.13.619-.34.842ZM7.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-1.17 2.08c-.51.51-1.33.762-2.508.762h-.007c-1.177 0-1.997-.25-2.508-.762a.357.357 0 0 0-.504.505c.657.657 1.658.977 3.012.977h.007c1.354 0 2.355-.32 3.012-.977a.357.357 0 1 0-.504-.505Z" />
    </svg>
  )
}

export function ShareOnTwitterButton(summary: ReportShareSummary) {
  const { xUrl, redditUrl } = buildSocialShareLinks(summary)

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href={xUrl} target="_blank" rel="noopener noreferrer">
          <XIcon />
          Share on X
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={redditUrl} target="_blank" rel="noopener noreferrer">
          <RedditIcon />
          Share on Reddit
        </a>
      </Button>
    </div>
  )
}
