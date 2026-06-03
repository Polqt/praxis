import { Skeleton } from '@/components/ui/skeleton'

export default function StudioLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 md:py-10 w-full">
      <Skeleton className="h-9 w-64 mb-3 rounded-md" />
      <Skeleton className="h-4 w-48 mb-6 rounded-md" />
      <div className="flex gap-3 mb-8">
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <Skeleton className="h-20 w-full rounded-lg mb-4" />
      <Skeleton className="h-1 w-full rounded-full mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />

        {/* Verified skills card — badge-shaped skeletons */}
        <div className="rounded-lg border p-5 h-40">
          <Skeleton className="h-3 w-24 mb-4 rounded-sm" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-16 rounded" />
            ))}
          </div>
        </div>

        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  )
}
