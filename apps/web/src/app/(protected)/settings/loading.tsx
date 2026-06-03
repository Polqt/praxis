import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="flex h-full">
      <aside className="w-55 shrink-0 border-r border-border flex flex-col pt-4">
        <Skeleton className="h-3 w-16 mx-3 mb-3 rounded" />
        <div className="flex flex-col gap-1 px-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 px-8 pt-6">
        <Skeleton className="h-6 w-32 mb-1 rounded" />
        <Skeleton className="h-4 w-64 mb-4 rounded" />
        <Skeleton className="h-px w-full mb-6 rounded" />
        <div className="space-y-4 max-w-md">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
