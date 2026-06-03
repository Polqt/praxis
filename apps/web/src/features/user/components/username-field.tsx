'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsernameField } from '@/features/user/hooks/use-username-field'

type Props = {
  initialValue: string
  onSaveSuccess: (username: string) => void
}

export function UsernameField({ initialValue, onSaveSuccess }: Props) {
  const { value, status, validationError, showProofUrl, showUrlChangeWarning, handleChange } = useUsernameField(
    initialValue,
    onSaveSuccess,
  )

  const statusText = (() => {
    if (status.type === 'idle') return null
    if (status.type === 'unsaved') return <span className="text-muted-foreground">· Unsaved changes</span>
    if (status.type === 'saving') return <span className="text-muted-foreground">Saving…</span>
    if (status.type === 'saved') return <span className="text-green-600">Saved</span>
    if (status.type === 'error') return <span className="text-destructive">{status.message}</span>
  })()

  return (
    <div className="space-y-1.5">
      <Label htmlFor="username">Username</Label>
      <Input
        id="username"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="your-username"
        maxLength={24}
        className="font-mono w-full"
      />
      <div className="flex items-center justify-between">
        <span className="text-[13px] min-h-5">
          {validationError && status.type !== 'idle' ? (
            <span className="text-amber-600">{validationError}</span>
          ) : statusText}
        </span>
        <span className="text-[13px] text-muted-foreground">{value.length}/24</span>
      </div>
      {showProofUrl && (
        <p className="text-[13px] text-muted-foreground">
          Your proof page:{' '}
          <span className="font-mono text-primary">praxis.dev/p/{value}</span>
        </p>
      )}
      {showUrlChangeWarning && (
        <p className="text-[13px] text-amber-600">
          Changing your username will update your public profile URL. Anyone with your old link won't be able to find you.
        </p>
      )}
    </div>
  )
}
