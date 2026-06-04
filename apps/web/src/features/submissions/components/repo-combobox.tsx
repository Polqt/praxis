'use client'

import { useState } from 'react'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  value: string
  onChange: (value: string) => void
  repos: string[]
  loading: boolean
}

export function RepoCombobox({ value, onChange, repos, loading }: Props) {
  const [open, setOpen] = useState(false)

  const displayValue = value.replace('https://github.com/', '')

  function handleSelect(repoFullName: string) {
    onChange(`https://github.com/${repoFullName}`)
    setOpen(false)
  }

  if (repos.length === 0 && !loading) {
    return (
      <Input
        id="repo-url"
        placeholder="https://github.com/your-org/your-repo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="h-10"
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between font-normal"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="truncate text-left">
            {displayValue || (loading ? 'Loading repos…' : 'Select or type a repository…')}
          </span>
          <IconChevronDown size={14} className="text-muted-foreground shrink-0 ml-2" />
        </Button>
        {open && repos.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="max-h-60 overflow-y-auto p-1">
              {repos.map((repo) => (
                <button
                  key={repo}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(repo)}
                >
                  <IconCheck
                    size={14}
                    className={`shrink-0 ${displayValue === repo ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {repo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Input
        placeholder="Or paste a URL manually"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-xs"
      />
    </div>
  )
}
