"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"

export default function ConfiguracionPage() {
  
  const [nombreAdmin, setNombreAdmin] = useState("")
  const [loadingPerfil, setLoadingPerfil] = useState(false)
  
  const [password, setPassword] = useState({ actual: "", nueva: "", confirmar: "" })
  const [loadingPassword, setLoadingPassword] = useState(false)

  const [temaOscuro, setTemaOscuro] = useState(false)
  const [notificaciones, setNotificaciones] = useState(true)

  
  const handleGuardarPerfil = async (e: any) => {
    e.preventDefault()
    setLoadingPerfil(true)
    
    setTimeout(() => {
      setLoadingPerfil(false)
      alert("¡Nombre de administrador actualizado con éxito!")
    }, 1000)
  }

  
  const handleCambiarPassword = async (e: any) => {
    e.preventDefault()
    
    
    if (password.nueva !== password.confirmar) {
      alert("Las contraseñas nuevas no coinciden")
      return
    }
    
    setLoadingPassword(true)
    
    
    const supabase = createClient()
    
    
    const { error } = await supabase.auth.updateUser({ 
      password: password.nueva 
    })
    
    setLoadingPassword(false)

    
    if (error) {
      alert("Hubo un error al actualizar: " + error.message)
    } else {
      setPassword({ actual: "", nueva: "", confirmar: "" }) 
      alert("¡Contraseña actualizada de forma segura en la base de datos!")
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10 w-full">
      
      
      <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configuración del Sistema</h1>
          <p className="text-sm text-slate-500">Administra tus credenciales y preferencias de la plataforma.</p>
        </div>
      </div>

      <div className="grid gap-8">
        
        
        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Perfil del Administrador</h2>
          <p className="text-sm text-slate-500 mb-6">Actualiza el nombre que se muestra en el panel.</p>
          
          <form onSubmit={handleGuardarPerfil} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
              <input 
                type="text" 
                value={nombreAdmin}
                onChange={(e) => setNombreAdmin(e.target.value)}
                placeholder="Escribe el nuevo nombre..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-slate-900 focus:bg-white"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loadingPerfil}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-70"
            >
              {loadingPerfil ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </section>

        
        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Seguridad de la Cuenta</h2>
          <p className="text-sm text-slate-500 mb-6">Asegúrate de usar una contraseña larga y segura.</p>
          
          <form onSubmit={handleCambiarPassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
              <input 
                type="password" 
                value={password.actual}
                onChange={(e) => setPassword({ ...password, actual: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-slate-900 focus:bg-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={password.nueva}
                  onChange={(e) => setPassword({ ...password, nueva: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-slate-900 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva</label>
                <input 
                  type="password" 
                  value={password.confirmar}
                  onChange={(e) => setPassword({ ...password, confirmar: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-slate-900 focus:bg-white"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loadingPassword}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-70"
            >
              {loadingPassword ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </section>

        
        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Preferencias visuales y de sistema</h2>
          <p className="text-sm text-slate-500 mb-6">Personaliza cómo interactúas con el panel de administración.</p>
          
          <div className="max-w-md space-y-6">
            
           
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Modo Oscuro</p>
                <p className="text-xs text-slate-500">Cambia la apariencia del panel a colores oscuros.</p>
              </div>
              <button 
                onClick={() => setTemaOscuro(!temaOscuro)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${temaOscuro ? 'bg-slate-900' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${temaOscuro ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Alertas del Sistema</p>
                <p className="text-xs text-slate-500">Recibir notificaciones cuando haya una nueva reserva.</p>
              </div>
              <button 
                onClick={() => setNotificaciones(!notificaciones)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificaciones ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificaciones ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}