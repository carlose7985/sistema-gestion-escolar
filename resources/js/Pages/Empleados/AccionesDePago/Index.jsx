import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import { Field, SelectField } from "@/Components/layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";

import {
    Plus,
    Trash2,
    CheckCircle,
    Pencil,
    Search,
    XCircle,
    Printer,
    ArrowLeftCircle,
    Unlock,
    Loader2,
    Lock,
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
    // Función para eliminar acentos
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
    const refItemInputRef = useRef(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [isEditingTipo, setIsEditingTipo] = useState(false);
    const [isEditingPago, setIsEditingPago] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

    // --- ACTIVIDAD SELECCIONADA (ESTO MANDA TODO EL COMPORTAMIENTO) ---
    const selectedAccion = useMemo(() => {
        return tiposAccion.find((t) => t.id == selectedAccionId) || null;
    }, [selectedAccionId, tiposAccion]);

    const handleFiltrar = useCallback(
        debounce((q, t, f) => {
            router.get(
                route("empleados.acciones.pagos.index"),
                { search: q, tipo_id: t, fecha: f },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 400),
        [],
    );

    useEffect(() => {
        handleFiltrar(search, selectedAccionId, selectedFecha);
    }, [search, selectedAccionId, selectedFecha]);

    // Efecto para autofocus en el buscador después de acciones
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [empleados.data]); // Se ejecuta cuando cambia la lista de empleados

    // --- 1. LÓGICA DE IMPRESIÓN (BLOQUEO SI ESTÁ ABIERTA) ---
    const handlePrint = () => {
        if (!selectedAccion) return;

        if (selectedAccion.status == 1) {
            // 1 = ABIERTO
            Swal.fire({
                title: "Impresión bloqueada",
                text: "Debes CERRAR la actividad para poder generar el reporte final de recaudación.",
                icon: "warning",
                confirmButtonColor: "#6366f1",
                customClass: { popup: "rounded-[2.5rem]" },
            });
            return;
        }
        window.open(
            route(
                "empleados.acciones.pagos.imprimir.reporte",
                selectedAccion.id,
            ),
            "_blank",
        );
    };

    // --- 2. LÓGICA DE CAMBIO DE STATUS (DINAMISMO) ---
    const handleToggleStatus = () => {
        if (!selectedAccion) return;
        const isCurrentlyOpen = selectedAccion.status == 1;

        Swal.fire({
            title: isCurrentlyOpen
                ? "¿Cerrar actividad?"
                : "¿Reabrir actividad?",
            text: isCurrentlyOpen
                ? "Al cerrar, nadie podrá registrar más pagos."
                : "Al reabrir, se habilitará de nuevo el registro de pagos.",
            icon: isCurrentlyOpen ? "warning" : "question",
            showCancelButton: true,
            confirmButtonText: isCurrentlyOpen ? "Sí, cerrar" : "Sí, reabrir",
            confirmButtonColor: isCurrentlyOpen ? "#f59e0b" : "#10b981",
            customClass: { popup: "rounded-[2.5rem]" },
        }).then((result) => {
            if (result.isConfirmed) {
                setIsProcessingAction(true);
                const routeName = isCurrentlyOpen
                    ? "empleados.acciones.tipos.cerrar"
                    : "empleados.acciones.tipos.reabrir";
                router.post(
                    route(routeName, selectedAccion.id),
                    {},
                    {
                        onFinish: () => {
                            setIsProcessingAction(false);
                            // Limpiar el buscador y enfocarlo
                            setSearch("");
                            if (searchInputRef.current) {
                                searchInputRef.current.focus();
                            }
                        },
                        onSuccess: () => {},
                    },
                );
            }
        });
    };

    // --- 3. LÓGICA DE PAGOS (BLOQUEO SI ESTÁ CERRADA) ---
    const handleStatusToggle = (emp) => {
        if (!selectedAccion) return toast.warning("Seleccione una actividad");

        // VALIDACIÓN: Si status es 0 (Cerrado), lanzamos alerta y no abrimos nada
        if (selectedAccion.status == 0) {
            Swal.fire({
                title: "Actividad Cerrada",
                text: "No se permiten registrar, editar ni borrar pagos en una actividad finalizada. Debe reabrirla primero.",
                icon: "lock",
                confirmButtonColor: "#6366f1",
                customClass: { popup: "rounded-[2.5rem]" },
            });
            return;
        }

        if (emp.pago_registrado) {
            Swal.fire({
                title: "¿Revertir Pago?",
                text: `Se eliminará el registro de ${emp.nombres}.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                customClass: { popup: "rounded-[2.5rem]" },
            }).then((result) => {
                if (result.isConfirmed)
                    router.delete(
                        route(
                            "empleados.acciones.pagos.destroy",
                            emp.pago_registrado.id,
                        ),
                        { preserveScroll: true },
                    );
            });
        } else {
            setEmpleadoSeleccionado(emp);
            setIsEditingPago(false);
            pagoForm.setData({
                empleado_id: emp.id,
                accion_tipo_id: selectedAccion.id,
                monto_item: selectedAccion.costo_base,
                metodo_item: "Pago Movil", // Valor por defecto
                ref_item: "",
                fecha_pago: selectedFecha,
            });
            setIsPagoModalOpen(true);
        }
    };

    // --- FORMULARIOS ---
    const tipoForm = useForm({ nombre: "", costo_base: 0 });
    const pagoForm = useForm({
        id: null,
        empleado_id: "",
        accion_tipo_id: "",
        monto_item: 0,
        metodo_item: "Pago Movil",
        ref_item: "",
        fecha_pago: selectedFecha,
    });

  useEffect(() => {
      if (pagoForm.errors.ref_item && refItemInputRef.current) {
          // Mostrar el Swal primero
          Swal.fire({
              icon: "error",
              title: "🔴 Esta referencia ya se utilizo",
              html: `
                <div class="swal-content">
                    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%); padding: 20px; border-radius: 16px; margin: 10px 0;">
                        <p style="color: #dc2626; font-weight: 600; margin-bottom: 8px;">
                            ⚠️ Esta referencia ya fue registrada
                        </p>
                        <p style="color: #64748b; font-size: 14px;">
                            Si desea usar la misma referencia, agrege un 
                            <span style="background: #fbbf24; padding: 2px 8px; border-radius: 6px; font-weight: 700; color: #000;">-</span> 
                            al final del código
                        </p>
                    </div>
                    <div style="background: #f8fafc; padding: 12px; border-radius: 10px; text-align: center; margin-top: 8px;">
                        <code style="background: #1e293b; color: #e2e8f0; padding: 6px 12px; border-radius: 8px; font-size: 12px;">
                            REF-123 → REF-123-
                        </code>
                    </div>
                </div>
            `,
              confirmButtonText: "👌 OK",
              confirmButtonColor: "#10b981",
              background: "#ffffff",
              customClass: {
                  popup: "rounded-[2rem] shadow-2xl border-b-8 border-emerald-500",
                  title: "text-2xl font-black text-slate-800",
                  confirmButton:
                      "px-8 py-3.5 text-sm font-black uppercase rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all bg-emerald-500 hover:bg-emerald-600 text-white",
              },
              buttonsStyling: false,
          }).then(() => {
              // Después de cerrar el Swal, enfocar el input
              setTimeout(() => {
                  if (refItemInputRef.current) {
                      refItemInputRef.current.focus();
                      // Colocar el cursor al final del texto sin seleccionar
                      const length = refItemInputRef.current.value.length;
                      refItemInputRef.current.setSelectionRange(length, length);
                  }
              }, 100);
          });
      }
  }, [pagoForm.errors.ref_item]);
    const submitPago = (e) => {
        e.preventDefault();
        if (
            !["Efectivo", "Divisa"].includes(pagoForm.data.metodo_item) &&
            !pagoForm.data.ref_item
        ) {
            return toast.error(
                "La referencia es obligatoria para este método de pago",
            );
        }
        const url = isEditingPago
            ? route("empleados.acciones.pagos.update", pagoForm.data.id)
            : route("empleados.acciones.pagos.store");
        pagoForm[isEditingPago ? "put" : "post"](url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsPagoModalOpen(false);
                // Limpiar el buscador y enfocarlo después del pago
                setSearch("");
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            },
        });
    };

    const openEditTipo = () => {
        if (!selectedAccion) return;
        setIsEditingTipo(true);
        tipoForm.setData({
            nombre: selectedAccion.nombre,
            costo_base: selectedAccion.costo_base,
        });
        setIsConfigModalOpen(true);
    };

    const handleDeleteTipo = () => {
        if (!selectedAccion) return;

        // 1. Validar si la actividad está cerrada (Status 0)
        if (selectedAccion.status == 0) {
            return Swal.fire({
                title: "Acción bloqueada",
                text: "Solo se pueden eliminar actividades que no hayan sido previamente CERRADAS.",
                icon: "error",
                confirmButtonColor: "#6366f1",
                customClass: { popup: "rounded-[2.5rem]" },
            });
        }

        // 2. Validar si ha pasado al menos un mes desde su creación
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

        // 3. Confirmación final con Swal
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
                            setSelectedAccionId(""); // Limpiar selección
                            setSearch(""); // Limpiar buscador
                            if (searchInputRef.current) {
                                searchInputRef.current.focus();
                            }
                        },
                        onSuccess: () => {
                            // toast.success("Actividad y registros eliminados");
                        },
                    },
                );
            }
        });
    };

    // Función para filtrar empleados con búsqueda sin acentos
    const filteredEmpleados = useMemo(() => {
        if (!search.trim()) return empleados.data;

        const searchLower = search.toLowerCase().trim();
        const searchWithoutAccents = removeAccents(searchLower);

        return empleados.data.filter((emp) => {
            const nombresCompletos =
                `${emp.nombres} ${emp.apellidos}`.toLowerCase();
            const nombresSinAcentos = removeAccents(nombresCompletos);
            const cedula = emp.cedula.toString();

            // Obtenemos la referencia si existe
            const refItem = emp.pago_registrado?.ref_item?.toLowerCase() || "";

            return (
                nombresSinAcentos.includes(searchWithoutAccents) ||
                nombresCompletos.includes(searchLower) ||
                cedula.includes(searchLower) ||
                refItem.includes(searchLower) // <--- Nueva línea de búsqueda
            );
        });
    }, [empleados.data, search]);

    return (
        <AuthenticatedLayout>
            <Head title="Caja de Empleados" />

            {/* SPINNER GLOBAL DE PROCESAMIENTO */}
            <AnimatePresence>
                {isProcessingAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
                    >
                        <Loader2
                            className="animate-spin text-indigo-600 mb-4"
                            size={54}
                            strokeWidth={3}
                        />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-800">
                            Actualizando Caja
                        </h2>
                    </motion.div>
                )}
            </AnimatePresence>

            <ViewContainer
                title={
                    selectedAccion
                        ? `CAJA: ${selectedAccion.nombre} [${selectedAccion.status == 1 ? "ABIERTO" : "CERRADO"}]`
                        : "Caja de Empleados"
                }
                subtitle="Control general de ventas"
                icon="ShoppingCart"
                showSearch={true}
                searchValue={search}
                onSearch={setSearch}
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
                    <div className="flex items-center gap-3">
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

                            {/* BOTÓN EDITAR */}
                            {selectedAccion && (
                                <button
                                    onClick={openEditTipo}
                                    className="p-2.5 hover:bg-amber-500 bg-green-400 rounded-xl text-slate-50 transition-all shadow-sm hover:text-amber-100"
                                    title="Editar actividad"
                                >
                                    <Pencil size={14} />
                                </button>
                            )}

                            {/* BOTÓN ELIMINAR (NUEVO) */}
                            {selectedAccion && (
                                <button
                                    onClick={handleDeleteTipo}
                                    className="p-2.5 hover:bg-rose-600 rounded-xl bg-rose-400 text-slate-50 transition-all shadow-sm hover:text-rose-100"
                                    title="Eliminar actividad y registros"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}

                            {/* BOTÓN NUEVO */}
                            <button
                                onClick={() => {
                                    setIsEditingTipo(false);
                                    tipoForm.reset();
                                    setIsConfigModalOpen(true);
                                }}
                                className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
                                title="Crear nueva actividad"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
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
                        {selectedAccion && (
                            <>
                                {/* BOTÓN REPORTE CON ESTADO VISUAL */}
                                <Button
                                    onClick={handlePrint}
                                    className={`btn-primary px-4 py-2 bg-indigo-600 transition-all ${selectedAccion.status == 1 ? "opacity-30 grayscale cursor-not-allowed" : "shadow-indigo-100"}`}
                                >
                                    <Printer size={16} /> REPORTE
                                </Button>

                                {/* BOTÓN DINÁMICO QUE CAMBIA DE CERRAR A REABRIR */}
                                <Button
                                    onClick={handleToggleStatus}
                                    className={`btn-primary px-4 py-2 flex items-center gap-2 shadow-xl ${selectedAccion.status == 1 ? "bg-amber-500 shadow-amber-100" : "bg-emerald-600 shadow-emerald-100"}`}
                                >
                                    {selectedAccion.status == 1 ? (
                                        <>
                                            {" "}
                                            <Lock size={16} /> CERRAR COBRO{" "}
                                        </>
                                    ) : (
                                        <>
                                            {" "}
                                            <Unlock size={16} /> REABRIR
                                            COBRO{" "}
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                }
                footerStats={
                    selectedAccion ? (
                        <div className="flex items-center gap-8 text-[11px] font-black uppercase italic text-slate-500">
                            <div className="flex items-center gap-3">
                                <span>Progreso:</span>
                                <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(stats.pagados / stats.total_empleados) * 100}%`,
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
                                    ${stats.total_recaudado.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ) : null
                }
            >
                <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl border border-slate-100">
                    <table className="w-full text-center border-collapse">
                        <thead className="bg-blue-600 text-white text-[10px] font-black uppercase italic">
                            <tr className=" text-[10px] font-black uppercas border-b border-slate-100">
                                <th className="px-8 py-5 text-left">
                                    Empleado
                                </th>
                                <th className="px-8 py-5 text-center">
                                    Metodo de Pago Y Referencia
                                </th>
                                <th className="px-8 py-5 text-center">
                                    Monto de Referencia
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
                            {filteredEmpleados.map((emp) => (
                                <tr
                                    key={emp.id}
                                    className="hover:bg-indigo-50/20 transition-all group"
                                >
                                    <td className="px-8 py-4 text-left font-black text-slate-800 uppercase leading-none">
                                        {emp.nombres} {emp.apellidos}
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                                            C.I: {emp.cedula}
                                        </p>
                                    </td>

                                    <td className="px-8 py-4 text-center">
                                        {emp.pago_registrado ? (
                                            <div className="flex flex-col items-center gap-1.5">
                                                {/* Badge del Método */}
                                                <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 font-black text-[10px] uppercase leading-none">
                                                    {
                                                        emp.pago_registrado
                                                            .metodo_item
                                                    }
                                                </span>

                                                {/* Referencia (Solo si NO es Efectivo y NO es Divisa) */}
                                                {![
                                                    "Efectivo",
                                                    "Divisa",
                                                ].includes(
                                                    emp.pago_registrado
                                                        .metodo_item,
                                                ) && (
                                                    <span className="text-[15px] font-black text-slate-900 flex items-center gap-1 italic">
                                                        Ref:{" "}
                                                        {emp.pago_registrado
                                                            .ref_item || "S/R"}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-900 italic lowercase opacity-50 tracking-tighter text-[11px]">
                                                pendiente
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-8 py-4 text-center">
                                        {emp.pago_registrado ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg border border-indigo-100 font-black text-[10px]">
                                                    PAGO: Bs{" "}
                                                    {
                                                        emp.pago_registrado
                                                            .monto_item
                                                    }
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg border border-slate-100 italic font-black text-[10px]">
                                                Deuda: Bs{" "}
                                                {selectedAccion?.costo_base ||
                                                    "0.00"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        {/* EL BOTÓN DE PAGO AHORA VALIDA EL STATUS CERRADO */}
                                        <button
                                            onClick={() =>
                                                handleStatusToggle(emp)
                                            }
                                            className="active:scale-95 transition-all"
                                        >
                                            {emp.pago_registrado ? (
                                                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-emerald-200 shadow-sm">
                                                    <CheckCircle size={12} />{" "}
                                                    Pagado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-400 px-5 py-2 rounded-full text-[10px] font-black uppercase border border-slate-200 hover:border-indigo-300 hover:text-indigo-600">
                                                    <XCircle size={12} />{" "}
                                                    Pendiente
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* BLOQUEO DE EDICIÓN SI ESTÁ CERRADA */}
                                            {emp.pago_registrado &&
                                                selectedAccion?.status == 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setEmpleadoSeleccionado(
                                                                emp,
                                                            );
                                                            setIsEditingPago(
                                                                true,
                                                            );
                                                            pagoForm.setData({
                                                                id: emp
                                                                    .pago_registrado
                                                                    .id,
                                                                monto_item:
                                                                    emp
                                                                        .pago_registrado
                                                                        .monto_item,
                                                                metodo_item:
                                                                    emp
                                                                        .pago_registrado
                                                                        .metodo_item,
                                                                ref_item:
                                                                    emp
                                                                        .pago_registrado
                                                                        .ref_item,
                                                                fecha_pago:
                                                                    emp
                                                                        .pago_registrado
                                                                        .fecha_pago,
                                                            });
                                                            setIsPagoModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}
                                            {emp.pago_registrado && (
                                                <button
                                                    onClick={() =>
                                                        Swal.fire({
                                                            title: "Resumen",
                                                            html: `<div class='text-left text-sm'><b>Método:</b> ${emp.pago_registrado.metodo_item}<br><b>Ref:</b> ${emp.pago_registrado.ref_item || "S/R"}<br><b>Fecha:</b> ${dayjs(emp.pago_registrado.fecha_pago).format("DD-MM-YYYY")}</div>`,
                                                            icon: "info",
                                                            customClass: {
                                                                popup: "rounded-[2rem]",
                                                            },
                                                        })
                                                    }
                                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
                                                >
                                                    <Search size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ViewContainer>

            {/* MODAL CONFIGURACIÓN CONCEPTO (NUEVO O EDITAR) */}
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
                                    value={tipoForm.data.costo_base}
                                    onChange={(e) =>
                                        tipoForm.setData(
                                            "costo_base",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsConfigModalOpen(false)
                                        }
                                        className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400"
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
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-3xl"
                        >
                            <div
                                className={`${isEditingPago ? "bg-amber-500" : "bg-indigo-600"} p-10 text-white flex justify-between items-center`}
                            >
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic leading-none">
                                        {isEditingPago
                                            ? "Actualizar"
                                            : "Confirmar"}
                                    </h3>
                                    <p className="text-white/70 text-[11px] font-bold uppercase mt-2 tracking-widest">
                                        {empleadoSeleccionado?.nombres}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase opacity-60">
                                        Monto
                                    </p>
                                    <p className="text-4xl font-black">
                                        $
                                        {Number(
                                            pagoForm.data.monto_item,
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <form
                                onSubmit={submitPago}
                                className="p-10 space-y-6"
                            >
                                <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={pagoForm.data.monto_item}
                                        onChange={(e) =>
                                            pagoForm.setData(
                                                "monto_item",
                                                e.target.value,
                                            )
                                        }
                                        className="text-3xl font-black bg-transparent border-none p-0 w-full focus:ring-0 text-slate-800"
                                    />
                                    <SelectField
                                        label="Método de Pago"
                                        value={pagoForm.data.metodo_item}
                                        onChange={(e) =>
                                            pagoForm.setData(
                                                "metodo_item",
                                                e.target.value,
                                            )
                                        }
                                        options={metodos}
                                    />

                                    {/* Solo se muestra si el método NO es Efectivo y NO es Divisa */}
                                    {!["Efectivo", "Divisa"].includes(
                                        pagoForm.data.metodo_item,
                                    ) && (
                                        <input
                                            ref={refItemInputRef}
                                            type="text"
                                            placeholder="Nro de Operación"
                                            value={pagoForm.data.ref_item}
                                            onChange={(e) =>
                                                pagoForm.setData(
                                                    "ref_item",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full mt-1 px-5 py-2.5 text-gray-600 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                            required
                                        />
                                    )}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsPagoModalOpen(false)
                                        }
                                        className="flex-1 py-5 text-[11px] font-black uppercase text-slate-400 hover:bg-slate-50 rounded-2xl"
                                    >
                                        Cancelar
                                    </button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={pagoForm.processing}
                                        className="flex-[2] rounded-2xl font-black py-6 bg-slate-900 shadow-2xl"
                                    >
                                        PROCESAR
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
