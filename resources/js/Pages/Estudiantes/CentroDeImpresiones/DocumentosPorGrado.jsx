import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { toast } from "sonner";
import {
    Printer,
    ClipboardList,
    FileCheck,
    Phone,
    CheckSquare,
    Square,
    ArrowLeftCircle,
    Users,
    IdCard,
    CheckCheck,
    MapPin,
    SearchCheck,
    Activity,
    ListCheck,
    UserCheck2,
} from "lucide-react";

export default function BulkPrintCenter({ grades }) {
    const [selectedGrades, setSelectedGrades] = useState([]);

    const toggleGrade = (id) => {
        setSelectedGrades((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
        );
    };

    const toggleAll = () => {
        if (selectedGrades.length === grades.length) setSelectedGrades([]);
        else setSelectedGrades(grades.map((g) => g.id));
    };

    const handleBulkPrint = (type) => {
        if (selectedGrades.length === 0) {
            return toast.warning("Seleccione al menos una sección.");
        }
        const ids = selectedGrades.join(",");
        window.open(
            route("estudiantesExport", { type, gradoIds: ids }),
            "_blank",
        );
        setSelectedGrades([]); // Limpiar selección después de imprimir
    };

    const handleClearSeccions = () => {
        setSelectedGrades([]); // Limpiar selección después de imprimir
    };
    const formatTeacherName = (fullName) => {
        if (!fullName || fullName === "No asignado")
            return fullName || "No asignado";
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        if (parts.length === 2) return parts.join(" ");
        // Para nombres de 3 o más partes: primera parte + tercera parte (primer apellido paterno)
        // Ej: "Carlos Eduardo Martinez Mata" -> "Carlos Martinez"
        return `${parts[0]} ${parts[2]}`;
    };
    return (
        <AuthenticatedLayout>
            <Head title="Centro de Impresión" />

            {/* ViewContainer con h-full para controlar el scroll interno */}
            <ViewContainer
                title="DOCUMENTOS GLOBALES POR GRADO Y SECCION"
                subtitle="Gestión de reportes grupales"
                icon="File"
                showSearch={false}
                returns={
                    <>
                        <Link href={route("estudiantes.impresiones.index")}>
                            <Button>
                                <ArrowLeftCircle size={16} /> VOLVER
                            </Button>
                        </Link>
                    </>
                }
            >
                {/* Contenedor Principal con altura fija basada en el viewport */}
                <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-230px)] overflow-hidden">
                    {/* PANEL IZQUIERDO: SELECCIÓN DE GRADOS */}
                    <div className="lg:w-2/4 flex flex-col bg-slate-50/50 border border-slate-200 rounded-[2rem] overflow-hidden">
                        {/* Cabecera del Panel con Botón Seleccionar Todo */}
                        <div className="p-4 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Users
                                        size={16}
                                        className="text-indigo-600"
                                    />
                                    <span className="text-[11px] font-black uppercase italic text-slate-700">
                                        Secciones
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {selectedGrades.length} / {grades.length}
                                </span>
                            </div>

                            {/* Contenedor flex para los dos botones en la misma línea */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={toggleAll}
                                    variant="outline"
                                    className="flex-1 h-9 text-[10px] font-black uppercase rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                >
                                    {selectedGrades.length === grades.length ? (
                                        <>
                                            <Square
                                                size={14}
                                                className="mr-2"
                                            />
                                            Desmarcar Todo
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare
                                                size={14}
                                                className="mr-2"
                                            />
                                            Seleccionar Todos
                                        </>
                                    )}
                                </Button>

                                {/* Botón que solo aparece si hay selecciones individuales */}
                                {selectedGrades.length > 0 &&
                                    selectedGrades.length !== grades.length && (
                                        <Button
                                            onClick={handleClearSeccions}
                                            variant="outline"
                                            className="flex-1 h-9 w-9 text-[10px] font-black uppercase rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                        >
                                            <Square
                                                size={14}
                                                className="mr-2"
                                            />
                                            Limpiar seleccionados
                                        </Button>
                                    )}
                            </div>
                        </div>

                        {/* Lista con Scroll Independiente */}
                        <div className="bg-blue-300 h-screen p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 overflow-y-visible">
                                {grades.map((grade, index) => {
                                    const colorVariants = [
                                        {
                                            bg: "bg-blue-50",
                                            border: "border-blue-200",
                                            text: "text-blue-800",
                                            ring: "ring-blue-300",
                                            hoverBg: "hover:bg-blue-50",
                                            hoverBorder:
                                                "hover:border-blue-200",
                                        },
                                        {
                                            bg: "bg-emerald-50",
                                            border: "border-emerald-200",
                                            text: "text-emerald-800",
                                            ring: "ring-emerald-300",
                                            hoverBg: "hover:bg-emerald-50",
                                            hoverBorder:
                                                "hover:border-emerald-200",
                                        },
                                        {
                                            bg: "bg-amber-50",
                                            border: "border-amber-200",
                                            text: "text-amber-800",
                                            ring: "ring-amber-300",
                                            hoverBg: "hover:bg-amber-50",
                                            hoverBorder:
                                                "hover:border-amber-200",
                                        },
                                        {
                                            bg: "bg-rose-50",
                                            border: "border-rose-200",
                                            text: "text-rose-800",
                                            ring: "ring-rose-300",
                                            hoverBg: "hover:bg-rose-50",
                                            hoverBorder:
                                                "hover:border-rose-200",
                                        },
                                        {
                                            bg: "bg-purple-50",
                                            border: "border-purple-200",
                                            text: "text-purple-800",
                                            ring: "ring-purple-300",
                                            hoverBg: "hover:bg-purple-50",
                                            hoverBorder:
                                                "hover:border-purple-200",
                                        },
                                        {
                                            bg: "bg-cyan-50",
                                            border: "border-cyan-200",
                                            text: "text-cyan-800",
                                            ring: "ring-cyan-300",
                                            hoverBg: "hover:bg-cyan-50",
                                            hoverBorder:
                                                "hover:border-cyan-200",
                                        },
                                    ];
                                    const color =
                                        colorVariants[
                                            index % colorVariants.length
                                        ];
                                    const isSelected = selectedGrades.includes(
                                        grade.id,
                                    );

                                    return (
                                        <div
                                            key={grade.id}
                                            onClick={() =>
                                                toggleGrade(grade.id)
                                            }
                                            className={`
            flex items-start p-2 rounded-lg cursor-pointer border transition-all text-[9px]
            ${
                isSelected
                    ? `${color.bg} ${color.border} shadow-sm ring-1 ${color.ring}`
                    : `bg-white border-transparent ${color.hoverBg} ${color.hoverBorder}`
            }
          `}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                className={`mr-2 h-4 w-4 mt-0.5 ${isSelected ? color.text : "text-slate-500"}`}
                                            />
                                            <div className="flex-1 overflow-hidden leading-tight">
                                                <p
                                                    className={`font-black uppercase truncate ${isSelected ? color.text : "text-slate-700"}`}
                                                >
                                                    {grade.nombre_del_grado}{" "}
                                                    {grade.seccion}
                                                </p>
                                                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mt-2">
                                                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                                    Doc:{" "}
                                                    {formatTeacherName(
                                                        grade.docente ||
                                                            "No asignado",
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* PANEL DERECHO: ACCIONES DE IMPRESIÓN */}
                    <div className="lg:w-1/2 flex flex-col bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                        <div className="p-2 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Printer size={18} />
                            </div>
                            <h3 className="text-[11px] font-black uppercase italic text-slate-700">
                                Documentos Disponibles
                            </h3>
                        </div>

                        {/* Grid de Tarjetas Compactas */}
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                <PrintCard
                                    title="Listado Para Asistencias"
                                    icon={<ClipboardList size={14} />}
                                    color="text-blue-600"
                                    onClick={() =>
                                        handleBulkPrint("control-de-asistencia")
                                    }
                                />
                                <PrintCard
                                    title="Inscripción Inicial"
                                    icon={<FileCheck size={14} />}
                                    color="text-emerald-600"
                                    onClick={() =>
                                        handleBulkPrint("inscripcion-inicial")
                                    }
                                />
                                <PrintCard
                                    title="Cédulación"
                                    icon={<IdCard size={14} />}
                                    color="text-amber-600"
                                    onClick={() =>
                                        handleBulkPrint("cedulacion")
                                    }
                                />
                                <PrintCard
                                    title="Directorio Padres/Responsables"
                                    icon={<Phone size={14} />}
                                    color="text-indigo-600"
                                    onClick={() =>
                                        handleBulkPrint("directorio")
                                    }
                                />

                                <PrintCard
                                    title="Listado Para Aprobar/Reprobar"
                                    icon={<CheckCheck size={20} />}
                                    color="text-rose-600"
                                    onClick={() =>
                                        handleBulkPrint(
                                            "control-aprobados-reprobados",
                                        )
                                    }
                                />

                                <PrintCard
                                    title="Listado Para Zonificaciónes"
                                    icon={<MapPin size={20} />}
                                    color="text-rose-600"
                                    onClick={() =>
                                        handleBulkPrint(
                                            "control-de-zonificacion",
                                        )
                                    }
                                />
                                <PrintCard
                                    title="Lista de Verificación"
                                    icon={<ListCheck size={20} />}
                                    color="text-cyan-600"
                                    onClick={() =>
                                        handleBulkPrint("lista-de-verificacion")
                                    }
                                />
                                <PrintCard
                                    title="Control de Evaluación"
                                    icon={<SearchCheck size={20} />}
                                    color="text-slate-600"
                                    onClick={() =>
                                        handleBulkPrint("control-de-evaluacion")
                                    }
                                />
                                <PrintCard
                                    title="Control Rendimiento Estudiantil"
                                    icon={<UserCheck2 size={20} />}
                                    color="text-violet-600"
                                    onClick={() =>
                                        handleBulkPrint(
                                            "rendimiento-estudiantil",
                                        )
                                    }
                                />

                                <PrintCard
                                    title="Listado Para Actividades Especiales"
                                    icon={<Activity size={14} />}
                                    color="text-indigo-600"
                                    bgcolor="bg-rose-200"
                                    onClick={() => {
                                        // VALIDACIÓN: Si no hay grados, mostramos error y detenemos la función
                                        if (selectedGrades.length === 0) {
                                            return toast.warning(
                                                "Debe seleccionar al menos un grado para configurar el reporte.",
                                            );
                                        }

                                        const ids = selectedGrades.join(",");

                                        // Solo si pasa la validación, ejecuta la navegación
                                        router.get(
                                            route(
                                                "estudiantes.impresiones.control.de.actividades",
                                            ),
                                            {
                                                gradoIds: ids,
                                            },
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        {/* Footer del panel derecho (Compacto) */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                                {selectedGrades.length > 0
                                    ? `Preparado para imprimir ${selectedGrades.length} secciones simultáneamente`
                                    : "Seleccione secciones a la izquierda para habilitar la impresión"}
                            </p>
                        </div>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

const PrintCard = ({ title, icon, onClick, color, bgcolor = "bg-white" }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1 p-2 ${bgcolor} border border-slate-900 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group text-left shadow-sm`}
    >
        <div
            className={`p-1.5 bg-white rounded-xl ${color} border border-slate-50 shadow-inner group-hover:scale-110 transition-transform`}
        >
            {icon}
        </div>
        <div>
            <p className="font-black text-[10px] uppercase tracking-tight text-slate-700 leading-tight">
                {title}
            </p>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                Generar Reporte
            </p>
        </div>
    </button>
);
