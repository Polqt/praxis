import { Skeleton } from '@/components/ui/skeleton'

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b border-border" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-10" />
        <div className="space-y-px border border-border">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-none" />
          ))}
        </div>
      </div>
    </div>
  )
}
