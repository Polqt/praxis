import { Skeleton } from '@/components/ui/skeleton'

export default function SubmissionsLoading() {
  return (
    <div className="px-10 py-10 w-full">
      <Skeleton className="h-7 w-40 mb-8 rounded-md" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
