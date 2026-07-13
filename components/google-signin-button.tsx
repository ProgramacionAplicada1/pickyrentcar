"use client"

import * as React from "react"
import { GoogleIcon } from "@/components/icons/google-icon"
import { createClient } from "@/lib/supabase/client"

export function GoogleSignInButton() {
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleGoogleSignIn() {
    setError(null)
    setIsPending(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo.")
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-input bg-input/30 px-4 text-sm font-medium text-foreground transition-colors hover:bg-input/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <GoogleIcon className="size-[18px]" />
        <span>Registrarse con Google</span>
      </button>
      {error && (
        <p className="text-center text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}