"use client";
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, ChevronLeftCircle, Edit3, MapPin, Plus, Power, PowerOff, Save, X } from "lucide-react";

export default function AreasIndex({ areas, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { data, setData, post, reset, processing, errors, clearErrors } =
        useForm({
            id: null,
            nombre_del_area: "",
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
        setData({ id: item.id, nombre_del_area: item.nombre_del_area });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("settings.areas.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
               
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Áreas de Trabajo" />
            <ViewContainer
                title="ÁREAS Y DEPARTAMENTOS"
                subtitle="Registro y actualización de áreas de trabajo"
                icon="Briefcase"
                onSearch={(val) =>
                    router.get(
                        route("settings.areas.index"),
                        { search: val },
                        { preserveState: true },
                    )
                }
                searchValue={filters?.search || ""}
                currentPage={areas.current_page}
                totalPages={areas.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("settings.areas.index"),
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
                            variant="success"
                            size="sm"
                        >
                            <Plus size={16} /> NUEVA ÁREA
                        </Button>
                    </div>
                }
            >
                <div className="bg-white rounded-t-[1.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-[0.2em] italic">
                            <tr>
                                <th className="px-8 py-5">
                                    Nombre de la Ubicación / Departamento
                                </th>
                                <th className="px-8 py-5 text-center">
                                    Estado Operativo
                                </th>
                                <th className="px-8 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] font-bold text-slate-600 uppercase">
                            {areas.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`border-b border-slate-50 transition-all ${item.status === "Inactivo" ? "opacity-40 grayscale bg-slate-50" : "hover:bg-blue-50/30"}`}
                                >
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`p-2 rounded-lg ${item.status === "Activo" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                                            >
                                                <MapPin size={14} />
                                            </div>
                                            <span className="text-slate-900 font-black tracking-tight">
                                                {item.nombre_del_area}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest ${item.status === "Activo" ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}
                                        >
                                            {item.status}
                                        </span>
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
                                                    router.post(
                                                        route(
                                                            "settings.areas.toggle",
                                                            item.id,
                                                        ),
                                                    )
                                                }
                                                className={`p-2 rounded-lg transition-all ${item.status === "Activo" ? "bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"}`}
                                            >
                                                {item.status === "Activo" ? (
                                                    <PowerOff size={14} />
                                                ) : (
                                                    <Power size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {areas.data.length === 0 && (
                        <div className="p-4 text-center flex flex-col items-center gap-4">
                            <Briefcase size={64} />
                            <p className="font-black text-rose-500 uppercase text-lg tracking-[0.3em]">
                                No hay registros
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
                                className={`p-8 flex justify-between items-center text-white ${editMode ? "bg-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.4)]" : "bg-slate-900"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Briefcase size={22} />
                                    <h3 className="font-black uppercase italic text-sm tracking-widest">
                                        {editMode
                                            ? "Actualizar Área"
                                            : "Nueva Área"}
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
                                className="p-10 space-y-8"
                            >
                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                                    <Field
                                        label="Nombre de la Ubicación / Área *"
                                        value={data.nombre_del_area}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "nombre_del_area",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        error={errors.nombre_del_area}
                                        autoAcentos
                                        upperCase
                                        autoFocus
                                        placeholder="EJ: COMEDOR ESCOLAR"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        variant={
                                            editMode ? "primary" : "success"
                                        }
                                        size="xl"
                                        className="w-full h-16 rounded-[1.8rem] shadow-xl"
                                        loading={processing}
                                    >
                                        <Save size={20} />{" "}
                                        {editMode
                                            ? "CONFIRMAR CAMBIOS"
                                            : "GUARDAR ÁREA"}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
