import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Link, Head, usePage, router, useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { createPortal } from "react-dom";
import { Button } from "@/Components/Ui/Button";
import { toast } from "sonner";

const MySwal = withReactContent(Swal);

const modules = [
    {
        title: "ASIGNACIÓN DE CUPOS",
        subtitle: "Gestión de ingresos y asignación de cupos",
        icon: "UserCheck",
        color: "cyan",
        route: "estudiantes.registro.asignacion.cupo.index",
        items: [
            "Emisión de Cupos",
            "Control de Asignación",
            "Historial de Ingresos",
        ],
    },
    {
        title: "REGISTRO NUEVO INGRESO",
        subtitle: "Registro y control de estudiantes",
        icon: "List",
        color: "fuchsia",
        route: "estudiantes.registro.selecciona.grado",
        items: [
            "Fichas Técnicas",
            "Directorio de estudiantes",
            "Control de actividades",
        ],
    },
    {
        title: "CONTROL PADRES Y RESPONSABLES",
        subtitle: "Registro y gestión de contactos",
        icon: "MessageSquareText",
        color: "lime",
        route: "estudiantes.registro.responsables.index",
        items: [
            "Registro de Padres",
            "Gestión de Documentos",
            "Notificaciones y Comunicaciones",
        ],
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
};

export default function Index({ periodo_escolar, showModal }) {
    const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(
        showModal || false,
    );
    const { post, processing } = useForm({});

    const handleOpenProcess = () => {
        // Verificamos si periodo_escolar existe antes de intentar acceder al ID
        if (!periodo_escolar) {
            toast.error(
                "Error: No se encontró la información del período escolar",
            );
            console.error("Prop periodo_escolar:", periodo_escolar);
            return;
        }

        // PASAMOS EL PARÁMETRO CON EL NOMBRE EXACTO QUE DEFINISTE EN LA RUTA
        post(
            route("estudiantes.acciones.periodo.escolar.toggle", {
                periodo_escolar: periodo_escolar,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsBlockedModalOpen(false);
                    // toast.success("Proceso actualizado");
                },
                onError: (err) => {
                    console.error(err);
                    toast.error("No se pudo cambiar el estado del período");
                },
            },
        );
    };

    const { flash } = usePage().props; // 👈 Obtener los mensajes flash del controlador
    useEffect(() => {
        // SOLO se dispara si el controlador envió 'alerta_pendientes'
        if (flash?.alerta_pendientes) {
            MySwal.fire({
                title: '<span class="text-xl font-black text-amber-600 uppercase tracking-wide">¡ATENCIÓN: REVISIÓN REQUERIDA!</span>',
                html: (
                    <div className="text-left space-y-4 text-sm text-gray-700 py-2">
                        <p className="font-semibold text-gray-800 leading-relaxed">
                            Existen estudiantes pendientes de asignación de
                            grado que aún no han formalizado su inscripción en
                            el periodo escolar actual.
                        </p>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-amber-900 text-xs font-medium leading-normal">
                            ⚠️ <strong>Acción necesaria:</strong> Debe procesar
                            estos alumnos en el módulo estudiantes por grado
                            carga masiva, para completar su registro y
                            asignarles un grado correspondiente.
                        </div>
                    </div>
                ),
                icon: "warning",
                confirmButtonText: "ENTENDIDO, VOY A REVISAR",
                confirmButtonColor: "#d97706",
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                    popup: "rounded-[2rem] p-6 shadow-2xl border-2 border-amber-200",
                    confirmButton:
                        "rounded-xl font-bold px-6 py-3 text-xs tracking-wider uppercase shadow-lg",
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    router.get(route("estudiantes.activos.listado.index"));
                }
            });
        }
    }, [flash?.alerta_pendientes]); // 👈

    return (
        <AuthenticatedLayout>
            <Head title="Estudiantes" />

            <ViewContainer
                title="ESTUDIANTES REGISTRO"
                subtitle="Gestión y control de los estudiantes"
                icon="GraduationCap"
                showSearch={false}
            >
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
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
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-500 
                                            bg-gray-900 text-white ${style.buttonHover} group-hover:shadow-lg group-hover:scale-105`}
                                    >
                                        ENTRAR{" "}
                                        <Icons.Zap
                                            size={14}
                                            className="fill-current"
                                        />
                                    </div>

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
            {isBlockedModalOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border-2 border-rose-100">
                                    <Icons.Lock size={48} strokeWidth={2.5} />
                                </div>

                                <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-3 leading-none">
                                    Proceso Cerrado
                                </h2>
                                <p className="text-lg font-bold text-slate-800 leading-relaxed mb-10">
                                    El proceso de inscripción está actualmente{" "}
                                    <span className="text-rose-500 underline decoration-2 underline-offset-4">
                                        CERRADO
                                    </span>
                                    . Debe habilitar el periodo escolar para continuar.
                                   
                                </p>

                                <div className="flex w-full gap-4">
                                    <button
                                        onClick={() =>
                                            setIsBlockedModalOpen(false)
                                        }
                                        className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        No abrir
                                    </button>
                                    <Button
                                        onClick={handleOpenProcess}
                                        disabled={processing}
                                        loading={processing}
                                        variant="success"
                                        className="flex-1 py-8 shadow-xl shadow-emerald-200"
                                    >
                                        <Icons.Unlock
                                            size={18}
                                            className="mr-2"
                                        />{" "}
                                        ABRIR PROCESO
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </AuthenticatedLayout>
    );
}
