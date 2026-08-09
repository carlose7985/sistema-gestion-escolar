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

const ORDEN_DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function GestionPermisos({ datos, filters, tipoActual }) {
    const { flash } = usePage().props;

    // --- OPCIONES DE MOTIVOS SEGÚN TIPO ---
    const opcionesMotivos = {
        Eventual: [
            "Permiso Médico",
            "Permiso por Cuido",
            "Permiso Pre-Post",
            "Permiso Solicitado",
            "Otros",
        ],
        Vacacion: [
            "Vacaciones Regulares",
            "Adelanto de Vacaciones",
            "Días Pendientes",
            "Vacaciones Colectivas",
            "Otros",
        ],
        Permanente: [
            "Horario Especial",
            "Horario para Estudios",
            "Cuidado de Familiar",
            "Asignación Externa",
            "Otros",
        ],
    };

    // --- ESTADOS ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showWaModal, setShowWaModal] = useState(false);
    const [waData, setWaData] = useState(null);
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const searchTimer = useRef(null);

    const {
        data,
        setData,
        put,
        processing: isUpdating,
        reset,
    } = useForm({
        id: null,
        fecha_de_inicio: "",
        fecha_final: "",
        descripcion: "",
        dia: "", // Para eventual/vacacion
        dias: [], // Para selección múltiple en Permanente
        tipo: tipoActual,
        nombres: "",
        apellidos: "",
    });

    // --- EFECTOS ---
    useEffect(() => {
        if (flash?.whatsapp_message) {
            setWaData(flash.whatsapp_message);
            setShowWaModal(true);
        }
    }, [flash]);

    // --- FUNCIONES DE APOYO ---
    const calcularDias = (inicio, fin) => {
        if (!inicio || !fin) return 0;
        const d1 = dayjs(inicio);
        const d2 = dayjs(fin);
        return d2.diff(d1, "day") + 1;
    };

    const toggleDia = (dia) => {
        const nuevosDias = data.dias.includes(dia)
            ? data.dias.filter((d) => d !== dia)
            : [...data.dias, dia];
        setData("dias", nuevosDias);
    };

    const handleSearch = (val) => {
        setLocalSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            router.get(
                route("empleados.inactivos.permisos.index"),
                { search: val, tipo: tipoActual, page: 1 },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 400);
    };

    const changeTab = (tipo) => {
        router.get(
            route("empleados.inactivos.permisos.index"),
            { tipo, search: localSearch },
            { preserveState: true },
        );
    };

    // --- LÓGICA DE IMPRESIÓN ---
    const handlePrint = (params) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
            if (params[key]) searchParams.append(key, params[key]);
        });
        const url = `${route("ExportDocumentosEmpleados")}?${searchParams.toString()}`;
        window.open(url, "_blank");
    };

   const handleReporteGeneral = () => {
       Swal.fire({
           title: `Reporte General: ${tipoActual}s`,
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
                <!-- ID agregado al span para manipular el texto -->
                <span id="switch-label" class="text-[10px] font-black text-indigo-600 uppercase transition-colors">IMPRIMIR: SOLO ACTIVOS</span>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="solo-activos-general" class="sr-only peer" checked>
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
            </div>
        </div>`,
           confirmButtonText: "GENERAR PDF",
           showCancelButton: true,
           confirmButtonColor: "#4f46e5",
           customClass: { popup: "rounded-[2.5rem] p-10" },
           // Lógica para cambiar el texto en tiempo real
           didOpen: () => {
               const checkbox = document.getElementById("solo-activos-general");
               const label = document.getElementById("switch-label");
               checkbox.addEventListener("change", (e) => {
                   if (e.target.checked) {
                       label.innerText = "IMPRIMIR: SOLO ACTIVOS";
                       label.classList.replace(
                           "text-slate-400",
                           "text-indigo-600",
                       );
                   } else {
                       label.innerText = "IMPRIMIR: TODOS LOS REGISTROS";
                       label.classList.replace(
                           "text-indigo-600",
                           "text-slate-400",
                       );
                   }
               });
           },
           preConfirm: () => ({
               desde: document.getElementById("desde").value,
               hasta: document.getElementById("hasta").value,
               filter: document.getElementById("solo-activos-general").checked
                   ? "Activo"
                   : "Todos",
           }),
       }).then((res) => {
           if (res.isConfirmed) {
               handlePrint({
                   type: "historial-de-permisos-generales",
                   tipoPermiso: tipoActual,
                   desde: res.value.desde,
                   hasta: res.value.hasta,
                   filter: res.value.filter,
               });
           }
       });
   };

   const handleReporteIndividual = (empleado) => {
       Swal.fire({
           title: `Historial de Permisos : ${tipoActual}s`,
           html: `
        <div class="text-center p-4">
            <p class="font-black text-blue-600 uppercase text-[10px] mb-6">${empleado.nombres} ${empleado.apellidos}</p>
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase">Desde</label>
                        <input id="desde-ind" type="date" class="swal2-input !m-0 !w-full !rounded-xl !text-xs font-bold" value="${dayjs().startOf("year").format("YYYY-MM-DD")}">
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase">Hasta</label>
                        <input id="hasta-ind" type="date" class="swal2-input !m-0 !w-full !rounded-xl !text-xs font-bold" value="${dayjs().format("YYYY-MM-DD")}">
                    </div>
                </div>
                <div class="flex items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span id="switch-label-ind" class="text-[10px] font-black text-emerald-600 uppercase transition-colors">IMPRIMIR: SOLO ACTIVOS</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="solo-activos-ind" class="sr-only peer" checked>
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
            </div>
        </div>`,
           confirmButtonText: "PROCESAR PDF",
           showCancelButton: true,
           confirmButtonColor: "#10b981",
           customClass: { popup: "rounded-[2.5rem]" },
           didOpen: () => {
               const checkbox = document.getElementById("solo-activos-ind");
               const label = document.getElementById("switch-label-ind");
               checkbox.addEventListener("change", (e) => {
                   if (e.target.checked) {
                       label.innerText = "IMPRIMIR: SOLO ACTIVOS";
                       label.classList.replace(
                           "text-slate-400",
                           "text-emerald-600",
                       );
                   } else {
                       label.innerText = "IMPRIMIR: TODOS LOS REGISTROS";
                       label.classList.replace(
                           "text-emerald-600",
                           "text-slate-400",
                       );
                   }
               });
           },
           preConfirm: () => ({
               desde: document.getElementById("desde-ind").value,
               hasta: document.getElementById("hasta-ind").value,
               filter: document.getElementById("solo-activos-ind").checked
                   ? "Activo"
                   : "Todos",
           }),
       }).then((res) => {
           if (res.isConfirmed) {
               handlePrint({
                   type: "historial-de-permisos",
                   tipoPermiso: tipoActual,
                   empleadoId: empleado.id,
                   desde: res.value.desde,
                   hasta: res.value.hasta,
                   filter: res.value.filter,
               });
           }
       });
   };

    // --- LÓGICA DE EDICIÓN ---
    const openEditModal = (p) => {
        setData({
            id: p.id,
            tipo: p.tipo,
            fecha_de_inicio: p.fecha_de_inicio
                ? dayjs(p.fecha_de_inicio).format("YYYY-MM-DD")
                : "",
            fecha_final: p.fecha_final
                ? dayjs(p.fecha_final).format("YYYY-MM-DD")
                : "",
            descripcion: p.descripcion,
            dia: p.dia || "",
            // CAMBIO AQUÍ: Usamos dias_agrupados que viene del transform del controlador
            dias: p.tipo === "Permanente" ? p.dias_agrupados || [] : [],
            nombres: p.empleado?.nombres,
            apellidos: p.empleado?.apellidos,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route("empleados.inactivos.permisos.update", data.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };
    // --- Función para borrar (Agregar en el componente) ---
    const handleRevocar = (p) => {
        Swal.fire({
            title: "¿Revocar Permisos?",
            text:
                p.tipo === "Permanente"
                    ? `Se eliminarán TODOS los días fijos de ${p.empleado?.nombres}.`
                    : `Se eliminará el registro de ${p.tipo} seleccionado.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, ELIMINAR",
            confirmButtonColor: "#ef4444",
            customClass: { popup: "rounded-[2rem]" },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("empleados.inactivos.permisos.destroy", p.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Gestión de Permisos: ${tipoActual}`} />
            <ViewContainer
                title="Gestión de Permisos"
                subtitle={`Control y Actualización: ${tipoActual}s`}
                icon={
                    tipoActual === "Vacacion"
                        ? "Palmtree"
                        : tipoActual === "Permanente"
                          ? "Clock"
                          : "Hospital"
                }
                onSearch={handleSearch}
                searchValue={localSearch}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={(p) =>
                    router.get(route("empleados.inactivos.permisos.index"), {
                        page: p,
                        tipo: tipoActual,
                        search: localSearch,
                    })
                }
                returns={
                    <Link href={route("empleados.inactivos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={14} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    <div className="flex items-center gap-4">
                        {tipoActual !== "Permanente" && (
                            <Button
                                variant="success"
                                onClick={handleReporteGeneral}
                            >
                                <Icons.FileClock size={16} /> REPORTE GENERAL
                            </Button>
                        )}
                    </div>
                }
                footerStats={
                    <span>
                        Registros de {tipoActual}s:{" "}
                        <b className="text-indigo-600">{datos.total}</b>
                    </span>
                }
                extraFilters={
                    <div className="flex bg-slate-700 p-1.5 rounded-2xl shadow-inner text-gray-50">
                        {["Eventual", "Vacacion", "Permanente"].map((t) => (
                            <button
                                key={t}
                                onClick={() => changeTab(t)}
                                className={`px-5 py-2 rounded-xl mr-3 text-[10px] font-black uppercase transition-all ${tipoActual === t ? "bg-green-600 shadow-md text-gray-50 " : "text-slate-50   hover:text-slate-100 hover:bg-gray-400"}`}
                            >
                                {t}s
                            </button>
                        ))}
                    </div>
                }
            >
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left select-text">
                            <thead className="sticky top-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic z-20">
                                <tr>
                                    <th className="p-5 border-r border-slate-700">
                                        Personal / Identificación
                                    </th>
                                    <th className="p-5 border-r border-slate-700">
                                        Motivo / Descripción
                                    </th>
                                    <th className="p-5 border-r border-slate-700 text-center">
                                        Periodo / Tiempo
                                    </th>
                                    <th className="p-5 border-r border-slate-700 text-center">
                                        Estatus
                                    </th>
                                    <th className="p-5 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-500 uppercase ">
                                {datos.data.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="border-b border-slate-600 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="p-2 border-r border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <Icons.UserCircle
                                                    size={22}
                                                    className="text-slate-300"
                                                />
                                                <div>
                                                    <p className="text-slate-900 font-black">
                                                        {p.empleado?.nombres}
                                                    </p>
                                                    <p className="text-[12px] text-slate-800 font-mono italic ">
                                                        C.I:{" "}
                                                        {p.empleado?.cedula}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2 border-r border-slate-50">
                                            {p.descripcion}
                                        </td>

                                        {/* CELDA DE TIEMPO/DÍAS CORREGIDA */}
                                        <td className="p-2 border-r border-slate-50 text-center bg-slate-50/10">
                                            {p.tipo === "Permanente" ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {p.dias_agrupados
                                                        ?.sort(
                                                            (a, b) =>
                                                                ORDEN_DIAS.indexOf(
                                                                    a,
                                                                ) -
                                                                ORDEN_DIAS.indexOf(
                                                                    b,
                                                                ),
                                                        )
                                                        .map((dia, i) => (
                                                            <span
                                                                key={i}
                                                                className="bg-purple-600 text-white px-3 py-1 rounded-lg text-[9px] font-black shadow-sm"
                                                            >
                                                                {dia}
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="font-mono text-[12px] flex items-center gap-2">
                                                        <span className="text-indigo-600">
                                                            {dayjs(
                                                                p.fecha_de_inicio,
                                                            ).format(
                                                                "DD/MM/YY",
                                                            )}
                                                        </span>
                                                        <span className="text-slate-300">
                                                            ||
                                                        </span>
                                                        <span className="text-rose-500">
                                                            {dayjs(
                                                                p.fecha_final,
                                                            ).format(
                                                                "DD/MM/YY",
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 mt-1 font-black">
                                                        {calcularDias(
                                                            p.fecha_de_inicio,
                                                            p.fecha_final,
                                                        )}{" "}
                                                        DÍAS
                                                    </p>
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-2 border-r border-slate-50 text-center">
                                            <span
                                                className={`px-4 py-1.5 rounded-xl border-2 text-[9px] font-black bg-${p.color}-50 text-${p.color}-600 border-${p.color}-100`}
                                            >
                                                {p.status_real}
                                            </span>
                                        </td>

                                        <td className="p-2">
                                            <div className="flex justify-center gap-2">
                                                {p.tipo !== "Permanente" && (
                                                    <Button
                                                        onClick={() =>
                                                            handleReporteIndividual(
                                                                p.empleado,
                                                            )
                                                        }
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
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
                                                    className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Icons.Edit3 size={16} />
                                                </Button>
                                                {/* BOTÓN ELIMINAR / REVOCAR */}

                                                {/* Botón Eliminar SOLO para Permanente */}
                                                {p.tipo === "Permanente" && (
                                                    <Button
                                                        onClick={() =>
                                                            handleRevocar(p)
                                                        }
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Icons.Trash2
                                                            size={16}
                                                        />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* MODAL WHATSAPP COMPROBANTE */}
                <AnimatePresence>
                    {showWaModal && (
                        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 text-center shadow-3xl border-4 border-white relative"
                            >
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-emerald-100">
                                    <Icons.MessageCircle
                                        size={42}
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tighter">
                                    Comprobante
                                </h3>
                                <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                                        Trabajador
                                    </p>
                                    <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">
                                        {waData?.destinatario}
                                    </p>
                                    <p className="text-[10px] font-bold text-emerald-600 font-mono italic">
                                        {waData?.numero}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => {
                                            window.open(waData.url, "_blank");
                                            setShowWaModal(false);
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-black uppercase text-xs shadow-lg shadow-emerald-200"
                                    >
                                        <Icons.Send
                                            size={16}
                                            className="mr-2"
                                        />{" "}
                                        ENVIAR AHORA
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
                {/* MODAL EDICIÓN MULTIMODAL */}
                <AnimatePresence>
                    {isEditModalOpen && (
                        <div
                            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border-4 border-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div
                                    className={`p-8 text-white flex justify-between items-center ${data.tipo === "Vacacion" ? "bg-emerald-600" : data.tipo === "Permanente" ? "bg-purple-600" : "bg-blue-600"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                            <Icons.CalendarRange size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black uppercase italic text-sm leading-none">
                                                Ajustar {data.tipo}
                                            </h3>
                                            <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">
                                                {data.nombres} {data.apellidos}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setIsEditModalOpen(false)
                                        }
                                        className="hover:rotate-90 transition-transform"
                                    >
                                        <Icons.X size={28} />
                                    </button>
                                </div>

                                <form
                                    onSubmit={handleUpdate}
                                    className="p-8 space-y-6"
                                >
                                    {/* SECCIÓN DINÁMICA: FECHAS O DÍAS MÚLTIPLES */}
                                    {data.tipo === "Permanente" ? (
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">
                                                Seleccione los días de permiso
                                                (Múltiple)
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {ORDEN_DIAS.map((dia) => {
                                                    const isSelected =
                                                        data.dias.includes(dia);
                                                    return (
                                                        <button
                                                            key={dia}
                                                            type="button"
                                                            onClick={() =>
                                                                toggleDia(dia)
                                                            }
                                                            className={`p-3 rounded-xl border-2 transition-all font-black text-[9px] uppercase flex justify-between items-center ${
                                                                isSelected
                                                                    ? "bg-purple-600 border-purple-600 text-white shadow-lg scale-105"
                                                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            {dia}
                                                            {isSelected && (
                                                                <Icons.CheckCircle2
                                                                    size={14}
                                                                    className="text-white"
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {data.dias.length > 0 && (
                                                <p className="text-[9px] text-purple-600 font-black mt-2 text-center uppercase tracking-widest animate-pulse">
                                                    {data.dias.length} día(s)
                                                    seleccionado(s)
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field
                                                label="Fecha Inicio"
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
                                                label="Fecha Retorno"
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
                                    )}

                                    <SelectField
                                        label="Motivo del Registro"
                                        value={data.descripcion}
                                        options={
                                            opcionesMotivos[data.tipo] || []
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "descripcion",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />

                                    <div className="flex flex-col gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            loading={isUpdating}
                                            className={`w-full h-16 rounded-[1.5rem] font-black uppercase text-xs shadow-xl ${data.tipo === "Vacacion" ? "bg-emerald-600" : data.tipo === "Permanente" ? "bg-purple-600" : "bg-blue-600"}`}
                                        >
                                            <Icons.Save
                                                size={18}
                                                className="mr-2"
                                            />{" "}
                                            GUARDAR CAMBIOS
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsEditModalOpen(false)
                                            }
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 py-2"
                                        >
                                            Cancelar sin guardar
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
