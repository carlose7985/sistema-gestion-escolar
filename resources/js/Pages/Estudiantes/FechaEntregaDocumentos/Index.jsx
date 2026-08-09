import React, { useState, useEffect } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
    CalendarCheck,
    RotateCcw,
    Edit,
    CalendarDays,
    Save,
    X,
    Search,
    Info,
    CalendarClock,
    Clock,
    AlertCircle,
    ArrowLeftCircle,
} from "lucide-react";

dayjs.locale("es");

export default function ControlFechasEntrega({ datos }) {
    // --- ESTADOS ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFecha, setSelectedFecha] = useState(null);

    // --- FORMULARIO DE EDICIÓN ---
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            periodo_escolar: "",
            fecha: "",
        });

    // --- HELPERS ---
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return dayjs(dateString).format("DD MMMM YYYY").toUpperCase();
    };

    const getStatusInfo = (fecha) => {
        const today = dayjs();
        const limitDate = dayjs(fecha);
        const diffDays = limitDate.diff(today, "day");

        if (diffDays < 0) {
            return {
                color: "border-rose-500 shadow-rose-100",
                icon: <AlertCircle size={24} />,
                bgIcon: "bg-rose-50 text-rose-600 border-rose-100",
                text: "VENCIDO",
            };
        }
        if (diffDays <= 7) {
            return {
                color: "border-amber-500 shadow-amber-100",
                icon: <Clock size={24} />,
                bgIcon: "bg-amber-50 text-amber-600 border-amber-100",
                text: "PRÓXIMO A VENCER",
            };
        }
        return {
            color: "border-indigo-500 shadow-indigo-100",
            icon: <CalendarDays size={24} />,
            bgIcon: "bg-indigo-50 text-indigo-600 border-indigo-100",
            text: "ACTIVO",
        };
    };

    // --- HANDLERS ---
    const openEditModal = (item) => {
        setSelectedFecha(item);
        setData({
            periodo_escolar: item.periodo_escolar,
            fecha: item.fecha,
        });
        setIsEditModalOpen(true);
    };

    const closeModal = () => {
        setIsEditModalOpen(false);
        setSelectedFecha(null);
        reset();
        clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route("estudiantes.activos.fecha.entrega.documentos.update", selectedFecha.id), {
            preserveScroll: true,
            onSuccess: () => {
                //toast.success("Plazo de entrega actualizado");
                closeModal();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fechas de Entrega" />

            <ViewContainer
                title="CONTROL DE PLAZOS ADMINISTRATIVOS"
                subtitle="Configuración de fechas límites para recepción de documentos"
                icon="Calendar"
                showSearch={false}
                returns={
                    <Link href={route("estudiantes.activos.aprobados.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                footerStats={
                    <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase italic">
                        <CalendarCheck size={14} className="text-indigo-500" />
                        Sistema de Cronograma Académico Operativo
                    </div>
                }
            >
                <div className="space-y-6 p-2">
                    {/* ALERTA INFORMATIVA */}
                    <div className="bg-white border border-slate-200 p-5 rounded-[2rem] shadow-sm flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Info size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-tight italic">
                            Atención: Los plazos establecidos aquí controlan la
                            disponibilidad del sistema para el registro de
                            movimientos y carga de notas.
                        </p>
                    </div>

                    {/* GRID DE TARJETAS */}
                    <div className="flex flex-wrap justify-center gap-6">
                        {datos.data.length > 0 ? (
                            datos.data.map((item) => {
                                const status = getStatusInfo(item.fecha);
                                return (
                                    <div
                                        key={item.id}
                                        className={`relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-xl border-l-[10px] `}
                                    >
                                        <div className="absolute right-[-10px] top-[-10px] opacity-5 text-slate-900">
                                            <CalendarClock size={120} />
                                        </div>

                                        <div className="p-8 relative z-10">
                                            <div className="flex items-center gap-5 mb-8">
                                                <div
                                                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg border-2 ${status.bgIcon}`}
                                                >
                                                    <CalendarClock size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                                                        Periodo{" "}
                                                        {item.periodo_escolar}
                                                    </h4>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">
                                                        Cronograma activo
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-center mb-8">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                                                    Fecha Límite Establecida
                                                </span>
                                                <div className="inline-flex items-center gap-3 bg-slate-50 border-2 border-slate-100 text-indigo-700 px-8 py-4 rounded-3xl font-black shadow-inner">
                                                    <CalendarDays size={20} />
                                                    <span className="text-base tracking-tight">
                                                        {formatDate(item.fecha)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-4">
                                                <div
                                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border-2 ${status.bgIcon}`}
                                                >
                                                    ESTADO: {status.text}
                                                </div>
                                                <Button
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg shadow-indigo-100"
                                                >
                                                    <Edit
                                                        size={16}
                                                        className="mr-2"
                                                    />{" "}
                                                    EDITAR PLAZO
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center py-24 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 opacity-40">
                                <Search
                                    size={64}
                                    className="text-slate-300 mb-4"
                                />
                                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">
                                    Sin plazos configurados
                                </h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL EDITAR (Portal Fluorescente) */}
                {isEditModalOpen &&
                    createPortal(
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-2 border-indigo-100 animate-in zoom-in-95 relative">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={28} />
                                </button>

                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-indigo-50">
                                        <Edit size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                                            Ajustar Plazo
                                        </h3>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-2">
                                            Modificación de fecha límite
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={submitEdit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <Field
                                            label="Periodo Lectivo"
                                            value={data.periodo_escolar}
                                            readOnly
                                            className="bg-slate-50 opacity-60 font-black cursor-not-allowed"
                                        />
                                        <Field
                                            label="Nueva Fecha de Entrega"
                                            type="date"
                                            value={data.fecha}
                                            onChange={(e) =>
                                                setData("fecha", e.target.value)
                                            }
                                            error={errors.fecha}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 py-4 text-[10px] font-black uppercase text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <Button
                                            type="submit"
                                            loading={processing}
                                            className="flex-[2] h-16 bg-indigo-600 hover:bg-indigo-500 rounded-3xl font-black shadow-2xl shadow-indigo-100"
                                        >
                                            <Save size={20} className="mr-2" />{" "}
                                            ACTUALIZAR CRONOGRAMA
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
