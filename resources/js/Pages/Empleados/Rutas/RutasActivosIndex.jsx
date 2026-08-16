import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Link, Head } from "@inertiajs/react";

const modules = [
    {
        title: "CARTAS DE ACEPTACIÓN",
        subtitle: "Gestión de ingresos y documentos",
        icon: "UserCheck",
        color: "cyan",
        route: "empleados.activos.carta.aceptacion.index",
        items: [
            "Emisión de Cartas",
            "Control de Aceptación",
            "Historial de Ingresos",
        ],
    },
    {
        title: "LISTADO GENERAL EMPLEADOS",
        subtitle: "Registro y control de personal",
        icon: "List",
        color: "fuchsia",
        route: "empleados.activos.listado.index", // Ajustado para ser consistente
        items: [
            "Fichas Técnicas",
            "Directorio de Personal",
            "Control de Permisos",
        ],
    },
    {
        title: "CONTROL DE NOTIFICACIONES",
        subtitle: "Reportes y alertas automatizadas",
        icon: "MessageSquareText",
        color: "lime",
        route: "empleados.activos.notificaciones.index",
        items: [
            "Envío Automatizado",
            "Alertas de Inasistencias",
            "Resumen por Cargo",
        ],
    },

    {
        title: "CENTRO DE IMPRESIONES",
        subtitle: "Documentaciones, clasificaciones",
        icon: "FileSpreadsheet",
        color: "rose",
        route: "empleados.activos.centro.impresiones",
        items: ["Impresión de Documentos", "Nominas", "Listados por Cargo"],
    },
    // {
    //     title: "REPORTE ASISTENCIA EXCELL",
    //     subtitle: "Reporte mensual",
    //     icon: "ClipboardCheck",
    //     color: "orange",
    //     route: "recursos.reportes.mensualexcell",
    //     items: [
    //         "Control General",
    //         "Descargas Directas",
    //         "Filtros por Mes y Año",
    //     ],
    // },
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
    // orange: {
    //     border: "border-orange-500",
    //     shadow: "shadow-orange-500/20",
    //     text: "text-orange-500",
    //     bg: "bg-orange-500",
    //     hoverShadow: "hover:shadow-orange-500/40",
    //     from: "from-orange-500/10",
    //     to: "to-orange-500/20",
    //     bgLight: "bg-orange-50/30",
    //     buttonHover: "group-hover:bg-orange-500",
    // },
};

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Empleados" />

            <ViewContainer
                title="EMPLEADOS ACTIVOS"
                subtitle="Gestión y control del personal"
                icon="UserPlus"
                showSearch={false}
            >
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                    {modules.map((mod, idx) => {
                        const IconComponent = Icons[mod.icon];
                        const style = neonStyles[mod.color];

                        return (
                            <Link
                                key={idx}
                                href={route(mod.route)}
                                className="group"
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
                                    className={`relative h-full flex flex-col bg-white border-b-[6px] ${style.border} rounded-[1.8rem] p-7 shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer active:scale-95`}
                                >
                                    {/* Resplandor de fondo al hacer hover */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-b ${style.from} ${style.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                    />

                                    {/* Icono Flotante Neón */}
                                    <div className="flex justify-center mb-8 relative z-10">
                                        <div
                                            className={`p-5 rounded-3xl text-white shadow-2xl ${style.bg} ${style.shadow} ${style.hoverShadow}`}
                                        >
                                            <IconComponent
                                                size={34}
                                                strokeWidth={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Textos Centrales */}
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

                                    {/* Lista de Items (Píldoras) */}
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

                                    {/* Botón Inferior */}
                                    <div
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-500 
                                            bg-gray-900 text-white ${style.buttonHover} group-hover:shadow-lg group-hover:scale-105`}
                                    >
                                        ENTRAR{" "}
                                        <Icons.Zap
                                            size={14}
                                            className="fill-current"
                                        />
                                    </div>

                                    {/* Adorno visual de luz - CORREGIDO */}
                                    <div
                                        className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl transition-all 
                                            ${style.from} group-hover:${style.to}`}
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
