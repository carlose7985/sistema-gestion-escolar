import React, { useState, useEffect, useMemo, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, Link, router, useForm } from "@inertiajs/react";
import * as Icons from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { confirmDelete } from "@/Utils/confirmDelete";

// Orden cronológico inmutable
const ORDEN_DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function ListadoPermanente({ empleados, filters }) {
    const [empToEdit, setEmpToEdit] = useState(null);
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const searchTimer = useRef(null);

    // --- FORMULARIO DE EDICIÓN (Inertia) ---
    const { data, setData, put, processing, reset, errors } = useForm({
        dias: [],
        descripcion: "",
    });

    // Función para preparar la edición y abrir modal
    const handleOpenEdit = (emp) => {
        // Extraer los días de los permisos permanentes
        const diasPermiso = emp.permisos_permanente.map((p) => p.dia);
        const descripcion = emp.permisos_permanente[0]?.descripcion || "";

        setEmpToEdit(emp);
        setData({
            dias: diasPermiso,
            descripcion: descripcion,
        });
    };

    const toggleDia = (dia) => {
        const nuevosDias = data.dias.includes(dia)
            ? data.dias.filter((d) => d !== dia)
            : [...data.dias, dia];
        setData("dias", nuevosDias);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (data.dias.length === 0) {
            toast.warning("Seleccione al menos un día");
            return;
        }

        put(
            route(
                "empleados.inactivos.permisos.permanentes.update",
                empToEdit.id,
            ),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEmpToEdit(null);
                    reset();
                },
                onError: (errors) => {
                    if (errors.dias) {
                        toast.error(errors.dias);
                    }
                },
            },
        );
    };

    const handleSearch = (val) => {
        setLocalSearch(val);

        if (searchTimer.current) clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => {
            router.get(
                route("empleados.inactivos.permisos.permanentes.index"),
                {
                    search: val,
                    page: 1,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 400);
    };

    const handleDelete = (emp) => {
        Swal.fire({
            title: "¿Revocar Permisos?",
            text: `Se eliminarán los días fijos de ${emp.nombres}. Volverá a estatus ACTIVO.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, REVOCAR",
            confirmButtonColor: "#ef4444",
            customClass: { popup: "rounded-[2.5rem] p-10" },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    route(
                        "empleados.inactivos.permisos.permanentes.destroy",
                        emp.id,
                    ),
                    {
                        preserveScroll: true,
                    },
                );
            }
        });
    };

    // Cerrar modal y resetear
    const handleCloseModal = () => {
        setEmpToEdit(null);
        reset();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Control de Permanentes" />
            <ViewContainer
                title="Control de Permisos Permanentes"
                subtitle="Gestión de horarios fijos y días de ausencia autorizada"
                icon="AlertCircle"
                onSearch={handleSearch}
                searchValue={localSearch}
                currentPage={empleados.current_page}
                totalPages={empleados.last_page}
                onPageChange={(p) =>
                    router.get(
                        route("empleados.inactivos.permisos.permanentes.index"),
                        {
                            page: p,
                            search: localSearch,
                        },
                    )
                }
                footerStats={
                    <span>
                        Personal con Horario Fijo: <b>{empleados.total}</b>
                    </span>
                }
                returns={
                    <Link href={route("empleados.inactivos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={14} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest italic z-10">
                                <tr>
                                    <th className="p-5 border-r border-blue-500">
                                        Personal / Identificación
                                    </th>
                                    <th className="p-5 border-r border-blue-500">
                                        Motivo / Justificación
                                    </th>
                                    <th className="p-5 border-r border-blue-500 text-center">
                                        Días de Permiso Fijos
                                    </th>
                                    <th className="p-5 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-500 uppercase">
                                {empleados.data.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="p-3 border-r border-slate-50 bg-slate-50/20">
                                            <div className="flex items-center gap-3">
                                                <Icons.UserCircle
                                                    size={32}
                                                    className="text-slate-300"
                                                />
                                                <div>
                                                    <p className="text-slate-900 font-black text-xs leading-none mb-1">
                                                        {emp.nombres}{" "}
                                                        {emp.apellidos}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 italic">
                                                        C.I: {emp.cedula}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 border-r border-slate-50 italic text-slate-600 normal-case">
                                            "
                                            {
                                                emp.permisos_permanente[0]
                                                    ?.descripcion
                                            }
                                            "
                                        </td>
                                        <td className="p-3 border-r border-slate-50 text-center bg-slate-50/30">
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {[...emp.permisos_permanente]
                                                    .sort(
                                                        (a, b) =>
                                                            ORDEN_DIAS.indexOf(
                                                                a.dia,
                                                            ) -
                                                            ORDEN_DIAS.indexOf(
                                                                b.dia,
                                                            ),
                                                    )
                                                    .map((p, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black shadow-sm"
                                                        >
                                                            {p.dia}
                                                        </span>
                                                    ))}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleOpenEdit(emp)
                                                    }
                                                    className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Icons.Edit3 size={16} />
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        confirmDelete(
                                                            route(
                                                                "empleados.inactivos.permisos.permanentes.destroy",
                                                                emp.id,
                                                            ),
                                                            "¿Eliminar este registro?",
                                                            `Vas a remover de forma definitiva este permiso permanente de ${emp.nombres} ${emp.apellidos}. Esta acción no se puede deshacer.`,
                                                        )
                                                    }
                                                    className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    <Icons.Trash2 size={14} />
                                                </Button>
                                               
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>

            {/* --- MODAL DE EDICIÓN --- */}
            <AnimatePresence>
                {empToEdit && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border-4 border-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Icons.CalendarRange size={24} />
                                    <div>
                                        <h3 className="font-black uppercase italic text-sm leading-none">
                                            Ajustar Días Fijos
                                        </h3>
                                        <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">
                                            {empToEdit.nombres}{" "}
                                            {empToEdit.apellidos}
                                        </p>
                                    </div>
                                </div>
                                <Icons.X
                                    className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                                    onClick={handleCloseModal}
                                />
                            </div>

                            <form
                                onSubmit={handleUpdate}
                                className="p-8 space-y-6 text-slate-800"
                            >
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">
                                        Seleccione los días de permiso
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {ORDEN_DIAS.map((dia) => {
                                            const isSelected =
                                                data.dias.includes(dia);
                                            return (
                                                <button
                                                    key={dia}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleDia(dia)
                                                    }
                                                    className={`p-3 rounded-xl border-2 transition-all font-black text-[9px] uppercase flex justify-between items-center ${
                                                        isSelected
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105"
                                                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {dia}
                                                    {isSelected && (
                                                        <Icons.CheckCircle2
                                                            size={14}
                                                            className="text-white"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {data.dias.length > 0 && (
                                        <p className="text-[9px] text-indigo-600 font-bold mt-2 text-center">
                                            {data.dias.length} día(s)
                                            seleccionado(s)
                                        </p>
                                    )}
                                </div>

                                <Field
                                    label="Motivo de la Modificación"
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData("descripcion", e.target.value)
                                    }
                                    required
                                    autoSentenceCase
                                    placeholder="Ej: Permiso para atención médica..."
                                />

                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                    <Icons.AlertCircle
                                        className="text-amber-500 shrink-0 mt-0.5"
                                        size={18}
                                    />
                                    <p className="text-[9px] font-bold text-amber-700 leading-tight uppercase">
                                        El sistema reemplazará los días actuales
                                        por los seleccionados arriba.
                                    </p>
                                </div>

                                {errors.dias && (
                                    <p className="text-red-500 text-[10px] font-bold">
                                        {errors.dias}
                                    </p>
                                )}

                                <div className="flex flex-col gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        loading={processing}
                                        variant="primary"
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Icons.Save
                                            size={16}
                                            className="mr-2"
                                        />
                                        GUARDAR CAMBIOS
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCloseModal}
                                        className="text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
