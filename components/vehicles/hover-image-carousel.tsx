"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Car01Icon } from "@hugeicons/core-free-icons"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const ROTATION_INTERVAL_MS = 1800

type Props = {
  images: string[]
  alt: string
  className?: string
  /** Overlay en top-right (e.g., DropdownMenu trigger). Se muestra siempre. */
  topRight?: React.ReactNode
  /** Overlay en bottom-right (e.g., badge "+N"). Se muestra cuando NO hay hover. */
  bottomRight?: React.ReactNode
  /** Si true, muestra un badge "N fotos" en top-right cuando hay más de 1 imagen y no hay hover. */
  photosBadge?: boolean
  /** Si true, aplica `group-hover:scale-105` al `<img>` (requiere `group` en el parent). */
  zoomOnHover?: boolean
}

export function HoverImageCarousel({
  images,
  alt,
  className,
  topRight,
  bottomRight,
  photosBadge = false,
  zoomOnHover = false,
}: Props) {
  const cover = images[0] ?? null
  const hasMultiple = images.length > 1
  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const [hovered, setHovered] = React.useState(false)
  const [current, setCurrent] = React.useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] =
    React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  React.useEffect(() => {
    if (!hasMultiple || !hovered || !api || prefersReducedMotion) return
    const id = setInterval(() => {
      api.scrollNext()
    }, ROTATION_INTERVAL_MS)
    return () => clearInterval(id)
  }, [hasMultiple, hovered, api, prefersReducedMotion])

  function handleMouseLeave() {
    setHovered(false)
    api?.scrollTo(0, true)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setHovered(true)}
      onBlur={handleMouseLeave}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden bg-muted",
        className,
      )}
    >
      {hasMultiple ? (
        <Carousel
          setApi={setApi}
          opts={{ loop: true, duration: 30 }}
          className="size-full"
        >
          <CarouselContent className="ml-0">
            {images.map((url, i) => (
              <CarouselItem key={url + i} className="pl-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${alt} — foto ${i + 1}`}
                  className={cn(
                    "size-full object-cover transition-transform duration-300",
                    zoomOnHover && "group-hover:scale-105",
                  )}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : cover ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={cover}
          alt={alt}
          className={cn(
            "size-full object-cover transition-transform duration-300",
            zoomOnHover && "group-hover:scale-105",
          )}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <HugeiconsIcon
            icon={Car01Icon}
            strokeWidth={1.5}
            className="size-12 text-muted-foreground/40"
          />
        </div>
      )}

      {topRight}

      {photosBadge && hasMultiple && !hovered && (
        <span className="absolute top-2 right-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
          {images.length} fotos
        </span>
      )}

      {bottomRight && !hovered && (
        <div className="absolute bottom-2 right-2">{bottomRight}</div>
      )}

      {hasMultiple && hovered && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5"
        >
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-all duration-200",
                i === current ? "w-4 bg-white" : "bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}