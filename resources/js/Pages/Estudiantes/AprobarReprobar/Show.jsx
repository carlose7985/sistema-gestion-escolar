import React, { useState, useEffect, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import {
    Save,
    CheckCircle2,
    XCircle,
    ArrowLeftCircle,
    CalendarDays,
    X,
    AlertTriangle,
    Check,
} from "lucide-react";
import { toast } from "sonner";

export default function Show({
    grado,
    estudiantes,
    apreciaciones,
    showFechaModal,
    periodoEscolarActual,
}) {
    const [isDateModalOpen, setIsDateModalOpen] = useState(showFechaModal);
    const [hasChanges, setHasChanges] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [pendingVisit, setPendingVisit] = useState(null);

    // REF CRUCIAL: Para saltar el bloqueo de forma instantánea
    const hasChangesRef = useRef(false);

    // --- FORMULARIO DE EVALUACIÓN ---
    const formEval = useForm({
        grado_id: grado.id,
        resultados: estudiantes.map((e) => ({
            estudiante_id: e.id,
            estado: null,
            apreciacion: null,
        })),
    });

    const formFecha = useForm({
        periodo_escolar: periodoEscolarActual || "",
        fecha: "",
    });

    // Sincronizar cambios en el formulario con la referencia
    const updateChangesStatus = (status) => {
        setHasChanges(status);
        hasChangesRef.current = status;
    };

    // --- LÓGICA DE AUTOMATIZACIÓN ---
    const handleApreciacionChange = (index, value) => {
        updateChangesStatus(true); // Marcamos cambios
        const copia = [...formEval.data.resultados];
        copia[index].apreciacion = value;

        if (!value) {
            copia[index].estado = null;
        } else {
            const aprobados = [
                "A",               
                "B",               
                "C",
                "D",
            ];
            copia[index].estado = aprobados.includes(value)
                ? "Aprobado"
                : "Reprobado";
        }

        formEval.setData("resultados", copia);
        formEval.clearErrors(`resultados.${index}.apreciacion`);
    };

    const guardarResultados = (e, isExiting = false) => {
        if (e) e.preventDefault();

        formEval.clearErrors();
        let tieneErrores = false;
        const nuevosErrores = {};

        formEval.data.resultados.forEach((res, index) => {
            if (!res.apreciacion) {
                nuevosErrores[`resultados.${index}.apreciacion`] = "Requerido";
                tieneErrores = true;
            }
        });

        if (tieneErrores) {
            formEval.setError(nuevosErrores);
            return toast.error("Faltan alumnos por evaluar");
        }

        // Bloqueamos cambios antes de enviar
        updateChangesStatus(false);

        formEval.post(route("estudiantes.activos.aprobar.reprobar.store"), {
            preserveScroll: true,
            onError: () => updateChangesStatus(true), // Si falla, volvemos a proteger
        });
    };

    const guardarFechaEntrega = (e) => {
        e.preventDefault();
        formFecha.post(route("estudiantes.activos.fecha.entrega.documentos.store"), {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setIsDateModalOpen(false);
                formFecha.reset();
                toast.success("Fecha de entrega configurada");
            },
        });
    };

    // Interceptor de Navegación Profesional
    useEffect(() => {
        const unregister = router.on("before", (event) => {
            // Si la navegación es interna de la misma página (ej: recarga), dejamos pasar
            if (event.detail.visit.url === window.location.href) return;

            // Si hay cambios según la REF (valor instantáneo)
            if (hasChangesRef.current) {
                event.preventDefault();
                setPendingVisit(event);
                setShowExitModal(true);
            }
        });

        return () => unregister();
    }, []);

    // Interceptor de cierre de pestaña
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasChanges]);

    return (
        <AuthenticatedLayout>
            <Head title={`Evaluando ${grado.nombre_del_grado}`} />

            <ViewContainer
                title={`CARGA DE CALIFICACIONES: ${grado.nombre_del_grado} "${grado.seccion}"`}
                subtitle="El estatus académico se calcula automáticamente según el literal asignado"
                showSearch={false}
                returns={
                    <div className="flex items-center gap-2">
                        <Link
                            href={route("estudiantes.activos.aprobar.reprobar.index")}
                        >
                            <Button>
                                <ArrowLeftCircle size={14} className="mr-2" />{" "}
                                VOLVER
                            </Button>
                        </Link>
                    </div>
                }
                footerStats={
                    <div className="flex items-center justify-between w-full px-2">
                        {/* LADO IZQUIERDO: ESTADÍSTICAS Y PERIODO */}
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">
                                    Periodo Culminado:
                                </span>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[11px] font-black">
                                    {periodoEscolarActual}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 border-l border-slate-200 pl-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[7px] font-black text-gray-800 uppercase leading-none mb-1">
                                        Aprobados
                                    </span>
                                    <span className="text-lg font-black text-emerald-500 leading-none">
                                        {
                                            formEval.data.resultados.filter(
                                                (r) => r.estado === "Aprobado",
                                            ).length
                                        }
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[7px] font-black text-gray-800 uppercase leading-none mb-1">
                                        Reprobados
                                    </span>
                                    <span className="text-lg font-black text-rose-500 leading-none">
                                        {
                                            formEval.data.resultados.filter(
                                                (r) => r.estado === "Reprobado",
                                            ).length
                                        }
                                    </span>
                                </div>

                                {/* TOTAL CALIFICADOS */}
                                <div className="flex flex-col items-center border-l border-slate-200 pl-6">
                                    <span className="text-[7px] font-black text-gray-800 uppercase leading-none mb-1">
                                        Total Calificados
                                    </span>
                                    <span className="text-lg font-black text-indigo-500 leading-none">
                                        {
                                            formEval.data.resultados.filter(
                                                (r) =>
                                                    r.estado === "Aprobado" ||
                                                    r.estado === "Reprobado",
                                            ).length
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            >
                <div className="flex flex-col h-full gap-3">
                    <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm flex-1">
                        <div
                            className="h-full overflow-auto custom-scrollbar"
                            style={{ maxHeight: "calc(100vh - 240px)" }}
                        >
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-20 bg-slate-900 text-white uppercase text-[9px] font-black tracking-widest italic">
                                    <tr>
                                        <th className="px-4 py-4 text-center w-12 border-r border-white/10">
                                            N°
                                        </th>
                                        <th className="px-6 py-4 text-left border-r border-white/10">
                                            Ficha del Estudiante
                                        </th>
                                        <th className="px-6 py-4 text-center w-56 border-r border-white/10">
                                            Asignar Literal
                                        </th>
                                        <th className="px-6 py-4 text-center w-48">
                                            Status Resultante
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px]">
                                    {estudiantes.map((est, index) => {
                                        const res =
                                            formEval.data.resultados[index];
                                        const hasError =
                                            formEval.errors[
                                                `resultados.${index}.apreciacion`
                                            ];
                                        return (
                                            <tr
                                                key={est.id}
                                                className={`border-b border-slate-300 transition-colors ${hasError ? "bg-rose-50" : "hover:bg-slate-50/50"}`}
                                            >
                                                <td className="px-4 py-3 text-center font-black text-slate-700 border-r border-slate-50">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-3 border-r border-slate-50">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[12px] text-slate-700 uppercase">
                                                            {est.name}{" "}
                                                            {est.apellido}
                                                        </span>
                                                        <span className="text-[14px] font-bold text-slate-600 font-mono tracking-tighter">
                                                            C.I: {est.cedula}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 border-r border-slate-50">
                                                    <div className="flex flex-col items-center">
                                                        {/* En el select, puedes agrupar las opciones */}
                                                        <select
                                                            value={
                                                                res?.apreciacion ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleApreciacionChange(
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full max-w-[180px] bg-white border-2 uppercase text-gray-800 rounded-xl py-2 px-4 font-black transition-all appearance-none text-center cursor-pointer border-slate-200 hover:border-indigo-400"
                                                        >
                                                            <option value="">
                                                                Selecionar..
                                                            </option>

                                                            {/* Grupo de Aprobados */}
                                                            {apreciaciones
                                                                .filter(
                                                                    (a) =>
                                                                        a.status ===
                                                                        "Aprobado",
                                                                )
                                                                .map((a) => (
                                                                    <option
                                                                        key={
                                                                            a.id
                                                                        }
                                                                        value={
                                                                            a.nombre_completo
                                                                        }
                                                                        className="text-emerald-500 text-[16px] font-mono font-bold"
                                                                    >
                                                                        {" "}
                                                                        {
                                                                            a.nombre_completo
                                                                        }
                                                                    </option>
                                                                ))}

                                                            {/* Grupo de Reprobados */}
                                                            {apreciaciones
                                                                .filter(
                                                                    (a) =>
                                                                        a.status ===
                                                                        "Reprobado",
                                                                )
                                                                .map((a) => (
                                                                    <option
                                                                        key={
                                                                            a.id
                                                                        }
                                                                        value={
                                                                            a.nombre_completo
                                                                        }
                                                                        className="text-rose-600 text-[16px] font-mono font-bold"
                                                                    >
                                                                        {" "}
                                                                        {
                                                                            a.nombre_completo
                                                                        }
                                                                    </option>
                                                                ))}
                                                        </select>
                                                        {hasError && (
                                                            <span className="text-[7px] text-rose-600 font-black uppercase mt-1 animate-pulse">
                                                                Campo
                                                                Obligatorio
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center bg-slate-50/50">
                                                    {res?.estado ? (
                                                        <div
                                                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-sm border-2 ${res.estado === "Aprobado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                                                        >
                                                            {res.estado ===
                                                            "Aprobado" ? (
                                                                <CheckCircle2
                                                                    size={12}
                                                                />
                                                            ) : (
                                                                <XCircle
                                                                    size={12}
                                                                />
                                                            )}
                                                            {res.estado}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">
                                                            Esperando nota...
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Button
                        onClick={guardarResultados}
                        disabled={formEval.processing}
                        loading={formEval.processing}
                        className="h-10 px-8 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black shadow-lg shadow-emerald-100 text-[10px] tracking-widest"
                    >
                        <Save size={14} className="mr-2" /> FINALIZAR PROCESO
                    </Button>
                </div>

                {/* MODAL FECHA */}
                {isDateModalOpen &&
                    createPortal(
                        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-3xl border-2 border-orange-100 relative text-center">
                                {!showFechaModal && (
                                    <button
                                        onClick={() =>
                                            setIsDateModalOpen(false)
                                        }
                                        className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                )}
                                <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-orange-50/50">
                                    <CalendarDays size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                                    Fecha de Entrega
                                </h2>
                                <form
                                    onSubmit={guardarFechaEntrega}
                                    className="space-y-6 text-left mt-8"
                                >
                                    <Field
                                        label="Periodo Escolar"
                                        value={formFecha.data.periodo_escolar}
                                        readOnly
                                        className="bg-slate-50 opacity-60"
                                    />
                                    <Field
                                        label="Fecha de Documentos *"
                                        type="date"
                                        value={formFecha.data.fecha}
                                        onChange={(e) =>
                                            formFecha.setData(
                                                "fecha",
                                                e.target.value,
                                            )
                                        }
                                        error={formFecha.errors.fecha}
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        loading={formFecha.processing}
                                        className="w-full h-16 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black shadow-xl"
                                    >
                                        GUARDAR FECHA
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL ADVERTENCIA DE SALIDA (Neon Rose) */}
                {showExitModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-[0_0_50px_-12px_rgba(244,63,94,0.5)] border-2 border-rose-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() => setShowExitModal(false)}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={28} />
                                </button>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-8 ring-rose-50/50">
                                        <AlertTriangle
                                            size={42}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-2">
                                        ¡Cambios sin Guardar!
                                    </h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase leading-relaxed mb-10">
                                        Has realizado cambios en la evaluación.
                                        ¿Qué deseas hacer?
                                    </p>
                                    <div className="flex flex-col gap-3 w-full">
                                        <Button
                                            onClick={(e) => {
                                                setShowExitModal(false);
                                                guardarResultados(e);
                                            }}
                                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl"
                                        >
                                            <Save size={18} className="mr-2" />{" "}
                                            Guardar y Salir
                                        </Button>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    updateChangesStatus(false);
                                                    setShowExitModal(false);
                                                    if (pendingVisit)
                                                        pendingVisit.detail.visit();
                                                }}
                                                className="flex-1 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black uppercase text-[9px] hover:bg-rose-600 hover:text-white transition-all"
                                            >
                                                Descartar todo
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowExitModal(false)
                                                }
                                                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[9px] hover:bg-slate-200"
                                            >
                                                Seguir aquí
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
