"use client";
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs/dayjs.min.js";
import es from "dayjs/locale/es";
import { AlertTriangle, CalendarDays,X, CalendarPlus, CalendarPlus2, ChevronLeftCircle, Edit3, PartyPopper, Save, Trash2 } from "lucide-react";

dayjs.locale(es);

export default function Index({ festivos, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, reset, processing, errors, clearErrors } =
        useForm({
            id: null,
            fecha: "",
            descripcion: "",
        });

    const handleFieldChange = (name, value) => {
        setData(name, value);
        if (errors[name]) clearErrors(name);
    };

    const openCreateModal = () => {
        setEditMode(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setData({
            ...item,
            fecha: dayjs(item.fecha).format("YYYY-MM-DD"),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("settings.festivos.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const confirmDelete = (item) => {
        setDeleteModal({ open: true, item });
    };

    const handleDelete = () => {
        if (deleteModal.item) {
            setIsDeleting(true);
            router.delete(
                route("settings.festivos.destroy", deleteModal.item.id),
                {
                    onSuccess: () => {
                        setIsDeleting(false);
                        setDeleteModal({ open: false, item: null });
                    },
                    onError: () => {
                        setIsDeleting(false);
                    },
                },
            );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Calendario Festivo" />
            <ViewContainer
                title="FECHAS FESTIVAS"
                subtitle="Registro y actualización fechas no laborables"
                icon="CalendarDays"
                onSearch={(val) =>
                    router.get(
                        route("settings.festivos.index"),
                        { search: val },
                        { preserveState: true },
                    )
                }
                searchValue={filters?.search || ""}
                currentPage={festivos.current_page}
                totalPages={festivos.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("settings.festivos.index"),
                        { page },
                        { preserveState: true },
                    )
                }
                actions={
                    <div className="flex gap-2">
                        <Link href={route("settings.index")}>
                            <Button>
                                <ChevronLeftCircle size={16} /> VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={openCreateModal}
                            variant="danger"
                            size="sm"
                        >
                            <CalendarPlus size={16} /> NUEVA FECHA
                        </Button>
                    </div>
                }
            >
                <div className="bg-white rounded-t-[1.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-rose-600 text-white font-black uppercase text-[9px] tracking-[0.2em] italic">
                            <tr>
                                <th className="px-8 py-5">Fecha del Evento</th>
                                <th className="px-8 py-5">
                                    Descripción / Motivo
                                </th>
                                <th className="px-8 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] font-bold text-slate-600 uppercase">
                            {festivos.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-50 hover:bg-rose-50/30 transition-all group"
                                >
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                                                <CalendarDays size={16} />
                                            </div>
                                            <span className="text-slate-900 font-black tracking-tight">
                                                {dayjs(item.fecha).format(
                                                    "dddd, DD [de] MMMM",
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 italic text-slate-900 group-hover:text-rose-600 transition-colors">
                                        {item.descripcion}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(item)
                                                }
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDelete(item)
                                                }
                                                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {festivos.data.length === 0 && (
                        <div className="p-4 text-center flex flex-col items-center gap-4">
                            <PartyPopper size={64} />
                            <p className="font-bold text-rose-600 uppercase text-lg">
                                Sin fechas especiales
                            </p>
                        </div>
                    )}
                </div>
            </ViewContainer>

            {/* MODAL DE REGISTRO / EDICIÓN */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-white overflow-hidden text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className={`p-8 flex justify-between items-center text-white ${editMode ? "bg-blue-600" : "bg-rose-600 shadow-[0_0_25px_rgba(225,29,72,0.4)]"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <CalendarPlus2 size={22} />
                                    <h3 className="font-black uppercase italic text-sm tracking-widest">
                                        {editMode
                                            ? "Modificar Fecha"
                                            : "Añadir Feriado"}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="hover:rotate-90 transition-transform"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-10 space-y-6"
                            >
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner space-y-6">
                                    <Field
                                        label="Seleccionar Día *"
                                        type="date"
                                        value={data.fecha}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "fecha",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        error={errors.fecha}
                                    />
                                    <Field
                                        label="Descripción / Motivo *"
                                        value={data.descripcion}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "descripcion",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        error={errors.descripcion}
                                        autoAcentos
                                        upperCase
                                        placeholder="EJ: ANIVERSARIO"
                                    />
                                </div>

                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3 text-left">
                                    <PartyPopper
                                        className="text-rose-500 shrink-0"
                                        size={18}
                                    />
                                    <p className="text-[9px] font-black text-rose-700 leading-tight uppercase">
                                        Esta fecha bloqueará automáticamente el
                                        registro de asistencia docente y
                                        estudiantil.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        variant={
                                            editMode ? "primary" : "danger"
                                        }
                                        size="xl"
                                        className="w-full h-16 rounded-[1.8rem] shadow-xl"
                                        loading={processing}
                                    >
                                        <Save size={20} />{" "}
                                        {editMode
                                            ? "CONFIRMAR CAMBIOS"
                                            : "GUARDAR EN CALENDARIO"}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <AnimatePresence>
                {deleteModal.open && deleteModal.item && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-white overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Cabecera con degradado rojo */}
                            <div className="relative bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 p-8 text-center overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white/30 shadow-[0_0_40px_rgba(225,29,72,0.6)]">
                                        <Trash2
                                            className="text-white"
                                            size={36}
                                        />
                                    </div>
                                    <h3 className="text-white font-black uppercase italic text-xl tracking-widest">
                                        ¿Eliminar Fecha?
                                    </h3>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Información del elemento a eliminar */}
                                <div className="bg-rose-50 rounded-2xl p-6 border-2 border-rose-100">
                                    <div className="flex items-center gap-4 justify-center mb-3">
                                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                                            <CalendarDays size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                                Fecha
                                            </p>
                                            <p className="text-sm font-black text-rose-900">
                                                {dayjs(
                                                    deleteModal.item.fecha,
                                                ).format(
                                                    "dddd, DD [de] MMMM [del] YYYY",
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                            Descripción
                                        </p>
                                        <p className="text-sm font-bold text-rose-800 italic">
                                            "{deleteModal.item.descripcion}"
                                        </p>
                                    </div>
                                </div>

                                {/* Advertencia */}
                                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-start gap-3 text-left">
                                    <AlertTriangle
                                        className="text-amber-500 shrink-0 mt-0.5"
                                        size={20}
                                    />
                                    <div>
                                        <p className="text-[10px] font-black text-amber-700 uppercase leading-tight">
                                            ¡Acción irreversible!
                                        </p>
                                        <p className="text-[9px] font-bold text-amber-600 leading-tight">
                                            Esta acción no se puede deshacer. La
                                            fecha será eliminada permanentemente
                                            del calendario.
                                        </p>
                                    </div>
                                </div>

                                {/* Botones de acción con spinner */}
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleDelete}
                                        variant="danger"
                                        size="xl"
                                        className="w-full h-14 rounded-[1.8rem] shadow-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
                                        loading={isDeleting}
                                        disabled={isDeleting}
                                    >
                                        {!isDeleting ? (
                                            <>
                                                <Trash2 size={18} />
                                                ELIMINAR DEFINITIVAMENTE
                                            </>
                                        ) : (
                                            "PROCESANDO..."
                                        )}
                                    </Button>
                                    <button
                                        onClick={() =>
                                            setDeleteModal({
                                                open: false,
                                                item: null,
                                            })
                                        }
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors py-2"
                                        disabled={isDeleting}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
