"use client";
import { Link, usePage } from "@inertiajs/react";
import * as Icons from "lucide-react";

const menuGroups = [
    {
        title: "GENERAL",
        items: [
            {
                name: "DASHBOARD",
                icon: "LayoutDashboard",
                route: "dashboard",
                activePattern: "dashboard*",
                color: "violet",
            },
            {
                name: "DATOS BÁSICOS",
                icon: "Settings",
                route: "settings.index",
                activePattern: "settings.*",
                color: "cyan",
            },
            {
                name: "ASISTENCIA Y REPORTES",
                icon: "ClipboardList",
                route: "recursos.index",
                activePattern: "recursos.*",
                color: "amber",
            },
        ],
    },
    {
        title: "PERSONAL",
        items: [
            {
                name: "EMPLEADOS ACTIVOS",
                icon: "Users",
                route: "empleados.activos.index",
                activePattern: "empleados.activos*",
                color: "emerald",
            },
            {
                name: "EMPLEADOS INACTIVOS",
                icon: "UserX",
                route: "empleados.inactivos.index",
                activePattern: "empleados.inactivos*",
                color: "rose",
            },
            {
                name: "ACCIONES GENERALES",
                icon: "FileText",
                route: "empleados.acciones.index",
                activePattern: "empleados.acciones*",
                color: "orange",
            },
        ],
    },
    {
        title: "ESTUDIANTES",
        items: [
            {
                name: "PANEL DE REGISTRO",
                icon: "GraduationCap",
                route: "estudiantes.registro.index",
                activePattern: "estudiantes.registro*",
                color: "blue",
            },
            {
                name: "ESTUDIANTES ACTIVOS",
                icon: "Users",
                route: "estudiantes.activos.index",
                activePattern: "estudiantes.activos*",
                color: "teal",
            },
            {
                name: "ESTUDIANTES INACTIVOS",
                icon: "UserMinus",
                route: "estudiantes.inactivos.index",
                activePattern: "estudiantes.inactivos*",
                color: "purple",
            },
            {
                name: "ACCIONES GENERALES",
                icon: "FileStack",
                route: "estudiantes.acciones.index",
                activePattern: "estudiantes.acciones*",
                color: "pink",
            },
            {
                name: "GESTIÓN DE IMPRESIONES",
                icon: "Printer",
                route: "estudiantes.impresiones.index",
                activePattern: "estudiantes.impresiones*",
                color: "indigo",
            },
        ],
    },
];

const colorMap = {
    violet: {
        bg: "bg-violet-600",
        border: "border-violet-500",
        text: "text-violet-400",
        light: "text-violet-300",
        hover: "hover:bg-violet-600/10",
        borderHover: "hover:border-violet-400",
    },
    cyan: {
        bg: "bg-cyan-600",
        border: "border-cyan-500",
        text: "text-cyan-400",
        light: "text-cyan-300",
        hover: "hover:bg-cyan-600/10",
        borderHover: "hover:border-cyan-400",
    },
    amber: {
        bg: "bg-amber-600",
        border: "border-amber-500",
        text: "text-amber-400",
        light: "text-amber-300",
        hover: "hover:bg-amber-600/10",
        borderHover: "hover:border-amber-400",
    },
    emerald: {
        bg: "bg-emerald-600",
        border: "border-emerald-500",
        text: "text-emerald-400",
        light: "text-emerald-300",
        hover: "hover:bg-emerald-600/10",
        borderHover: "hover:border-emerald-400",
    },
    rose: {
        bg: "bg-rose-600",
        border: "border-rose-500",
        text: "text-rose-400",
        light: "text-rose-300",
        hover: "hover:bg-rose-600/10",
        borderHover: "hover:border-rose-400",
    },
    orange: {
        bg: "bg-orange-600",
        border: "border-orange-500",
        text: "text-orange-400",
        light: "text-orange-300",
        hover: "hover:bg-orange-600/10",
        borderHover: "hover:border-orange-400",
    },
    blue: {
        bg: "bg-blue-600",
        border: "border-blue-500",
        text: "text-blue-400",
        light: "text-blue-300",
        hover: "hover:bg-blue-600/10",
        borderHover: "hover:border-blue-400",
    },
    teal: {
        bg: "bg-teal-600",
        border: "border-teal-500",
        text: "text-teal-400",
        light: "text-teal-300",
        hover: "hover:bg-teal-600/10",
        borderHover: "hover:border-teal-400",
    },
    purple: {
        bg: "bg-purple-600",
        border: "border-purple-500",
        text: "text-purple-400",
        light: "text-purple-300",
        hover: "hover:bg-purple-600/10",
        borderHover: "hover:border-purple-400",
    },
    pink: {
        bg: "bg-pink-600",
        border: "border-pink-500",
        text: "text-pink-400",
        light: "text-pink-300",
        hover: "hover:bg-pink-600/10",
        borderHover: "hover:border-pink-400",
    },
    indigo: {
        bg: "bg-indigo-600",
        border: "border-indigo-500",
        text: "text-indigo-400",
        light: "text-indigo-300",
        hover: "hover:bg-indigo-600/10",
        borderHover: "hover:border-indigo-400",
    },
};

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
    const { url } = usePage();

    const isRouteActive = (item) => {
        try {
            return (
                route().current(item.route) ||
                route().current(item.activePattern)
            );
        } catch (e) {
            return url.startsWith("/" + item.route.split(".")[0]);
        }
    };

    return (
        <>
            {/* Overlay para móviles */}
            <div
                className={`fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-500 ${
                    isMobileOpen
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-br from-[#0a0e1a] via-[#111827] to-[#0a0e1a] border-r-2 border-white/10 flex flex-col p-4 z-50 transition-transform duration-500 transform 
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 overflow-hidden`}
            >
                {/* LOGO */}
                <div className="flex-none flex items-center gap-2 mb-6 px-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-xl border border-blue-400/30">
                        <Icons.GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-white font-black italic text-base leading-none tracking-tighter uppercase">
                            SIS ESCOLAR
                        </h1>
                        <p className="text-[8px] text-blue-400 font-mono tracking-[0.2em] mt-0.5 uppercase font-bold">
                            Core Edition ✦
                        </p>
                    </div>
                </div>

                {/* NAVEGACIÓN - Sin scroll */}
                <div className="flex-1 space-y-4 overflow-hidden">
                    {menuGroups.map((group) => (
                        <div key={group.title}>
                            <div className="flex items-center gap-2 mb-3 px-4">
                                <h2 className="text-[9px] font-black text-gray-400 tracking-[0.2em] uppercase">
                                    {group.title}
                                </h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-1.5 space-y-1">
                                {group.items.map((item) => {
                                    const active = isRouteActive(item);
                                    const IconComponent =
                                        Icons[item.icon] || Icons.HelpCircle;
                                    const colors =
                                        colorMap[item.color] || colorMap.blue;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={route(item.route)}
                                            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-[1.2rem] transition-all duration-200 ${
                                                active
                                                    ? `${colors.bg} text-white shadow-lg shadow-${item.color}-500/20`
                                                    : `text-gray-300 hover:text-white ${colors.hover}`
                                            }`}
                                        >
                                            {/* BORDE IZQUIERDO GRUESO COMO DOBLE - El efecto principal */}
                                            <div
                                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r transition-all duration-200 ${
                                                    active
                                                        ? `bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]`
                                                        : `bg-transparent group-hover:${colors.border}`
                                                }`}
                                            ></div>

                                            {/* Segundo borde para efecto "doble" */}
                                            <div
                                                className={`absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r transition-all duration-200 ${
                                                    active
                                                        ? `bg-white/30`
                                                        : `bg-transparent group-hover:${colors.border}/30`
                                                }`}
                                            ></div>

                                            <IconComponent
                                                className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                                                    active
                                                        ? "text-white"
                                                        : `text-gray-400 group-hover:${colors.text}`
                                                }`}
                                            />
                                            <span
                                                className={`text-[9px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-200 ${
                                                    active
                                                        ? "text-white"
                                                        : `text-gray-300 group-hover:${colors.light}`
                                                }`}
                                            >
                                                {item.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                
            </aside>
        </>
    );
}
