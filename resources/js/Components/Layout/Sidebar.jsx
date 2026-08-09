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
        border: "border-violet-400/50",
        shadow: "shadow-violet-500/30",
        glow: "shadow-[0_0_30px_rgba(139,92,246,0.3)]",
        hover: "hover:border-violet-400/30",
        text: "text-violet-400",
        light: "text-violet-300",
    },
    cyan: {
        bg: "bg-cyan-600",
        border: "border-cyan-400/50",
        shadow: "shadow-cyan-500/30",
        glow: "shadow-[0_0_30px_rgba(6,182,212,0.3)]",
        hover: "hover:border-cyan-400/30",
        text: "text-cyan-400",
        light: "text-cyan-300",
    },
    amber: {
        bg: "bg-amber-600",
        border: "border-amber-400/50",
        shadow: "shadow-amber-500/30",
        glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
        hover: "hover:border-amber-400/30",
        text: "text-amber-400",
        light: "text-amber-300",
    },
    emerald: {
        bg: "bg-emerald-600",
        border: "border-emerald-400/50",
        shadow: "shadow-emerald-500/30",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
        hover: "hover:border-emerald-400/30",
        text: "text-emerald-400",
        light: "text-emerald-300",
    },
    rose: {
        bg: "bg-rose-600",
        border: "border-rose-400/50",
        shadow: "shadow-rose-500/30",
        glow: "shadow-[0_0_30px_rgba(225,29,72,0.3)]",
        hover: "hover:border-rose-400/30",
        text: "text-rose-400",
        light: "text-rose-300",
    },
    orange: {
        bg: "bg-orange-600",
        border: "border-orange-400/50",
        shadow: "shadow-orange-500/30",
        glow: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
        hover: "hover:border-orange-400/30",
        text: "text-orange-400",
        light: "text-orange-300",
    },
    blue: {
        bg: "bg-blue-600",
        border: "border-blue-400/50",
        shadow: "shadow-blue-500/30",
        glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
        hover: "hover:border-blue-400/30",
        text: "text-blue-400",
        light: "text-blue-300",
    },
    teal: {
        bg: "bg-teal-600",
        border: "border-teal-400/50",
        shadow: "shadow-teal-500/30",
        glow: "shadow-[0_0_30px_rgba(20,184,166,0.3)]",
        hover: "hover:border-teal-400/30",
        text: "text-teal-400",
        light: "text-teal-300",
    },
    purple: {
        bg: "bg-purple-600",
        border: "border-purple-400/50",
        shadow: "shadow-purple-500/30",
        glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
        hover: "hover:border-purple-400/30",
        text: "text-purple-400",
        light: "text-purple-300",
    },
    pink: {
        bg: "bg-pink-600",
        border: "border-pink-400/50",
        shadow: "shadow-pink-500/30",
        glow: "shadow-[0_0_30px_rgba(236,72,153,0.3)]",
        hover: "hover:border-pink-400/30",
        text: "text-pink-400",
        light: "text-pink-300",
    },
    indigo: {
        bg: "bg-indigo-600",
        border: "border-indigo-400/50",
        shadow: "shadow-indigo-500/30",
        glow: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
        hover: "hover:border-indigo-400/30",
        text: "text-indigo-400",
        light: "text-indigo-300",
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
                className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-br from-[#0a0e1a] via-[#111827] to-[#0a0e1a] border-r border-white/10 flex flex-col p-4 z-50 transition-transform duration-500 transform 
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 overflow-y-auto custom-scrollbar`}
            >
                {/* LOGO con efecto neón */}
                <div className="flex-none flex items-center gap-2 mb-6 px-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-xl shadow-[0_0_35px_rgba(59,130,246,0.6)] border border-blue-400/50 relative">
                        <div className="absolute inset-0 rounded-xl bg-blue-400/20 blur-md animate-pulse"></div>
                        <Icons.GraduationCap className="text-white w-6 h-6 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-white font-black italic text-base leading-none tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            SIS ESCOLAR
                        </h1>
                        <p className="text-[8px] text-blue-400 font-mono tracking-[0.2em] mt-0.5 uppercase font-bold drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            Core Edition ✦
                        </p>
                    </div>
                </div>

                {/* NAVEGACIÓN */}
                <div className="flex-1 space-y-4">
                    {menuGroups.map((group) => (
                        <div key={group.title}>
                            <div className="flex items-center gap-2 mb-3 px-4">
                                <h2 className="text-[9px] font-black text-gray-400 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                                    {group.title}
                                </h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-1.5 space-y-1 backdrop-blur-sm">
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
                                            className={`flex items-center justify-between px-4 py-2.5 rounded-[1.2rem] transition-all duration-300 group relative overflow-hidden ${
                                                active
                                                    ? `${colors.bg} text-white ${colors.shadow} ${colors.glow} border ${colors.border}`
                                                    : `text-gray-300 hover:text-white border border-transparent hover:${colors.hover}`
                                            }`}
                                        >
                                            {/* Efecto de brillo al hover */}
                                            {!active && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                            )}

                                            {/* Punto de color decorativo */}
                                            <div
                                                className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${active ? "bg-white/60" : `${colors.text}/30`} group-hover:${colors.text}/60 transition-all duration-300`}
                                            ></div>

                                            <div className="flex items-center gap-3 relative z-10 pl-1 min-w-0">
                                                <IconComponent
                                                    className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                                                        active
                                                            ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                                            : `group-hover:${colors.text} group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]`
                                                    }`}
                                                />
                                                <span
                                                    className={`text-[9px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                                                        active
                                                            ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                                                            : `text-gray-300 group-hover:${colors.light}`
                                                    }`}
                                                >
                                                    {item.name}
                                                </span>
                                            </div>
                                            {active ? (
                                                <div className="flex items-center gap-1.5 relative z-10 flex-shrink-0">
                                                   
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                                </div>
                                            ) : (
                                                <Icons.ChevronRight
                                                    size={10}
                                                    className={`${colors.text} opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 relative z-10 flex-shrink-0`}
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer decorativo */}
                {/* <div className="flex-none mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-center gap-2 px-4">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        <span className="text-[8px] text-gray-600 tracking-[0.3em] uppercase font-mono">
                            v2.0
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                </div> */}
            </aside>
        </>
    );
}
