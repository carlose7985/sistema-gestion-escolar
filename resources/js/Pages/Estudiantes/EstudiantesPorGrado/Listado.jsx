import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import axios from "axios";
import {
    Search,
    ArrowLeftCircle,
    ChevronLeft,
    ChevronRight,
    Printer,
    Trash2,
    GraduationCap,
    ArrowRightLeft,
    X,
    Edit,
    Loader2,
    AlertTriangle,
    Phone,
    IdCard,
    CheckCircle2,
    UserRoundCog,
    Info,
    Pen,
    FileCheck,
    ScrollText,
    Award,
    Briefcase,
    MapPin,
    IdCardLanyard,
    Cake,
    Calendar,
    Plus,
    User,
    PenLineIcon,
} from "lucide-react";
import { toast } from "sonner";
import MotivoRetiroSelect from "@/Components/Options/MotivoRetiroSelect";
import Swal from "sweetalert2";

dayjs.locale("es");

export default function ListadoPorGrado({
    datos,
    currentGrade,
    totals,
    filters,
    grades,
    previousGradeId,
    nextGradeId,
    apreciaciones,
    periodo_escolar, // Alias para compatibilidad con la vista
}) {
    const { props: pageProps } = usePage();
    const { flash } = usePage().props;
    // --- ESTADOS DE UI ---
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showGraduateButton, setShowGraduateButton] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const searchTimer = useRef(null);

    // --- ESTADOS MODALES ---
    const [modal, setModal] = useState({
        retire: false,
        retirePrint: false,
        changeGrade: false,
        graduate: false,
        guardian: false,
        individualPrint: false,
    });

    // --- ESTADOS GESTOR DE RESPONSABLES ---
    const [isRegisteringNewGuardian, setIsRegisteringNewGuardian] =
        useState(false);
    const [searchCedulaResp, setSearchCedulaResp] = useState("");
    const [foundResponsable, setFoundResponsable] = useState(null);
    const [isSearchingResp, setIsSearchingResp] = useState(false);
    const [targetField, setTargetField] = useState("representante");
    const [parentesco, setParentesco] = useState("");
    const [isLinking, setIsLinking] = useState(false);

    // --- FORMULARIOS INERTIA ---
    const formRetire = useForm({ status_escolar: "" });
    const formChangeGrade = useForm({ student_id: null, new_grade_id: "" });
    const formGuardian = useForm({
        documento_r: "V",
        cedula_r: "",
        name_r: "",
        sexo_r: "",
        fecha_de_nacimiento_r: "",
        telefono_r: "",
        ocupacion_r: "",
        direccion_r: "",
    });

    const formGraduate = useForm({
        student_id: null,
        current_grade_id: null,
        apreciacion: "",
    });

    // 2. Función para limpiar y enfocar

    const clearSearchAndFocus = () => {
        // 1. Limpiar el estado local del input
        setLocalSearch("");
        if (searchTimer.current) clearTimeout(searchTimer.current);

        // 2. Recargar la página sin filtros de búsqueda
        router.get(
            route("estudiantes.activos.listado.show", currentGrade.id),
            { search: "", page: 1 },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onFinish: () => {
                    // 3. Devolver el foco al input después de que Inertia procese
                    setTimeout(() => {
                        const input =
                            document.getElementById("universal-search") ||
                            document.querySelector(
                                'input[placeholder*="Buscar..."]',
                            );
                        if (input) {
                            input.focus();
                        }
                    }, 200);
                },
            },
        );
    };

    useEffect(() => {
        // Si en el flash viene un responsable (el que acabamos de crear en el backend)
        if (flash?.responsable) {
            setFoundResponsable(flash.responsable);
            setIsRegisteringNewGuardian(false);
            setSearchCedulaResp(flash.responsable.cedula_r);
            toast.success("Responsable creado y listo para vincular");
        }

        // --- LÓGICA PARA RETIRO ---
        if (flash?.estudiante_retirado) {
            // 1. Asignamos primero el estudiante seleccionado
            setSelectedStudent(flash.estudiante_retirado);
            const timer = setTimeout(() => {
                const input = document.getElementById("universal-search");
                if (input) {
                    input.focus();
                }
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    // --- LÓGICA DE BÚSQUEDA DE RESPONSABLE ---
    useEffect(() => {
        const buscar = async () => {
            if (searchCedulaResp.length < 5) return;
            setIsSearchingResp(true);
            try {
                const response = await axios.post(
                    route("estudiantes.activos.listado.buscar.responsable"),
                    {
                        cedula: searchCedulaResp,
                    },
                );
                setFoundResponsable(response.data.responsable || null);
            } finally {
                setIsSearchingResp(false);
            }
        };
        const timeout = setTimeout(buscar, 500);
        return () => clearTimeout(timeout);
    }, [searchCedulaResp]);

    // --- SHORTCUTS ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            const is6to =
                currentGrade.nombre_del_grado.toLowerCase().includes("6to") ||
                currentGrade.nombre_del_grado.toLowerCase().includes("sexto");
            if (e.ctrlKey && e.key.toLowerCase() === "g" && is6to) {
                e.preventDefault();
                setShowGraduateButton(!showGraduateButton);
                toast.info(
                    !showGraduateButton
                        ? "Modo graduación activado"
                        : "Modo graduación desactivado",
                );
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentGrade, showGraduateButton]);

    // --- MANEJADORES DE ACCIONES ---
    const CerrarModalRetire = () => {
        setModal({
            ...modal,
            retirePrint: false,
        });
        clearSearchAndFocus();
    };
    const handlePrint = (type, studentId = null, status = null) => {
        const params = {
            type,
            gradoId: currentGrade.id,
            periodo_id: pageProps.periodo_activo_id || "",
        };

        if (studentId) {
            const student = datos.data.find((s) => s.id === studentId);
            params.studentId = studentId;
            // Usar el periodo_id del estudiante o del selectedStudent (para retiro)
            params.periodo_id =
                student?.periodo_id ||
                selectedStudent?.periodo_id ||
                pageProps.periodo_activo_id ||
                "";
            if (status) {
                params.status = status;
            }
        }

        window.open(route("estudiantesActivosExport", params), "_blank");
        setActiveDropdown(null);
        clearSearchAndFocus();
    };

    const handleOpenRetire = (student) => {
        setSelectedStudent(student);
        formRetire.reset();
        // Limpiar errores previos

        formRetire.clearErrors();
        setModal((prev) => ({ ...prev, retire: true }));
    };

    const submitRetire = (e) => {
        e.preventDefault();
        formRetire.delete(
            route("estudiantes.activos.listado.destroy", selectedStudent.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setModal({ ...modal, retire: false });
                    setModal((prev) => ({ ...prev, retirePrint: true }));
                },
                onError: (errors) => {
                    const errorMsg =
                        errors?.response?.data?.error ||
                        errors?.message ||
                        "Error al retirar el estudiante";
                    toast.error(errorMsg);
                    setModal({ ...modal, retire: false });
                },
            },
        );
    };

    const submitChangeGrade = (e) => {
        e.preventDefault();

        // Verificación de seguridad
        if (
            !formChangeGrade.data.new_grade_id ||
            !formChangeGrade.data.student_id
        ) {
            return toast.warning("Seleccione un grado destino.");
        }

        formChangeGrade.post(
            route("estudiantes.activos.listado.cambiar.grado"),
            {
                onSuccess: () => {
                    setModal({ ...modal, changeGrade: false });
                    formChangeGrade.reset();
                    clearSearchAndFocus();
                },
                onError: () => {
                    toast.error("No se pudo completar la transferencia");
                },
            },
        );
    };

    const assignGuardian = () => {
        if (targetField === "representante" && !parentesco)
            return toast.warning("Seleccione el parentesco.");
        setIsLinking(true);
        router.patch(
            route(
                "estudiantes.activos.listado.update.responsable",
                selectedStudent.id,
            ),
            {
                responsable_id: foundResponsable.id,
                tipo: targetField,
                parentesco: targetField === "representante" ? parentesco : null,
            },
            {
                onSuccess: () => {
                    setModal({ ...modal, guardian: false });
                    clearSearchAndFocus();
                },

                onFinish: () => setIsLinking(false),
            },
        );
    };

    const submitCreateGuardian = (e) => {
        e.preventDefault();

        // Forzamos que la cédula del form sea la que buscamos originalmente
        formGuardian.setData("cedula_r", searchCedulaResp);

        formGuardian.post(
            route("estudiantes.activos.listado.guardar.responsable"),
            {
                preserveScroll: true,
                onSuccess: () => {
                    clearSearchAndFocus();
                    // el useEffect de arriba lo tomará del flash.
                },
                onError: (errors) => {
                    toast.error("Error al registrar responsable");
                },
            },
        );
    };

    const resetModalState = () => {
        setIsRegisteringNewGuardian(false);
        setFoundResponsable(null);
        setSearchCedulaResp("");
        setParentesco(""); // Si tienes un estado para parentesco
        // Si tienes otros estados relacionados, resetealos también
    };

    const submitGraduate = (e) => {
        e.preventDefault();

        // Verificamos que se haya seleccionado una apreciación válida
        if (
            !formGraduate.data.apreciacion ||
            formGraduate.data.apreciacion === "S-D"
        ) {
            return toast.warning(
                "Debe asignar una apreciación válida antes de continuar.",
            );
        }

        formGraduate.post(route("estudiantes.activos.listado.graduate"), {
            onSuccess: () => {
                setModal({ ...modal, graduate: false });
                clearSearchAndFocus();
            },
            onError: (errors) => {
                setModal({ ...modal, graduate: false });
                toast.error(
                    "Error: " +
                        (Object.values(errors)[0] || "No se pudo procesar"),
                );
            },
        });
    };

    // Función de búsqueda corregida
    const handleSearch = (val) => {
        setLocalSearch(val);

        if (searchTimer.current) clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => {
            router.get(
                route("estudiantes.activos.listado.show", currentGrade.id),
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
    return (
        <AuthenticatedLayout>
            <Head title={`Grado: ${currentGrade.nombre_del_grado}`} />

            <ViewContainer
                title={`Listado estudiantes ${currentGrade.nombre_del_grado} - SECCIÓN "${currentGrade.seccion}"`}
                subtitle="Gestión de expediente, responsables legales y documentación"
                icon="UserPlus"
                showSearch={true}
                searchValue={localSearch} // ← Cambia filters.search por localSearch
                onSearch={handleSearch} // ← Usa la nueva función
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={(page) =>
                    router.get(
                        route(
                            "estudiantes.activos.listado.show",
                            currentGrade.id,
                        ),
                        {
                            page,
                            search: localSearch, // ← Cambia filters.search por localSearch
                        },
                        { preserveState: true },
                    )
                }
                footerStats={
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400">
                        <div className="w-px h-3 bg-slate-300"></div>
                        <span className="text-blue-500 text-sm">
                            Varones: {totals.masculino}
                        </span>
                        <span className="text-pink-500 text-sm">
                            Hembras: {totals.femenino}
                        </span>

                        <span className="text-gray-900 text-sm">
                            Total General en el grado:{" "}
                            {totals.femenino + totals.masculino}
                        </span>
                    </div>
                }
                returns={
                    <div className="flex items-center gap-3">
                        <Link href={route("estudiantes.activos.listado.index")}>
                            <Button>
                                <ArrowLeftCircle className="mr-2" size={16} />{" "}
                                VOLVER
                            </Button>
                        </Link>

                        {/* NAVEGACIÓN ENTRE GRADOS */}
                        <div className="flex border bg-violet-300 rounded-xl p-1 shadow-sm h-9">
                            <Button
                                variant="ghost"
                                title="Grado Anterior"
                                size="icon"
                                className="h-full w-8 bg-green-300"
                                disabled={!previousGradeId}
                                onClick={() =>
                                    router.visit(
                                        route(
                                            "estudiantes.activos.listado.show",
                                            previousGradeId,
                                        ),
                                    )
                                }
                            >
                                <ChevronLeft size={18} />
                            </Button>
                            <div className="w-px h-4 bg-slate-200 self-center mx-1"></div>
                            <Button
                                variant="ghost"
                                title="Grado Siguiente"
                                size="icon"
                                className="h-full w-8 bg-green-300"
                                disabled={!nextGradeId}
                                onClick={() =>
                                    router.visit(
                                        route(
                                            "estudiantes.activos.listado.show",
                                            nextGradeId,
                                        ),
                                    )
                                }
                            >
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="h-full flex flex-col bg-white border border-slate-200 rounded-t-[1.5rem] shadow-sm overflow-hidden">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse select-text">
                            <thead className="sticky top-0 z-20 bg-blue-800 border-b border-slate-600 text-slate-50 uppercase text-[10px] font-black tracking-widest italic text-left">
                                <tr>
                                    <th className="px-6 py-4">
                                        Datos Personales
                                    </th>
                                    <th className="px-6 py-4">Padre / Madre</th>
                                    <th className="px-6 py-4">Representante</th>
                                    <th className="px-6 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-500">
                                {datos.data.map((student) => (
                                    <tr
                                        key={student.id}
                                        className={`hover:bg-slate-50/50 transition-colors ${student.actualizado === "No" ? "bg-amber-50/30" : ""}`}
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                                                        student.sexo === "M"
                                                            ? "bg-blue-50 text-blue-600 border-blue-100"
                                                            : "bg-pink-50 text-pink-600 border-pink-100"
                                                    }`}
                                                >
                                                    {student.actualizado ===
                                                    "No" ? (
                                                        <AlertTriangle
                                                            size={16}
                                                            className="text-amber-500"
                                                        />
                                                    ) : (
                                                        <CheckCircle2
                                                            size={16}
                                                            className="text-emerald-500"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[16px] font-black text-gray-800 uppercase font-mono leading-none mb-1">
                                                        {student.name}{" "}
                                                        {student.apellido}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-gray-500 font-mono">
                                                        <IdCardLanyard
                                                            size={13}
                                                        />
                                                        {student.documento}{" "}
                                                        {student.cedula}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5 text-gray-600 text-[14px] font-mono">
                                                            <Calendar
                                                                size={13}
                                                            />
                                                            {dayjs(
                                                                student.fecha_de_nacimiento,
                                                            ).format(
                                                                "DD/MM/YYYY",
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 rounded-md font-black">
                                                            <Cake size={10} />
                                                            {student.age} Años
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 relative group select-text">
                                            {student.padre ? (
                                                <div className="transition-all duration-200 hover:bg-indigo-50/50 rounded-xl p-2 -m-2 group/edit">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-black text-slate-700 uppercase text-[12px] leading-tight">
                                                                <User
                                                                    size={11}
                                                                    className="inline mr-1"
                                                                />
                                                                {
                                                                    student
                                                                        .padre
                                                                        .name_r
                                                                }
                                                            </p>
                                                            <p className="font-bold text-indigo-800 text-[15px] font-mono mt-1 tracking-wider">
                                                                <IdCardLanyard
                                                                    size={11}
                                                                    className="inline mr-1"
                                                                />
                                                                {student.padre
                                                                    .cedula_r ||
                                                                    "S/T"}
                                                            </p>
                                                            <p className="font-bold text-indigo-500 text-[14px] italic mt-0.5">
                                                                <Phone
                                                                    size={11}
                                                                    className="inline mr-1"
                                                                />
                                                                {student.padre
                                                                    .telefono_r ||
                                                                    "S/T"}
                                                            </p>
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                resetModalState();
                                                                setSelectedStudent(
                                                                    student,
                                                                );
                                                                setTargetField(
                                                                    "padre",
                                                                );
                                                                setSearchCedulaResp(
                                                                    "",
                                                                );
                                                                setModal({
                                                                    ...modal,
                                                                    guardian: true,
                                                                });
                                                            }}
                                                            className="rounded-lg group-hover/edit:opacity-100 transition-all duration-200"
                                                            title="Cambiar"
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="border hover:bg-green-200 hover:text-gray-50"
                                                            >
                                                                <PenLineIcon
                                                                    size={14}
                                                                    className="text-green-700"
                                                                />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => {
                                                        resetModalState();
                                                        setSelectedStudent(
                                                            student,
                                                        );
                                                        setTargetField("padre");
                                                        setSearchCedulaResp("");
                                                        setModal({
                                                            ...modal,
                                                            guardian: true,
                                                        });
                                                    }}
                                                    className="cursor-pointer transition-all duration-200 hover:bg-amber-50/50 rounded-xl p-2 -m-2 group/add"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase italic">
                                                            Sin asignar
                                                        </span>
                                                        <Plus
                                                            size={14}
                                                            className="text-amber-400 opacity-0 group-hover/add:opacity-100 transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-3 relative group border-l border-slate-50">
                                            {student.representante ? (
                                                <div className="transition-all duration-200 hover:bg-indigo-50/50 rounded-xl p-2 -m-2 group/edit">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-black text-slate-700 uppercase text-[12px] leading-tight">
                                                                <User
                                                                    size={11}
                                                                    className="inline mr-1"
                                                                />
                                                                {
                                                                    student
                                                                        .representante
                                                                        .name_r
                                                                }
                                                            </p>
                                                            <p className="font-bold text-indigo-800 text-[15px] font-mono mt-1  tracking-wider">
                                                                <IdCardLanyard
                                                                    size={11}
                                                                    className="inline mr-1"
                                                                />
                                                                {student
                                                                    .representante
                                                                    .cedula_r ||
                                                                    "S/T"}
                                                            </p>
                                                            <p className="font-bold text-indigo-500 text-[14px] italic mt-0.5">
                                                                <Phone
                                                                    size={11}
                                                                    className="inline mr-1"
                                                                />
                                                                {student
                                                                    .representante
                                                                    .telefono_r ||
                                                                    "S/T"}
                                                            </p>
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                resetModalState();
                                                                setSelectedStudent(
                                                                    student,
                                                                );
                                                                setTargetField(
                                                                    "representante",
                                                                );
                                                                setSearchCedulaResp(
                                                                    "",
                                                                );
                                                                setModal({
                                                                    ...modal,
                                                                    guardian: true,
                                                                });
                                                            }}
                                                            className="opacity-1 group-hover/edit:opacity-100 transition-all duration-200"
                                                            title="Cambiar"
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="border hover:bg-green-200 hover:text-gray-50"
                                                            >
                                                                <PenLineIcon
                                                                    size={14}
                                                                    className="text-green-700"
                                                                />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => {
                                                        resetModalState();
                                                        setSelectedStudent(
                                                            student,
                                                        );
                                                        setTargetField(
                                                            "representante",
                                                        );
                                                        setSearchCedulaResp("");
                                                        setModal({
                                                            ...modal,
                                                            guardian: true,
                                                        });
                                                    }}
                                                    className="cursor-pointer transition-all duration-200 hover:bg-amber-50/50 rounded-xl p-2 -m-2 group/add"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase italic">
                                                            Sin asignar
                                                        </span>
                                                        <Plus
                                                            size={14}
                                                            className="text-amber-400 opacity-0 group-hover/add:opacity-100 transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex justify-center gap-1">
                                                <Link
                                                    href={route(
                                                        "estudiantes.activos.listado.edit",
                                                        student.id,
                                                    )}
                                                >
                                                    <ActionBtn
                                                        icon={
                                                            <Edit size={14} />
                                                        }
                                                        color="text-indigo-500"
                                                    />
                                                </Link>
                                                <ActionBtn
                                                    icon={<Printer size={14} />}
                                                    color="text-cyan-500"
                                                    onClick={() => {
                                                        setSelectedStudent(
                                                            student,
                                                        );
                                                        setModal({
                                                            ...modal,
                                                            individualPrint: true,
                                                        });
                                                    }}
                                                />
                                                <ActionBtn
                                                    icon={
                                                        <ArrowRightLeft
                                                            size={14}
                                                        />
                                                    }
                                                    color="text-amber-500"
                                                    onClick={() => {
                                                        setSelectedStudent(
                                                            student,
                                                        );
                                                        // IMPORTANTE: student.id debe ser el ID de la tabla 'estudiantes'
                                                        formChangeGrade.setData(
                                                            {
                                                                student_id:
                                                                    student.id,
                                                                new_grade_id:
                                                                    "",
                                                            },
                                                        );
                                                        setModal({
                                                            ...modal,
                                                            changeGrade: true,
                                                        });
                                                    }}
                                                />
                                                <ActionBtn
                                                    icon={<Trash2 size={14} />}
                                                    color="text-red-500"
                                                    onClick={() =>
                                                        handleOpenRetire(
                                                            student,
                                                        )
                                                    }
                                                />
                                                {showGraduateButton && (
                                                    <ActionBtn
                                                        icon={
                                                            <GraduationCap
                                                                size={14}
                                                            />
                                                        }
                                                        color="text-emerald-500 animate-pulse"
                                                        onClick={() => {
                                                            setSelectedStudent(
                                                                student,
                                                            );
                                                            // Cargamos los datos en el form de una vez
                                                            formGraduate.setData(
                                                                {
                                                                    student_id:
                                                                        student.id,
                                                                    current_grade_id:
                                                                        currentGrade.id,
                                                                    // Si es S-D lo dejamos vacío para obligar a elegir
                                                                    apreciacion:
                                                                        student.apreciacion ===
                                                                        "S-D"
                                                                            ? ""
                                                                            : student.apreciacion,
                                                                },
                                                            );
                                                            setModal({
                                                                ...modal,
                                                                graduate: true,
                                                            });
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {datos.data.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center gap-2 opacity-30">
                                <Search size={48} />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">
                                    No se hallaron coincidencias
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MODALES --- */}

                {/* MODAL RETIRO */}
                {modal.retire &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 shadow-[0_0_50px_-12px_rgba(244,63,94,0.5)] border-2 border-rose-100 relative text-center animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, retire: false })
                                    }
                                    className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>
                                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-100/50">
                                    <Trash2 size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">
                                    Retirar Estudiante
                                </h3>
                                <div className="mb-6 p-3 bg-rose-50 rounded-xl">
                                    <p className="text-[11px] font-black text-slate-600 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-rose-600">
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
                                    onSubmit={submitRetire}
                                    className="space-y-6 text-left"
                                >
                                    <MotivoRetiroSelect
                                        value={
                                            formRetire.data.status_escolar || ""
                                        }
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
                                        variant="destructive"
                                        className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-lg shadow-rose-100"
                                        disabled={formRetire.processing}
                                        loading={formRetire.processing}
                                    >
                                        {formRetire.processing
                                            ? "PROCESANDO..."
                                            : "CONFIRMAR RETIRO"}
                                    </Button>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase text-center">
                                        ⚠️ Esta acción no se puede deshacer
                                    </p>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL IMPRESIÓN DE RETIRO (POST-PROCESO) */}
                {modal.retirePrint &&
                    createPortal(
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)] border-2 border-emerald-100 relative text-center animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                       CerrarModalRetire()
                                    }
                                    className="absolute top-6 right-6 text-slate-300 hover:text-emerald-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-emerald-100/50">
                                    <Printer size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic leading-tight">
                                    Retiro Exitoso
                                </h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 mb-6">
                                    Se ha generado el registro de salida
                                </p>
                                <div className="mb-6 p-3 bg-slate-50 rounded-xl text-left">
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
                                        Periodo:{" "}
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
                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="success"
                                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-100"
                                        onClick={() => {
                                            handlePrint(
                                                "constancia-de-retiro",
                                                selectedStudent?.id,
                                                "retirado",
                                            );
                                            setModal({
                                                ...modal,
                                                retirePrint: false,
                                            });
                                        }}
                                    >
                                        <Printer size={18} className="mr-2" />{" "}
                                        IMPRIMIR CONSTANCIA
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
                {/* MODAL CAMBIO GRADO */}
                {modal.changeGrade &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)] border-2 border-amber-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({
                                            ...modal,
                                            changeGrade: false,
                                        })
                                    }
                                    className="absolute top-6 right-6 text-slate-300 hover:text-amber-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>
                                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-amber-100/50">
                                    <ArrowRightLeft size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">
                                    Transferencia de Sección
                                </h3>
                                <div className="mb-6 p-4 bg-amber-50/50 border border-amber-100 rounded-[1.5rem] text-center shadow-inner">
                                    <p className="text-[13px] font-black text-slate-800 uppercase italic leading-tight">
                                        {selectedStudent?.name}{" "}
                                        {selectedStudent?.apellido}
                                    </p>
                                    <div className="mt-2 flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            Ubicación Actual
                                        </span>
                                        <span className="text-[10px] font-black text-amber-600 uppercase">
                                            {currentGrade?.nombre_del_grado} -
                                            SECCIÓN "{currentGrade?.seccion}"
                                        </span>
                                    </div>
                                </div>
                                <form
                                    onSubmit={submitChangeGrade}
                                    className="space-y-5 text-left"
                                >
                                    <SelectField
                                        label="Seleccione Grado Destino *"
                                        value={
                                            formChangeGrade.data.new_grade_id
                                        }
                                        options={grades
                                            .filter(
                                                (g) =>
                                                    g.id !== currentGrade?.id,
                                            )
                                            .map((g) => ({
                                                v: g.id,
                                                l: `${g.nombre_del_grado} - SECCIÓN "${g.seccion}"`,
                                            }))}
                                        onChange={(e) =>
                                            formChangeGrade.setData(
                                                "new_grade_id",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-lg shadow-amber-100"
                                        disabled={
                                            formChangeGrade.processing ||
                                            !formChangeGrade.data.new_grade_id
                                        }
                                        loading={formChangeGrade.processing}
                                    >
                                        {formChangeGrade.processing
                                            ? "PROCESANDO..."
                                            : "CONFIRMAR CAMBIO"}
                                    </Button>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase italic text-center">
                                        * El estudiante conservará todo su
                                        historial académico
                                    </p>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}
                {/* MODAL GRADUACIÓN */}
                {modal.graduate &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({ ...modal, graduate: false })
                                    }
                                    className="absolute top-6 right-6 text-slate-300 hover:text-indigo-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-indigo-100/50">
                                    <GraduationCap size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6">
                                    Proceso de Graduación
                                </h3>
                                <div className="mb-6 p-3 bg-indigo-50 rounded-xl">
                                    <p className="text-[11px] font-black text-slate-600 uppercase">
                                        Estudiante:{" "}
                                        <span className="text-indigo-600">
                                            {selectedStudent?.name}{" "}
                                            {selectedStudent?.apellido}
                                        </span>
                                    </p>
                                    <p className="text-[10px] font-black text-slate-600 uppercase">
                                        Grado Actual:{" "}
                                        <span className="text-amber-600">
                                            {currentGrade?.nombre_del_grado} -{" "}
                                            {currentGrade?.seccion}
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
                                    onSubmit={submitGraduate}
                                    className="space-y-5 text-left"
                                >
                                    {selectedStudent?.apreciacion === "S-D" && (
                                        <div className="animate-in slide-in-from-top-2">
                                            <SelectField
                                                label="Asignar Apreciación Final *"
                                                value={
                                                    formGraduate.data
                                                        .apreciacion
                                                }
                                                options={
                                                    apreciaciones?.map((a) => ({
                                                        v: a.numeral
                                                            ? `${a.literal}-${a.numeral}`
                                                            : a.literal,
                                                        l: a.numeral
                                                            ? `${a.literal}-${a.numeral}`
                                                            : a.literal,
                                                    })) || []
                                                }
                                                onChange={(e) =>
                                                    formGraduate.setData(
                                                        "apreciacion",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <p className="text-[9px] text-amber-600 font-bold uppercase mt-1">
                                                <AlertTriangle
                                                    size={10}
                                                    className="inline mr-1"
                                                />
                                                Este campo es obligatorio para
                                                el registro de egreso.
                                            </p>
                                        </div>
                                    )}
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left">
                                        <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">
                                            <Info
                                                size={14}
                                                className="inline mr-1"
                                            />{" "}
                                            Importante:
                                        </p>
                                        <ul className="text-[9px] font-bold text-blue-600/80 space-y-1 list-disc pl-4 uppercase">
                                            <li>
                                                El estudiante pasará al
                                                historial de EGRESADOS
                                            </li>
                                            <li>
                                                Se eliminará de la lista de
                                                estudiantes activos
                                            </li>
                                            {formGraduate.data.apreciacion && (
                                                <li className="text-indigo-700 font-black">
                                                    Nota final:{" "}
                                                    {
                                                        formGraduate.data
                                                            .apreciacion
                                                    }
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100"
                                        disabled={
                                            formGraduate.processing ||
                                            !formGraduate.data.apreciacion
                                        }
                                        loading={formGraduate.processing}
                                    >
                                        {formGraduate.processing
                                            ? "PROCESANDO..."
                                            : "CONFIRMAR GRADUACIÓN"}
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL GESTOR DE RESPONSABLES */}
                {/* MODAL GESTOR DE RESPONSABLES (PADRE / REPRESENTANTE) */}
                {modal.guardian &&
                    createPortal(
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-3xl p-10 max-h-[95vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 relative border-2 border-blue-100">
                                {/* Botón Cerrar */}
                                <button
                                    onClick={() => {
                                        setModal({ ...modal, guardian: false });
                                        setIsRegisteringNewGuardian(false);
                                        setFoundResponsable(null);
                                        setSearchCedulaResp("");
                                    }}
                                    className="absolute top-6 right-6 text-slate-300 hover:text-blue-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>

                                {/* Cabecera */}
                                <div className="flex items-center gap-5 mb-8 border-b pb-6 border-slate-100">
                                    <div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white ${targetField === "padre" ? "bg-indigo-600" : "bg-blue-600"}`}
                                    >
                                        <UserRoundCog size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                                            Asignar{" "}
                                            {targetField === "padre"
                                                ? "Padre o Madre"
                                                : "Representante Legal"}
                                        </h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
                                            Estudiante:{" "}
                                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                {selectedStudent?.name}{" "}
                                                {selectedStudent?.apellido}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {!isRegisteringNewGuardian ? (
                                    /* --- VISTA 1: BÚSQUEDA Y VINCULACIÓN --- */
                                    <div className="space-y-6">
                                        {/* MUESTRA EL RESPONSABLE QUE TIENE ASIGNADO ACTUALMENTE */}
                                        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                                                <User size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">
                                                    Asignado Actualmente:
                                                </p>
                                                <p className="text-sm font-black text-slate-700 uppercase leading-none">
                                                    {targetField === "padre"
                                                        ? selectedStudent?.padre
                                                              ?.name_r ||
                                                          "Sin Padre/Madre asignado"
                                                        : selectedStudent
                                                              ?.representante
                                                              ?.name_r ||
                                                          "Sin Representante asignado"}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                                    {targetField === "padre"
                                                        ? selectedStudent?.padre
                                                            ? `C.I: ${selectedStudent.padre.cedula_r}`
                                                            : "---"
                                                        : selectedStudent?.representante
                                                          ? `C.I: ${selectedStudent.representante.cedula_r} (${selectedStudent.parentesco || "S/P"})`
                                                          : "---"}
                                                </p>
                                            </div>
                                            <div className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[8px] font-black uppercase">
                                                Actual
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <Field
                                                label={`Ingrese Cédula para nuevo ${targetField === "padre" ? "Padre/Madre" : "Representante"}`}
                                                autoFocus
                                                type="search"
                                                placeholder="Ej: 15666777"
                                                mask="00000000"
                                                value={searchCedulaResp}
                                                onChange={(e) => {
                                                    const newValue =
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        );
                                                    setSearchCedulaResp(
                                                        newValue,
                                                    );
                                                    if (newValue === "")
                                                        setFoundResponsable(
                                                            null,
                                                        );
                                                }}
                                                icon={<Search size={16} />}
                                            />
                                            {isSearchingResp && (
                                                <div className="absolute right-4 bottom-3">
                                                    <Loader2
                                                        className="animate-spin text-indigo-500"
                                                        size={18}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center shadow-inner min-h-[250px]">
                                            {foundResponsable ? (
                                                <div className="w-full text-center animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4">
                                                        <CheckCircle2
                                                            size={14}
                                                        />{" "}
                                                        Registro Encontrado
                                                    </div>
                                                    <h4 className="text-2xl font-black text-slate-800 uppercase italic mb-1">
                                                        {
                                                            foundResponsable.name_r
                                                        }
                                                    </h4>
                                                    <p className="text-xs font-bold text-slate-400 mb-6">
                                                        Cédula:{" "}
                                                        {
                                                            foundResponsable.cedula_r
                                                        }{" "}
                                                        • Tel:{" "}
                                                        {foundResponsable.telefono_r ||
                                                            "No registrado"}
                                                    </p>

                                                    {targetField ===
                                                        "representante" && (
                                                        <div className="max-w-xs mx-auto mb-6">
                                                            <SelectField
                                                                label="Definir Nuevo Parentesco *"
                                                                value={
                                                                    parentesco
                                                                }
                                                                options={[
                                                                    "Padre",
                                                                    "Madre",
                                                                    "Abuelo",
                                                                    "Abuela",
                                                                    "Hermano",
                                                                    "Hermana",
                                                                    "Tio",
                                                                    "Tia",
                                                                    "Padrastro",
                                                                    "Madrastra",
                                                                    "Responsable",
                                                                    "Tutor/Legal",
                                                                    "Otro Familiar",
                                                                    "Otro No Familiar",
                                                                ]}
                                                                onChange={(e) =>
                                                                    setParentesco(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                    )}

                                                    <Button
                                                        variant="primary"
                                                        className="w-full py-8 text-xs shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black"
                                                        onClick={assignGuardian}
                                                        loading={isLinking}
                                                        disabled={isLinking}
                                                    >
                                                        CONFIRMAR Y VINCULAR
                                                        COMO{" "}
                                                        {targetField === "padre"
                                                            ? foundResponsable.sexo_r ===
                                                              "F"
                                                                ? "MADRE"
                                                                : "PADRE"
                                                            : parentesco.toUpperCase() ||
                                                              "REPRESENTANTE"}
                                                    </Button>
                                                </div>
                                            ) : searchCedulaResp.length >= 6 &&
                                              !isSearchingResp ? (
                                                <div className="text-center animate-in zoom-in-95">
                                                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <AlertTriangle
                                                            size={40}
                                                            className="opacity-50"
                                                        />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-500 uppercase mb-6 italic">
                                                        No existe responsable
                                                        con la cédula{" "}
                                                        <span className="text-slate-800 font-black">
                                                            {searchCedulaResp}
                                                        </span>
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        className="px-10 border-indigo-200 text-indigo-600 hover:bg-indigo-50 h-12 rounded-2xl font-black"
                                                        onClick={() => {
                                                            formGuardian.setData(
                                                                "cedula_r",
                                                                searchCedulaResp,
                                                            );
                                                            setIsRegisteringNewGuardian(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        CREAR NUEVO REGISTRO
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center opacity-30">
                                                    <IdCard
                                                        size={64}
                                                        className="mx-auto mb-4"
                                                    />
                                                    <p className="text-[11px] font-black uppercase tracking-widest italic">
                                                        Esperando
                                                        identificación...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* --- VISTA 2: FORMULARIO DE NUEVO REGISTRO --- */
                                    <form
                                        onSubmit={submitCreateGuardian}
                                        className="space-y-6 animate-in slide-in-from-right-4"
                                    >
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="flex gap-2 items-end">
                                                <div className="w-24">
                                                    <SelectField
                                                        label="Tipo"
                                                        value={
                                                            formGuardian.data
                                                                .documento_r
                                                        }
                                                        options={["V", "E"]}
                                                        onChange={(e) =>
                                                            formGuardian.setData(
                                                                "documento_r",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Field
                                                        label="Cédula (Automático)"
                                                        value={
                                                            formGuardian.data
                                                                .cedula_r
                                                        }
                                                        readOnly
                                                        className="bg-slate-100 font-black text-slate-500"
                                                    />
                                                </div>
                                            </div>
                                            <Field
                                                label="Nombre y Apellido *"
                                                value={formGuardian.data.name_r}
                                                autoFocus
                                                onChange={(e) =>
                                                    formGuardian.setData(
                                                        "name_r",
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    formGuardian.errors.name_r
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <Field
                                                label="Fecha de Nacimiento *"
                                                type="date"
                                                value={
                                                    formGuardian.data
                                                        .fecha_de_nacimiento_r
                                                }
                                                onChange={(e) =>
                                                    formGuardian.setData(
                                                        "fecha_de_nacimiento_r",
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    formGuardian.errors
                                                        .fecha_de_nacimiento_r
                                                }
                                                required
                                            />
                                            <SelectField
                                                label="Género *"
                                                value={formGuardian.data.sexo_r}
                                                options={[
                                                    { v: "M", l: "Masculino" },
                                                    { v: "F", l: "Femenino" },
                                                ]}
                                                onChange={(e) =>
                                                    formGuardian.setData(
                                                        "sexo_r",
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    formGuardian.errors.sexo_r
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <Field
                                                label="Teléfono de Contacto"
                                                mask="0000-0000000"
                                                value={
                                                    formGuardian.data.telefono_r
                                                }
                                                onChange={(e) =>
                                                    formGuardian.setData(
                                                        "telefono_r",
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    formGuardian.errors
                                                        .telefono_r
                                                }
                                                icon={<Phone size={14} />}
                                            />
                                            <Field
                                                label="Ocupación / Oficio"
                                                value={
                                                    formGuardian.data
                                                        .ocupacion_r
                                                }
                                                onChange={(e) =>
                                                    formGuardian.setData(
                                                        "ocupacion_r",
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    formGuardian.errors
                                                        .ocupacion_r
                                                }
                                                icon={<Briefcase size={14} />}
                                            />
                                        </div>

                                        <Field
                                            label="Dirección Completa *"
                                            value={
                                                formGuardian.data.direccion_r
                                            }
                                            onChange={(e) =>
                                                formGuardian.setData(
                                                    "direccion_r",
                                                    e.target.value,
                                                )
                                            }
                                            error={
                                                formGuardian.errors.direccion_r
                                            }
                                            icon={<MapPin size={14} />}
                                            required
                                        />

                                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 py-7 rounded-2xl font-black"
                                                onClick={() =>
                                                    setIsRegisteringNewGuardian(
                                                        false,
                                                    )
                                                }
                                            >
                                                VOLVER ATRÁS
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="flex-[2] py-7 text-xs shadow-xl shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black"
                                                loading={
                                                    formGuardian.processing
                                                }
                                            >
                                                GUARDAR Y CONTINUAR
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>,
                        document.body,
                    )}
                {/* MODAL DOCUMENTACIÓN INDIVIDUAL */}
                {modal.individualPrint &&
                    createPortal(
                        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] border-2 border-cyan-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() =>
                                        setModal({
                                            ...modal,
                                            individualPrint: false,
                                        })
                                    }
                                    className="absolute top-6 right-6 text-slate-300 hover:text-cyan-500 hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={24} />
                                </button>
                                <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-cyan-100/50">
                                    <Printer size={40} />
                                </div>
                                <h3 className="text-xl flex justify-center font-black text-slate-800 uppercase italic mb-6">
                                    Módulo de Impresión
                                </h3>
                                <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-center shadow-inner">
                                    <p className="text-[13px] font-black text-slate-800 uppercase italic leading-tight">
                                        {selectedStudent?.name}{" "}
                                        {selectedStudent?.apellido}
                                    </p>
                                    <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <IdCard
                                            size={12}
                                            className="text-cyan-600"
                                        />
                                        {selectedStudent?.documento}{" "}
                                        {selectedStudent?.cedula}
                                    </div>
                                    <div className="mt-1 text-[9px] font-bold text-indigo-500">
                                        Periodo:{" "}
                                        {pageProps.periodo_activo || "N/A"}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-cyan-200 hover:bg-cyan-50 hover:border-cyan-400 transition-all font-black uppercase text-[10px]"
                                        onClick={() =>
                                            handlePrint(
                                                "ficha-de-inscripcion",
                                                selectedStudent.id,
                                            )
                                        }
                                    >
                                        <ScrollText
                                            size={16}
                                            className="text-cyan-600"
                                        />{" "}
                                        Ficha de Inscripción
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-cyan-200 hover:bg-cyan-50 hover:border-cyan-400 transition-all font-black uppercase text-[10px]"
                                        onClick={() =>
                                            handlePrint(
                                                "constancia-de-inscripcion",
                                                selectedStudent.id,
                                            )
                                        }
                                    >
                                        <FileCheck
                                            size={16}
                                            className="text-cyan-600"
                                        />{" "}
                                        Constancia de Inscripción
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-cyan-200 hover:bg-cyan-50 hover:border-cyan-400 transition-all font-black uppercase text-[10px]"
                                        onClick={() =>
                                            handlePrint(
                                                "constancia-de-estudio",
                                                selectedStudent.id,
                                            )
                                        }
                                    >
                                        <GraduationCap
                                            size={16}
                                            className="text-cyan-600"
                                        />{" "}
                                        Constancia de Estudio
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-cyan-200 hover:bg-cyan-50 hover:border-cyan-400 transition-all font-black uppercase text-[10px]"
                                        onClick={() =>
                                            handlePrint(
                                                "carta-de-buena-conducta",
                                                selectedStudent.id,
                                                "activo",
                                            )
                                        }
                                    >
                                        <Award
                                            size={16}
                                            className="text-cyan-600"
                                        />{" "}
                                        Carta de Buena Conducta
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-cyan-200 hover:bg-cyan-50 hover:border-cyan-400 transition-all font-black uppercase text-[10px]"
                                        onClick={() =>
                                            handlePrint(
                                                "constancia-de-notas",
                                                selectedStudent.id,
                                            )
                                        }
                                    >
                                        <Award
                                            size={16}
                                            className="text-cyan-600"
                                        />{" "}
                                        Constancia de Notas
                                    </Button>
                                </div>
                                <p className="mt-6 text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                    Seleccione el documento para previsualizar
                                </p>
                            </div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

// --- SUB-COMPONENTES AUXILIARES ---

const ActionBtn = ({ icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`h-8 w-8 rounded-lg border border-gray-600 flex items-center justify-center transition-all gap-2 hover:bg-slate-300 shadow-sm ${color}`}
    >
        {icon}
    </button>
);
