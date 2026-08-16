import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Link, Head, usePage, useForm } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { Button } from "@/Components/ui/button";

const modules = [
    {
        title: "ASISTENCIA EMPLEADOS",
        subtitle: "Control de Asistencia",
        icon: "UserCheck",
        color: "cyan",
        route: "recursos.asistencia.empleados.index",
        items: ["Registro Diario", "Control Estadistico", "Justificaciones"],
    },
    {
        title: "ASISTENCIA ESTUDIANTES",
        subtitle: "Estructura Académica",
        icon: "UserCheck",
        color: "fuchsia",
        route: "recursos.asistencia.estudiantes.index",
        items: ["Lista por Grados", "Porcentaje Diario", "Porcentaje Mensual"],
    },
    {
        title: "REPORTE WHATSAPP",
        subtitle: "Reportes Diarios",
        icon: "MessageSquareText",
        color: "lime",
        route: "recursos.reportes.whatsapp",
        items: [
            "Envío Automatizado",
            "Alertas de Inasistencias",
            "Resumen por Cargo",
        ],
    },
    {
        title: "REPORTE ASISTENCIAS PDF",
        subtitle: "Reporte mensual",
        icon: "FileSpreadsheet",
        color: "rose",
        route: "recursos.reportes.mensualpdf",
        items: ["Reportes de Empleados", "Consolidados", "Estadísticas"],
    },
    {
        title: "REPORTE ASISTENCIA EXCELL",
        subtitle: "Reporte mensual",
        icon: "ClipboardCheck",
        color: "orange",
        route: "recursos.reportes.mensualexcell",
        items: [
            "Control General",
            "Descargas Directas",
            "Filtros por Mes y Año",
        ],
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
};

export default function Index() {
    // 1. Obtener datos de la sesión flash (Inertia)
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);

    // 2. Formulario para el toggle
    const { post, processing } = useForm();

    // 3. Efecto para abrir el modal si viene la señal del controlador
    useEffect(() => {
        if (flash.abrir_modal_periodo) {
            setShowModal(true);
        }
    }, [flash]);

    const handleCerrarPeriodo = () => {
        post(
            route(
                "estudiantes.acciones.periodo.escolar.toggle",
                flash.abrir_modal_periodo.id,
            ),
            {
                onSuccess: () => setShowModal(false),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Asistencias y Reportes" />

            <ViewContainer
                title="ASISTENCIAS Y REPORTES"
                subtitle="Gestión y control de asistencias y reportes"
                icon="File"
                showSearch={false}
            >
                {/* --- GRILLA DE MÓDULOS --- */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-b ${style.from} ${style.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                    />
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
                                    <div
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-500 bg-gray-900 text-white ${style.buttonHover} group-hover:shadow-lg group-hover:scale-105`}
                                    >
                                        ENTRAR{" "}
                                        <Icons.Zap
                                            size={14}
                                            className="fill-current"
                                        />
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* --- MODAL ELEGANTE DE CIERRE DE PERIODO --- */}
                {showModal &&
                    flash.abrir_modal_periodo &&
                    createPortal(
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3rem] p-10 shadow-[0_0_50px_rgba(244,63,94,0.3)] w-full max-w-md border-2 border-rose-100 relative overflow-hidden"
                            >
                                {/* Decoración Fondo */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-50 rounded-full blur-3xl opacity-50" />

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"
                                >
                                    <Icons.X size={28} />
                                </button>

                                <div className="text-center relative z-10">
                                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-rose-50/50">
                                        <Icons.Lock
                                            size={40}
                                            strokeWidth={2.5}
                                        />
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">
                                        Inscripciones Abiertas
                                    </h3>

                                    <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed mb-8">
                                        Para gestionar asistencias, es
                                        obligatorio <br />
                                        cerrar el proceso de inscripción del
                                        período: <br />
                                        <span className="text-rose-600 font-black text-sm bg-rose-50 px-3 py-1 rounded-lg mt-2 inline-block">
                                            {flash.abrir_modal_periodo.nombre}
                                        </span>
                                    </p>

                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleCerrarPeriodo}
                                            disabled={processing}
                                            className="w-full py-8 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            {processing ? (
                                                <Icons.Loader2 className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Icons.ShieldCheck
                                                        size={18}
                                                    />
                                                    CERRAR INSCRIPCIONES AHORA
                                                </>
                                            )}
                                        </Button>

                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="text-[10px] font-black uppercase text-slate-300 hover:text-slate-500 transition-colors tracking-widest"
                                        >
                                            Omitir y volver
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
