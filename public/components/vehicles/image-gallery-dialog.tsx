"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  images: string[]
  vehicleLabel: string
}

export function ImageGalleryDialog({ images, vehicleLabel }: Props) {
  const [open, setOpen] = React.useState(false)
  const [startIndex, setStartIndex] = React.useState(0)
  const [api, setApi] = React.useState<CarouselApi | null>(null)

  React.useEffect(() => {
    if (!api || !open) return
    api.scrollTo(startIndex, true)
  }, [api, open, startIndex])

  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {images.map((url, i) => (
          <button
            key={url + i}
            type="button"
            onClick={() => {
              setStartIndex(i)
              setOpen(true)
            }}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-input bg-muted/30 transition-transform hover:scale-[1.02]"
            aria-label={`Ver imagen ${i + 1} de ${images.length} en grande`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${vehicleLabel} — imagen ${i + 1}`}
              className="size-full object-cover"
            />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-primary/95 px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary-foreground uppercase">
                Portada
              </span>
            )}
            <span className="absolute right-1.5 bottom-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
              {i + 1}/{images.length}
            </span>
          </button>
        ))}
      </div>

      <DialogContent
        className="max-w-4xl border-0 bg-transparent p-0 shadow-none ring-0 [&>button]:bg-card/80 [&>button]:backdrop-blur"
        showCloseButton
      >
        <DialogTitle className="sr-only">
          Galería de imágenes de {vehicleLabel}
        </DialogTitle>
        <Carousel
          setApi={setApi}
          opts={{ loop: images.length > 1, startIndex }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {images.map((url, i) => (
              <CarouselItem key={url + i} className="pl-0">
                <div className="flex h-[80vh] items-center justify-center bg-card/95 p-4 backdrop-blur">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${vehicleLabel} — imagen ${i + 1}`}
                    className="max-h-full max-w-full rounded-2xl object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}