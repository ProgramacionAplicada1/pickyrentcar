# 🚗 PickyRentCar


>  Proyecto en desarrollo activo. Este README se ira actualizando conforme avance la implementacion.

---

##  Tabla de contenido

- [Descripcion del proyecto](#-descripcion-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Requisitos previos](#-requisitos-previos)
- [Instalacion y configuración](#-instalación-y-configuracion)
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

- Configuracion inicial del proyecto con Next.js.
- Integracion con Supabase.
- Configuracion del entorno de desarrollo.
- Inicio de sesion.
- Despliegue automatico mediante Vercel.
- Pantalla con siderBar.

### En desarrollo

- Catalogo de vehiculos disponibles.
- Busqueda y filtrado de vehiculos por categoría, marca, precio y disponibilidad.
- Visualizacion del detalle de cada vehiculo (imagenes, especificaciones y precio por día).
- Sistema de reservas de vehiculos.
- Gestion de disponibilidad de vehiculos.
- Historial de reservas de los usuarios.
- Panel de administracion.
- Gestion de vehículos (crear, editar, eliminar y listar).
- Gestion de usuarios y clientes.
- Reportes basicos de alquileres y reservas.
- Edicion del perfil de usuario.



---

## 🛠️ Tecnologias utilizadas

| Categoria | Tecnologia |
|---|---|
| Framework Frontend/Backend | [Next.js](https://nextjs.org/) (App Router) |
| Lenguaje | TypeScript |
| Base de datos y backend | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage) |
| Autenticacion | [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) (clientes browser/server + middleware) |
| Componentes UI | [shadcn/ui](https://ui.shadcn.com/) |
| Estilos | Tailwind CSS |
| Linter | ESLint |
| Control de versiones | Git & GitHub |
| Editor | Visual Studio Code |
| Despliegue | [Vercel](https://vercel.com/) |

---

##  Requisitos previos

Para ejecutar **PickyRentCar** en un entorno local, asegurate de cumplir con los siguientes requisitos:

- **Node.js** (versión 18 o superior).
- **npm** (incluido con Node.js).
- **Git** para clonar el repositorio.
- **Visual Studio Code**.
- Una cuenta de **Supabase** con un proyecto configurado.
- Las variables de entorno del proyecto correctamente definidas.

> **Nota:** Vercel solo es necesario si deseas desplegar la aplicacion en produccion.
---

## ⚙️ Instalacion y configuracion

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/usuario/pickyrentcar.git
   cd pickyrentcar
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno**

   Crea un archivo `.env.local` en la raiz del proyecto (ver seccion [Variables de entorno](#-variables-de-entorno)).

4. **Ejecutar el proyecto en modo desarrollo**
   ```bash
   npm run dev
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
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
```



---

## 📁 Estructura del proyecto

```
pickyrentcar/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # Route Handler: callback de autenticacion (OAuth)
│   ├── dashboard/
│   │   └── page.tsx            # Panel de administracion
│   ├── login/
│   │   └── page.tsx            # Página de inicio de sesion
│   ├── register/
│   │   └── page.tsx            # Página de registro de usuarios
│   ├── favicon.ico
│   ├── globals.css             # Estilos globales
│   ├── layout.tsx              # Layout raiz de la aplicación
│   └── page.tsx                # Pagina principal
├── components/
│   ├── icons/
│   │   └── google-icon.tsx     # Icono de Google (SVG)
│   ├── ui/                     # Componentes base de shadcn/ui
│   ├── google-signin-button.tsx # Boton de inicio de sesion con Google
│   ├── login-form.tsx          # Formulario de inicio de sesion
│   └── register-form.tsx       # Formulario de registro
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente de Supabase para el navegador
│   │   ├── server.ts           # Cliente de Supabase para Server Components
│   │   └── middleware.ts       # Logica de refresco de sesion (updateSession)
│   └── utils.ts                # Helper cn() para clases de Tailwind
├── public/                     # Archivos estaticos (imagenes, iconos, logo)
├── .env.local                  # Variables de entorno (no se sube al repo)
├── .gitignore
├── components.json             # Configuracion de shadcn/ui
├── eslint.config.mjs           # Configuracion de ESLint
├── next.config.ts              # Configuracion de Next.js
├── postcss.config.mjs          # Configuracion de PostCSS/Tailwind
├── proxy.ts                    # Middleware: refresca la sesion en cada request
├── tsconfig.json                # Configuracion de TypeScript
├── package.json
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

---

##  Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la build de produccion |
| `npm run start` | Inicia la aplicacion en modo produccion |
| `npm run lint` | Ejecuta el linter para revisar el codigo |

---

## 🚀 Despliegue

El proyecto esta desplegado en **Vercel**. Cada vez que se realiza un `push` a la rama `main`, en Vercel generara automaticamente un nuevo despliegue.

🔗 Demo: `[https://pickyrentcar-tau.vercel.app/]`

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

