import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
    ArrowLeftCircle,
    FileSpreadsheet,
    FileText,
    PieChart,
    Shirt,
    History,
    CalendarRange,
    X,
    BarChart3,
    UserMinus,
    MoonStar,
    FilePlus2,
    FileMinus2,
    File,
    Loader2,
    GitPullRequestArrow,
    GitPullRequestDraft,
    NotebookText,
    Printer,
    GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

export default function DocGeneralesPrint({ periodoActual, periodos = [] }) {
    // --- ESTADOS ---
    const [modalType, setModalType] = useState(null); // 'date' | 'period' | 'calificaciones' | null
    const [availablePeriods, setAvailablePeriods] = useState([]);
    const [loadingPeriods, setLoadingPeriods] = useState(false);

    const [reportConfig, setReportConfig] = useState({
        type: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        selectedPeriod: periodoActual || "",
    });

    // --- ESTADOS PARA CALIFICACIONES FINALES ---
    const [showPeriodoModal, setShowPeriodoModal] = useState(false);
    const [selectedPeriodoModal, setSelectedPeriodoModal] = useState(
        periodoActual || "",
    );

    // --- ESTADOS PARA MODAL DE PERÍODOS (Inicial, Final, Comparativa) ---
    const [showPeriodosModal, setShowPeriodosModal] = useState(false);
    const [selectedPeriodo, setSelectedPeriodo] = useState("");
    const [currentReportType, setCurrentReportType] = useState("");

    // --- MANEJADORES DE IMPRESIÓN ---

    const handlePrintDirect = (type) => {
        window.open(route("estudiantesExport", { type }), "_blank");
    };

    const openDateModal = (type) => {
        setReportConfig((prev) => ({ ...prev, type }));
        setModalType("date");
    };

    // NUEVO: Abrir modal de períodos (Inicial, Final, Comparativa)
    const openPeriodosModal = (type) => {
        setCurrentReportType(type);
        setSelectedPeriodo(periodoActual || "");
        setShowPeriodosModal(true);
    };

    // NUEVO: Imprimir con período seleccionado
    const handlePrintWithPeriodo = () => {
        if (!selectedPeriodo) {
            return toast.warning("Seleccione un período escolar.");
        }

        window.open(
            route("estudiantesExport", {
                type: currentReportType,
                periodo: selectedPeriodo,
            }),
            "_blank",
        );
        setShowPeriodosModal(false);
        setSelectedPeriodo("");
    };

    // NUEVO: Abrir modal de calificaciones finales
    const openCalificacionesModal = () => {
        setShowPeriodoModal(true);
    };

    const confirmarImpresionFecha = () => {
        const tiposMensuales = [
            "ingresos-egresos-mensuales",
            "cambio-de-grado",
        ];

        const month_year = tiposMensuales.includes(reportConfig.type)
            ? `${reportConfig.year}-${String(reportConfig.month).padStart(2, "0")}`
            : `${reportConfig.year}-01`;

        window.open(
            route("estudiantesExport", { type: reportConfig.type, month_year }),
            "_blank",
        );
        setModalType(null);
    };

    const executeHistoricPrint = () => {
        if (!reportConfig.selectedPeriod)
            return toast.warning("Seleccione un periodo");

        window.open(
            route("estudiantesExport", {
                type: reportConfig.type,
                periodo: reportConfig.selectedPeriod,
            }),
            "_blank",
        );
        setModalType(null);
    };

    const handlePrintCalificaciones = () => {
        if (!selectedPeriodoModal) {
            return toast.warning("Seleccione un período escolar.");
        }

        window.open(
            route("estudiantesExport", {
                type: "listado-general-aprobados-reprobados",
                periodoId: selectedPeriodoModal,
            }),
            "_blank",
        );
        setShowPeriodoModal(false);
        setSelectedPeriodoModal("");
    };

    const handlePrint = () => {
        window.open(
            route("estudiantesExport", { type: "reporte-sisge" }),
            "_blank",
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Impresiones Generales" />

            <ViewContainer
                title="DOCUMENTACIÓN GENERAL"
                subtitle="Documentos generales"
                showSearch={false}
                returns={
                    <Link href={route("estudiantes.impresiones.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* COLUMNA 1: FORMATOS DIGITALES Y ESTADÍSTICA */}
                    <div className="bg-white rounded-2xl p-3 border-2 border-emerald-100 shadow-sm">
                        <p className="text-[9px] font-black text-emerald-600 uppercase mb-3 ml-2 tracking-tighter italic">
                            Formatos y Estadísticas
                        </p>
                        <div className="space-y-2">
                            <GeneralReportCard
                                icon={
                                    <FileSpreadsheet className="text-emerald-600" />
                                }
                                title="Matrícula General (Excel)"
                                desc="Data completa exportable"
                                onClick={() =>
                                    handlePrintDirect("listado-excell-general")
                                }
                            />
                            <GeneralReportCard
                                icon={<FileText className="text-red-500" />}
                                title="Matrícula PDF"
                                desc="Resumen de totales institucional"
                                onClick={() =>
                                    handlePrintDirect("matricula-pdf-general")
                                }
                            />
                            <GeneralReportCard
                                icon={<Shirt className="text-indigo-600" />}
                                title="Data de Uniformes"
                                desc="Tallas referenciales por grado"
                                onClick={() =>
                                    handlePrintDirect("data-uniforme")
                                }
                            />
                            <GeneralReportCard
                                icon={<PieChart className="text-purple-600" />}
                                title="Matrícula Edad/Grado"
                                desc="Distribución demográfica"
                                onClick={() =>
                                    handlePrintDirect("matricula-discriminada")
                                }
                            />
                            <GeneralReportCard
                                icon={<PieChart className="text-purple-600" />}
                                title="Ficha para inscribir"
                                desc="Ficha de registro general"
                                onClick={() =>
                                    handlePrintDirect("ficha-de-registro")
                                }
                            />
                        </div>
                    </div>

                    {/* COLUMNA 2: DINÁMICA ESCOLAR (FECHAS) */}
                    <div className="bg-white rounded-2xl p-3 border-2 border-blue-100 shadow-sm">
                        <p className="text-[9px] font-black text-blue-600 uppercase mb-3 ml-2 tracking-tighter italic">
                            Movimientos y Cambios
                        </p>
                        <div className="space-y-2">
                            <GeneralReportCard
                                icon={<UserMinus className="text-rose-600" />}
                                title="Matrícula Repitiente"
                                desc="Listado de alumnos repitientes"
                                onClick={() =>
                                    handlePrintDirect("matricula-repitiente")
                                }
                            />
                            <GeneralReportCard
                                icon={<MoonStar className="text-emerald-600" />}
                                title="M. por Condición"
                                desc="Alumnos por estatus especial"
                                onClick={() =>
                                    handlePrintDirect("matricula-por-condicion")
                                }
                            />
                            <GeneralReportCard
                                icon={
                                    <GitPullRequestDraft className="text-indigo-600" />
                                }
                                title="Cambios en Grado"
                                desc="Historial de transferencias"
                                onClick={() => openDateModal("cambio-de-grado")}
                            />
                            <GeneralReportCard
                                icon={
                                    <GitPullRequestArrow className="text-blue-600" />
                                }
                                title="Ingresos y Egresos Mensuales"
                                desc="Movimientos mensuales"
                                onClick={() =>
                                    openDateModal("ingresos-egresos-mensuales")
                                }
                            />
                            <GeneralReportCard
                                icon={
                                    <GraduationCap className="text-purple-600" />
                                }
                                title="Calificaciones Finales"
                                desc="Aprobados / Reprobados / Graduados"
                                onClick={openCalificacionesModal}
                            />
                        </div>
                    </div>

                    {/* COLUMNA 3: HISTÓRICOS (PERIODOS) */}
                    <div className="bg-white rounded-2xl p-3 border-2 border-purple-100 shadow-sm">
                        <p className="text-[9px] font-black text-purple-600 uppercase mb-3 ml-2 tracking-tighter italic">
                            Registros Históricos
                        </p>
                        <div className="space-y-2">
                            <GeneralReportCard
                                icon={
                                    <CalendarRange className="text-green-600" />
                                }
                                title="Ingresos y Egresos Anuales"
                                desc="Consolidado de todo el año"
                                onClick={() =>
                                    openDateModal("ingresos-egresos-anuales")
                                }
                            />
                            <GeneralReportCard
                                icon={<FilePlus2 className="text-purple-600" />}
                                title="Matrícula Inicial"
                                desc="Cierre de inscripción inicial"
                                onClick={() =>
                                    openPeriodosModal("matricula-inicial")
                                }
                            />
                            <GeneralReportCard
                                icon={<FileMinus2 className="text-blue-600" />}
                                title="Matrícula Final"
                                desc="Resultados de fin de periodo"
                                onClick={() =>
                                    openPeriodosModal("matricula-final")
                                }
                            />
                            <GeneralReportCard
                                icon={<BarChart3 className="text-rose-600" />}
                                title="Matrícula Comparativa"
                                desc="Estadística institucional"
                                onClick={() =>
                                    openPeriodosModal("matricula-oficial")
                                }
                            />
                            <GeneralReportCard
                                icon={<File className="text-blue-400" />}
                                title="Matrícula Sisge"
                                desc="Estadística general"
                                onClick={handlePrint}
                            />
                        </div>
                    </div>
                </div>

                {/* --- MODAL DE FECHAS (MES/AÑO) --- */}
                {modalType === "date" &&
                    createPortal(
                        <ModalWrapper
                            icon={<CalendarRange size={24} />}
                            title={
                                [
                                    "ingresos-egresos-mensuales",
                                    "cambio-de-grado",
                                ].includes(reportConfig.type)
                                    ? "Reporte Mensual"
                                    : "Reporte Anual"
                            }
                            subtitle="Seleccione periodo de consulta"
                            onClose={() => setModalType(null)}
                        >
                            <div className="space-y-4 w-full mb-6">
                                <Field
                                    label="Año Escolar / Fiscal"
                                    type="number"
                                    autoAcentos={false}
                                    value={reportConfig.year}
                                    onChange={(e) =>
                                        setReportConfig({
                                            ...reportConfig,
                                            year: e.target.value,
                                        })
                                    }
                                />
                                {[
                                    "ingresos-egresos-mensuales",
                                    "cambio-de-grado",
                                ].includes(reportConfig.type) && (
                                    <SelectField
                                        label="Mes del Reporte"
                                        value={reportConfig.month}
                                        options={[
                                            { v: 1, l: "Enero" },
                                            { v: 2, l: "Febrero" },
                                            { v: 3, l: "Marzo" },
                                            { v: 4, l: "Abril" },
                                            { v: 5, l: "Mayo" },
                                            { v: 6, l: "Junio" },
                                            { v: 7, l: "Julio" },
                                            { v: 8, l: "Agosto" },
                                            { v: 9, l: "Septiembre" },
                                            { v: 10, l: "Octubre" },
                                            { v: 11, l: "Noviembre" },
                                            { v: 12, l: "Diciembre" },
                                        ]}
                                        onChange={(e) =>
                                            setReportConfig({
                                                ...reportConfig,
                                                month: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </div>
                            <Button
                                variant="primary"
                                className="w-full py-7 rounded-2xl font-black uppercase text-[10px] shadow-lg"
                                onClick={confirmarImpresionFecha}
                            >
                                Generar Documento
                            </Button>
                        </ModalWrapper>,
                        document.body,
                    )}

                {/* --- MODAL DE PERIODOS HISTÓRICOS (Inicial, Final, Comparativa) --- */}
                {showPeriodosModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border-4 border-purple-400 relative"
                            >
                                <button
                                    onClick={() => {
                                        setShowPeriodosModal(false);
                                        setSelectedPeriodo("");
                                    }}
                                    className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <History size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                                        {currentReportType ===
                                            "matricula-inicial" &&
                                            "Matrícula Inicial"}
                                        {currentReportType ===
                                            "matricula-final" &&
                                            "Matrícula Final"}
                                        {currentReportType ===
                                            "matricula-oficial" &&
                                            "Matrícula Comparativa"}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500 mt-2">
                                        Seleccione el período escolar
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <SelectField
                                        label="Período Escolar *"
                                        value={selectedPeriodo}
                                        onChange={(e) =>
                                            setSelectedPeriodo(e.target.value)
                                        }
                                        optionSelecName="SELECCIONAR PERÍODO"
                                        options={periodos.map((p) => ({
                                            v: p.nombre_periodo,
                                            l: p.nombre_periodo,
                                        }))}
                                        required
                                    />
                                </div>

                                <div className="mt-6 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                    <p className="text-[9px] font-black text-purple-600 uppercase text-center">
                                        ⚠️ Se generará el reporte para el
                                        período seleccionado
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setShowPeriodosModal(false);
                                            setSelectedPeriodo("");
                                        }}
                                        className="flex-1 h-12 rounded-2xl font-black"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handlePrintWithPeriodo}
                                        className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 rounded-2xl font-black shadow-xl"
                                    >
                                        <Printer size={16} className="mr-2" />
                                        Imprimir
                                    </Button>
                                </div>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL CALIFICACIONES FINALES --- */}
                {showPeriodoModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border-4 border-purple-400 relative"
                            >
                                <button
                                    onClick={() => {
                                        setShowPeriodoModal(false);
                                        setSelectedPeriodoModal("");
                                    }}
                                    className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <GraduationCap size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                                        Calificaciones Finales
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500 mt-2">
                                        Seleccione el período escolar
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Aprobados / Reprobados / Graduados
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <SelectField
                                        label="Período Escolar *"
                                        value={selectedPeriodoModal}
                                        onChange={(e) =>
                                            setSelectedPeriodoModal(
                                                e.target.value,
                                            )
                                        }
                                        optionSelecName="SELECCIONAR PERÍODO"
                                        options={periodos.map((p) => ({
                                            v: p.id,
                                            l: p.nombre_periodo,
                                        }))}
                                        required
                                    />
                                </div>

                                <div className="mt-6 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                    <p className="text-[9px] font-black text-purple-600 uppercase text-center">
                                        ⚠️ Se generará el listado completo de
                                        estudiantes
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setShowPeriodoModal(false);
                                            setSelectedPeriodoModal("");
                                        }}
                                        className="flex-1 h-12 rounded-2xl font-black"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handlePrintCalificaciones}
                                        className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 rounded-2xl font-black shadow-xl"
                                    >
                                        <Printer size={16} className="mr-2" />
                                        Imprimir
                                    </Button>
                                </div>
                            </motion.div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

// --- SUB-COMPONENTES ---
const GeneralReportCard = ({ icon, title, desc, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-3 bg-slate-50 border border-blue-600 rounded-2xl hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all group text-left"
    >
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <div>
            <p className="font-black text-[11px] uppercase text-slate-800 leading-tight mb-0.5">
                {title}
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter leading-none italic">
                {desc}
            </p>
        </div>
    </button>
);

const ModalWrapper = ({ icon, title, subtitle, children, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-3xl animate-in zoom-in-95 relative border border-white text-center flex flex-col items-center">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"
            >
                <X size={24} />
            </button>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-4 ring-indigo-50/50">
                {icon}
            </div>
            <h3 className="text-lg font-black text-gray-800 uppercase italic tracking-tighter mb-1">
                {title}
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2">
                {subtitle}
            </p>
            {children}
        </div>
    </div>
);
