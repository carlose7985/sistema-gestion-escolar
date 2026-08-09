import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import { debounce } from "lodash";
import {
    Printer,
    Search,
    Users,
    ChevronLeftCircle,
    X,
    PrinterCheck,
    UserX,
    UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";

export default function GestionCeremonia({ seleccionados, filters }) {
    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [chunkSize, setChunkSize] = useState(6);
    const isTyping = useRef(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);

    // --- LÓGICA DE BÚSQUEDA ---
    const handleSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.acciones.graduandos.index"),
                { search: query, page: 1 },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 400),
        [],
    );

    useEffect(() => {
        if (!isTyping.current) setSearchTerm(filters?.search || "");
    }, [filters.search]);

    const onSearchChange = (val) => {
        isTyping.current = true;
        setSearchTerm(val);
        handleSearch(val);
        if (val === "") isTyping.current = false;
    };

    // --- MANEJADOR DE PAGINACIÓN ---
    const onPageChange = (page) => {
        router.get(
            route("estudiantes.acciones.graduandos.index"),
            { search: searchTerm, page: page },
            { preserveState: true, preserveScroll: true },
        );
    };

    // --- MARCAR COMO NO ASISTIRÁ ---
    const marcarNoAsistira = (estudiante) => {
        setSelectedEstudiante(estudiante);

        Swal.fire({
            title: `<span class="text-slate-800 font-black uppercase italic">¿Confirmar cambio?</span>`,
            html: `
                <div class="text-left text-sm p-2">
                    <p class="font-medium text-slate-500 mb-4">
                        El estudiante <span class="font-black text-indigo-600">${estudiante.name} ${estudiante.apellido}</span> 
                        ya no asistirá al Acto de Grado.
                    </p>
                    <div class="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4">
                        <p class="text-[10px] font-black uppercase text-amber-700 mb-1">⚠️ Acción irreversible</p>
                        <p class="text-xs font-bold text-slate-600">
                            El estudiante será removido de la lista de graduandos.
                        </p>
                    </div>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, NO ASISTIRÁ",
            cancelButtonText: "CANCELAR",
            confirmButtonColor: "#ef4444",
            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                confirmButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] tracking-widest",
                cancelButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] tracking-widest",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: '<span class="text-slate-800 font-black uppercase italic">Procesando...</span>',
                    html: `
                        <div class="flex flex-col items-center justify-center py-4">
                            <div class="relative">
                                <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                            <p class="text-sm font-bold text-slate-500 mt-4">
                                Actualizando información...
                            </p>
                        </div>
                    `,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    customClass: {
                        popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                    },
                });

                router.patch(
                    route(
                        "estudiantes.acciones.graduandos.update",
                        estudiante.id,
                    ),
                    {},
                    {
                        onSuccess: () => {
                            Swal.close();
                            toast.success(
                                `✅ ${estudiante.name} ${estudiante.apellido} marcado como NO ASISTIRÁ`,
                            );
                            setTimeout(() => {
                                window.location.reload();
                            }, 800);
                        },
                        onError: (errors) => {
                            Swal.fire({
                                icon: "error",
                                title: '<span class="text-slate-800 font-black uppercase italic">Error</span>',
                                html: `
                                    <p class="text-sm font-bold text-slate-500">
                                        ${errors.message || "Ocurrió un error al actualizar"}
                                    </p>
                                `,
                                confirmButtonText: "ACEPTAR",
                                confirmButtonColor: "#ef4444",
                                customClass: {
                                    popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                                    confirmButton:
                                        "rounded-xl px-6 py-3 font-black text-[10px] tracking-widest",
                                },
                            });
                        },
                    },
                );
            }
        });
    };

    // --- IMPRESIÓN ---
    const handlePrint = () => {
        if (seleccionados.length === 0) {
            return toast.warning(
                "No hay estudiantes en la lista de graduandos.",
            );
        }
        setShowPrintModal(true);
    };

    const confirmPrint = () => {
        if (chunkSize < 1 || chunkSize > 20) {
            toast.error("El número debe estar entre 1 y 20");
            return;
        }

        window.open(
            route("estudiantes.acciones.graduandos.imprimir", {
                chunk: chunkSize,
            }),
            "_blank",
        );
        setShowPrintModal(false);
    };

    // --- MODAL DE IMPRESIÓN ---
    const PrintModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider">
                            Configurar Impresión
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Selecciona cuántos estudiantes agrupar por página
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPrintModal(false)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                            Estudiantes por grupo
                        </label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 rounded-xl text-lg font-bold"
                                onClick={() =>
                                    setChunkSize(Math.max(1, chunkSize - 1))
                                }
                            >
                                -
                            </Button>
                            <input
                                type="number"
                                value={chunkSize}
                                onChange={(e) =>
                                    setChunkSize(Number(e.target.value))
                                }
                                min="1"
                                max="20"
                                className="w-20 h-10 text-center text-lg font-bold border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 rounded-xl text-lg font-bold"
                                onClick={() =>
                                    setChunkSize(Math.min(20, chunkSize + 1))
                                }
                            >
                                +
                            </Button>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {[4, 5, 6, 7, 8].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setChunkSize(num)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                        chunkSize === num
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-600">
                            <span className="font-bold">
                                Total estudiantes:
                            </span>{" "}
                            {seleccionados.length}
                        </p>
                        <p className="text-xs text-slate-600">
                            <span className="font-bold">Grupos a generar:</span>{" "}
                            {Math.ceil(seleccionados.length / chunkSize)}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold"
                            onClick={() => setShowPrintModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700"
                            onClick={confirmPrint}
                            disabled={seleccionados.length === 0}
                        >
                            <Printer size={16} className="mr-2" />
                            Imprimir
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Listado Graduandos" />

            <ViewContainer
                title="ESTUDIANTES GRADUANDOS"
                subtitle="Listado de estudiantes de 6to Grado que asisten al Acto de Grado"
                icon="GraduationCap"
                showSearch={true}
                searchValue={searchTerm}
                onSearch={onSearchChange}
                currentPage={seleccionados.current_page || 1}
                totalPages={seleccionados.last_page || 1}
                onPageChange={onPageChange}
                returns={
                    <Link href={route("estudiantes.acciones.index")}>
                        <Button>
                            <ChevronLeftCircle size={16} className="mr-2" />
                            VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    seleccionados.length > 0 && (
                        <Button variant="warning" onClick={handlePrint}>
                            <PrinterCheck size={16} className="mr-2" />
                            IMPRIMIR LISTADO
                        </Button>
                    )
                }
            >
                <div className="flex flex-col h-full gap-4 p-1">
                    {/* TABLA DE SELECCIONADOS */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left text-[10px] font-black uppercase text-slate-500 px-4 py-3">
                                            #
                                        </th>
                                        <th className="text-left text-[10px] font-black uppercase text-slate-500 px-4 py-3">
                                            Nombres y Apellidos
                                        </th>
                                        <th className="text-left text-[10px] font-black uppercase text-slate-500 px-4 py-3">
                                            Cédula
                                        </th>
                                        <th className="text-left text-[10px] font-black uppercase text-slate-500 px-4 py-3">
                                            Grado/Sección
                                        </th>
                                        <th className="text-left text-[10px] font-black uppercase text-slate-500 px-4 py-3">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {seleccionados.data?.map((est, index) => {
                                        const numeroPagina =
                                            (seleccionados.current_page - 1) *
                                                seleccionados.per_page +
                                            index +
                                            1;
                                        return (
                                            <tr
                                                key={est.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 text-xs text-slate-400 font-bold">
                                                    {numeroPagina}
                                                </td>
                                                <td className="px-4 py-4 text-slate-800 text-[16px] font-bold">
                                                    {est.apellido
                                                        ? `${est.name} ${est.apellido}`
                                                        : est.name}
                                                </td>
                                                <td className="px-4 py-4 text-[16px] text-slate-900 font-mono">
                                                    {est.cedula}
                                                </td>
                                                <td className="px-4 py-4 text-[16px] text-slate-900">
                                                    {est.nombre_del_grado ||
                                                        "6to Grado"}{" "}
                                                    {est.seccion
                                                        ? `"${est.seccion}"`
                                                        : ""}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button
                                                        onClick={() =>
                                                            marcarNoAsistira(
                                                                est,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-1 bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300"
                                                        title="Marcar como NO ASISTIRÁ"
                                                    >
                                                        <UserCheck size={12} />
                                                        Asistirá ✅
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {seleccionados.data?.length === 0 && (
                            <div className="py-16 text-center">
                                <Users
                                    size={48}
                                    className="mx-auto text-slate-300 mb-3"
                                />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    No hay estudiantes graduandos
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    Todos los estudiantes han confirmado
                                    asistencia
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL DE IMPRESIÓN */}
                {showPrintModal && <PrintModal />}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
