import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer"; // Ajustado a la ruta del index
import { Button } from "@/Components/ui/button";
import { Head, Link, router, useForm } from "@inertiajs/react";
import * as Icons from "lucide-react"; // Importación unificada
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Gestion({ evaluaciones, periodosExistentes, filters }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [fCargoPDF, setFCargoPDF] = useState("");

    const form = useForm({
        id: null,
        nombres: "",
        puntuacion: 0,
        periodo_actual: "",
        periodo_evaluacion: "",
    });

    const handleImprimir = () => {
        if (!fCargoPDF || !filters.periodo_evaluacion) {
            return toast.warning("ATENCIÓN", {
                description:
                    "Seleccione periodo y tipo de cargo para el reporte.",
            });
        }
        window.open(
            route("empleados.acciones.evaluaciones.reporte.general", {
                periodo: filters.periodo_evaluacion,
                cargo_tipo: fCargoPDF,
                anio: filters.anio,
            }),
            "_blank",
        );
    };

    // Función para manejar filtros y búsqueda (SPA)
    const handleFilterChange = (key, value) => {
        router.get(
            route("empleados.acciones.evaluaciones.gestion"),
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Archivo de Evaluaciones" />
            <ViewContainer
                title="Gestión de Resultados"
                subtitle="Archivo histórico y edición de puntajes"
                icon="FileSearch"
                showSearch={true}
                searchValue={filters.search || ""}
                onSearch={(val) => handleFilterChange("search", val)}
                currentPage={evaluaciones.current_page}
                totalPages={evaluaciones.last_page}
                onPageChange={(p) => handleFilterChange("page", p)}
                extraFilters={
                    <div className="flex gap-3">
                        <select
                            value={filters.periodo_evaluacion || ""}
                            onChange={(e) =>
                                handleFilterChange(
                                    "periodo_evaluacion",
                                    e.target.value,
                                )
                            }
                            className="h-10 w-44 bg-white border-slate-500 border text-gray-600 rounded-2xl text-[10px] font-black uppercase px-4 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        >
                            <option value="">Todos los Periodos</option>
                            {periodosExistentes.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        <select
                            value={fCargoPDF}
                            onChange={(e) => setFCargoPDF(e.target.value)}
                            className="h-10 w-44 bg-white text-gray-600 border-indigo-400 border-2 rounded-2xl text-[10px] font-black uppercase px-4 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        >
                            <option value="">Filtrar Cargo PDF</option>
                            <option value="Administrativo">
                                Administrativo
                            </option>
                            <option value="Obrero">Obrero</option>
                        </select>
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <Link
                            href={route(
                                "empleados.acciones.evaluaciones.index",
                            )}
                        >
                            <Button>
                                <Icons.ArrowLeftCircle size={18} /> VOLVER
                            </Button>
                        </Link>

                        <Button
                            onClick={handleImprimir}
                            variant="warning" // Rojo para PDF
                            className="rounded-xl text-[10px] font-black gap-2 shadow-lg shadow-rose-100"
                        >
                            <Icons.Printer size={16} /> GENERAR REPORTE PDF
                        </Button>
                    </div>
                }
            >
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase italic tracking-widest">
                                <th className="px-8 py-5 text-left">
                                    Ficha de Empleado
                                </th>
                                <th className="px-8 py-5 text-left">
                                    Periodo / Lapso Evaluado
                                </th>
                                <th className="px-8 py-5 text-center">
                                    Puntaje Final
                                </th>
                                <th className="px-8 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                            {evaluaciones.data.map((ev) => (
                                <tr
                                    key={ev.id}
                                    className="hover:bg-indigo-50/30 transition-all group"
                                >
                                    <td className="px-8 py-4 text-left">
                                        <p className="font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                                            {ev.empleado.nombres}{" "}
                                            {ev.empleado.apellidos}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                            CÉDULA: {ev.empleado.cedula}
                                        </p>
                                    </td>
                                    <td className="px-8 py-4 text-left uppercase">
                                        <div className="flex items-center gap-2">
                                            <Icons.Calendar
                                                size={12}
                                                className="text-indigo-500"
                                            />
                                            <p className="font-black text-slate-700">
                                                {ev.periodo_actual}
                                            </p>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold italic ml-5">
                                            {ev.periodo_evaluacion}
                                        </p>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span
                                            className={`px-5 py-2 rounded-2xl font-mono font-black text-[11px] inline-flex items-center gap-2 ${
                                                ev.puntuacion >= 400
                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    : "bg-amber-100 text-amber-700 border border-amber-200"
                                            }`}
                                        >
                                            {ev.puntuacion >= 400 ? (
                                                <Icons.Award size={14} />
                                            ) : (
                                                <Icons.CheckCircle size={14} />
                                            )}
                                            {ev.puntuacion} PTS
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                form.setData({
                                                    ...ev,
                                                    nombres: `${ev.empleado.nombres} ${ev.empleado.apellidos}`,
                                                });
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                                        >
                                            <Icons.Edit3 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {evaluaciones.data.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <Icons.Inbox size={48} className="text-slate-200" />
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                No se encontraron evaluaciones archivadas
                            </p>
                        </div>
                    )}
                </div>
            </ViewContainer>

            {/* MODAL DE EDICIÓN (ESTILO INDEX) */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-3xl border-t-8 border-indigo-500"
                        >
                            <div className="bg-slate-50 p-10 text-center border-b">
                                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Icons.Award size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic text-slate-800 leading-none">
                                    Ajustar Calificación
                                </h3>
                                <p className="text-indigo-600 text-[11px] font-black uppercase mt-3 tracking-widest">
                                    {form.data.nombres}
                                </p>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.put(
                                        route(
                                            "empleados.acciones.evaluaciones.update",
                                            form.data.id,
                                        ),
                                        {
                                            onSuccess: () => {
                                                setIsEditModalOpen(false);
                                             
                                            },
                                        },
                                    );
                                }}
                                className="p-10 space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
                                            Periodo Actual
                                        </p>
                                        <p className="text-xs font-black text-indigo-900">
                                            {form.data.periodo_actual}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
                                            Lapso Fiscal
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-500 italic">
                                            {form.data.periodo_evaluacion}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 block mb-3 tracking-widest">
                                        Puntuación del Funcionario (1 - 500)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="500"
                                            required
                                            value={form.data.puntuacion}
                                            onChange={(e) =>
                                                form.setData(
                                                    "puntuacion",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-center text-5xl font-black text-indigo-600 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                                        />
                                        <Icons.ChevronRight
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200"
                                            size={32}
                                        />
                                        <Icons.ChevronLeft
                                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200"
                                            size={32}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsEditModalOpen(false)
                                        }
                                        className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px]"
                                    >
                                        CANCELAR
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={form.processing}
                                        className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 font-black uppercase text-[10px] shadow-xl shadow-indigo-100"
                                    >
                                        <Icons.Save
                                            size={16}
                                            className="mr-2"
                                        />{" "}
                                        ACTUALIZAR DATOS
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
