"use client"

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "./ui/button";


function CarruselFotos() {

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })])
  
  const adelante = () => {
    emblaApi?.scrollNext()
  }

  const atras = () => {
    emblaApi?.scrollPrev()
  }


  let carros = [
    { id: 1, imagen: "/volvo.png"},
    { id: 2, imagen: "/corolla.png"},
    { id: 3,imagen: "/crv.png"},
    { id: 4, imagen: "/kia.png"},
    { id: 5, imagen: "/mercedes.png"}
  ]

  return (
    <div className="relative w-full h-screen">
        <Button
          onClick={atras} className="absolute top-1/2 left-4 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          &lt;
        </Button>

      <Button onClick={adelante}
        className="absolute top-1/2 right-4 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          &gt;
      </Button>
      
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
    </div>
  );
}

export default CarruselFotos
