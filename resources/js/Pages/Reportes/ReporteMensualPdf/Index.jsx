import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import * as Icons from "lucide-react";
import { Button } from "@/Components/ui/button";

import Swal from "sweetalert2";

export default function ReporteAsistencia({ cargos, meses, anios, filters }) {
    const [reportParams, setReportParams] = useState({
        cargoId: filters?.cargoId || "",
        month:
            filters?.month ||
            String(new Date().getMonth() + 1).padStart(2, "0"),
        year: filters?.year || new Date().getFullYear(),
    });

    const handlePrint = () => {
        // Validar que se haya seleccionado un cargo
        if (!reportParams.cargoId) {
            Swal.fire({
                icon: "error",
                title: "Faltan datos",
                text: "Por favor, seleccione un cargo para generar el reporte.",
                confirmButtonColor: "#4f46e5",
            });
            return;
        }

        // Parámetros para REPORTE DE ASISTENCIAS
        const params = {
            type: "reporte-de-asistencias",
            cargoId: reportParams.cargoId,
            month: reportParams.month,
            year: reportParams.year,
        };

        // Generar URL y abrir en nueva pestaña
        const url = route("ExportDocumentosEmpleados", params);
        window.open(url, "_blank");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reporte de Asistencias" />

            <ViewContainer
                title="Reporte de Asistencias Mensuales"
                subtitle="Reporte de la matricula formato PDF"
                icon="ListCheck"
                showSearch={false}
                actions={
                    <Link href={route("recursos.index")}>
                        <Button>
                            <Icons.ChevronLeftCircle size={14} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="max-w-2xl mx-auto mt-4 space-y-6 p-1">
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-3">
                            <Icons.Info className="text-indigo-600" size={20} />
                            <p className="text-[11px] font-black text-indigo-800 uppercase italic">
                                El reporte exportará la asistencia general del
                                mes y año seleccionado.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                        <div className="bg-blue-600 px-8 py-4 flex items-center gap-3">
                            <Icons.FileSpreadsheet
                                className="text-white"
                                size={24}
                            />
                            <h3 className="text-white font-black uppercase italic tracking-wider text-sm">
                                Configuración de Exportación
                            </h3>
                        </div>

                        <div className="p-3">
                            <div className="flex-1 space-y-6 gap-8">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Icons.Building2 size={12} />
                                        Cargo
                                    </label>
                                    <select
                                        value={reportParams.cargoId}
                                        onChange={(e) =>
                                            setReportParams({
                                                ...reportParams,
                                                cargoId: e.target.value,
                                            })
                                        }
                                        className="w-full bg-transparent border rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none appearance-none transition-all"
                                    >
                                        <option value="" disabled>
                                            -- SELECCIONE --
                                        </option>
                                        {cargos.map((cargo) => (
                                            <option
                                                key={cargo.id}
                                                value={cargo.id}
                                            >
                                                {cargo.nombre_del_cargo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Icons.Calendar size={12} />
                                        Mes
                                    </label>
                                    <select
                                        value={reportParams.month}
                                        onChange={(e) =>
                                            setReportParams({
                                                ...reportParams,
                                                month: e.target.value,
                                            })
                                        }
                                        className="w-full bg-transparent border rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none appearance-none transition-all"
                                    >
                                        {meses.map((mes) => (
                                            <option
                                                key={mes.val}
                                                value={mes.val}
                                            >
                                                {mes.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Icons.Calendar size={12} />
                                        Año
                                    </label>
                                    <select
                                        value={reportParams.year}
                                        onChange={(e) =>
                                            setReportParams({
                                                ...reportParams,
                                                year: e.target.value,
                                            })
                                        }
                                        className="w-full bg-transparent border rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none appearance-none transition-all"
                                    >
                                        {anios.map((anio) => (
                                            <option key={anio} value={anio}>
                                                {anio}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handlePrint}
                                    className="w-full h-14 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Icons.Printer size={18} />
                                    Generar Reporte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ViewContainer>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
