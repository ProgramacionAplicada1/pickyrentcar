import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Time01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"
import type { VariantProps } from "class-variance-authority"

import { Badge, type badgeVariants } from "@/components/ui/badge"
import {
  STATUS_LABELS,
  type VehicleStatus,
} from "@/app/dashboard/vehicles/types"

const STATUS_ICONS: Record<
  VehicleStatus,
  React.ComponentProps<typeof HugeiconsIcon>["icon"]
> = {
  available: Tick02Icon,
  in_use: Time01Icon,
  maintenance: Wrench01Icon,
}

const STATUS_VARIANTS: Record<
  VehicleStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  available: "default",
  in_use: "secondary",
  maintenance: "destructive",
}

type Props = {
  status: string
}

export function StatusBadge({ status }: Props) {
  const value = (
    Object.hasOwn(STATUS_LABELS, status) ? status : "available"
  ) as VehicleStatus

  return (
    <Badge variant={STATUS_VARIANTS[value]} className="gap-1">
      <HugeiconsIcon
        icon={STATUS_ICONS[value]}
        strokeWidth={2}
        className="size-3"
      />
      {STATUS_LABELS[value]}
    </Badge>
  )
}
