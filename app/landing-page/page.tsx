import Link from "next/link";
import Image from "next/image";

function LandingPage() {
  return (
    <div>
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="inline-flex items-center gap-3.5">
          <Image
            src="/logo-prototipo-3.svg"
            alt="PickyRentCar"
            width={92}
            height={92}
            priority
            className="size-24"
          />
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
          
    </div>
  );
}

export default LandingPage;
