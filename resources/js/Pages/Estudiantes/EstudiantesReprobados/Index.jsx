import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import MotivoRetiroSelect from "@/Components/Options/MotivoRetiroSelect";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import dayjs from "dayjs";
import {
    IdCard,
    Calendar,
    Printer,
    UserX,
    GraduationCap,
    FileSpreadsheet,
    PieChart,
    X,
    AlertTriangle,
    UserPen,
    Mars,
    Venus,
    ArrowLeftCircle,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function EstudiantesReprobados({
    datos,
    filters,
    totalestudiantes,
    todosEstudiantesReprobados,
    apreciacionesReprobadas,
    apreciacionesAprobadas,
    periodo_escolar,
    periodosDisponibles,
    desde_activo = false,
    grado_retorno = null,
}) {
    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const isTyping = useRef(false);
    const nameInputRef = useRef(null);
    const { flash } = usePage().props;
    const [vieneDeActivo, setVieneDeActivo] = useState(desde_activo);
    // Estado para el modal de selección de período en reportes
    const [showPeriodoModal, setShowPeriodoModal] = useState(false);
    const [selectedPeriodoReporte, setSelectedPeriodoReporte] = useState("");
    const [reporteType, setReporteType] = useState("");
    const [modal, setModal] = useState({
        edit: false,
        assign: false,
        retire: false,
        print: false,
        constancia: false,
        promote: false,
    });

    // --- FORMULARIOS ---
    const formEdit = useForm({
        name: "",
        apellido: "",
        cedula: "",
        fecha_de_nacimiento: "",
        sexo: "",
        apreciacion: "",
    });

    const formRetire = useForm({
        status_escolar: "",
    });

    const formPromote = useForm({
        apreciacion: "",
    });

    // 2. Función para limpiar y enfocar
    const clearSearchAndFocus = () => {
        // Limpiar el estado de búsqueda
        setSearchTerm("");
        isTyping.current = false;

        // Hacer la petición al servidor con search vacío
        router.get(
            route("estudiantes.activos.reprobados.index"),
            {
                grade: filters?.grade,
                search: "",
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onFinish: () => {
                    // Buscar el input y enfocarlo
                    setTimeout(() => {
                        const input = document.querySelector(
                            'input[id="universal-search"]',
                        );
                        if (input) {
                            input.focus();
                            input.value = ""; // Asegurar que esté vacío
                        }
                    }, 150);
                },
            },
        );
    };

    // 3. También puedes usar un useEffect para observar cambios en searchTerm
    useEffect(() => {
        if (searchTerm === "" && !isTyping.current) {
            // Si searchTerm está vacío y no está escribiendo, enfocar
            const input = document.querySelector(
                'input[id="universal-search"]',
            );
            if (input && document.activeElement !== input) {
                input.focus();
            }
        }
    }, [searchTerm]);

    // --- BÚSQUEDA ---
    const handleSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.activos.reprobados.index"),
                { search: query },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    only: ["datos", "totalestudiantes"],
                },
            );
        }, 500),
        [],
    );

    useEffect(() => {
        if (flash?.estudiante_retirado) {
            setSelectedStudent(flash.estudiante_retirado);
            setModal((prev) => ({ ...prev, constancia: true }));
        }
    }, [flash]);

    useEffect(() => {
        if (!isTyping.current) setSearchTerm(filters?.search || "");
    }, [filters.search]);

    const onSearchChange = (val) => {
        isTyping.current = true;
        setSearchTerm(val);
        handleSearch(val);
        if (val === "") isTyping.current = false;
    };

    // --- HANDLERS CON VALIDACIONES ---
    const openEditModal = (student) => {
        setSelectedStudent(student);
        formEdit.setData({
            name: student.name,
            apellido: student.apellido,
            cedula: student.cedula,
            fecha_de_nacimiento: student.fecha_de_nacimiento || "",
            sexo: student.sexo || "",
            apreciacion: student.apreciacion || "",
        });
        setModal((prev) => ({ ...prev, edit: true }));
        setTimeout(() => {
            if (nameInputRef.current) {
                nameInputRef.current.focus();
            }
        }, 100);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        formEdit.put(
            route(
                "estudiantes.activos.reprobados.update",
                selectedStudent.periodo_estudiante_id,
            ),
            {
                onSuccess: () => {
                    setModal((prev) => ({ ...prev, edit: false }));
                    clearSearchAndFocus();
                },
                onError: (errors) => {
                    toast.error("Error al actualizar los datos");
                },
            },
        );
    };

    const submitRetire = (e) => {
        e.preventDefault();

        // 🚀 3. Petición HTTP si pasó todas las validaciones
        formRetire.delete(
            route(
                "estudiantes.activos.reprobados.destroy",
                selectedStudent.periodo_estudiante_id,
            ),
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const estudianteData =
                        page.props?.flash?.estudiante_retirado;
                    if (estudianteData) {
                        setSelectedStudent(estudianteData);
                    }
                    setModal((prev) => ({
                        ...prev,
                        retire: false,
                        constancia: true,
                    }));
                    clearSearchAndFocus();
                },
                onError: (errors) => {
                    const errorMsg =
                        errors?.response?.data?.error ||
                        "Error al retirar el estudiante";
                    toast.error(errorMsg);
                },
            },
        );
    };

    const handleOpenPromote = (student) => {
        // Validar: Solo permitir promover si período está ABIERTO
        if (periodo_escolar === "Culminado") {
            Swal.fire({
                icon: "warning",
                title: "Período Escolar Cerrado",
                html: `
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Solo se puede promover estudiantes con el período escolar 
                                <span class="font-bold text-amber-600 dark:text-amber-400">Activo</span>
                            </p>
                            <p class="text-xs text-slate-500">
                                Actualmente el período está <span class="font-bold text-red-500">CERRADO</span>
                            </p>
                        </div>
                    </div>
                `,
                confirmButtonColor: "#f59e0b",
                confirmButtonText: "Entendido",
                background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)",
                backdrop: "rgba(0,0,0,0.8)",
                customClass: {
                    popup: "border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] rounded-2xl",
                    confirmButton:
                        "px-6 py-2.5 text-sm font-bold tracking-widest uppercase rounded-xl",
                },
            });
            return;
        }

        // Validar que no tenga grado asignado
        if (student.status_escolar === "Grado Asignado") {
            Swal.fire({
                icon: "info",
                title: "Grado ya Asignado",
                html: `
                    <div class="space-y-3">
                        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Este estudiante ya tiene un grado asignado en el período actual.
                        </p>
                        <p class="text-xs text-slate-500">
                            No se puede promover un estudiante que ya tiene grado asignado.
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
        formPromote.reset();
        setModal((prev) => ({ ...prev, promote: true }));
    };

    const submitPromote = (e) => {
        e.preventDefault();
        if (
            selectedStudent?.status_escolar === "Grado Asignado" ||
            formPromote.data.status_escolar === "Grado Asignado"
        ) {
            toast.error(
                "Este estudiante ya tiene un grado asignado. No se puede reprobar.",
            );
            setModal((prev) => ({ ...prev, fail: false }));
            return;
        }
        formPromote.post(
            route(
                "estudiantes.activos.reprobados.promover",
                selectedStudent.periodo_estudiante_id,
            ),
            {
                onSuccess: () => {
                    setModal((prev) => ({ ...prev, promote: false }));
                    clearSearchAndFocus();
                },
                onError: (errors) => {
                    toast.error("Error al promover el estudiante");
                },
            },
        );
    };

    const handlePrePrint = (student) => {
        setSelectedStudent(student);
        const count = parseInt(student.actualizado) || 0;

        if (count > 0) {
            setModal((prev) => ({ ...prev, print: true }));
        } else {
            executePrint(student);
        }
    };

   const executePrint = (student) => {
       const url = route("estudiantesCalificadosExport", {
           type: "constancia-de-no-promovido",
           estudiante_id: student.estudiante_id,
           periodo_id: student.periodo_id,
           grado_id: student.grado_id,
       });

       window.open(url, "_blank");
       setModal((prev) => ({ ...prev, print: false }));

       // 🔥 Si viene de Activo, redirigir con el grado correcto
       if (vieneDeActivo) {
           const gradoRetorno =
               grado_retorno || student?.grado_activo || student?.grado_id;
           setTimeout(() => {
               router.visit(
                   route("estudiantes.activos.listado.show", gradoRetorno),
                   {
                       data: {
                           search: student.cedula,
                       },
                   },
               );
           }, 1000);
       } else {
           setTimeout(() => {
               clearSearchAndFocus();
           }, 500);
       }
   };

    const handlePrintGeneral = (type) => {
        // Mostrar modal para seleccionar período
        setReporteType(type);
        setSelectedPeriodoReporte("");
        setShowPeriodoModal(true);
    };

    const executePrintGeneral = () => {
        if (!selectedPeriodoReporte) {
            toast.error("Debe seleccionar un período escolar");
            return;
        }

        window.open(
            route("estudiantesCalificadosExport", {
                type: reporteType,
                periodo_id: selectedPeriodoReporte,
            }),
            "_blank",
        );
        setShowPeriodoModal(false);
        setActiveMenu(null);
        // 🔥 Limpiar y enfocar después de generar el reporte
        setTimeout(() => {
            clearSearchAndFocus();
        }, 500);
    };

    const handlePrintRetiro = () => {
        if (!selectedStudent) {
            return toast.error("Error: No se cargaron datos del estudiante");
        }

        // 🔥 Usar los campos correctos
        const url = route("estudiantesCalificadosExport", {
            type: "constancia-de-retiro",
            estudiante_id: selectedStudent.estudiante_id,
            periodo_id: selectedStudent.periodo_id,
            grado_id: selectedStudent.grado_id,
        });

        window.open(url, "_blank");
        setModal((prev) => ({ ...prev, constancia: false }));
        router.reload({ only: ["datos", "totalestudiantes"] });
    };

    const handlePageChange = (page) => {
        router.get(
            route("estudiantes.activos.reprobados.index"),
            { ...filters, search: searchTerm, page },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["datos", "totalestudiantes"],
            },
        );
    };
    const initials = (n, a) => `${n?.charAt(0)}${a?.charAt(0)}`.toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title="Estudiantes Reprobados" />

            <ViewContainer
                title="ESTUDIANTES REPROBADOS"
                subtitle="Gestión de alumnos con literales no aprobatorios"
                icon="UserX"
                showSearch={true}
                searchValue={searchTerm}
                onSearch={onSearchChange}
                onPageChange={handlePageChange}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                returns={
                    <Link href={route("estudiantes.activos.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-1" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    <div className="flex items-center gap-3 ml-auto">
                        <div className="relative">
                            <Button
                                onClick={() =>
                                    setActiveMenu(
                                        activeMenu === "mat" ? null : "mat",
                                    )
                                }
                                className="bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase"
                            >
                                <PieChart size={14} className="mr-1" />{" "}
                                Matrícula reprobada
                            </Button>
                            {activeMenu === "mat" &&
                                createPortal(
                                    <div className="fixed top-32 right-10 z-[100] w-80 bg-white border border-slate-200 rounded-2xl shadow-3xl animate-in zoom-in-95 overflow-hidden">
                                        <MatriculaReprobadosTable
                                            data={todosEstudiantesReprobados}
                                            totals={totalestudiantes}
                                        />
                                    </div>,
                                    document.body,
                                )}
                        </div>
                        <div className="relative">
                            <Button
                                onClick={() =>
                                    setActiveMenu(
                                        activeMenu === "rep" ? null : "rep",
                                    )
                                }
                                className="bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase"
                            >
                                <FileSpreadsheet size={14} className="mr-1" />{" "}
                                Reportes
                            </Button>
                            {activeMenu === "rep" && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[100] animate-in zoom-in-95">
                                    <button
                                        onClick={() =>
                                            handlePrintGeneral(
                                                "listado-reprobados",
                                            )
                                        }
                                        className="w-full flex items-center gap-3 p-2.5 text-gray-600 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                        <FileSpreadsheet
                                            size={16}
                                            className="text-emerald-500"
                                        />{" "}
                                        Listado General
                                    </button>
                                    <button
                                        onClick={() =>
                                            handlePrintGeneral(
                                                "estadistica-reprobados",
                                            )
                                        }
                                        className="w-full flex items-center gap-3 p-2.5 text-gray-600 hover:bg-blue-50 rounded-xl text-[10px] font-black uppercase transition-all mt-1"
                                    >
                                        <PieChart
                                            size={16}
                                            className="text-blue-500"
                                        />{" "}
                                        Estadística
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                }
                footerStats={
                    <div className="flex items-center gap-6 text-slate-500 font-black text-[10px] uppercase">
                        <div className="flex items-center gap-2">
                            <Mars size={14} className="text-blue-500" />{" "}
                            Masculino: {totalestudiantes.masculino}
                        </div>
                        <div className="flex items-center gap-2">
                            <Venus size={14} className="text-pink-500" />{" "}
                            Femenino: {totalestudiantes.femenino}
                        </div>
                        <div className="bg-slate-900 text-white px-3 py-1 rounded-lg">
                            Total: {totalestudiantes.general}
                        </div>
                    </div>
                }
            >
                <div className="h-full bg-white border border-slate-200 rounded-t-[1.5rem] overflow-hidden shadow-2xl">
                    <table className="w-full border-collapse select-text">
                        <thead className="sticky top-0 z-20 bg-blue-600 text-white uppercase text-[10px] font-black italic">
                            <tr>
                                <th className="px-8 py-5 text-left border-r border-blue-500">
                                    Datos del Estudiante
                                </th>
                                <th className="px-8 py-5 text-center border-r border-blue-500">
                                    Grado / Apreciación
                                </th>
                                <th className="px-8 py-5 text-center border-r border-blue-500">
                                    Status
                                </th>
                                <th className="px-8 py-5 text-center border-r border-blue-500">
                                    Periodo Escolar
                                </th>
                                <th className="px-8 py-5 text-center">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 text-[11px]">
                            {datos.data.map((student) => (
                                <tr
                                    key={student.periodo_estudiante_id}
                                    className="group hover:bg-blue-50/40 transition-colors"
                                >
                                    <td className="px-8 py-4 relative border-r border-slate-50">
                                        <button
                                            title="Actualizar datos Estudiante"
                                            onClick={() =>
                                                openEditModal(student)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-slate-400 text-blue-600 rounded-xl group-hover:opacity-100 hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center justify-center"
                                        >
                                            <UserPen size={16} />
                                        </button>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xs border border-slate-200 uppercase">
                                                {initials(
                                                    student.name,
                                                    student.apellido,
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 uppercase text-[13px]">
                                                    {student.name}{" "}
                                                    {student.apellido}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[14px] font-bold text-slate-900 font-mono tracking-wide">
                                                        <IdCard
                                                            size={12}
                                                            color="green"
                                                            className="inline mr-1"
                                                        />{" "}
                                                        {student.cedula}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-700 tracking-tight">
                                                        <Calendar
                                                            size={12}
                                                            color="blue"
                                                            className="inline mr-1"
                                                        />{" "}
                                                        {dayjs(
                                                            student.fecha_de_nacimiento,
                                                        ).format("DD/MM/YYYY")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center border-r border-slate-50">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-[9px] font-black text-blue-600 uppercase italic leading-none mb-1">
                                                {student.nombre_del_grado} -{" "}
                                                {student.seccion}
                                            </span>
                                            <span className="px-4 py-1 rounded-lg bg-rose-50 text-rose-600 font-black text-[12px] border border-rose-100">
                                                {student.apreciacion}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center border-r border-slate-50">
                                        <div className="inline-flex flex-col items-center">
                                            <span
                                                className={`px-4 py-1 rounded-lg font-black text-[12px] border ${
                                                    student.status_escolar ===
                                                    "Grado Asignado"
                                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                                        : student.status_escolar ===
                                                            "Retirado del Sistema"
                                                          ? "bg-red-50 text-red-600 border-red-100"
                                                          : "bg-rose-50 text-rose-600 border-rose-100"
                                                }`}
                                            >
                                                {student.status}
                                            </span>
                                            {student.status_escolar ===
                                                "Grado Asignado" && (
                                                <span className="text-[8px] font-bold text-amber-600 mt-1">
                                                    ⚠️ Grado Asignado
                                                </span>
                                            )}
                                            {student.status_escolar ===
                                                "Retirado del Sistema" && (
                                                <span className="text-[8px] font-bold text-red-600 mt-1">
                                                    ⚠️ Retirado
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center border-r border-slate-50">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-black text-[10px] border border-slate-200">
                                                {student.nombre_periodo}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                title="Imprimir Constancia Reprobado"
                                                onClick={() =>
                                                    handlePrePrint(student)
                                                }
                                                className={`relative p-3 rounded-2xl border transition-all ${
                                                    Number(
                                                        student.actualizado,
                                                    ) > 0
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-100 text-slate-400 hover:bg-slate-800 hover:text-white"
                                                }`}
                                            >
                                                <Printer size={16} />
                                                {Number(student.actualizado) >
                                                    0 && (
                                                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                        {student.actualizado}
                                                    </span>
                                                )}
                                            </button>

                                            <button
                                                title="Promover Estudiante"
                                                onClick={() =>
                                                    handleOpenPromote(student)
                                                }
                                                className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                            >
                                                <GraduationCap size={16} />
                                            </button>
                                            {/* <button
                                                title="Retirar Estudiante"
                                                onClick={() =>
                                                    handleOpenRetire(student)
                                                }
                                                className="p-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                                            >
                                                <UserX size={16} />
                                            </button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MODAL EDITAR */}
                {modal.edit &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)] border-2 border-blue-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, edit: false })
                                    }
                                    className="absolute top-6 right-6 text-slate-300 hover:text-blue-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={28} />
                                </button>
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner ring-4 ring-blue-100/50">
                                        <UserPen size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                                        Editar Ficha
                                    </h3>
                                </div>
                                <div className="mb-6 p-3 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-blue-600">
                                            {selectedStudent?.name}{" "}
                                            {selectedStudent?.apellido}
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase">
                                        Cédula:{" "}
                                        <span className="text-slate-700">
                                            {selectedStudent?.cedula}
                                        </span>
                                    </p>
                                </div>
                                <form
                                    onSubmit={submitEdit}
                                    className="grid grid-cols-2 gap-5"
                                >
                                    <Field
                                        label="Nombres"
                                        value={formEdit.data.name}
                                        inputRef={nameInputRef}
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
                                        label="Apellidos"
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
                                        label="Fecha Nac."
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
                                    <div className="col-span-2 grid grid-cols-2 gap-4">
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
                                            label="Apreciación"
                                            value={formEdit.data.apreciacion}
                                            options={
                                                apreciacionesReprobadas?.map(
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
                                            onChange={(e) =>
                                                formEdit.setData(
                                                    "apreciacion",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="col-span-2 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-100"
                                        loading={formEdit.processing}
                                    >
                                        {formEdit.processing
                                            ? "ACTUALIZANDO..."
                                            : "ACTUALIZAR DATOS"}
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL PROMOVER (Indigo) --- */}
                {modal.promote &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, promote: false })
                                    }
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <GraduationCap size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                        Promover Estudiante
                                    </h3>
                                    <p className="text-[10px] font-bold text-green-600 uppercase mt-2">
                                        ✅ Se actualizará el estado a APROBADO
                                    </p>
                                </div>
                                <div className="mb-4 p-3 bg-indigo-50 rounded-xl">
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-indigo-600">
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
                                        Grado Actual:{" "}
                                        <span className="text-amber-600">
                                            {selectedStudent?.nombre_del_grado}{" "}
                                            - {selectedStudent?.seccion}
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Apreciación Actual:{" "}
                                        <span className="text-rose-600">
                                            {selectedStudent?.apreciacion}
                                        </span>
                                    </p>
                                </div>
                                <form
                                    onSubmit={submitPromote}
                                    className="space-y-5"
                                >
                                    <p className="text-[11px] font-bold text-slate-500 uppercase text-center">
                                        Seleccione la nueva apreciación
                                        aprobatoria
                                    </p>
                                    <SelectField
                                        label="Nueva Apreciación (Aprobado)"
                                        value={formPromote.data.apreciacion}
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
                                        onChange={(e) =>
                                            formPromote.setData(
                                                "apreciacion",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {formPromote.errors.apreciacion && (
                                        <p className="text-[9px] text-red-500 font-black text-center uppercase">
                                            {formPromote.errors.apreciacion}
                                        </p>
                                    )}
                                    <div className="flex justify-center gap-3 mt-8">
                                        <Button
                                            variant="success"
                                            size="lg"
                                            type="submit"
                                            loading={formPromote.processing}
                                        >
                                            <GraduationCap
                                                size={14}
                                                className="mr-2"
                                            />
                                            PROMOVER
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL RETIRAR (Rose) --- */}
                {modal.retire &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 shadow-[0_0_50px_-12px_rgba(244,63,94,0.5)] border-2 border-rose-100 relative text-center animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, retire: false })
                                    }
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"
                                >
                                    <X size={24} />
                                </button>
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <UserX size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">
                                    Retirar Estudiante
                                </h3>
                                <div className="mb-4 p-3 bg-rose-50 rounded-xl">
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-rose-600">
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
                                </div>
                                <form
                                    onSubmit={submitRetire}
                                    className="space-y-6 text-left"
                                >
                                    <MotivoRetiroSelect
                                        value={
                                            formRetire.data.status_escolar || ""
                                        } // ← Asegurar que sea string
                                        onChange={(e) =>
                                            formRetire.setData(
                                                "status_escolar",
                                                e.target.value,
                                            )
                                        }
                                        error={formRetire.errors.status_escolar}
                                    />

                                    <Button
                                        type="submit"
                                        loading={formRetire.processing}
                                        className="w-full h-16 bg-rose-600 text-white rounded-2xl font-black shadow-lg"
                                    >
                                        CONFIRMAR RETIRO
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL RE-IMPRESIÓN (Amber) --- */}
                {modal.print &&
                    createPortal(
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-3xl text-center border-2 border-amber-100 animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-amber-50/50">
                                    <AlertTriangle size={42} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                    ¿Re-Imprimir?
                                </h3>
                                <div className="mb-4 p-3 bg-rose-50 rounded-xl">
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-rose-600">
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
                                </div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase mt-4 mb-8 leading-relaxed">
                                    Este expediente ya ha sido generado
                                    anteriormente.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <Button
                                        variant="warning"
                                        onClick={() =>
                                            setModal({ ...modal, print: false })
                                        }
                                    >
                                        Cerrar
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() =>
                                            executePrint(selectedStudent)
                                        }
                                    >
                                        Confirmar
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL ÉXITO RETIRO (Emerald) --- */}
                {modal.constancia &&
                    createPortal(
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-3xl text-center border-2 border-emerald-100 animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <X size={42} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic leading-tight">
                                    Retiro Exitoso
                                </h3>
                                <div className="my-4 p-3 bg-slate-50 rounded-xl text-left">
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-emerald-600">
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
                                        Período:{" "}
                                        <span className="text-slate-700">
                                            {selectedStudent?.periodo_escolar}
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Motivo:{" "}
                                        <span className="text-slate-700">
                                            {selectedStudent?.status_escolar}
                                        </span>
                                    </p>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 mb-6">
                                    ¿Desea generar la constancia ahora?
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="success"
                                        onClick={handlePrintRetiro}
                                    >
                                        <Printer size={16} className="mr-2" />{" "}
                                        Imprimir Retiro
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            setModal({
                                                ...modal,
                                                constancia: false,
                                            })
                                        }
                                    >
                                        Cerrar Ventana
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL SELECCIONAR PERÍODO PARA REPORTES */}
                {showPeriodoModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-3xl text-center border-2 border-indigo-100 animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <FileSpreadsheet size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                    Seleccionar Período
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 uppercase mt-2 mb-6">
                                    Elija el período escolar para el reporte
                                </p>

                                <div className="text-left">
                                    <SelectField
                                        label="Período Escolar"
                                        value={selectedPeriodoReporte}
                                        options={periodosDisponibles.map(
                                            (p) => ({
                                                v: p.id,
                                                l: p.nombre_periodo,
                                            }),
                                        )}
                                        onChange={(e) =>
                                            setSelectedPeriodoReporte(
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() =>
                                            setShowPeriodoModal(false)
                                        }
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]"
                                    >
                                        Cancelar
                                    </button>
                                    <Button
                                        onClick={executePrintGeneral}
                                        className="flex-1 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg"
                                    >
                                        <Printer size={14} className="mr-2" />
                                        Generar Reporte
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

// --- COMPONENTE MATRÍCULA ---
const MatriculaReprobadosTable = ({ data, totals }) => (
    <div className="max-h-[400px] overflow-auto custom-scrollbar p-2">
        <table className="w-full border-separate border-spacing-y-1">
            <thead className="bg-slate-50">
                <tr className="text-[8px] font-black uppercase text-slate-400">
                    <th className="px-4 py-2 text-left">Grado / Secc</th>
                    <th className="px-2 py-2 text-center text-blue-600">M</th>
                    <th className="px-2 py-2 text-center text-pink-600">F</th>
                    <th className="px-4 py-2 text-right">Total</th>
                </tr>
            </thead>
            <tbody className="text-[10px]">
                {data.map((g, idx) => (
                    <tr
                        key={idx}
                        className="bg-slate-50 rounded-xl overflow-hidden hover:bg-indigo-50 transition-colors"
                    >
                        <td className="px-4 py-2 font-black uppercase text-slate-700">
                            {g.nombre_del_grado} - {g.seccion}
                        </td>
                        <td className="px-2 py-2 text-center text-blue-600 font-black">
                            {g.m}
                        </td>
                        <td className="px-2 py-2 text-center text-pink-600 font-black">
                            {g.f}
                        </td>
                        <td className="px-4 py-2 text-right font-black text-slate-900 bg-indigo-100/50">
                            {g.total}
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black text-[11px]">
                <tr className="rounded-xl overflow-hidden">
                    <td className="px-4 py-2 rounded-l-xl">TOTALES</td>
                    <td className="text-center text-blue-400">
                        {totals.masculino}
                    </td>
                    <td className="text-center text-pink-400">
                        {totals.femenino}
                    </td>
                    <td className="text-right px-4 text-emerald-400 rounded-r-xl">
                        {totals.general}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
);
