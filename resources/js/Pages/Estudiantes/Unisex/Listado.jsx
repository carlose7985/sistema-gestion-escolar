// resources/js/Pages/Recursos/Unisex/Listado.jsx

import React, { useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/Ui/Button";
import { Head, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs";
import { confirmDelete } from "@/Utils/confirmDelete";
import Swal from "sweetalert2";

export default function Listado({ registros, filters }) {
    const handleDeleteAll = useCallback(() => {
        Swal.fire({
            title: "⚠️ ¿ESTÁS SEGURO DE ELIMINAR TODOS LOS REGISTROS?",
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p style="color: #ef4444; font-weight: bold; font-size: 16px;">
                        ¡Esta acción es IRREVERSIBLE!
                    </p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                        Se eliminarán <strong>TODOS</strong> los registros de la tabla de forma permanente.
                    </p>
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-top: 15px;">
                        <p style="color: #dc2626; font-size: 13px; margin: 0;">
                            <span style="font-weight: bold;">📌 Nota:</span> Esta operación no se puede deshacer.
                        </p>
                    </div>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "🗑️ SÍ, ELIMINAR TODO",
            cancelButtonText: "❌ CANCELAR",
            reverseButtons: true,
            backdrop: "rgba(0,0,0,0.7)",
            width: 500,
            padding: "2rem",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise((resolve) => {
                    router.delete(
                        route("estudiantes.acciones.unisex.eliminar"),
                        {
                            preserveScroll: true,
                            onSuccess: (page) => {
                                resolve({ success: true, page });
                            },
                            onError: (errors) => {
                                Swal.showValidationMessage(
                                    `❌ Hubo un error procesando la solicitud.`,
                                );
                                resolve(false);
                            },
                        },
                    );
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            allowEscapeKey: () => !Swal.isLoading(),
            didOpen: () => {
                const loader = Swal.getLoader();
                if (loader) {
                    loader.style.border = "4px solid #e5e7eb";
                    loader.style.borderTop = "4px solid #3b82f6";
                    loader.style.borderRight = "4px solid #22c55e";
                    loader.style.borderBottom = "4px solid #eab308";
                    loader.style.borderLeft = "4px solid #ef4444";
                    loader.style.borderRadius = "50%";
                    loader.style.width = "48px";
                    loader.style.height = "48px";
                    loader.style.animation = "spin 0.8s linear infinite";
                }
            },
        }).then((result) => {
            if (result.isConfirmed && result.value?.success) {
                // El éxito se maneja con el redirect del controlador
            }
        });
    }, []);

    const handleDelete = (id, nombre) => {
        confirmDelete(
            route("estudiantes.acciones.unisex.destroy", id),
            `¿Eliminar este registro?`,
            `Vas a remover de forma definitiva el registro de: ${nombre}`,
        );
    };

    // --- MANEJADOR DE PAGINACIÓN ---
    const onPageChange = (page) => {
        router.get(
            route("estudiantes.acciones.unisex.listado"),
            {
                search: filters?.search || "",
                page: page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Registrados Unisex" />
            <ViewContainer
                title="Historial de registrados"
                subtitle="Listado general registrados"
                icon="ClipboardCheck"
                onSearch={(v) =>
                    router.get(
                        route("estudiantes.acciones.unisex.listado"),
                        { search: v },
                        { preserveState: true },
                    )
                }
                searchValue={filters?.search || ""}
                currentPage={registros.current_page}
                totalPages={registros.last_page}
                onPageChange={onPageChange}
                actions={
                    <>
                        <Link href={route("estudiantes.acciones.unisex.index")}>
                            <Button>
                                <Icons.ArrowLeft size={16} /> VOLVER A
                                PENDIENTES
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            asChild
                            size="sm"
                            className="bg-indigo-600 shadow-indigo-200"
                        >
                            <a
                                href={route(
                                    "estudiantes.acciones.unisex.imprimir",
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Icons.Printer size={16} className="mr-2" />
                                IMPRIMIR POR SERIES
                            </a>
                        </Button>
                        <Button
                            variant="warning"
                            onClick={handleDeleteAll}
                            className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                        >
                            <Icons.Trash2 size={16} className="mr-2" />
                            Eliminar todos los registros
                        </Button>
                    </>
                }
                actionFooter={
                    <span className="text-[10px] font-black uppercase italic text-slate-400">
                        Total Procesados:{" "}
                        <b className="text-emerald-600">{registros.total}</b>
                    </span>
                }
            >
                <div className="bg-white rounded-t-[1.5rem] border border-emerald-50 shadow-xl overflow-hidden">
                    <table className="w-full text-left select-text">
                        <thead className="bg-slate-900 text-white text-[9px] font-black uppercase italic tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Estudiante</th>

                                <th className="px-8 py-5">Responsable Legal</th>
                                {/* <th className="px-8 py-5">Alterno</th> */}
                                <th className="px-8 py-5 text-right">
                                    Fecha Registro
                                </th>
                                <th className="px-8 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] font-bold text-slate-600 uppercase divide-y divide-slate-500">
                            {registros.data.map((reg) => (
                                <tr
                                    key={reg.id}
                                    className="hover:bg-emerald-50/30 transition-all group"
                                >
                                    <td className="px-8 py-2">
                                        <p className="text-slate-900 font-black text-xs">
                                            {reg.estudiante?.name}{" "}
                                            {reg.estudiante?.apellido}
                                        </p>
                                        <p className="text-emerald-600 font-bold text-xs">
                                            {reg.grado ? (
                                                <>
                                                    {reg.grado.nombre_del_grado}
                                                    {reg.grado.seccion &&
                                                        ` - ${reg.grado.seccion}`}
                                                </>
                                            ) : (
                                                "Sin grado"
                                            )}
                                        </p>
                                    </td>

                                    <td className="px-8 py-2">
                                        <div className="flex flex-col gap-1">
                                            {/* BLOQUE PRINCIPAL (Representante) */}
                                            <div className="flex flex-col border-l-2 border-indigo-200 pl-2">
                                                <p className="text-[10px] font-bold text-indigo-600 leading-tight">
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-700 font-bold mb-0.5">
                                                        Principal:
                                                    </span>{" "}
                                                    {reg.estudiante
                                                        ?.representante
                                                        ?.name_r ||
                                                        "No asignado"}{" "}
                                                </p>
                                                <p className="text-[16px] text-slate-800 font-mono">
                                                    {reg.estudiante
                                                        ?.representante
                                                        ?.cedula_r || "S/N"}
                                                </p>
                                            </div>
                                            {/* BLOQUE ALTERNO (Padre) */}
                                            <div className="flex flex-col border-l-2 border-rose-200 pl-2">
                                                <p className="text-[12px] font-bold text-rose-600 leading-tight">
                                                    <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold mb-0.5">
                                                        Alterno:{" "}
                                                    </span>
                                                    {reg.estudiante?.padre
                                                        ?.name_r ||
                                                        "No asignado"}
                                                </p>
                                                <p className="text-[16px] text-slate-800 font-mono">
                                                    {reg.estudiante?.padre
                                                        ?.cedula_r || "S/N"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-2 text-right">
                                        <div className="inline-flex flex-col items-end">
                                            <span className="text-slate-900 font-black">
                                                {dayjs(
                                                    reg.fecha_registro,
                                                ).format("DD/MM/YYYY")}
                                            </span>
                                            <span className="text-[8px] text-slate-400 font-bold italic">
                                                {dayjs(reg.created_at).format(
                                                    "hh:mm A",
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-2 text-right">
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    reg.id,
                                                    reg.estudiante?.name ||
                                                        "Estudiante",
                                                )
                                            }
                                            className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 active:scale-90 shadow-sm border border-rose-100"
                                            title="Eliminar Registro"
                                        >
                                            <Icons.Trash2
                                                size={18}
                                                strokeWidth={2.5}
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {registros.data.length === 0 && (
                        <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4">
                            <Icons.SearchX size={64} />
                            <p className="font-black uppercase tracking-widest">
                                No se encontraron registros con ese criterio
                            </p>
                        </div>
                    )}
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
