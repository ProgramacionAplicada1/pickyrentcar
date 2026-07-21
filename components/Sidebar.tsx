"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import {
    FaCar,
    FaHome,
    FaUsers,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaChartBar,
    FaCog,
    FaChevronRight,
    FaCircle,
    FaSignOutAlt,
    FaTimes,
    FaExclamationTriangle,
} from "react-icons/fa";

const menu = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: FaHome,
    },
    {
        name: "Vehículos",
        href: "/dashboard/vehiculos",
        icon: FaCar,
    },
    {
        name: "Clientes",
        href: "/dashboard/clientes",
        icon: FaUsers,
    },
    {
        name: "Reservas",
        href: "/dashboard/reservas",
        icon: FaCalendarAlt,
    },
    {
        name: "Pagos",
        href: "/dashboard/pagos",
        icon: FaMoneyBillWave,
    },
    {
        name: "Reportes",
        href: "/dashboard/reportes",
        icon: FaChartBar,
    },
    {
        name: "Configuración",
        href: "/dashboard/configuracion",
        icon: FaCog,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [loggingOut, setLoggingOut] = useState(false);
    const supabase = createClient();

    const [usuario, setUsuario] = useState<any>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const obtenerUsuario = async () => {

            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUsuario(user);

            setLoading(false);

        };

        obtenerUsuario();

    }, []);

    const nombreUsuario =
        usuario?.user_metadata?.full_name ||
        usuario?.user_metadata?.name ||
        usuario?.user_metadata?.nombre ||
        usuario?.email?.split("@")[0] ||
        "Usuario";

    const iniciales = nombreUsuario
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const cerrarSesion = async () => {
        try {
            setLoggingOut(true);

            await supabase.auth.signOut();

            router.replace("/login");
        } catch (error) {
            console.error(error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <>
            <aside className="w-72 h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col shadow-2xl border-r border-slate-800 transition-all duration-300">

                {/* Logo */}
                <div className="px-8 py-7 border-b border-slate-800">

                    <div className="flex items-center gap-3">

                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg p-2">

                            <Image
                                src="/logo-prototipo-3.svg"
                                alt="PeakyRent"
                                width={52}
                                height={52}
                                priority
                            />

                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-wide">
                                PeakyRentCar
                            </h1>

                            <p className="text-xs text-slate-400">
                                Sistema Administrativo
                            </p>
                        </div>

                    </div>

                </div>

                {/* Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">

                    <p className="px-4 mb-3 text-xs uppercase tracking-widest text-slate-500">
                        Navegación
                    </p>

                    {menu.map((item) => {
                        const Icon = item.icon;

                        const active =
                            pathname === item.href ||
                            pathname.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300

              ${active
                                        ? "bg-blue-600 shadow-lg shadow-blue-600/30"
                                        : "hover:bg-slate-800"
                                    }`}
                            >
                                <div className="flex items-center gap-4">

                                    <Icon
                                        className={`text-lg transition-all

                  ${active
                                                ? "text-white"
                                                : "text-slate-400 group-hover:text-blue-400"
                                            }`}
                                    />

                                    <span className="font-medium">
                                        {item.name}
                                    </span>

                                </div>

                                <FaChevronRight
                                    className={`text-xs transition-all

                ${active
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100"
                                        }`}
                                />

                            </Link>
                        );
                    })}
                </nav>
                <div className="px-6 pb-5">

                    <hr className="border-slate-800" />

                </div>

                {/* Footer Compacto con Usuario */}
                <div className="border-t border-slate-800 p-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-900/50 hover:bg-slate-800 p-2 transition-all duration-300 border border-transparent hover:border-slate-700">

                        <div className="flex items-center gap-3 overflow-hidden min-w-0">

                            {/* Avatar */}
                            <div className="relative w-11 h-11 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-sm shadow-md">

                                {loading ? "..." : iniciales}

                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>

                            </div>

                            {/* Datos del usuario */}
                            <div className="flex-1 min-w-0 leading-tight">

                                <h3 className="font-semibold text-sm text-white truncate">

                                    {loading ? "Cargando..." : nombreUsuario}

                                </h3>

                                <p className="text-[11px] text-slate-400 truncate mt-0.5">

                                    {loading ? "" : usuario?.email}

                                </p>

                                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider truncate mt-1">

                                    Administrador

                                </p>

                            </div>

                        </div>

                        {/* Boton cerrar sesion */}
                        <button
                            title="Cerrar sesión"
                            onClick={() => setShowLogoutModal(true)}
                            className="flex-shrink-0 p-2 text-slate-400 hover:text-red-400 transition-all duration-300 rounded-lg hover:bg-slate-900 hover:scale-110"
                        >

                            <FaSignOutAlt size={18} />

                        </button>

                    </div>
                </div>
            </aside>

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                    <div className="w-[430px] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl animate-[fadeIn_.25s_ease]">

                        <div className="flex items-center justify-between border-b border-slate-700 p-6">

                            <div className="flex items-center gap-3">

                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">

                                    <FaExclamationTriangle className="text-red-400 text-xl" />

                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-white">

                                        Cerrar sesión

                                    </h2>

                                    <p className="text-sm text-slate-400">

                                        Confirma esta acción

                                    </p>

                                </div>

                            </div>

                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="text-slate-400 hover:text-white"
                            >

                                <FaTimes />

                            </button>

                        </div>

                        <div className="p-6">

                            <p className="text-slate-300">

                                ¿Seguro que deseas cerrar tu sesión?

                            </p>

                            <p className="mt-2 text-sm text-slate-500">

                                Tendrás que volver a iniciar sesión para acceder al sistema.

                            </p>

                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-700 p-6">

                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="rounded-xl border border-slate-600 px-5 py-2 text-slate-300 hover:bg-slate-800 transition"
                            >

                                Cancelar

                            </button>

                            <button
                                onClick={cerrarSesion}
                                disabled={loggingOut}
                                className="rounded-xl bg-red-500 px-5 py-2 text-white hover:bg-red-600 transition disabled:opacity-60"
                            >

                                {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}

                            </button>

                        </div>

                    </div>

                </div>
            )}


        </>
    );
}