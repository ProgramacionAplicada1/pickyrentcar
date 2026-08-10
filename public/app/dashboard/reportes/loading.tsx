import { Skeleton } from "@/components/ui/skeleton"

export default function ReportesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl border p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-4">
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}
