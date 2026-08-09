import { Skeleton } from "@/components/ui/skeleton"

export default function ReservaDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        
        <div className="flex flex-col gap-3 rounded-2xl border p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="flex flex-col gap-3 rounded-2xl border p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="flex flex-col gap-3 rounded-2xl border p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
        </div>
       
        <div className="flex flex-col gap-3 rounded-2xl border p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}
