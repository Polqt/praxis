import Link from 'next/link'

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <div
        className="rounded-[1px] shrink-0"
        style={{ width: '8px', height: '10px', background: 'var(--primary)' }}
      />
      <span className="text-[13px] uppercase tracking-widest text-muted-foreground">
        {text}
      </span>
    </div>
  )
}

const MARQUEE_TEXT = 'SAME RESUME · SAME KEYWORDS · SAME RESULT · '
const MARQUEE_TEXT_2 = 'REAL WORK · REAL EVIDENCE · REAL PROOF · '

function MarqueeBand({ text }: { text: string }) {
  return (
    <div
      className="w-full overflow-hidden flex items-center"
      style={{ background: 'var(--foreground)', height: '80px' }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 20s linear infinite', willChange: 'transform' }}
      >
        <span className="text-[13px] uppercase tracking-widest font-medium px-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {text.repeat(6)}
        </span>
        <span className="text-[13px] uppercase tracking-widest font-medium px-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {text.repeat(6)}
        </span>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  )
}

// ── Accent zone components ────────────────────────────────────────────────────

function AccentTheShift() {
  return (
    <div className="flex flex-col gap-10 justify-center h-full">
      {[
        { stat: '500K', label: 'developers laid off in 2024' },
        { stat: '73%', label: 'of resumes filtered by ATS before human review' },
        { stat: '6hrs', label: 'to generate a convincing AI portfolio' },
      ].map(({ stat, label }) => (
        <div key={stat}>
          <p className="text-6xl font-bold leading-none" style={{ color: 'var(--foreground)', opacity: 0.08 }}>
            {stat}
          </p>
          <p className="text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}

function AccentTheBelief() {
  return (
    <div className="flex items-center justify-center h-full py-8">
      <div
        className="w-full border border-border bg-background"
        style={{ transform: 'rotate(-1deg)', boxShadow: '6px 6px 0 0 var(--border)' }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.769 0.188 70.08 / 0.5)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.666 0.179 58.318 / 0.5)' }} />
          <span className="ml-3 text-[11px] uppercase tracking-widest text-muted-foreground font-medium">verification report</span>
        </div>

        {/* Report body */}
        <div className="p-7 font-mono" style={{ color: 'var(--foreground)', opacity: 0.75 }}>
          <div className="space-y-3">
            {[
              ['project', 'saas-platform'],
              ['author', 'verified ✓'],
              ['commits', '847  (14 months)'],
              ['tests', 'present ✓'],
              ['deploy', 'confirmed ✓'],
              ['ai-gen', 'none detected'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <span className="text-muted-foreground w-20 shrink-0">{k}</span>
                <span className="text-foreground/70">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Result</span>
            <span
              className="text-xs uppercase tracking-widest font-bold px-3 py-1"
              style={{ background: 'oklch(0.488 0.243 264.376 / 0.12)', color: 'var(--primary)' }}
            >
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AccentForDevelopers() {
  const profiles = [
    { url: 'praxis.dev/p/sarah-chen', name: 'Sarah Chen', score: 94 },
    { url: 'praxis.dev/p/marcus-okafor', name: 'Marcus Okafor', score: 88 },
    { url: 'praxis.dev/p/dev-kim', name: 'Dev Kim', score: 91 },
  ]
  return (
    <div className="flex flex-col gap-5 justify-center h-full">
      {profiles.map(({ url, name, score }) => (
        <div key={url} className="border border-border bg-background p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-foreground leading-tight">{name}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">{url}</p>
            </div>
            <span
              className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 shrink-0 ml-3"
              style={{ background: 'oklch(0.488 0.243 264.376 / 0.1)', color: 'var(--primary)' }}
            >
              Verified
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${score}%`, background: 'var(--primary)', opacity: 0.5 }}
              />
            </div>
            <span className="text-sm font-mono font-bold text-muted-foreground tabular-nums w-8 text-right">
              {score}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AccentForStudents() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p
        className="font-bold leading-none tracking-tighter select-none"
        style={{ fontSize: '180px', color: 'var(--foreground)', opacity: 0.05 }}
      >
        0
      </p>
      <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }}>
        years of experience required
      </p>
    </div>
  )
}

function AccentForHiringTeams() {
  return (
    <div className="flex items-center gap-8 justify-center h-full">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>
          Without Praxis
        </p>
        <p className="text-5xl font-bold" style={{ color: 'var(--foreground)', opacity: 0.1 }}>
          4–6hrs
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }}>
          per candidate review
        </p>
      </div>
      <div className="w-px h-24 bg-border shrink-0" />
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--primary)', opacity: 0.4 }}>
          With Praxis
        </p>
        <p className="text-5xl font-bold" style={{ color: 'var(--primary)', opacity: 0.2 }}>
          8min
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }}>
          to review a verified report
        </p>
      </div>
    </div>
  )
}

function AccentTable() {
  const rows = [
    { platform: 'LeetCode', measures: 'Algorithmic problem solving in isolation.' },
    { platform: 'GitHub', measures: 'Repository existence. Not authorship or quality.' },
    { platform: 'LinkedIn', measures: 'Self-reported claims. Unverified.' },
    { platform: 'Certifications', measures: 'Course completion. Not implementation.' },
  ]
  return (
    <div className="flex flex-col justify-center h-full">
      {/* Header */}
      <div className="flex h-10 items-center border-b border-border">
        <span className="w-40 shrink-0 text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium">Platform</span>
        <span className="flex-1 text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium">What it measures</span>
      </div>

      {/* Regular rows */}
      {rows.map(({ platform, measures }) => (
        <div key={platform} className="flex items-start py-5 border-b border-border gap-4">
          <span className="w-40 shrink-0 text-[15px] font-medium text-foreground/50">{platform}</span>
          <span className="flex-1 text-[15px] text-muted-foreground/60 leading-relaxed">{measures}</span>
        </div>
      ))}

      {/* Praxis row — elevated */}
      <div
        className="flex items-start py-5 gap-4 mt-2 border border-border px-0"
        style={{ background: 'oklch(0.488 0.243 264.376 / 0.07)' }}
      >
        <div className="w-40 shrink-0 pl-4 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--primary)' }} />
          <span className="text-[15px] font-bold text-foreground">Praxis</span>
        </div>
        <span className="flex-1 text-[15px] font-semibold text-foreground leading-relaxed pr-4">
          Verified evidence of real software built by you.
        </span>
      </div>
    </div>
  )
}

// ── Split section wrapper ─────────────────────────────────────────────────────

function SplitSection({
  bg,
  flip,
  accent,
  children,
}: {
  bg: string
  flip: boolean
  accent: React.ReactNode
  children: React.ReactNode
}) {
  const content = (
    <div className={`w-full md:w-[55%] py-24 ${flip ? 'md:pl-20' : 'md:pr-20'}`}>
      {children}
    </div>
  )
  const accentZone = (
    <div className={`w-full md:w-[45%] py-24 ${flip ? 'md:pr-10' : 'md:pl-10'}`}>
      {accent}
    </div>
  )
  const divider = <div className="hidden md:block w-px bg-border self-stretch shrink-0" />

  return (
    <section className={`min-h-screen ${bg} flex flex-col justify-center border-t border-border`}>
      <div className="max-w-6xl mx-auto px-6 w-full flex flex-col md:flex-row items-stretch">
        {flip ? (
          <>
            {accentZone}
            {divider}
            {content}
          </>
        ) : (
          <>
            {content}
            {divider}
            {accentZone}
          </>
        )}
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function WhyPage() {
  return (
    <div className="bg-background">

      {/* ── HERO ── */}
      <section className="min-h-screen bg-muted flex flex-col items-center justify-center text-center px-6 pt-14">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground mb-6">
            The future of hiring will not be built on keywords.
            It will be built on proof.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Praxis exists for one reason. Real work deserves real verification.
          </p>
        </div>
      </section>

      {/* ── SECTION 1: THE SHIFT — odd, content left, accent right ── */}
      <SplitSection bg="bg-background" flip={false} accent={<AccentTheShift />}>
        <SectionLabel text="The Shift" />
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
          Hiring became a game of presentation. Developers lost.
        </h2>
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p>
            For the past decade, developers have been told to optimize their resume, collect
            certifications, polish their LinkedIn profile, and build a portfolio. The advice
            was reasonable when those signals were hard to fake. That era is over.
          </p>
          <p>
            AI can generate a polished portfolio in an afternoon. Bootcamp certificates are
            mass-produced. Resumes are keyword-optimized by tools, not humans. A developer who
            spent six months building a production-grade application now competes against
            candidates who spent six hours prompting ChatGPT to generate something that looks
            similar.
          </p>
          <p>
            The problem is not a lack of talent. There is more engineering talent in the world
            today than at any point in history. The problem is that the signals we use to find
            that talent have collapsed. Hiring systems cannot tell the difference between someone
            who built something and someone who described building something.
          </p>
        </div>
      </SplitSection>

      <MarqueeBand text={MARQUEE_TEXT} />

      {/* ── SECTION 2: THE BELIEF — even, content right, accent left ── */}
      <SplitSection bg="bg-muted" flip={true} accent={<AccentTheBelief />}>
        <SectionLabel text="The Belief" />
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
          Real work speaks louder than claims. Praxis was built to amplify it.
        </h2>
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p>
            Praxis exists because we believe a deployed application, a meaningful commit history,
            well-written tests, clear documentation, and real architectural decisions reveal more
            about a developer than any resume ever could. These are not opinions. They are evidence.
          </p>
          <p>
            Instead of asking developers to prove themselves through synthetic assessments or
            credential collecting, Praxis verifies the projects they have already built. Connect
            your GitHub. Submit a real repository. Receive an independent verification report that
            can be shared with anyone, inspected by anyone, and trusted by anyone.
          </p>
          <p>
            The report is not a score. It is a record. It says what you built, when you built it,
            how it was built, and why it meets the bar for real-world production software. That
            record becomes your proof of work.
          </p>
        </div>
      </SplitSection>

      {/* ── SECTION 3: FOR DEVELOPERS — odd, content left, accent right ── */}
      <SplitSection bg="bg-background" flip={false} accent={<AccentForDevelopers />}>
        <SectionLabel text="For Developers" />
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
          Stop saying you know it. Show that you built it.
        </h2>
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p>
            Praxis helps developers turn invisible effort into visible credibility. Instead of
            listing React, NestJS, and PostgreSQL on a resume, you demonstrate it through a
            verified project. Every report is generated from real evidence found in your
            repository. Every verified skill is backed by work that can be inspected and
            validated by a hiring team.
          </p>
          <p>
            A Praxis proof page at praxis.dev/p/username becomes the strongest signal in your
            application. Not because someone said so. Because it is earned through actual
            implementation and independently verified.
          </p>
        </div>
      </SplitSection>

      {/* ── SECTION 4: FOR STUDENTS — even, content right, accent left ── */}
      <SplitSection bg="bg-muted" flip={true} accent={<AccentForStudents />}>
        <SectionLabel text="For Students" />
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
          Experience is not a prerequisite for credibility.
        </h2>
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p>
            One of the biggest barriers for early-career developers is the catch-22 of hiring.
            You need experience to get a job. You need a job to get experience. Most hiring
            systems have no mechanism for evaluating potential that has not yet been
            professionally credentialed.
          </p>
          <p>
            Praxis changes that. A student who has built a high-quality API, a full-stack
            application, or a well-architected side project should not be treated the same as
            someone who merely lists technologies on a resume. Praxis provides a mechanism to
            showcase capability before the first job offer arrives.
          </p>
        </div>
      </SplitSection>

      {/* ── SECTION 5: FOR HIRING TEAMS — odd, content left, accent right ── */}
      <SplitSection bg="bg-background" flip={false} accent={<AccentForHiringTeams />}>
        <SectionLabel text="For Hiring Teams" />
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
          Less noise. More signal. The same amount of time.
        </h2>
        <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
          <p>
            Reviewing repositories takes time that most hiring teams do not have. Reading code
            without context takes expertise not every recruiter possesses. Praxis provides a
            structured verification report that highlights architecture, testing practices,
            documentation quality, deployment patterns, and verified skills in a format that is
            readable by technical and non-technical reviewers alike.
          </p>
          <p>
            A candidate with a Praxis verified proof page has already passed an independent
            technical review. The report is not a replacement for your own evaluation. It is a
            trusted starting point that saves time and surfaces real signal before the first
            interview.
          </p>
        </div>
      </SplitSection>

      <MarqueeBand text={MARQUEE_TEXT_2} />

      {/* ── SECTION 6: THE DIFFERENCE — even, table on left, headline on right ── */}
      <SplitSection bg="bg-muted" flip={true} accent={<AccentTable />}>
        <SectionLabel text="The Difference" />
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
          Most platforms test how well you solve artificial problems.
          Praxis measures how well you build real software.
        </h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          The goal is not to replace those platforms. The goal is to provide the missing layer
          of trust between work and opportunity.
        </p>
      </SplitSection>

      {/* ── CLOSING CTA ── */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 border-t border-border py-24"
        style={{ background: 'var(--foreground)' }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-10" style={{ color: 'var(--background)' }}>
            The future of hiring will not be built on keywords. Certificates.
            Or AI-generated resumes. It will be built on verifiable proof of work.
            Praxis exists to make that proof visible.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none transition-colors"
              style={{ background: 'var(--background)', color: 'var(--foreground)' }}
            >
              GET STARTED
            </Link>
            <Link
              href="/why"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--background)' }}
            >
              WHY PRAXIS
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
