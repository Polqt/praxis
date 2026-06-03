import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[13px] uppercase tracking-widest font-medium text-muted-foreground mb-6">404</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
        Page not found.
      </h1>
      <p className="text-base text-muted-foreground max-w-sm mb-10 leading-relaxed">
        This page doesn&apos;t exist or was moved. Check the URL or head back home.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
          style={{ background: 'var(--foreground)', color: 'var(--background)' }}
        >
          Home
        </Link>
        <Link
          href="/challenges"
          className="inline-flex items-center justify-center h-11 px-8 text-[11px] font-medium uppercase tracking-widest rounded-none border border-border hover:bg-background transition-colors"
        >
          Challenges
        </Link>
      </div>
    </div>
  )
}
