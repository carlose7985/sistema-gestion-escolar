import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import {
    Search,
    UserPlus,
    School,
    Edit,
    Save,
    X,
    Loader2,
    ArrowLeftCircle,
    CheckCircle,
    Clock,
    Printer,
    ChevronDown,
    Trash2,
    Edit2,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function ZonificacionGeneral({
    datos = { data: [], current_page: 1, last_page: 1, total: 0 },
    resumenSecciones = [],
    planteles = [],
    stats = { procesados: 0, pendientes: 0 },
    periodosDisponibles = [],
    filters = { search: "", grado_id: "", plantel_id: "" },
}) {
    // --- ESTADOS ---
    const [search, setSearch] = useState(filters.search || "");
    const [liceoSearch, setLiceoSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlantelIds, setSelectedPlantelIds] = useState([]);
    const isTyping = useRef(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPlanteles = planteles.filter((p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const searchInputRef = useRef(null);
    const [modal, setModal] = useState({
        edit: false,
        plantel: false,
        export: false,
    });
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // --- FORMULARIOS ---
    const editForm = useForm({
        name: "",
        apellido: "",
        cedula: "",
        sexo: "",
        fecha_de_nacimiento: "",
    });

    const plantelForm = useForm({
        plantel_id: "",
        nuevo_plantel: "",
        director: "",
    });

    // --- LÓGICA DE BÚSQUEDA Y PAGINACIÓN ---
    useEffect(() => {
        if (!isTyping.current) {
            setSearch(filters.search || "");
        }
    }, [filters.search]);

    const handleSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.acciones.zonificacion.index"),
                { search: query, page: 1 },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    only: ["datos", "stats", "resumenSecciones"],
                },
            );
        }, 500),
        [],
    );

    const onSearchChange = (val) => {
        isTyping.current = true;
        setSearch(val);
        handleSearch(val);
        if (val === "") isTyping.current = false;
    };

    const handleBlur = () => {
        isTyping.current = false;
    };

    // --- MANEJADORES DE ACCIONES ---
    const openEditModal = (student) => {
        setSelectedStudent(student);
        editForm.setData({
            name: student.name,
            apellido: student.apellido,
            cedula: student.cedula,
            sexo: student.sexo,
            fecha_de_nacimiento: student.fecha_de_nacimiento || "",
        });
        setModal({ ...modal, edit: true });
    };

    const openPlantelModal = (student) => {
        setSelectedStudent(student);
        setLiceoSearch("");
        plantelForm.reset();
        plantelForm.setData({
            plantel_id: student.plantel_id || "",
            nuevo_plantel: "",
            director: student.director || "",
        });
        setModal({ ...modal, plantel: true });
    };

    const handleUpdateData = (e) => {
        e.preventDefault();
        editForm.put(
            route(
                "estudiantes.acciones.zonificacion.update",
                selectedStudent.id,
            ),
            {
                onSuccess: () => setModal({ ...modal, edit: false }),
            },
        );
    };

    const handleChangePlantel = (e) => {
        e.preventDefault();

        const isNew = plantelForm.data.nuevo_plantel.trim() !== "";

        if (isNew) {
            plantelForm.setData("plantel_id", null);
        }

        plantelForm.put(
            route(
                "estudiantes.acciones.zonificacion.cambiar.plantel",
                selectedStudent.id,
            ),
            {
                onSuccess: () => {
                    setModal({ ...modal, plantel: false });
                    plantelForm.reset();
                },
                onError: () => toast.error("Error al actualizar el destino"),
            },
        );
    };

    const handleConfirmExport = (type) => {
        if (!selectedPeriod) return toast.warning("Seleccione un periodo");

        const params = {
            type,
            periodo: selectedPeriod,
            plantel_ids: selectedPlantelIds.join(","),
        };

        window.open(route("estudiantesExport", params), "_blank");
        setModal({ ...modal, export: false });
    };

    const confirmDelete = (student) => {
        Swal.fire({
            title: '<span class="text-slate-800 font-black uppercase tracking-tighter">¿Eliminar Registro?</span>',
            html: `<p class="text-sm text-slate-500 font-medium">Se borrará permanentemente el destino de <b>${student.name} ${student.apellido}</b>. El alumno volverá a aparecer como pendiente.</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, ELIMINAR",
            cancelButtonText: "CANCELAR",
            confirmButtonColor: "#ef4444",
            customClass: {
                popup: "rounded-[2.5rem] p-10 border-4 border-white shadow-2xl",
                confirmButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-lg",
                cancelButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    route(
                        "estudiantes.acciones.zonificacion.destroy",
                        student.id,
                    ),
                    {
                        onStart: () => setIsProcessing(true),
                        onFinish: () => setIsProcessing(false),
                    },
                );
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Zonificados General" />

            <ViewContainer
                title="VISTA ESTUDIANTES ZONIFICADOS"
                subtitle="Seguimiento de egreso a educación media"
                icon="Map"
                showSearch={true}
                searchValue={search}
                onSearch={onSearchChange}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={(p) => {
                    isTyping.current = false;
                    router.get(
                        route("estudiantes.acciones.zonificacion.index"),
                        {
                            search: search,
                            page: p,
                        },
                        { preserveState: true, preserveScroll: true },
                    );
                }}
                returns={
                    <div className="flex items-center gap-2">
                        <Link href={route("estudiantes.acciones.index")}>
                            <Button>
                                <ArrowLeftCircle className="mr-2" size={16} />{" "}
                                VOLVER
                            </Button>
                        </Link>
                        <Button
                            variant="warning"
                            onClick={() => setModal({ ...modal, export: true })}
                        >
                            <Printer className="mr-2" size={16} /> REPORTE
                            GENERAL
                        </Button>
                    </div>
                }
                actions={
                    <div className="flex items-center gap-2">
                        <Link
                            href={route(
                                "estudiantes.acciones.zonificacion.seleccionar",
                            )}
                        >
                            <Button variant="success">
                                <UserPlus className="mr-2" size={14} /> NUEVA
                                ZONIFICACIÓN
                            </Button>
                        </Link>
                        <Link
                            href={route("estudiantes.acciones.planteles.index")}
                        >
                            <Button variant="primary">
                                <School className="mr-2" size={16} /> VER
                                PLANTELES
                            </Button>
                        </Link>
                    </div>
                }
                extraFilters={
                    <div className="flex gap-4 ml-auto">
                        <StatBadge
                            icon={<CheckCircle size={14} />}
                            label="Zonificados"
                            value={stats.procesados}
                            color="bg-indigo-600"
                        />
                        <StatBadge
                            icon={<Clock size={14} />}
                            label="Pendientes"
                            value={stats.pendientes}
                            color="bg-amber-500"
                        />
                    </div>
                }
                footerStats={
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {resumenSecciones.map((sec) => (
                            <div
                                key={sec.id}
                                className="flex items-center gap-3 bg-slate-900 border border-slate-700 pl-3 pr-4 py-1.5 rounded-xl text-white whitespace-nowrap shadow-sm"
                            >
                                <div className="flex flex-col border-r border-slate-700 pr-3 items-center">
                                    <span className="text-[7px] font-black uppercase leading-none opacity-50 text-slate-400">
                                        Sección
                                    </span>
                                    <span className="text-[10px] font-black uppercase italic">
                                        {sec.nombre.replace("6to Grado ", "")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] font-black text-indigo-400">
                                            Zonif.
                                        </span>
                                        <span className="text-xs font-black">
                                            {sec.procesados}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] font-black text-rose-400">
                                            Faltan
                                        </span>
                                        <span className="text-xs font-black">
                                            {sec.pendientes}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            >
                {isProcessing && (
                    <div className="absolute inset-0 z-[100] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                        <div className="relative">
                            <Loader2
                                size={80}
                                className="animate-spin text-indigo-600"
                            />
                            <Loader2
                                size={40}
                                className="animate-spin text-emerald-500 absolute top-5 left-5"
                                style={{ animationDirection: "reverse" }}
                            />
                        </div>
                        <span className="mt-4 text-[11px] font-black uppercase text-indigo-600 tracking-[0.3em] animate-pulse">
                            Procesando datos...
                        </span>
                    </div>
                )}

                {/* TABLA PRINCIPAL */}
                <div className="bg-white border border-slate-900 rounded-t-[1.5rem] overflow-hidden shadow-2xl flex flex-col h-full">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse text-[12px]">
                            <thead className="sticky top-0 z-20 bg-slate-800 text-white text-[10px] uppercase font-black italic">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        Cédula
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        Sección Origen
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        Liceo Destino
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-600">
                                {datos.data.map((z) => (
                                    <tr
                                        key={z.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 uppercase">
                                                    {z.name} {z.apellido}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                    {z.sexo === "M"
                                                        ? "Masculino"
                                                        : "Femenino"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-black text-slate-500">
                                            {z.cedula || ""}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-black text-[9px] border border-indigo-100">
                                                6TO "
                                                {z.grado_seccion ||
                                                    z.seccion ||
                                                    ""}
                                                "
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-between group">
                                                <span className="text-indigo-600 font-black uppercase text-[10px] italic">
                                                    {z.plantel_nombre ||
                                                        z.plantel?.nombre ||
                                                        "NO ASIGNADO"}
                                                </span>
                                                <button
                                                    title="Cambiar de Liceo"
                                                    onClick={() =>
                                                        openPlantelModal(z)
                                                    }
                                                    className="text-emerald-500 hover:text-indigo-600 ml-2 rounded-xl p-2 transition-all border border-gray-400"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openEditModal(z)}
                                                className="p-2 mr-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-gray-400"
                                                title="Actualizar Zonificación"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(z)}
                                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-gray-400"
                                                title="Eliminar Zonificación"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {datos.data.length === 0 && (
                            <div className="py-24 text-center">
                                <School
                                    size={64}
                                    className="mx-auto text-slate-200 mb-4"
                                />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                                    No hay estudiantes registrados
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </ViewContainer>

            {/* --- MODALES --- */}

            {/* MODAL EXPORTAR */}
            {modal.export &&
                createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                        <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-2 border-indigo-100 relative text-center">
                            <button
                                onClick={() =>
                                    setModal({ ...modal, export: false })
                                }
                                className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                            >
                                <X size={24} />
                            </button>
                            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-indigo-50">
                                <Printer size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">
                                Imprimir Reporte
                            </h3>
                            <SelectField
                                label="Periodo Escolar *"
                                value={selectedPeriod}
                                options={periodosDisponibles.map((p) => ({
                                    v: p,
                                    l: p,
                                }))}
                                onChange={(e) =>
                                    setSelectedPeriod(e.target.value)
                                }
                            />

                            <div className="space-y-2 mt-4 border-t pt-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                                    Filtrar por Institución
                                </label>

                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    placeholder="Buscar..."
                                    className="w-full p-3 mb-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />

                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar bg-slate-50 rounded-xl p-2 border border-slate-100">
                                    {filteredPlanteles.length > 0 ? (
                                        filteredPlanteles.map((p) => (
                                            <label
                                                key={p.id}
                                                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-all"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedPlantelIds.includes(
                                                        p.id,
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedPlantelIds(
                                                                [
                                                                    ...selectedPlantelIds,
                                                                    p.id,
                                                                ],
                                                            );
                                                            setSearchTerm("");
                                                            setTimeout(() => {
                                                                searchInputRef.current?.focus();
                                                            }, 0);
                                                        } else {
                                                            setSelectedPlantelIds(
                                                                selectedPlantelIds.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        p.id,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                />
                                                <span className="text-[10px] font-black text-slate-600 uppercase">
                                                    {p.nombre}
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-center text-[10px] text-slate-400 py-4 italic">
                                            No se encontraron resultados
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() =>
                                    handleConfirmExport("zonificacion-pdf")
                                }
                                disabled={!selectedPeriod}
                                className="w-full h-16 bg-indigo-600 rounded-2xl font-black mt-6"
                            >
                                GENERAR PDF
                            </Button>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* MODAL EDITAR DATOS */}
            {modal.edit &&
                createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                        <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] border-2 border-cyan-100 relative">
                            <button
                                onClick={() =>
                                    setModal({ ...modal, edit: false })
                                }
                                className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                            >
                                <X size={28} />
                            </button>
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 bg-cyan-500 text-white rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-cyan-50">
                                    <Edit size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                                        Editar Estudiante
                                    </h3>
                                    <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mt-2">
                                        Actualización datos del estudiante
                                    </p>
                                </div>
                            </div>
                            <form
                                onSubmit={handleUpdateData}
                                className="w-full space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-5">
                                    <Field
                                        label="Nombres"
                                        value={editForm.data.name}
                                        autoFocus
                                        onChange={(e) =>
                                            editForm.setData(
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        error={editForm.errors.name}
                                        required
                                    />
                                    <Field
                                        label="Apellidos"
                                        value={editForm.data.apellido}
                                        onChange={(e) =>
                                            editForm.setData(
                                                "apellido",
                                                e.target.value,
                                            )
                                        }
                                        error={editForm.errors.apellido}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <Field
                                        label="Cédula"
                                        value={editForm.data.cedula}
                                        mask="00000000000"
                                        onChange={(e) =>
                                            editForm.setData(
                                                "cedula",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        error={editForm.errors.cedula}
                                    />
                                    <SelectField
                                        label="Género"
                                        value={editForm.data.sexo}
                                        options={[
                                            { v: "M", l: "Masculino" },
                                            { v: "F", l: "Femenino" },
                                        ]}
                                        onChange={(e) =>
                                            editForm.setData(
                                                "sexo",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    loading={editForm.processing}
                                    className="w-full h-16 bg-cyan-600 rounded-2xl font-black shadow-lg"
                                >
                                    GUARDAR CAMBIOS
                                </Button>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* MODAL CAMBIAR PLANTEL */}
            {modal.plantel &&
                createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] border-2 border-emerald-100 relative">
                            <button
                                onClick={() =>
                                    setModal({ ...modal, plantel: false })
                                }
                                className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                            >
                                <X size={28} />
                            </button>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-lg ring-4 ring-emerald-50">
                                    <School size={40} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                                        Zonificación
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 italic">
                                        Alumno:{" "}
                                        <span className="text-emerald-600 font-black">
                                            {selectedStudent?.name}{" "}
                                            {selectedStudent?.apellido}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleChangePlantel}
                                className="space-y-6"
                            >
                                {/* 1. EL SWITCH SIEMPRE VISIBLE */}
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                    <span
                                        className={`text-[9px] font-black uppercase ml-2 ${
                                            !plantelForm.data.nuevo_plantel
                                                ? "text-rose-600"
                                                : "text-emerald-600"
                                        }`}
                                    >
                                        {!plantelForm.data.nuevo_plantel
                                            ? "📋 Clic para registrar nuevo plantel"
                                            : "✏️ Modo: Registro manual"}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            plantelForm.setData({
                                                ...plantelForm.data,
                                                nuevo_plantel: !plantelForm.data
                                                    .nuevo_plantel
                                                    ? " "
                                                    : "",
                                                plantel_id: "",
                                                director: "",
                                            });
                                            setLiceoSearch("");
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${
                                            plantelForm.data.nuevo_plantel
                                                ? "bg-emerald-500"
                                                : "bg-rose-500"
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${
                                                plantelForm.data.nuevo_plantel
                                                    ? "left-7"
                                                    : "left-1"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* 2. CONTENIDO VARIABLE */}
                                {!plantelForm.data.nuevo_plantel ? (
                                    <div className="space-y-3">
                                        <div
                                            className="relative"
                                            ref={dropdownRef}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsDropdownOpen(
                                                        !isDropdownOpen,
                                                    )
                                                }
                                                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-4 text-left flex items-center justify-between hover:border-emerald-400 transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <School
                                                        size={20}
                                                        className="text-emerald-500"
                                                    />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {plantelForm.data
                                                            .plantel_id
                                                            ? planteles.find(
                                                                  (p) =>
                                                                      p.id ===
                                                                      plantelForm
                                                                          .data
                                                                          .plantel_id,
                                                              )?.nombre
                                                            : "Seleccionar liceo..."}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    size={20}
                                                    className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                                                />
                                            </button>

                                            {isDropdownOpen && (
                                                <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl overflow-hidden">
                                                    {/* Buscador interno */}
                                                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                                        <div className="relative">
                                                            <Search
                                                                size={14}
                                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Filtrar liceos..."
                                                                value={
                                                                    liceoSearch
                                                                }
                                                                onChange={(e) =>
                                                                    setLiceoSearch(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                                                autoFocus
                                                            />
                                                            {liceoSearch && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setLiceoSearch(
                                                                            "",
                                                                        );
                                                                    }}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                                                                >
                                                                    <X
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 🔥 LISTA CON SCROLL ELEGANTE COLOR PINK */}
                                                    <div className="max-h-[180px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-rose-300 [&::-webkit-scrollbar-thumb:hover]:bg-rose-400 rounded-b-2xl">
                                                        {planteles
                                                            .filter((p) =>
                                                                p.nombre
                                                                    .toLowerCase()
                                                                    .includes(
                                                                        liceoSearch.toLowerCase(),
                                                                    ),
                                                            )
                                                            .slice(0, 1000)
                                                            .map((p) => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        plantelForm.setData(
                                                                            "plantel_id",
                                                                            p.id,
                                                                        );
                                                                        setIsDropdownOpen(
                                                                            false,
                                                                        );
                                                                        setLiceoSearch(
                                                                            "",
                                                                        );
                                                                    }}
                                                                    className={`w-full text-left p-3 transition-all duration-150 border-b border-slate-50 last:border-0 hover:bg-rose-50 ${
                                                                        plantelForm
                                                                            .data
                                                                            .plantel_id ===
                                                                        p.id
                                                                            ? "bg-rose-50"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start gap-2">
                                                                        <div className="mt-0.5">
                                                                            <div
                                                                                className={`w-2 h-2 rounded-full ${plantelForm.data.plantel_id === p.id ? "bg-rose-500" : "bg-slate-300"}`}
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-[11px] font-black uppercase text-slate-700 leading-tight">
                                                                                {
                                                                                    p.nombre
                                                                                }
                                                                            </p>
                                                                            {p.direccion && (
                                                                                <p className="text-[8px] font-medium text-slate-400 mt-1 truncate">
                                                                                    {
                                                                                        p.direccion
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Field
                                            label="Nombre del Plantel *"
                                            autoFocus
                                            value={
                                                plantelForm.data
                                                    .nuevo_plantel === " "
                                                    ? ""
                                                    : plantelForm.data
                                                          .nuevo_plantel
                                            }
                                            onChange={(e) =>
                                                plantelForm.setData(
                                                    "nuevo_plantel",
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="EJ: LICEO BOLIVARIANO..."
                                        />
                                        <Field
                                            label="Nombre del Director(a)"
                                            value={plantelForm.data.director}
                                            onChange={(e) =>
                                                plantelForm.setData(
                                                    "director",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="ESCRIBA EL NOMBRE DEL DIRECTOR..."
                                        />
                                    </div>
                                )}

                                {/* 3. BOTÓN DE ENVÍO */}
                                <Button
                                    type="submit"
                                    disabled={
                                        plantelForm.processing ||
                                        (!plantelForm.data.plantel_id &&
                                            !plantelForm.data.nuevo_plantel.trim())
                                    }
                                    className={`w-full h-20 rounded-[2rem] font-black text-sm shadow-2xl flex items-center justify-center gap-4 ${
                                        plantelForm.data.nuevo_plantel
                                            ? "bg-rose-600 hover:bg-rose-500"
                                            : "bg-emerald-600 hover:bg-emerald-500"
                                    }`}
                                >
                                    {plantelForm.processing ? (
                                        <>
                                            <Loader2
                                                className="animate-spin"
                                                size={32}
                                            />
                                            <span>PROCESANDO...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={24} />
                                            <span>ACTUALIZAR DESTINO</span>
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}
        </AuthenticatedLayout>
    );
}

// --- SUB-COMPONENTES ---
const StatBadge = ({ icon, label, value, color }) => (
    <div
        className={`${color} p-2 rounded-2xl text-white flex items-center gap-3 shadow-lg min-w-[150px]`}
    >
        <div className="bg-white/20 p-2 rounded-xl">{icon}</div>
        <div>
            <p className="text-[8px] font-black uppercase opacity-70 tracking-widest">
                {label}
            </p>
            <p className="text-xl font-black leading-none">{value}</p>
        </div>
    </div>
);
