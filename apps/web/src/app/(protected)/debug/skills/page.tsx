import { serverApiFetch } from '@/lib/api.server'
import { SECTION_LABEL_CLASS } from '@/features/reports/constants'

type SkillMatch = {
  id: string
  name: string
  category: string
} | null

type RubricCategory = {
  id: string
  name: string
  minimumScore: number
  matchedSkill: SkillMatch
}

type DebugChallenge = {
  id: string
  title: string
  slug: string
  status: string
  categories: RubricCategory[]
}

type DebugSkill = {
  id: string
  name: string
  category: string
  description: string | null
}

type AwardedSkill = {
  id: string
  name: string
  category: string
  awardedAt: string | null
  sourceReportId: string | null
}

type SkillsDebugResponse = {
  activeChallenges: DebugChallenge[]
  allSkills: DebugSkill[]
  awardedSkills: AwardedSkill[]
}

function StatusPill({ matched }: { matched: boolean }) {
  return (
    <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${
      matched
        ? 'border border-green-200 bg-green-50 text-green-700'
        : 'border border-amber-200 bg-amber-50 text-amber-700'
    }`}>
      {matched ? 'matched' : 'missing skill row'}
    </span>
  )
}

export default async function SkillsDebugPage() {
  const debug = await serverApiFetch<SkillsDebugResponse>('/reports/debug/skills').catch(() => null)

  if (!debug) {
    return (
      <main className="px-6 py-8 md:px-10">
        <p className={SECTION_LABEL_CLASS}>Skills debug</p>
        <h1 className="mt-3 text-2xl font-semibold">Debug data unavailable</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The API did not return the skills debug payload. Check auth, API availability, and the reports debug endpoint.
        </p>
      </main>
    )
  }

  return (
    <main className="px-6 py-8 md:px-10">
      <p className={SECTION_LABEL_CLASS}>Admin debug</p>
      <h1 className="mt-3 text-2xl font-semibold">Skills visibility</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Use this page when the skills table or profile skills look empty. It shows active challenges, rubric category
        names, matching skill rows, and the skills awarded to the current user.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Active challenges</p>
          <p className="mt-2 text-3xl font-semibold">{debug.activeChallenges.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Skill rows</p>
          <p className="mt-2 text-3xl font-semibold">{debug.allSkills.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Awarded to you</p>
          <p className="mt-2 text-3xl font-semibold">{debug.awardedSkills.length}</p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Challenge rubric mapping</h2>
        </div>
        <div className="divide-y">
          {debug.activeChallenges.map((challenge) => (
            <div key={challenge.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{challenge.title}</p>
                  <p className="text-xs text-muted-foreground">{challenge.slug}</p>
                </div>
                <span className="rounded-md border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {challenge.status}
                </span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Rubric category</th>
                      <th className="py-2 pr-4 font-medium">Floor</th>
                      <th className="py-2 pr-4 font-medium">Matching skill</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenge.categories.map((category) => (
                      <tr key={category.id} className="border-t">
                        <td className="py-3 pr-4">{category.name}</td>
                        <td className="py-3 pr-4">{category.minimumScore}/10</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {category.matchedSkill ? category.matchedSkill.name : 'No matching skill row'}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusPill matched={category.matchedSkill != null} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {debug.activeChallenges.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No active challenges found. Run seed data or enable challenges.</p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5">
        <h2 className="font-semibold">Awarded user skills</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {debug.awardedSkills.map((skill) => (
            <div key={skill.id} className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-sm font-medium">{skill.name}</p>
              <p className="text-xs text-muted-foreground">{skill.category}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Source report: {skill.sourceReportId ?? 'missing'}
              </p>
            </div>
          ))}
          {debug.awardedSkills.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills have been awarded to the current user yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}
