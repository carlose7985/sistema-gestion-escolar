"use client";
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import {
    Section,
    Field,
    SelectField,
} from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, useForm, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export default function ComedorIndex({ insumos = [], historialCierres = [] }) {
    // --- ESTADOS DE UI ---
    const [activeTab, setActiveTab] = useState("inventario");
    const [showRubroModal, setShowRubroModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showComensalesModal, setShowComensalesModal] = useState(false);
    const [mesReporte, setMesReporte] = useState(
        new Date().toISOString().slice(0, 7),
    );
    const [editInsumo, setEditInsumo] = useState(null);

    // --- FORMULARIO MOVIMIENTOS ---
    const formMov = useForm({
        insumo_id: "",
        tipo: "salida",
        cantidad: "",
        fecha: new Date().toISOString().split("T")[0],
        descripcion: "",
        // Campos adicionales para comensales (solo se envían cuando es salida)
        estudiantes: "",
        cocineros: "",
        personal: "",
    });

    // --- FORMULARIO NUEVO RUBRO ---
    const formRubro = useForm({
        nombre: "",
        unidad_medida: "",
        peso_medida: "",
    });

    // --- FORMULARIO EDITAR RUBRO ---
    const formEdit = useForm({
        nombre: "",
        unidad_medida: "",
        peso_medida: "",
    });

    const submitMov = (e) => {
        e.preventDefault();

        // Si es SALIDA, mostrar modal de comensales
        if (formMov.data.tipo === "salida") {
            setShowComensalesModal(true);
            return;
        }

        // Si es ENTRADA, enviar directamente
        formMov.post(route("comedor.movimiento.store"), {
            onSuccess: () => {
                formMov.reset("cantidad", "descripcion");
                toast.success("MOVIMIENTO REGISTRADO");
            },
        });
    };

    const submitComensales = (e) => {
        e.preventDefault();

        // Enviar el movimiento con los datos de comensales incluidos
        formMov.post(route("comedor.movimiento.store"), {
            onSuccess: () => {
                formMov.reset(
                    "cantidad",
                    "descripcion",
                    "estudiantes",
                    "cocineros",
                    "personal",
                );
                setShowComensalesModal(false);
                toast.success("MOVIMIENTO Y COMENSALES REGISTRADOS");
            },
            onError: () => {
                toast.error("Error al registrar");
            },
        });
    };

    const submitRubro = (e) => {
        e.preventDefault();
        formRubro.post(route("comedor.insumo.store"), {
            onSuccess: () => {
                formRubro.reset();
                setShowRubroModal(false);
                toast.success("RUBRO REGISTRADO");
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        formEdit.put(route("comedor.insumo.update", editInsumo.id), {
            onSuccess: () => {
                formEdit.reset();
                setShowEditModal(false);
                setEditInsumo(null);
                toast.success("RUBRO ACTUALIZADO");
            },
        });
    };

    const handleEdit = (insumo) => {
        setEditInsumo(insumo);
        formEdit.setData({
            nombre: insumo.nombre,
            unidad_medida: insumo.unidad_medida,
            peso_medida: insumo.peso_medida,
        });
        setShowEditModal(true);
    };

    // Calcular total de comensales
    const totalComensales =
        Number(formMov.data.estudiantes || 0) +
        Number(formMov.data.cocineros || 0) +
        Number(formMov.data.personal || 0);

    return (
        <AuthenticatedLayout>
            <Head title="Comedor y Despensa" />

            <ViewContainer
                title="GESTIÓN DE"
                titleBlue="DESPENSA"
                subtitle="Inventario de insumos y control de consumo diario"
                icon="Utensils"
                showSearch={false}
                returns={
                    <Link href={route("dashboard")}>
                        <Button>
                            <Icons.ChevronLeftCircle
                                size={16}
                                className="mr-2"
                            />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="success"
                            
                            onClick={() =>
                                (window.location.href = route(
                                    "comedor.salidas.index",
                                ))
                            }
                            className="shadow-blue-500/20"
                        >
                            <Icons.ArrowRight size={16} className="mr-2" />
                            VER SALIDAS
                        </Button>
                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => setShowRubroModal(true)}
                            className="shadow-emerald-500/20"
                        >
                            <Icons.PlusCircle size={16} className="mr-2" />{" "}
                            NUEVO RUBRO
                        </Button>
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => setShowReportModal(true)}
                            className="shadow-amber-500/20"
                        >
                            <Icons.Printer size={16} className="mr-2" /> REPORTE
                            PDF
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 h-full bg-[#f8fafc] overflow-hidden">
                    {/* IZQUIERDA: REGISTRO DE MOVIMIENTO */}
                    <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                        <Section
                            title="CARGA DE MOVIMIENTOS"
                            icon={<Icons.Zap size={18} />}
                            color="text-emerald-600"
                        >
                            <form onSubmit={submitMov} className="space-y-5">
                                <SelectField
                                    label="Seleccionar Rubro *"
                                    name="insumo_id"
                                    value={formMov.data.insumo_id}
                                    options={insumos.map((i) => ({
                                        v: i.id,
                                        l: `${i.nombre}${" "}${i.peso_medida}${i.unidad_medida} ${"-------->"}(${i.stock_actual} ${"Uni"})`,
                                    }))}
                                    onChange={(e) =>
                                        formMov.setData(
                                            "insumo_id",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />

                                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            formMov.setData("tipo", "salida")
                                        }
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${formMov.data.tipo === "salida" ? "bg-rose-500 text-white shadow-lg" : "text-slate-400 hover:bg-white"}`}
                                    >
                                        SALIDA (COCINA)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            formMov.setData("tipo", "entrada")
                                        }
                                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${formMov.data.tipo === "entrada" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:bg-white"}`}
                                    >
                                        ENTRADA (DESPACHO)
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Cantidad *"
                                        type="number"
                                        placeholder="0.00"
                                        value={formMov.data.cantidad}
                                        onChange={(e) =>
                                            formMov.setData(
                                                "cantidad",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Field
                                        label="Fecha de Operación *"
                                        type="date"
                                        value={formMov.data.fecha}
                                        onChange={(e) =>
                                            formMov.setData(
                                                "fecha",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <Field
                                    label="Detalle / Observación"
                                    placeholder="EJ: Almuerzo diario o despacho"
                                    value={formMov.data.descripcion}
                                    onChange={(e) =>
                                        formMov.setData(
                                            "descripcion",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    autoAcentos
                                />

                                <Button
                                    type="submit"
                                    variant="success"
                                    size="xl"
                                    className="w-full h-16 rounded-[1.8rem] shadow-xl"
                                    loading={formMov.processing}
                                >
                                    <Icons.Save size={18} className="mr-2" />{" "}
                                    CONFIRMAR REGISTRO
                                </Button>
                            </form>
                        </Section>
                    </div>

                    {/* DERECHA: TAB / PESTAÑAS */}
                    <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
                        <div className="flex bg-slate-200/50 p-1.5 rounded-[2rem] border border-slate-200 w-fit">
                            <button
                                onClick={() => setActiveTab("inventario")}
                                className={`flex items-center gap-3 px-8 py-3 rounded-[1.8rem] text-[10px] font-black uppercase italic transition-all ${activeTab === "inventario" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <Icons.Archive size={14} /> Inventario Actual
                            </button>
                            <button
                                onClick={() => setActiveTab("historial")}
                                className={`flex items-center gap-3 px-8 py-3 rounded-[1.8rem] text-[10px] font-black uppercase italic transition-all ${activeTab === "historial" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <Icons.History size={14} /> Historial de
                                Sobrantes
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                            <AnimatePresence mode="wait">
                                {activeTab === "inventario" ? (
                                    <motion.div
                                        key="inv"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden"
                                    >
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest italic">
                                                <tr>
                                                    <th className="px-8 py-5">
                                                        Nombre del Insumo
                                                    </th>
                                                    <th className="px-8 py-5 text-center">
                                                        Existencia (Unidad)
                                                    </th>
                                                    <th className="px-8 py-5 text-center">
                                                        Estatus
                                                    </th>
                                                    <th className="px-8 py-5 text-right">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[11px] font-bold text-slate-600 uppercase divide-y divide-slate-50">
                                                {insumos.map((i) => (
                                                    <tr
                                                        key={i.id}
                                                        className="hover:bg-blue-50/30 transition-all"
                                                    >
                                                        <td className="px-8 py-4 font-black text-slate-900">
                                                            {i.nombre}{" "}
                                                            {i.peso_medida}{" "}
                                                            {i.unidad_medida}
                                                        </td>
                                                        <td className="px-8 py-4 text-center">
                                                            <span
                                                                className={`px-4 py-1.5 rounded-xl border-2 font-mono ${i.stock_actual < 10 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}
                                                            >
                                                                {i.stock_actual}{" "}
                                                                {"Uni. "}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-4 text-center">
                                                            {i.stock_actual <
                                                            5 ? (
                                                                <span className="text-rose-500 animate-pulse font-black italic">
                                                                    BAJO STOCK
                                                                </span>
                                                            ) : (
                                                                <span className="text-green-900 font-black">
                                                                    DISPONIBLE
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        i,
                                                                    )
                                                                }
                                                                className="text-blue-600 hover:text-blue-800 transition-all p-2 hover:bg-blue-50 rounded-full"
                                                                title="Editar insumo"
                                                            >
                                                                <Icons.Edit
                                                                    size={16}
                                                                />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="hist"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {historialCierres.map((cierre) => (
                                            <div
                                                key={cierre.id}
                                                className="text-xs border rounded-lg p-3 bg-gray-50"
                                            >
                                                <div className="font-bold text-gray-700 mb-2">
                                                    Fecha de Recepción:{" "}
                                                    {cierre.fecha_cierre_formateada ||
                                                        cierre.fecha_cierre}
                                                </div>
                                                <div className="grid grid-cols-3 text-rose-400 gap-2">
                                                    {Object.entries(
                                                        JSON.parse(
                                                            cierre.detalle_stock,
                                                        ),
                                                    ).map(([nombre, cant]) => (
                                                        <div
                                                            key={nombre}
                                                            className="bg-white text-gray-800 p-1 border rounded px-2"
                                                        >
                                                            <span className="text-gray-800">
                                                                {nombre}:
                                                            </span>{" "}
                                                            <span className="font-bold text-gray-700">
                                                                {cant}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-2 italic text-rose-700 text-[12px]">
                                                    {cierre.motivo_cierre}
                                                </div>
                                            </div>
                                        ))}
                                        {historialCierres.length === 0 && (
                                            <div className="text-center text-gray-400">
                                                No hay cierres registrados aún
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* --- MODAL COMENSALES (MÁS PEQUEÑO) --- */}
                {showComensalesModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 border-4 border-white shadow-2xl relative"
                            >
                                <button
                                    onClick={() => {
                                        setShowComensalesModal(false);
                                        formMov.reset(
                                            "estudiantes",
                                            "cocineros",
                                            "personal",
                                        );
                                    }}
                                    className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <Icons.X size={24} />
                                </button>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner flex-shrink-0">
                                        <Icons.Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase leading-tight">
                                            Comensales
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                                            Registro de consumidores
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={submitComensales}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-3 gap-3">
                                        <Field
                                            label="Estudiantes"
                                            type="number"
                                            placeholder="0"
                                            value={formMov.data.estudiantes}
                                            onChange={(e) =>
                                                formMov.setData(
                                                    "estudiantes",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            min="0"
                                            className="text-center"
                                        />
                                        <Field
                                            label="Cocineros"
                                            type="number"
                                            placeholder="0"
                                            value={formMov.data.cocineros}
                                            onChange={(e) =>
                                                formMov.setData(
                                                    "cocineros",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            min="0"
                                            className="text-center"
                                        />
                                        <Field
                                            label="Personal"
                                            type="number"
                                            placeholder="0"
                                            value={formMov.data.personal}
                                            onChange={(e) =>
                                                formMov.setData(
                                                    "personal",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            min="0"
                                            className="text-center"
                                        />
                                    </div>

                                    <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                                        <p className="text-xs font-bold text-slate-600 uppercase text-center">
                                            Total Comensales:{" "}
                                            <span className="text-rose-600 text-lg">
                                                {totalComensales}
                                            </span>
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        size="sm"
                                        loading={formMov.processing}
                                    >
                                        {formMov.processing ? (
                                            <>
                                                <Icons.Loader2
                                                    size={16}
                                                    className="mr-2 animate-spin"
                                                />
                                                REGISTRANDO...
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Check
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                CONFIRMAR TODO
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL CREAR RUBRO --- */}
                {showRubroModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-md p-12 border-4 border-white shadow-2xl relative text-center"
                            >
                                <button
                                    onClick={() => setShowRubroModal(false)}
                                    className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <Icons.X size={28} />
                                </button>
                                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
                                    <Icons.PlusCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 leading-none">
                                    Nuevo Rubro
                                </h3>
                                <form
                                    onSubmit={submitRubro}
                                    className="space-y-6 text-left"
                                >
                                    <Field
                                        label="Nombre del Insumo"
                                        placeholder="EJ: PASTA"
                                        autoFocus
                                        value={formRubro.data.nombre}
                                        onChange={(e) =>
                                            formRubro.setData(
                                                "nombre",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />

                                    <Field
                                        label="Peso/Medida"
                                        placeholder="EJ: 1"
                                        value={formRubro.data.peso_medida}
                                        onChange={(e) =>
                                            formRubro.setData(
                                                "peso_medida",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <SelectField
                                        label="Unidad de Medida *"
                                        name="unidad_medida"
                                        value={formRubro.data.unidad_medida}
                                        onChange={(e) =>
                                            formRubro.setData(
                                                "unidad_medida",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        placeholder="Seleccionar unidad de medida"
                                        options={[
                                            { v: "Gr", l: "Gramos" },
                                            { v: "Kg", l: "Kilos" },
                                            { v: "Ml", l: "Mili Litros" },
                                            { v: "Ltr", l: "Litros" },
                                            { v: "Uni", l: "Unidad" },
                                        ]}
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        loading={formRubro.processing}
                                    >
                                        {formRubro.processing ? (
                                            <>
                                                <Icons.Loader2
                                                    size={18}
                                                    className="mr-2 animate-spin"
                                                />
                                                REGISTRANDO...
                                            </>
                                        ) : (
                                            "REGISTRAR EN CATÁLOGO"
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL EDITAR RUBRO --- */}
                {showEditModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-md p-12 border-4 border-white shadow-2xl relative text-center"
                            >
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditInsumo(null);
                                        formEdit.reset();
                                    }}
                                    className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <Icons.X size={28} />
                                </button>
                                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600 shadow-inner">
                                    <Icons.Edit size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 leading-none">
                                    Editar Rubro
                                </h3>
                                <form
                                    onSubmit={submitEdit}
                                    className="space-y-6 text-left"
                                >
                                    <Field
                                        label="Nombre del Insumo"
                                        placeholder="EJ: PASTA"
                                        autoFocus
                                        value={formEdit.data.nombre}
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "nombre",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />

                                    <Field
                                        label="Peso/Medida"
                                        placeholder="EJ: 1"
                                        value={formEdit.data.peso_medida}
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "peso_medida",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <SelectField
                                        label="Unidad de Medida *"
                                        name="unidad_medida"
                                        value={formEdit.data.unidad_medida}
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "unidad_medida",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        placeholder="Seleccionar unidad de medida"
                                        options={[
                                            { v: "Gr", l: "Gramos" },
                                            { v: "Kg", l: "Kilos" },
                                            { v: "Ml", l: "Mili Litros" },
                                            { v: "Ltr", l: "Litros" },
                                            { v: "Uni", l: "Unidad" },
                                        ]}
                                    />
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        className="w-full"
                                        loading={formEdit.processing}
                                    >
                                        {formEdit.processing ? (
                                            <>
                                                <Icons.Loader2
                                                    size={18}
                                                    className="mr-2 animate-spin"
                                                />
                                                ACTUALIZANDO...
                                            </>
                                        ) : (
                                            "ACTUALIZAR RUBRO"
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL REPORTE --- */}
                {showReportModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-md p-12 border-4 border-white shadow-2xl relative text-center"
                            >
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <Icons.X size={28} />
                                </button>
                                <Icons.FileSpreadsheet
                                    className="mx-auto mb-6 text-amber-500"
                                    size={64}
                                />
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-8">
                                    Exportar Auditoría
                                </h3>
                                <input
                                    type="month"
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-sm font-black uppercase mb-8 outline-none focus:border-blue-500"
                                    value={mesReporte}
                                    onChange={(e) =>
                                        setMesReporte(e.target.value)
                                    }
                                />
                                <Button
                                    onClick={() => {
                                        window.open(
                                            route("comedor.reporte.pdf", {
                                                periodo: mesReporte,
                                            }),
                                            "_blank",
                                        );
                                        setShowReportModal(false);
                                    }}
                                    variant="primary"
                                    className="w-full"
                                >
                                    GENERAR PDF
                                </Button>
                            </motion.div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
