import Link from 'next/link'

export default function ProofNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Proof not found</p>
      <h1 className="text-3xl font-semibold tracking-tight mb-3">This proof link is no longer active</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        The verification report you&apos;re looking for may have been unpublished by its owner, or the link may be incorrect.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-10 px-6 text-[11px] font-medium uppercase tracking-widest border border-border rounded-none hover:bg-muted transition-colors"
      >
        Back to Praxis
      </Link>
    </div>
  )
}
