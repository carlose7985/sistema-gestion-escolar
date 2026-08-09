import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import Swal from "sweetalert2";
import { confirmDelete } from "@/Utils/confirmDelete";

export default function Index({
    afiliados,
    empleadosDisponibles,
    totalAfiliados,
    estadisticasDeuda,
    filters,
    periodoGenerado,
    availableYears,
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);
    const [processingId, setProcessingId] = useState(null);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(null);
    const macInputRefAdd = useRef(null);
    const mesesNombres = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];
    const formAdd = useForm({ empleado_id: "", identificador_dispositivo: "" });
    const formEdit = useForm({ identificador_dispositivo: "" });

    const applyFilters = useCallback(
        debounce((q, m, y) => {
            router.get(
                route("empleados.acciones.wifi.index"),
                { search: q, month: m, year: y },
                { preserveState: true, replace: true },
            );
        }, 400),
        [],
    );

    useEffect(() => {
        if (showAddModal) {
            setTimeout(() => searchInputRef.current?.focus(), 200);
        }
    }, [showAddModal]);

    useEffect(() => {
        if (
            search === filters.search &&
            selectedMonth == filters.month &&
            selectedYear == filters.year
        ) {
            return;
        }
        applyFilters(search, selectedMonth, selectedYear);
    }, [search, selectedMonth, selectedYear]);

    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

   const handleGenerarPeriodo = () => {
  
       // 1. Abrimos la pestaña vacía INMEDIATAMENTE en el clic del usuario (evita bloqueo del navegador)
       const nuevaPestana = window.open("about:blank", "_blank");

       router.post(
           route("empleados.acciones.wifi.generar.periodo"),
           {
               month: selectedMonth,
               year: selectedYear,
           },
           {
               onSuccess: (page) => {
                   const mensaje =
                       page.props.flash?.whatsapp_message ||
                       page.props.whatsapp_message;

                   if (mensaje) {
                       const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;

                       // 2. Redirigimos la nueva pestaña a WhatsApp
                       if (nuevaPestana) {
                           nuevaPestana.location.href = url;
                       }
                   } else {
                       // Si no hubo mensaje, cerramos la pestaña que se abrió
                       if (nuevaPestana) nuevaPestana.close();
                       alert(
                           "El período se generó, pero no se recibió el mensaje.",
                       );
                   }
               },
               onError: (errors) => {
                   // Si ocurre un error, cerramos la pestaña
                   if (nuevaPestana) nuevaPestana.close();
                   alert(
                       "Error: " +
                           (errors.error || "No se pudo generar el período"),
                   );
               },
           },
       );
    };
    
    // --- ACCIÓN: TOGGLE PAGO ---
    const handleTogglePago = (pagoId) => {
        if (!pagoId) {
            Swal.fire(
                "Mes no habilitado",
                "Debe dar click en GENERAR PERIODO para habilitar la cobranza de este mes.",
                "warning",
            );
            return;
        }
        setProcessingId(pagoId);
        resetSearchAndFocus();
        router.post(
            route("empleados.acciones.wifi.toggle", pagoId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setProcessingId(null),
                onError: () => setProcessingId(null),
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const formatIdentificador = (value) => {
        let cleanValue = value
            .replace(/[^A-Z0-9]/gi, "")
            .toUpperCase()
            .substring(0, 12);
        let parts = cleanValue.match(/.{1,2}/g);
        return parts ? parts.join("-") : cleanValue;
    };

    const filteredEmpleados = useMemo(() => {
        const query = normalizeText(searchTerm);
        return empleadosDisponibles.filter(
            (e) =>
                normalizeText(e.nombres).includes(query) ||
                normalizeText(e.apellidos || "").includes(query) ||
                e.cedula.toString().includes(query),
        );
    }, [searchTerm, empleadosDisponibles]);

    const empleadoSeleccionado = useMemo(
        () =>
            empleadosDisponibles.find((e) => e.id == formAdd.data.empleado_id),
        [formAdd.data.empleado_id],
    );

    const resetSearchAndFocus = useCallback(() => {
        setSearch("");
    }, []);

    const handleMacChange = (e, form, field, inputRef) => {
        const input = e.target;
        const start = input.selectionStart;
        const value = input.value;

        const formatted = formatIdentificador(value);
        form.setData(field, formatted);

        requestAnimationFrame(() => {
            if (inputRef.current) {
                const isAdding = value.length > (form.data[field]?.length || 0);
                const addedHyphen = isAdding && formatted.length > value.length;
                const newPos = addedHyphen ? start + 1 : start;

                inputRef.current.setSelectionRange(newPos, newPos);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Control WiFi" />
            <ViewContainer
                title="Gestión de Red WiFi"
                subtitle="Registro y control de pagos"
                icon="Wifi"
                showSearch={true}
                searchValue={search}
                onSearch={setSearch}
                currentPage={afiliados.current_page}
                totalPages={afiliados.last_page}
                onPageChange={(p) => {
                    router.get(
                        route("empleados.acciones.wifi.index"),
                        {
                            ...filters,
                            page: p,
                        },
                        {
                            preserveState: true,
                            preserveScroll: true,
                        },
                    );
                }}
                extraFilters={
                    <div className="flex gap-2">
                        {!periodoGenerado && (
                            <Button
                                onClick={handleGenerarPeriodo}
                                variant="success"
                                size="sm"
                                className="gap-2 mt-1"
                            >
                                <Icons.CalendarPlus size={16} /> GENERAR PERIODO
                            </Button>
                        )}

                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-32 h-10 text-gray-700 bg-white border-slate-500 border rounded-2xl text-[10px] font-black uppercase appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        >
                            {mesesNombres.map((m, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-26 pl-8 h-10 text-gray-700 bg-white border-slate-500 border rounded-2xl text-[10px] font-black uppercase appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        >
                            {availableYears.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <Button
                            onClick={() =>
                                router.get(route("empleados.acciones.index"))
                            }
                        >
                            <Icons.ArrowLeftCircle size={18} /> VOLVER
                        </Button>

                        <Button
                            onClick={() => setShowAddModal(true)}
                            variant="success"
                            size="sm"
                            className="gap-2"
                        >
                            <Icons.Plus size={16} /> NUEVO AFILIADO
                        </Button>

                        <div className="relative">
                            <Button
                                onClick={() => setIsStatsOpen(!isStatsOpen)}
                                variant="primary"
                                size="sm"
                                className="gap-2"
                            >
                                <Icons.AlertTriangle
                                    size={14}
                                    className={
                                        estadisticasDeuda.length > 0
                                            ? "animate-pulse"
                                            : ""
                                    }
                                />{" "}
                                DEUDAS <Icons.ChevronDown size={14} />
                            </Button>
                            <AnimatePresence>
                                {isStatsOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-[100]"
                                            onClick={() =>
                                                setIsStatsOpen(false)
                                            }
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border p-4 z-[110]"
                                        >
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-3">
                                                Resumen Morosidad
                                            </p>
                                            {estadisticasDeuda.length > 0 ? (
                                                estadisticasDeuda.map(
                                                    (stat, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex justify-between text-gray-500 py-2 border-b border-slate-50 text-[10px] font-black uppercase"
                                                        >
                                                            <span>
                                                                {
                                                                    stat.mes_nombre
                                                                }
                                                            </span>{" "}
                                                            <span className="text-rose-600">
                                                                {stat.deudores}{" "}
                                                                deudores
                                                            </span>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-center text-[10px] text-slate-400">
                                                    Todo al día
                                                </p>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                            <Link
                                href={route("empleados.acciones.wifi.morosos", {
                                    month: selectedMonth,
                                    year: selectedYear,
                                })}
                            >
                                <Button
                                    className="ml-2"
                                    size="sm"
                                    variant="warning"
                                >
                                    <Icons.UserMinus2 size={16} /> MOROSOS
                                </Button>
                            </Link>
                        </div>
                    </div>
                }
                footerStats={
                    <div className="flex gap-6 text-[11px] font-bold uppercase italic">
                        <p>
                            Afiliados:{" "}
                            <span className="text-blue-600 font-black">
                                {totalAfiliados}
                            </span>
                        </p>
                        <p>
                            Visualizando:{" "}
                            <span className="text-slate-800 font-black">
                                {mesesNombres[selectedMonth - 1]} {selectedYear}
                            </span>
                        </p>
                    </div>
                }
            >
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border">
                    <table className="w-full border-collapse">
                        <thead className="bg-blue-600 text-white text-[10px] font-black uppercase italic">
                            <tr>
                                <th className="px-6 py-4">Titular de Cuenta</th>
                                <th className="px-6 py-4 text-center">
                                    Identificador
                                </th>
                                <th className="px-6 py-4 text-center">
                                    Estado del Mes
                                </th>
                                <th className="px-6 py-4 text-center">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-[11px]">
                            {afiliados.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-slate-50 transition-all"
                                >
                                    <td className="px-6 py-3 font-black text-slate-700 uppercase">
                                        {item.empleado}{" "}
                                        <p className="text-[9px] text-slate-700 font-bold">
                                            CI: {item.cedula}
                                        </p>
                                    </td>
                                    <td className="px-6 py-3 text-center font-mono font-bold text-slate-500">
                                        {item.identificador}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                handleTogglePago(item.pago_id)
                                            }
                                            disabled={
                                                processingId === item.pago_id
                                            }
                                            className={`w-44 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 mx-auto transition-all 
                                            ${
                                                item.estado_pago ===
                                                "Verificado"
                                                    ? "bg-emerald-500 text-white shadow-lg"
                                                    : item.estado_pago ===
                                                        "Pendiente"
                                                      ? "bg-rose-500 text-white "
                                                      : "bg-slate-100 text-slate-300"
                                            }`}
                                        >
                                            {processingId === item.pago_id ? (
                                                <Icons.Loader2
                                                    className="animate-spin"
                                                    size={14}
                                                />
                                            ) : item.estado_pago ===
                                              "Verificado" ? (
                                                <Icons.CheckCircle2 size={14} />
                                            ) : (
                                                <Icons.CircleX size={14} />
                                            )}
                                            {item.estado_pago}
                                        </button>
                                        {item.fecha_pago_realizado && (
                                            <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold italic">
                                                Auditado:{" "}
                                                {item.fecha_pago_realizado}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    setShowHistoryModal(item)
                                                }
                                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                <Icons.History size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    formEdit.setData(
                                                        "identificador_dispositivo",
                                                        item.identificador,
                                                    );
                                                    setShowEditModal(item);
                                                }}
                                                className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                                            >
                                                <Icons.Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDelete(
                                                        route(
                                                            "empleados.acciones.wifi.destroy",
                                                            item.id,
                                                        ),
                                                        "¿Eliminar este activo?",
                                                        `Vas a remover de forma definitiva el registro de: ${item.nombres} ${item.apellidos} (${item.documento}${item.cedula})`,
                                                    )
                                                }
                                                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <Icons.Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MODAL HISTORIAL RESTAURADO */}
                <AnimatePresence>
                    {showHistoryModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <h3 className="font-black uppercase text-xs">
                                        Ciclo de Pagos {selectedYear}
                                    </h3>
                                    <Icons.X
                                        size={20}
                                        className="cursor-pointer text-slate-300"
                                        onClick={() =>
                                            setShowHistoryModal(null)
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {mesesNombres.map((m, i) => {
                                        const key = `${selectedYear}-${String(i + 1).padStart(2, "0")}-01`;
                                        const pagado =
                                            showHistoryModal.historial_pagos.includes(
                                                key,
                                            );
                                        return (
                                            <div
                                                key={i}
                                                className={`p-3 border rounded-2xl text-center ${pagado ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-300"}`}
                                            >
                                                <p className="text-[9px] font-black uppercase">
                                                    {m.substring(0, 3)}
                                                </p>
                                                {pagado ? (
                                                    <Icons.CheckCircle2
                                                        size={12}
                                                        className="mx-auto mt-1"
                                                    />
                                                ) : (
                                                    <span className="text-[10px]">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <Button
                                    onClick={() => setShowHistoryModal(null)}
                                    className="w-full mt-6 bg-slate-900"
                                >
                                    CERRAR
                                </Button>
                            </motion.div>
                        </div>
                    )}

                    {/* MODAL EDITAR RESTAURADO */}
                    {showEditModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-amber-500"
                            >
                                <h3 className="font-black text-blue-900 uppercase text-sm mb-6 italic">
                                    Editar Dispositivo
                                </h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        formEdit.put(
                                            route(
                                                "empleados.acciones.wifi.update",
                                                showEditModal.id,
                                            ),
                                            {
                                                onSuccess: () => {
                                                    setShowEditModal(null);
                                                    resetSearchAndFocus();
                                                },
                                            },
                                        );
                                    }}
                                    className="space-y-5"
                                >
                                    <Field
                                        label="Identificador MAC/IMEI"
                                        autoFocus
                                        value={
                                            formEdit.data
                                                .identificador_dispositivo
                                        }
                                        onChange={(e) =>
                                            handleMacChange(
                                                e,
                                                formEdit,
                                                "identificador_dispositivo",
                                            )
                                        } // <--- Cambio aquí
                                        maxLength={17}
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        loading={formEdit.processing}
                                        className="w-full h-14 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-100"
                                    >
                                        GUARDAR CAMBIOS
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(null)}
                                        className="w-full text-[10px] font-black text-slate-400 uppercase"
                                    >
                                        Cancelar
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* MODAL AGREGAR CON BUSCADOR INTELIGENTE RESTAURADO */}
                    {showAddModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                }}
                                className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-t-8 border-indigo-500 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="px-6 pt-6 pb-3 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-2xl">
                                            <Icons.Plus
                                                size={18}
                                                className="text-indigo-600"
                                            />
                                        </div>
                                        <h3 className="font-black text-lg tracking-tight text-slate-800">
                                            Nueva Afiliación WiFi
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 ml-12">
                                        Asigna un dispositivo a un empleado
                                        activo
                                    </p>
                                </div>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        formAdd.post(
                                            route(
                                                "empleados.acciones.wifi.store",
                                            ),
                                            {
                                                onSuccess: () => {
                                                    setShowAddModal(false);
                                                    resetSearchAndFocus();
                                                },
                                            },
                                        );
                                    }}
                                    className="p-6 space-y-6"
                                >
                                    {/* Campo: Empleado (buscador moderno) */}
                                    <div className="relative">
                                        <label className="block text-[11px] font-black uppercase text-slate-500 mb-2 tracking-wide">
                                            👤 Buscar Empleado (Nombre o Cédula)
                                        </label>

                                        <div className="relative">
                                            <Icons.Search
                                                size={16}
                                                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                                    empleadoSeleccionado
                                                        ? "text-emerald-500"
                                                        : "text-slate-400"
                                                }`}
                                            />
                                            <input
                                                ref={searchInputRef}
                                                autoFocus
                                                type="search"
                                                placeholder="Escriba para buscar..."
                                                className={`w-full pl-11 pr-4 py-3 text-gray-600 bg-slate-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all
                ${formAdd.errors.empleado_id ? "border-rose-400 ring-4 ring-rose-100" : "border-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"}
                ${empleadoSeleccionado ? "border-emerald-400 bg-emerald-50/30" : ""}
            `}
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(
                                                        e.target.value,
                                                    );
                                                    if (empleadoSeleccionado)
                                                        formAdd.setData(
                                                            "empleado_id",
                                                            "",
                                                        ); // Reset si vuelve a escribir
                                                }}
                                            />
                                            {/* Botón para limpiar selección rápida */}
                                            {empleadoSeleccionado && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        formAdd.setData(
                                                            "empleado_id",
                                                            "",
                                                        );
                                                        searchInputRef.current.focus();
                                                    }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                                                >
                                                    <Icons.X size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Nota de error si ya existe */}
                                        {formAdd.errors.empleado_id && (
                                            <div className="flex items-center gap-1 mt-2 ml-1 text-rose-600 animate-bounce">
                                                <Icons.AlertTriangle
                                                    size={12}
                                                />
                                                <span className="text-[10px] font-black uppercase">
                                                    {formAdd.errors.empleado_id}
                                                </span>
                                            </div>
                                        )}

                                        {/* Lista desplegable de resultados (Solo si hay búsqueda y no hay nadie seleccionado) */}
                                        <AnimatePresence>
                                            {searchTerm.length > 0 &&
                                                !formAdd.data.empleado_id && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                                                    >
                                                        {filteredEmpleados.length ===
                                                        0 ? (
                                                            <div className="p-4 text-center text-slate-400 text-xs italic">
                                                                No se
                                                                encontraron
                                                                coincidencias
                                                            </div>
                                                        ) : (
                                                            filteredEmpleados.map(
                                                                (e) => (
                                                                    <div
                                                                        key={
                                                                            e.id
                                                                        }
                                                                        onClick={() => {
                                                                            formAdd.setData(
                                                                                "empleado_id",
                                                                                e.id,
                                                                            );
                                                                            setSearchTerm(
                                                                                `${e.nombres} ${e.apellidos}`,
                                                                            );
                                                                        }}
                                                                        className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 group"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600">
                                                                                    {
                                                                                        e.nombres
                                                                                    }{" "}
                                                                                    {
                                                                                        e.apellidos
                                                                                    }
                                                                                </p>
                                                                                <p className="text-[10px] font-mono text-slate-400">
                                                                                    CI:{" "}
                                                                                    {
                                                                                        e.cedula
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <Icons.Plus
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="text-slate-300 group-hover:text-indigo-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )
                                                        )}
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                    </div>
                                    {/* Campo: Identificador MAC/IMEI */}
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-500 mb-2 tracking-wide">
                                            📡 MAC / IMEI
                                        </label>
                                        <div className="relative">
                                            <input
                                                ref={macInputRefAdd} // <--- ASIGNAR LA REF AQUÍ
                                                type="text"
                                                value={
                                                    formAdd.data
                                                        .identificador_dispositivo
                                                }
                                                onChange={(e) =>
                                                    handleMacChange(
                                                        e,
                                                        formAdd,
                                                        "identificador_dispositivo",
                                                        macInputRefAdd,
                                                    )
                                                } // <--- USAR EL NUEVO MANEJADOR
                                                maxLength={17}
                                                required
                                                placeholder="Ej: AA-BB-CC-DD-EE-FF"
                                                className="w-full text-gray-600 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase bg-white px-1">
                                                {
                                                    formAdd.data
                                                        .identificador_dispositivo
                                                        .length
                                                }
                                                /17
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            loading={formAdd.processing}
                                            className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 transition-all"
                                        >
                                            <Icons.Save
                                                size={16}
                                                className="mr-2"
                                            />{" "}
                                            ACTIVAR ACCESO
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                formAdd.reset();
                                                setSearchTerm("");
                                            }}
                                            variant="outline"
                                            className="h-12 px-6 rounded-2xl border-slate-300 text-slate-500 hover:bg-slate-50"
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </ViewContainer>
            <style jsx="true">{`
                .select-style {
                    @apply bg-white border-none rounded-xl text-xs font-black px-4 py-2 shadow-lg outline-none focus:ring-2 focus:ring-blue-500 italic;
                }
                .label-style {
                    @apply text-[10px] font-black text-slate-400 uppercase ml-1 block mb-1;
                }
                .select-trigger {
                    @apply w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 flex items-center justify-between cursor-pointer text-[11px] font-bold text-slate-800;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
