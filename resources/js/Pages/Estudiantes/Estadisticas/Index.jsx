import React, { useState, useRef, useMemo } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import LoadingSpinner from "@/Components/LoadingSpinner";
import {
    Printer,
    CheckCircle2,
    CalendarCheck,
    BarChart3,
    X,
    ScatterChart,
    ChevronLeftCircle,
    CheckSquare,
    Square,
    Users,
    UserCheck,
    FileText,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function EstadisticaIndex({
    grades,
    estadistica,
    availableMonths,
    selectedMonthInitial,
    mostrarAlertaMesAnterior,
    mostrarAlertaMesEspecial,
    mesAnteriorNombre,
    anioAnterior,
    mesActualNombre,
    anioActual,
    esMesEspecialActual,
}) {
    // --- ESTADOS ---
    const [modalCreate, setModalCreate] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        selectedMonthInitial || "",
    );
    const inputFocusRef = useRef(null);
    const [modalManual, setModalManual] = useState(false);
    const [manualConfig, setManualConfig] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    // --- ESTADO PARA SELECCIÓN MÚLTIPLE ---
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const formCreate = useForm({
        fecha: estadistica?.fecha || "",
        dias_habiles: estadistica?.dias_habiles || 0,
        dias_laborados: estadistica?.dias_laborados || 0,
        status: estadistica?.status || "Activo",
    });

    // --- HANDLERS DE SELECCIÓN ---
    const toggleGradeSelection = (gradeId) => {
        setSelectedGrades((prev) => {
            if (prev.includes(gradeId)) {
                return prev.filter((id) => id !== gradeId);
            } else {
                return [...prev, gradeId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedGrades([]);
        } else {
            setSelectedGrades(grades.map((g) => g.id));
        }
        setSelectAll(!selectAll);
    };

    const clearSelection = () => {
        setSelectedGrades([]);
        setSelectAll(false);
    };

    // --- ESTADÍSTICAS DE SELECCIÓN ---
    const selectionStats = useMemo(() => {
        const totalSelected = selectedGrades.length;
        const totalGrades = grades.length;
        const selectedWithPrint = grades.filter(
            (g) => selectedGrades.includes(g.id) && g.status_estadistica > 0,
        ).length;
        const totalPrints = grades.reduce(
            (sum, g) =>
                selectedGrades.includes(g.id)
                    ? sum + (g.status_estadistica || 0)
                    : sum,
            0,
        );
        const totalStudents = grades.reduce(
            (sum, g) =>
                selectedGrades.includes(g.id)
                    ? sum + (g.total_students || 0)
                    : sum,
            0,
        );
        return {
            totalSelected,
            totalGrades,
            selectedWithPrint,
            totalPrints,
            totalStudents,
        };
    }, [selectedGrades, grades]);

    // --- LÓGICA DE COLORES DE BOTONES ---
    const getButtonColor = (count) => {
        if (!selectedMonth || count === 0)
            return "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100";
        if (count === 1)
            return "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100";
        if (count === 2)
            return "bg-amber-500 hover:bg-amber-600 shadow-amber-100";
        if (count === 3)
            return "bg-orange-600 hover:bg-orange-700 shadow-orange-100";
        return "bg-red-600 hover:bg-red-700 shadow-red-100";
    };

    // --- HANDLERS ---
    const handleMonthChange = (e) => {
        const val = e.target.value;
        setSelectedMonth(val);
        setSelectedGrades([]);
        setSelectAll(false);
        router.get(
            route("estudiantes.acciones.estadisticas.index"),
            { month_year: val },
            { preserveScroll: true, preserveState: true },
        );
    };

    const openCreateModal = (tipo = "mesAnterior") => {
        const hoy = new Date();
        let fechaParaEstadistica;
        formCreate.setData({
            ...formCreate.data,
            dias_habiles: "",
            dias_laborados: "",
        });
        if (tipo === "mesActual") {
            fechaParaEstadistica = hoy.toISOString().split("T")[0];
        } else {
            const mesAnterior = new Date(
                hoy.getFullYear(),
                hoy.getMonth() - 1,
                1,
            );
            fechaParaEstadistica = mesAnterior.toISOString().split("T")[0];
        }

        formCreate.setData("fecha", fechaParaEstadistica);
        setModalCreate(true);
    };

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        if (formCreate.data.dias_laborados > formCreate.data.dias_habiles) {
            return toast.error("Error: Días laborados exceden a los hábiles.");
        }

        formCreate.post(route("estudiantes.acciones.estadisticas.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setModalCreate(false);
            },
        });
    };

    // Impresión individual
    const handlePrint = (gradoId) => {
        if (!selectedMonth) return toast.warning("Seleccione un mes primero.");

        const params = new URLSearchParams({
            month_year: selectedMonth,
            type: "estadistica-por-grado",
            gradoId: gradoId,
        });

        const url = route("estudiantesExport") + "?" + params.toString();
        window.open(url, "_blank");

        setTimeout(() => router.reload({ only: ["grades"] }), 2000);
    };

    // Impresión múltiple
    const handlePrintMultiple = () => {
        if (!selectedMonth) return toast.warning("Seleccione un mes primero.");
        if (selectedGrades.length === 0)
            return toast.warning("Seleccione al menos un grado.");

        const params = new URLSearchParams({
            month_year: selectedMonth,
            type: "estadistica-por-grado",
            gradoIds: selectedGrades.join(","),
        });

        const url = route("estudiantesExport") + "?" + params.toString();
        window.open(url, "_blank");

        setTimeout(() => router.reload({ only: ["grades"] }), 3000);
        toast.success(
            `Generando estadísticas para ${selectedGrades.length} grado(s)`,
        );
    };

    // --- IMPRESIÓN GENERAL ---
    const handlePrintGeneral = () => {
        if (!selectedMonth) {
            toast.warning("Selecciona un mes para las estadísticas generales.");
            return;
        }

        const url = route("estudiantesExport", {
            month_year: selectedMonth,
            type: "estadistica-general",
        });

        window.open(url, "_blank");
    };

    // --- IMPRESIÓN MANUAL ---
    const handlePrintManual = () => {
        setModalManual(true);
    };

    const confirmPrintManual = () => {
        const url = route("estudiantesExport", {
            type: "estadistica-manual",
            month: manualConfig.month,
            year: manualConfig.year,
        });
        window.open(url, "_blank");
        setModalManual(false);
    };

    // --- OBTENER ESTADO DE IMPRESIÓN ---
    const getPrintStatus = (status) => {
        if (status === 0)
            return {
                label: "Pendiente",
                color: "text-slate-50 bg-yellow-500",
            };
        if (status === 1)
            return {
                label: "1 impresión",
                color: "text-emerald-600 bg-emerald-50",
            };
        if (status === 2)
            return {
                label: "2 impresiones",
                color: "text-amber-600 bg-amber-50",
            };
        if (status === 3)
            return {
                label: "3 impresiones",
                color: "text-orange-600 bg-orange-50",
            };
        return {
            label: `${status} impresiones`,
            color: "text-red-600 bg-red-50",
        };
    };

    return (
        <AuthenticatedLayout>
            <Head title="Control de Estadísticas" />

            <ViewContainer
                title="ESTADÍSTICA MENSUAL"
                subtitle="Cierre de registros de asistencia y rendimiento por sección"
                icon="BarChart3"
                showSearch={false}
                returns={
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route(
                                "estudiantes.acciones.index",
                            )}
                        >
                            <Button>
                                <ChevronLeftCircle size={16} className="mr-2" />{" "}
                                VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={() => openCreateModal("mesAnterior")}
                            className="text-blue-600 underline ml-2"
                        >
                            Cerrar mes ahora
                        </Button>
                        <Link
                            href={route(
                                "estudiantes.acciones.estadisticas.show",
                                { id: 0 },
                            )}
                        >
                            <Button className="bg-blue-600">
                                <BarChart3 size={16} className="mr-2" />
                                HISTORIAL
                            </Button>
                        </Link>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                            onClick={handlePrintManual}
                        >
                            <ScatterChart size={16} className="mr-2" />
                            Estadística Manual
                        </Button>
                    </div>
                }
            >
                {formCreate.processing && (
                    <LoadingSpinner fullScreen text="Procesando cierre..." />
                )}

                <div className="space-y-4 p-1">
                    {/* PANEL DE CONTROL */}
                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-xl">
                        {/* Fila superior: título y selector de mes */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                            {/* <div className="flex items-center gap-3">
                                <Printer
                                    size={28}
                                    className="text-indigo-600"
                                />
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase italic">
                                        Generación de Reportes
                                    </h3>
                                    {selectedMonth && estadistica && (
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-0.5 rounded-lg uppercase">
                                                Hábiles:{" "}
                                                {estadistica.dias_habiles}
                                            </span>
                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-0.5 rounded-lg uppercase">
                                                Laborados:{" "}
                                                {estadistica.dias_laborados}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            <div className="flex flex-wrap items-center gap-3 mb-0 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                <div>
                                    {/* <span className="text-xs font-black text-slate-800 uppercase italic">
                                        Generación de Reportes
                                    </span> */}

                                    {selectedMonth && estadistica && (
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-0.5 rounded-lg uppercase">
                                                Dias Hábiles:{" "}
                                                {estadistica.dias_habiles}
                                            </span>
                                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-0.5 rounded-lg uppercase">
                                                Dias Laborados:{" "}
                                                {estadistica.dias_laborados}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="h-6 w-px bg-slate-300" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="flex items-center gap-2 text-[10px] font-black text-slate-600 hover:text-indigo-600 transition-colors"
                                    >
                                        {selectAll ? (
                                            <CheckSquare
                                                size={18}
                                                className="text-indigo-600"
                                            />
                                        ) : (
                                            <Square
                                                size={18}
                                                className="text-slate-400"
                                            />
                                        )}
                                        {selectAll
                                            ? "Deseleccionar Todos"
                                            : "Imprimir Todos"}
                                    </button>
                                </div>

                                <div className="h-6 w-px bg-slate-300" />

                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500">
                                    <span>
                                        <Users
                                            size={14}
                                            className="inline mr-1 text-indigo-500"
                                        />
                                        {selectionStats.totalSelected} de{" "}
                                        {selectionStats.totalGrades} grados
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span>
                                        <FileText
                                            size={14}
                                            className="inline mr-1 text-emerald-500"
                                        />
                                        {selectionStats.totalPrints} impresiones
                                    </span>
                                    <span className="text-slate-300">|</span>
                                </div>

                                {selectedGrades.length > 0 && (
                                    <>
                                        <div className="h-6 w-px bg-slate-300" />

                                        <Button
                                            onClick={handlePrintMultiple}
                                            className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black text-[10px] shadow-lg shadow-indigo-100"
                                        >
                                            <Printer
                                                size={14}
                                                className="mr-1"
                                            />
                                            Imprimir Selección (
                                            {selectedGrades.length})
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="w-full lg:w-72">
                                <select
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    className="w-full h-10 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-xs font-black uppercase text-indigo-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                >
                                    <option value="">
                                        Seleccione el Mes a Consultar
                                    </option>
                                    {availableMonths.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* TABLA DE GRADOS */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="w-full border-collapse">
                                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-center w-12">
                                            <button
                                                onClick={toggleSelectAll}
                                                className="text-white/70 hover:text-white transition-colors"
                                                disabled={!selectedMonth}
                                            >
                                                {selectAll ? (
                                                    <CheckSquare size={18} />
                                                ) : (
                                                    <Square size={18} />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">
                                            Grado / Sección
                                        </th>
                                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">
                                            Docente
                                        </th>
                                        {/* <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="flex items-center justify-center gap-1">
                                                <Users size={14} /> Estudiantes
                                            </span>
                                        </th>
                                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="flex items-center justify-center gap-1">
                                                <Users
                                                    size={14}
                                                    className="text-blue-400"
                                                />{" "}
                                                V
                                            </span>
                                        </th>
                                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="flex items-center justify-center gap-1">
                                                <Users
                                                    size={14}
                                                    className="text-pink-400"
                                                />{" "}
                                                H
                                            </span>
                                        </th> */}
                                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {grades.map((grade, index) => {
                                        const isSelected =
                                            selectedGrades.includes(grade.id);
                                        const printStatus = getPrintStatus(
                                            grade.status_estadistica || 0,
                                        );
                                        const totalStudents =
                                            grade.total_students || 0;
                                        const maleStudents =
                                            grade.male_students || 0;
                                        const femaleStudents =
                                            grade.female_students || 0;

                                        return (
                                            <tr
                                                key={grade.id}
                                                className={`transition-colors hover:bg-slate-50/70 ${
                                                    isSelected
                                                        ? "bg-indigo-50/50"
                                                        : ""
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() =>
                                                            toggleGradeSelection(
                                                                grade.id,
                                                            )
                                                        }
                                                        disabled={
                                                            !selectedMonth
                                                        }
                                                        className="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare
                                                                size={18}
                                                                className="text-indigo-600"
                                                            />
                                                        ) : (
                                                            <Square size={18} />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`
                                                            w-8 h-8 rounded-xl flex items-center justify-center 
                                                            font-black text-xs text-white
                                                            ${getButtonColor(grade.status_estadistica || 0)}
                                                        `}
                                                        >
                                                            {grade.nombre_del_grado?.charAt(
                                                                0,
                                                            ) || "G"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800 uppercase leading-tight">
                                                                {
                                                                    grade.nombre_del_grado
                                                                }
                                                            </p>
                                                            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                                                                Sección{" "}
                                                                {grade.seccion ||
                                                                    "U"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {grade.docente ||
                                                            "Sin asignar"}
                                                    </span>
                                                </td>
                                                {/* <td className="px-4 py-3 text-center">
                                                    <span className="text-sm font-black text-slate-700">
                                                        {totalStudents}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-sm font-black text-blue-600">
                                                        {maleStudents}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-sm font-black text-pink-600">
                                                        {femaleStudents}
                                                    </span>
                                                </td> */}
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`
                                                        text-[9px] font-black uppercase px-3 py-1 rounded-full
                                                        ${printStatus.color}
                                                    `}
                                                    >
                                                        {printStatus.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handlePrint(
                                                                grade.id,
                                                            )
                                                        }
                                                        disabled={
                                                            !selectedMonth
                                                        }
                                                        className={`
                                                            p-2 rounded-xl transition-all
                                                            ${!selectedMonth ? "opacity-30 cursor-not-allowed" : ""}
                                                            ${
                                                                grade.status_estadistica >
                                                                0
                                                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                                                    : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                                            }
                                                        `}
                                                        title={
                                                            grade.status_estadistica >
                                                            0
                                                                ? `Reimprimir (${grade.status_estadistica} copias previas)`
                                                                : "Imprimir por primera vez"
                                                        }
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer: Botón de impresión general */}
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <Button
                                onClick={handlePrintGeneral}
                                disabled={!selectedMonth}
                                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 rounded-2xl shadow-2xl shadow-emerald-100 font-black uppercase text-xs tracking-widest"
                            >
                                <Printer size={18} className="mr-2" /> Imprimir
                                Consolidado General
                            </Button>

                            {selectedGrades.length > 0 && (
                                <Button
                                    onClick={handlePrintMultiple}
                                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-2xl shadow-indigo-100 font-black uppercase text-xs tracking-widest"
                                >
                                    <Printer size={18} className="mr-2" />
                                    Imprimir Seleccionados (
                                    {selectedGrades.length})
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </ViewContainer>

            {/* MODAL REGISTRAR (Portal Neon) */}
            {modalCreate &&
                createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                            <button
                                onClick={() => setModalCreate(false)}
                                className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                            >
                                <X size={28} />
                            </button>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                                    <CalendarCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                                        Cierre de Mes
                                    </h3>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-2">
                                        Configuración de días laborales
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmitCreate}
                                className="space-y-6"
                            >
                                <Field
                                    label="Fecha de Referencia *"
                                    type="date"
                                    value={formCreate.data.fecha}
                                    onChange={(e) =>
                                        formCreate.setData(
                                            "fecha",
                                            e.target.value,
                                        )
                                    }
                                    error={formCreate.errors.fecha}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Días Hábiles *"
                                        type="number"
                                        value={formCreate.data.dias_habiles}
                                        onChange={(e) =>
                                            formCreate.setData(
                                                "dias_habiles",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Field
                                        label="Días Laborados *"
                                        type="number"
                                        value={formCreate.data.dias_laborados}
                                        onChange={(e) =>
                                            formCreate.setData(
                                                "dias_laborados",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    loading={formCreate.processing}
                                    className="w-full h-16 bg-indigo-600 rounded-3xl font-black shadow-xl"
                                >
                                    FINALIZAR Y REGISTRAR
                                </Button>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* MODAL PARA SELECCIONAR MES Y AÑO DE ESTADÍSTICA MANUAL */}
            {modalManual &&
                createPortal(
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-100">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ScatterChart size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                    Configurar Planilla
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Selecciona el periodo para generar las
                                    fechas
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                        Mes
                                    </label>
                                    <select
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-black uppercase p-3"
                                        value={manualConfig.month}
                                        onChange={(e) =>
                                            setManualConfig({
                                                ...manualConfig,
                                                month: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="1">Enero</option>
                                        <option value="2">Febrero</option>
                                        <option value="3">Marzo</option>
                                        <option value="4">Abril</option>
                                        <option value="5">Mayo</option>
                                        <option value="6">Junio</option>
                                        <option value="7">Julio</option>
                                        <option value="8">Agosto</option>
                                        <option value="9">Septiembre</option>
                                        <option value="10">Octubre</option>
                                        <option value="11">Noviembre</option>
                                        <option value="12">Diciembre</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                        Año
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-black p-3"
                                        value={manualConfig.year}
                                        onChange={(e) =>
                                            setManualConfig({
                                                ...manualConfig,
                                                year: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-xl uppercase font-black text-[10px]"
                                        onClick={() => setModalManual(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl uppercase font-black text-[10px]"
                                        onClick={confirmPrintManual}
                                    >
                                        Generar PDF
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
