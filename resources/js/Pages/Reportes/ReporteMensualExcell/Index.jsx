import React, { useState, useEffect, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import * as Icons from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "sonner";

export default function ReporteConsolidadoExcel() {
    // --- ESTADOS ---
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        mes: dayjs().month() + 1,
        anio: dayjs().year(),
    });

    const months = [
        { value: 1, label: "Enero" },
        { value: 2, label: "Febrero" },
        { value: 3, label: "Marzo" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Mayo" },
        { value: 6, label: "Junio" },
        { value: 7, label: "Julio" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Septiembre" },
        { value: 10, label: "Octubre" },
        { value: 11, label: "Noviembre" },
        { value: 12, label: "Diciembre" },
    ];

    // --- LÓGICA DE DESCARGA ---
   const generarReporte = async () => {
       setLoading(true);
       try {
           // ✅ USA EL NOMBRE DE LA RUTA: recursos.reportes.generar.excel
           // Ziggy se encarga de poner /reportes-asistencias/reportes/generar/excel
           const response = await axios.get(
               route("recursos.reportes.generar.excel"),
               {
                   params: {
                       mes: formData.mes,
                       anio: formData.anio,
                   },
                   responseType: "blob",
               },
           );

           const blobUrl = window.URL.createObjectURL(
               new Blob([response.data]),
           );
           const link = document.createElement("a");
           link.href = blobUrl;
           link.setAttribute(
               "download",
               `Reporte_Mensual_${formData.mes}_${formData.anio}.xlsx`,
           );
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);

           toast.success("EXCEL GENERADO CON ÉXITO");
       } catch (error) {
           console.error("Error descarga:", error);
           toast.error("Error 404: La ruta del reporte no fue encontrada");
       } finally {
           setLoading(false);
       }
   };

    return (
        <AuthenticatedLayout>
            <Head title="Reporte Final Excel" />

            <ViewContainer
                title="Reporte Consolidado de Asistencias Mensuales"
                subtitle="Reporte de la matricula formato EXCEL"
                icon="Sheet"
                showSearch={false}
                actions={
                    <Link href={route("recursos.index")}>
                        <Button>
                            <Icons.ChevronLeftCircle size={14} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="max-w-4xl mx-auto mt-4 space-y-6 p-1">
                    {/* ALERTA INFORMATIVA */}
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-3">
                            <Icons.Info className="text-indigo-600" size={20} />
                            <p className="text-[11px] font-black text-indigo-800 uppercase italic">
                                El reporte exportará la asistencia diaria de
                                todos los grados y secciones del mes
                                seleccionado.
                            </p>
                        </div>
                    </div>

                    {/* PANEL DE CONFIGURACIÓN */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-blue-600 px-8 py-4 flex items-center gap-3">
                            <Icons.FileSpreadsheet
                                className="text-white"
                                size={24}
                            />
                            <h3 className="text-white font-black uppercase italic tracking-wider text-sm">
                                Configuración de Exportación
                            </h3>
                        </div>

                        {/* Contenido */}
                        <div className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* SELECTOR DE MES */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                        <Icons.CalendarSearch size={14} />{" "}
                                        Seleccionar Mes
                                    </label>
                                    <select
                                        value={formData.mes}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mes: Number(e.target.value),
                                            })
                                        }
                                        className="w-full bg-slate-50 border-none rounded-2xl text-sm font-black uppercase text-slate-700 py-4 px-5 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    >
                                        {months.map((month) => (
                                            <option
                                                key={month.value}
                                                value={month.value}
                                            >
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* SELECTOR DE AÑO */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                        <Icons.CalendarDays size={14} /> Año
                                        Escolar
                                    </label>
                                    <input
                                        type="number"
                                        min="2020"
                                        value={formData.anio}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                anio: Number(e.target.value),
                                            })
                                        }
                                        className="w-full bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-700 py-4 px-5 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* BOTÓN DE ACCIÓN */}
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={generarReporte}
                                    disabled={loading}
                                    className="group relative flex items-center justify-center gap-3 px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-2xl hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Icons.Loader2
                                            className="animate-spin"
                                            size={20}
                                        />
                                    ) : (
                                        <Icons.Download size={20} />
                                    )}
                                    <span>
                                        {loading
                                            ? "Procesando Matriz..."
                                            : "Descargar Reporte Excel"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* DECORACIÓN INFERIOR */}
                        <div className="bg-slate-50 px-8 py-3 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                Formato: Microsoft Excel (.xlsx)
                            </span>
                            <span className="text-[9px] font-black text-emerald-500 uppercase italic">
                                Listo para impresión
                            </span>
                        </div>
                    </div>
                </div>
            </ViewContainer>

            <style>{`
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-3px);
                    }
                }
                .group-hover\\:bounce {
                    animation: bounce 0.8s infinite;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
