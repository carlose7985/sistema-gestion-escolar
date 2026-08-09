import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Link, Head } from "@inertiajs/react";

const modules = [
    {
        title: "ESTUDIANTES RETIRADOS",
        subtitle: "Cese de Matrícula",
        icon: "UserX",
        color: "rose",
        route: "estudiantes.inactivos.retirados.index", // Cambiar por tu ruta real
        items: ["Motivos de Retiro", "Fecha de Egreso", "Expediente Físico"],
    },
    
    {
        title: "EGRESADOS/GRADUADOS",
        subtitle: "Culminación de Estudios",
        icon: "Award",
        color: "emerald",
        route: "estudiantes.inactivos.graduados.index", // Cambiar por tu ruta real
        items: ["Títulos Emitidos", "Libro de Actas", "Promociones"],
    },
    {
        title: "MATRÍCULA SISGE",
        subtitle: "Base de Datos Histórica",
        icon: "Database",
        color: "blue",
        route: "estudiantes.inactivos.sisge.index", // Cambiar por tu ruta real
        items: ["Sincronización SIGE", "Reportes Anteriores", "Auditoría"],
    },
];

const neonStyles = {
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
  
    emerald: {
        border: "border-emerald-500",
        shadow: "shadow-emerald-500/20",
        text: "text-emerald-500",
        bg: "bg-emerald-500",
        hoverShadow: "hover:shadow-emerald-500/40",
        from: "from-emerald-500/10",
        to: "to-emerald-500/20",
        buttonHover: "group-hover:bg-emerald-500",
    },
    blue: {
        border: "border-blue-500",
        shadow: "shadow-blue-500/20",
        text: "text-blue-500",
        bg: "bg-blue-600",
        hoverShadow: "hover:shadow-blue-500/40",
        from: "from-blue-500/10",
        to: "to-blue-500/20",
        buttonHover: "group-hover:bg-blue-600",
    },
};

export default function HistorialDashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Historial Académico" />

            <ViewContainer
                title="Control estudiantes inactivos"
                subtitle="Archivo digital y control de egresos institucionales"
                icon="History"
                showSearch={false}
            >
                {/* Grid de 4 columnas para esta sección */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
                                    className={`relative h-full flex flex-col bg-white border-b-[6px] ${style.border} rounded-[2.8rem] p-7 shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer active:scale-95`}
                                >
                                    {/* Resplandor de fondo */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-b ${style.from} ${style.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                    />

                                    {/* Icono Flotante */}
                                    <div className="flex justify-center mb-8 relative z-10">
                                        <div
                                            className={`p-5 rounded-3xl text-white shadow-2xl  ${style.bg} ${style.shadow} ${style.hoverShadow}`}
                                        >
                                            <IconComponent
                                                size={34}
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                    </div>

                                    {/* Títulos */}
                                    <div className="text-center mb-6 relative z-10">
                                        <h3 className="text-[12px] font-black text-slate-800 tracking-tighter uppercase italic group-hover:text-black transition-colors leading-tight">
                                            {mod.title}
                                        </h3>
                                        <p
                                            className={`text-[10px] font-black uppercase tracking-[0.1em] mt-1.5 ${style.text}`}
                                        >
                                            {mod.subtitle}
                                        </p>
                                    </div>

                                    {/* Items */}
                                    <div className="flex-1 space-y-2.5 mb-10 relative z-10">
                                        {mod.items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-gray-50/80 border-l-4 border-gray-100 group-hover:border-current group-hover:bg-white py-2.5 px-4 rounded-xl text-[9px] font-bold text-gray-500 group-hover:text-gray-700 uppercase italic tracking-tight transition-all duration-300"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botón de Entrada */}
                                    <div
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-500 
                                            bg-slate-900 text-white ${style.buttonHover} group-hover:shadow-lg group-hover:scale-105`}
                                    >
                                        ACCEDER{" "}
                                        <Icons.Zap
                                            size={14}
                                            className="fill-current animate-pulse"
                                        />
                                    </div>

                                    {/* Luz de esquina decorativa */}
                                    <div
                                        className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-3xl transition-all opacity-20 
                                            ${style.from} group-hover:opacity-40`}
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
