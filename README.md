# 🚗 PickyRentCar


>  Proyecto en desarrollo activo. Este README se ira actualizando conforme avance la implementación.

---

##  Tabla de contenido

- [Descripcion del proyecto](#-descripcion-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y configuración](#-instalación-y-configuracion)
- [Autenticación con Supabase](#-autenticación-con-supabase)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Scripts disponibles](#-scripts-disponibles)
- [Despliegue](#-despliegue)
- [Equipo](#-equipo)


---

##  Descripcion del proyecto

Sistema web de alquiler de vehiculos (rent a car) desarrollado como proyecto para la clase de **Programacion Aplicada 1**.

**PickyRentCar** es una plataforma web que digitaliza el proceso de alquiler de vehiculos, permitiendo a los clientes buscar, comparar y reservar autos disponibles segun sus necesidades (fechas, tipo de vehículo, precio, etc.), y a los administradores llevar el control del inventario, disponibilidad y reservas desde un panel administrativo.

El proyecto busca aplicar los conocimientos adquiridos en la asignatura mediante el desarrollo de una aplicación full-stack real, integrando autenticacion, base de datos, y despliegue en la nube.

---

## ✨ Funcionalidades

### Implementadas

**Autenticación y roles**
- Dos rutas de registro separadas (`/register` admin, `/register-client` cliente) con `role` whitelisted por trigger de Supabase.
- Login unificado con redirección role-aware (admin → `/dashboard`, cliente → `next` validado o `/catalogo`).
- Refresh de sesión en cada request vía middleware (`proxy.ts`).
- Tres roles diferenciados: administrador, cliente autenticado y visitante anónimo.

**Catálogo público (accesible sin login)**
- Búsqueda por texto, filtro por rango de fechas, categoría y ordenamiento (precio/año).
- Filtro **real** por disponibilidad usando RPC `check_vehicle_availability`.
- Vista detalle con galería de hasta 5 imágenes, especificaciones y calendario interactivo (fix de zona horaria con `parseLocalDate`).

**Cliente autenticado**
- **Mis reservas**: listado y detalle de reservas propias con RLS por `client_id`.
- **Favoritos**: tabla persistente con RLS por `user_id`.
- **Perfil editable**: nombre, teléfono, avatar (column-level GRANT impide modificar `role`).
- **Cambio de contraseña** desde Supabase Auth.
- **Pago por transferencia** con datos bancarios y reporte al admin.

**Panel administrativo**
- Dashboard con saludo personalizado, fecha localizada en español y stats por estado con barras de progreso.
- CRUD completo de vehículos con hasta 5 imágenes por vehículo.
- Vista grid/table, carrusel en hover, vista detalle con galería.
- Catálogo cerrado de ~83 marcas incluyendo Rolls-Royce con 30 modelos clásicos.
- Gestión de reservas con tabs por estado y drawer de detalle.
- Módulo de pagos: registro, edición y auto-promoción de reserva al completar pago.
- Dashboard de clientes: agregación por cliente (registrado/invitado, total pagado).
- Reportes: ingresos mensuales (recharts) y vehículos más rentados.
- Configuración: persistencia real del nombre admin + cambio de contraseña.

**Plataforma**
- Despliegue automático en Vercel con 23 rutas server-rendered.
- Subida directa de imágenes cliente → Storage con barra de progreso real (XHR + `upload.onprogress`).
- Botones "Volver" con historial del navegador (`router.back()` cuando aplica).
- Multi-tenant seguro: cada admin solo ve sus vehículos y reservas (RLS `auth.uid() = created_by`).

### En desarrollo

- Método de pago **Efectivo** (UI lista, falta server action).
- Datos bancarios reales en `/pagar/transferencia` (actualmente placeholder).
- Limpieza periódica de archivos huérfanos en Storage vía pg_cron.
- Flujo de reserva por pasos con recogida, devolución y extras.
- Notificaciones por email al crear reserva (Resend/SES).
- Integración con pasarela de pago real (Stripe/LibrePay) — opcional.



---

## 🛠️ Tecnologias utilizadas

| Categoria | Tecnologia | Versión |
|---|---|---|
| Framework Frontend/Backend | [Next.js](https://nextjs.org/) (App Router, dev con `--webpack`) | 16.2.10 |
| UI | [React](https://react.dev/) | 19.2.4 |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) (strict mode) | 5.x |
| Estilos | [Tailwind CSS](https://tailwindcss.com/) | v4 |
| Componentes | [shadcn/ui](https://ui.shadcn.com/) (style: `base-maia`) + @base-ui/react | 1.6.0 |
| Iconos | [Hugeicons](https://hugeicons.com/) + react-icons (Fa/Fi) | 4.2.2 / 5.7.0 |
| Fuentes | Geist + Geist Mono + Figtree | — |
| Base de datos y backend | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage) | — |
| Autenticacion | [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) + @supabase/supabase-js | 0.12.0 / 2.110.2 |
| Calendario | react-day-picker + date-fns | 10.0.1 / 4.4.0 |
| Carrusel | embla-carousel-react + embla-carousel-autoplay | 8.6.0 |
| Toasts | [sonner](https://sonner.emilkowal.ski/) | 2.0.7 |
| Gráficos | [recharts](https://recharts.org/) | 3.10.1 |
| Tema | next-themes | 0.4.6 |
| Gestor de paquetes | npm / pnpm | — |
| Linter | ESLint + eslint-config-next | 9 / 16.2.10 |
| Build target | [Vercel](https://vercel.com/) | — |

---

##  Requisitos previos

Para ejecutar **PickyRentCar** en un entorno local, asegurate de cumplir con los siguientes requisitos:

- **Node.js** versión 20 o superior (requerido por Next.js 16).
- **npm** (incluido con Node.js) o **pnpm** como gestor de paquetes alternativo.
- **Git** para clonar el repositorio.
- **Visual Studio Code**.
- Una cuenta de **Supabase** con un proyecto configurado.
- Las variables de entorno del proyecto correctamente definidas.

> **Nota:** Vercel solo es necesario si deseas desplegar la aplicacion en produccion.
---

## ⚙️ Instalación y configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/usuario/pickyrentcar.git
   cd pickyrentcar
   ```

2. **Instalar dependencias** (con npm o pnpm, ambos funcionan)
   ```bash
   npm install
   # o equivalentemente:
   pnpm install
   ```

3. **Configurar las variables de entorno**

   Crea un archivo `.env.local` en la raiz del proyecto (ver seccion [Variables de entorno](#-variables-de-entorno)).

4. **Ejecutar el proyecto en modo desarrollo**
   ```bash
   npm run dev
   # o equivalentemente:
   pnpm dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicacion.

---

## 🔑 Autenticacion con Supabase

El proyecto usa el paquete `@supabase/ssr` con tres clientes distintos, cada uno pensado para un contexto de ejecución diferente dentro de Next.js:

| Archivo | Contexto | Proposito |
|---|---|---|
| `lib/supabase/client.ts` | Client Components (navegador) | Crea el cliente con `createBrowserClient` para usarlo en componentes que corren en el navegador. |
| `lib/supabase/server.ts` | Server Components / Route Handlers | Crea el cliente con `createServerClient`, leyendo y escribiendo las cookies de sesión mediante `cookies()` de `next/headers`. |
| `lib/supabase/middleware.ts` | Middleware (`proxy.ts`) | Expone `updateSession()`, que refresca el usuario autenticado (`supabase.auth.getUser()`) y sincroniza las cookies de sesión en cada request. |

`proxy.ts`, en la raiz del proyecto, es el middleware de Next.js: llama a `updateSession()` en cada request que coincida con el `matcher` configurado (todas las rutas excepto assets estaticos, imagenes y `favicon.ico`). Esto mantiene la sesion del usuario siempre actualizada antes de que la peticion llegue a cualquier pagina o Route Handler.

Ademas, `lib/utils.ts` incluye el helper `cn()` (combinacion de `clsx` + `tailwind-merge`), usado por los componentes de shadcn/ui para combinar clases de Tailwind de forma segura.

---
## 🔐 Variables de entorno

 Archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

> **Nota:** No se requiere `SUPABASE_SERVICE_ROLE_KEY`. El catálogo público usa RPCs con `SECURITY DEFINER` (migración `004`) que bypasean RLS sin necesidad de la clave de servicio. Mantener la clave fuera del cliente es una decisión de seguridad deliberada.



---

## 📁 Estructura del proyecto

```
pickyrentcar/
├── app/                              # Rutas de Next.js App Router
│   ├── (public)/                     # Grupo de rutas sin auth (anon puede entrar)
│   │   ├── catalogo/                 # Catálogo público + detalle + reserva + gracias
│   │   │   ├── [vehicleId]/          # Detalle público + galería + calendario
│   │   │   │   └── reservar/         # Server action de reserva
│   │   │   └── gracias/              # Confirmación post-reserva
│   │   ├── favoritos/                # Favoritos del cliente autenticado
│   │   ├── mis-reservas/             # Reservas propias + flujo de pago
│   │   │   └── [id]/pagar/           # Pago por transferencia (transferencia/)
│   │   └── perfil/                   # Perfil editable + cambio de contraseña
│   ├── api/                          # Route Handlers
│   │   ├── pagos/reservations/       # Lista reservas pendientes de pago
│   │   └── storage/cleanup/          # Limpia archivos huérfanos vía sendBeacon
│   ├── auth/callback/                # OAuth code exchange
│   ├── dashboard/                    # Panel administrativo (auth guard)
│   │   ├── clientes/                 # Agregación de clientes del admin
│   │   ├── configuracion/            # Perfil admin + cambio de contraseña
│   │   ├── pagos/                    # Módulo de pagos + payment-modal
│   │   ├── reportes/                 # Ingresos mensuales + vehículos más rentados
│   │   ├── reservas/                 # Tabs por estado + drawer de detalle
│   │   │   ├── components/           # cards/, drawer/, layout/
│   │   │   ├── data/                 # mockReservations (legacy)
│   │   │   └── lib/                  # adapter
│   │   └── vehicles/                 # CRUD completo con upload de imágenes
│   │       ├── [id]/                 # Detalle + edición
│   │       └── new/                  # Crear vehículo
│   ├── login/                        # Login unificado role-aware
│   ├── register/                     # Registro admin
│   ├── register-client/              # Registro cliente
│   ├── globals.css                   # Tema oklch + tokens shadcn
│   ├── layout.tsx                    # RootLayout con fuentes + Toaster
│   └── page.tsx                      # Landing page pública
├── components/
│   ├── ui/                           # Componentes base de shadcn/ui (button, dialog, etc.)
│   ├── vehicles/                     # UI específica de vehículos (upload, cards, gallery)
│   ├── public/                       # Componentes del catálogo público
│   ├── clientes/                     # Dashboard de clientes (Clientes, TablaCliente, etc.)
│   ├── reportes/                     # Charts de reportes (grafico-ingresos, vehiculos-mas-rentados)
│   ├── icons/                        # Iconos SVG inline
│   ├── app-sidebar.tsx               # Sidebar del dashboard
│   ├── site-header.tsx               # Header del dashboard
│   ├── register-form.tsx             # Registro admin
│   ├── login-form.tsx                # Login
│   ├── client-register-form.tsx      # Registro cliente
│   ├── client-profile-form.tsx       # Edición de perfil
│   ├── change-password-form.tsx      # Cambio de contraseña
│   ├── google-signin-button.tsx      # OAuth Google
│   ├── logout-dialog-button.tsx      # Confirmación de logout
│   ├── public-user-menu.tsx          # DropdownMenu del header público (cliente)
│   └── public-footer.tsx             # Footer público
├── lib/
│   ├── supabase/                     # Clientes Supabase (browser/server/middleware)
│   ├── storage/                      # Upload directo cliente → Storage (upload-client.ts)
│   ├── utils/                        # Helpers (formatCurrency)
│   ├── utils.ts                      # Helper cn()
│   └── vehicles/                     # Catálogo cerrado (~83 marcas, modelos Rolls-Royce)
├── services/                         # Lógica de negocio separada de pages
│   ├── auth.ts                       # getCurrentUser() con React.cache()
│   ├── vehicles.ts                   # CRUD + getMostRentedVehicles
│   ├── reservations.ts               # Stats payment-aware
│   ├── catalog.ts                    # RPCs públicos + createPublicReservation
│   ├── clients.ts                    # getClientsByOwner (agregación)
│   ├── favorites.ts                  # getFavoriteVehicleIds
│   ├── my-reservations.ts            # Reservas del cliente autenticado
│   ├── profile.ts                    # getClientProfile
│   └── payments.ts                   # Auto-promoción de reserva al completar pago
├── supabase/
│   └── migrations/                   # 15 migraciones SQL idempotentes (000-015)
├── public/                           # Assets estáticos (logos, hero images)
├── proxy.ts                          # Middleware Next.js 16 (refresh de sesión)
├── next.config.ts                    # Config de Next.js + remotePatterns
├── tsconfig.json                     # Excluye public/ del typecheck
├── components.json                   # shadcn/ui (base-maia, iconLibrary: hugeicons)
├── package.json                      # Scripts con npm/pnpm
└── README.md
```

---

##  Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` / `pnpm dev` | Inicia el servidor de desarrollo |
| `npm run build` / `pnpm build` | Genera la build de producción |
| `npm run start` / `pnpm start` | Inicia la aplicación en modo producción |
| `npm run lint` / `pnpm lint` | Ejecuta el linter para revisar el código |

---

## 🚀 Despliegue

El proyecto esta desplegado en **Vercel**. Cada vez que se realiza un `push` a la rama `main`, en Vercel generara automaticamente un nuevo despliegue.

🔗 Demo: <https://pickyrentcar-tau.vercel.app/>

Para desplegar manualmente:
1. Conecta el repositorio de GitHub con tu cuenta de Vercel.
2. Configura las variables de entorno en el panel de Vercel (Project Settings > Environment Variables).
3. Vercel se encargara del build y despliegue automaticamente.

---




## 👥 Equipo

- Nathaly Vasquez
- David Yostin Brito
- Cristian Sanchez
- Lewis Rodriguez
- Raelvis Paulino
- Alexis Quezada
- Gregoriannys Rosa
- Anthony Barrera

**Proyecto academico** — Programacion Aplicada 1

