"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {ViewIcon, MoreHorizontalCircle01Icon, EyeIcon,} from "@hugeicons/core-free-icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

type Props = {
  clientId: string | null;
};

export function ClientsActions({ clientId }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted">
        <HugeiconsIcon
          icon={MoreHorizontalCircle01Icon}
          strokeWidth={2}
          className="size-4"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            console.log("Ver cliente:", clientId);
          }}
        >
          <HugeiconsIcon
            icon={ViewIcon}
            strokeWidth={2}
            className="mr-2 size-4"
          />
          Ver detalle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
