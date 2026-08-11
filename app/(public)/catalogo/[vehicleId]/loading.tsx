import { Skeleton } from "@/components/ui/skeleton"

export default function CatalogoVehicleLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <Skeleton className="h-72 w-full rounded-2xl" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-11 w-48 rounded-full" />
    </div>
  )
}
