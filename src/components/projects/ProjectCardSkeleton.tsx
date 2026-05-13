import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando projeto"
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}
