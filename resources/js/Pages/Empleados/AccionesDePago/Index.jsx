import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import { Field } from "@/Components/layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import axios from "axios"; // <-- IMPORTANTE: Agregar axios

import {
    Plus,
    Trash2,
    CheckCircle,
    Pencil,
    Search,
    XCircle,
    Loader2,
    ChevronRight,
    ArrowLeftCircle,
    UserSquare2,
    PrinterCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import Swal from "sweetalert2";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function Index({
    empleados,
    tiposAccion,
    metodos,
    filters,
    stats,
}) {
    // --- REFERENCIAS ---
    const searchInputRef = useRef(null);
    const montoInputRefs = useRef({});
    const refInputRefs = useRef({});

    // --- FUNCIONES UTILITARIAS ---
    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // --- ESTADOS ---
    const [search, setSearch] = useState(filters.search || "");
    const [selectedAccionId, setSelectedAccionId] = useState(
        filters.tipo_id || "",
    );
    const [selectedFecha, setSelectedFecha] = useState(
        filters.fecha || new Date().toISOString().split("T")[0],
    );
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [isEditingTipo, setIsEditingTipo] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmittingPago, setIsSubmittingPago] = useState(false); // <-- NUEVO ESTADO
    const [selectedEmployees, setSelectedEmployees] = useState([]); // IDs de empleados seleccionados
    const [isPagoEspecialModalOpen, setIsPagoEspecialModalOpen] =
        useState(false);
    // --- FORMULARIOS ---
    const tipoForm = useForm({
        nombre: "",
        costo_base: "",
        costo_adicional: "",
    });

    const pagoForm = useForm({
        empleado_id: "",
        accion_tipo_id: "",
        fecha_pago: selectedFecha,
        pagos_seleccionados: {
            Transferencia: { activo: true, monto: "", ref: "" },
            "Pago Móvil": { activo: false, monto: "", ref: "" },
            Efectivo: { activo: false, monto: "", ref: "" },
            Divisa: { activo: false, monto: "", ref: "" },
        },
    });

    // --- ACTIVIDAD SELECCIONADA ---
    const selectedAccion = useMemo(() => {
        return tiposAccion.find((t) => t.id == selectedAccionId) || null;
    }, [selectedAccionId, tiposAccion]);

    // --- MANEJADOR DE BÚSQUEDA CON DEBOUNCE ---
    const handleFiltrar = useCallback(
        debounce((q, t, f) => {
            if (!isSearching) {
                setIsSearching(true);
                router.get(
                    route("empleados.acciones.pagos.index"),
                    { search: q, tipo_id: t, fecha: f },
                    {
                        preserveState: true,
                        replace: true,
                        preserveScroll: true,
                        onFinish: () => setIsSearching(false),
                    },
                );
            }
        }, 500),
        [isSearching],
    );

    // --- EFECTO PARA APLICAR FILTROS ---
    useEffect(() => {
        handleFiltrar(search, selectedAccionId, selectedFecha);
    }, [search, selectedAccionId, selectedFecha]);

    // --- EFECTO PARA AUTOFOCUS ---
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [empleados.data]);

    // --- CALCULAR TOTAL REQUERIDO ---
    const getTotalRequerido = () => {
        if (!selectedAccion) return 0;
        return (
            Number(selectedAccion.costo_base) +
            Number(selectedAccion.costo_adicional || 0)
        );
    };

    // --- OBTENER EL MÉTODO BASE ---
    const getMetodoBase = () => {
        const pagos = pagoForm.data.pagos_seleccionados;
        const activosConMonto = Object.keys(pagos).filter(
            (key) => pagos[key].activo && Number(pagos[key].monto) > 0,
        );

        if (activosConMonto.length === 0) return "Transferencia";
        if (activosConMonto.length === 1) return activosConMonto[0];

        let base = activosConMonto[0];
        let mayorMonto = Number(pagos[base].monto);
        activosConMonto.forEach((key) => {
            const monto = Number(pagos[key].monto);
            if (monto > mayorMonto) {
                mayorMonto = monto;
                base = key;
            }
        });
        return base;
    };

    // --- REVERTIR PAGOS COMPLETOS ---
    const handleRevertirPagos = (emp) => {
        if (!selectedAccion) return toast.warning("Seleccione una actividad");

        const totalPagado =
            emp.pagos?.reduce((acc, p) => acc + Number(p.monto_item), 0) || 0;
        const totalRequerido = getTotalRequerido();

        if (totalPagado < totalRequerido) {
            return toast.warning("El empleado no ha completado el pago total");
        }

        Swal.fire({
            title: "¿Revertir pagos?",
            text: `Se eliminarán TODOS los pagos registrados para ${emp.nombres} ${emp.apellidos} (Total: $${totalPagado.toFixed(2)})`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "SÍ, REVERTIR",
            cancelButtonText: "CANCELAR",
            customClass: { popup: "rounded-[2.5rem]" },
        }).then((result) => {
            if (result.isConfirmed) {
                setIsProcessingAction(true);
                router.post(
                    route("empleados.acciones.pagos.limpiar"),
                    {
                        empleado_id: emp.id,
                        accion_id: selectedAccion.id,
                    },
                    {
                        onFinish: () => {
                            setIsProcessingAction(false);
                            toast.success("Pagos revertidos exitosamente");
                        },
                        onError: () => {
                            setIsProcessingAction(false);
                            toast.error("Error al revertir los pagos");
                        },
                    },
                );
            }
        });
    };

    // --- ABRIR MODAL DE PAGO ---
    const handleOpenPagoModal = (emp) => {
        if (!selectedAccion) return toast.warning("Seleccione una actividad");

        const total = getTotalRequerido();
        setEmpleadoSeleccionado(emp);

        const pagosExistentes = emp.pagos || [];
        const tienePagos = pagosExistentes.length > 0;

        let montoFaltante = total;
        if (tienePagos) {
            const totalPagado = pagosExistentes.reduce(
                (acc, p) => acc + Number(p.monto_item),
                0,
            );
            montoFaltante = Math.max(0, total - totalPagado);
        }

        if (montoFaltante === 0) {
            return toast.info("Este empleado ya ha completado el pago total");
        }

        pagoForm.setData({
            empleado_id: emp.id,
            accion_tipo_id: selectedAccion.id,
            fecha_pago: selectedFecha,
            pagos_seleccionados: {
                Transferencia: {
                    activo: true,
                    monto: montoFaltante.toFixed(2),
                    ref: "",
                },
                "Pago Móvil": { activo: false, monto: "", ref: "" },
                Efectivo: { activo: false, monto: "", ref: "" },
                Divisa: { activo: false, monto: "", ref: "" },
            },
        });
        setIsPagoModalOpen(true);

        setTimeout(() => {
            const refInput = refInputRefs.current["Transferencia"];
            if (refInput) {
                refInput.focus();
            }
        }, 300);
    };

    // --- MANEJADOR DE CAMBIO DE MONTO ---
    const handleMontoChange = (metodoModificado, nuevoValor) => {
        const totalRequerido = getTotalRequerido();
        const nuevosPagos = { ...pagoForm.data.pagos_seleccionados };

        if (nuevoValor === "" || nuevoValor === "0") {
            nuevosPagos[metodoModificado].monto = "";
            const base = getMetodoBase();
            if (base && base !== metodoModificado) {
                const totalActivos = Object.keys(nuevosPagos)
                    .filter((key) => nuevosPagos[key].activo && key !== base)
                    .reduce(
                        (acc, key) =>
                            acc + (Number(nuevosPagos[key].monto) || 0),
                        0,
                    );
                nuevosPagos[base].monto = Math.max(
                    0,
                    totalRequerido - totalActivos,
                ).toFixed(2);
            }
            pagoForm.setData("pagos_seleccionados", nuevosPagos);
            return;
        }

        nuevosPagos[metodoModificado].monto = nuevoValor;
        const base = getMetodoBase();

        if (base === metodoModificado) {
            pagoForm.setData("pagos_seleccionados", nuevosPagos);
            return;
        }

        const totalOtros = Object.keys(nuevosPagos)
            .filter(
                (key) =>
                    key !== base &&
                    nuevosPagos[key].activo &&
                    Number(nuevosPagos[key].monto) > 0,
            )
            .reduce(
                (acc, key) => acc + (Number(nuevosPagos[key].monto) || 0),
                0,
            );

        const montoRestante = Math.max(0, totalRequerido - totalOtros);
        nuevosPagos[base].monto = montoRestante.toFixed(2);

        if (montoRestante === 0) {
            nuevosPagos[base].activo = false;
            nuevosPagos[base].monto = "";
            nuevosPagos[base].ref = "";
        }

        pagoForm.setData("pagos_seleccionados", nuevosPagos);
    };

    // --- MANEJADOR DE CHECKBOX ---
    const handleMetodoCheckboxChange = (metodo) => {
        const nuevosPagos = { ...pagoForm.data.pagos_seleccionados };
        const totalRequerido = getTotalRequerido();

        const nuevoEstado = !nuevosPagos[metodo].activo;
        nuevosPagos[metodo].activo = nuevoEstado;

        if (!nuevoEstado) {
            const montoDesactivado = nuevosPagos[metodo].monto || "0";
            nuevosPagos[metodo].monto = "";
            nuevosPagos[metodo].ref = "";

            const otrosActivos = Object.keys(nuevosPagos).filter(
                (key) => key !== metodo && nuevosPagos[key].activo,
            );

            if (otrosActivos.length > 0) {
                const montoPorMetodo =
                    Number(montoDesactivado) / otrosActivos.length;
                otrosActivos.forEach((key) => {
                    const montoActual = Number(nuevosPagos[key].monto) || 0;
                    nuevosPagos[key].monto = (
                        montoActual + montoPorMetodo
                    ).toFixed(2);
                });
            } else {
                nuevosPagos["Transferencia"].activo = true;
                nuevosPagos["Transferencia"].monto = totalRequerido.toFixed(2);
            }
        } else {
            nuevosPagos[metodo].monto = "";
            nuevosPagos[metodo].ref = "";

            setTimeout(() => {
                const montoInput = montoInputRefs.current[metodo];
                if (montoInput) {
                    montoInput.focus();
                }
            }, 100);
        }

        pagoForm.setData("pagos_seleccionados", nuevosPagos);
    };

    // --- CALCULAR SUMA ACTUAL ---
    const calcularSumaActual = () => {
        return Object.values(pagoForm.data.pagos_seleccionados).reduce(
            (acc, curr) => acc + (curr.activo ? Number(curr.monto) || 0 : 0),
            0,
        );
    };

    // --- VALIDAR REFERENCIA EN BACKEND ---
    const validarReferenciaBackend = async (ref, accionTipoId) => {
        try {
            const response = await axios.get(
                route("empleados.acciones.pagos.validar-ref"),
                {
                    params: {
                        ref: ref,
                        accion_tipo_id: accionTipoId,
                    },
                },
            );
            return response.data;
        } catch (error) {
            console.error("Error validando referencia:", error);
            return { disponible: false, error: true };
        }
    };

    // --- ENVIAR PAGO ---
    const submitPago = async (e) => {
        e.preventDefault();

        const pagosFiltrados = Object.entries(pagoForm.data.pagos_seleccionados)
            .filter(([_, data]) => data.activo && Number(data.monto) > 0)
            .map(([metodo, data]) => ({
                metodo: metodo,
                monto: data.monto,
                ref: data.ref || null,
            }));

        if (pagosFiltrados.length === 0) {
            return toast.error("Debe ingresar al menos un monto válido");
        }

        const sumaTotal = pagosFiltrados.reduce(
            (acc, p) => acc + Number(p.monto),
            0,
        );
        if (Math.abs(sumaTotal - getTotalRequerido()) > 0.01) {
            return toast.error(
                "La suma de los montos debe ser igual al total requerido",
            );
        }

        const metodosConRef = ["Transferencia", "Pago Móvil"];
        const pagosSinRef = pagosFiltrados.filter(
            (p) =>
                metodosConRef.includes(p.metodo) &&
                (!p.ref || p.ref.trim() === ""),
        );

        if (pagosSinRef.length > 0) {
            return toast.error(
                `Los métodos ${pagosSinRef.map((p) => p.metodo).join(", ")} requieren número de referencia`,
            );
        }

        // VALIDAR REFERENCIAS DUPLICADAS
        for (const pago of pagosFiltrados) {
            if (metodosConRef.includes(pago.metodo) && pago.ref) {
                if (!pago.ref.endsWith("-")) {
                    const resultado = await validarReferenciaBackend(
                        pago.ref,
                        pagoForm.data.accion_tipo_id,
                    );

                    if (resultado.error) {
                        return toast.error("Error al validar la referencia");
                    }

                    if (!resultado.disponible) {
                        toast.error(
                            `La referencia "${pago.ref}" ya existe. Agregue un guion al final para crear una serie: "${pago.ref}-"`,
                        );
                        return;
                    }
                }
            }
        }

        setIsSubmittingPago(true); // <-- ACTIVAR SPINNER
        router.post(
            route("empleados.acciones.pagos.store"),
            {
                ...pagoForm.data,
                pagos: pagosFiltrados,
            },
            {
                onSuccess: () => {
                    setIsPagoModalOpen(false);
                    setIsSubmittingPago(false); // <-- DESACTIVAR SPINNER
                    setIsProcessingAction(false);
                    toast.success("Pagos registrados exitosamente");
                },
                onError: (errors) => {
                    setIsSubmittingPago(false); // <-- DESACTIVAR SPINNER
                    setIsProcessingAction(false);
                    if (errors && errors.response && errors.response.data) {
                        const data = errors.response.data;
                        if (data.errors) {
                            const firstError = Object.values(data.errors)[0];
                            if (Array.isArray(firstError)) {
                                toast.error(firstError[0]);
                            } else {
                                toast.error("Error al registrar los pagos");
                            }
                        } else if (data.message) {
                            toast.error(data.message);
                        } else {
                            toast.error("Error al registrar los pagos");
                        }
                    } else {
                        toast.error("Error al registrar los pagos");
                    }
                },
            },
        );
    };

    // --- ABRIR EDITAR TIPO ---
    const openEditTipo = () => {
        if (!selectedAccion) return;
        setIsEditingTipo(true);
        tipoForm.setData({
            nombre: selectedAccion.nombre,
            costo_base: selectedAccion.costo_base,
            costo_adicional: selectedAccion.costo_adicional || "",
        });
        setIsConfigModalOpen(true);
    };

    // --- ABRIR NUEVO TIPO ---
    const openNewTipo = () => {
        setIsEditingTipo(false);
        tipoForm.reset();
        setIsConfigModalOpen(true);
    };

    // --- ELIMINAR TIPO ---
    const handleDeleteTipo = () => {
        if (!selectedAccion) return;

        const fechaCreacion = dayjs(selectedAccion.created_at);
        const mesesDiferencia = dayjs().diff(fechaCreacion, "month");

        if (mesesDiferencia < 1) {
            return Swal.fire({
                title: "Restricción de tiempo",
                text: "Por seguridad, una actividad solo puede borrarse después de 30 días de haber sido creada.",
                icon: "info",
                confirmButtonColor: "#6366f1",
                customClass: { popup: "rounded-[2.5rem]" },
            });
        }

        Swal.fire({
            title: "¿Eliminar Actividad?",
            text: "Esta acción borrará permanentemente el concepto y TODOS los registros de pago asociados. No se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "SÍ, ELIMINAR TODO",
            cancelButtonText: "CANCELAR",
            customClass: { popup: "rounded-[2.5rem]" },
        }).then((result) => {
            if (result.isConfirmed) {
                setIsProcessingAction(true);
                router.delete(
                    route("empleados.acciones.tipos.delete", selectedAccion.id),
                    {
                        onFinish: () => {
                            setIsProcessingAction(false);
                            setSelectedAccionId("");
                            setSearch("");
                            if (searchInputRef.current) {
                                searchInputRef.current.focus();
                            }
                        },
                    },
                );
            }
        });
    };

    // --- FILTRAR EMPLEADOS ---
    const filteredEmpleados = useMemo(() => {
        if (!search.trim()) return empleados.data;

        const searchLower = search.toLowerCase().trim();
        const searchWithoutAccents = removeAccents(searchLower);

        return empleados.data.filter((emp) => {
            const nombresCompletos =
                `${emp.nombres} ${emp.apellidos}`.toLowerCase();
            const nombresSinAcentos = removeAccents(nombresCompletos);
            const cedula = emp.cedula.toString();
            const refItem =
                emp.pagos?.some((p) =>
                    p.ref_item?.toLowerCase().includes(searchLower),
                ) || false;

            return (
                nombresSinAcentos.includes(searchWithoutAccents) ||
                nombresCompletos.includes(searchLower) ||
                cedula.includes(searchLower) ||
                refItem
            );
        });
    }, [empleados.data, search]);

    // --- IMPRESIÓN ---
    const handlePrint = (type) => {
        if (!selectedAccion) return toast.warning("Seleccione una actividad");
        const url = route("ExportDocumentosEmpleados", {
            type: type,
            empleadoId: selectedAccion.id,
        });
        window.open(url, "_blank");
    };

    // --- COMPONENTE ACTION BUTTON ---
    const ActionButton = ({ icon: Icon, label, onClick, color }) => {
        const colorClasses = {
            emerald:
                "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100",
            rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100",
            indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-indigo-100",
            violet: "bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white border-violet-100",
        };

        return (
            <Button
                onClick={onClick}
                className={`${colorClasses[color] || colorClasses.indigo}`}
            >
                <div className="flex items-center gap-4">
                    <Icon
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                    />
                    <span className="text-[11px] font-black uppercase tracking-tight">
                        {label}
                    </span>
                </div>
               
            </Button>
        );
    };

    // --- MANEJAR SELECCIÓN DE EMPLEADOS ---
    const handleSelectEmployee = (empId) => {
        setSelectedEmployees((prev) => {
            if (prev.includes(empId)) {
                return prev.filter((id) => id !== empId);
            } else {
                return [...prev, empId];
            }
        });
    };

    // --- SELECCIONAR/DESELECCIONAR TODOS ---
    const handleSelectAll = () => {
        if (selectedEmployees.length === filteredEmpleados.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmpleados.map((emp) => emp.id));
        }
    };

    // --- PROCESAR PAGO ESPECIAL EN CERO ---
    const handlePagoEspecial = () => {
        if (selectedEmployees.length === 0) {
            return toast.warning("Seleccione al menos un empleado");
        }

        if (!selectedAccion) {
            return toast.warning("Seleccione una actividad");
        }

        Swal.fire({
            title: "¿Registrar pagos especiales?",
            text: `Se registrarán ${selectedEmployees.length} empleados con monto 0 y sin referencia.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            confirmButtonText: "SÍ, REGISTRAR",
            cancelButtonText: "CANCELAR",
            customClass: { popup: "rounded-[2.5rem]" },
        }).then((result) => {
            if (result.isConfirmed) {
                setIsSubmittingPago(true);

                // Crear array de pagos en cero para cada empleado seleccionado
                const pagosEspeciales = selectedEmployees.map((empId) => ({
                    empleado_id: empId,
                    accion_tipo_id: selectedAccion.id,
                    fecha_pago: selectedFecha,
                    pagos: [
                        {
                            metodo: "Efectivo",
                            monto: "0.00",
                            ref: null,
                        },
                    ],
                }));

                // Enviar cada pago individualmente o en batch
                const promises = pagosEspeciales.map((pagoData) => {
                    return router.post(
                        route("empleados.acciones.pagos.store-especial"),
                        pagoData,
                        {
                            preserveState: true,
                            preserveScroll: true,
                        },
                    );
                });

                // Esperar que todos terminen
                Promise.all(promises)
                    .then(() => {
                        setIsSubmittingPago(false);
                        setSelectedEmployees([]);
                        toast.success(
                            `${selectedEmployees.length} pagos especiales registrados`,
                        );
                        // Recargar datos
                        router.get(route("empleados.acciones.pagos.index"), {
                            ...filters,
                        });
                    })
                    .catch(() => {
                        setIsSubmittingPago(false);
                        toast.error("Error al registrar pagos especiales");
                    });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Caja de Empleados" />

            <ViewContainer
                title={
                    selectedAccion
                        ? `REGISTRO: ${selectedAccion.nombre}`
                        : "Caja de Empleados"
                }
                subtitle="Control general de ventas"
                icon="ShoppingCart"
                showSearch={true}
                searchValue={search}
                onSearch={(value) => setSearch(value)}
                searchRef={searchInputRef}
                currentPage={empleados.current_page}
                totalPages={empleados.last_page}
                onPageChange={(p) =>
                    router.get(route("empleados.acciones.pagos.index"), {
                        ...filters,
                        page: p,
                    })
                }
                extraFilters={
                    <div className="flex items-center gap-3 flex-wrap">
                        <input
                            type="date"
                            value={selectedFecha}
                            onChange={(e) => setSelectedFecha(e.target.value)}
                            className="h-10 bg-white border-slate-400 rounded-2xl text-[11px] text-gray-600 font-black px-4 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <div className="flex items-center gap-2 bg-slate-50 p-1 text-gray-600 h-10 rounded-[1.5rem] border border-slate-400">
                            <select
                                value={selectedAccionId}
                                onChange={(e) =>
                                    setSelectedAccionId(e.target.value)
                                }
                                className="bg-transparent border-none text-[11px] font-black uppercase px-4 min-w-[200px] focus:ring-0 cursor-pointer"
                            >
                                <option value="">
                                    Seleccione actividad...
                                </option>
                                {tiposAccion.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre}
                                    </option>
                                ))}
                            </select>

                            {selectedAccion && (
                                <button
                                    onClick={openEditTipo}
                                    className="p-2.5 hover:bg-amber-500 bg-amber-400 rounded-xl text-slate-50 transition-all shadow-sm hover:text-amber-100"
                                    title="Editar actividad"
                                >
                                    <Pencil size={14} />
                                </button>
                            )}

                            {selectedAccion && (
                                <button
                                    onClick={handleDeleteTipo}
                                    className="p-2.5 hover:bg-rose-600 rounded-xl bg-rose-400 text-slate-50 transition-all shadow-sm hover:text-rose-100"
                                    title="Eliminar actividad y registros"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}

                            <button
                                onClick={openNewTipo}
                                className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
                                title="Crear nueva actividad"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                }
                actions={
                    <div className="flex gap-2 flex-wrap items-center">
                        <Button
                            onClick={() =>
                                router.get(route("empleados.acciones.index"))
                            }
                            
                        >
                            <ArrowLeftCircle size={18} /> VOLVER
                        </Button>

                        {/* NUEVO BOTÓN DE PAGO ESPECIAL */}
                        {selectedEmployees.length > 0 && selectedAccion && (
                            <Button
                                onClick={handlePagoEspecial}
                                className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                                disabled={isSubmittingPago}
                            >
                                {isSubmittingPago ? (
                                    <>
                                        <Loader2
                                            className="animate-spin"
                                            size={18}
                                        />
                                        PROCESANDO...
                                    </>
                                ) : (
                                    <>
                                        <Icons.Users size={18} />
                                        PAGO ESPECIAL (
                                        {selectedEmployees.length})
                                    </>
                                )}
                            </Button>
                        )}
                        {selectedAccion && (
                            <div className="flex gap-1">
                                <ActionButton
                                    icon={UserSquare2}
                                    label="Listado para Firmas"
                                    onClick={() =>
                                        handlePrint(
                                            "listado-de-firmas-acciones",
                                        )
                                    }
                                    color="emerald"
                                />
                                <ActionButton
                                    icon={PrinterCheck}
                                    label="Reportes de pagos"
                                    onClick={() =>
                                        handlePrint("reporte-pagos-acciones")
                                    }
                                    color="rose"
                                />
                            </div>
                        )}
                    </div>
                }
                footerStats={
                    selectedAccion ? (
                        <div className="flex items-center gap-8 text-[11px] font-black uppercase italic text-slate-500 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span>Progreso:</span>
                                <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${stats.total_empleados > 0 ? (stats.pagados / stats.total_empleados) * 100 : 0}%`,
                                        }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                                <span className="text-emerald-600">
                                    {stats.pagados}/{stats.total_empleados}
                                </span>
                            </div>
                            <div className="bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100 text-indigo-600">
                                Total:{" "}
                                <span className="text-sm font-black">
                                    $
                                    {stats.total_recaudado?.toFixed(2) ||
                                        "0.00"}
                                </span>
                            </div>
                        </div>
                    ) : null
                }
            >
                <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse min-w-[800px]">
                            <thead className="bg-blue-600 text-white text-[10px] font-black uppercase italic">
                                <tr>
                                    <th className="px-2 py-5 text-center w-10">
                                        {/* <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-white bg-transparent checked:bg-white checked:border-white"
                                            checked={
                                                selectedEmployees.length ===
                                                    filteredEmpleados.length &&
                                                filteredEmpleados.length > 0
                                            }
                                            onChange={handleSelectAll}
                                        /> */}
                                        #
                                    </th>
                                    <th className="px-8 py-5 text-left">
                                        Empleado
                                    </th>
                                    <th className="px-8 py-5 text-center">
                                        Metodo de Pago Y Referencia
                                    </th>
                                    <th className="px-8 py-5 text-center">
                                        Monto
                                    </th>
                                    <th className="px-8 py-5 text-center">
                                        Estado del Pago
                                    </th>
                                    <th className="px-8 py-5 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-[11px]">
                                {filteredEmpleados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-8 py-16 text-center text-slate-400 font-bold"
                                        >
                                            No hay empleados que coincidan con
                                            la búsqueda
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmpleados.map((emp) => {
                                        const pagosEmp = emp.pagos || [];
                                        const totalPagado = pagosEmp.reduce(
                                            (acc, p) =>
                                                acc + Number(p.monto_item),
                                            0,
                                        );
                                        const tienePagos = pagosEmp.length > 0;
                                        const totalRequerido =
                                            getTotalRequerido();
                                        const estaCompleto =
                                            tienePagos &&
                                            totalPagado >= totalRequerido;

                                        return (
                                            <tr
                                                key={emp.id}
                                                className="hover:bg-indigo-50/20 transition-all group"
                                            >
                                                <td className="px-2 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedEmployees.includes(
                                                            emp.id,
                                                        )}
                                                        onChange={() =>
                                                            handleSelectEmployee(
                                                                emp.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isProcessingAction ||
                                                            isSubmittingPago
                                                        }
                                                    />
                                                </td>
                                                <td className="px-8 py-4 text-left font-black text-slate-800 uppercase leading-none">
                                                    {emp.nombres}{" "}
                                                    {emp.apellidos}
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                        C.I: {emp.cedula}
                                                    </p>
                                                </td>

                                                <td className="px-8 py-4 text-center">
                                                    {tienePagos ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            {pagosEmp.map(
                                                                (p, idx) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-black text-[9px] uppercase">
                                                                            {
                                                                                p.metodo_item
                                                                            }
                                                                        </span>
                                                                        {p.ref_item && (
                                                                            <span className="text-[10px] font-bold text-slate-600">
                                                                                #
                                                                                {
                                                                                    p.ref_item
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic opacity-50 text-[10px]">
                                                            pendiente
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-8 py-4 text-center">
                                                    {tienePagos ? (
                                                        <div className="flex flex-col items-center">
                                                            <span
                                                                className={`font-black text-[11px] ${estaCompleto ? "text-emerald-600" : "text-amber-600"}`}
                                                            >
                                                                $
                                                                {totalPagado.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                            {pagosEmp.length >
                                                                1 && (
                                                                <span className="text-[9px] text-slate-400 font-bold">
                                                                    (
                                                                    {
                                                                        pagosEmp.length
                                                                    }{" "}
                                                                    abonos)
                                                                </span>
                                                            )}
                                                            {!estaCompleto && (
                                                                <span className="text-[9px] text-rose-400 font-bold">
                                                                    Faltan: $
                                                                    {(
                                                                        totalRequerido -
                                                                        totalPagado
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 font-black text-[10px]">
                                                            Deuda: $
                                                            {totalRequerido.toFixed(
                                                                2,
                                                            )}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-8 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenPagoModal(
                                                                emp,
                                                            )
                                                        }
                                                        className="active:scale-95 transition-all"
                                                        disabled={
                                                            isProcessingAction
                                                        }
                                                    >
                                                        {estaCompleto ? (
                                                            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-emerald-200 shadow-sm">
                                                                <CheckCircle
                                                                    size={12}
                                                                />{" "}
                                                                Completado
                                                            </span>
                                                        ) : tienePagos ? (
                                                            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-amber-200 shadow-sm">
                                                                <Pencil
                                                                    size={12}
                                                                />{" "}
                                                                Abonar
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-400 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">
                                                                <XCircle
                                                                    size={12}
                                                                />{" "}
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {tienePagos && (
                                                            <>
                                                                {estaCompleto && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRevertirPagos(
                                                                                emp,
                                                                            )
                                                                        }
                                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                        title="Revertir todos los pagos"
                                                                        disabled={
                                                                            isProcessingAction
                                                                        }
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        Swal.fire(
                                                                            {
                                                                                title: "Resumen de Pagos",
                                                                                html: `
                                                                                <div class='text-left text-sm'>
                                                                                    ${pagosEmp
                                                                                        .map(
                                                                                            (
                                                                                                p,
                                                                                                idx,
                                                                                            ) => `
                                                                                        <div class="mb-2 p-2 bg-slate-50 rounded-lg">
                                                                                            <b>Pago ${idx + 1}:</b><br>
                                                                                            <b>Método:</b> ${p.metodo_item}<br>
                                                                                            <b>Monto:</b> $${Number(p.monto_item).toFixed(2)}<br>
                                                                                            ${p.ref_item ? `<b>Ref:</b> ${p.ref_item}<br>` : ""}
                                                                                            <b>Fecha:</b> ${dayjs(p.fecha_pago).format("DD-MM-YYYY")}
                                                                                        </div>
                                                                                    `,
                                                                                        )
                                                                                        .join(
                                                                                            "",
                                                                                        )}
                                                                                </div>
                                                                            `,
                                                                                icon: "info",
                                                                                customClass:
                                                                                    {
                                                                                        popup: "rounded-[2rem] max-w-md",
                                                                                    },
                                                                                confirmButtonColor:
                                                                                    "#6366f1",
                                                                            },
                                                                        );
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
                                                                    title="Ver detalle de pagos"
                                                                >
                                                                    <Search
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>

            {/* MODAL CONFIGURACIÓN CONCEPTO */}
            <AnimatePresence>
                {isConfigModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="bg-slate-900 p-8 text-white font-black uppercase italic tracking-widest">
                                {isEditingTipo ? "Editar" : "Nuevo"} Concepto
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const url = isEditingTipo
                                        ? route(
                                              "empleados.acciones.tipos.update",
                                              selectedAccion.id,
                                          )
                                        : route(
                                              "empleados.acciones.tipos.store",
                                          );
                                    tipoForm[isEditingTipo ? "put" : "post"](
                                        url,
                                        {
                                            onSuccess: () => {
                                                setIsConfigModalOpen(false);
                                                tipoForm.reset();
                                            },
                                        },
                                    );
                                }}
                                className="p-8 space-y-5"
                            >
                                <Field
                                    label="Nombre del Cobro"
                                    autoFocus
                                    value={tipoForm.data.nombre}
                                    onChange={(e) =>
                                        tipoForm.setData(
                                            "nombre",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <Field
                                    label="Costo Base ($)"
                                    type="number"
                                    step="0.01"
                                    value={tipoForm.data.costo_base}
                                    onChange={(e) =>
                                        tipoForm.setData(
                                            "costo_base",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <Field
                                    label="Costo Adicional ($)"
                                    type="number"
                                    step="0.01"
                                    value={tipoForm.data.costo_adicional}
                                    onChange={(e) =>
                                        tipoForm.setData(
                                            "costo_adicional",
                                            e.target.value,
                                        )
                                    }
                                />
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsConfigModalOpen(false)
                                        }
                                        className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 rounded-xl"
                                    >
                                        Cancelar
                                    </button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={tipoForm.processing}
                                        className="flex-1 rounded-2xl py-4 font-black"
                                    >
                                        GUARDAR
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL PROCESAR PAGO */}
            <AnimatePresence>
                {isPagoModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[1.5rem] w-full max-w-lg overflow-hidden shadow-3xl"
                        >
                            {/* Header */}
                            <div
                                className={`p-4 transition-colors duration-500 ${
                                    Math.abs(
                                        calcularSumaActual() -
                                            getTotalRequerido(),
                                    ) < 0.01
                                        ? "bg-emerald-600"
                                        : "bg-rose-500 animate-pulse"
                                } text-white`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic">
                                            Registrar Pago
                                        </h3>
                                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                                            {empleadoSeleccionado?.nombres}{" "}
                                            {empleadoSeleccionado?.apellidos}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black opacity-60 uppercase">
                                            Total Requerido
                                        </p>
                                        <p className="text-3xl font-black">
                                            ${getTotalRequerido().toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form
                                onSubmit={submitPago}
                                className="p-2 space-y-1 max-h-[60vh] overflow-y-auto"
                            >
                                {Object.keys(
                                    pagoForm.data.pagos_seleccionados,
                                ).map((metodo) => {
                                    const item =
                                        pagoForm.data.pagos_seleccionados[
                                            metodo
                                        ];
                                    const esReferenciaRequerida = [
                                        "Transferencia",
                                        "Pago Móvil",
                                    ].includes(metodo);
                                    const esBase = getMetodoBase() === metodo;
                                    const tieneMonto = Number(item.monto) > 0;

                                    return (
                                        <div
                                            key={metodo}
                                            className={`p-2 rounded-[1rem] border-2 transition-all ${
                                                item.activo
                                                    ? esBase
                                                        ? "border-emerald-500 bg-emerald-50/50"
                                                        : "border-indigo-500 bg-indigo-50/50"
                                                    : "border-slate-600 opacity-50"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded-full border-slate-800 text-indigo-600 focus:ring-indigo-500"
                                                        checked={item.activo}
                                                        onChange={() =>
                                                            handleMetodoCheckboxChange(
                                                                metodo,
                                                            )
                                                        }
                                                    />
                                                    <span
                                                        className={`text-[11px] font-black uppercase ${esBase && item.activo ? "text-emerald-600" : "text-slate-700"}`}
                                                    >
                                                        {metodo}
                                                        {esBase &&
                                                            item.activo &&
                                                            tieneMonto &&
                                                            " (BASE)"}
                                                    </span>
                                                </div>
                                                {item.activo && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-bold text-slate-400">
                                                            MONTO:
                                                        </span>
                                                        <input
                                                            ref={(el) =>
                                                                (montoInputRefs.current[
                                                                    metodo
                                                                ] = el)
                                                            }
                                                            type="number"
                                                            step="0.01"
                                                            className={`w-24 bg-white border-b-2 text-right px-2 py-1 text-sm font-black outline-none focus:border-indigo-600 text-slate-900 ${esBase ? "border-emerald-400" : "border-indigo-200"}`}
                                                            value={item.monto}
                                                            onChange={(e) =>
                                                                handleMontoChange(
                                                                    metodo,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0.00"
                                                            disabled={
                                                                !item.activo
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {item.activo &&
                                                esReferenciaRequerida && (
                                                    <div className="mt-2 pl-8">
                                                        <input
                                                            ref={(el) =>
                                                                (refInputRefs.current[
                                                                    metodo
                                                                ] = el)
                                                            }
                                                            type="text"
                                                            placeholder="Número de Referencia (Obligatorio)"
                                                            className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900"
                                                            value={item.ref}
                                                            onChange={(e) => {
                                                                const n = {
                                                                    ...pagoForm
                                                                        .data
                                                                        .pagos_seleccionados,
                                                                };
                                                                n[metodo].ref =
                                                                    e.target.value;
                                                                pagoForm.setData(
                                                                    "pagos_seleccionados",
                                                                    n,
                                                                );
                                                            }}
                                                            required={
                                                                item.activo &&
                                                                esReferenciaRequerida
                                                            }
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                            </form>

                            {/* Footer */}
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">
                                        Suma Actual:
                                    </p>
                                    <p
                                        className={`text-xl font-black ${
                                            Math.abs(
                                                calcularSumaActual() -
                                                    getTotalRequerido(),
                                            ) < 0.01
                                                ? "text-emerald-600"
                                                : "text-rose-600"
                                        }`}
                                    >
                                        ${calcularSumaActual().toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsPagoModalOpen(false)
                                        }
                                        className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-100 rounded-xl"
                                        disabled={isSubmittingPago} // <-- DESHABILITAR MIENTRAS CARGA
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitPago}
                                        className="rounded-2xl px-8 py-4 bg-slate-900 font-black shadow-xl hover:bg-slate-800 text-white flex items-center justify-center min-w-[160px] disabled:opacity-70 disabled:cursor-not-allowed"
                                        disabled={
                                            Math.abs(
                                                calcularSumaActual() -
                                                    getTotalRequerido(),
                                            ) > 0.01 || isSubmittingPago // <-- USAR isSubmittingPago
                                        }
                                    >
                                        {isSubmittingPago ? ( // <-- USAR isSubmittingPago
                                            <>
                                                <Loader2
                                                    className="animate-spin mr-2"
                                                    size={18}
                                                />
                                                <span>PROCESANDO...</span>
                                            </>
                                        ) : (
                                            "PROCESAR PAGO"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
