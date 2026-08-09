"use client";
import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import {
    Building2,
    GraduationCap,
    Briefcase,
    Image as ImageIcon,
    CalendarDays,
    Zap,
} from "lucide-react";
import { Link, Head } from "@inertiajs/react";

// Mapeo optimizado para no perder rendimiento pero mantener los iconos
const ICON_MAP = {
    Building2: Building2,
    GraduationCap: GraduationCap,
    Briefcase: Briefcase,
    Image: ImageIcon,
    CalendarDays: CalendarDays,
    Zap: Zap,
};

const modules = [
    {
        title: "INSTITUCIÓN",
        subtitle: "Identidad Legal",
        icon: "Building2",
        color: "cyan",
        route: "settings.institucion.index",
        items: ["Nombre Oficial", "Rif / Nif / Registros", "Direcciones"],
    },
    {
        title: "GRADOS",
        subtitle: "Estructura Académica",
        icon: "GraduationCap",
        color: "fuchsia",
        route: "settings.grados.index",
        items: ["Niveles", "Secciones", "Aulas"],
    },
    {
        title: "ÁREAS DE TRABAJO",
        subtitle: "Organización",
        icon: "Briefcase",
        color: "lime",
        route: "settings.areas.index",
        items: ["Departamentos", "Coordinaciones", "Oficinas"],
    },
    {
        title: "MULTIMEDIA",
        subtitle: "Imagen y Sellos",
        icon: "Image",
        color: "rose",
        route: "settings.logos.index",
        items: ["Logos", "Sellos", "Firmas Digitales"],
    },
    {
        title: "DÍAS FESTIVOS",
        subtitle: "Calendario Escolar",
        icon: "CalendarDays",
        color: "orange",
        route: "settings.festivos.index",
        items: ["Feriados", "Eventos", "Cierres de Año"],
    },
    {
        title: "APRECIACIONES",
        subtitle: "Literales comunes",
        icon: "Zap",
        color: "green",
        route: "settings.apreciaciones.index",
        items: ["Calificar", "Gestor", "Edicion"],
    },
];

const neonStyles = {
    cyan: {
        border: "border-cyan-500",
        shadow: "shadow-cyan-500/20",
        text: "text-cyan-500",
        bg: "bg-cyan-500",
        hoverShadow: "hover:shadow-cyan-500/40",
        from: "from-cyan-500/10",
        to: "to-cyan-500/20",
        buttonHover: "group-hover:bg-cyan-500",
    },
    fuchsia: {
        border: "border-fuchsia-500",
        shadow: "shadow-fuchsia-500/20",
        text: "text-fuchsia-500",
        bg: "bg-fuchsia-500",
        hoverShadow: "hover:shadow-fuchsia-500/40",
        from: "from-fuchsia-500/10",
        to: "to-fuchsia-500/20",
        buttonHover: "group-hover:bg-fuchsia-500",
    },
    lime: {
        border: "border-lime-500",
        shadow: "shadow-lime-500/20",
        text: "text-lime-500",
        bg: "bg-lime-500",
        hoverShadow: "hover:shadow-lime-500/40",
        from: "from-lime-500/10",
        to: "to-lime-500/20",
        buttonHover: "group-hover:bg-lime-500",
    },
    rose: {
        border: "border-rose-500",
        shadow: "shadow-rose-500/20",
        text: "text-rose-500",
        bg: "bg-rose-500",
        hoverShadow: "hover:shadow-rose-500/40",
        from: "from-rose-500/10",
        to: "to-rose-500/20",
        buttonHover: "group-hover:bg-rose-500",
    },
    orange: {
        border: "border-orange-500",
        shadow: "shadow-orange-500/20",
        text: "text-orange-500",
        bg: "bg-orange-500",
        hoverShadow: "hover:shadow-orange-500/40",
        from: "from-orange-500/10",
        to: "to-orange-500/20",
        buttonHover: "group-hover:bg-orange-500",
    },

    green: {
        border: "border-green-500",
        shadow: "shadow-green-500/20",
        text: "text-green-500",
        bg: "bg-green-500",
        hoverShadow: "hover:shadow-green-500/40",
        from: "from-green-500/10",
        to: "to-green-500/20",
        buttonHover: "group-hover:bg-green-500",
    },
};

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Configuraciones Básicas" />

            <ViewContainer
                title="DATOS BÁSICOS"
                subtitle="Configuración y control los datos generales"
                icon="Settings"
                showSearch={false}
            >
                {/* 
                    AJUSTE DE GRID: Mantenemos el responsive pero aseguramos 
                    que en XL sean 5 para que se vea como en tu diseño original 
                */}
                <div className="p-1 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6 gap-2">
                    {modules.map((mod, idx) => {
                        const IconComponent = ICON_MAP[mod.icon];
                        const style = neonStyles[mod.color];

                        return (
                            <Link
                                key={idx}
                                href={route(mod.route)}
                                className="group flex"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: idx * 0.1,
                                        type: "spring",
                                        stiffness: 100,
                                    }}
                                    whileHover={{ y: -12 }}
                                    className={`relative flex-1 flex flex-col bg-white border-b-[6px] ${style.border} rounded-[2.5rem] p-7 shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer active:scale-95`}
                                >
                                    {/* Resplandor de fondo al hacer hover (RESTAURADO) */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-b ${style.from} ${style.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                    />

                                    {/* Icono Flotante Neón (RESTAURADO) */}
                                    <div className="flex justify-center mb-8 relative z-10">
                                        <div
                                            className={`p-5 rounded-3xl text-white shadow-2xl transition-all duration-500 ${style.bg} ${style.shadow} group-hover:${style.hoverShadow} group-hover:scale-110`}
                                        >
                                            <IconComponent
                                                size={34}
                                                strokeWidth={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Textos Centrales (RESTAURADO) */}
                                    <div className="text-center mb-6 relative z-10">
                                        <h3 className="text-sm font-black text-gray-800 tracking-tighter uppercase italic group-hover:text-black transition-colors">
                                            {mod.title}
                                        </h3>
                                        <p
                                            className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 ${style.text}`}
                                        >
                                            {mod.subtitle}
                                        </p>
                                    </div>

                                    {/* Lista de Items / Pildoras (RESTAURADO) */}
                                    <div className="flex-1 space-y-2.5 mb-10 relative z-10">
                                        {mod.items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-gray-50/80 border-l-4 border-gray-200 group-hover:border-current group-hover:bg-white py-2.5 px-4 rounded-xl text-[9px] font-bold text-gray-900 group-hover:text-gray-600 uppercase italic tracking-tight transition-all duration-300"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botón Inferior (RESTAURADO) */}
                                    <div
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-500 bg-gray-900 text-white ${style.buttonHover} group-hover:shadow-lg group-hover:scale-105`}
                                    >
                                        ENTRAR{" "}
                                        <Zap
                                            size={14}
                                            className="fill-current"
                                        />
                                    </div>

                                    {/* Adorno visual de luz esquina (RESTAURADO) */}
                                    <div
                                        className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl transition-all opacity-50 ${style.bg} group-hover:opacity-100`}
                                    />
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
