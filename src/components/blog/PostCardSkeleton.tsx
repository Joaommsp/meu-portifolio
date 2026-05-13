import { Skeleton } from "@/components/ui/skeleton"

export function PostCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando post"
      className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
      <div className="mt-auto flex items-center justify-between pt-3">
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}
