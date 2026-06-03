'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  label: string
  icon: React.ReactNode
  onAction: () => void
  loading: boolean
  error: string | null
  disabled?: boolean
  className?: string
  variant?: 'outline' | 'ghost' | 'destructive' | 'default' | 'secondary' | 'link'
}

export function SubmissionActionButton({
  label,
  icon,
  onAction,
  loading,
  error,
  disabled,
  className = 'w-full',
  variant = 'outline',
}: Props) {
  return (
    <div>
      <Button
        variant={variant}
        size="sm"
        onClick={onAction}
        disabled={loading || disabled}
        className={className}
      >
        {loading
          ? <Loader2 size={13} className="animate-spin" />
          : <>{icon}{label}</>}
      </Button>
      {error && <p className="text-[12px] text-destructive mt-2">{error}</p>}
    </div>
  )
}
