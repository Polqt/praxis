import { Skeleton } from '@/components/ui/skeleton'

export default function ChallengesLoading() {
  return (
    <div className="px-10 py-10 w-full">
      <Skeleton className="h-7 w-40 mb-2 rounded-md" />
      <Skeleton className="h-4 w-64 mb-8 rounded-md" />
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
