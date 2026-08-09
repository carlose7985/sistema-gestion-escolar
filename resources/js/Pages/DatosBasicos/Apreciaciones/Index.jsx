// resources/js/Pages/Settings/Apreciaciones/Index.jsx

import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import {
    Plus,
    Edit,
    Trash2,
    ArrowLeftCircle,
    X,
    GraduationCap,
    CheckCircle,
    XCircle,
    MinusCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function ApreciacionesIndex({ apreciaciones }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, put, reset, errors } = useForm({
        literal: "",
        numeral: "",
        status: "Sin Definir",
    });

    const openCreateModal = () => {
        setEditingId(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (apreciacion) => {
        setEditingId(apreciacion.id);
        setData({
            literal: apreciacion.literal,
            numeral: apreciacion.numeral || "",
            status: apreciacion.status,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        reset();
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const submitData = {
            literal: data.literal,
            numeral: data.numeral || null,
            status: data.status,
        };

        if (editingId) {
            put(route("settings.apreciaciones.update", editingId), {
                data: submitData,
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    closeModal();
                   // toast.success("Apreciación actualizada");
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            });
        } else {
            post(route("settings.apreciaciones.store"), {
                data: submitData,
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    closeModal();
                   // toast.success("Apreciación creada");
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleDelete = (id, nombre) => {
        Swal.fire({
            title: `<span class="text-slate-800 font-black uppercase italic">¿Eliminar Apreciación?</span>`,
            html: `
                <div class="text-left text-sm p-2">
                    <p class="font-medium text-slate-500 mb-4">
                        Vas a eliminar la apreciación <span class="font-black text-indigo-600">${nombre}</span>
                    </p>
                    <div class="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4">
                        <p class="text-[10px] font-black uppercase text-amber-700 mb-1">⚠️ Esta acción es irreversible</p>
                        <p class="text-xs font-bold text-slate-600">
                            La apreciación será eliminada permanentemente.
                        </p>
                    </div>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, ELIMINAR",
            cancelButtonText: "CANCELAR",
            confirmButtonColor: "#ef4444",
            reverseButtons: true,
            customClass: {
                popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                confirmButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] tracking-widest",
                cancelButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] tracking-widest",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("settings.apreciaciones.destroy", id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success("Apreciación eliminada");
                    },
                });
            }
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            "Sin Definir": {
                color: "bg-slate-100 text-slate-600 border-slate-200",
                icon: <MinusCircle size={12} className="mr-1" />,
            },
            Aprobado: {
                color: "bg-emerald-100 text-emerald-700 border-emerald-200",
                icon: <CheckCircle size={12} className="mr-1" />,
            },
            Reprobado: {
                color: "bg-rose-100 text-rose-700 border-rose-200",
                icon: <XCircle size={12} className="mr-1" />,
            },
        };
        const c = config[status] || config["Sin Definir"];
        return (
            <span
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 ${c.color}`}
            >
                {c.icon}
                {status}
            </span>
        );
    };

    // --- MANEJADOR DE PAGINACIÓN ---
    const onPageChange = (page) => {
        router.get(
            route("settings.apreciaciones.index"),
            { page: page },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Apreciaciones" />

            <ViewContainer
                title="APRECIACIONES"
                subtitle="Gestión de apreciaciones para calificaciones"
                icon="GraduationCap"
                showSearch={false}
                currentPage={apreciaciones.current_page || 1}
                totalPages={apreciaciones.last_page || 1}
                onPageChange={onPageChange}
                actions={
                    <Button
                        variant="primary"
                        onClick={openCreateModal}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    >
                        <Plus size={16} className="mr-2" />
                        NUEVA APRECIACIÓN
                    </Button>
                }
                returns={
                    <Link href={route("settings.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-2" />
                            VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">
                                    Literal
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">
                                    Numeral
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {apreciaciones.data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-16 text-center text-slate-400 font-black uppercase tracking-widest"
                                    >
                                        No hay apreciaciones registradas
                                    </td>
                                </tr>
                            ) : (
                                apreciaciones.data?.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/70 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100">
                                                    {item.literal}
                                                </div>
                                               
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-600 text-sm">
                                                {item.numeral || (
                                                    <span className="text-slate-300 italic">
                                                        Sin numeral
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                               
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </ViewContainer>

            {/* MODAL DE APRECIACIÓN */}
            {modalOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                            <button
                                onClick={closeModal}
                                className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-all"
                            >
                                <X size={28} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                                    <GraduationCap size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                                        {editingId
                                            ? "Editar Apreciación"
                                            : "Nueva Apreciación"}
                                    </h3>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-2">
                                        {editingId
                                            ? "Modifica los datos de la apreciación"
                                            : "Registra una nueva apreciación"}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <SelectField
                                            label="Literal *"
                                            value={data.literal}
                                            options={[
                                                { v: "A", l: "A" },
                                                { v: "B", l: "B" },
                                                { v: "C", l: "C" },
                                                { v: "D", l: "D" },
                                                { v: "E", l: "E" },
                                                {
                                                    v: "Inasistente",
                                                    l: "Inasistente",
                                                },
                                            ]}
                                            onChange={(e) =>
                                                setData(
                                                    "literal",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            error={errors.literal}
                                        />
                                    </div>
                                    <div>
                                        <SelectField
                                            label="Calificacion (Opcional)"
                                            value={data.numeral}
                                            options={[
                                                { v: "20", l: "20" },
                                                { v: "19", l: "19" },
                                                { v: "18", l: "18" },
                                                { v: "17", l: "17" },
                                                { v: "16", l: "16" },
                                                { v: "15", l: "15" },
                                                { v: "14", l: "14" },
                                                { v: "13", l: "13" },
                                                { v: "12", l: "12" },
                                                { v: "11", l: "11" },
                                                { v: "10", l: "10" },
                                                { v: "09", l: "09" },
                                                { v: "08", l: "08" },
                                                { v: "07", l: "07" },
                                                { v: "06", l: "06" },
                                            ]}
                                            onChange={(e) =>
                                                setData(
                                                    "numeral",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.numeral}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <SelectField
                                        label="Status *"
                                        value={data.status}
                                        options={[
                                            {
                                                v: "Sin Definir",
                                                l: "Sin Definir",
                                            },
                                            { v: "Aprobado", l: "Aprobado" },
                                            { v: "Reprobado", l: "Reprobado" },
                                        ]}
                                        onChange={(e) =>
                                            setData("status", e.target.value)
                                        }
                                        required
                                        error={errors.status}
                                    />
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                        {data.literal && data.numeral
                                            ? `Vista previa: ${data.literal}-${data.numeral}`
                                            : data.literal
                                              ? `Vista previa: ${data.literal}`
                                              : "Selecciona un literal para ver la vista previa"}
                                    </p>
                                    {data.literal && (
                                        <div className="mt-2 flex justify-center">
                                            <span className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-sm border border-indigo-200">
                                                {data.numeral
                                                    ? `${data.literal}-${data.numeral}`
                                                    : data.literal}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 h-14 rounded-2xl font-black"
                                        onClick={closeModal}
                                    >
                                        CANCELAR
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black shadow-xl shadow-indigo-100"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2
                                                    className="animate-spin mr-2"
                                                    size={20}
                                                />
                                                GUARDANDO...
                                            </>
                                        ) : editingId ? (
                                            "ACTUALIZAR"
                                        ) : (
                                            "GUARDAR"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}
        </AuthenticatedLayout>
    );
}
