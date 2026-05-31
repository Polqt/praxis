'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { SkillChip } from './skill-chip'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface VerifiedOverlayProps {
  skillTags: string[]
  onDismiss: () => void
}

export function VerifiedOverlay({ skillTags, onDismiss }: VerifiedOverlayProps) {
  useEffect(() => {
    confetti({ particleCount: 200, spread: 120, origin: { x: 0.5, y: 0 } })
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm cursor-pointer"
      onClick={onDismiss}
    >
      <div className="text-center px-8" onClick={(e) => e.stopPropagation()}>
        <svg viewBox="0 0 80 80" className="mx-auto mb-6" width={80} height={80}>
          <circle
            cx="40" cy="40" r="36"
            fill="none" stroke="currentColor" strokeWidth="4"
            className="text-green-500"
            strokeDasharray="226" strokeDashoffset="226"
            style={{ animation: 'draw-circle 0.4s ease forwards' }}
          />
          <polyline
            points="24,40 35,52 56,30"
            fill="none" stroke="currentColor" strokeWidth="4"
            strokeLinecap="round" strokeLinejoin="round"
            className="text-green-500"
            strokeDasharray="48" strokeDashoffset="48"
            style={{ animation: 'draw-check 0.3s ease 0.4s forwards' }}
          />
        </svg>
        <style>{`
          @keyframes draw-circle { to { stroke-dashoffset: 0; } }
          @keyframes draw-check  { to { stroke-dashoffset: 0; } }
        `}</style>

        <h2 className="text-6xl font-extrabold mb-6 tracking-widest text-green-600">
          VERIFIED
        </h2>

        {skillTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {skillTags.map((tag) => (
              <SkillChip key={tag} name={tag} />
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={onDismiss}>Continue</Button>
        </div>
      </div>
    </div>
  )
}
