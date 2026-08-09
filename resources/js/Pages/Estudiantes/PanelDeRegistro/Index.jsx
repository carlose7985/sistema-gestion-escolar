import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DoorOpen,
    Lock,
    Mars,
    Venus,
    Printer,
    GraduationCap,
    ArrowLeftCircle,
    ShieldCheck,
    X,
    Users,
    BookmarkCheck,
} from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function RegistroEstudiantil({
    isRegistrationOpen,
    grades = [],
    sgaStats = { total_studentsr: 0, male_studentsr: 0, female_studentsr: 0 },
    periodo_id = null, // 🔥 Agregar período_id
    periodo_escolar = null, // 🔥 Agregar nombre del período
}) {
    const { props } = usePage();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredStudent, setRegisteredStudent] = useState(null);
   
    // Escucha de mensajes Flash enviados por Laravel tras completar un registro
    useEffect(() => {
        const flash = props.flash;
        if (flash?.student_id && flash?.student_type) {
            setRegisteredStudent({
                id: flash.student_id,
                type: flash.student_type,
            });
            setShowSuccessModal(true);
        }
    }, [props.flash]);

    const handlePrint = (type) => {
        // Construir parámetros base
        const params = {
            type,
            periodo_id: periodo_id || "",
        };

        // Si se pasa studentId, añadirlo
        if (registeredStudent?.id) {
            params.studentId = registeredStudent.id;
        }

        window.open(route("estudiantesActivosExport", params), "_blank");
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setRegisteredStudent(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Registro Estudiantil" />

            <ViewContainer
                title="Registro Estudiantil"
                subtitle="Gestión global de inscripciones, asignaciones y control de cupos"
                icon="UserPlus"
                showSearch={false}
                returns={
                    <Link href={route("estudiantes.registro.index")}>
                        <Button>
                            <ArrowLeftCircle size={18} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="h-full flex flex-col p-2 gap-4 overflow-hidden">
                    {/* 1. SECCIÓN SUPERIOR: ESTADO DEL PERÍODO Y ESTUDIANTES SIN GRADO (SGA) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Indicador de Estado del Período */}
                        <div
                            className={`flex items-center justify-between p-4 bg-white border-l-4 rounded-2xl shadow-sm border border-slate-100 ${
                                isRegistrationOpen
                                    ? "border-l-emerald-500"
                                    : "border-l-amber-500"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2.5 rounded-xl ${isRegistrationOpen ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                                >
                                    {isRegistrationOpen ? (
                                        <DoorOpen size={22} />
                                    ) : (
                                        <Lock size={22} />
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                        Estado del Proceso
                                    </span>
                                    <h4 className="text-sm font-black text-slate-900 uppercase italic">
                                        Inscripción{" "}
                                        {isRegistrationOpen
                                            ? "Abierta"
                                            : "Cerrada (Regular)"}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. REPEATED GRID DE GRADOS Y CONTROL DE CUPOS */}
                    <div className="flex-1 overflow-y-auto px-1 custom-scrollbar pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 2xl:grid-cols-6 gap-3.5">
                            {grades.map((grade, index) => {
                                const porcentajeOcupado =
                                    grade.limite_estudiantes > 0
                                        ? Math.min(
                                              100,
                                              Math.round(
                                                  ((grade.total_students +
                                                      grade.cupos_reservados) /
                                                      grade.limite_estudiantes) *
                                                      100,
                                              ),
                                          )
                                        : 0;

                                return (
                                    <motion.div
                                        key={grade.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Link
                                            href={route(
                                                "estudiantes.registro.selecciona.responsable",
                                                {
                                                    grade_id: grade.id,
                                                    student_status:
                                                        isRegistrationOpen
                                                            ? 2
                                                            : "Activo",
                                                },
                                            )}
                                            className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all flex flex-col justify-between h-full relative overflow-hidden"
                                        >
                                            {/* Cabecera del Grado */}
                                            <div>
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <div>
                                                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate leading-tight">
                                                            {
                                                                grade.nombre_del_grado
                                                            }
                                                        </h5>
                                                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md mt-1">
                                                            Sección:{" "}
                                                            {grade.seccion}
                                                        </span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                        <GraduationCap
                                                            size={16}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Desglose por Género */}
                                                <div className="grid grid-cols-2 gap-2 my-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Mars
                                                            size={13}
                                                            className="text-blue-500"
                                                        />
                                                        <span className="text-[11px] font-black text-slate-700">
                                                            {
                                                                grade.male_students
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-1.5 border-l border-slate-200">
                                                        <Venus
                                                            size={13}
                                                            className="text-rose-500"
                                                        />
                                                        <span className="text-[11px] font-black text-slate-700">
                                                            {
                                                                grade.female_students
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sección Inferior: Indicador Visual de Cupos */}
                                            <div className="pt-2 border-t border-slate-100 space-y-2">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase">
                                                    <span className="text-slate-400 flex items-center gap-1">
                                                        <Users size={12} />{" "}
                                                        Inscritos
                                                    </span>
                                                    <span className="text-slate-800">
                                                        {grade.total_students}{" "}
                                                        de{" "}
                                                        {
                                                            grade.limite_estudiantes
                                                        }
                                                    </span>
                                                </div>

                                                {/* Barra de Capacidad */}
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${
                                                            porcentajeOcupado >=
                                                            100
                                                                ? "bg-rose-500"
                                                                : porcentajeOcupado >
                                                                    80
                                                                  ? "bg-amber-500"
                                                                  : "bg-emerald-500"
                                                        }`}
                                                        style={{
                                                            width: `${porcentajeOcupado}%`,
                                                        }}
                                                    />
                                                </div>

                                                {/* Reservados vs Disponibles */}
                                                <div className="flex items-center justify-between text-[11px] font-bold">
                                                    <span className="text-amber-600 flex items-center gap-1">
                                                        <BookmarkCheck
                                                            size={11}
                                                        />{" "}
                                                        Reservados:{" "}
                                                        {grade.cupos_reservados}
                                                    </span>
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded ${
                                                            grade.cupos_disponibles >
                                                            0
                                                                ? "bg-emerald-50 text-emerald-700 font-black"
                                                                : "bg-rose-50 text-rose-600 font-black"
                                                        }`}
                                                    >
                                                        {grade.cupos_disponibles >
                                                        0
                                                            ? `${grade.cupos_disponibles} Libres`
                                                            : "Agotado"}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* MODAL DE ÉXITO POST-INSCRIPCIÓN */}
                <AnimatePresence>
                    {showSuccessModal && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-white"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-emerald-100">
                                        <ShieldCheck
                                            size={36}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">
                                        Inscripción Completada
                                    </h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                        Comprobantes listos para imprimir
                                    </p>

                                    <div className="grid grid-cols-1 gap-2.5 w-full mt-6">
                                        <button
                                            onClick={() =>
                                                handlePrint(
                                                    "ficha-de-inscripcion",
                                                )
                                            }
                                            className="group flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Printer
                                                    className="text-slate-400 group-hover:text-indigo-600"
                                                    size={18}
                                                />
                                                <span className="text-[10px] font-black uppercase text-slate-700 group-hover:text-indigo-600">
                                                    Ficha de Inscripción
                                                </span>
                                            </div>
                                            <X
                                                size={12}
                                                className="text-slate-300 rotate-45"
                                            />
                                        </button>

                                        <button
                                            onClick={() =>
                                                handlePrint(
                                                    "constancia-de-inscripcion",
                                                )
                                            }
                                            className="group flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Printer
                                                    className="text-slate-400 group-hover:text-emerald-600"
                                                    size={18}
                                                />
                                                <span className="text-[10px] font-black uppercase text-slate-700 group-hover:text-emerald-600">
                                                    Constancia de Inscripción
                                                </span>
                                            </div>
                                            <X
                                                size={12}
                                                className="text-slate-300 rotate-45"
                                            />
                                        </button>
                                    </div>

                                    <button
                                        onClick={closeSuccessModal}
                                        className="mt-6 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                    >
                                        Finalizar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </ViewContainer>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
