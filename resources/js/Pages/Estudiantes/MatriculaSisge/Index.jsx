import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import {
    Edit,
    CheckCircle2,
    Loader2,
    X,
    ArrowLeftCircle,
    ClipboardList,
    Printer,
    Copy,
    User,
    Users,
    ClipboardCheck,
    AlertCircle,
    IdCard,
    Calendar,
    Cake,
    Search,
    UserPlus,
    UserMinus,
    ArrowRightLeft,
    ShieldCheck,
    XCircle,
} from "lucide-react"; // Nota: Cambia esto a "lucide-react" si da error
import { toast } from "sonner";

// --- FUNCIÓN GLOBAL DE COPIADO (SOLUCIÓN DEFINITIVA HTTP/HTTPS) ---
const executeCopy = (text) => {
    return new Promise((resolve, reject) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand("copy");
                document.body.removeChild(textArea);
                successful ? resolve() : reject();
            }
        } catch (err) {
            reject(err);
        }
    });
};

// --- COMPONENTE COPY SECTION ---
const CopySection = ({
    title,
    icon,
    items,
    copyFunc,
    color,
    bgColor,
    borderColor,
    emptyMessage,
}) => (
    <div
        className={`p-5 rounded-2xl border ${borderColor || "border-slate-200/30"} ${bgColor || "bg-white"} shadow-sm`}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${color} bg-white shadow-sm`}>
                {icon}
            </div>
            <h4
                className={`text-[10px] font-black ${color} uppercase tracking-wider`}
            >
                {title}
            </h4>
        </div>
        {items ? (
            <div className="space-y-2">
                {Object.entries(items).map(([label, val]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-all duration-300 group border border-transparent hover:border-slate-200"
                    >
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                {label}
                            </span>
                            <span className="text-[12px] font-bold text-slate-800 truncate max-w-[180px]">
                                {val || "---"}
                            </span>
                        </div>
                        <button
                            onClick={() => copyFunc(val, label)}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl transition-all duration-300 active:scale-90 hover:shadow-lg"
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-40 flex flex-col items-center justify-center opacity-40">
                <AlertCircle size={24} className="text-slate-400 mb-2" />
                <span className="text-[9px] font-bold text-slate-400 uppercase italic">
                    {emptyMessage || "Sin datos"}
                </span>
            </div>
        )}
    </div>
);

// --- COMPONENTE COPY PANEL MODAL ---
const CopyPanelModal = ({ student, onClose }) => {
    const copyToClipboard = (text, label) => {
        if (!text) return;
        executeCopy(text).then(() => {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: `<span class="text-xs uppercase font-black">${label} Copiado</span>`,
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            });
        });
    };

    const copyAllData = () => {
        let allData = `ESTUDIANTE:\nNombres: ${student.name}\nApellidos: ${student.apellido}\nCédula: ${student.cedula}\nNacimiento: ${dayjs(student.fecha_de_nacimiento).format("DD-MM-YYYY")}\nDirección: ${student.direccion || "---"}\n\n`;
        if (student.padre) {
            allData += `PADRE:\nNombre: ${student.padre.name_r}\nCédula: ${student.padre.cedula_r}\nTeléfono: ${student.padre.telefono_r}\nDirección: ${student.padre.direccion_r}\n\n`;
        }
        if (student.representante) {
            allData += `REPRESENTANTE:\nNombre: ${student.representante.name_r}\nCédula: ${student.representante.cedula_r}\nTeléfono: ${student.representante.telefono_r}\nDirección: ${student.representante.direccion_r}\n`;
        }
        executeCopy(allData).then(() => {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: '<span class="text-xs uppercase font-black">Datos completos copiados</span>',
                showConfirmButton: false,
                timer: 1500,
            });
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-[1.5rem] w-full max-w-5xl max-h-[95vh] overflow-y-auto p-4 shadow-2xl border border-indigo-200/30 relative">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm -m-4 p-6 rounded-t-[1.5rem] border-b border-slate-100 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase italic">
                                Panel de Copiado
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {student.name} {student.apellido}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={copyAllData}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase px-6"
                        >
                            <Copy size={14} className="mr-2" /> Copiar Todo
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <CopySection
                        title="Estudiante"
                        icon={<User size={16} />}
                        color="text-blue-600"
                        bgColor="bg-blue-50/50"
                        borderColor="border-blue-200/30"
                        items={{
                            Nombres: student.name,
                            Apellidos: student.apellido,
                            Cédula: student.cedula,
                            "Fecha Nac.": dayjs(
                                student.fecha_de_nacimiento,
                            ).format("DD-MM-YYYY"),
                            Dirección: student.direccion,
                        }}
                        copyFunc={copyToClipboard}
                    />
                    <CopySection
                        title="Padre"
                        icon={<Users size={16} />}
                        color="text-slate-600"
                        bgColor="bg-slate-50/50"
                        items={
                            student.padre
                                ? {
                                      Nombre: student.padre.name_r,
                                      Cédula: student.padre.cedula_r,
                                      Teléfono: student.padre.telefono_r,
                                      Dirección: student.padre.direccion_r,
                                  }
                                : null
                        }
                        copyFunc={copyToClipboard}
                    />
                    <CopySection
                        title="Representante"
                        icon={<ClipboardCheck size={16} />}
                        color="text-emerald-600"
                        bgColor="bg-emerald-50/50"
                        items={
                            student.representante
                                ? {
                                      Nombre: student.representante.name_r,
                                      Cédula: student.representante.cedula_r,
                                      Teléfono:
                                          student.representante.telefono_r,
                                      Dirección:
                                          student.representante.direccion_r,
                                  }
                                : null
                        }
                        copyFunc={copyToClipboard}
                    />
                </div>
            </div>
        </div>,
        document.body,
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function MatriculaSisge({
    datos,
    totals,
    filters,
    periodo_escolar,
}) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const isTyping = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [copyStudent, setCopyStudent] = useState(null);

    const formEdit = useForm({
        name: "",
        apellido: "",
        cedula: "",
        fecha_de_nacimiento: "",
        sexo: "",
        lugar_de_nacimiento: "",
        direccion: "",
    });

    const handleSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.inactivos.sisge.index"),
                { search: query, page: 1 },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 400),
        [],
    );

    const onSearchChange = (val) => {
        isTyping.current = true;
        setSearchTerm(val);
        handleSearch(val);
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        formEdit.setData({
            name: student.name,
            apellido: student.apellido,
            cedula: student.cedula,
            fecha_de_nacimiento: student.fecha_de_nacimiento,
            sexo: student.sexo,
            lugar_de_nacimiento: student.lugar_de_nacimiento,
            direccion: student.direccion,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        formEdit.put(
            route(
                "estudiantes.inactivos.sisge.update",
                selectedStudent.estudiante_id,
            ),
            {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    toast.success("Actualizado correctamente");
                },
                onError: () => toast.error("Error al actualizar"),
            },
        );
    };

    const updateMatriculaSisge = (student) => {
        Swal.fire({
            title: `<span class="text-lg font-black uppercase italic">¿Confirmar en SISGE?</span>`,
            html: `<p class="text-sm text-slate-500 uppercase font-bold">¿Marcar a <b>${student.name}</b> como procesado?</p>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            confirmButtonText: "SÍ, CONFIRMAR",
        }).then((result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                // Aquí usamos PATCH enviando los 3 campos de la clave compuesta si tu ruta lo requiere,
                // o el estudiante_id si tu controlador interno ya sabe buscar el periodo activo.
                router.patch(
                    route(
                        "estudiantes.inactivos.sisge.update.sis",
                        student.estudiante_id,
                    ),
                    {
                        periodo_id: student.periodo_id,
                        grado_id: student.grado_id,
                    },
                    {
                        onFinish: () => setIsLoading(false),
                    },
                );
            }
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            Activo: {
                color: "bg-emerald-100 text-emerald-700 border-emerald-200",
                icon: <Users size={12} />,
            },
            "Nuevo Ingreso": {
                color: "bg-blue-100 text-blue-700 border-blue-200",
                icon: <UserPlus size={12} />,
            },
            Reingreso: {
                color: "bg-purple-100 text-purple-700 border-purple-200",
                icon: <UserMinus size={12} />,
            },

            Graduado: {
                color: "bg-yellow-200 text-yellow-700 border-yellow-200",
                icon: <UserMinus size={12} />,
            },
            Retirado: {
                color: "bg-rose-100 text-rose-700 border-rose-200",
                icon: <UserMinus size={12} />,
            },
            "Cambio de Grado": {
                color: "bg-amber-100 text-amber-700 border-amber-200",
                icon: <ArrowRightLeft size={12} />,
            },
        }[status] || {
            color: "bg-slate-100 text-slate-700 border-slate-200",
            icon: <Users size={12} />,
        };
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${config.color}`}
            >
                {config.icon} {status}
            </span>
        );
    };

    const handlePrint = () => {
        window.open(
            route("estudiantesExport", { type: "reporte-sisge" }),
            "_blank",
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Matrícula SISGE" />
            <ViewContainer
                title="GESTIÓN DE MATRÍCULA SISGE"
                subtitle={`Período: ${periodo_escolar}`}
                icon="ShieldCheck"
                showSearch={true}
                searchValue={searchTerm}
                onSearch={onSearchChange}
                onPageChange={(p) =>
                    router.get(
                        route("estudiantes.inactivos.sisge.index"),
                        { ...filters, search: searchTerm, page: p },
                        { preserveScroll: true },
                    )
                }
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
                actions={
                    <Button
                        onClick={handlePrint}
                        
                    >
                        <Printer size={16} className="mr-2" /> REPORTE PDF
                    </Button>
                }
                footerStats={
                    <div className="text-[10px] font-black uppercase text-slate-500">
                        Pendientes:{" "}
                        <span className="bg-slate-900 text-white px-2 py-1 rounded ml-1">
                            {totals.general}
                        </span>
                    </div>
                }
            >
                <div className="h-full bg-white border border-slate-200 rounded-t-2xl overflow-hidden shadow-xl relative">
                    {isLoading && (
                        <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Loader2
                                className="animate-spin text-indigo-600 mb-2"
                                size={48}
                            />
                            <h3 className="text-xs font-black text-indigo-900 uppercase">
                                Sincronizando...
                            </h3>
                        </div>
                    )}
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-20 bg-slate-900 text-white uppercase text-[10px] font-black italic">
                                <tr>
                                    <th className="px-6 py-4 text-left w-[40%]">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-4 text-center w-[20%]">
                                        Grado
                                    </th>
                                    <th className="px-6 py-4 text-center w-[15%]">
                                        Movimiento
                                    </th>
                                    <th className="px-6 py-4 text-center w-[15%]">
                                        Status SISGE
                                    </th>
                                    <th className="px-6 py-4 text-center w-[10%]">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                {datos.data.length > 0 ? (
                                    datos.data.map((student) => (
                                        <tr
                                            key={student.ep_uid}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 ${student.sexo === "M" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-pink-50 text-pink-600 border-pink-200"}`}
                                                    >
                                                        {student.name.charAt(0)}
                                                        {student.apellido.charAt(
                                                            0,
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800 uppercase text-[12px]">
                                                            {student.name}{" "}
                                                            {student.apellido}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-500 font-mono">
                                                            <IdCard
                                                                size={10}
                                                                className="inline mr-1"
                                                            />
                                                            {student.cedula}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center font-black text-slate-700 uppercase">
                                                {student.nombre_del_grado}{" "}
                                                {student.seccion &&
                                                    `- ${student.seccion}`}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                {getStatusBadge(
                                                    student.status_sisge,
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border bg-red-50 text-red-600 border-red-200">
                                                    <XCircle size={10} />{" "}
                                                    Pendiente
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setCopyStudent(
                                                                student,
                                                            );
                                                            setCopyModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-2 rounded-lg bg-amber-500 text-white shadow-sm hover:scale-105 transition-transform"
                                                    >
                                                        <ClipboardList
                                                            size={14}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(
                                                                student,
                                                            )
                                                        }
                                                        className="p-2 bg-indigo-500 text-white rounded-lg shadow-sm hover:scale-105 transition-transform"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            updateMatriculaSisge(
                                                                student,
                                                            )
                                                        }
                                                        className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm hover:scale-105 transition-transform"
                                                    >
                                                        <CheckCircle2
                                                            size={14}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="py-20 text-center"
                                        >
                                            <Search
                                                size={48}
                                                className="mx-auto text-slate-300"
                                            />
                                            <p className="text-[10px] font-black text-slate-300 uppercase mt-4">
                                                Sin registros pendientes
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL EDITAR */}
                {isEditModalOpen &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                            <div className="bg-white rounded-[2rem] w-full max-w-2xl p-10 shadow-2xl relative">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-transform hover:rotate-90"
                                >
                                    <X size={28} />
                                </button>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-8">
                                    Editar Ficha SISGE
                                </h3>
                                <form
                                    onSubmit={handleUpdate}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <Field
                                        label="Nombres *"
                                        value={formEdit.data.name}
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
                                        label="Cédula *"
                                        value={formEdit.data.cedula}
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "cedula",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        required
                                    />
                                    <Field
                                        label="Fecha Nac. *"
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
                                        required
                                    />
                                    <SelectField
                                        label="Género *"
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
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        loading={formEdit.processing}
                                        className="col-span-full h-14 bg-indigo-600 rounded-xl font-black"
                                    >
                                        GUARDAR CAMBIOS
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL COPIADO */}
                {copyModalOpen && copyStudent && (
                    <CopyPanelModal
                        student={copyStudent}
                        onClose={() => {
                            setCopyModalOpen(false);
                            setCopyStudent(null);
                        }}
                    />
                )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
