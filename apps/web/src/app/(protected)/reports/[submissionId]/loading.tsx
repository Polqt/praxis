export default function Loading() {
  return (
    <div className="px-6 md:px-10 pt-6 pb-16 w-full animate-pulse">
      <div className="h-4 w-32 bg-muted rounded mb-6" />
      <div className="flex items-start gap-8">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
        <div className="w-72 shrink-0 hidden lg:flex flex-col gap-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  )
}
