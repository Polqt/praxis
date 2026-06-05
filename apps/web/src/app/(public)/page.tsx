import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionContainer } from '@/components/marketing/section-container'

function SectionLabel({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <div
        className="w-2 rounded-[1px]"
        style={{
          height: '10px',
          background: light ? 'rgba(255,255,255,0.4)' : 'var(--primary)',
        }}
      />
      <span
        className="text-[13px] tracking-widest uppercase"
        style={{ color: light ? 'rgba(255,255,255,0.6)' : 'var(--muted-foreground)' }}
      >
        {text}
      </span>
    </div>
  )
}

function HalftoneDots({
  width,
  height,
  opacity,
  className = '',
}: {
  width: number
  height: number
  opacity: number
  className?: string
}) {
  const spacing = 12
  const r = 2.5
  const cols = Math.ceil(width / spacing)
  const rows = Math.ceil(height / spacing)
  const dots: { cx: number; cy: number }[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push({ cx: col * spacing + spacing / 2, cy: row * spacing + spacing / 2 })
    }
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      {dots.map(({ cx, cy }, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="var(--primary)" fillOpacity={opacity} />
      ))}
    </svg>
  )
}

function MockupWindow() {
  return (
    <div className="w-full max-w-5xl mx-auto border border-border rounded-lg overflow-hidden shadow-sm bg-background mt-16">
      {/* Title bar */}
      <div className="border-b border-border bg-muted/40 px-5 py-3 flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-3">
          praxis.dev/p/jordan-lee
        </span>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-7">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ background: 'var(--primary)' }}
            >
              JL
            </div>
            <div>
              <p className="font-bold text-foreground text-lg leading-tight">Jordan Lee</p>
              <p className="text-sm text-muted-foreground mt-0.5">@jordan-lee</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-7">
            <Badge variant="secondary" className="text-xs rounded-sm px-2.5 py-1">TypeScript</Badge>
            <Badge variant="secondary" className="text-xs rounded-sm px-2.5 py-1">Next.js</Badge>
            <Badge variant="secondary" className="text-xs rounded-sm px-2.5 py-1">PostgreSQL</Badge>
          </div>

          <div className="border-t border-border pt-7 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">
              Verified project
            </p>
            <p className="text-base font-mono text-foreground font-medium">jordan-lee/saas-platform</p>
            <p className="text-sm text-muted-foreground mt-1.5">847 commits / May 2025</p>
          </div>
        </div>

        {/* Right side scores */}
        <div className="p-10">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              Verification score
            </p>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Verified</span>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { label: 'Code architecture', score: 88 },
              { label: 'Test evidence', score: 76 },
              { label: 'Deployment readiness', score: 81 },
            ].map(({ label, score }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="text-sm font-bold text-foreground tabular-nums">{score}</span>
                </div>
                <div className="h-1.5 bg-muted overflow-hidden rounded-none">
                  <div
                    className="h-full rounded-none"
                    style={{ width: `${score}%`, background: 'var(--primary)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-8 pt-7">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              Generated from repository evidence: source files, tests, CI,
              deployment configuration, and cited implementation patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShareWorkflowSection() {
  return (
    <section className="bg-background border-t border-border md:min-h-screen flex flex-col">
      <div className="flex flex-1 md:min-h-screen">
        <div className="hidden md:flex w-[40%] border-r border-border flex-col p-10 relative overflow-hidden self-stretch">
          <div className="flex-1 flex items-center justify-center">
            <HalftoneDots width={260} height={280} opacity={0.18} />
          </div>
          <p className="font-heading font-bold text-6xl text-muted-foreground/20 leading-none select-none mt-4">
            URL
          </p>
        </div>

        <div className="flex-1 px-10 md:px-16 py-24 md:py-0 flex flex-col justify-center">
          <SectionLabel text="Where the proof goes" />
          <h2 className="font-heading font-light text-4xl md:text-5xl tracking-tight text-foreground mb-8 leading-[1.1] max-w-2xl">
            One public link for the places hiring teams already look.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mb-10">
            Praxis does not ask employers to adopt a new system first. Your
            report is a public URL you can add to the existing hiring flow.
          </p>
          <div className="grid sm:grid-cols-2 gap-px bg-border max-w-2xl border border-border">
            {[
              'Resume project section',
              'LinkedIn featured links',
              'Portfolio case studies',
              'Job application forms',
              'Recruiter outreach',
              'Take-home alternatives',
            ].map((item) => (
              <div key={item} className="bg-background px-5 py-4">
                <p className="text-sm font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <>
      <section className="min-h-screen bg-muted flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto pt-32 md:pt-43">
          <SectionLabel text="Proof of work for developers" />

          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading font-bold tracking-tight text-foreground leading-tight mb-6 pb-2 text-4xl md:text-5xl lg:text-6xl">
              <span className="block">Turn your GitHub project</span>
              <span className="block">into a shareable proof report.</span>
            </h1>
          </div>

          <p className="max-w-lg text-base text-muted-foreground leading-relaxed mb-8 mx-auto text-center">
            Praxis analyzes your code, tests, architecture, and deployment
            evidence, then creates a public URL you can add to resumes,
            LinkedIn, portfolios, and job applications.
          </p>

          <div className="flex items-center justify-center gap-3 mb-14">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-11 px-8 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:bg-foreground/90 transition-colors"
            >
              GET STARTED
            </Link>
            <Link
              href="/example-report"
              className="inline-flex items-center justify-center h-11 px-8 bg-transparent text-foreground text-[11px] font-medium uppercase tracking-widest rounded-none border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              SEE AN EXAMPLE
            </Link>
          </div>

          <MockupWindow />
        </div>
      </section>

      <section className="bg-background border-t border-border min-h-screen flex flex-col">
        <div className="flex flex-1">
          <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center">
            <HalftoneDots
              width={700}
              height={600}
              opacity={0.08}
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="w-full md:w-1/2 border-l border-border px-10 md:px-16 py-24 flex flex-col justify-center">
            <SectionLabel text="The Problem" />
            <h2 className="font-heading font-light text-4xl md:text-5xl tracking-tight text-foreground mb-10 leading-[1.1]">
              Resumes list skills.<br />Projects show evidence.<br />Hiring needs both.
            </h2>

            <div>
              {[
                {
                  n: '01',
                  title: 'The resume problem',
                  body: 'A resume can say React, APIs, or PostgreSQL. It rarely shows how those skills were applied in a real codebase.',
                },
                {
                  n: '02',
                  title: 'The certificate problem',
                  body: 'Online certifications signal course completion, not execution under real constraints. They are useful context, not work evidence.',
                },
                {
                  n: '03',
                  title: 'The evidence problem',
                  body: 'AI can help generate code quickly. Hiring teams still need to see repository evidence: tests, structure, deployment, and cited implementation details.',
                },
              ].map(({ n, title, body }, i) => (
                <div key={n} className={`py-7 ${i < 2 ? 'border-b border-border' : ''}`}>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                    {n} / {title}
                  </p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background border-t border-border py-24 md:min-h-screen md:py-0 flex flex-col justify-center">
        <SectionContainer>
          <div className="flex flex-col items-center text-center mb-16">
            <SectionLabel text="The solution" />
            <h2 className="font-heading font-light text-4xl md:text-6xl tracking-tight text-foreground">
              Three steps. One verified record.
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 border-t border-border border-b">
            {[
              {
                n: '01',
                title: 'Connect your GitHub',
                body: 'Link your account and choose the repository you want evaluated. Public and private repositories are supported.',
              },
              {
                n: '02',
                title: 'Praxis analyzes your repository',
                body: 'The verification engine reads repository evidence: source structure, tests, CI, deployment files, documentation, and implementation patterns.',
              },
              {
                n: '03',
                title: 'Your proof page goes live',
                body: 'Publish a public URL that shows the score, citations, category results, and what the report did and did not verify.',
              },
            ].map(({ n, title, body }, i) => (
              <div key={n} className={`relative py-12 px-8 ${i > 0 ? 'md:border-l border-border' : ''}`}>
                {i > 0 && i < 3 && (
                  <>
                    <span className="hidden md:flex absolute -top-3 -left-3 w-6 h-6 items-center justify-center text-[11px] text-muted-foreground bg-background z-10">
                      +
                    </span>
                    <span className="hidden md:flex absolute -bottom-3 -left-3 w-6 h-6 items-center justify-center text-[11px] text-muted-foreground bg-background z-10">
                      +
                    </span>
                  </>
                )}
                <p
                  className="font-heading font-bold text-6xl leading-none mb-6 select-none"
                  style={{ color: 'var(--primary)', opacity: 0.2 }}
                >
                  {n}
                </p>
                <p className="text-xl font-semibold text-foreground mb-3">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      <ShareWorkflowSection />

      <section className="bg-background border-t border-border min-h-screen flex flex-col justify-center py-24">
        <div className="max-w-3xl mx-auto w-full px-6 md:px-8 lg:px-12">
          <div className="flex flex-col items-center text-center mb-12">
            <SectionLabel text="Common questions" />
            <h2 className="font-heading font-light text-4xl md:text-5xl tracking-tight text-foreground">
              Any questions?
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                value: 'what',
                q: 'What exactly does Praxis verify?',
                a: 'Praxis analyzes your GitHub repository using deterministic signals: folder structure, test file presence, migration files, authentication patterns, CI configuration, documentation, deployment evidence, and cited implementation patterns. The result is a scored report based on repository evidence, not self-reported claims.',
              },
              {
                value: 'time',
                q: 'How long does verification take?',
                a: 'Most verifications complete within 2 to 5 minutes. Larger repositories may take slightly longer.',
              },
              {
                value: 'junior',
                q: 'Does Praxis work for junior developers?',
                a: 'Yes. Praxis evaluates projects relative to their stated scope. A well-built CRUD application with consistent commits and clean architecture can score highly. You do not need to have built a distributed system.',
              },
              {
                value: 'public',
                q: 'Can hiring teams view my proof page without an account?',
                a: 'Yes. Published proof pages are fully public and require no login to view. They are designed to be shared in job applications, LinkedIn profiles, resume project sections, and portfolio sites.',
              },
              {
                value: 'fail',
                q: 'What happens if my project does not pass verification?',
                a: 'Praxis provides a detailed report explaining exactly what was found and what fell below the threshold. You can improve the project and resubmit. Failed verifications are private and never shown publicly.',
              },
              {
                value: 'private',
                q: 'Does Praxis work with private repositories?',
                a: 'Yes. You grant Praxis read-only access to a specific repository during verification. Access is scoped to that repository only and can be revoked at any time from your GitHub settings.',
              },
              {
                value: 'ai',
                q: 'Does Praxis verify authorship?',
                a: 'Praxis does not make claims about authorship or AI usage. It evaluates what is present in the repository: structure, tests, migrations, authentication, deployment configuration, documentation, and other evidence of engineering practice.',
              },
              {
                value: 'free',
                q: 'Is Praxis free?',
                a: 'Praxis is free to use during the current beta. Submit repositories, generate reports, and share your proof page at no cost.',
              },
            ].map(({ value, q, a }) => (
              <AccordionItem key={value} value={value} className="border-b border-border">
                <AccordionTrigger className="text-left text-[16px] font-medium text-foreground py-5 hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed pb-5">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="border-t border-border py-24 md:min-h-screen md:py-0 flex flex-col justify-center" style={{ background: 'var(--foreground)' }}>
        <SectionContainer>
          <SectionLabel text="Ready" light />

          <h2
            className="font-heading font-light text-5xl md:text-7xl tracking-tight leading-[1.05] mb-10"
            style={{ color: 'var(--background)' }}
          >
            <span className="block">Stop collecting certificates.</span>
            <span className="block font-bold">Start proving work.</span>
          </h2>

          <div className="flex items-center gap-3">
            <Link
              href="/challenges"
              className="inline-flex items-center justify-center h-11 px-8 bg-background text-foreground text-[11px] font-medium uppercase tracking-widest rounded-none hover:bg-background/90 transition-colors"
            >
              GET STARTED
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center h-11 px-8 bg-transparent text-white text-[11px] font-medium uppercase tracking-widest rounded-none border border-white hover:bg-white/10 transition-colors"
            >
              SEE HOW IT WORKS
            </Link>
          </div>
        </SectionContainer>
      </section>
    </>
  )
}
