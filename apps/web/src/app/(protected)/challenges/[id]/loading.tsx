import { Skeleton } from '@/components/ui/skeleton'

export default function ChallengeDetailLoading() {
  return (
    <div className="w-full px-4 py-6 sm:px-6 md:px-10 md:py-10">
      <Skeleton className="mb-7 h-4 w-32" />

      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="w-full max-w-2xl">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-9 w-4/5" />
          <Skeleton className="mt-3 h-4 w-full" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <Skeleton className="hidden h-9 w-36 sm:block" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-56 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  )
}
