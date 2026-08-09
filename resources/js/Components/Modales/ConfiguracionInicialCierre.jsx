import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Play, AlertCircle, CalendarDays } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useForm } from "@inertiajs/react"; // Cambiado a useForm de Inertia
import { toast } from "sonner";

export default function ConfiguracionInicialCierre({
    mostrar,
    mesSugerido,
    anioSugerido,
    periodoActivo,
    onSuccess,
}) {
    // Usamos useForm de Inertia en lugar de fetch manual
    const { data, setData, post, processing, errors } = useForm({
        mes: mesSugerido || new Date().getMonth() + 1,
        anio: anioSugerido || new Date().getFullYear(),
    });

    if (!mostrar) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Usamos la ruta de Inertia.
        // Asegúrate de que el nombre coincida con tu web.php (ej. 'cierres.iniciar')
        post(route("estudiantes.acciones.estadisticas.apertura"), {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
            },
            onError: (err) => {
                // Si el controlador devuelve errores de validación
                const firstError = Object.values(err)[0];
                toast.error(firstError || "Error al guardar la configuración");
            },
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl border-4 border-indigo-100 relative"
            >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200">
                        <CalendarDays size={28} className="text-white" />
                    </div>
                </div>

                <div className="text-center mt-6 mb-8">
                    <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight">
                        Configuración Inicial
                    </h2>
                    <p className="text-sm font-bold text-slate-400 uppercase mt-2">
                        No hay un ciclo de cierre configurado
                    </p>
                    <div className="w-24 h-1 bg-indigo-600 mx-auto mt-3 rounded-full" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-indigo-50/70 rounded-2xl p-6 border-2 border-indigo-100">
                        <div className="flex items-start gap-4">
                            <AlertCircle
                                size={20}
                                className="text-indigo-600 mt-0.5 shrink-0"
                            />
                            <div className="text-xs font-bold text-slate-600 leading-relaxed">
                                <p className="mb-2">
                                    <span className="text-indigo-700">
                                        📌 Configuración inicial:
                                    </span>
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-slate-500">
                                    <li>
                                        Este será el{" "}
                                        <span className="text-indigo-700 font-black">
                                            primer mes
                                        </span>{" "}
                                        abierto
                                    </li>
                                    <li>
                                        Los meses anteriores quedarán como{" "}
                                        <span className="text-amber-600 font-black">
                                            cerrados
                                        </span>
                                    </li>
                                </ul>
                                {periodoActivo && (
                                    <p className="mt-3 text-[10px] font-black text-indigo-600 bg-white/60 rounded-xl p-3 border border-indigo-200 uppercase">
                                        📅 Período activo:{" "}
                                        {periodoActivo.nombre_periodo}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-2">
                                Mes de Inicio *
                            </label>
                            <select
                                value={data.mes}
                                onChange={(e) =>
                                    setData("mes", parseInt(e.target.value))
                                }
                                className={`w-full h-14 bg-slate-50 border-2 rounded-2xl px-6 text-sm font-black text-slate-700 transition-all outline-none ${errors.mes ? "border-rose-500" : "border-slate-200 focus:border-indigo-500"}`}
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
                            {errors.mes && (
                                <p className="text-rose-500 text-[10px] mt-1 font-black uppercase">
                                    {errors.mes}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-2">
                                Año de Inicio *
                            </label>
                            <input
                                type="number"
                                value={data.anio}
                                onChange={(e) =>
                                    setData("anio", parseInt(e.target.value))
                                }
                                className={`w-full h-14 bg-slate-50 border-2 rounded-2xl px-6 text-sm font-black text-slate-700 transition-all outline-none ${errors.anio ? "border-rose-500" : "border-slate-200 focus:border-indigo-500"}`}
                            />
                            {errors.anio && (
                                <p className="text-rose-500 text-[10px] mt-1 font-black uppercase">
                                    {errors.anio}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1 h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-2xl font-black text-xs tracking-widest shadow-2xl shadow-indigo-100 disabled:opacity-50"
                        >
                            {processing ? "INICIANDO..." : "INICIAR CICLO"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body,
    );
}
