import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="w-full bg-background">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="w-full h-16 block"
        aria-hidden
      >
        <path
          d="M0,0 C240,80 480,80 720,40 C960,0 1200,0 1440,60 L1440,80 L0,80 Z"
          fill="var(--background)"
        />
        <path
          d="M0,0 C240,80 480,80 720,40 C960,0 1200,0 1440,60"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-tight text-foreground block mb-2"
            >
              Praxis
            </Link>
            <p className="text-sm text-muted-foreground">
              Verified proof of work for developers.
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-foreground block mb-4">
              Product
            </span>
            <ul className="space-y-3">
              <li>
                <Link href="/challenges" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Challenges
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-foreground block mb-4">
              Company
            </span>
            <ul className="space-y-3">
              <li>
                <Link href="/why" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Why Praxis
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-foreground block mb-4">
              Legal
            </span>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} — PRAXIS
          </p>
        </div>
      </div>
    </footer>
  )
}
