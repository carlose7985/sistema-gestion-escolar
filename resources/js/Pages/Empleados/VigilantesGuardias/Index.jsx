import React, { useState, useEffect, useCallback, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { confirmDelete } from "@/Utils/confirmDelete";

export default function Index({ vigilantes, empleadosDisponibles, filters }) {
    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedDay, setSelectedDay] = useState(filters.dia || "lunes");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(null); // Objeto del vigilante a editar

    // Estados para el selector inteligente de empleados
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [selectQuery, setSelectQuery] = useState("");

    const diasSemana = [
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
        "domingo",
    ];

    // --- FORMULARIOS ---
    const formCreate = useForm({
        empleado_id: "",
        tipo_de_personal: "",
        dias_guardia: [],
    });

    const formEdit = useForm({
        dias_guardia: [],
    });

    // --- LÓGICA DE FILTROS ---
    const applyFilters = useCallback(
        debounce((q, d) => {
            router.get(
                route("empleados.acciones.guardias.vigilantes.index"),
                { search: q, dia: d },
                { preserveState: true, replace: true },
            );
        }, 400),
        [],
    );

    useEffect(() => {
        applyFilters(searchTerm, selectedDay);
    }, [searchTerm, selectedDay]);

    // --- HANDLERS ---
    const toggleDia = (dia, form) => {
        const current = form.data.dias_guardia;
        if (current.includes(dia)) {
            form.setData(
                "dias_guardia",
                current.filter((d) => d !== dia),
            );
        } else {
            form.setData("dias_guardia", [...current, dia]);
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();

        // VALIDACIÓN: Si no hay días seleccionados
        if (formCreate.data.dias_guardia.length === 0) {
            toast.warning(
                "Debe seleccionar al menos un día para activar la guardia",
                {
                    description:
                        "Haga clic en los días de la semana para marcarlos.",
                    position: "top-center",
                },
            );
            return; // Detiene el proceso de guardado
        }

        formCreate.post(route("empleados.acciones.guardias.vigilantes.store"), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                formCreate.reset();
            },
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        // VALIDACIÓN: Si no hay días seleccionados en edición
        if (formEdit.data.dias_guardia.length === 0) {
            toast.warning(
                "No se puede actualizar una guardia sin días asignados",
                {
                    description:
                        "Seleccione al menos un día o elimine el registro por completo.",
                    position: "top-center",
                },
            );
            return; // Detiene el proceso de guardado
        }

        formEdit.put(
            route(
                "empleados.acciones.guardias.vigilantes.update",
                isEditModalOpen.id,
            ),
            {
                onSuccess: () => setIsEditModalOpen(null),
            },
        );
    };

    const filteredEmpleados = useMemo(() => {
        const q = selectQuery.toLowerCase();
        return empleadosDisponibles.filter(
            (e) =>
                `${e.nombres} ${e.apellidos}`.toLowerCase().includes(q) ||
                e.cedula.includes(q),
        );
    }, [selectQuery, empleadosDisponibles]);

    return (
        <AuthenticatedLayout>
            <Head title="Vigilantes de Guardia" />

            <ViewContainer
                title="Roles de Guardia: Seguridad"
                subtitle="Asignación de vigilantes de seguridad para turnos de guardia"
                icon="ShieldAlert"
                showSearch={true}
                searchValue={searchTerm}
                onSearch={setSearchTerm}
                extraFilters={
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {diasSemana.map((dia) => (
                            <button
                                key={dia}
                                onClick={() => {
                                    setSelectedDay(dia);
                                    setSearchTerm("");
                                }}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedDay === dia && !searchTerm ? "bg-white text-indigo-600 shadow-sm scale-105" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                {dia}
                            </button>
                        ))}
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <Link href={route("empleados.acciones.index")}>
                            <Button>
                                <Icons.ArrowLeftCircle size={18} /> VOLVER
                            </Button>
                        </Link>
                        <a
                            href={route(
                                "empleados.acciones.guardias.vigilantes.pdf",
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="outline"
                                className="border-rose-500 text-rose-500 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase"
                            >
                                <Icons.FileText size={16} className="mr-2" />{" "}
                                PDF Reporte
                            </Button>
                        </a>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            variant="primary"
                            className="rounded-xl text-[10px] font-black uppercase"
                        >
                            <Icons.UserPlus size={16} className="mr-2" /> Nueva
                            Guardia
                        </Button>
                    </div>
                }
            >
                {/* TABLA PRINCIPAL */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                    <table className="w-full border-collapse select-text">
                        <thead>
                            <tr className="bg-blue-600 text-white text-[10px] font-black uppercase italic tracking-widest">
                                <th className="px-6 py-4 text-left border-r border-blue-500">
                                    Personal de Seguridad
                                </th>
                                <th className="px-6 py-4 text-left border-r border-blue-500">
                                    Identificación
                                </th>
                                <th className="px-6 py-4 text-left border-r border-blue-500">
                                    Días de Guardia
                                </th>
                                <th className="px-6 py-4 text-left border-r border-blue-500">
                                    Condición
                                </th>
                                <th className="px-6 py-4 text-center">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                            {vigilantes.map((v) => (
                                <tr
                                    key={v.id}
                                    className="hover:bg-blue-50/30 transition-colors"
                                >
                                    <td className="px-6 py-4 border-r border-slate-50 font-black text-slate-800 uppercase leading-none">
                                        {v.empleado?.nombres}{" "}
                                        {v.empleado?.apellidos}
                                    </td>
                                    <td className="px-6 py-4 border-r border-slate-50 font-mono font-bold text-slate-500 italic">
                                        C.I: {v.empleado?.cedula}
                                    </td>
                                    <td className="px-6 py-4 border-r border-slate-50">
                                        <div className="flex flex-wrap gap-1">
                                            {v.dias_guardia.map((dia) => (
                                                <span
                                                    key={dia}
                                                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${dia === selectedDay ? "bg-indigo-600 text-white border-indigo-700" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                                                >
                                                    {dia}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r border-slate-50 uppercase font-bold text-slate-400 italic text-[10px]">
                                        {v.empleado?.condicion_del_cargo}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    formEdit.setData(
                                                        "dias_guardia",
                                                        v.dias_guardia,
                                                    );
                                                    setIsEditModalOpen(v);
                                                }}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                                            >
                                                <Icons.Edit3 size={15} />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    confirmDelete(
                                                        route(
                                                            "empleados.acciones.guardias.vigilantes.destroy",
                                                            v.id,
                                                        ),
                                                        "¿Eliminar este activo?",
                                                        `Vas a remover de forma definitiva el registro de: ${v.empleado?.nombres} ${v.empleado?.apellidos} (${v.empleado?.documento}${v.empleado?.cedula})`,
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
                    {vigilantes.length === 0 && (
                        <div className="py-20 text-center opacity-20 uppercase font-black tracking-widest text-sm flex flex-col items-center gap-4">
                            <Icons.ShieldCheck size={48} />
                            No hay guardias registradas
                        </div>
                    )}
                </div>
            </ViewContainer>

            {/* MODAL CREAR (MODAL SOLICITADO) */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nueva Asignación de Seguridad"
                color="border-indigo-600"
            >
                <form onSubmit={handleCreate} className="space-y-6">
                    {/* Selector Inteligente de Empleado */}
                    <div className="relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1">
                            Empleado a Cargo *
                        </label>
                        <div
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 flex items-center justify-between cursor-pointer text-[11px] font-bold"
                        >
                            {formCreate.data.empleado_id
                                ? filteredEmpleados.find(
                                      (e) =>
                                          e.id == formCreate.data.empleado_id,
                                  )?.nombres
                                : "Seleccionar empleado..."}
                            <Icons.ChevronDown size={14} />
                        </div>
                        {isSelectOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-48 overflow-auto">
                                <input
                                    type="text"
                                    placeholder="Filtrar por nombre o CI..."
                                    className="w-full h-10 bg-slate-50 rounded-xl text-[10px] mb-2 px-3 border-none outline-none"
                                    onChange={(e) =>
                                        setSelectQuery(e.target.value)
                                    }
                                />
                                {filteredEmpleados.map((emp) => (
                                    <div
                                        key={emp.id}
                                        onClick={() => {
                                            formCreate.setData({
                                                ...formCreate.data,
                                                empleado_id: emp.id,
                                                tipo_de_personal:
                                                    emp.tipo_de_personal,
                                            });
                                            setIsSelectOpen(false);
                                        }}
                                        className="p-3 hover:bg-indigo-50 rounded-xl cursor-pointer"
                                    >
                                        <p className="text-[11px] font-black text-slate-800 uppercase leading-none">
                                            {emp.nombres} {emp.apellidos}
                                        </p>
                                        <p className="text-[9px] text-slate-400 italic">
                                            CI: {emp.cedula} •{" "}
                                            {emp.tipo_de_personal}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selector de Días Multi-Select */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block">
                            Días de Guardia *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {diasSemana.map((dia) => (
                                <button
                                    key={dia}
                                    type="button"
                                    onClick={() => toggleDia(dia, formCreate)}
                                    className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all flex items-center justify-between ${formCreate.data.dias_guardia.includes(dia) ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
                                >
                                    {dia}
                                    {formCreate.data.dias_guardia.includes(
                                        dia,
                                    ) && <Icons.CheckCircle2 size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            loading={formCreate.processing}
                            // disabled={formCreate.data.dias_guardia.length === 0} // <--- Deshabilitar
                            className="w-full rounded-2xl font-black py-6 shadow-xl shadow-indigo-100 disabled:opacity-50"
                        >
                            ACTIVAR GUARDIA
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL EDITAR */}
            <Modal
                isOpen={!!isEditModalOpen}
                onClose={() => setIsEditModalOpen(null)}
                title="Actualizar Días de Guardia"
                color="border-amber-500"
            >
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-[9px] font-black text-amber-600 uppercase mb-1">
                            Personal
                        </p>
                        <p className="text-sm font-black text-slate-800 uppercase italic leading-none">
                            {isEditModalOpen?.empleado?.nombres}{" "}
                            {isEditModalOpen?.empleado?.apellidos}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {diasSemana.map((dia) => (
                            <button
                                key={dia}
                                type="button"
                                onClick={() => toggleDia(dia, formEdit)}
                                className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all flex items-center justify-between ${formEdit.data.dias_guardia.includes(dia) ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"}`}
                            >
                                {dia}
                                {formEdit.data.dias_guardia.includes(dia) && (
                                    <Icons.CheckCircle2 size={14} />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            loading={formEdit.processing}
                            // disabled={formEdit.data.dias_guardia.length === 0} // <--- Deshabilitar
                            className="w-full bg-amber-500 hover:bg-amber-600 rounded-2xl font-black py-6 shadow-xl shadow-amber-100 disabled:opacity-50"
                        >
                            GUARDAR CAMBIOS
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

// COMPONENTE MODAL INTERNO REUTILIZABLE
function Modal({ isOpen, onClose, title, children, color }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 ${color}`}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black uppercase text-sm italic text-slate-800 tracking-tighter leading-none">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                        <Icons.X size={24} />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}
