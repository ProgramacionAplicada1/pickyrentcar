import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PublicUserMenu } from "@/components/public-user-menu"
import { getCurrentUser } from "@/services/auth"

export const metadata = {
  title: "Catálogo · PickyRentCar",
  description: "Reserva vehículos disponibles para tu próxima aventura.",
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const isAdmin = user?.role === "admin"

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="PickyRentCar inicio"
          >
            <Image
              src="/PickyLogo.svg"
              alt=""
              width={32}
              height={32}
              className="size-8"
              priority
            />
            <span className="hidden text-base font-semibold tracking-tight sm:inline">
              PickyRentCar
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Vehículos
            </Link>
            {!user ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Iniciar sesión
              </Button>
            ) : isAdmin ? (
              <Button
                variant="default"
                size="sm"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                Ir al panel
              </Button>
            ) : (
              <>
                <Link
                  href="/mis-reservas"
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
                >
                  Mis reservas
                </Link>
                <PublicUserMenu
                  displayName={user.displayName}
                  email={user.email}
                />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer>
        <Separator />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PickyRentCar. Todos los derechos reservados.</p>
          <p>Catálogo público de vehículos disponibles.</p>
        </div>
      </footer>
    </div>
  )
}
