"use client";
import React, { useState, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, Link, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
dayjs.locale("es");

export default function Index({
    cargos,
    totalesGeneral,
    fechaSeleccionada,
    fechaFormateada,
    estatusDia,
    puedeRegistrarVigilante,
}) {
    const dateInputRef = useRef(null);
    const [activeMissingMenu, setActiveMissingMenu] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);
    const [descripcion, setDescripcion] = useState("");
    const [processing, setProcessing] = useState(false);
    const [reportMenuOpen, setReportMenuOpen] = useState(false);
    const [reportParams, setReportParams] = useState({
        cargoId: "",
    });
    const navigateDate = (fecha) => {
        router.get(
            route("recursos.asistencia.empleados.index"),
            { fecha },
            { preserveState: true },
        );
    };

    const changeDay = (offset) => {
        const d = dayjs(fechaSeleccionada).add(offset, "day");
        navigateDate(d.format("YYYY-MM-DD"));
    };

    // --- LÓGICA DE ESTADOS VIBRANTES ---
    const getCargoStatus = (cargo) => {
        const isVigilante = cargo.nombre_del_cargo
            .toLowerCase()
            .includes("vigilante");
        const isLocked = isVigilante && !puedeRegistrarVigilante;

        if (isLocked)
            return {
                color: "text-amber-500",
                bg: "bg-amber-50",
                gradient: "from-amber-500 to-orange-600",
                shadow: "shadow-amber-500/40",
                label: "Restringido",
                icon: <Icons.Lock size={20} />,
            };

        if (
            cargo.total_procesados >= cargo.total_plantilla &&
            cargo.total_plantilla > 0
        )
            return {
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                gradient: "from-emerald-500 to-teal-600",
                shadow: "shadow-emerald-500/40",
                label: "Completado",
                icon: <Icons.ShieldCheck size={20} />,
            };

        if (cargo.total_procesados > 0)
            return {
                color: "text-orange-500",
                bg: "bg-orange-50",
                gradient: "from-orange-400 to-amber-600",
                shadow: "shadow-orange-500/40",
                label: "Incompleto",
                icon: <Icons.Activity size={20} />,
            };

        if (cargo.fechas_faltantes?.length > 0)
            return {
                color: "text-rose-500",
                bg: "bg-rose-50",
                gradient: "from-rose-500 to-red-600",
                shadow: "shadow-rose-500/40",
                label: "Pendientes",
                icon: <Icons.AlertCircle size={20} />,
            };

        return {
            color: "text-blue-500",
            bg: "bg-blue-50",
            gradient: "from-blue-500 to-indigo-600",
            shadow: "shadow-blue-500/40",
            label: "Por Cargar",
            icon: <Icons.Users size={20} />,
        };
    };

    const handleSaveFestivos = () => {
        if (selectedDates.length === 0)
            return toast.error("Seleccione al menos una fecha");
        Swal.fire({
            title: "¿JUSTIFICAR FECHAS?",
            text: "Se marcarán como días no laborables para este cargo.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            customClass: { popup: "rounded-[2rem] font-sans" },
        }).then((result) => {
            if (result.isConfirmed) {
                setProcessing(true);
                router.post(
                    route("settings.festivos.asistencia.store"),
                    { fechas: selectedDates, descripcion: descripcion },
                    {
                        onFinish: () => {
                            setProcessing(false);
                            setActiveMissingMenu(null);
                            setSelectedDates([]);
                            setDescripcion("");
                        },
                    },
                );
            }
        });
    };
    const [isGenerating, setIsGenerating] = useState(false);

    // Función para generar el PDF
    const generarReporte = () => {
        // Validación: debe seleccionar un cargo o "Todos"
        if (!reportParams.cargoId) {
            toast.error(
                '⚠️ Por favor, selecciona un cargo o "Todos" para generar el reporte',
                {
                    position: "top-center",
                    autoClose: 3000,
                },
            );
            return;
        }

        setIsGenerating(true);

        try {
            const url = route("ExportDocumentosEmpleados", {
                type: "listado-de-asistencias",
                cargoId: reportParams.cargoId,
            });

            window.open(url, "_blank");

            toast.success("📄 Generando PDF...", {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            toast.error("❌ Error al generar el PDF. Intenta nuevamente.", {
                position: "top-right",
                autoClose: 4000,
            });
        } finally {
            setIsGenerating(false);
        }
    };
 

    return (
        <AuthenticatedLayout>
            <Head title="Control de Asistencias" />
            <ViewContainer
                title="GESTIÓN DE ASISTENCIAS"
                subtitle="Registro y actualización de asistencias"
                icon="Activity"
                showSearch={false}
                actions={
                    <div className="flex items-center gap-2">
                        <Link href={route("recursos.index")}>
                            <Button>
                                <Icons.ChevronLeftCircle size={14} /> VOLVER
                            </Button>
                        </Link>
                        <Link
                            href={route("recursos.asistencia.empleados.edit")}
                        >
                            <Button variant="success" size="sm">
                                ACTUALIZAR ASISTENCIAS
                            </Button>
                        </Link>
                        <div className="relative">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() =>
                                    setReportMenuOpen(!reportMenuOpen)
                                }
                            >
                                <Icons.Printer size={16} /> LISTADOS PARA
                                ASISTENCIAS
                            </Button>

                            <AnimatePresence>
                                {reportMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() =>
                                                setReportMenuOpen(false)
                                            }
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-3 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-slate-400 p-8 z-50 text-center"
                                        >
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase italic tracking-widest mb-6">
                                                Listado por Cargo
                                            </h4>
                                            <select
                                                value={
                                                    reportParams.cargoId || ""
                                                }
                                                onChange={(e) =>
                                                    setReportParams({
                                                        ...reportParams,
                                                        cargoId: e.target.value,
                                                    })
                                                }
                                                className="w-full p-2 border text-gray-800 border-slate-600 rounded-xl text-sm mb-4"
                                            >
                                                <option value="" disabled>
                                                    Seleccionar cargo...
                                                </option>
                                                <option value="todos">
                                                    Todos los cargos
                                                </option>
                                                {cargos.map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.nombre_del_cargo}
                                                    </option>
                                                ))}
                                            </select>

                                            <Button
                                                variant="primary"
                                                onClick={generarReporte}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Icons.Loader
                                                            size={16}
                                                            className="animate-spin mr-2"
                                                        />
                                                        GENERANDO...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Icons.FileText
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        GENERAR PDF
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                }
                actionFooter={
                    <div className="flex gap-6 items-center">
                        <span className="flex items-center gap-2 text-[15px] font-black uppercase text-blue-600 italic">
                            <Icons.Mars size={14} /> VARONES:{" "}
                            {totalesGeneral.varones}
                        </span>
                        <span className="flex items-center gap-2 text-[15px] font-black uppercase text-rose-600 italic">
                            <Icons.Venus size={14} /> HEMBRAS:{" "}
                            {totalesGeneral.hembras}
                        </span>
                        <div className="px-4 py-1 bg-slate-900 text-white rounded-full text-[15px] font-black">
                            TOTAL: {totalesGeneral.total}
                        </div>
                    </div>
                }
            >
                {/* NAVEGADOR DE FECHAS */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <button
                            onClick={() => changeDay(-1)}
                            className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-blue-600"
                        >
                            <Icons.ChevronLeft size={24} />
                        </button>

                        <div
                            onClick={() => dateInputRef.current?.showPicker()}
                            className="flex flex-col items-center px-12 border-x border-slate-100 cursor-pointer group"
                        >
                            <input
                                type="date"
                                ref={dateInputRef}
                                className="absolute opacity-0 pointer-events-none"
                                value={fechaSeleccionada}
                                onChange={(e) => navigateDate(e.target.value)}
                            />
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                                Registro Diario
                            </span>
                            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                                {fechaFormateada}
                            </h2>
                        </div>

                        <button
                            onClick={() => changeDay(1)}
                            className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-blue-600"
                        >
                            <Icons.ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {estatusDia.es_no_laborable ? (
                    <div className="flex flex-col items-center justify-center p-32">
                        <Icons.CalendarX size={100} color="red" />
                        <h3 className="text-2xl font-black text-rose-500 uppercase italic tracking-widest mt-6">
                            {estatusDia.motivo}
                        </h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-8 overflow-y-auto custom-scrollbar">
                        {cargos.map((cargo) => {
                            const status = getCargoStatus(cargo);
                            const isLocked =
                                cargo.nombre_del_cargo
                                    .toLowerCase()
                                    .includes("vigilante") &&
                                !puedeRegistrarVigilante;
                            const tieneFaltas =
                                cargo.fechas_faltantes?.length > 0;

                            return (
                                <motion.div
                                    key={cargo.id}
                                    whileHover={!isLocked ? { y: -10 } : {}}
                                    className="relative group"
                                >
                                    {tieneFaltas && !isLocked && (
                                        <button
                                            onClick={() =>
                                                setActiveMissingMenu(cargo.id)
                                            }
                                            className="absolute -top-3 -right-2 z-30 w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 animate-bounce border-4 border-white"
                                        >
                                            <Icons.AlertCircle
                                                size={24}
                                                strokeWidth={3}
                                            />
                                        </button>
                                    )}

                                    <div
                                        className={`relative h-[340px] rounded-[2.8rem] p-8 bg-white border border-slate-100 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-500 ${isLocked ? "opacity-40 grayscale" : "hover:shadow-blue-500/20"}`}
                                    >
                                        <div
                                            className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${status.gradient} opacity-[0.04] rounded-full group-hover:scale-125 transition-transform duration-700`}
                                        />

                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div
                                                    className={`p-4 rounded-2xl bg-gradient-to-br ${status.gradient} text-white shadow-xl ${status.shadow}`}
                                                >
                                                    {status.icon}
                                                </div>
                                                <span
                                                    className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full tracking-[0.2em] border border-slate-50 shadow-sm bg-white ${status.color}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </div>
                                            <h4 className="text-[13px] font-black text-slate-900 uppercase italic leading-tight tracking-tighter">
                                                {cargo.nombre_del_cargo}
                                            </h4>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                Personal de Plantilla
                                            </p>
                                        </div>

                                        <div className="space-y-5 relative z-10">
                                            {cargo.total_asistentes > 0 ? (
                                                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-3 rounded-[1.5rem] border border-slate-100 shadow-inner text-center">
                                                    <div>
                                                        <p className="text-[14px] font-black text-blue-600 italic">
                                                            M:{" "}
                                                            {
                                                                cargo.varones_asistentes
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="border-x border-slate-200">
                                                        <p className="text-[14px] font-black text-rose-500 italic">
                                                            F:{" "}
                                                            {
                                                                cargo.hembras_asistentes
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-black text-slate-900 italic">
                                                            T:{" "}
                                                            {
                                                                cargo.total_asistentes
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                        Sin registros
                                                    </p>
                                                </div>
                                            )}

                                            {cargo.total_procesados <
                                            cargo.total_plantilla ? (
                                                <Button
                                                    disabled={isLocked}
                                                    onClick={() =>
                                                        router.get(
                                                            route(
                                                                "recursos.asistencia.empleados.create",
                                                                {
                                                                    cargo_id:
                                                                        cargo.id,
                                                                    fecha: fechaSeleccionada,
                                                                },
                                                            ),
                                                        )
                                                    }
                                                    className={`w-full h-14 rounded-2xl shadow-lg border-2 border-dashed ${isLocked ? "bg-slate-100" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900"}`}
                                                >
                                                    {isLocked ? (
                                                        <Icons.Lock size={14} />
                                                    ) : (
                                                        <Icons.Zap
                                                            size={14}
                                                            className="fill-current"
                                                        />
                                                    )}
                                                    {isLocked
                                                        ? "BLOQUEADO"
                                                        : cargo.total_procesados >
                                                            0
                                                          ? "COMPLETAR"
                                                          : "INICIAR CARGA"}
                                                </Button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <Icons.CheckCircle2
                                                        size={16}
                                                        className="text-emerald-600"
                                                    />
                                                    <span className="text-[10px] font-black text-emerald-700 uppercase italic">
                                                        Finalizado
                                                    </span>
                                                </div>
                                            )}

                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${(cargo.total_procesados / cargo.total_plantilla) * 100}%`,
                                                    }}
                                                    className={`h-full bg-gradient-to-r ${status.gradient}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </ViewContainer>

           
            {/* MODAL JUSTIFICACIÓN - CORE EDITION */}
            <AnimatePresence>
                {activeMissingMenu && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-white p-10 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8 border-b pb-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">
                                    Justificar Fechas Pendientes
                                </h3>
                                <button
                                    onClick={() => setActiveMissingMenu(null)}
                                    className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"
                                >
                                    <Icons.X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-60 space-y-2 mb-8 pr-2">
                                {cargos
                                    .find((c) => c.id === activeMissingMenu)
                                    ?.fechas_faltantes.map((f, i) => (
                                        <label
                                            key={i}
                                            className="flex items-center justify-between p-3 bg-slate-50 border border-slate-400 rounded-2xl cursor-pointer hover:bg-white hover:shadow-md transition-all group"
                                        >
                                            <span className="text-[11px] font-bold text-slate-600 uppercase italic">
                                                {f.formato_humano}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={selectedDates.includes(
                                                    f.fecha,
                                                )}
                                                className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                                onChange={() =>
                                                    setSelectedDates((prev) =>
                                                        prev.includes(f.fecha)
                                                            ? prev.filter(
                                                                  (d) =>
                                                                      d !==
                                                                      f.fecha,
                                                              )
                                                            : [
                                                                  ...prev,
                                                                  f.fecha,
                                                              ],
                                                    )
                                                }
                                            />
                                        </label>
                                    ))}
                            </div>

                            <Field
                                label="Descripción de la Justificación *"
                                placeholder="EJ: SUSPENSIÓN POR LLUVIAS"
                                upperCase
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            />

                            <div className="mt-8 flex flex-col gap-3">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full h-16 rounded-2xl"
                                    loading={processing}
                                    disabled={
                                        selectedDates.length === 0 ||
                                        !descripcion
                                    }
                                    onClick={handleSaveFestivos}
                                >
                                    <Icons.Save size={18} /> CONFIRMAR
                                    JUSTIFICACIÓN
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
