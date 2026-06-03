import { Skeleton } from '@/components/ui/skeleton'

export default function SubmissionDetailLoading() {
  return (
    <div className="px-10 py-10 w-full">
      <Skeleton className="h-4 w-36 mb-8 rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
