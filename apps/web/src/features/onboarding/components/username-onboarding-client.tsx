'use client'

import Link from 'next/link'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsernameOnboarding } from '@/features/onboarding/hooks/use-username-onboarding'

export function UsernameOnboardingClient() {
  const { value, validationError, checkState, saving, saveError, handleChange, handleSubmit } =
    useUsernameOnboarding()

  const isSubmitDisabled =
    !value ||
    validationError !== null ||
    checkState.type === 'checking' ||
    checkState.type === 'taken' ||
    checkState.type === 'idle' ||
    saving

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Choose your username</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your username is your public identity on Praxis. It powers your proof profile URL and cannot be changed easily later.
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        praxis.dev/p/
        <span className={`font-mono ${value ? 'text-foreground' : 'text-muted-foreground/50'}`}>
          {value || 'your-username'}
        </span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="your-username"
          maxLength={24}
          autoFocus
          autoComplete="off"
        />
        <div className="flex items-center justify-between min-h-5">
          <span className="text-xs">
            {validationError && value ? (
              <span className="text-destructive">{validationError}</span>
            ) : checkState.type === 'checking' ? (
              <span className="text-muted-foreground">Checking availability…</span>
            ) : checkState.type === 'available' ? (
              <span className="text-green-600 flex items-center gap-1">
                <IconCheck size={12} />Available
              </span>
            ) : checkState.type === 'taken' ? (
              <span className="text-destructive flex items-center gap-1">
                <IconX size={12} />Already taken
              </span>
            ) : null}
          </span>
          <span className="text-xs text-muted-foreground">{value.length}/24</span>
        </div>
      </div>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <div className="space-y-2">
        <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full">
          {saving ? 'Saving…' : 'Claim username'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          You can update your username later from{' '}
          <Link href="/settings" className="underline">Settings</Link>.
        </p>
      </div>
    </div>
  )
}
