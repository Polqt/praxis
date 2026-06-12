export default function Loading() {
  return (
    <div className="bg-background animate-pulse">
      <div className="sticky top-0 z-10 bg-background/95 border-b border-border h-14" />
      <section className="bg-muted px-6 pt-12 pb-16 border-b border-border">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="h-4 w-40 bg-muted-foreground/20 rounded" />
          <div className="h-12 w-3/4 bg-muted-foreground/20 rounded" />
          <div className="h-4 w-1/2 bg-muted-foreground/20 rounded" />
          <div className="h-24 bg-muted-foreground/10 rounded" />
        </div>
      </section>
      <section className="bg-background border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </section>
    </div>
  )
}
