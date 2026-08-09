import React, { useState, useEffect, useRef, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import axios from "axios";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import {
    Search,
    Loader2,
    ArrowLeftCircle,
    Users,
    GraduationCap,
    ArrowRight,
    TrendingUp,
    TriangleAlert,
} from "lucide-react";

export default function PanelGrados({
    grades,
    periodo_actual,
    pendingPromotionCount = 0,
}) {
    // --- ESTADOS BÚSQUEDA GLOBAL ---
    const [searchGlobal, setSearchGlobal] = useState("");
    const [resultsGlobal, setResultsGlobal] = useState([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchContainer = useRef(null);
    const [isMassLoading, setIsMassLoading] = useState(false);
    const [showMassModal, setShowMassModal] = useState(false);
    // --- CÁLCULOS DE TOTALES PARA FOOTER ---
    const totalEstudiantes = grades.reduce(
        (acc, curr) => acc + curr.total_students,
        0,
    );
    const totalSecciones = grades.length;

    // --- BÚSQUEDA GLOBAL (DEBOUNCE) ---
    const performSearch = useCallback(
        debounce(async (query) => {
            if (query.trim().length < 2) {
                setResultsGlobal([]);
                setShowResults(false);
                return;
            }
            setLoadingGlobal(true);
            try {
                const response = await axios.get(
                    route("estudiantes.activos.listado.global.search"),
                    { params: { query } },
                );
                setResultsGlobal(response.data);
                setShowResults(true);
            } catch (error) {
                console.error("Error en búsqueda global:", error);
            } finally {
                setLoadingGlobal(false);
            }
        }, 300),
        [],
    );

    useEffect(() => {
        performSearch(searchGlobal);
    }, [searchGlobal, performSearch]);

    // --- CIERRE DE CLICS EXTERNOS ---
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                searchContainer.current &&
                !searchContainer.current.contains(e.target)
            ) {
                setShowResults(false);
            }
        };
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    // --- ACCIONES ---
    const handleSelectStudent = (student) => {
        router.get(
            route("estudiantes.activos.listado.show", student.grado_id),
            {
                search: student.cedula,
            },
        );
    };

    const handleMassPromotion = () => {
        setIsMassLoading(true);
        router.post(
            route("estudiantes.activos.listado.asignar.grados"),
            {},
            {
                onSuccess: () => {
                    setShowMassModal(false);
                },
                onFinish: () => setIsMassLoading(false),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Resumen General por Grado" />

            <ViewContainer
                title="GESTIÓN DE EXPEDIENTES"
                subtitle="Selección de grado para gestión de estudiantes"
                icon="GraduationCap"
                showSearch={false}
                returns={
                    <div className="flex items-center gap-2">
                        <Link href={route("estudiantes.activos.index")}>
                            <Button>
                                <ArrowLeftCircle className="mr-2" size={14} />{" "}
                                VOLVER
                            </Button>
                        </Link>
                    </div>
                }
                footerStats={
                    <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-tight text-gray-500">
                        <p>
                            Secciones:{" "}
                            <span className="text-indigo-600 font-black ml-1">
                                {totalSecciones}
                            </span>
                        </p>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <p>
                            Estudiantes:{" "}
                            <span className="text-indigo-600 font-black ml-1">
                                {totalEstudiantes}
                            </span>
                        </p>
                        {periodo_actual && (
                            <>
                                <div className="w-px h-3 bg-gray-300"></div>
                                <p className="text-emerald-600">
                                    Período Escolar Activo: {periodo_actual}
                                </p>
                            </>
                        )}
                    </div>
                }
            >
                {/* BUSCADOR COMPACTO */}
                <div className="mb-2 relative" ref={searchContainer}>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <div className="pl-4 text-gray-400 group-focus-within:text-indigo-500">
                            {loadingGlobal ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Search size={16} />
                            )}
                        </div>
                        <input
                            type="search"
                            autoFocus
                            value={searchGlobal}
                            onChange={(e) => setSearchGlobal(e.target.value)}
                            onFocus={() =>
                                searchGlobal.length >= 2 && setShowResults(true)
                            }
                            placeholder="Buscar estudiantes de todos los grados..."
                            className="flex-1 h-10 text-gray-600 bg-transparent border-none focus:ring-0 text-xs font-bold placeholder:text-gray-300 p-3"
                        />
                    </div>

                    {/* RESULTADOS DE BÚSQUEDA TIPO OVERLAY */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[110] overflow-hidden">
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {resultsGlobal.length > 0 ? (
                                    resultsGlobal.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() =>
                                                handleSelectStudent(student)
                                            }
                                            className="p-3 hover:bg-gray-50 cursor-pointer transition-all flex items-center gap-3 border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[11px] font-black text-gray-700 uppercase">
                                                    {student.name}{" "}
                                                    {student.apellido}
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-bold">
                                                    {student.cedula} •{" "}
                                                    <span className="text-indigo-500">
                                                        {
                                                            student.grados
                                                                .nombre_del_grado
                                                        }{" "}
                                                        {student.grados.seccion}
                                                    </span>
                                                </p>
                                            </div>
                                            <ArrowRight
                                                size={14}
                                                className="text-gray-300"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-[10px] font-black text-gray-300 uppercase italic">
                                        No hay resultados
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* GRID DE GRADOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 auto-rows-fr">
                    {grades.length > 0 ? (
                        grades.map((grade) => {
                            const formatDocenteName = (fullName) => {
                                if (!fullName) return "";
                                const parts = fullName.trim().split(/\s+/);
                                if (parts.length === 1) return parts[0];
                                const firstName = parts[0];
                                const isDelCase = firstName
                                    .toLowerCase()
                                    .startsWith("del");
                                if (isDelCase && parts.length >= 2)
                                    return `${parts[0]} ${parts[1]}`;
                                return `${parts[0]} ${parts[parts.length - 1]}`;
                            };

                            return (
                                <Link
                                    key={grade.id}
                                    href={route(
                                        "estudiantes.activos.listado.show",
                                        grade.id,
                                    )}
                                    className="group bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[140px]"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg"></div>
                                    <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                        <GraduationCap
                                            size={70}
                                            className="transform -rotate-12"
                                        />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex flex-col">
                                                <h4 className="text-[14px] font-black text-gray-700 uppercase tracking-tighter leading-tight">
                                                    {grade.nombre_del_grado}{" "}
                                                    <span className="text-indigo-600 text-[16px]">
                                                        {grade.seccion}
                                                    </span>
                                                </h4>
                                                <p className="text-[11px] font-bold text-blue-500 italic truncate max-w-[110px]">
                                                    {formatDocenteName(
                                                        grade.docente,
                                                    )}
                                                </p>
                                            </div>
                                            <ArrowRight
                                                size={12}
                                                className="text-gray-300 group-hover:text-indigo-500 transition-colors"
                                            />
                                        </div>

                                        <div className="flex items-end justify-between mt-4">
                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[12px] font-black text-slate-400">
                                                        M
                                                    </span>
                                                    <span className="text-lg font-black text-blue-600 leading-none">
                                                        {grade.male_students}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[12px] font-black text-slate-400">
                                                        F
                                                    </span>
                                                    <span className="text-lg font-black text-pink-500 leading-none">
                                                        {grade.female_students}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block">
                                                    Total
                                                </span>
                                                <span className="text-xl font-black text-gray-800 leading-none">
                                                    {grade.total_students}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 px-4 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                            <Users size={48} className="text-gray-300 mb-4" />

                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight mb-1">
                                No existen registros para el período actual
                            </h3>
                            <p className="text-[11px] font-bold text-gray-400 uppercase mb-6">
                                Hay estudiantes procesados listos para ser
                                asignados a este período.
                            </p>

                            <Button
                                onClick={() => setShowMassModal(true)}
                                disabled={
                                    pendingPromotionCount === 0 || isMassLoading
                                }
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 py-5 text-[11px] font-black uppercase shadow-xl ring-4 ring-slate-100 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                <TrendingUp size={16} />
                                ASIGNACIÓN MASIVA DE GRADOS (
                                {pendingPromotionCount} POSIBLES REGISTROS)
                            </Button>
                        </div>
                    )}
                </div>

                {/* MODAL PROMOCIÓN MASIVA (Indigo) */}
                {showMassModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-md p-12 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-2 border-indigo-100 text-center animate-in zoom-in-95">
                                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-indigo-50/50">
                                    <GraduationCap
                                        size={48}
                                        strokeWidth={2.5}
                                    />
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                                    Promoción Masiva
                                </h3>

                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-10 leading-relaxed italic">
                                    Se procesará la subida de grado para: <br />
                                    <span className="text-indigo-600 text-lg font-black">
                                        {pendingPromotionCount} ESTUDIANTES
                                    </span>
                                    <br />
                                    pendientes del ciclo académico.
                                </p>

                                <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-5 mb-8 text-left relative overflow-hidden">
                                    <p className="text-rose-700 font-black text-[10px] uppercase flex items-center gap-2 mb-2">
                                        <TriangleAlert size={14} /> Acción
                                        Crítica
                                    </p>
                                    <p className="text-xs text-rose-600 font-bold leading-tight">
                                        Al confirmar, estos alumnos serán
                                        movidos al nuevo periodo y su status
                                        cambiará a "Asignado". Las tablas de
                                        estudiantes activos se reiniciarán.
                                    </p>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <Button variant="primary"
                                        onClick={() => setShowMassModal(false)}
                                        disabled={isMassLoading}
                                       
                                    >
                                        Cancelar
                                    </Button>
                                    <Button variant="success"
                                        onClick={handleMassPromotion}
                                        loading={isMassLoading}
                                       
                                    >
                                        Confirmar y Promover
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
