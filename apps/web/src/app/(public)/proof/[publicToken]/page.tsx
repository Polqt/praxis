import { serverApiFetch } from '@/lib/api.server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { VerificationReport } from '@praxis/shared'

type PublicProofPageProps = {
  params: Promise<{ publicToken: string }>
}

export default async function PublicProofPage(props: PublicProofPageProps) {
  const { publicToken } = await props.params
  const report = await serverApiFetch<VerificationReport>(`/proof/${publicToken}`)

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Badge variant="outline" className="capitalize">{report.verdict}</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Praxis verified proof</h1>
        <p className="mt-3 text-muted-foreground">{report.publicSummary}</p>

        <Card className="mt-8">
          <CardContent className="p-6">
            <p className="text-5xl font-semibold">{report.compositeScore}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Composite score</p>
            <div className="mt-6 divide-y">
              {Object.entries(report.categoryScores).map(([name, score]) => (
                <div key={name} className="py-4 flex items-center justify-between gap-6">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{score.narrative}</p>
                  </div>
                  <Badge variant="outline">{score.score}/10</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
