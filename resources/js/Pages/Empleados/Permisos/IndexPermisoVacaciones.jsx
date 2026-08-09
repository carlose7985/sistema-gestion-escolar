import React, { useState, useRef, useEffect } from "react"; // ← Cambia useEffect por useRef
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import {
    Field,
    SelectField,
} from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";

export default function VacacionesIndex({ datos, filters }) {
    const [editItem, setEditItem] = useState(null);
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const searchTimer = useRef(null);

    // Formulario para edición
    const { data, setData, put, processing, reset } = useForm({
        fecha_de_inicio: "",
        fecha_final: "",
        descripcion: "",
    });

    // --- VIGILANTE DE PAGINACIÓN ---
    useEffect(() => {
        if (
            datos.data.length === 0 &&
            datos.total > 0 &&
            datos.current_page > 1
        ) {
            router.get(
                route("empleados.inactivos.permisos.vacaciones.index"),
                { page: datos.last_page, search: localSearch }, // ← Cambia filters.search por localSearch
                { preserveState: true },
            );
        }
    }, [datos]);

    // Función de búsqueda corregida
    const handleSearch = (val) => {
        setLocalSearch(val);

        if (searchTimer.current) clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => {
            router.get(
                route("empleados.inactivos.permisos.vacaciones.index"),
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

    // --- FUNCIÓN CORREGIDA: FORMATEO DE FECHA PARA EL INPUT ---
    const openEdit = (p) => {
        setEditItem(p);
        setData({
            fecha_de_inicio: dayjs(p.fecha_de_inicio).format("YYYY-MM-DD"),
            fecha_final: dayjs(p.fecha_final).format("YYYY-MM-DD"),
            descripcion: p.descripcion,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route("empleados.inactivos.permisos.vacaciones.update", editItem.id), {
            onSuccess: () => {
                setEditItem(null);
                reset();
            },
        });
    };

    // REPORTE GENERAL
    const handleReporteAnual = () => {
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
                const soloActivos =
                    document.getElementById("solo-activos-general")?.checked ||
                    false;

                handlePrint({
                    type: "historial-vacaciones-general",
                    desde: res.value.desde,
                    hasta: res.value.hasta,
                    filter: soloActivos ? "Activo" : "Todos",
                });
            }
        });
    };

    // REPORTE INDIVIDUAL
    const handleReporteIndividual = (p) => {
        Swal.fire({
            title: "Historial de Permisos",
            html: `
            <div class="text-center p-4">
                <p class="font-black text-blue-600 uppercase text-xs mb-6">${p.empleados.nombres} ${p.empleados.apellidos}</p>
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

                const idEmpleado = p.empleado_id || p.empleados.id;

                handlePrint({
                    type: "historial-vacaciones-individual",
                    empleadoId: idEmpleado,
                    desde: res.value.desde,
                    hasta: res.value.hasta,
                    filter: soloActivos ? "Activo" : "Todos",
                });
            }
        });
    };

    // FUNCIÓN UNIFICADA DE IMPRESIÓN
    const handlePrint = (params) => {
        const searchParams = new URLSearchParams();

        if (params.type) searchParams.append("type", params.type);
        if (params.desde) searchParams.append("desde", params.desde);
        if (params.hasta) searchParams.append("hasta", params.hasta);
        if (params.empleadoId)
            searchParams.append("empleadoId", params.empleadoId);
        if (params.filter) searchParams.append("filter", params.filter);

        const baseUrl = route("ExportDocumentosEmpleados");
        const url = `${baseUrl}?${searchParams.toString()}`;

        console.log("🔍 Parámetros enviados:", params);
        console.log("🔗 URL generada:", url);

        window.open(url, "_blank");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Control de Vacaciones" />

            <ViewContainer
                title="Control de Vacaciones"
                subtitle="Seguimiento de periodos libres y retornos del personal"
                icon="Umbrella"
                onSearch={handleSearch}
                searchValue={localSearch} // ← Cambia filters.search por localSearch
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("empleados.inactivos.permisos.vacaciones.index"),
                        {
                            page,
                            search: localSearch, // ← Cambia filters.search por localSearch
                        },
                    )
                }
                footerStats={
                    <span>
                        Personal de Vacaciones:{" "}
                        <b className="text-purple-600">{datos.total}</b>
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
                        onClick={handleReporteAnual}
                        variant="primary"
                        className="bg-purple-600 hover:bg-purple-700 shadow-purple-200 gap-2"
                    >
                        <Icons.FileClock size={16} /> REPORTE ANUAL
                    </Button>
                }
            >
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest italic z-10 shadow-md">
                                <tr>
                                    <th className="p-5 border-r border-purple-500">
                                        Personal
                                    </th>
                                    <th className="p-5 border-r border-purple-500">
                                        Tipo de Periodo
                                    </th>
                                    <th className="p-5 border-r border-purple-500 text-center">
                                        Rango de Fechas
                                    </th>
                                    <th className="p-5 border-r border-purple-500 text-center">
                                        Estatus
                                    </th>
                                    <th className="p-5 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-500 uppercase">
                                {datos.data.length > 0 ? (
                                    datos.data.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-slate-100 hover:bg-purple-50/30 transition-colors group"
                                        >
                                            <td className="p-5 border-r border-slate-50 bg-slate-50/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-purple-600 transition-colors">
                                                        <Icons.UserCircle
                                                            size={22}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-900 font-black text-xs leading-none mb-1">
                                                            {
                                                                p.empleados
                                                                    .nombres
                                                            }
                                                            {" "}
                                                            {
                                                                p.empleados
                                                                    .apellidos
                                                            }
                                                            
                                                           
                                                        </p>
                                                        <p className="text-[9px] text-slate-400 italic font-bold font-mono">
                                                            C.I:{" "}
                                                            {p.empleados.cedula}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 border-r border-slate-50">
                                                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 text-[9px] font-black uppercase tracking-tighter">
                                                    {p.descripcion}
                                                </span>
                                            </td>
                                            <td className="p-5 border-r border-slate-50 text-center font-mono text-[12px]">
                                                <span className="text-indigo-600">
                                                    {dayjs(
                                                        p.fecha_de_inicio,
                                                    ).format("DD/MM/YYYY")}
                                                </span>
                                                <span className="mx-2 text-slate-300 font-thin">
                                                    /
                                                </span>
                                                <span className="text-rose-500">
                                                    {dayjs(
                                                        p.fecha_final,
                                                    ).format("DD/MM/YYYY")}
                                                </span>
                                            </td>
                                            <td className="p-5 border-r border-slate-50 text-center">
                                                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-100 shadow-sm">
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            handleReporteIndividual(
                                                                p,
                                                            )
                                                        }
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 bg-white text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white shadow-sm transition-all"
                                                    >
                                                        <Icons.Printer
                                                            size={16}
                                                        />
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            openEdit(p)
                                                        }
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 bg-white text-purple-600 rounded-xl border border-purple-100 hover:bg-purple-600 hover:text-white shadow-sm transition-all"
                                                    >
                                                        <Icons.Edit3
                                                            size={16}
                                                        />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-24 text-center italic text-slate-400 font-bold uppercase tracking-widest opacity-30"
                                        >
                                            No hay vacaciones activas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>

            {/* MODAL DE EDICIÓN CON CARGA DE DATOS CORREGIDA */}
            <AnimatePresence>
                {editItem && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
                        onClick={() => setEditItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative border-4 border-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-purple-600 p-8 text-white relative">
                                <div className="flex items-center gap-3">
                                    <Icons.Umbrella size={28} />
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">
                                            Reajustar Vacaciones
                                        </h3>
                                        {/* Mostramos nombre del empleados en edición */}
                                        <p className="text-purple-200 text-[10px] font-black mt-1 uppercase tracking-widest">
                                            Personal:{" "}
                                            {editItem.empleados.nombres}{" "}
                                            {editItem.empleados.apellidos}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditItem(null)}
                                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
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
                                        label="Nueva Salida"
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
                                    label="Tipo de Vacación"
                                    value={data.descripcion}
                                    options={[
                                        "Vacaciones Regulares",
                                        "Adelanto de Vacaciones",
                                        "Días pendientes",
                                        "Vacaciones Colectivas",
                                    ]}
                                    onChange={(e) =>
                                        setData("descripcion", e.target.value)
                                    }
                                    required
                                />
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setEditItem(null)}
                                        className="flex-1 font-bold text-slate-400"
                                    >
                                        CANCELAR
                                    </Button>
                                    <Button type="submit" loading={processing}>
                                        GUARDAR CAMBIOS
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
