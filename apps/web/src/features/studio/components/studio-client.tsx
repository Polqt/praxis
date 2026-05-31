'use client'

import Link from 'next/link'
import { IconBrandGithub } from '@tabler/icons-react'
import { Clock, ArrowRight } from 'lucide-react'
import { UsernameField } from '@/features/user/components/username-field'
import { getGreeting } from '@/features/studio/utils/get-greeting'
import { useSetUsername } from '@/features/user/hooks/use-user-context'
import type { GitHubAccount, User } from '@praxis/shared'

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{text}</span>
    </div>
  )
}

type Props = {
  user: User
  githubAccount: GitHubAccount
}

export function StudioClient({ user, githubAccount }: Props) {
  const setContextUsername = useSetUsername()
  const displayName = user.username ?? user.email.split('@')[0]
  const greeting = getGreeting(displayName)

  if (!githubAccount.connected) {
    return (
      <div className="p-10 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">{greeting}</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Connect your GitHub account to start verifying projects.
        </p>
        <div className="border border-border p-8 flex flex-col items-start gap-4">
          <IconBrandGithub size={24} className="text-muted-foreground" />
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Connect your GitHub account</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Praxis verifies real GitHub projects. Connect your GitHub account to submit
              repositories and earn verified skills.
            </p>
          </div>
          <Link
            href="/studio/connect-github"
            className="h-10 px-6 inline-flex items-center gap-2 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            <IconBrandGithub size={14} />
            Connect GitHub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">{greeting}</h1>
        <div className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-[13px] text-muted-foreground">
            @{githubAccount.githubUsername} connected
          </span>
        </div>
      </div>

      {!user.username && (
        <div className="border border-border p-8 mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              One more step
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Choose your username</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Your proof page will live at praxis.dev/p/username. This is how employers and
            collaborators will find your verified work.
          </p>
          <div className="max-w-sm">
            <UsernameField
              initialValue={githubAccount.githubUsername}
              onSaveSuccess={setContextUsername}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border border-border p-6 flex flex-col justify-between">
          <div>
            <SectionLabel text="Primary action" />
            <h3 className="text-lg font-bold text-foreground mb-2">Verify a project</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submit a GitHub repository for independent verification. Receive a permanent proof page.
            </p>
          </div>
          <Link href="/projects" className="inline-flex items-center gap-2 mt-6 text-[11px] font-medium uppercase tracking-widest text-foreground hover:text-primary transition-colors">
            Get started <ArrowRight size={13} />
          </Link>
        </div>
        <div className="border border-border p-6 flex flex-col justify-between bg-muted">
          <div>
            <SectionLabel text="Browse" />
            <h3 className="text-lg font-bold text-foreground mb-2">Verification challenges</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full-stack, backend, frontend. Each challenge defines exactly what will be evaluated.
            </p>
          </div>
          <Link href="/challenges" className="inline-flex items-center gap-2 mt-6 text-[11px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Browse challenges <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <SectionLabel text="Recent submissions" />
        <div className="border border-border p-8 text-center">
          <Clock size={20} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No submissions yet. Verify your first project to get started.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <SectionLabel text="Verified skills" />
        <p className="text-sm text-muted-foreground">No verified skills yet.</p>
      </div>

      <div className="border border-border p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Proof Page</p>
        {user.username ? (
          <p className="text-[13px] font-mono text-foreground">praxis.dev/p/{user.username}</p>
        ) : (
          <p className="text-[13px] text-muted-foreground">Set a username to get your proof page URL.</p>
        )}
      </div>
    </div>
  )
}
