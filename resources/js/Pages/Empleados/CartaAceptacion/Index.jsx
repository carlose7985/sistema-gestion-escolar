"use client";
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import { confirmDelete } from "@/Utils/confirmDelete";

export default function Index({ cartas, cargos, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { data, setData, post, reset, processing, errors, clearErrors } =
        useForm({
            id: null,
            nombres: "",
            apellidos: "",
            documento: "V-",
            cedula: "",
            sexo: "",
            tipo_de_personal: "",
        });

    // --- MANEJO DE CAMBIOS CON LIMPIEZA DE ERRORES ---
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
        setData({ ...item });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("empleados.activos.carta.aceptacion.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: "¿Eliminar registro?",
            html: `
      <div class="text-left">
        <p class="text-gray-600">Estás a punto de eliminar <strong>${item.nombre || "este registro"}</strong></p>
        <p class="text-sm text-red-500 mt-2">⚠️ Esta acción no se puede deshacer</p>
      </div>
    `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e11d48",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            customClass: {
                popup: "rounded-2xl p-6",
                title: "text-2xl font-bold text-gray-800",
                confirmButton: "px-6 py-2.5 rounded-xl font-medium",
                cancelButton: "px-6 py-2.5 rounded-xl font-medium",
            },
        });

        if (result.isConfirmed) {
            try {
                await router.delete(
                    route(
                        "empleados.activos.carta.aceptacion.destroy",
                        item.id,
                    ),
                );
                // Opcional: mostrar toast de éxito
                // toast.success('Registro eliminado correctamente');
            } catch (error) {
                // Opcional: manejar error
                console.error("Error al eliminar:", error);
            }
        }
    };

    const handleImprimir = (type, empleadoId) => {
        const url = route("ExportDocumentosEmpleados", { type, empleadoId });
        window.open(url, "_blank");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cartas de Aceptación" />

            <ViewContainer
                title="Cartas de Aceptación"
                subtitle="Gestión de ingresos y documentos legales de RRHH"
                icon="FileText"
                onSearch={(val) =>
                    router.get(
                        route("empleados.activos.carta.aceptacion.index"),
                        { search: val },
                        { preserveState: true },
                    )
                }
                searchValue={filters?.search || ""}
                currentPage={cartas.current_page}
                totalPages={cartas.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("empleados.activos.carta.aceptacion.index"),
                        { page, search: filters.search },
                        { preserveState: true },
                    )
                }
                actions={
                    <div className="flex gap-2">
                        <Link href={route("empleados.activos.index")}>
                            <Button>
                                <Icons.ArrowLeftCircle size={16} /> VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={openCreateModal}
                            variant="success"
                            size="sm"
                        >
                            <Icons.Plus size={16} /> NUEVA CARTA
                        </Button>
                    </div>
                }
                actionFooter={
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase italic text-slate-400">
                            Total Registros:{" "}
                            <b className="text-blue-600">{cartas.total}</b>
                        </span>
                    </div>
                }
            >
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest italic">
                            <tr>
                                <th className="px-8 py-3">
                                    Personal Registrado / Identidad
                                </th>
                                <th className="px-8 py-3 text-center">
                                    Clasificación
                                </th>
                                <th className="px-8 py-3 text-right">
                                    Acciones de Documento
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] font-bold text-slate-600 uppercase divide-y divide-slate-50">
                            {cartas.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-blue-50/40 transition-all duration-300 group"
                                >
                                    <td className="px-8 py-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-slate-100">
                                                <Icons.User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-black text-xs tracking-tight">
                                                    {item.nombres}{" "}
                                                    {item.apellidos}
                                                </p>
                                                <p className="text-blue-600 italic mt-0.5">
                                                    {item.documento}
                                                    {item.cedula}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 text-center">
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-500 font-black text-[9px] tracking-widest">
                                            {item.tipo_de_personal}
                                        </span>
                                    </td>
                                    <td className="px-8 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() =>
                                                    handleImprimir(
                                                        "carta-de-aceptacion",
                                                        item.id,
                                                    )
                                                }
                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                title="Imprimir PDF"
                                            >
                                                <Icons.Printer size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openEditModal(item)
                                                }
                                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Icons.Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDelete(
                                                        route(
                                                            "empleados.activos.carta.aceptacion.destroy",
                                                            item.id,
                                                        ),
                                                        "¿Eliminar este activo?",
                                                        `Vas a remover de forma definitiva el registro de: ${item.nombres} ${item.apellidos} (${item.documento}${item.cedula})`,
                                                    )
                                                }
                                                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <Icons.Trash2 size={14} />
                                            </button>
                                          
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {cartas.data.length === 0 && (
                        <div className="p-20 text-center text-blue-600">
                            <Icons.FileStack size={64} className="mx-auto" />
                            <p className="mt-4 font-black uppercase tracking-widest">
                                Sin registros pendientes
                            </p>
                        </div>
                    )}
                </div>
            </ViewContainer>

            {/* MODAL DE REGISTRO / EDICIÓN - CORE EDITION */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06090f]/80 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border-4 border-white overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Cabecera del Modal */}
                            <div
                                className={`p-8 text-white relative overflow-hidden ${editMode ? "bg-blue-600" : "bg-slate-950"}`}
                            >
                                <Icons.FileText
                                    className="absolute -right-6 -bottom-6 opacity-10 rotate-12"
                                    size={120}
                                />
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                            <Icons.UserPlus size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                                {editMode
                                                    ? "Actualizar Registro"
                                                    : "Nuevo Ingreso"}
                                            </h3>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mt-1">
                                                Generación de Carta de
                                                Aceptación
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 bg-white/10 rounded-xl hover:bg-rose-500 transition-all"
                                    >
                                        <Icons.X size={20} />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-10 space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field
                                        label="Nombres del Personal *"
                                        value={data.nombres}
                                        autoFocus
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "nombres",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoAcentos
                                        autoTitleCase
                                        error={errors.nombres}
                                    />
                                    <Field
                                        label="Apellidos del Personal *"
                                        value={data.apellidos}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "apellidos",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        autoAcentos
                                        autoTitleCase
                                        error={errors.apellidos}
                                    />
                                </div>

                                <div className="flex gap-4 items-end">
                                    <div className="w-24">
                                        <SelectField
                                            label="Doc."
                                            value={data.documento}
                                            options={["V-", "E-"]}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "documento",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Field
                                            label="Número de Cédula *"
                                            value={data.cedula}
                                            mask="00000000"
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "cedula",
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                            required
                                            placeholder="00000000"
                                            error={errors.cedula}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField
                                        label="Sexo *"
                                        value={data.sexo}
                                        options={[
                                            { v: "M", l: "MASCULINO" },
                                            { v: "F", l: "FEMENINO" },
                                        ]}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "sexo",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        error={errors.sexo}
                                    />
                                    <SelectField
                                        label="Designación de Cargo *"
                                        value={data.tipo_de_personal}
                                        options={cargos.map(
                                            (c) => c.nombre_del_cargo,
                                        )}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "tipo_de_personal",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        error={errors.tipo_de_personal}
                                    />
                                </div>

                                <div className="mt-1 flex justify-center">
                                    <Button
                                        type="submit"
                                        variant={
                                            editMode ? "primary" : "success"
                                        }
                                        loading={processing}
                                    >
                                        <Icons.Save
                                            size={20}
                                            className={
                                                processing ? "hidden" : "block"
                                            }
                                        />
                                        {editMode
                                            ? "CONFIRMAR CAMBIOS"
                                            : "GENERAR Y GUARDAR"}
                                    </Button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                >
                                    Cancelar y volver al listado
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
