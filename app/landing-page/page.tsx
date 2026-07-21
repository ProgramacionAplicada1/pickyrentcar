import Link from "next/link";
import Image from "next/image";

function LandingPage() {

  return (
    <div>
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-prototipo-3.svg"
              alt="PickyRentCar"
              width={70}
              height={70}
              priority
            />

            <button className="rounded-lg px-3 py-2 hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="h-0.5 w-6 bg-black"></span>
                  <span className="h-0.5 w-6 bg-black"></span>
                  <span className="h-0.5 w-6 bg-black"></span>
                </div>
                <span className="text-sm font-medium">Menu</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100">
              Iniciar sesion
            </Link>

            <Link href="/register" className="rounded-lg bg-[#071633] px-5 py-2.5 font-medium text-white hover:bg-[#0A1F45]">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      

      
      <section className="flex flex-col items-center px-6 pt-4 text-center">
        <h1 className="text-5xl font-semibold tracking-tight">
          Bienvenido a PickyRentCar
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-500">
          Viaja seguro, frontea y haz paquete en la avenida con nuestros
          vehiculos
        </p>

        <div className="mt-4 w-full max-w-6xl">
          <Image
            src="/Foto-Landing-page.png"
            alt="Vehiculos disponibles en PickyRentCar"
            width={1400}
            height={600}
            priority
            className="h-auto w-full object-contain"
          />
        </div>
      </section>

      


      <footer className="mt-4 bg-gradient-to-b from-[#071633] via-[#020817] to-black text-white">
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
              <p className="mt-4 text-sm text-gray-400">Instagram</p>
              <p className="mt-2 text-sm text-gray-400">TikTok</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
