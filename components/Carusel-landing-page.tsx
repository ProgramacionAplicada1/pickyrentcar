"use client"

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";


function CarruselFotos() {

  const [emblaRef] = useEmblaCarousel({ loop: true }, [ Autoplay({delay: 4000, stopOnInteraction: false})])


  let carros = [
    { id: 1, imagen: "/accord.png"},
    { id: 2, imagen: "/volvo.png"},
    { id: 3, imagen: "/corolla.png"},
    { id: 4,imagen: "/crv.png"},
    { id: 5, imagen: "/kia.png"},
    { id: 6, imagen: "/mercedes.png"}
  ]

  return (
    <div className="overflow-hidden w-full h-screen" ref={emblaRef}>
      <div className="flex items-center">
        {carros.map((carro) => (
          <div key={carro.id} className="flex-[0_0_100%] relative h-screen">
            <Image
              src={carro.imagen}
              alt="carros"
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CarruselFotos
