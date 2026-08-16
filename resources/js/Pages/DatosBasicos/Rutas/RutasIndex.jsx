

import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Link, Head } from "@inertiajs/react";

const modules = [
    {
        title: "INSTITUCIÓN",
        subtitle: "Identidad Legal",
        icon: "Building2",
        color: "cyan",
        route: "settings.institucion.index",
        items: ["Nombre Oficial"],
    },
    {
        title: "GRADOS",
        subtitle: "Estructura Académica",
        icon: "GraduationCap",
        color: "fuchsia",
        route: "settings.grados.index",
        items: ["Niveles, Secciones"],
    },
    {
        title: "Niveles",
        subtitle: "Estructura Sub-Académica",
        icon: "Users",
        color: "emerald",
        route: "settings.institucion.niveles",
        items: ["Subniveles"],
    },
    {
        title: "ÁREAS DE TRABAJO",
        subtitle: "Organización",
        icon: "Briefcase",
        color: "lime",
        route: "settings.areas.index",
        items: ["Departamentos, Coordinaciones"],
    },
    {
        title: "MULTIMEDIA",
        subtitle: "Imagen y Sellos",
        icon: "Image",
        color: "rose",
        route: "settings.logos.index",
        items: ["Logos, Sellos Firmas Digitales"],
    },
    {
        title: "DÍAS FESTIVOS",
        subtitle: "Calendario Escolar",
        icon: "CalendarDays",
        color: "orange",
        route: "settings.festivos.index",
        items: ["Feriados, Eventos Cierres de Año"],
    },
    {
        title: "APRECIACIONES",
        subtitle: "Literales comunes",
        icon: "Zap",
        color: "green",
        route: "settings.apreciaciones.index",
        items: ["Calificar, Gestor Edicion"],
    },

    {
        title: "Inmuebles",
        subtitle: "Inventario",
        icon: "BarChart3",
        color: "rose",
        route: "settings.institucion.inmuebles.index",
        items: ["Inventario general"],
    },
];

// Definir estilos completos para cada color
const neonStyles = {
    cyan: {
        border: "border-cyan-500",
        shadow: "shadow-cyan-500/20",
        text: "text-cyan-500",
        bg: "bg-cyan-500",
        hoverShadow: "hover:shadow-cyan-500/40",
        from: "from-cyan-500/10",
        to: "to-cyan-500/20",
        bgLight: "bg-cyan-50/30",
        buttonHover: "group-hover:bg-cyan-500",
    },
    emerald: {
        border: "border-emerald-500",
        shadow: "shadow-emerald-500/20",
        text: "text-emerald-500",
        bg: "bg-emerald-500",
        hoverShadow: "hover:shadow-emerald-500/40",
        from: "from-emerald-500/10",
        to: "to-emerald-500/20",
        bgLight: "bg-emerald-50/30",
        buttonHover: "group-hover:bg-emerald-500",
    },
    orange: {
        border: "border-orange-500",
        shadow: "shadow-orange-500/20",
        text: "text-orange-500",
        bg: "bg-orange-500",
        hoverShadow: "hover:shadow-orange-500/40",
        from: "from-orange-500/10",
        to: "to-orange-500/20",
        bgLight: "bg-orange-50/30",
        buttonHover: "group-hover:bg-orange-500",
    },
    red: {
        border: "border-red-500",
        shadow: "shadow-red-500/20",
        text: "text-red-500",
        bg: "bg-red-500",
        hoverShadow: "hover:shadow-red-500/40",
        from: "from-red-500/10",
        to: "to-red-500/20",
        bgLight: "bg-red-50/30",
        buttonHover: "group-hover:bg-red-500",
    },
    fuchsia: {
        border: "border-fuchsia-500",
        shadow: "shadow-fuchsia-500/20",
        text: "text-fuchsia-500",
        bg: "bg-fuchsia-500",
        hoverShadow: "hover:shadow-fuchsia-500/40",
        from: "from-fuchsia-500/10",
        to: "to-fuchsia-500/20",
        bgLight: "bg-fuchsia-50/30",
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
        bgLight: "bg-lime-50/30",
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
        bgLight: "bg-rose-50/30",
        buttonHover: "group-hover:bg-rose-500",
    },
    blue: {
        border: "border-blue-500",
        shadow: "shadow-blue-500/20",
        text: "text-blue-500",
        bg: "bg-blue-500",
        hoverShadow: "hover:shadow-blue-500/40",
        from: "from-blue-500/10",
        to: "to-blue-500/20",
        bgLight: "bg-blue-50/30",
        buttonHover: "group-hover:bg-blue-500",
    },
};

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Empleados" />

            <ViewContainer
                title="Datos Básicos"
                subtitle="Configuraciones y control de acciones"
                icon="Cog"
                showSearch={false}
            >
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full max-h-[650px]">
                    {modules.map((mod, idx) => {
                        const IconComponent = Icons[mod.icon];
                        const style = neonStyles[mod.color] || neonStyles.blue;

                        if (!IconComponent) {
                            console.warn(`Icono "${mod.icon}" no encontrado`);
                            return null;
                        }

                        return (
                            <Link
                                key={idx}
                                href={route(mod.route)}
                                className="group h-full"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: idx * 0.05,
                                        type: "spring",
                                        stiffness: 100,
                                    }}
                                    whileHover={{ y: -8 }}
                                    className={`relative h-full flex flex-col items-center justify-center bg-white border-b-[4px] ${style.border} rounded-2xl p-4 shadow-xl transition-all duration-300 overflow-hidden cursor-pointer active:scale-95`}
                                >
                                    {/* Resplandor de fondo al hacer hover */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-b ${style.from} ${style.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                    />

                                    {/* Icono */}
                                    <div className="relative z-10 mb-2">
                                        <div
                                            className={`p-3 rounded-2xl text-white shadow-lg ${style.bg} ${style.shadow} ${style.hoverShadow}`}
                                        >
                                            <IconComponent
                                                size={28}
                                                strokeWidth={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Textos */}
                                    <div className="text-center relative z-10">
                                        <h3 className="text-[14px] font-black text-gray-800 tracking-tighter uppercase group-hover:text-black transition-colors">
                                            {mod.title}
                                        </h3>
                                        <p
                                            className={`text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 ${style.text}`}
                                        >
                                            {mod.subtitle}
                                        </p>
                                    </div>

                                    {/* Items */}
                                    <div className="flex-1 space-y-2.5 mt-6 relative z-10">
                                        {mod.items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-gray-50/80 border-l-4 border-gray-200 group-hover:border-current group-hover:bg-white py-2.5 px-4 rounded-xl text-[9px] font-bold text-gray-900 group-hover:text-gray-600 uppercase italic tracking-tight transition-all duration-300"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botón */}
                                    <div
                                        className={`relative z-10 mt-3 w-full py-2.5 rounded-xl text-[8px] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all duration-300 
                                            bg-gray-900 text-white ${style.buttonHover} group-hover:shadow-lg group-hover:scale-105`}
                                    >
                                        ENTRAR
                                        <Icons.Zap
                                            size={12}
                                            className="fill-current"
                                        />
                                    </div>

                                    {/* Adorno visual de luz */}
                                    <div
                                        className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl transition-all 
                                            bg-gradient-to-b ${style.from} ${style.to} opacity-0 group-hover:opacity-100`}
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
