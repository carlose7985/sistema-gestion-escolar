"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/Ui/Button";
import { Head, Link, router, useForm } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs/dayjs.min.js";
import es from "dayjs/locale/es";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

dayjs.locale(es);

const normalizarTexto = (str) =>
    str
        ? str
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
        : "";

export default function TomarAsistencias({
    cargo,
    empleados,
    fecha,
    asistenciasPrevias,
    estadosSugeridos,
    abrirModalResumen,
}) {
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [initialState, setInitialState] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // ← NUEVO state local
    const searchInputRef = useRef(null);
    const isSavingRef = useRef(false);
    const isNavigatingRef = useRef(false);

    const form = useForm({
        fecha: fecha,
        asistencias: [],
    });

    // --- INICIALIZACIÓN DE ASISTENCIAS ---
    useEffect(() => {
        const initialAsistencias = (empleados || []).map((emp) => {
            const registroPrevio = asistenciasPrevias?.[emp.id];
            const sugerenciaBackend = estadosSugeridos?.[emp.id];

            let statusInicial = "Asistio";
            if (registroPrevio) statusInicial = registroPrevio.status;
            else if (sugerenciaBackend) statusInicial = sugerenciaBackend;

            return {
                empleado_id: emp.id,
                nombre: `${emp.nombres} ${emp.apellidos}`,
                status: statusInicial,
                tipo_de_cargo: emp.tipo_de_personal || "",
            };
        });

        form.setData("asistencias", initialAsistencias);
        setInitialState(JSON.stringify(initialAsistencias));

        if (abrirModalResumen && empleados?.length > 0) {
            setTimeout(() => setShowSummaryModal(true), 500);
        }

        const handleBeforeUnload = (e) => {
            if (
                hasChanges &&
                !isSavingRef.current &&
                !isNavigatingRef.current
            ) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    // --- DETECCIÓN DE CAMBIOS (DIRTY STATE) ---
    const hasChanges = useMemo(() => {
        if (!form.data.asistencias || !initialState) return false;
        return JSON.stringify(form.data.asistencias) !== initialState;
    }, [form.data.asistencias, initialState]);

    const handleStatusChange = (empleadoId, newStatus) => {
        const updated = form.data.asistencias.map((a) =>
            a.empleado_id === empleadoId ? { ...a, status: newStatus } : a,
        );
        form.setData("asistencias", updated);
        setSearchQuery("");
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 10);
    };

    const filteredAsistencias = useMemo(() => {
        const query = normalizarTexto(searchQuery);
        if (!query) return form.data.asistencias || [];
        return form.data.asistencias.filter((a) =>
            normalizarTexto(a.nombre).includes(query),
        );
    }, [form.data.asistencias, searchQuery]);

    const totales = useMemo(() => {
        const res = {
            asistio: 0,
            falto: 0,
            permiso: 0,
            total: form.data.asistencias?.length || 0,
        };
        form.data.asistencias?.forEach((a) => {
            if (a.status === "Asistio") res.asistio++;
            else if (a.status === "Falto") res.falto++;
            else if (a.status === "Permiso") res.permiso++;
        });
        return res;
    }, [form.data.asistencias]);

    // --- GUARDADO ---
    const submitFinal = (redirectUrl = null) => {
        if (isSavingRef.current || isSaving) return;

        isSavingRef.current = true;
        setIsSaving(true); // ← Activamos estado local

        const dataToSend = {
            fecha: fecha,
            asistencias: form.data.asistencias.map((a) => ({
                empleado_id: a.empleado_id,
                status: a.status,
            })),
        };

        router.post(route("recursos.asistencia.empleados.store"), dataToSend, {
            preserveScroll: true,
            onSuccess: () => {
                setInitialState(JSON.stringify(form.data.asistencias));
                isSavingRef.current = false;
                setIsSaving(false); // ← Desactivamos
                if (redirectUrl) router.visit(redirectUrl);
                
            },
            onError: () => {
                isSavingRef.current = false;
                setIsSaving(false); // ← Desactivamos
                toast.error("Error al guardar");
            },
        });
    };

    // --- PROTECCIÓN DE NAVEGACIÓN ---
    useEffect(() => {
        const unbind = router.on("before", (event) => {
            if (!hasChanges || isSavingRef.current || isNavigatingRef.current)
                return;
            event.preventDefault();
            setPendingNavigation(event.detail.visit.url);
            setShowUnsavedModal(true);
        });
        return () => unbind();
    }, [hasChanges]);

    return (
        <AuthenticatedLayout>
            <Head title={`Registro: ${cargo.nombre_del_cargo}`} />
            <ViewContainer
                title={`${cargo.nombre_del_cargo}`}
                subtitle="Control de asistencias"
                icon="UserCheck"
                showSearch={false}
                actions={
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Icons.Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                                size={16}
                            />
                            <input
                                ref={searchInputRef}
                                autoFocus
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="BUSCAR PERSONAL..."
                                className="pl-12 pr-6 h-9 bg-slate-50 text-gray-500 border-2 border-slate-400 rounded-3xl text-[11px] font-black uppercase italic focus:border-blue-500 focus:bg-white outline-none w-72 transition-all shadow-sm"
                            />
                        </div>

                        <Link
                            href={route("recursos.asistencia.empleados.index", {
                                fecha,
                            })}
                        >
                            <Button>
                                <Icons.ArrowLeftCircle size={16} /> VOLVER
                            </Button>
                        </Link>

                        <div className="h-10 w-[2px] bg-slate-100" />
                        <h2 className="text-xs font-black text-blue-600 uppercase italic tracking-tighter">
                            {dayjs(fecha).format("DD [de] MMMM")}
                        </h2>
                    </div>
                }
                actionFooter={
                    <div className="flex items-center gap-10 w-full justify-between">
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-xl font-black text-emerald-500 leading-none">
                                    {totales.asistio}
                                </p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Presentes
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-rose-500 leading-none">
                                    {totales.falto}
                                </p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Inasistencias
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-amber-500 leading-none">
                                    {totales.permiso}
                                </p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Permisos
                                </p>
                            </div>
                            <div className="text-center border-l border-slate-200 pl-8">
                                <p className="text-xl font-black text-blue-500 leading-none">
                                    {totales.total}
                                </p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Total Nómina
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => submitFinal()}
                            variant="success"
                            disabled={ isSaving}
                            className="min-w-[200px]" // ← Para evitar saltos
                        >
                            {isSaving ? (
                                <>
                                    <Icons.Loader2
                                        className="animate-spin"
                                        size={18}
                                    />
                                    GUARDANDO...
                                </>
                            ) : (
                                <>
                                    <Icons.Save size={18} /> FINALIZAR CARGA
                                </>
                            )}
                        </Button>
                    </div>
                }
            >
                <div className="p-2 h-full bg-[#f8fafc]">
                    <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-slate-950 text-white z-20">
                                    <tr className="text-[9px] font-black uppercase border border-slate-600 tracking-[0.2em] italic">
                                        <th className="px-10 py-4 text-left w-16">
                                            #
                                        </th>
                                        <th className="px-10 py-4 text-left">
                                            Identidad del Personal
                                        </th>
                                        <th className="px-10 py-4 text-center">
                                            Control de Estatus
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] font-bold text-slate-600 uppercase divide-y divide-slate-50">
                                    {filteredAsistencias.map((emp, index) => (
                                        <tr
                                            key={emp.empleado_id}
                                            className="hover:bg-blue-50/40 transition-all duration-300 group"
                                        >
                                            <td className="px-10 py-2 font-mono text-slate-300 text-xs">
                                                {index + 1}
                                            </td>
                                            <td className="px-10 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-xs tracking-tight group-hover:text-blue-600 transition-colors">
                                                        {emp.nombre}
                                                    </span>
                                                    <span className="text-[8px] text-slate-400 font-black mt-0.5 tracking-[0.1em]">
                                                        {emp.tipo_de_cargo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-2">
                                                <div className="flex justify-center gap-3 bg-slate-100/50 p-1.5 rounded-[1.8rem] w-fit mx-auto border border-slate-200/50">
                                                    {[
                                                        {
                                                            id: "Asistio",
                                                            label: "Presente",
                                                            icon: "Check",
                                                            color: "emerald",
                                                            glow: "shadow-emerald-500/40",
                                                        },
                                                        {
                                                            id: "Falto",
                                                            label: "Ausente",
                                                            icon: "X",
                                                            color: "rose",
                                                            glow: "shadow-rose-500/40",
                                                        },
                                                        {
                                                            id: "Permiso",
                                                            label: "Permiso",
                                                            icon: "Clock",
                                                            color: "amber",
                                                            glow: "shadow-amber-500/40",
                                                        },
                                                    ].map((st) => {
                                                        const IconComp =
                                                            Icons[st.icon];
                                                        const active =
                                                            emp.status ===
                                                            st.id;
                                                        return (
                                                            <button
                                                                key={st.id}
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        emp.empleado_id,
                                                                        st.id,
                                                                    )
                                                                }
                                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase transition-all duration-300 ${
                                                                    active
                                                                        ? `bg-${st.color}-500 text-white shadow-xl ${st.glow} scale-105`
                                                                        : "text-slate-400 hover:bg-white hover:text-slate-600"
                                                                }`}
                                                            >
                                                                <IconComp
                                                                    size={14}
                                                                    strokeWidth={
                                                                        4
                                                                    }
                                                                />
                                                                {active &&
                                                                    st.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ViewContainer>

            {/* MODAL CAMBIOS SIN GUARDAR */}
            <AnimatePresence>
                {showUnsavedModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-white overflow-hidden text-center"
                        >
                            <div className="bg-amber-500 p-12 text-white relative">
                                <Icons.AlertTriangle
                                    size={64}
                                    className="mx-auto mb-4 animate-bounce"
                                />
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                                    ¡Registros Pendientes!
                                </h3>
                                <p className="text-[10px] font-black uppercase mt-2 opacity-80">
                                    Hay cambios en la asistencia sin sincronizar
                                </p>
                            </div>
                            <div className="p-10 flex flex-col gap-3">
                                <Button
                                    variant="primary"
                                    size="xl"
                                    className="h-14 rounded-2xl"
                                    onClick={() =>
                                        submitFinal(pendingNavigation)
                                    }
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Icons.Loader2
                                                className="animate-spin"
                                                size={18}
                                            />
                                            GUARDANDO...
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Save size={18} /> GUARDAR Y
                                            CONTINUAR
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="warning"
                                    onClick={() => {
                                        isNavigatingRef.current = true;
                                        router.visit(pendingNavigation);
                                    }}
                                    disabled={isSaving}
                                >
                                    DESCARTAR Y SALIR
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowUnsavedModal(false)}
                                    disabled={isSaving}
                                >
                                    REGRESAR AL LISTADO
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
