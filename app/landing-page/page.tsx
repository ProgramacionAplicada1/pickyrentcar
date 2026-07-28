import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import CarruselFotos from "@/components/Carusel-landing-page";
import { FaInstagram, FaTiktok } from "react-icons/fa";
const spaceGrotesk = Space_Grotesk({subsets: ["latin"],weight: ["400", "500", "700"]});



function LandingPage() {
  return (
    <div>
      <header className="absolute top-0 left-0 z-50 w-full bg-transparent">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Image
              src="/PickyLogo.svg"
              alt="PickyRentCar"
              width={70}
              height={70}
              priority
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-5 py-2.5 font-medium text-white hover:bg-[#0A1F45]"
            >
              Iniciar sesion
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#071633] px-5 py-2.5 font-medium text-white hover:bg-[#0A1F45]"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>




      <section className="relative h-screen overflow-hidden">
        <CarruselFotos />

        <div className="absolute inset-0 bg-black/15" />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-start pt-24 text-center text-black">
          <h1
            className={`${spaceGrotesk.className} text-5xl md:text-7xl font-bold`}
          >
            Bienvenido a PickyRentCar
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-black">
            Viaja lejos y seguro con nuestros vehiculos
          </p>

          <Link
            href="/catalogo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#071633] px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-[#0A1F45]"
          >
            Explorar catálogo
            <span aria-hidden>→</span>
          </Link>
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
  );
}

export default LandingPage;
