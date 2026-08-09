import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import dayjs from "dayjs";
import {
    IdCard,
    Calendar,
    Edit,
    UserCheck,
    Printer,
    RotateCcw,
    X,
    Cake,
    ArrowLeftCircle,
    GraduationCap,
    History,
    Search,
    Mars,
    Venus,
    UserPen,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function EstudiantesRetirados({
    datos,
    filters,
    totals,
    grados,
    apreciaciones,
    periodo_escolar
}) {
    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const isTyping = useRef(false);

    const [modal, setModal] = useState({
        edit: false,
        return: false,
    });

    // --- FORMULARIOS ---
    const formEdit = useForm({
        name: "",
        apellido: "",
        documento: "V",
        cedula: "",
        fecha_de_nacimiento: "",
        sexo: "",
        apreciacion: "",
    });

    const formReturn = useForm({
        grado_id: "",
        condicion: "Regular",
        status_escolar: "Escolarizado",
    });

    // --- LÓGICA DE BÚSQUEDA Y PAGINACIÓN PERSISTENTE ---
    useEffect(() => {
        if (!isTyping.current) setSearchTerm(filters?.search || "");
    }, [filters.search]);

    const handleSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.inactivos.retirados.index"),
                { search: query, page: 1 },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    only: ["datos"],
                },
            );
        }, 400),
        [],
    );

    const onSearchChange = (val) => {
        isTyping.current = true;
        setSearchTerm(val);
        handleSearch(val);
        if (val === "") isTyping.current = false;
    };

    const onPageChange = (p) => {
        isTyping.current = false;
        router.get(
            route("estudiantes.inactivos.retirados.index"),
            { ...filters, search: searchTerm, page: p },
            { preserveScroll: true, preserveState: true },
        );
    };

    // --- HANDLERS MODALES ---
    const openEditModal = (student) => {
        setSelectedStudent(student);

        formEdit.setData({
            name: student.name,
            apellido: student.apellido,
            documento: student.documento || "V",
            cedula: student.cedula,
            fecha_de_nacimiento: student.fecha_de_nacimiento || "",
            sexo: student.sexo || "",
            apreciacion: student.apreciacion || "",
        });
        setModal((prev) => ({ ...prev, edit: true }));
    };

    const openReturnModal = (student) => {
        // 🔥 1. Verificar que el estudiante tenga datos
        if (!student) {
            toast.error("No se pudo cargar la información del estudiante");
            return;
        }

        // 🔥 2. Verificar que el estudiante no haya sido reingresado
        if (student.status_escolar === "Reingresado") {
            Swal.fire({
                icon: "info",
                title: "Estudiante ya reingresado",
                html: `
                <div class="space-y-3">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                        El estudiante <span class="font-bold text-blue-600 dark:text-blue-400">${student.name} ${student.apellido}</span> 
                        ya fue reingresado a la institución.
                    </p>
                    <p class="text-xs text-slate-500">
                        No se puede editar un registro que ya fue reingresado.
                    </p>
                </div>
            `,
                confirmButtonColor: "#3b82f6",
                confirmButtonText: "Entendido",
                background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)",
                backdrop: "rgba(0,0,0,0.8)",
                customClass: {
                    popup: "border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)] rounded-2xl",
                    confirmButton:
                        "px-6 py-2.5 text-sm font-bold tracking-widest uppercase rounded-xl",
                },
            });
            return;
        }
        setSelectedStudent(student);
        formReturn.setData("grado_id", student.grado_id || "");
        setModal((prev) => ({ ...prev, return: true }));
    };;

    // --- SUBMITS ---
    const handleUpdate = (e) => {
        e.preventDefault();
        formEdit.put(
            route(
                "estudiantes.inactivos.retirados.update",
                selectedStudent.periodo_estudiante_id,
            ), // 🔥 CAMBIADO
            {
                onSuccess: () => {
                    setModal((prev) => ({ ...prev, edit: false }));
                    clearSearchAndFocus();
                },
                onError: (errors) => {
                    toast.error("Error al actualizar");
                },
            },
        );
    };

    const handleReturn = (e) => {
        e.preventDefault();

        // 🔥 4. Si pasa todas las validaciones, enviar la petición
        formReturn.post(
            route(
                "estudiantes.inactivos.retirados.reingresar",
                selectedStudent.periodo_estudiante_id,
            ),
            {
                onSuccess: () => {
                    setModal((prev) => ({ ...prev, return: false }));
                    clearSearchAndFocus();
                   // toast.success("Estudiante reingresado correctamente");
                },
                onError: (errors) => {
                    const errorMsg =
                        errors?.response?.data?.error || "Error al reingresar";
                    toast.error(errorMsg);
                },
            },
        );
    };

    // --- FUNCIÓN PARA LIMPIAR Y ENFOCAR ---
    const clearSearchAndFocus = () => {
        setSearchTerm("");
        isTyping.current = false;

        router.get(
            route("estudiantes.inactivos.retirados.index"),
            { search: "", page: 1 },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onFinish: () => {
                    setTimeout(() => {
                        const input =
                            document.getElementById("universal-search");
                        if (input) {
                            input.focus();
                            input.value = "";
                        }
                    }, 150);
                },
            },
        );
    };

   const handlePrint = (student) => {
       const url = route("estudiantesInactivosExport", {
           type: "constancia-de-retiro",
           estudiante_id: student.estudiante_id,
           periodo_id: student.periodo_id,
           grado_id: student.grado_id,
       });
       window.open(url, "_blank");
   };

    const getInitials = (n, a) =>
        `${n?.charAt(0)}${a?.charAt(0)}`.toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title="Estudiantes Retirados" />

            <ViewContainer
                title="HISTORIAL DE RETIRADOS"
                subtitle="Registro de alumnos que egresaron de la institución"
                icon="UserMinus"
                showSearch={true}
                searchValue={searchTerm}
                onSearch={onSearchChange}
                onPageChange={onPageChange}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                returns={
                    <Link href={route("estudiantes.inactivos.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-1" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                footerStats={
                    <div className="flex items-center gap-6 text-slate-500 font-black text-[10px] uppercase">
                        <div className="flex items-center gap-2">
                            <Mars size={14} className="text-blue-500" />{" "}
                            {totals.masculino}
                        </div>
                        <div className="flex items-center gap-2">
                            <Venus size={14} className="text-pink-500" />{" "}
                            {totals.femenino}
                        </div>
                        <div className="bg-slate-900 text-white px-3 py-1 rounded-lg">
                            TOTAL HISTÓRICO: {totals.general}
                        </div>
                    </div>
                }
            >
                <div className="h-full bg-white border border-slate-200 rounded-t-[1.5rem] overflow-hidden shadow-2xl">
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse select-text">
                            <thead className="sticky top-0 z-20 bg-blue-600 text-white uppercase text-[10px] font-black tracking-widest italic">
                                <tr>
                                    <th className="px-6 py-4 border-r border-blue-500 text-left">
                                        Ficha del Estudiante
                                    </th>
                                    <th className="px-6 py-4 border-r border-blue-500 text-center">
                                        Grado / Periodo
                                    </th>
                                    <th className="px-6 py-4 border-r border-blue-500 text-center">
                                        Fecha de Retiro
                                    </th>
                                    <th className="px-6 py-4 border-r border-blue-500 text-center">
                                        Status Escolar
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-500 text-[11px]">
                                {datos.data.map((student) => (
                                    <tr
                                        key={student.periodo_estudiante_id}
                                        className="hover:bg-blue-50/40 transition-colors"
                                    >
                                        {/* INFO PERSONAL */}
                                        <td className="px-6 py-2 border-r border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-sm ${
                                                        student.sexo === "M"
                                                            ? "bg-blue-50 text-blue-600 border-blue-200"
                                                            : "bg-pink-50 text-pink-600 border-pink-200"
                                                    }`}
                                                >
                                                    {getInitials(
                                                        student.name,
                                                        student.apellido,
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-black text-slate-800 uppercase text-[13px] leading-tight">
                                                        {student.name}{" "}
                                                        {student.apellido}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-slate-500 font-mono font-bold">
                                                        <IdCard
                                                            size={12}
                                                            className="text-blue-700"
                                                        />
                                                        <b className="text-[14px] text-gray-700 font-bold font-mono">
                                                            {student.cedula}
                                                        </b>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                                                            <Calendar
                                                                size={12}
                                                            />
                                                            <b className="text-14">
                                                                {" "}
                                                                {dayjs(
                                                                    student.fecha_de_nacimiento,
                                                                ).format(
                                                                    "DD/MM/YYYY",
                                                                )}
                                                            </b>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-black text-[11px]">
                                                            <Cake size={10} />{" "}
                                                            {student.age} AÑOS
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* GRADO Y PERÍODO - CORREGIDO */}
                                        <td className="px-6 py-2 border-r border-slate-50 text-center">
                                            {student.nombre_del_grado ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black uppercase text-[10px] border border-indigo-100 shadow-sm">
                                                        <GraduationCap
                                                            size={14}
                                                        />{" "}
                                                        {
                                                            student.nombre_del_grado
                                                        }{" "}
                                                        "{student.seccion}"
                                                    </div>

                                                    <span className="text-[11px] font-black text-slate-400 mt-0.5 bg-slate-100 px-2 py-0.5 rounded">
                                                        📅{" "}
                                                        {student.periodo_escolar ||
                                                            "Periodo no registrado"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase text-slate-300 italic tracking-widest">
                                                    Sin Registro
                                                </span>
                                            )}
                                        </td>

                                        {/* FECHA RETIRO */}
                                        <td className="px-6 py-2 border-r border-slate-50 text-center">
                                            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-black border border-rose-100 shadow-inner">
                                                <History size={16} />
                                                {dayjs(
                                                    student.fecha_registro,
                                                ).format("DD/MM/YYYY")}
                                            </div>
                                        </td>
                                        {/* STATUS */}
                                        <td className="px-6 py-2 border-r border-slate-50 text-center">
                                            <div className="inline-flex items-center gap-2 bg-rose-50 text-green-600 px-4 py-2 rounded-xl font-black border border-green-100 shadow-inner">
                                                <History size={16} />
                                                {
                                                    student.status_escolar
                                                }
                                            </div>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handlePrint(student)
                                                    }
                                                    title="Constancia de Retiro"
                                                    className="p-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-100"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openEditModal(student)
                                                    }
                                                    title="Editar Ficha"
                                                    className="p-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
                                                >
                                                    <UserPen size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openReturnModal(student)
                                                    }
                                                    title="Reingresar Estudiante"
                                                    className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {datos.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="py-24 text-center opacity-20"
                                        >
                                            <Search
                                                size={64}
                                                className="mx-auto mb-4"
                                            />
                                            <span className="text-sm font-black uppercase tracking-[0.3em]">
                                                No hay coincidencias
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL EDITAR (Portal Neon Blue) */}
                {modal.edit &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)] border-2 border-blue-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, edit: false })
                                    }
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={28} />
                                </button>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                                        <Edit size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                                            Editar Retirado
                                        </h3>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-2">
                                            Ajuste de datos históricos
                                        </p>
                                    </div>
                                </div>
                                <form
                                    onSubmit={handleUpdate}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <Field
                                        label="Nombres *"
                                        value={formEdit.data.name}
                                        autoFocus
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Field
                                        label="Apellidos *"
                                        value={formEdit.data.apellido}
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "apellido",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Field
                                        label="Identificación"
                                        value={formEdit.data.cedula}
                                        mask="00000000000"
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "cedula",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                    />
                                    <Field
                                        label="Fecha de Nacimiento"
                                        type="date"
                                        value={
                                            formEdit.data.fecha_de_nacimiento
                                        }
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "fecha_de_nacimiento",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <SelectField
                                        label="Género"
                                        value={formEdit.data.sexo}
                                        options={[
                                            { v: "M", l: "Masculino" },
                                            { v: "F", l: "Femenino" },
                                        ]}
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "sexo",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <SelectField
                                        label="Literal (Apreciación)"
                                        value={formEdit.data.apreciacion}
                                        options={
                                            apreciaciones?.map((a) => ({
                                                v: a.nombre_completo,
                                                l: a.nombre_completo,
                                            })) || []
                                        }
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "apreciacion",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <Button
                                        type="submit"
                                        loading={formEdit.processing}
                                        className="col-span-full h-16 bg-blue-600 rounded-3xl font-black shadow-xl"
                                    >
                                        GUARDAR CAMBIOS
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL REINGRESO (Portal Neon Emerald) */}
                {modal.return &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-md p-12 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)] border-2 border-emerald-100 relative text-center animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, return: false })
                                    }
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <X size={28} />
                                </button>
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
                                    <UserCheck size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-2 leading-none">
                                    Reingresar Alumno
                                </h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase mb-8">
                                    Alumno:{" "}
                                    <span className="text-emerald-600 font-black">
                                        {selectedStudent?.name}
                                    </span>
                                </p>

                                <form
                                    onSubmit={handleReturn}
                                    className="space-y-6 text-left"
                                >
                                    <SelectField
                                        label="Grado / Sección Destino *"
                                        value={formReturn.data.grado_id}
                                        options={grados.map((g) => ({
                                            v: g.id,
                                            l: g.name,
                                        }))}
                                        onChange={(e) =>
                                            formReturn.setData(
                                                "grado_id",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            label="Condición"
                                            value={formReturn.data.condicion}
                                            options={["Regular", "Repitiente"]}
                                            onChange={(e) =>
                                                formReturn.setData(
                                                    "condicion",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <SelectField
                                            label="Estatus"
                                            value={
                                                formReturn.data.status_escolar
                                            }
                                            options={[
                                                "Escolarizado",
                                                "No escolarizado",
                                                "Otros",
                                            ]}
                                            onChange={(e) =>
                                                formReturn.setData(
                                                    "status_escolar",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        loading={formReturn.processing}
                                        className="w-full h-16 bg-emerald-600 text-white rounded-3xl font-black shadow-xl mt-4"
                                    >
                                        CONFIRMAR REINGRESO
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
