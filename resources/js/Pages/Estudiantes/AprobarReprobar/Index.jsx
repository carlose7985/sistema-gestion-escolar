import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import LoadingSpinner from "@/Components/LoadingSpinner";
import {
    ArrowLeftCircle,
    CheckCircle2,
    GraduationCap,
    ChevronRight,
    SearchX,
    AlertCircle,
} from "lucide-react";

export default function Index({ grades, periodo_escolar_pasado }) {
    // --- NUEVO ESTADO PARA DETECTAR NAVEGACIÓN ---
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // Escuchamos cuando inicia una visita (clic en Evaluar o Volver)
        const unregisterStart = router.on("start", () => setIsNavigating(true));

        // Escuchamos cuando termina (éxito o error)
        const unregisterFinish = router.on("finish", () =>
            setIsNavigating(false),
        );

        // Limpiamos los eventos al desmontar
        return () => {
            unregisterStart();
            unregisterFinish();
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Evaluación" />

            <ViewContainer
                title={`PROMOCIÓN DE ESTUDIANTES ${periodo_escolar_pasado}`}
                subtitle="Cierre de ciclo académico y registro de calificados"
                showSearch={false}
                returns={
                    <Link href={route("estudiantes.activos.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                footerStats={
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase">
                                Secciones Totales:
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[11px] font-black">
                                {grades?.length || 0}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase">
                                Pendientes:
                            </span>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[11px] font-black">
                                {grades?.filter((g) => !g.is_calificado)
                                    .length || 0}
                            </span>
                        </div>
                    </div>
                }
            >
                {/* --- SPINNER INTERNO ACTIVO DURANTE NAVEGACIÓN --- */}
                {isNavigating && (
                    <LoadingSpinner
                        fullScreen={true}
                        text="Cargando información..."
                    />
                )}

                <div className="flex-1 overflow-y-auto px-2 custom-scrollbar pb-4">
                    {grades && grades.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
                            {grades.map((grade) => (
                                <div
                                    key={grade.id}
                                    className="group relative flex flex-col bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 h-fit"
                                >
                                    {/* Indicador Lateral Fluorescente */}
                                    <div
                                        className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${grade.is_calificado ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-orange-400 animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.5)]"}`}
                                    ></div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-black text-slate-800 uppercase leading-none mt-2">
                                                    {grade.nombre_del_grado}{" "}
                                                    {grade.seccion}
                                                </h3>
                                            </div>
                                            <div
                                                className={`p-2.5 rounded-lg border shadow-sm ${grade.is_calificado ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}
                                            >
                                                {grade.is_calificado ? (
                                                    <CheckCircle2 size={14} />
                                                ) : (
                                                    <AlertCircle size={14} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 mb-4">
                                            <div className="grid grid-cols-3 gap-1.5">
                                                <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100">
                                                    F: {grade.male_students}
                                                </div>
                                                <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-pink-50 text-pink-600 text-[10px] font-black border border-pink-100">
                                                    M: {grade.female_students}
                                                </div>

                                                <div className="flex items-center justify-center gap-1 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black border border-green-100">
                                                    T: {grade.total_students}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón de Acción */}
                                        {grade.is_calificado ? (
                                            <div className="flex items-center justify-center w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-[9px] font-black uppercase tracking-widest italic">
                                                Finalizado
                                            </div>
                                        ) : (
                                            <Link
                                                href={
                                                    grade.total_students > 0
                                                        ? route(
                                                              "estudiantes.activos.aprobar.reprobar.show",
                                                              grade.id,
                                                          )
                                                        : "#"
                                                }
                                                className={`block w-full ${grade.total_students === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                <button
                                                    disabled={
                                                        grade.total_students ===
                                                        0
                                                    }
                                                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group/btn"
                                                >
                                                    <GraduationCap size={14} />
                                                    {grade.total_students === 0
                                                        ? "Vacío"
                                                        : "Evaluar"}
                                                    <ChevronRight
                                                        size={14}
                                                        className="group-hover/btn:translate-x-0.5 transition-transform"
                                                    />
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30">
                            <SearchX size={80} strokeWidth={1} />
                            <p className="text-sm font-black uppercase italic tracking-widest mt-4">
                                No hay secciones activas
                            </p>
                        </div>
                    )}
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
