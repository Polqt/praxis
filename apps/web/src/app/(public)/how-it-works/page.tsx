import Link from 'next/link'

function SectionLabel({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 mb-6">
      <div
        className="rounded-[1px] shrink-0"
        style={{ width: '8px', height: '10px', background: light ? 'rgba(255,255,255,0.4)' : 'var(--primary)' }}
      />
      <span
        className="text-[13px] uppercase tracking-widest"
        style={{ color: light ? 'rgba(255,255,255,0.4)' : 'var(--muted-foreground)' }}
      >
        {text}
      </span>
    </div>
  )
}

function StepCounter({ n }: { n: string }) {
  return (
    <p
      className="text-9xl font-bold tracking-tighter leading-none select-none mb-8"
      style={{ color: 'var(--foreground)', opacity: 0.05 }}
    >
      {n}
    </p>
  )
}

function StepIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 mt-8">
      <div
        className="rounded-[1px] shrink-0"
        style={{ width: '8px', height: '10px', background: 'var(--primary)' }}
      />
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{text}</span>
    </div>
  )
}

function MarqueeBand({ text }: { text: string }) {
  const repeated = text.repeat(6)
  return (
    <div
      className="w-full overflow-hidden flex items-center border-t border-b border-border"
      style={{ background: 'var(--foreground)', height: '80px' }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 20s linear infinite', willChange: 'transform' }}
      >
        <span
          className="text-[13px] uppercase tracking-widest font-medium px-4"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          {repeated}
        </span>
        <span
          className="text-[13px] uppercase tracking-widest font-medium px-4"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          {repeated}
        </span>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="bg-background">

      {/* ── HERO ── */}
      <section className="min-h-screen bg-muted flex flex-col items-center justify-center text-center px-6 pt-14">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground mb-6">
            Get verified in four steps. Most developers finish in under ten minutes.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect your GitHub. Pick a challenge. Submit your project. Your proof page goes live.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-11 px-8 bg-foreground text-background text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* ── SECTION 1: THE PROBLEM WITH PROOF ── */}
      <section className="min-h-screen bg-background flex flex-col justify-center border-t border-border py-24">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <SectionLabel text="The Problem With Proof" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
            You have already done the work. Proving it should not require starting over.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>
              Every developer applying to jobs faces the same ask. Demonstrate your skills. But
              the tools available to do that ask you to perform. Whiteboard a solution you would
              Google in real life. Complete a take-home project that mimics work you have already
              done elsewhere. Write code in an artificial environment with artificial constraints
              and artificial time pressure.
            </p>
            <p>
              The work you have actually done is sitting in GitHub. Production applications. Real
              commits. Architecture decisions made under real constraints. Documentation written
              for real teammates. That work is more revealing than anything you could produce in
              a two-hour coding exercise.
            </p>
            <p>
              Praxis reads what you have already built and turns it into proof. You do not start
              over. You connect what already exists.
            </p>
          </div>
        </div>
      </section>

      <MarqueeBand text="CONNECT · ANALYZE · VERIFY · PUBLISH · " />

      {/* ── SECTION 2: STEP ONE ── */}
      <section className="min-h-screen bg-background flex flex-col justify-center border-t border-border py-24">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <StepCounter n="01" />
          <SectionLabel text="Step One" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
            Connect your GitHub. Take thirty seconds.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>
              Praxis uses GitHub OAuth to connect your account. You choose exactly which
              repository to submit. We request read-only access scoped to that single repository.
              Nothing else. No access to your private repositories unless you choose to submit
              one. No access to your organization repos unless you explicitly provide it.
            </p>
            <p>
              You gain: a connected GitHub account that links your real work to your Praxis
              profile. This is the only account setup you will ever need to do. All future
              verifications start here.
            </p>
          </div>
          <StepIndicator text="Takes about 30 seconds · Requires a GitHub account" />
        </div>
      </section>

      {/* ── SECTION 3: STEP TWO ── */}
      <section className="min-h-screen bg-muted flex flex-col justify-center border-t border-border py-24">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <StepCounter n="02" />
          <SectionLabel text="Step Two" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
            Pick a challenge. Choose what gets verified.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>
              Praxis offers verification challenges organized by project type. Full-stack
              applications. Backend APIs. Frontend applications. Open-source contributions. Each
              challenge defines what the verification report will evaluate. You choose the
              challenge that matches the project you are about to submit.
            </p>
            <p>
              You gain: a structured verification framework that tells you exactly what will be
              evaluated before you submit. No surprises. No ambiguity. You know what the report
              will look for before it looks.
            </p>
          </div>
          <StepIndicator text="Takes less than a minute · No technical knowledge required" />
        </div>
      </section>

      {/* ── SECTION 4: STEP THREE ── */}
      <section className="min-h-screen bg-background flex flex-col justify-center border-t border-border py-24">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <StepCounter n="03" />
          <SectionLabel text="Step Three" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
            Submit your repository. That is the entire step.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>
              You paste the repository URL or select it from your connected GitHub repositories.
              You confirm the challenge you selected. You click submit. The verification begins
              automatically. There is no form to fill. No upload. No manual documentation
              required. The repository is the submission.
            </p>
            <p>
              You gain: a queued verification that begins analyzing your repository within
              seconds. You will receive an email when the report is ready. Most verifications
              complete in under ten minutes. Complex repositories with extensive commit histories
              may take slightly longer.
            </p>
          </div>
          <StepIndicator text="Takes about one minute · Repository must be on GitHub" />
        </div>
      </section>

      <MarqueeBand text="REAL WORK · REAL EVIDENCE · REAL PROOF · " />

      {/* ── SECTION 5: STEP FOUR ── */}
      <section className="min-h-screen bg-muted flex flex-col justify-center border-t border-border py-24">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <StepCounter n="04" />
          <SectionLabel text="Step Four" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
            Your proof page goes live. Share it with anyone.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>
              Once verification is complete, your proof page is published at
              praxis.dev/p/username. The page shows your name, your verified skills, the
              repository that was verified, the verification scores across each evaluated
              dimension, and the summary analysis from the report. It is permanent. It is public.
              It requires no login to view.
            </p>
            <p>
              You gain: a URL you can paste anywhere. In a job application. In a LinkedIn bio.
              In a cold email to a recruiter. In a Twitter bio. The person receiving it does not
              need a Praxis account to see what you built and why it passed verification. The
              proof page is designed to stand on its own.
            </p>
            <p>
              Unlike a resume or a LinkedIn profile, a Praxis proof page cannot be fabricated.
              It is generated from evidence that existed in your repository before you submitted.
              The report reflects what was actually there. That is what makes it trusted.
            </p>
          </div>
          <StepIndicator text="Goes live automatically · Permanent unless you choose to remove it" />
        </div>
      </section>

      {/* ── SECTION 6: WHAT YOU END UP WITH ── */}
      <section className="min-h-screen bg-background flex flex-col justify-center border-t border-border py-24">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <SectionLabel text="What You End Up With" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-6 mb-10 text-foreground">
            Before and after Praxis.
          </h2>

          <div className="border-t border-border">
            <div className="flex h-10 items-center border-b border-border">
              <span className="flex-1 text-xs uppercase tracking-widest text-muted-foreground">Without Praxis</span>
              <span className="flex-1 text-xs uppercase tracking-widest text-muted-foreground">With Praxis</span>
            </div>
            {[
              {
                without: 'A resume that lists technologies.',
                with: 'A verified record of technologies demonstrated in production code.',
              },
              {
                without: 'A GitHub profile that shows repositories.',
                with: 'A proof page that shows what was verified inside those repositories.',
              },
              {
                without: 'A self-reported skill list.',
                with: 'An independently verified skill report backed by evidence.',
              },
              {
                without: 'A portfolio that anyone could have built.',
                with: 'A verified project tied to your commit history and authorship.',
              },
            ].map(({ without, with: withText }) => (
              <div key={without} className="flex h-16 items-center border-b border-border">
                <span className="flex-1 text-[15px] text-foreground pr-6">{without}</span>
                <span className="flex-1 text-[15px] text-muted-foreground">{withText}</span>
              </div>
            ))}
          </div>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-10">
            The process takes ten minutes. The proof lasts indefinitely.
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section
        className="min-h-screen flex flex-col justify-center border-t border-border py-24 px-6"
        style={{ background: 'var(--foreground)' }}
      >
        <div className="max-w-5xl mx-auto w-full">
          <SectionLabel text="Ready" light />
          <h2
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-10 max-w-3xl"
            style={{ color: 'var(--background)' }}
          >
            That is it. Connect. Submit. Get verified.
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
              style={{ background: 'var(--background)', color: 'var(--foreground)' }}
            >
              Get started
            </Link>
            <Link
              href="/example-report"
              className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border hover:bg-white/10 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--background)' }}
            >
              See an example report
            </Link>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Free to start. No credit card. Your first verification is on us.
          </p>
        </div>
      </section>

    </div>
  )
}
