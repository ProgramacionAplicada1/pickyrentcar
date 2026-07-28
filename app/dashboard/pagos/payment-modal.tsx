"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, CreditCardIcon, Wallet01Icon, BankIcon, Add01Icon, Edit01Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type PaymentMethod = "Tarjeta" | "Efectivo" | "Transferencia"


export function PaymentAction() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  
  const [vehiculos, setVehiculos] = useState<any[]>([])
  const [referencia, setReferencia] = useState("")
  const [monto, setMonto] = useState("")
  const [metodo, setMetodo] = useState<PaymentMethod>("Tarjeta")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function fetchVehiculos() {
      const supabase = createClient()
      const { data } = await supabase
        .from("vehicles")
        .select("plate, brand, model, status")
        .order("status", { ascending: false })
      if (data) setVehiculos(data)
    }
    if (isOpen) fetchVehiculos()
  }, [isOpen])

  const onClose = () => {
    setIsOpen(false)
    setReferencia("")
    setMonto("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const supabase = createClient()
    const { error } = await supabase.from("pagos").insert({
      numero_reserva: referencia, 
      monto: Number(monto),
      metodo_pago: metodo,
      estado: "Completado"
    })

    setIsProcessing(false)

    if (error) {
      alert("Error al procesar el pago: " + error.message)
      return
    }

    alert("¡Pago registrado con éxito!")
    onClose()
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
        <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} className="mr-2" />
        Registrar Pago
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Registrar Pago</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Seleccionar Vehículo</label>
                <select required value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white">
                  <option value="" disabled>Elige el vehículo a pagar...</option>
                  {vehiculos.map((v) => (
                    <option key={v.plate} value={v.plate}>
                      {v.brand} {v.model} ({v.plate}) - {v.status === 'in_use' ? ' Reservado' : ' Disponible'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monto (DOP)</label>
                <input type="number" required min="1" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Tarjeta", "Efectivo", "Transferencia"] as PaymentMethod[]).map((m) => (
                    <button key={m} type="button" onClick={() => setMetodo(m)} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${metodo === m ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {m === "Tarjeta" && <HugeiconsIcon icon={CreditCardIcon} />}
                      {m === "Efectivo" && <HugeiconsIcon icon={Wallet01Icon} />}
                      {m === "Transferencia" && <HugeiconsIcon icon={BankIcon} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 rounded-full border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isProcessing || vehiculos.length === 0} className="flex-1 rounded-full bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {isProcessing ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}


export function PaymentRowActions({ pago }: { pago: any }) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  const [vehiculos, setVehiculos] = useState<any[]>([])
  const [referencia, setReferencia] = useState(pago.numero_reserva)
  const [monto, setMonto] = useState(pago.monto.toString())
  const [metodo, setMetodo] = useState<PaymentMethod>(pago.metodo_pago)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function fetchVehiculos() {
      const supabase = createClient()
      const { data } = await supabase.from("vehicles").select("plate, brand, model, status")
      if (data) setVehiculos(data)
    }
    if (isEditOpen) fetchVehiculos()
  }, [isEditOpen])

  const handleDelete = async () => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el pago de la reserva ${pago.numero_reserva}?`)
    if (!confirmar) return

    const supabase = createClient()
    const { error } = await supabase.from("pagos").delete().eq("id", pago.id)

    if (error) {
      alert("Error al eliminar: " + error.message)
      return
    }
    router.refresh()
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const supabase = createClient()
    const { error } = await supabase.from("pagos").update({
      numero_reserva: referencia,
      monto: Number(monto),
      metodo_pago: metodo,
    }).eq("id", pago.id)

    setIsProcessing(false)

    if (error) {
      alert("Error al actualizar: " + error.message)
      return
    }

    alert("¡Pago actualizado correctamente!")
    setIsEditOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsEditOpen(true)} className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600" title="Editar pago">
          <HugeiconsIcon icon={Edit01Icon} strokeWidth={1.5} className="size-4" />
        </button>
        <button onClick={handleDelete} className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Eliminar pago">
          <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.5} className="size-4" />
        </button>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Editar Pago</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-700">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 text-left">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Vehículo / Reserva</label>
                <select required value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white">
                  <option value={pago.numero_reserva}>{pago.numero_reserva} (Actual)</option>
                  {vehiculos.map((v) => (
                    <option key={v.plate} value={v.plate}>{v.brand} {v.model} ({v.plate})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monto (DOP)</label>
                <input type="number" required min="1" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Tarjeta", "Efectivo", "Transferencia"] as PaymentMethod[]).map((m) => (
                    <button key={m} type="button" onClick={() => setMetodo(m)} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${metodo === m ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {m === "Tarjeta" && <HugeiconsIcon icon={CreditCardIcon} />}
                      {m === "Efectivo" && <HugeiconsIcon icon={Wallet01Icon} />}
                      {m === "Transferencia" && <HugeiconsIcon icon={BankIcon} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 rounded-full border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isProcessing} className="flex-1 rounded-full bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {isProcessing ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}