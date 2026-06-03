import { Skeleton } from '@/components/ui/skeleton'

export default function StudioLoading() {
  return (
    <div className="px-10 py-10 w-full">
      <Skeleton className="h-9 w-64 mb-3 rounded-md" />
      <Skeleton className="h-4 w-48 mb-8 rounded-md" />
      <div className="flex gap-8 mb-8">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
