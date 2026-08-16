import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Link, Head } from "@inertiajs/react";

const modules = [
    {
        title: "impresión de documentos por grado y sección",
        subtitle: "Gestión de impresiones regulares",
        icon: "Printer",
        color: "cyan",
        route: "estudiantes.impresiones.documentos.por.grado",
        items: [
            "Emisión de impresiones",
            "Control por grado y sección",
            "Listados, cedulación y directorios",
        ],
    },
    {
        title: "impresión de documentos generales",
        subtitle: "Control general de impresiones estudiantiles",
        icon: "Printer",
        color: "lime",
        route: "estudiantes.impresiones.documentos.generales", // Ajustado para ser consistente
        items: ["Matriculas", "Documentos excel", "Dtas generales"],
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
   
};

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Estudiantes" />

            <ViewContainer
                title="ESTUDIANTES GESTIÓN DE IMPRESIONES"
                subtitle="Gestión y control de impresión de documentos"
                icon="Printer"
                showSearch={false}
            >
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
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
