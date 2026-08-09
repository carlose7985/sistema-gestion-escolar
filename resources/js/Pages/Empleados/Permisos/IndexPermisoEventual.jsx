import React, { useRef, useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { AnimatePresence, motion } from "framer-motion";

export default function ListadoEventual({ datos, filters }) {
    // Función para calcular días exactos entre fechas
    const calcularDias = (inicio, fin) => {
        const d1 = dayjs(inicio);
        const d2 = dayjs(fin);
        return d2.diff(d1, "day") + 1;
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const {
        data,
        setData,
        put,
        processing: isUpdating,
        reset: resetEdit,
    } = useForm({
        id: null,
        fecha_de_inicio: "",
        fecha_final: "",
        descripcion: "",
    });

    // Cambia el useState inicial
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const searchTimer = useRef(null); // Añade este ref

    const { flash } = usePage().props;
    const [showWaModal, setShowWaModal] = useState(false);
    const [waData, setWaData] = useState(null);

    useEffect(() => {
        console.log("Flash recibido:", flash); // 👈 Agrega este log para depurar
        if (flash?.whatsapp_message) {
            setWaData(flash.whatsapp_message);
            setShowWaModal(true);
        }
    }, [flash]);

    // Reemplaza la función handleSearch
    const handleSearch = (val) => {
        setLocalSearch(val);

        if (searchTimer.current) clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => {
            router.get(
                route("empleados.inactivos.permisos.eventuales.index"),
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

    const openEditModal = (p) => {
        setData({
            id: p.id,
            fecha_de_inicio: p.fecha_de_inicio,
            fecha_final: p.fecha_final,
            descripcion: p.descripcion,
            nombres: p.empleados?.nombres,
            apellidos: p.empleados?.apellidos,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route("empleados.inactivos.permisos.eventuales.update", data.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                // toast.success("Periodo ajustado");
            },
        });
    };

    // FUNCIÓN UNIFICADA DE IMPRESIÓN
    const handlePrint = (params) => {
        // Construir query string manualmente
        const searchParams = new URLSearchParams();

        // Agregar cada parámetro
        if (params.type) searchParams.append("type", params.type);
        if (params.desde) searchParams.append("desde", params.desde);
        if (params.hasta) searchParams.append("hasta", params.hasta);
        if (params.empleadoId)
            searchParams.append("empleadoId", params.empleadoId);
        if (params.filter) searchParams.append("filter", params.filter);

        const baseUrl = route("ExportDocumentosEmpleados");
        const url = `${baseUrl}?${searchParams.toString()}`;

        // Abrir en nueva pestaña
        window.open(url, "_blank");
    };

    // REPORTE GENERAL
    const handleReporteGeneral = () => {
        Swal.fire({
            title: "Reporte General de Permisos",
            html: `
            <div class="text-left space-y-4 p-2">
                <p class="text-[10px] font-black text-slate-400 uppercase">Seleccione Rango de Consulta:</p>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase">Desde</label>
                        <input id="desde" type="date" class="swal2-input !m-0 !w-full !rounded-xl !text-xs font-bold" value="${dayjs().startOf("month").format("YYYY-MM-DD")}">
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase">Hasta</label>
                        <input id="hasta" type="date" class="swal2-input !m-0 !w-full !rounded-xl !text-xs font-bold" value="${dayjs().format("YYYY-MM-DD")}">
                    </div>
                </div>
                
                <div class="flex items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span class="text-[10px] font-black text-slate-400 uppercase">¿Solo Activos?</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="solo-activos-general" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
            </div>
        `,
            confirmButtonText: "GENERAR PDF",
            showCancelButton: true,
            confirmButtonColor: "#4f46e5",
            customClass: { popup: "rounded-[2.5rem] p-10" },
            preConfirm: () => {
                const desde = document.getElementById("desde").value;
                const hasta = document.getElementById("hasta").value;

                if (!desde || !hasta) {
                    Swal.showValidationMessage("Debe seleccionar ambas fechas");
                    return false;
                }

                return { desde, hasta };
            },
        }).then((res) => {
            if (res.isConfirmed) {
                // Capturamos el estado del checkbox
                const soloActivos =
                    document.getElementById("solo-activos-general")?.checked ||
                    false;

                handlePrint({
                    type: "historial-de-permisos-generales",
                    desde: res.value.desde,
                    hasta: res.value.hasta,
                    filter: soloActivos ? "Activo" : "Todos",
                });
            }
        });
    };

    // REPORTE INDIVIDUAL
    const handleReporteIndividual = (empleado) => {
        Swal.fire({
            title: "Historial de Permisos",
            html: `
            <div class="text-center p-4">
                <p class="font-black text-blue-600 uppercase text-xs mb-6">${empleado.nombres} ${empleado.apellidos}</p>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase">Desde</label>
                            <input id="desde-individual" type="date" class="swal2-input !m-0 !w-full !rounded-xl !text-xs font-bold" value="${dayjs().startOf("year").format("YYYY-MM-DD")}">
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase">Hasta</label>
                            <input id="hasta-individual" type="date" class="swal2-input !m-0 !w-full !rounded-xl !text-xs font-bold" value="${dayjs().format("YYYY-MM-DD")}">
                        </div>
                    </div>
                    <div class="flex items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <span class="text-[10px] font-black text-slate-400 uppercase">¿Solo Activos?</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="solo-activos" class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
            </div>
        `,
            confirmButtonText: "PROCESAR PDF",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            customClass: { popup: "rounded-[2.5rem]" },
            preConfirm: () => {
                const desde = document.getElementById("desde-individual").value;
                const hasta = document.getElementById("hasta-individual").value;

                if (!desde || !hasta) {
                    Swal.showValidationMessage("Debe seleccionar ambas fechas");
                    return false;
                }

                return { desde, hasta };
            },
        }).then((res) => {
            if (res.isConfirmed) {
                const soloActivos =
                    document.getElementById("solo-activos")?.checked || false;

                console.log("👤 Empleado:", empleado.id, empleado.nombres); // Debug
                console.log("📅 Fechas:", res.value); // Debug

                handlePrint({
                    type: "historial-de-permisos",
                    empleadoId: empleado.id,
                    desde: res.value.desde,
                    hasta: res.value.hasta,
                    filter: soloActivos ? "Activo" : "Todos",
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Listado de Permisos" />
            <ViewContainer
                title="Gestión de Permisos Eventuales"
                subtitle="Control y Actualización de Permisos Eventuales"
                icon="Hospital"
                onSearch={handleSearch}
                searchValue={localSearch} // ← Cambia de filters.search a localSearch
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={(p) =>
                    router.get(
                        route("empleados.inactivos.permisos.eventuales.index"),
                        {
                            page: p,
                            search: localSearch, // ← Cambia a localSearch
                        },
                    )
                }
                footerStats={
                    <span>
                        Registros en vista:{" "}
                        <b className="text-indigo-600">{datos.total}</b>
                    </span>
                }
                returns={
                    <Link href={route("empleados.inactivos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={14} /> VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    <Button
                        onClick={handleReporteGeneral}
                        variant="primary"
                        size="sm"
                        className="bg-indigo-600 gap-2"
                    >
                        <Icons.FileClock size={16} /> REPORTE GENERAL
                    </Button>
                }
            >
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest italic z-20">
                                <tr>
                                    <th className="p-5 border-r border-blue-500">
                                        Personal
                                    </th>
                                    <th className="p-5 border-r border-blue-500">
                                        Motivo
                                    </th>
                                    <th className="p-5 border-r border-blue-500 text-center">
                                        Periodo
                                    </th>
                                    <th className="p-5 border-r border-blue-500 text-center">
                                        Estatus
                                    </th>
                                    <th className="p-5 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-500 uppercase">
                                {datos.data.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="p-3 border-r border-slate-50 bg-slate-50/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                    <Icons.UserCircle
                                                        size={20}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 font-black text-xs leading-none mb-1">
                                                        {p.empleados?.nombres ||
                                                            "N/A"}{" "}
                                                        {p.empleados
                                                            ?.apellidos || ""}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 italic font-bold">
                                                        C.I:{" "}
                                                        {p.empleados?.cedula ||
                                                            p.empleados
                                                                ?.documento ||
                                                            "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 border-r border-slate-50 font-black text-slate-600">
                                            {p.descripcion}
                                        </td>
                                        <td className="p-3 border-r border-slate-50 text-center">
                                            <div className="font-mono text-[12px] flex items-center justify-center gap-2">
                                                <span className="text-indigo-600">
                                                    {p.fecha_de_inicio
                                                        ? dayjs(
                                                              p.fecha_de_inicio,
                                                          ).format("DD/MM/YY")
                                                        : "--/--/--"}
                                                </span>
                                                <span className="text-slate-300 font-thin">
                                                    ||
                                                </span>
                                                <span className="text-rose-500">
                                                    {p.fecha_final
                                                        ? dayjs(
                                                              p.fecha_final,
                                                          ).format("DD/MM/YY")
                                                        : "--/--/--"}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                TOTAL:{" "}
                                                {p.fecha_de_inicio &&
                                                p.fecha_final
                                                    ? calcularDias(
                                                          p.fecha_de_inicio,
                                                          p.fecha_final,
                                                      )
                                                    : 0}{" "}
                                                DÍA(S)
                                            </p>
                                        </td>
                                        <td className="p-3 border-r border-slate-50 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-lg border-2 text-[9px] font-black ${
                                                    p.color === "emerald"
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-rose-50 text-rose-600 border-rose-100"
                                                }`}
                                            >
                                                {p.status_real || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                {p.empleados && (
                                                    <Button
                                                        onClick={() =>
                                                            handleReporteIndividual(
                                                                p.empleados,
                                                            )
                                                        }
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 bg-slate-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Icons.Printer
                                                            size={16}
                                                        />
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() =>
                                                        openEditModal(p)
                                                    }
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Icons.Edit3 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>
            <AnimatePresence>
                {showWaModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 text-center shadow-3xl border-4 border-white"
                        >
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Icons.MessageCircle size={40} />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">
                                Enviar Comprobante
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-6">
                                Notificar al trabajador sobre su permiso
                            </p>

                            <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                                    Trabajador
                                </p>
                                <p className="text-sm font-black text-slate-800 uppercase">
                                    {waData?.destinatario}
                                </p>
                                <p className="text-[10px] font-bold text-emerald-600 font-mono">
                                    {waData?.numero}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => {
                                        window.open(waData.url, "_blank");
                                        setShowWaModal(false);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-emerald-200"
                                >
                                    <Icons.Send size={16} className="mr-2" />{" "}
                                    ENVIAR COMPROBANTE
                                </Button>

                                <button
                                    onClick={() => setShowWaModal(false)}
                                    className="py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                >
                                    Omitir envío
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* MODAL DE EDICIÓN */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border-4 border-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Icons.CalendarRange size={28} />
                                    <div>
                                        <h3 className="font-black uppercase italic text-sm leading-none">
                                            Ajustar Periodo
                                        </h3>
                                        <p className="text-[11px] font-black opacity-90 mt-1 uppercase tracking-tighter">
                                            Personal: {data.nombres}{" "}
                                            {data.apellidos}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Icons.X size={24} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleUpdate}
                                className="p-8 space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Nuevo Inicio"
                                        type="date"
                                        value={data.fecha_de_inicio}
                                        onChange={(e) =>
                                            setData(
                                                "fecha_de_inicio",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Field
                                        label="Nuevo Retorno"
                                        type="date"
                                        value={data.fecha_final}
                                        onChange={(e) =>
                                            setData(
                                                "fecha_final",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <SelectField
                                    label="Modificar Motivo"
                                    value={data.descripcion}
                                    options={[
                                        "Permiso médico",
                                        "Permiso por cuido",
                                        "Permiso pre-post",
                                        "Permiso solicitado",
                                    ]}
                                    onChange={(e) =>
                                        setData("descripcion", e.target.value)
                                    }
                                    required
                                />

                                <div className="flex flex-col gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        loading={isUpdating}
                                        variant="primary"
                                    >
                                        GUARDAR CAMBIOS
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditModalOpen(false)
                                        }
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors py-2"
                                    >
                                        Cancelar sin cambios
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
