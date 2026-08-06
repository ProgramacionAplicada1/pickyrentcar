import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PublicLogoutButton } from "@/components/public-logout-button"
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
  const isAuthenticated = Boolean(user)
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
            <span className="text-base font-semibold tracking-tight">
              PickyRentCar
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Vehículos
            </Link>
            {!isAuthenticated ? (
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
              <PublicLogoutButton />
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