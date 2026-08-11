"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function PublicFooter() {
  const pathname = usePathname()
  
 
  const ocultarMisReservas = pathname.includes('/catalogo') || pathname.includes('/mis-reservas')

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white">
            <Image src="/PickyLogo.svg" alt="" width={30} height={30} />
          </span>
          <div>
            <p className="font-bold">PickyRentCar</p>
            <p className="text-xs text-white/55">San Francisco de Macorís, República Dominicana</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
          <Link href="/catalogo" className="hover:text-white">Vehículos</Link>
          
          
          {!ocultarMisReservas && (
            <Link href="/mis-reservas" className="hover:text-white">Mis reservas</Link>
          )}
          
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
  )
}