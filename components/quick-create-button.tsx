import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

export function QuickCreateButton() {
  return (
    <Button
      variant="default"
      size="sm"
      className="rounded-full"
      nativeButton={false}
      render={<Link href="/dashboard/vehicles/new" />}
    >
      <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
      Crear vehículo
    </Button>
  )
}
