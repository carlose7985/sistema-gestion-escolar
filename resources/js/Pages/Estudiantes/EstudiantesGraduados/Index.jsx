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
    Printer,
    Save,
    X,
    Cake,
    ArrowLeftCircle,
    GraduationCap,
    History,
    Search,
    Award,
    Plus,
    Mars,
    Venus,
    FileCheck,
    Award as AwardIcon,
    TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function EstudiantesGraduados({
    datos,
    filters,
    totals,
    apreciacionesAprobadas,
}) {
    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const isTyping = useRef(false);

    // --- ESTADOS PARA IMPRESIÓN ---
    const [printModal, setPrintModal] = useState({
        open: false,
        student: null,
        selectedDocs: {
            constancia: false,
            buenaConducta: false,
        },
    });

    // --- ESTADOS PARA RE-IMPRESIÓN ---
    const [modal, setModal] = useState({
        printWarning: false,
    });

    // --- FORMULARIO DE EDICIÓN ---
    const editForm = useForm({
        name: "",
        apellido: "",
        documento: "V",
        cedula: "",
        fecha_de_nacimiento: "",
        sexo: "",
        apreciacion: "",
    });

    // --- FUNCIÓN PARA LIMPIAR Y ENFOCAR ---
    const clearSearchAndFocus = () => {
        setSearchTerm("");
        isTyping.current = false;

        router.get(
            route("estudiantes.inactivos.graduados.index"),
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

    // --- BÚSQUEDA Y PAGINACIÓN ---
    useEffect(() => {
        if (!isTyping.current) setSearchTerm(filters?.search || "");
    }, [filters.search]);

    const handleSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.inactivos.graduados.index"),
                { search: query, page: 1 },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    only: ["datos"],
                },
            );
        }, 500),
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
            route("estudiantes.inactivos.graduados.index"),
            { ...filters, search: searchTerm, page: p },
            { preserveScroll: true, preserveState: true },
        );
    };

    // --- HANDLERS MODALES ---
    const openEditModal = (student) => {
        setSelectedStudent(student);
        editForm.setData({
            name: student.name,
            apellido: student.apellido,
            documento: student.documento || "V",
            cedula: student.cedula,
            fecha_de_nacimiento: student.fecha_de_nacimiento || "",
            sexo: student.sexo || "",
            apreciacion: student.apreciacion || "",
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(
            route(
                "estudiantes.inactivos.graduados.update",
                selectedStudent.periodo_estudiante_id,
            ),
            {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    clearSearchAndFocus();
                },
                onError: (errors) => {
                    toast.error("Error al actualizar");
                },
            },
        );
    };

    // --- LÓGICA DE IMPRESIÓN ---
    const getPrintCount = (val) =>
        !val || val === "No" || val === "0"
            ? 0
            : val === "Si"
              ? 1
              : parseInt(val);

    const handlePrePrint = (student) => {
        setSelectedStudent(student);

        // Verificar si ya tiene impresiones previas
        const count = getPrintCount(student.contador_impresiones);

        if (count > 0) {
            // Si ya tiene impresiones, mostrar modal de advertencia
            setModal({ printWarning: true });
        } else {
            // Si no tiene impresiones, abrir directamente el modal de selección de documentos
            setPrintModal({
                open: true,
                student: student,
                selectedDocs: {
                    constancia: true,
                    // descriptivo: true,
                    buenaConducta: true,
                    certificado: true,
                },
            });
        }
    };

    // Función que se ejecuta desde el modal de reimpresión
    const handleRePrint = () => {
        // Cerrar el modal de advertencia
        setModal({ printWarning: false });

        // Abrir el modal de selección de documentos con el estudiante seleccionado
        setPrintModal({
            open: true,
            student: selectedStudent,
            selectedDocs: {
                constancia: true,
                // descriptivo: true,
                buenaConducta: true,
                certificado: true,
            },
        });
    };

    // Función para Impresión Individual
    const executeSelectedPrints = () => {
        const student = printModal.student;
        const docs = printModal.selectedDocs;

        if (!student) return;

        const url = route("estudiantesCalificadosExport", {
            type: "constancias-prosecucion",
            estudiante_id: student.estudiante_id,
            periodo_id: student.periodo_id,
            grado_id: student.grado_id,
            // Forzamos 1 o 0 para evitar problemas de interpretación de strings en PHP
            constancia: docs.constancia ? 1 : 0,
            // descriptivo: docs.descriptivo ? 1 : 0,
            buenaConducta: docs.buenaConducta ? 1 : 0,
            certificado: docs.certificado ? 1 : 0,
        });

        window.open(url, "_blank");
        setPrintModal({ ...printModal, open: false });
        // 🔥 Limpiar y enfocar después de imprimir
        setTimeout(() => {
            clearSearchAndFocus();
        }, 500);
    };

    const getInitials = (n, a) =>
        `${n?.charAt(0)}${a?.charAt(0)}`.toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title="Estudiantes Graduados" />

            <ViewContainer
                title="EGRESADOS INSTITUCIONALES"
                subtitle="Registro histórico de alumnos graduados de 6to Grado"
                icon="GraduationCap"
                showSearch={true}
                searchValue={searchTerm}
                onSearch={onSearchChange}
                onPageChange={onPageChange}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                returns={
                    <Link href={route("estudiantes.inactivos.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    <Link
                        href={route("estudiantes.inactivos.graduados.create")}
                    >
                        <Button variant="primary">
                            <Plus size={16} className="mr-2" /> NUEVO REGISTRO
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
                        <div className="bg-slate-900 text-white px-4 py-1 rounded-lg">
                            TOTAL EGRESADOS: {totals.general}
                        </div>
                    </div>
                }
            >
                <div className="h-full bg-white border border-slate-200 rounded-t-[1.5rem] overflow-hidden shadow-2xl">
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse select-text">
                            <thead className="sticky top-0 z-20 bg-purple-700 text-white uppercase text-[10px] font-black tracking-widest italic">
                                <tr>
                                    <th className="px-6 py-3 border-r border-purple-500 text-left">
                                        Ficha del Egresado
                                    </th>
                                    <th className="px-6 py-3 border-r border-purple-500 text-center">
                                        Periodo Escolar
                                    </th>
                                    <th className="px-6 py-3 border-r border-purple-500 text-center">
                                        Apreciación Final
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                {datos.data.map((student) => (
                                    <tr
                                        key={student.periodo_estudiante_id}
                                        className="hover:bg-purple-50/40 transition-colors group"
                                    >
                                        <td className="px-6 py-3 border-r border-slate-50">
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
                                                            className="text-blue-400"
                                                        />{" "}
                                                        <b className="text-[14px] text-gray-800 leading-tight">
                                                            {student.cedula}
                                                        </b>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                                            <Calendar
                                                                size={12}
                                                            />{" "}
                                                            {dayjs(
                                                                student.fecha_de_nacimiento,
                                                            ).format(
                                                                "DD/MM/YYYY",
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-black text-[9px]">
                                                            <Cake size={10} />{" "}
                                                            {student.age} AÑOS
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 border-r border-slate-50 text-center">
                                            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-black border border-indigo-100 shadow-inner uppercase text-[10px]">
                                                <History size={14} />{" "}
                                                {student.periodo_escolar ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 border-r border-slate-50 text-center">
                                            <div className="flex items-center justify-center gap-2 text-slate-700 font-black text-sm">
                                                <Award
                                                    size={16}
                                                    className="text-amber-500"
                                                />
                                                <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                                                    {student.apreciacion ||
                                                        "S/N"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    title="Imprimir Constancias"
                                                    onClick={() =>
                                                        handlePrePrint(student)
                                                    }
                                                    className={`relative p-2.5 rounded-xl border transition-all ${
                                                        getPrintCount(
                                                            student.contador_impresiones,
                                                        ) > 0
                                                            ? "bg-purple-600 text-white border-purple-400"
                                                            : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-900 hover:text-white"
                                                    }`}
                                                >
                                                    <Printer size={16} />
                                                    {getPrintCount(
                                                        student.contador_impresiones,
                                                    ) > 0 && (
                                                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                            {getPrintCount(
                                                                student.contador_impresiones,
                                                            )}
                                                        </span>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEditModal(student)
                                                    }
                                                    title="Editar Egresado"
                                                    className="p-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
                                                >
                                                    <Edit size={16} />
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
                                                No hay alumnos egresados
                                                registrados
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MODAL DE RE-IMPRESIÓN (Amber) --- */}
                {modal.printWarning &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)] border-2 border-amber-100 relative text-center animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ printWarning: false })
                                    }
                                    className="absolute top-6 right-6 text-slate-300 hover:text-amber-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>
                                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-amber-100/50">
                                    <TriangleAlert
                                        size={42}
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-4">
                                    ¿Generar Copia?
                                </h3>
                                <div className="mb-6 p-3 bg-amber-50 rounded-xl">
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-amber-600">
                                            {selectedStudent?.name}{" "}
                                            {selectedStudent?.apellido}
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Cédula:{" "}
                                        <span className="text-slate-700">
                                            {selectedStudent?.cedula}
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Impresiones Previas:{" "}
                                        <span className="text-amber-600 font-black">
                                            {getPrintCount(
                                                selectedStudent?.contador_impresiones,
                                            )}{" "}
                                            veces
                                        </span>
                                    </p>
                                </div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase mb-8 leading-relaxed">
                                    Este expediente ya ha sido generado
                                    anteriormente.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            setModal({ printWarning: false })
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={handleRePrint}
                                    >
                                        <Printer size={14} className="mr-2" />{" "}
                                        Confirmar
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL SELECCIÓN DE DOCUMENTOS (INDIVIDUAL) */}
                {printModal.open &&
                    createPortal(
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-3xl text-center border-2 border-indigo-100 animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Printer size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                    Seleccionar Documentos
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 mb-6">
                                    {printModal.student?.name}{" "}
                                    {printModal.student?.apellido}
                                    <br />
                                    <span className="text-indigo-600">
                                        {printModal.student?.nombre_del_grado} -{" "}
                                        {printModal.student?.seccion}
                                    </span>
                                </p>

                                <div className="text-left space-y-3 mb-8">
                                    {printModal.student?.nombre_del_grado?.includes(
                                        "6to",
                                    ) ? (
                                        // ✅ SOLO documentos para 6to grado
                                        <>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        printModal.selectedDocs
                                                            .certificado
                                                    }
                                                    onChange={(e) =>
                                                        setPrintModal({
                                                            ...printModal,
                                                            selectedDocs: {
                                                                ...printModal.selectedDocs,
                                                                certificado:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Certificado de Educación
                                                    Primaria
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        printModal.selectedDocs
                                                            .buenaConducta
                                                    }
                                                    onChange={(e) =>
                                                        setPrintModal({
                                                            ...printModal,
                                                            selectedDocs: {
                                                                ...printModal.selectedDocs,
                                                                buenaConducta:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Carta de Buena Conducta
                                                </span>
                                            </label>
                                        </>
                                    ) : (
                                        // ✅ SOLO documentos para grados menores
                                        <>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        printModal.selectedDocs
                                                            .constancia
                                                    }
                                                    onChange={(e) =>
                                                        setPrintModal({
                                                            ...printModal,
                                                            selectedDocs: {
                                                                ...printModal.selectedDocs,
                                                                constancia:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Constancia de Prosecución
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        printModal.selectedDocs
                                                            .descriptivo
                                                    }
                                                    onChange={(e) =>
                                                        setPrintModal({
                                                            ...printModal,
                                                            selectedDocs: {
                                                                ...printModal.selectedDocs,
                                                                descriptivo:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Informe Descriptivo
                                                </span>
                                            </label>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3">
                                    <Button
                                        variant="primary"
                                        onClick={() =>
                                            setPrintModal({
                                                ...printModal,
                                                open: false,
                                            })
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={executeSelectedPrints}
                                    >
                                        <Printer size={14} className="mr-2" />
                                        Imprimir Seleccionados
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL EDITAR (Portal Fluorescente) --- */}
                {isEditModalOpen &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        editForm.clearErrors();
                                        editForm.reset();
                                    }}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={28} />
                                </button>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                                            Editar Egresado
                                        </h3>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-2">
                                            Modificación de registro histórico
                                        </p>
                                    </div>
                                </div>
                                <form
                                    onSubmit={handleUpdate}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {/* Nombres */}
                                    <div className="space-y-1.5">
                                        <Field
                                            label="Nombres *"
                                            value={editForm.data.name}
                                            autoFocus
                                            onChange={(e) => {
                                                editForm.setData(
                                                    "name",
                                                    e.target.value,
                                                );
                                                if (editForm.errors.name) {
                                                    editForm.clearErrors(
                                                        "name",
                                                    );
                                                }
                                            }}
                                            error={editForm.errors.name}
                                            
                                        />
                                    </div>

                                    {/* Apellidos */}
                                    <div className="space-y-1.5">
                                        <Field
                                            label="Apellidos *"
                                            value={editForm.data.apellido}
                                            onChange={(e) => {
                                                editForm.setData(
                                                    "apellido",
                                                    e.target.value,
                                                );
                                                if (editForm.errors.apellido) {
                                                    editForm.clearErrors(
                                                        "apellido",
                                                    );
                                                }
                                            }}
                                            error={editForm.errors.apellido}
                                            
                                        />
                                    </div>

                                    {/* Identificación */}
                                    <div className="space-y-1.5">
                                        <Field
                                            label="Identificación"
                                            value={editForm.data.cedula}
                                            onChange={(e) => {
                                                editForm.setData(
                                                    "cedula",
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                );
                                                if (editForm.errors.cedula) {
                                                    editForm.clearErrors(
                                                        "cedula",
                                                    );
                                                }
                                            }}
                                            error={editForm.errors.cedula}
                                        />
                                    </div>

                                    {/* Fecha de Nacimiento */}
                                    <div className="space-y-1.5">
                                        <Field
                                            label="Fecha de Nacimiento"
                                            type="date"
                                            value={
                                                editForm.data
                                                    .fecha_de_nacimiento
                                            }
                                            onChange={(e) => {
                                                editForm.setData(
                                                    "fecha_de_nacimiento",
                                                    e.target.value,
                                                );
                                                if (
                                                    editForm.errors
                                                        .fecha_de_nacimiento
                                                ) {
                                                    editForm.clearErrors(
                                                        "fecha_de_nacimiento",
                                                    );
                                                }
                                            }}
                                            error={
                                                editForm.errors
                                                    .fecha_de_nacimiento
                                            }
                                        />
                                    </div>

                                    {/* Género */}
                                    <div className="space-y-1.5">
                                        <SelectField
                                            label="Género"
                                            value={editForm.data.sexo}
                                            options={[
                                                { v: "M", l: "Masculino" },
                                                { v: "F", l: "Femenino" },
                                            ]}
                                            onChange={(e) => {
                                                editForm.setData(
                                                    "sexo",
                                                    e.target.value,
                                                );
                                                if (editForm.errors.sexo) {
                                                    editForm.clearErrors(
                                                        "sexo",
                                                    );
                                                }
                                            }}
                                            error={editForm.errors.sexo}
                                        />
                                    </div>

                                    {/* Apreciación */}
                                    <div className="space-y-1.5">
                                        <SelectField
                                            label="Literal (Apreciación)"
                                            value={editForm.data.apreciacion}
                                            options={
                                                apreciacionesAprobadas?.map(
                                                    (a) => ({
                                                        v: a.numeral
                                                            ? `${a.literal}-${a.numeral}`
                                                            : a.literal,
                                                        l: a.numeral
                                                            ? `${a.literal}-${a.numeral}`
                                                            : a.literal,
                                                    }),
                                                ) || []
                                            }
                                            onChange={(e) => {
                                                editForm.setData(
                                                    "apreciacion",
                                                    e.target.value,
                                                );
                                                if (
                                                    editForm.errors.apreciacion
                                                ) {
                                                    editForm.clearErrors(
                                                        "apreciacion",
                                                    );
                                                }
                                            }}
                                            error={editForm.errors.apreciacion}
                                        />
                                    </div>

                                    {/* Botón Submit */}
                                    <Button
                                        type="submit"
                                        loading={editForm.processing}
                                        className="col-span-full h-16 bg-indigo-600 rounded-3xl font-black shadow-xl mt-4 uppercase"
                                        disabled={editForm.processing}
                                    >
                                        <Save size={18} className="mr-2" />{" "}
                                        {editForm.processing
                                            ? "Guardando..."
                                            : "Guardar Cambios Históricos"}
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
