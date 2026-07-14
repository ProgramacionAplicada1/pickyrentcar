import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  return (
    <form className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          type="text"
          placeholder="Ingresa tu usuario"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Ingresa tu contraseña"
        />
      </div>

      <Button type="button" className="w-full">
        Iniciar sesión
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:underline"
        >
          Recuperar contraseña
        </button>

        <p className="text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </form>
  );
}