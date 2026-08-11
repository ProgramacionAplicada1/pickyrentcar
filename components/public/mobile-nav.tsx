"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type NavLink = {
  href: string
  label: string
}

type Props = {
  isAuthenticated: boolean
  isAdmin: boolean
  displayName?: string | null
  email?: string | null
}

const PUBLIC_LINKS: NavLink[] = [
  { href: "/catalogo", label: "Vehículos" },
  { href: "/#ventajas", label: "Beneficios" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#contacto", label: "Contacto" },
]

export function MobileNav({
  isAuthenticated,
  isAdmin,
  displayName,
  email,
}: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menú de navegación"
            className="lg:hidden"
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          </Button>
        }
      />

      <SheetContent
        side="left"
        className="flex w-[85vw] max-w-sm flex-col gap-0 p-0 safe-top safe-bottom"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {isAuthenticated && displayName ? displayName : "PickyRentCar"}
          </SheetTitle>
          <SheetDescription>
            {isAuthenticated && email ? email : "Menú principal"}
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {PUBLIC_LINKS.map((link) => (
            <SheetClose
              key={link.href}
              nativeButton={false}
              render={
                <Link
                  href={link.href}
                  className="flex min-h-[44px] items-center rounded-xl px-4 text-base font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              }
            />
          ))}

          {isAuthenticated && !isAdmin && (
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/mis-reservas"
                  className="flex min-h-[44px] items-center rounded-xl px-4 text-base font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80"
                  onClick={() => setOpen(false)}
                >
                  Mis reservas
                </Link>
              }
            />
          )}

          {isAuthenticated && !isAdmin && (
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/favoritos"
                  className="flex min-h-[44px] items-center rounded-xl px-4 text-base font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80"
                  onClick={() => setOpen(false)}
                >
                  Favoritos
                </Link>
              }
            />
          )}

          {isAuthenticated && !isAdmin && (
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/perfil"
                  className="flex min-h-[44px] items-center rounded-xl px-4 text-base font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80"
                  onClick={() => setOpen(false)}
                >
                  Mi perfil
                </Link>
              }
            />
          )}
        </nav>

        <div className="border-t p-4">
          {!isAuthenticated ? (
            <SheetClose
              nativeButton={false}
              render={
                <Button
                  variant="default"
                  className="w-full rounded-full"
                  render={<Link href="/login" />}
                  onClick={() => setOpen(false)}
                >
                  Iniciar sesión
                </Button>
              }
            />
          ) : isAdmin ? (
            <SheetClose
              nativeButton={false}
              render={
                <Button
                  variant="default"
                  className="w-full rounded-full"
                  render={<Link href="/dashboard" />}
                  onClick={() => setOpen(false)}
                >
                  Ir al panel
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="px-2 text-xs font-medium text-muted-foreground">
                Sesión iniciada como
              </p>
              <p className="rounded-xl bg-muted px-4 py-2 text-sm font-medium">
                {displayName ?? email ?? "Cliente"}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}