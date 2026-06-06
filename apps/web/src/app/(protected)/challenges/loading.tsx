import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function ChallengesLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 md:py-10 w-full">
      <Skeleton className="h-7 w-36 mb-1.5 rounded" />
      <Skeleton className="h-4 w-72 mb-8 rounded" />

      <div className="flex gap-0 mb-0">
        <Skeleton className="h-9 w-28 rounded-none" />
        <Skeleton className="h-9 w-28 rounded-none" />
      </div>
      <Separator />

      <div className="flex flex-col gap-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card">
            <div className="px-5 py-4">
              <Skeleton className="h-4 w-48 mb-2 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 mt-1 rounded" />
            </div>
            <div className="px-5 py-3 border-t border-border/60 flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-20 rounded-sm" />
                <Skeleton className="h-5 w-16 rounded-sm" />
                <Skeleton className="h-5 w-24 rounded-sm" />
              </div>
              <Skeleton className="h-7 w-28 rounded-md shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
