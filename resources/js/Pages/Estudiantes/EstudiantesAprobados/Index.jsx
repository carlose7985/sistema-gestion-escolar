import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import MotivoRetiroSelect from "@/Components/Options/MotivoRetiroSelect";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import {
    X,
    ArrowLeftCircle,
    Printer,
    Mars,
    Venus,
    TriangleAlert,
    Edit3,
    ThumbsDown,
    FileSpreadsheet,
    FileText,
    PieChart,
    ChevronDown,
    UserPen,
    IdCard,
    UserX,
    Activity,
    GraduationCapIcon,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function EstudiantesAprobados({
    datos,
    grades,
    totals,
    fechaFormateada,
    periodo_escolar,
    apreciacionesAprobadas,
    apreciacionesReprobadas,
    aggregatedAprobadosData,
    periodosDisponibles,
    filters = {},
    desde_activo = false,
    grado_retorno = null,
}) {
    // --- ESTADOS ---
    console.log("grado_retorno en props:", grado_retorno);
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const isTyping = useRef(false);
    const [isMassLoading, setIsMassLoading] = useState(false);
    const [showPeriodoModal, setShowPeriodoModal] = useState(false);
    const [selectedPeriodoReporte, setSelectedPeriodoReporte] = useState("");
    const [reporteType, setReporteType] = useState("");
    const { flash } = usePage().props;
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [vieneDeActivo, setVieneDeActivo] = useState(desde_activo);
    const [modal, setModal] = useState({
        edit: false,
        fail: false,
        printWarning: false,
        mass: false,
        retire: false, // 🔥 Modal de retiro
        retirePrint: false, // 🔥 Modal de impresión después del retiro
    });

    // --- FORMULARIOS ---
    const formEdit = useForm({
        name: "",
        apellido: "",
        cedula: "",
        apreciacion: "",
    });

    const formRetire = useForm({ status_escolar: "" });

    const formFail = useForm({ apreciacion: "" });

    // 2. Función para limpiar y enfocar
    const clearSearchAndFocus = () => {
        // Limpiar el estado de búsqueda
        setSearchTerm("");
        isTyping.current = false;

        // Hacer la petición al servidor con search vacío
        router.get(
            route("estudiantes.activos.aprobados.index"),
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

    useEffect(() => {
        // Si en el flash viene un responsable
        if (flash?.responsable) {
            setFoundResponsable(flash.responsable);
            setIsRegisteringNewGuardian(false);
            setSearchCedulaResp(flash.responsable.cedula_r);
            toast.success("Responsable creado y listo para vincular");
        }

        // 🔥 LÓGICA PARA RETIRO
        if (flash?.estudiante_retirado) {
            setSelectedStudent(flash.estudiante_retirado);
            setModal((prev) => ({ ...prev, retirePrint: true }));
        }
    }, [flash]);

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

    // Sincronizar input con URL (Solo si el usuario no está escribiendo)
    useEffect(() => {
        if (!isTyping.current) {
            setSearchTerm(filters?.search || "");
        }
    }, [filters?.search]);

    // Función de búsqueda (Debounce)
    const execSearch = useCallback(
        debounce((query, gradeId, periodoId) => {
            router.get(
                route("estudiantes.activos.aprobados.index"),
                {
                    grade: gradeId,
                    search: query,
                    periodo_id: periodoId || "", // 🔥 MANTENER PERÍODO
                    page: 1,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    only: ["datos", "totals"],
                },
            );
        }, 500),
        [],
    );

    const onSearchChange = (val) => {
        setSearchTerm(val);
        if (val === "") {
            isTyping.current = false;
        } else {
            isTyping.current = true;
        }
        execSearch(val, filters?.grade, filters?.periodo_id); // 🔥 PASAR PERÍODO
    };

    const onGradeChange = (gradeId) => {
        isTyping.current = false;
        router.get(
            route("estudiantes.activos.aprobados.index"),
            {
                grade: gradeId,
                search: searchTerm,
                periodo_id: filters?.periodo_id || "", // 🔥 MANTENER EL PERÍODO
                page: 1,
            },
            { preserveScroll: true },
        );
    };

    const onPageChange = (p) => {
        isTyping.current = false;
        router.get(
            route("estudiantes.activos.aprobados.index"),
            {
                ...filters,
                periodo_id: filters?.periodo_id || "", // 🔥 MANTENER PERÍODO
                page: p,
            },
            { preserveScroll: true, preserveState: true },
        );
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

    // --- MANEJADORES DE ACCIONES ---
    const openEditModal = (student) => {
        setSelectedStudent(student);
        formEdit.setData({
            name: student.name,
            apellido: student.apellido,
            cedula: student.cedula || "",
            apreciacion: student.apreciacion || "",
        });
        setModal((prev) => ({ ...prev, edit: true }));
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        formEdit.patch(
            route(
                "estudiantes.activos.aprobados.update",
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

    const openFailModal = (student) => {
        // Validar: Solo permitir promover si período está ABIERTO
        if (periodo_escolar === "Culmidado") {
            Swal.fire({
                icon: "warning",
                title: "Período Escolar Cerrado",
                html: `
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    Solo se puede reprobar estudiantes con el período escolar 
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

        // Validar: Solo permitir promover si no tiene grado asignado
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
                                No se puede reprobar un estudiante que ya tiene grado asignado.
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

        if (student.status_escolar === "Graduado") {
            Swal.fire({
                icon: "info",
                title: "Estudiante Egresado",
                html: `
                        <div class="space-y-3">
                            <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Este estudiante ya fue egresado del período escolar.
                            </p>
                            <p class="text-xs text-slate-500">
                                No se puede reprobar un estudiante que ya fue egresado de la institución.
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
        formFail.reset();
        setModal((prev) => ({ ...prev, fail: true }));
    };

    const handleFailSubmit = (e) => {
        e.preventDefault();

        formFail.put(
            route(
                "estudiantes.activos.aprobados.reprobar",
                selectedStudent.periodo_estudiante_id,
            ),
            {
                onSuccess: () => {
                    setModal((prev) => ({ ...prev, fail: false }));
                    clearSearchAndFocus();
                },
                onError: (errors) => {
                    toast.error("Error al reprobar el estudiante");
                },
            },
        );
    };

    // En la sección de estados, agrega:
    const [printModal, setPrintModal] = useState({
        open: false,
        student: null,
        selectedDocs: {
            constancia: false,
            descriptivo: false,
            buenaConducta: false,
            certificado: false,
        },
    });

    const [massPrintModal, setMassPrintModal] = useState({
        open: false,
        selectedDocs: {
            constancia: false,
            descriptivo: false,
            buenaConducta: false,
            certificado: false,
        },
    });

    // Función que se ejecuta desde el modal de reimpresión
    const handleRePrint = () => {
        // Cerrar el modal de advertencia
        setModal((prev) => ({ ...prev, printWarning: false }));

        // Abrir el modal de selección de documentos con el estudiante seleccionado
        setPrintModal({
            open: true,
            student: selectedStudent,
            selectedDocs: {
                constancia: true,
                descriptivo: true,
                buenaConducta: true,
                certificado: true,
            },
        });
    };

    const getPrintCount = (val) =>
        !val || val === "No" || val === "0"
            ? 0
            : val === "Si"
              ? 1
              : parseInt(val);

    const executeSelectedPrints = () => {
        const student = printModal.student;
        const docs = printModal.selectedDocs;

        if (!student) return;

        console.log("grado_retorno:", grado_retorno);
        console.log("student:", student);

        const url = route("estudiantesCalificadosExport", {
            type: "constancias-prosecucion",
            estudiante_id: student.estudiante_id,
            periodo_id: student.periodo_id,
            grado_id: student.grado_id,
            constancia: docs.constancia ? 1 : 0,
            descriptivo: docs.descriptivo ? 1 : 0,
            buenaConducta: docs.buenaConducta ? 1 : 0,
            certificado: docs.certificado ? 1 : 0,
        });

        window.open(url, "_blank");
        setPrintModal({ ...printModal, open: false });
        if (vieneDeActivo) {
            const gradoParaRetornar =
                grado_retorno || student?.grado_activo || student?.grado_id;

            setTimeout(() => {
                router.visit(
                    route(
                        "estudiantes.activos.listado.show",
                        gradoParaRetornar,
                    ),
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

    const handlePrePrint = (student) => {
        setSelectedStudent(student);
        const count = getPrintCount(student.actualizado);

        if (count > 0) {
            setModal((prev) => ({ ...prev, printWarning: true }));
        } else {
            setPrintModal({
                open: true,
                student: student,
                selectedDocs: {
                    constancia: true,
                    descriptivo: true,
                    buenaConducta: true,
                    certificado: true,
                },
            });
        }
    };

    // Función para Impresión Masiva
    const executeMassPrint = () => {
        const docs = massPrintModal.selectedDocs;

        if (selectedStudents.length === 0) return;

        // Unimos todos los IDs seleccionados en una cadena separada por comas
        const idsString = selectedStudents.join(",");

        // Generamos UNA SOLA URL masiva
        const url = route("estudiantesCalificadosExport", {
            type: "constancias-prosecucion-masiva", // Asegúrate de crear este case en tu switch
            ids: idsString,
            constancia: docs.constancia ? 1 : 0,
            descriptivo: docs.descriptivo ? 1 : 0,
            buenaConducta: docs.buenaConducta ? 1 : 0,
            certificado: docs.certificado ? 1 : 0,
        });

        // ABRIMOS UNA SOLA PESTAÑA con el PDF de todos los alumnos
        window.open(url, "_blank");

        setMassPrintModal({ ...massPrintModal, open: false });
        setSelectedStudents([]);
        // 🔥 Limpiar y enfocar después de imprimir
        setTimeout(() => {
            clearSearchAndFocus();
        }, 500);
    };

    // Mostrar modal para seleccionar período
    const handlePrint = (type) => {
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

    // Función para enfocar el campo de búsqueda (sin limpiar)
    const focusSearchInput = () => {
        clearSearchAndFocus();
        setTimeout(() => {
            const input = document.querySelector(
                'input[id="universal-search"]',
            );
            if (input) {
                input.focus();
            }
        }, 100);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Estudiantes Aprobados" />

            <ViewContainer
                title="ESTUDIANTES APROBADOS"
                subtitle="Gestión de certificados y promoción de grado"
                icon="UserCheck"
                showSearch={true}
                searchValue={searchTerm}
                onSearch={onSearchChange}
                onPageChange={onPageChange}
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
                    <div className="flex items-center gap-2">
                        {/* 1. BOTÓN MATRÍCULA (Dropdown Interno) */}
                        <div className="relative">
                            <Button
                                onClick={() =>
                                    setActiveMenu(
                                        activeMenu === "matricula"
                                            ? null
                                            : "matricula",
                                    )
                                }
                                className="bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase"
                            >
                                <PieChart size={14} className="mr-1" />{" "}
                                MATRÍCULA
                                <ChevronDown
                                    size={12}
                                    className={`ml-2 transition-transform ${
                                        activeMenu === "matricula"
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                />
                            </Button>

                            {activeMenu === "matricula" && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in zoom-in-95">
                                    <div className="bg-indigo-600 p-3 text-white text-[10px] font-black uppercase tracking-widest text-center">
                                        Resumen por Sección
                                    </div>
                                    <AprobadosMiniTable
                                        data={aggregatedAprobadosData}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 2. BOTÓN REPORTES */}
                        <div className="relative">
                            <Button
                                onClick={() =>
                                    setActiveMenu(
                                        activeMenu === "reportes"
                                            ? null
                                            : "reportes",
                                    )
                                }
                                className="bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase"
                            >
                                <FileText size={14} className="mr-1" /> REPORTES{" "}
                                <ChevronDown
                                    size={12}
                                    className={`ml-2 transition-transform ${activeMenu === "reportes" ? "rotate-180" : ""}`}
                                />
                            </Button>
                            {activeMenu === "reportes" && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[100] animate-in zoom-in-95">
                                    <div className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                                        Exportar Documentos
                                    </div>
                                    <button
                                        onClick={() =>
                                            handlePrint("listado-aprobados")
                                        }
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-emerald-50 rounded-xl text-[10px] font-black text-slate-600 uppercase transition-all"
                                    >
                                        <FileSpreadsheet
                                            size={16}
                                            className="text-emerald-500"
                                        />{" "}
                                        Listado General
                                    </button>
                                    <button
                                        onClick={() =>
                                            handlePrint(
                                                "listado-aprobados-con-a",
                                            )
                                        }
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-indigo-50 rounded-xl text-[10px] font-black text-slate-600 uppercase transition-all"
                                    >
                                        <FileText
                                            size={16}
                                            className="text-indigo-500"
                                        />{" "}
                                        Listado con Literal A
                                    </button>
                                    <button
                                        onClick={() =>
                                            handlePrint("estadistica-aprobados")
                                        }
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-purple-50 rounded-xl text-[10px] font-black text-slate-600 uppercase transition-all border-t mt-1"
                                    >
                                        <Activity
                                            size={16}
                                            className="text-purple-500"
                                        />{" "}
                                        Estadística Anual
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                }
                extraFilters={
                    <div className="flex items-center gap-3 ml-auto">
                        {/* Botón de impresión masiva */}
                        {selectedStudents.length > 0 && (
                            <Button
                                onClick={() => {
                                    // 🔥 OBTENER estudiantes seleccionados
                                    const estudiantesSeleccionados =
                                        datos.data.filter((s) =>
                                            selectedStudents.includes(
                                                s.periodo_estudiante_id,
                                            ),
                                        );

                                    // Verificar si hay 6to
                                    const haySexto =
                                        estudiantesSeleccionados.some((s) =>
                                            s.nombre_del_grado?.includes("6to"),
                                        );

                                    setMassPrintModal({
                                        open: true,
                                        esSexto: haySexto,
                                        estudiantes: estudiantesSeleccionados, // 🔥 PASAR ESTUDIANTES
                                        selectedDocs: {
                                            constancia: true,
                                            certificado: true,
                                            buenaConducta: true,
                                            descriptivo: true,
                                        },
                                    });
                                }}
                                className="bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase"
                            >
                                <Printer size={14} className="mr-2" />
                                Imprimir Seleccionados (
                                {selectedStudents.length})
                            </Button>
                        )}
                        {/* Selector de Período */}
                        <div className="w-64">
                            <SelectField
                                value={filters?.periodo_id || ""}
                                onChange={(e) => {
                                    router.get(
                                        route(
                                            "estudiantes.activos.aprobados.index",
                                        ),
                                        {
                                            ...filters,
                                            periodo_id: e.target.value,
                                            page: 1,
                                        },
                                        { preserveScroll: true },
                                    );
                                }}
                                optionSelecName="SELECCIONAR PERÍODO"
                                options={[
                                    { v: "", l: "PERÍODO POR DEFECTO" },
                                    ...periodosDisponibles.map((p) => ({
                                        v: p.id,
                                        l: p.nombre_periodo,
                                    })),
                                ]}
                            />
                        </div>

                        {/* Selector de Grado */}
                        <div className="w-64">
                            <SelectField
                                value={filters?.grade || ""}
                                onChange={(e) => onGradeChange(e.target.value)}
                                optionSelecName="FILTRAR POR GRADO"
                                options={[
                                    { v: "", l: "TODOS LOS GRADOS" },
                                    ...grades.map((g) => ({
                                        v: g.id,
                                        l: `${g.nombre_del_grado} "${g.seccion}" (${g.student_count})`,
                                    })),
                                ]}
                            />
                        </div>
                    </div>
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
                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
                            TOTAL: {totals.general}
                        </div>
                        <Link
                            href={route(
                                "estudiantes.activos.fecha.entrega.documentos.index",
                            )}
                        >
                            <Button className="ml-40">
                                <FileText
                                    size={16}
                                    className="text-indigo-500"
                                />{" "}
                                Actualizar fecha de entrega de documentos{" "}
                                {fechaFormateada}
                            </Button>
                        </Link>
                    </div>
                }
            >
                <div className="h-full bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-2xl">
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse text-[12px] select-text">
                            <thead className="sticky top-0 z-20 bg-slate-900 text-white uppercase text-[10px] font-black italic">
                                <tr>
                                    <th className="px-4 py-5 text-center">
                                        <input
                                            type="checkbox"
                                            disabled={!filters.grade}
                                            title={
                                                !filters.grade
                                                    ? "Seleccione un grado para habilitar selección masiva"
                                                    : "Seleccionar todos"
                                            }
                                            checked={
                                                selectedStudents.length ===
                                                    datos.data.length &&
                                                datos.data.length > 0
                                            }
                                            onChange={() => {
                                                // ✅ SOLO ACTUALIZAR ESTADO LOCAL, SIN RECARGAR
                                                if (
                                                    selectedStudents.length ===
                                                    datos.data.length
                                                ) {
                                                    setSelectedStudents([]);
                                                } else {
                                                    setSelectedStudents(
                                                        datos.data.map(
                                                            (s) =>
                                                                s.periodo_estudiante_id,
                                                        ),
                                                    );
                                                }
                                            }}
                                            className="w-4 h-4 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                    </th>
                                    <th className="px-8 py-5 text-left">
                                        Alumno / Identificación
                                    </th>
                                    <th className="px-8 py-5 text-center">
                                        Grado Origen
                                    </th>
                                    <th className="px-8 py-5 text-center">
                                        Calificación Final
                                    </th>
                                    <th className="px-8 py-5 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {datos.data.map((student) => (
                                    <tr
                                        key={student.periodo_estudiante_id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(
                                                    student.periodo_estudiante_id,
                                                )}
                                                onChange={() => {
                                                    // ✅ SOLO ACTUALIZAR ESTADO LOCAL, SIN RECARGAR
                                                    setSelectedStudents(
                                                        (prev) => {
                                                            if (
                                                                prev.includes(
                                                                    student.periodo_estudiante_id,
                                                                )
                                                            ) {
                                                                return prev.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        student.periodo_estudiante_id,
                                                                );
                                                            } else {
                                                                return [
                                                                    ...prev,
                                                                    student.periodo_estudiante_id,
                                                                ];
                                                            }
                                                        },
                                                    );
                                                    // 🔥 Enfocar búsqueda después de seleccionar/deseleccionar
                                                    focusSearchInput();
                                                }}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-8 py-3 relative">
                                            <button
                                                title="Actualizar Datos"
                                                onClick={() =>
                                                    openEditModal(student)
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-indigo-200 text-indigo-600 rounded-xl group-hover:opacity-100 hover:bg-indigo-600 hover:text-white transition-all shadow-lg flex items-center justify-center"
                                            >
                                                <UserPen size={14} />
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100 uppercase">
                                                    {student.name[0]}
                                                    {student.apellido[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 uppercase">
                                                        {student.name}{" "}
                                                        {student.apellido}
                                                    </span>
                                                    <span className="text-[14px] font-bold text-slate-900 font-mono tracking-wide">
                                                        <IdCard
                                                            size={12}
                                                            color="green"
                                                            className="inline mr-1"
                                                        />{" "}
                                                        {student.cedula}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[12px] font-black text-indigo-700 uppercase italic leading-none">
                                                    {student.nombre_del_grado}{" "}
                                                    {student.seccion}
                                                </span>

                                                <span className="px-4 py-1 rounded-lg font-black text-[10px] border bg-amber-50 text-amber-600 border-amber-100">
                                                    {student.status_escolar}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-[11px] border border-emerald-100 leading-none">
                                                    {student.apreciacion}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    title="Imprimir Constancias (Prosecucion...)"
                                                    onClick={() =>
                                                        handlePrePrint(student)
                                                    }
                                                    className={`relative p-2.5 rounded-xl border transition-all ${getPrintCount(student.actualizado) > 0 ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-900 hover:text-white"}`}
                                                >
                                                    <Printer size={16} />
                                                    {getPrintCount(
                                                        student.actualizado,
                                                    ) > 0 && (
                                                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                            {getPrintCount(
                                                                student.actualizado,
                                                            )}
                                                        </span>
                                                    )}
                                                </button>
                                                <button
                                                    title="Reprobar estudiante"
                                                    onClick={() =>
                                                        openFailModal(student)
                                                    }
                                                    className="p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
                                                >
                                                    <ThumbsDown size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {datos.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest"
                                        >
                                            No se hallaron coincidencias
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

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

                {/* MODAL IMPRESIÓN DE RETIRO (POST-PROCESO) */}
                {modal.retirePrint &&
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
                                    ¿Desea generar la retirePrint ahora?
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
                                                retirePrint: false,
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

                {/* --- MODAL EDITAR (Fluorescente) --- */}
                {modal.edit &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, edit: false })
                                    }
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all"
                                >
                                    <X size={28} />
                                </button>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl">
                                        <Edit3 size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                                        Corregir Datos
                                    </h3>
                                </div>
                                <form
                                    onSubmit={handleEditSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            label="Nombres"
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
                                    </div>
                                    <Field
                                        label="Cédula"
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
                                    <SelectField
                                        label="Apreciación Final"
                                        value={formEdit.data.apreciacion}
                                        options={apreciacionesAprobadas.map(
                                            (a) => ({
                                                v: a.numeral
                                                    ? `${a.literal}-${a.numeral}`
                                                    : a.literal,
                                                l: a.numeral
                                                    ? `${a.literal}-${a.numeral}`
                                                    : a.literal,
                                            }),
                                        )}
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
                                        className="w-full h-16 bg-indigo-600 rounded-[1.5rem] font-black shadow-xl"
                                    >
                                        ACTUALIZAR DATOS
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL ADVERTENCIA RE-IMPRESIÓN (Amber) */}
                {modal.printWarning &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)] border-2 border-amber-100 relative text-center animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-amber-50/50">
                                    <TriangleAlert
                                        size={42}
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-4 leading-none">
                                    ¿Generar Copia?
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mb-8">
                                    El documento de{" "}
                                    <span className="text-slate-900 font-black">
                                        {selectedStudent?.name}
                                    </span>{" "}
                                    ya ha sido generado{" "}
                                    <span className="text-indigo-600 underline underline-offset-4 decoration-2">
                                        {getPrintCount(
                                            selectedStudent?.actualizado,
                                        )}{" "}
                                        veces
                                    </span>
                                    .
                                </p>
                                <Button
                                    onClick={handleRePrint} // ← CAMBIADO A handleRePrint
                                    className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
                                >
                                    SÍ, GENERAR NUEVA COPIA
                                </Button>
                                <button
                                    onClick={() =>
                                        setModal({
                                            ...modal,
                                            printWarning: false,
                                        })
                                    }
                                    className="w-full mt-4 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* --- MODAL REPROBAR (Indigo) --- */}
                {modal.fail &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, fail: false })
                                    }
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                        <GraduationCapIcon size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                        Reprobar Estudiante
                                    </h3>
                                    <p className="text-[10px] font-bold text-green-600 uppercase mt-2">
                                        ✅ Se actualizará el estado a REPROBADO
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
                                    onSubmit={handleFailSubmit}
                                    className="space-y-5"
                                >
                                    <p className="text-[11px] font-bold text-slate-500 uppercase text-center">
                                        Seleccione la nueva apreciación
                                        reprobatoria
                                    </p>
                                    <SelectField
                                        label="Nueva Apreciación (Reprobado)"
                                        value={formFail.data.apreciacion}
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
                                            formFail.setData(
                                                "apreciacion",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {formFail.errors.apreciacion && (
                                        <p className="text-[9px] text-red-500 font-black text-center uppercase">
                                            {formFail.errors.apreciacion}
                                        </p>
                                    )}
                                    <div className="flex gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setModal({
                                                    ...modal,
                                                    fail: false,
                                                })
                                            }
                                            className="flex-1 py-4 text-[10px] font-black bg-red-300 uppercase text-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <Button
                                            type="submit"
                                            loading={formFail.processing}
                                            className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg"
                                        >
                                            <GraduationCapIcon
                                                size={14}
                                                className="mr-2"
                                            />
                                            REPROBAR
                                        </Button>
                                    </div>
                                </form>
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

                {/* MODAL IMPRESIÓN MASIVA */}
                {/* MODAL IMPRESIÓN MASIVA */}
                {massPrintModal.open &&
                    createPortal(
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-3xl text-center border-2 border-emerald-100 animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Printer size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                    Impresión Masiva
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 mb-6">
                                    {selectedStudents.length} estudiantes
                                    seleccionados
                                </p>

                                {/* 🔥 NUEVO: Mostrar los grados de los estudiantes seleccionados */}
                                {massPrintModal.estudiantes &&
                                    massPrintModal.estudiantes.length > 0 && (
                                        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Estudiantes seleccionados:
                                            </p>
                                            <div className="max-h-24 overflow-y-auto custom-scrollbar">
                                                {massPrintModal.estudiantes.map(
                                                    (est, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex justify-between items-center text-[9px] font-bold text-slate-700 py-0.5 border-b border-slate-100 last:border-0"
                                                        >
                                                            <span>
                                                                {est.name}{" "}
                                                                {est.apellido}
                                                            </span>
                                                            <span className="text-indigo-600 text-[8px] uppercase">
                                                                {
                                                                    est.nombre_del_grado
                                                                }{" "}
                                                                {est.seccion}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                <div className="text-left space-y-3 mb-8">
                                    {massPrintModal.esSexto ? (
                                        // ✅ SOLO documentos para 6to grado
                                        <>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        massPrintModal
                                                            .selectedDocs
                                                            .certificado
                                                    }
                                                    onChange={(e) =>
                                                        setMassPrintModal({
                                                            ...massPrintModal,
                                                            selectedDocs: {
                                                                ...massPrintModal.selectedDocs,
                                                                certificado:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Certificado de Educación
                                                    Primaria
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        massPrintModal
                                                            .selectedDocs
                                                            .buenaConducta
                                                    }
                                                    onChange={(e) =>
                                                        setMassPrintModal({
                                                            ...massPrintModal,
                                                            selectedDocs: {
                                                                ...massPrintModal.selectedDocs,
                                                                buenaConducta:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Carta de Buena Conducta
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        massPrintModal
                                                            .selectedDocs
                                                            .descriptivo
                                                    }
                                                    onChange={(e) =>
                                                        setMassPrintModal({
                                                            ...massPrintModal,
                                                            selectedDocs: {
                                                                ...massPrintModal.selectedDocs,
                                                                descriptivo:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Informe Descriptivo
                                                </span>
                                            </label>
                                        </>
                                    ) : (
                                        // ✅ SOLO documentos para grados menores
                                        <>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        massPrintModal
                                                            .selectedDocs
                                                            .constancia
                                                    }
                                                    onChange={(e) =>
                                                        setMassPrintModal({
                                                            ...massPrintModal,
                                                            selectedDocs: {
                                                                ...massPrintModal.selectedDocs,
                                                                constancia:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Constancia de Prosecución
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        massPrintModal
                                                            .selectedDocs
                                                            .descriptivo
                                                    }
                                                    onChange={(e) =>
                                                        setMassPrintModal({
                                                            ...massPrintModal,
                                                            selectedDocs: {
                                                                ...massPrintModal.selectedDocs,
                                                                descriptivo:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        })
                                                    }
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="font-black text-[11px] text-slate-700 uppercase">
                                                    Informe Descriptivo
                                                </span>
                                            </label>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            setMassPrintModal({
                                                ...massPrintModal,
                                                open: false,
                                            })
                                        }
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]"
                                    >
                                        Cancelar
                                    </button>
                                    <Button
                                        onClick={executeMassPrint}
                                        className="flex-1 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg"
                                    >
                                        <Printer size={14} className="mr-2" />
                                        Imprimir Todos
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

                                <div className="flex justify-center gap-3 mt-8">
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            setShowPeriodoModal(false)
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={executePrintGeneral}
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

const AprobadosMiniTable = ({ data }) => {
    // Calcular totales directamente
    const hombres =
        data?.reduce(
            (acc, item) => acc + (item.m || item.hombresAprobados || 0),
            0,
        ) || 0;
    const mujeres =
        data?.reduce(
            (acc, item) => acc + (item.f || item.mujeresAprobadas || 0),
            0,
        ) || 0;
    const total =
        data?.reduce(
            (acc, item) => acc + (item.total || item.totalAprobados || 0),
            0,
        ) || 0;

    return (
        <div className="max-h-[350px] overflow-auto custom-scrollbar p-2">
            <table className="w-full border-separate border-spacing-y-1 text-[10px]">
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <tr
                                key={index}
                                className="bg-slate-50 rounded-xl overflow-hidden hover:bg-indigo-50 transition-colors"
                            >
                                <td className="px-4 py-2 font-black uppercase text-slate-700">
                                    {item.grado} "{item.seccion}"
                                </td>
                                <td className="px-2 py-2 text-center text-blue-600 font-black">
                                    {item.m || item.hombresAprobados || 0}
                                </td>
                                <td className="px-2 py-2 text-center text-pink-600 font-black">
                                    {item.f || item.mujeresAprobadas || 0}
                                </td>
                                <td className="px-4 py-2 text-right font-black text-slate-900 bg-indigo-100/50">
                                    {item.total || item.totalAprobados || 0}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="4"
                                className="text-center py-4 text-slate-400 uppercase font-bold"
                            >
                                No hay datos disponibles
                            </td>
                        </tr>
                    )}
                </tbody>
                {/* 🔥 FOOTER CON TOTALES */}
                {data && data.length > 0 && (
                    <tfoot>
                        <tr className="bg-slate-800 text-white rounded-xl overflow-hidden">
                            <td className="px-4 py-2 font-black uppercase text-[11px] rounded-l-xl">
                                TOTALES
                            </td>
                            <td className="px-2 py-2 text-center font-black text-[11px] text-blue-300">
                                {hombres}
                            </td>
                            <td className="px-2 py-2 text-center font-black text-[11px] text-pink-300">
                                {mujeres}
                            </td>
                            <td className="px-4 py-2 text-right font-black text-[11px] text-emerald-300 bg-slate-700/50 rounded-r-xl">
                                {total}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
};
