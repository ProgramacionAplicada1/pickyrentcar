"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { GridIcon, TableIcon } from "@hugeicons/core-free-icons"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type VehicleView = "grid" | "table"

type Props = {
  current: VehicleView
}

export function ViewToggle({ current }: Props) {
  const pathname = usePathname()

  return (
    <ToggleGroup value={[current]} spacing={0}>
      <ToggleGroupItem
        value="grid"
        aria-label="Vista grid"
        nativeButton={false}
        render={<Link href={pathname} scroll={false} />}
        className="size-9 rounded-full rounded-r-none"
      >
        <HugeiconsIcon icon={GridIcon} strokeWidth={1.75} />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="table"
        aria-label="Vista tabla"
        nativeButton={false}
        render={<Link href={`${pathname}?view=table`} scroll={false} />}
        className="size-9 rounded-full rounded-l-none"
      >
        <HugeiconsIcon icon={TableIcon} strokeWidth={1.75} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
