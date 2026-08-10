import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Space_Grotesk } from "next/font/google"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { FaInstagram, FaTiktok } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import CarruselFotos from "@/components/Carusel-landing-page"
import { PublicLogoutButton } from "@/components/public-logout-button"
import { getCurrentUser } from "@/services/auth"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`)
  }

  const user = await getCurrentUser()
  const isAuthenticated = Boolean(user)
  const isAdmin = user?.role === "admin"

  return (
    <div>
      <header className="absolute top-0 left-0 z-50 w-full bg-white/30 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-4" aria-label="PickyRentCar inicio">
            <Image
              src="/PickyLogo.svg"
              alt="PickyRentCar"
              width={70}
              height={70}
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="default"
                  size="default"
                  className="rounded-full"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="rounded-full"
                  nativeButton={false}
                  render={<Link href="/register-client" />}
                >
                  Crear cuenta
                </Button>
              </>
            ) : isAdmin ? (
              <Button
                variant="default"
                size="default"
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

      <section className="relative h-[60vh] md:h-screen overflow-hidden">
        <CarruselFotos />

        <div className="absolute inset-0 bg-black/15" />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-start pt-24 text-center text-white">
          <h1
            className={`${spaceGrotesk.className} text-5xl md:text-7xl font-bold`}
          >
            Bienvenido a PickyRentCar
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Viaja lejos y seguro con nuestros vehiculos
          </p>

          <Button
            variant="default"
            size="lg"
            className="mt-10 rounded-full"
            nativeButton={false}
            render={<Link href="/catalogo" />}
          >
            Explorar catálogo
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={1.75}
              data-icon="inline-end"
            />
          </Button>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-[#071633] via-[#020817] to-black text-white">
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div>
            <h2 className="text-3xl font-semibold items-center px-6 pt-4 text-left">
              PickyRentCar
            </h2>

            <p className="mt-2 text-gray-400 items-center px-6 pt-4 text-left">
              Contactos y redes aqui debajo ↓, siguenos y recibe nuestras
              ofertas especiales
            </p>
          </div>

          <div className="my-8 border-t border-gray-700"></div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-white">Contacto</h3>

              <p className="mt-4 text-sm text-gray-400">
                Telefono: 849-229-1027
              </p>

              <p className="mt-2 text-sm text-gray-400">
                pickyrentcar2026@gmail.com
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Direccion</h3>
              <p className="mt-4 text-sm text-gray-400">
                Avenida Libertad esq. Restauracion
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Siguenos</h3>

              <div className="mt-4 flex gap-4">
                <FaInstagram size={28} />
                <FaTiktok size={28} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}