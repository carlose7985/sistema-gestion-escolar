import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import {
    PlusCircle,
    Lock,
    Unlock,
    X,
    CalendarDays,
    ChevronLeftCircle,
    ShieldCheck,
    Flag,
    AlertTriangle,
    History,
    Edit3,
    Settings2,
} from "lucide-react";

export default function PeriodoEscolarIndex({ datos, configurado }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    // --- FORMULARIOS ---
    const formEdit = useForm({
        nombre_periodo: "",
        status_periodo: "",
    });

    const formCreate = useForm({
        nombre_periodo: "",
        status_periodo: "Abierto",
    });

    // --- MANEJADORES ---
    const openEdit = (p) => {
        if (p.status !== "Activo") return;
        setSelected(p);
        formEdit.setData({
            nombre_periodo: p.nombre_periodo,
            status_periodo: p.status_periodo,
        });
        setIsEditOpen(true);
    };

    // Función para manejar el cambio de página
    const onPageChange = (page) => {
        router.get(
            route("estudiantes.acciones.periodo.escolar.index"), // Ajusta tu ruta
            { page },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        formEdit.put(
            route("estudiantes.acciones.periodo.escolar.update", selected.id),
            {
                onSuccess: () => setIsEditOpen(false),
            },
        );
    };

    const handleCreate = (e) => {
        e.preventDefault();
        formCreate.post(route("estudiantes.acciones.periodo.escolar.store"), {
            onSuccess: () => setIsCreateOpen(false),
        });
    };

    const getStatusStyles = (status) => {
        const styles = {
            Activo: "bg-emerald-500 text-white shadow-emerald-200",
            Inactivo: "bg-slate-400 text-white shadow-slate-100",
            Finalizado: "bg-indigo-600 text-white shadow-indigo-100",
            Abierto: "border-emerald-200 text-emerald-600 bg-emerald-50",
            Cerrado: "border-amber-200 text-amber-600 bg-amber-50",
            Culminado: "border-rose-200 text-rose-600 bg-rose-50",
        };
        return styles[status] || "bg-gray-100";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Periodos Escolares" />

            <ViewContainer
                title="GESTIÓN DEL TIEMPO ACADÉMICO"
                subtitle="Control de ciclos, inscripciones y estados del sistema"
                icon="Settings2"
                showSearch={false}
                // --- PROPS DE PAGINACIÓN ---
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={onPageChange}
                // ---------------------------
                returns={
                    <Link href={route("estudiantes.acciones.index")}>
                        <Button>
                            <ChevronLeftCircle size={16} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    !configurado && (
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                        >
                            <PlusCircle size={16} className="mr-2" /> INICIAR
                            SISTEMA
                        </Button>
                    )
                }
            >
                <div className="bg-white rounded-t-[1.5rem] border border-slate-200 shadow-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest italic">
                                <th className="px-8 py-5">Ciclo Escolar</th>
                                <th className="px-8 py-5 text-center">
                                    Inscripciones
                                </th>
                                <th className="px-8 py-5 text-center">
                                    Estado Sistema
                                </th>
                                <th className="px-8 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* CAMBIO: Ahora iteramos sobre datos.data */}
                            {datos.data.length > 0 ? (
                                datos.data.map((periodo) => (
                                    <tr
                                        key={periodo.id}
                                        className={`group transition-all duration-300 ${periodo.status === "Activo" ? "bg-emerald-50/30" : "hover:bg-slate-50"}`}
                                    >
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${periodo.status === "Activo" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                                                >
                                                    <CalendarDays size={24} />
                                                </div>
                                                <div>
                                                    <span className="block text-lg font-black text-slate-800 tracking-tighter">
                                                        {periodo.nombre_periodo}
                                                    </span>
                                                    {periodo.status ===
                                                        "Activo" && (
                                                        <span className="text-[9px] font-black text-emerald-500 uppercase italic">
                                                            Vigente Actualmente
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border-2 ${getStatusStyles(periodo.status_periodo)}`}
                                            >
                                                {periodo.status_periodo ===
                                                "Abierto" ? (
                                                    <Unlock
                                                        size={12}
                                                        className="inline mr-1"
                                                    />
                                                ) : (
                                                    <Lock
                                                        size={12}
                                                        className="inline mr-1"
                                                    />
                                                )}
                                                {periodo.status_periodo}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span
                                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg ${getStatusStyles(periodo.status)}`}
                                            >
                                                {periodo.status === "Activo" ? (
                                                    <ShieldCheck
                                                        size={12}
                                                        className="inline mr-1"
                                                    />
                                                ) : (
                                                    <History
                                                        size={12}
                                                        className="inline mr-1"
                                                    />
                                                )}
                                                {periodo.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            {periodo.status === "Activo" &&
                                            periodo.status_periodo !==
                                                "Cerrado" ? (
                                                <button
                                                    onClick={() =>
                                                        openEdit(periodo)
                                                    }
                                                    className="p-3 bg-white border-2 border-slate-200 text-indigo-600 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all shadow-sm"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2 text-slate-300 opacity-50 cursor-not-allowed">
                                                    <Lock size={14} />
                                                    <span className="text-[9px] font-black uppercase italic">
                                                        {periodo.status_periodo ===
                                                        "Cerrado"
                                                            ? "Cerrado"
                                                            : "Lectura"}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="py-20 text-center"
                                    >
                                        <AlertTriangle
                                            size={64}
                                            className="mx-auto text-slate-200 mb-4"
                                        />
                                        <p className="text-sm font-black text-slate-400 uppercase">
                                            No se han registrado periodos
                                            escolares
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL EDITAR (SOLO PARA EL ACTIVO) */}
                {isEditOpen &&
                    createPortal(
                        <ModalContainer
                            title="Configurar Periodo Activo"
                            icon={<Settings2 size={30} />}
                            onClose={() => setIsEditOpen(false)}
                        >
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <Field
                                    label="Nombre del Periodo *"
                                    value={formEdit.data.nombre_periodo}
                                    onChange={(e) =>
                                        formEdit.setData(
                                            "nombre_periodo",
                                            e.target.value,
                                        )
                                    }
                                    error={formEdit.errors.nombre_periodo}
                                />
                                <SelectField
                                    label="Control de Inscripciones *"
                                    value={formEdit.data.status_periodo}
                                    options={[
                                        "Abierto",
                                        "Cerrado",
                                        "Culminado",
                                    ]}
                                    onChange={(e) =>
                                        formEdit.setData(
                                            "status_periodo",
                                            e.target.value,
                                        )
                                    }
                                    error={formEdit.errors.status_periodo}
                                />
                                <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 flex gap-3">
                                    <AlertTriangle
                                        className="text-amber-500 shrink-0"
                                        size={20}
                                    />
                                    <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed">
                                        Nota: El estado del sistema ("Activo")
                                        no puede cambiarse manualmente desde
                                        aquí para proteger la integridad del
                                        historial.
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    loading={formEdit.processing}
                                    className="w-full h-16 bg-indigo-600 rounded-2xl font-black"
                                >
                                    ACTUALIZAR CONFIGURACIÓN
                                </Button>
                            </form>
                        </ModalContainer>,
                        document.body,
                    )}

                {/* MODAL CREAR INICIAL */}
                {isCreateOpen &&
                    createPortal(
                        <ModalContainer
                            title="Inicializar Sistema"
                            icon={<PlusCircle size={30} />}
                            onClose={() => setIsCreateOpen(false)}
                        >
                            <form onSubmit={handleCreate} className="space-y-6">
                                <Field
                                    label="Nombre del Periodo Inicial *"
                                    placeholder="Ej: 2024-2025"
                                    value={formCreate.data.nombre_periodo}
                                    onChange={(e) =>
                                        formCreate.setData(
                                            "nombre_periodo",
                                            e.target.value,
                                        )
                                    }
                                    error={formCreate.errors.nombre_periodo}
                                />
                                <p className="text-[10px] font-black text-slate-400 uppercase italic">
                                    Al ser el primer periodo, se marcará
                                    automáticamente como{" "}
                                    <span className="text-emerald-500 font-bold">
                                        ACTIVO
                                    </span>
                                    .
                                </p>
                                <Button
                                    type="submit"
                                    loading={formCreate.processing}
                                    className="w-full h-16 bg-indigo-600 rounded-2xl font-black"
                                >
                                    CREAR PRIMER PERIODO
                                </Button>
                            </form>
                        </ModalContainer>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

const ModalContainer = ({ title, icon, children, onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
        <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
            >
                <X size={28} />
            </button>
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                    {icon}
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                    {title}
                </h3>
            </div>
            {children}
        </div>
    </div>
);
