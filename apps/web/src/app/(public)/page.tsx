import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="max-w-2xl">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight text-foreground">
          Praxis
        </h1>
        <p className="text-xl mb-2 text-muted-foreground">
          Skills proved through execution, not claims.
        </p>
        <p className="text-base mb-10 text-muted-foreground/70">
          Write code. Run it in a live sandbox. Get verified.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
