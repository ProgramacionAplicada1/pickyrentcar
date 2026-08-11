import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  FiCalendar,
  FiHeart,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientProfileForm } from "@/components/client-profile-form"
import { ChangePasswordForm } from "@/components/change-password-form"
import { getCurrentUser } from "@/services/auth"
import { getClientProfile } from "@/services/profile"
import { getFavoriteVehicleIds } from "@/services/favorites"

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Administra los datos de tu cuenta de PickyRentCar.",
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) redirect("/login?next=/perfil")
  if (user.role === "admin") redirect("/dashboard/configuracion")

  const [profile, favoriteIds] = await Promise.all([
    getClientProfile(user.id),
    getFavoriteVehicleIds(),
  ])
  if (!profile) redirect("/catalogo")

  return (
    <section className="flex-1 bg-muted/20 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">Mi cuenta</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mi perfil</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Mantén actualizados tus datos personales y la seguridad de tu cuenta.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" nativeButton={false} render={<Link href="/favoritos" />}>
              <FiHeart />
              Favoritos{favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ""}
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/mis-reservas" />}>
              <FiCalendar />
              Ver mis reservas
            </Button>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <Avatar className="size-16 sm:size-20">
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary sm:text-2xl">
                {initials(profile.fullName || user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold">
                  {profile.fullName || user.displayName}
                </h2>
                <Badge variant="secondary">Cliente</Badge>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Miembro desde {formatDate(profile.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FiUser className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Información personal</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Estos datos nos ayudan a identificar y contactar al titular de la reserva.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ClientProfileForm
                  userId={user.id}
                  initialFullName={profile.fullName}
                  initialPhone={profile.phone}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FiShield className="size-5" />
                  </div>
                  <div>
                    <CardTitle>Seguridad</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Cambia la contraseña que utilizas para iniciar sesión.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de la cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-muted-foreground"><FiMail /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Correo</p>
                    <p className="mt-1 break-all text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 text-muted-foreground"><FiUser /></div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo de cuenta</p>
                    <p className="mt-1 text-sm font-medium">Cliente</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 text-muted-foreground"><FiCalendar /></div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Registro</p>
                    <p className="mt-1 text-sm font-medium">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                    <FiHeart />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Tus vehículos favoritos</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Tienes {favoriteIds.length} {favoriteIds.length === 1 ? "vehículo guardado" : "vehículos guardados"}. Compáralos y reserva cuando estés listo.
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0"
                      nativeButton={false}
                      render={<Link href="/favoritos" />}
                    >
                      Ver favoritos →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Tus reservas en un solo lugar</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Consulta estados, fechas, vehículos y detalles de tus alquileres desde Mis reservas.
                </p>
                <Button
                  variant="link"
                  className="mt-2 h-auto p-0"
                  nativeButton={false}
                  render={<Link href="/mis-reservas" />}
                >
                  Ir a mis reservas →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
