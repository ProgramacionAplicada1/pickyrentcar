"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  BankIcon,
  CreditCardIcon,
  Delete01Icon,
  Edit01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import {
  createPago as createPagoAction,
  deletePago as deletePagoAction,
  updatePagoEstado as updatePagoEstadoAction,
} from "@/app/dashboard/pagos/actions"

type Metodo = "Tarjeta" | "Efectivo" | "Transferencia"
type Estado = "pendiente" | "completado" | "fallido" | "reembolsado"

type ReservationOption = {
  id: string
  numero: string
  client_name: string
  total_price: number
  vehicle: { brand: string; model: string }
}

type PagoListItem = {
  id: string
  reservation_id: string
  monto: number
  metodo_pago: Metodo
  estado: Estado
  numero: string | null
  client_name: string | null
  vehicle_label: string | null
}

const METODOS: Metodo[] = ["Tarjeta", "Efectivo", "Transferencia"]
const ESTADOS: Estado[] = ["pendiente", "completado", "fallido", "reembolsado"]

const ESTADO_BADGE: Record<Estado, string> = {
  pendiente: "border border-amber-200 bg-amber-50 text-amber-700",
  completado: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  fallido: "border border-red-200 bg-red-50 text-red-700",
  reembolsado: "border border-slate-200 bg-slate-50 text-slate-700",
}

const METODO_ICON: Record<Metodo, React.ComponentProps<typeof HugeiconsIcon>["icon"]> = {
  Tarjeta: CreditCardIcon,
  Efectivo: Wallet01Icon,
  Transferencia: BankIcon,
}

// ============================================================================
// Registrar Pago
// ============================================================================

export function PaymentAction() {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  const [reservations, setReservations] = React.useState<ReservationOption[]>([])
  // nuevo estado para saber si las reservas todavia estan cargando
  const [isLoadingReservations, setIsLoadingReservations] = React.useState(false)
  const [reservationId, setReservationId] = React.useState("")
  const [monto, setMonto] = React.useState("")
  const [metodo, setMetodo] = React.useState<Metodo>("Tarjeta")
  const [referencia, setReferencia] = React.useState("")
  const [notas, setNotas] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isOpen) return
    async function fetchReservations() {

       //nuevo activar/desactivar el loading alrededor del fetch
      setIsLoadingReservations(true)
      try{

      
      const res = await fetch("/api/pagos/reservations")
      if (res.ok) {
        const data = (await res.json()) as { reservations: ReservationOption[] }
        setReservations(data.reservations)
      }
    } finally {
      setIsLoadingReservations(false)
    }
    }
    fetchReservations()
  }, [isOpen])

  function reset() {
    setReservationId("")
    setMonto("")
    setMetodo("Tarjeta")
    setReferencia("")
    setNotas("")
    setError(null)
  }

  function handleClose() {
    setIsOpen(false)
    reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!reservationId) {
      setError("Selecciona una reserva.")
      return
    }
    const montoNum = Number(monto)
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor que 0.")
      return
    }

    setIsProcessing(true)
    const result = await createPagoAction({
      reservation_id: reservationId,
      monto: montoNum,
      metodo_pago: metodo,
      estado: "completado",
      referencia: referencia.trim() || null,
      notas: notas.trim() || null,
    })
    setIsProcessing(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    handleClose()
    router.refresh()
  }

  //nuevo un solo flag para bloquear todo el formulario a la vez
  const isFormBusy = isLoadingReservations || isProcessing


  return (
    <>
      <Button
        type="button"
        variant="default"
        size="default"
        className="rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <HugeiconsIcon
          icon={Add01Icon}
          strokeWidth={1.75}
          data-icon="inline-start"
        />
        Registrar Pago
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose()
          else setIsOpen(true)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Vincula el pago a una reserva existente. Al registrar un pago
              completado, la reserva pasa automáticamente a Confirmada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reservation">Reserva</Label>
              {/* nuevo Select bloqueado mientras carga, y mensaje de "Cargando..." en vez de saltar directo a "vacio" */}
              <Select
                value={reservationId}
                onValueChange={(v) => {
                  const nextId = v ?? ""
                  setReservationId(nextId)
                  const reservation = reservations.find((r) => r.id === nextId)
                  setMonto(reservation ? String(reservation.total_price) : "")
                }}
                disabled={isFormBusy}
              >
                <SelectTrigger id="reservation">
                  <SelectValue placeholder="Selecciona una reserva" />
                </SelectTrigger>
                <SelectContent>
                  {reservations.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      No hay reservas disponibles
                    </SelectItem>
                  ) : (
                    reservations.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.numero} · {r.client_name} · {r.vehicle.brand}{" "}
                        {r.vehicle.model} · {formatCurrency(r.total_price)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="monto">Monto (DOP)</Label>
              {/* nuevo campos bloqueados mientras el formulario esta ocupado */}
              <Input
                id="monto"
                name="monto"
                type="number"
                inputMode="decimal"
                min={1}
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.currentTarget.value)}
                placeholder="0.00"
                required
                disabled={isFormBusy}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Método de Pago</Label>
              <div className="grid grid-cols-3 gap-2">
                {METODOS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetodo(m)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                      metodo === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <HugeiconsIcon icon={METODO_ICON[m]} strokeWidth={1.5} />
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="referencia">Referencia (opcional)</Label>
              <Input
                id="referencia"
                name="referencia"
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.currentTarget.value)}
                placeholder="Núm. de transacción, cheque, etc."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Input
                id="notas"
                name="notas"
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.currentTarget.value)}
                placeholder="Observaciones"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}

            <DialogFooter>
              {/* nuevo "Cancelar" bloqueado solo mientras se envía (no mientras carga reservas), y boton de enviar con isFormBusy */}
              <DialogClose
                render={
                  <Button type="button" variant="outline" className="rounded-full" disabled={isProcessing} />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                type="submit"
                variant="default"
                disabled={isProcessing || reservations.length === 0}
                className="rounded-full"
              >
                {isProcessing ? <Spinner /> : null}
                {isProcessing ? "Procesando…" : "Confirmar Pago"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================================================
// Acciones por fila
// ============================================================================

export function PaymentRowActions({ pago }: { pago: PagoListItem }) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [estado, setEstado] = React.useState<Estado>(pago.estado)
  const [isProcessing, setIsProcessing] = React.useState(false)
  //nuevo estado para saber si se esta eliminando
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function handleClose() {
    setIsEditOpen(false)
    setEstado(pago.estado)
    setError(null)
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar el pago de ${pago.numero ?? "esta reserva"}?`,
    )
    if (!confirmed) return

     //nuevo activar/desactivar el loading alrededor del delete
    setIsDeleting(true)
    const result = await deletePagoAction(pago.id)
    if (!result.ok) {
      alert(result.error)
      return
    }
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsProcessing(true)
    const result = await updatePagoEstadoAction(pago.id, estado)
    setIsProcessing(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setIsEditOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Editar estado del pago"
          onClick={() => setIsEditOpen(true)}
        >
          <HugeiconsIcon
            icon={Edit01Icon}
            strokeWidth={1.5}
            className="size-4"
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Eliminar pago"
          onClick={handleDelete}
        >
          <HugeiconsIcon
            icon={Delete01Icon}
            strokeWidth={1.5}
            className="size-4"
          />
        </Button>
      </div>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) handleClose()
          else setIsEditOpen(true)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar estado del pago</DialogTitle>
            <DialogDescription>
              {pago.numero ?? "Reserva"} ·{" "}
              {pago.vehicle_label ?? "Vehículo"} ·{" "}
              {formatCurrency(pago.monto)} · {pago.metodo_pago}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Estado</Label>
              <Select
                value={estado}
                onValueChange={(v) => setEstado(v as Estado)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e} value={e}>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[e]}`}
                      >
                        {e}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cambiar a <strong>completado</strong> promoverá la reserva a
                Confirmada si está pendiente.
              </p>
            </div>

            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}

            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline" className="rounded-full" />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                type="submit"
                variant="default"
                disabled={isProcessing}
                className="rounded-full"
              >
                {isProcessing ? <Spinner /> : null}
                {isProcessing ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================================================
// Re-exports for the page
// ============================================================================

export type { PagoListItem }
