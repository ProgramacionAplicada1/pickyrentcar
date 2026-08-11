import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ScrollToSection } from "@/components/ui/scroll-to-section"
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiStar,
} from "react-icons/fi"
import { FaWhatsapp } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { PublicUserMenu } from "@/components/public-user-menu"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getCurrentUser } from "@/services/auth"
import { listPublicVehicles } from "@/services/catalog"

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams
  if (params.code) redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`)

  const [user, vehicles] = await Promise.all([
    getCurrentUser(),
    listPublicVehicles(),
  ])
  const featured = vehicles.filter((vehicle) => vehicle.status === "available").slice(0, 3)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15 bg-slate-950/25 text-white backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="PickyRentCar inicio">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-lg">
              <Image src="/PickyLogo.svg" alt="" width={34} height={34} priority />
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">PickyRentCar</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/85 lg:flex">
            <ScrollToSection href="#ventajas" className="transition hover:text-white">Beneficios</ScrollToSection>
            <Link href="/catalogo" className="transition hover:text-white">Vehículos</Link>
            <ScrollToSection href="#como-funciona" className="transition hover:text-white">Cómo funciona</ScrollToSection>
            <ScrollToSection href="#contacto" className="transition hover:text-white">Contacto</ScrollToSection>
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Button variant="ghost" className="hidden rounded-full text-white hover:bg-white/10 hover:text-white sm:inline-flex" nativeButton={false} render={<Link href="/login" />}>
                  Iniciar sesión
                </Button>
                <Button className="rounded-full bg-white text-slate-950 hover:bg-white/90" nativeButton={false} render={<Link href="/register-client" />}>
                  Crear cuenta
                </Button>
              </>
            ) : user.role === "admin" ? (
              <Button className="rounded-full bg-white text-slate-950 hover:bg-white/90" nativeButton={false} render={<Link href="/dashboard" />}>
                Ir al panel
              </Button>
            ) : (
              <PublicUserMenu displayName={user.displayName} email={user.email} />
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate min-h-[760px] overflow-hidden bg-slate-950 text-white lg:min-h-[820px]">
          <Image src="/picky-hero.webp" alt="Vehículo de alquiler PickyRentCar" fill priority sizes="100vw" className="object-cover object-center opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -left-20 top-40 size-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative mx-auto flex min-h-[760px] max-w-7xl items-center px-4 pb-28 pt-36 sm:px-6 lg:min-h-[820px]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <FiMapPin className="text-sky-300" />
                San Francisco de Macorís, República Dominicana
              </div>
              <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                El vehículo ideal para tu próxima ruta.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
                Reserva de forma rápida, segura y sin complicaciones. Una flota cuidada y lista para llevarte más lejos.
              </p>

              <form action="/catalogo" className="mt-10 grid max-w-3xl gap-3 rounded-3xl border border-white/15 bg-white p-3 text-slate-950 shadow-2xl shadow-black/30 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className="flex flex-col gap-1.5 rounded-2xl px-3 py-2">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><FiCalendar /> Recogida</span>
                  <input name="from" type="date" required className="h-8 bg-transparent text-sm font-semibold outline-none" />
                </label>
                <label className="flex flex-col gap-1.5 rounded-2xl border-t px-3 py-2 sm:border-l sm:border-t-0">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><FiCalendar /> Devolución</span>
                  <input name="to" type="date" required className="h-8 bg-transparent text-sm font-semibold outline-none" />
                </label>
                <Button type="submit" size="lg" className="h-14 rounded-2xl bg-slate-950 px-7 text-white hover:bg-slate-800">
                  Ver disponibilidad <FiArrowRight />
                </Button>
              </form>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70">
                <span className="flex items-center gap-2"><FiCheck className="text-emerald-400" /> Precios transparentes</span>
                <span className="flex items-center gap-2"><FiCheck className="text-emerald-400" /> Reserva segura</span>
                <span className="flex items-center gap-2"><FiCheck className="text-emerald-400" /> Atención personalizada</span>
              </div>
            </div>
          </div>
        </section>

        <section id="ventajas" className="relative z-10 -mt-16 px-4 sm:px-6">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border bg-white shadow-xl shadow-slate-900/10 md:grid-cols-3">
            <Benefit icon={<FiShield />} title="Conduce con confianza" description="Vehículos verificados y mantenidos antes de cada entrega." />
            <Benefit icon={<FiClock />} title="Reserva en minutos" description="Consulta disponibilidad y completa tu solicitud fácilmente." bordered />
            <Benefit icon={<FiStar />} title="Servicio que acompaña" description="Atención cercana antes, durante y después de tu viaje." bordered />
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-700">Nuestra flota</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Elige cómo quieres viajar</h2>
                <p className="mt-3 max-w-xl text-muted-foreground">Opciones cómodas, confiables y preparadas para cada tipo de recorrido.</p>
              </div>
              <Button variant="outline" className="w-fit rounded-full" nativeButton={false} render={<Link href="/catalogo" />}>Ver todos los vehículos <FiArrowRight /></Button>
            </div>

            {featured.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {featured.map((vehicle) => {
                  const cover = vehicle.image_urls[0]
                  return (
                    <Link key={vehicle.id} href={`/catalogo/${vehicle.id}`} className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {cover ? <Image src={cover} alt={`${vehicle.brand} ${vehicle.model}`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <Image src="/corolla.png" alt="Vehículo" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />}
                        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">Disponible</span>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{vehicle.category} · {vehicle.year}</p>
                        <h3 className="mt-2 text-xl font-bold">{vehicle.brand} {vehicle.model}</h3>
                        <div className="mt-5 flex items-end justify-between border-t pt-4">
                          <div><span className="text-xs text-muted-foreground">Desde</span><p className="text-xl font-bold">{formatCurrency(Number(vehicle.daily_price))}<span className="text-xs font-normal text-muted-foreground"> / día</span></p></div>
                          <span className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:translate-x-1"><FiChevronRight /></span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border bg-muted/30 p-10 text-center text-muted-foreground">Pronto mostraremos aquí nuestros vehículos destacados.</div>
            )}
          </div>
        </section>

        <section id="como-funciona" className="bg-slate-950 px-4 py-24 text-white sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-300">Simple y rápido</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tu próximo viaje en tres pasos</h2></div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Step number="01" title="Selecciona tus fechas" description="Indica cuándo necesitas el vehículo y revisa la disponibilidad real." />
              <Step number="02" title="Elige tu vehículo" description="Compara precios y características hasta encontrar tu mejor opción." />
              <Step number="03" title="Confirma tu reserva" description="Completa tus datos y recibe el número de seguimiento de tu solicitud." />
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-sky-700 px-6 py-14 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
            <div className="absolute -right-20 -top-32 size-96 rounded-full bg-white/10" />
            <div className="relative max-w-2xl"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">¿Listo para ponerte en marcha?</h2><p className="mt-4 text-lg text-white/75">Encuentra un vehículo disponible y comienza tu reserva hoy.</p></div>
            <Button size="lg" className="relative mt-8 h-12 rounded-full bg-white px-7 text-sky-800 hover:bg-white/90 lg:mt-0" nativeButton={false} render={<Link href="/catalogo" />}>Explorar vehículos <FiArrowRight /></Button>
          </div>
        </section>
      </main>

      <footer id="contacto" className="border-t bg-slate-950 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-white"><Image src="/PickyLogo.svg" alt="" width={30} height={30} /></span><span className="font-bold">PickyRentCar</span></div><p className="mt-5 max-w-xs text-sm leading-6 text-white/55">Movilidad confiable para descubrir cada destino con libertad.</p></div>
          <div><h3 className="font-bold">Explora</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/60"><Link href="/catalogo" className="hover:text-white">Vehículos</Link><ScrollToSection href="#como-funciona" className="hover:text-white">Cómo funciona</ScrollToSection><Link href="/login" className="hover:text-white">Mi cuenta</Link></div></div>
          <div><h3 className="font-bold">Contacto</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/60"><a href="tel:+18492291027" className="flex items-center gap-2 hover:text-white"><FiPhone /> 849-229-1027</a><a href="mailto:pickyrentcar2026@gmail.com" className="flex items-center gap-2 hover:text-white"><FiMail /> pickyrentcar2026@gmail.com</a><span className="flex items-start gap-2"><FiMapPin className="mt-0.5" /> Av. Libertad esq. Restauración, San Francisco de Macorís</span></div></div>
          <div><h3 className="font-bold">Síguenos</h3><div className="mt-5 flex gap-3"><a href="#" aria-label="Instagram" className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 hover:bg-white hover:text-slate-950"><FiInstagram /></a><a href="https://wa.me/18492291027" aria-label="WhatsApp" className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 hover:bg-white hover:text-slate-950"><FaWhatsapp /></a></div></div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} PickyRentCar. Todos los derechos reservados.</p><p>Viaja lejos. Viaja seguro.</p></div>
      </footer>
    </div>
  )
}

function Benefit({ icon, title, description, bordered = false }: { icon: React.ReactNode; title: string; description: string; bordered?: boolean }) {
  return <div className={`flex gap-4 p-7 lg:p-9 ${bordered ? "border-t md:border-l md:border-t-0" : ""}`}><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">{icon}</span><div><h2 className="font-bold">{title}</h2><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p></div></div>
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7"><span className="text-4xl font-black text-white/15">{number}</span><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-white/60">{description}</p></div>
}
