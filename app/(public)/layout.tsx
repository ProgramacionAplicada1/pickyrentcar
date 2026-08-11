import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/public/mobile-nav"
import { ScrollToSection } from "@/components/ui/scroll-to-section"
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
      <header className="sticky top-0 z-40 border-b bg-background/90 shadow-sm backdrop-blur-xl safe-top">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="PickyRentCar inicio"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary shadow-sm">
              <Image src="/PickyLogo.svg" alt="" width={34} height={34} className="brightness-0 invert" priority />
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              PickyRentCar
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
            <Link
              href="/catalogo"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Vehículos
            </Link>
            <ScrollToSection href="/#ventajas" className="text-muted-foreground transition-colors hover:text-primary">Beneficios</ScrollToSection>
            <ScrollToSection href="/#como-funciona" className="text-muted-foreground transition-colors hover:text-primary">Cómo funciona</ScrollToSection>
            <ScrollToSection href="/#contacto" className="text-muted-foreground transition-colors hover:text-primary">Contacto</ScrollToSection>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {!user ? (
              <Button
                variant="default"
                size="sm"
                className="rounded-full px-4 sm:px-5"
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
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:inline"
                >
                  Mis reservas
                </Link>
                <PublicUserMenu
                  displayName={user.displayName}
                  email={user.email}
                />
              </>
            )}
            <MobileNav
              isAuthenticated={Boolean(user)}
              isAdmin={isAdmin}
              displayName={user?.displayName ?? null}
              email={user?.email ?? null}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white"><Image src="/PickyLogo.svg" alt="" width={30} height={30} /></span>
            <div><p className="font-bold">PickyRentCar</p><p className="text-xs text-white/55">San Francisco de Macorís, República Dominicana</p></div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
            <Link href="/catalogo" className="hover:text-white">Vehículos</Link>
            <Link href="/mis-reservas" className="hover:text-white">Mis reservas</Link>
            <a href="mailto:pickyrentcar2026@gmail.com" className="hover:text-white">Contacto</a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row sm:justify-between sm:px-6">
            <p>© {new Date().getFullYear()} PickyRentCar. Todos los derechos reservados.</p>
            <p>Viaja lejos. Viaja seguro.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
