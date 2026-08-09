"use client";
import React, { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import {
    Section,
    Field,
    SelectField,
} from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export default function CenaeIndex({
    insumos = [],
    movimientos = { data: [] },
    historialCierres = [],
}) {
    // --- 1. ESTADOS DE NAVEGACIÓN Y MODALES (Nivel Raíz) ---
    const [filtroFecha, setFiltroFecha] = useState("");

    const [view, setView] = useState("dashboard");
    const [showRubroModal, setShowRubroModal] = useState(false);
    const [showEditInsumo, setShowEditInsumo] = useState(false);
    const [showComensalesModal, setShowComensalesModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showEditMovimientoModal, setShowEditMovimientoModal] =
        useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [itemToEdit, setItemToEdit] = useState(null);
    const [movimientoToEdit, setMovimientoToEdit] = useState(null);
    const [mesReporte, setMesReporte] = useState(
        new Date().toISOString().slice(0, 7),
    );
    const [focusInputId, setFocusInputId] = useState(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRefs = useRef({});
    const [errors, setErrors] = useState({});
const movimientosFiltrados = filtroFecha
    ? movimientos.data.filter((mov) => {
          const fechaMov = new Date(mov.fecha);
          const fechaFiltro = new Date(filtroFecha);
          return fechaMov.toDateString() === fechaFiltro.toDateString();
      })
    : movimientos.data;

    // --- 2. FORMULARIOS ---
    const formMov = useForm({
        fecha: new Date().toISOString().split("T")[0],
        tipo: "salida",
        items: [],
        estudiantes: "",
        cocineras: "",
        personal: "",
        descripcion: "",
    });

    const formRubro = useForm({
        nombre: "",
        unidad_medida: "",
        peso_medida: "",
    });

    const formEdit = useForm({
        nombre: "",
        unidad_medida: "",
        peso_medida: "",
    });

    const formEditMovimiento = useForm({
        fecha: "",
        tipo: "",
        items: [],
        estudiantes: "",
        cocineras: "",
        personal: "",
        descripcion: "",
    });

    // --- 3. FUNCIONES DE PROCESAMIENTO ---
    const toggleItem = (id, stockActual) => {
        // Validación: si hay un input con foco, no permitir seleccionar otro
        if (isInputFocused) {
            toast.warning(
                "Complete la cantidad del rubro seleccionado primero",
            );
            return;
        }

        // Validación para salida: no permitir seleccionar si stock es 0
        const currentView = view === "entrada" ? "entrada" : "salida";
        if (currentView === "salida" && stockActual <= 0) {
            toast.error(`No hay stock disponible de este rubro`);
            return;
        }

        const newItems = { ...selectedItems };
        if (newItems[id] !== undefined) {
            delete newItems[id];
            setFocusInputId(null);
            setIsInputFocused(false);
            // Limpiar error del campo
            setErrors((prev) => ({ ...prev, [id]: undefined }));
        } else {
            newItems[id] = "";
            setFocusInputId(id);
            setIsInputFocused(true);
            // Enfocar el input después del render
            setTimeout(() => {
                if (inputRefs.current[id]) {
                    inputRefs.current[id].focus();
                    inputRefs.current[id].select();
                }
            }, 150);
        }
        setSelectedItems(newItems);
    };

    const handleQtyChange = (id, val, stockActual) => {
        // Validación para salida: no exceder el stock
        const currentView = view === "entrada" ? "entrada" : "salida";
        const numVal = parseFloat(val);

        // Limpiar error si el valor es válido
        if (val !== "" && !isNaN(numVal)) {
            setErrors((prev) => ({ ...prev, [id]: undefined }));
        }

        if (currentView === "salida") {
            if (val === "" || val === "0") {
                setErrors((prev) => ({
                    ...prev,
                    [id]: "La cantidad no puede ser 0",
                }));
                setSelectedItems((prev) => ({ ...prev, [id]: val }));
                return;
            }
            if (isNaN(numVal) || numVal < 0) {
                setErrors((prev) => ({
                    ...prev,
                    [id]: "Ingrese un número válido",
                }));
                setSelectedItems((prev) => ({ ...prev, [id]: val }));
                return;
            }
            if (numVal > stockActual) {
                setErrors((prev) => ({
                    ...prev,
                    [id]: `Máximo permitido: ${stockActual}`,
                }));
                setSelectedItems((prev) => ({ ...prev, [id]: val }));
                return;
            }
            if (numVal <= 0) {
                setErrors((prev) => ({
                    ...prev,
                    [id]: "La cantidad debe ser mayor a 0",
                }));
                setSelectedItems((prev) => ({ ...prev, [id]: val }));
                return;
            }
        }

        if (currentView === "entrada") {
            if (val === "" || val === "0") {
                setErrors((prev) => ({
                    ...prev,
                    [id]: "La cantidad no puede ser 0",
                }));
                setSelectedItems((prev) => ({ ...prev, [id]: val }));
                return;
            }
            if (isNaN(numVal) || numVal < 0) {
                setErrors((prev) => ({
                    ...prev,
                    [id]: "Ingrese un número válido",
                }));
                setSelectedItems((prev) => ({ ...prev, [id]: val }));
                return;
            }
            if (numVal <= 0) {
                setErrors((prev) => ({
                    ...prev,
                    [id]: "La cantidad debe ser mayor a 0",
                }));
                setSelectedItems((prev) => ({ ...prev, [id]: val }));
                return;
            }
        }

        setSelectedItems((prev) => ({ ...prev, [id]: val }));

        // Si el valor es válido, permitir seleccionar otro rubro
        if (val !== "" && !isNaN(numVal) && numVal > 0) {
            // Verificar que no haya errores
            const hasError = Object.values(errors).some(
                (err) => err !== undefined,
            );
            if (!hasError) {
                setIsInputFocused(false);
            }
        } else {
            setIsInputFocused(true);
        }
    };

    const handleInputBlur = (id) => {
        const value = selectedItems[id];
        if (value && value !== "" && parseFloat(value) > 0) {
            setIsInputFocused(false);
        }
    };

    const submitRubro = (e) => {
        e.preventDefault();
        formRubro.post(route("comedor.insumo.store"), {
            onSuccess: () => {
                formRubro.reset();
                setShowRubroModal(false);
                toast.success("Rubro creado exitosamente");
            },
        });
    };

    const submitEditRubro = (e) => {
        e.preventDefault();
        formEdit.put(route("comedor.insumo.update", itemToEdit.id), {
            onSuccess: () => {
                formEdit.reset();
                setShowEditInsumo(false);
                setItemToEdit(null);
                toast.success("Rubro actualizado exitosamente");
            },
        });
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();

        // Validar que todos los rubros tengan cantidad válida
        const hasErrors = Object.values(errors).some(
            (err) => err !== undefined,
        );
        if (hasErrors) {
            toast.error("Corrija los errores en las cantidades");
            return;
        }

        const itemsFormatted = Object.entries(selectedItems)
            .filter(([_, qty]) => qty && qty !== "" && parseFloat(qty) > 0)
            .map(([id, qty]) => ({ insumo_id: id, cantidad: parseFloat(qty) }));

        if (itemsFormatted.length === 0) {
            toast.error("Seleccione al menos un rubro y cantidad");
            return;
        }

        formMov.setData("items", itemsFormatted);
        if (formMov.data.tipo === "salida") setShowComensalesModal(true);
        else submitFinal();
    };

    const submitFinal = () => {
        formMov.post(route("comedor.movimiento.store"), {
            onSuccess: () => {
                setShowComensalesModal(false);
                setSelectedItems({});
                formMov.reset();
                setView("dashboard");
                toast.success("Movimiento registrado exitosamente");
            },
        });
    };

    // Función para editar movimiento
    // En la función handleEditMovimiento, corregir el formato de fecha
    const handleEditMovimiento = (movimiento) => {
        setMovimientoToEdit(movimiento);

        // Parsear rubros_cantidad si es string
        let itemsData = [];
        if (movimiento.rubros_cantidad) {
            let rubros = movimiento.rubros_cantidad;
            if (typeof rubros === "string") {
                try {
                    rubros = JSON.parse(rubros);
                } catch (e) {
                    rubros = {};
                }
            }

            // Convertir a formato de items
            itemsData = Object.entries(rubros).map(([nombre, cantidad]) => {
                // Buscar el insumo por nombre
                const insumo = insumos.find(
                    (i) =>
                        `${i.nombre} ${i.peso_medida}${i.unidad_medida}` ===
                        nombre,
                );
                return {
                    nombre_insumo: nombre,
                    cantidad: parseFloat(cantidad),
                    insumo_id: insumo ? insumo.id : null,
                    stock_actual: insumo ? insumo.stock_actual : 0,
                    // Guardar la cantidad original del movimiento para referencia
                    cantidad_original: parseFloat(cantidad),
                };
            });
        }

        // Formatear fecha correctamente para input type="date"
        let fechaFormateada = movimiento.fecha;
        if (fechaFormateada) {
            // Si la fecha es un objeto Date o tiene formato ISO, convertir a YYYY-MM-DD
            try {
                const fechaObj = new Date(fechaFormateada);
                if (!isNaN(fechaObj.getTime())) {
                    fechaFormateada = fechaObj.toISOString().split("T")[0];
                }
            } catch (e) {
                // Si no se puede parsear, mantener el valor original
            }
        }

        formEditMovimiento.setData({
            fecha: fechaFormateada || new Date().toISOString().split("T")[0],
            tipo: movimiento.tipo || "entrada",
            items: itemsData,
            estudiantes: movimiento.estudiantes || "",
            cocineras: movimiento.cocineras || "",
            personal: movimiento.personal || "",
            descripcion: movimiento.descripcion || "",
        });

        setShowEditMovimientoModal(true);
    };
    const submitEditMovimiento = (e) => {
        e.preventDefault();

        // Validar cantidades
        const hasErrors = formEditMovimiento.data.items.some(
            (item) => !item.cantidad || item.cantidad <= 0,
        );

        if (hasErrors) {
            toast.error("Todas las cantidades deben ser mayores a 0");
            return;
        }

        // Convertir items a formato rubros_cantidad
        const rubrosCantidad = {};
        formEditMovimiento.data.items.forEach((item) => {
            if (item.nombre_insumo && item.cantidad > 0) {
                rubrosCantidad[item.nombre_insumo] = item.cantidad.toString();
            }
        });

        const dataToSend = {
            ...formEditMovimiento.data,
            rubros_cantidad: rubrosCantidad,
        };

        formEditMovimiento.put(
            route("comedor.movimiento.update", movimientoToEdit.id),
            {
                data: dataToSend,
                onSuccess: () => {
                    setShowEditMovimientoModal(false);
                    setMovimientoToEdit(null);
                    toast.success("Movimiento actualizado exitosamente");
                    setView("historial");
                },
            },
        );
    };

    // --- 4. SUB-COMPONENTES DE VISTA ---
    const renderContent = () => {
        switch (view) {
            case "dashboard":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
                        <HubCard
                            icon="PackageSearch"
                            title="EXISTENCIA"
                            subtitle="Consultar stock"
                            color="blue"
                            onClick={() => setView("inventario")}
                        />
                        <HubCard
                            icon="TrendingUp"
                            title="RECEPCIÓN"
                            subtitle="Carga masiva entrada"
                            color="emerald"
                            onClick={() => {
                                setView("entrada");
                                formMov.setData("tipo", "entrada");
                                setSelectedItems({});
                                setFocusInputId(null);
                                setIsInputFocused(false);
                                setErrors({});
                            }}
                        />
                        <HubCard
                            icon="TrendingDown"
                            title="DESPACHO"
                            subtitle="Salida masiva cocina"
                            color="rose"
                            onClick={() => {
                                setView("salida");
                                formMov.setData("tipo", "salida");
                                setSelectedItems({});
                                setFocusInputId(null);
                                setIsInputFocused(false);
                                setErrors({});
                            }}
                        />
                        <HubCard
                            icon="History"
                            title="AUDITORÍA"
                            subtitle="Historial completo"
                            color="indigo"
                            onClick={() => setView("historial")}
                        />
                    </div>
                );
            case "inventario":
                return (
                    <div className="p-2 animate-in fade-in duration-300">
                        <div className="bg-white rounded-t-[1.5rem] border border-slate-100 shadow-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest italic">
                                    <tr>
                                        <th className="px-8 py-6">Insumo</th>
                                        <th className="px-8 py-6 text-center">
                                            Despensa
                                        </th>
                                        <th className="px-8 py-6 text-right">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] font-bold text-slate-600 divide-y divide-slate-50 uppercase">
                                    {insumos.map((i) => (
                                        <tr
                                            key={i.id}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="px-8 py-5 text-slate-900 font-black">
                                                {i.nombre} {i.peso_medida}
                                                {i.unidad_medida}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span
                                                    className={`px-5 py-2 rounded-xl border-2 ${i.stock_actual < 10 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}
                                                    title={
                                                        i.stock_actual === 0
                                                            ? "Stock agotado"
                                                            : `Stock disponible: ${i.stock_actual}`
                                                    }
                                                >
                                                    {i.stock_actual} Uni.
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setItemToEdit(i);
                                                        formEdit.setData({
                                                            nombre: i.nombre,
                                                            unidad_medida:
                                                                i.unidad_medida,
                                                            peso_medida:
                                                                i.peso_medida,
                                                        });
                                                        setShowEditInsumo(true);
                                                    }}
                                                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <Icons.Edit3 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "entrada":
            case "salida":
                return (
                    <div className="p-2 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full bg-[#f8fafc] animate-in slide-in-from-bottom-4">
                        <div className="lg:col-span-8 bg-white rounded-[1.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[700px]">
                            <div
                                className={`p-4 text-white font-black uppercase italic text-sm tracking-widest flex justify-between ${view === "entrada" ? "bg-emerald-600" : "bg-rose-600"}`}
                            >
                                <span>
                                    Selección de Rubros para{" "}
                                    {view === "entrada"
                                        ? "Recepción"
                                        : "Despacho"}
                                </span>
                                <span className="bg-white/20 px-4 py-1 rounded-full text-[10px]">
                                    {Object.keys(selectedItems).length} Marcados
                                </span>
                            </div>
                            <div className="p-2 overflow-y-auto custom-scrollbar space-y-3 bg-slate-50/50">
                                {insumos.map((i) => {
                                    const isSelected =
                                        selectedItems[i.id] !== undefined;
                                    const stockActual = i.stock_actual || 0;
                                    const isDisabled =
                                        view === "salida" && stockActual <= 0;
                                    const hasError = errors[i.id];
                                    const inputValue =
                                        selectedItems[i.id] || "";

                                    return (
                                        <div
                                            key={i.id}
                                            className={`flex items-center gap-5 p-2 rounded-[1.5rem] border-2 transition-all ${isSelected ? "border-blue-500 bg-white shadow-xl scale-[1.01]" : "border-transparent opacity-60"} ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    toggleItem(
                                                        i.id,
                                                        stockActual,
                                                    )
                                                }
                                                disabled={
                                                    isDisabled || isInputFocused
                                                }
                                                className={`w-6 h-6 rounded-xl text-blue-600 cursor-pointer ${isDisabled || isInputFocused ? "cursor-not-allowed" : ""}`}
                                                title={
                                                    isDisabled
                                                        ? "Stock agotado"
                                                        : isInputFocused
                                                          ? "Complete la cantidad del rubro seleccionado"
                                                          : ""
                                                }
                                            />
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() =>
                                                    !isDisabled &&
                                                    !isInputFocused &&
                                                    toggleItem(
                                                        i.id,
                                                        stockActual,
                                                    )
                                                }
                                            >
                                                <p className="font-black text-slate-800 uppercase text-sm">
                                                    {i.nombre} {i.peso_medida}
                                                    {i.unidad_medida}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                                                    Stock: {stockActual}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="flex flex-col">
                                                    <input
                                                        ref={(el) =>
                                                            (inputRefs.current[
                                                                i.id
                                                            ] = el)
                                                        }
                                                        type="number"
                                                        placeholder="Cant."
                                                        value={inputValue}
                                                        onChange={(e) =>
                                                            handleQtyChange(
                                                                i.id,
                                                                e.target.value,
                                                                stockActual,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            handleInputBlur(
                                                                i.id,
                                                            )
                                                        }
                                                        className={`w-18 placeholder:text-slate-400 h-12 bg-slate-100 border-2 text-gray-800 rounded-2xl text-center font-black text-sm focus:ring-4 focus:ring-blue-500/10 ${hasError ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}
                                                        min="1"
                                                        max={
                                                            view === "salida"
                                                                ? stockActual
                                                                : undefined
                                                        }
                                                        required
                                                        autoFocus={
                                                            focusInputId ===
                                                            i.id
                                                        }
                                                        disabled={isDisabled}
                                                    />
                                                    {hasError && (
                                                        <span className="text-rose-500 text-[8px] font-black uppercase mt-1">
                                                            {hasError}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="lg:col-span-4">
                            <Section
                                title="VALIDACIÓN"
                                icon={<Icons.CalendarCheck size={18} />}
                                color="text-slate-900"
                            >
                                <form
                                    onSubmit={handlePreSubmit}
                                    className="space-y-8"
                                >
                                    <Field
                                        label="Fecha"
                                        type="date"
                                        value={formMov.data.fecha}
                                        onChange={(e) =>
                                            formMov.setData(
                                                "fecha",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Field
                                        label="Nota / Observación"
                                        value={formMov.data.descripcion}
                                        onChange={(e) =>
                                            formMov.setData(
                                                "descripcion",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        variant={
                                            view === "entrada"
                                                ? "primary"
                                                : "danger"
                                        }
                                        size="xl"
                                        className="w-full h-24 rounded-[2.5rem] shadow-2xl font-black italic"
                                        loading={formMov.processing}
                                    >
                                        <Icons.Zap
                                            size={24}
                                            className="mr-3 fill-current"
                                        />{" "}
                                        {view === "entrada"
                                            ? "PROCESAR ENTRADA"
                                            : "CONTINUAR"}
                                    </Button>
                                </form>
                            </Section>
                        </div>
                    </div>
                );
            case "historial":
            // Estado para el filtro de fecha
            case "historial":
                return (
                    <div className="p-2 animate-in fade-in duration-500">
                        {/* Filtro de fecha */}
                        <div className="mb-2 flex items-center gap-4 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                                <Icons.Calendar
                                    size={20}
                                    className="text-slate-400"
                                />
                                <label className="text-xs font-black uppercase text-slate-600 tracking-wider">
                                    Filtrar por fecha:
                                </label>
                                <input
                                    type="date"
                                    value={filtroFecha}
                                    onChange={(e) =>
                                        setFiltroFecha(e.target.value)
                                    }
                                    className="px-4 py-2 border-2 border-slate-200 text-gray-500 rounded-xl text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                />
                                {filtroFecha && (
                                    <button
                                        onClick={() => setFiltroFecha("")}
                                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                        title="Limpiar filtro"
                                    >
                                        <Icons.X size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="ml-auto text-xs font-black text-slate-400">
                                {movimientosFiltrados.length}{" "}
                                {movimientosFiltrados.length === 1
                                    ? "registro"
                                    : "registros"}{" "}
                                encontrados
                            </div>
                        </div>

                        <div className="bg-white rounded-t-[1.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-white font-black uppercase text-[9px] tracking-widest italic">
                                    <tr>
                                        <th className="px-10 py-6">
                                            Fecha / Tipo
                                        </th>
                                        <th className="px-10 py-6 text-center">
                                            Snapshot Rubros
                                        </th>
                                        <th className="px-10 py-6 text-center">
                                            Comensales
                                        </th>
                                        <th className="px-10 py-6 text-right">
                                            Observación
                                        </th>
                                        <th className="px-10 py-6 text-center">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] font-bold text-slate-600 uppercase divide-y divide-rose-500">
                                    {movimientosFiltrados.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-10 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-3">
                                                    <Icons.Inbox
                                                        size={40}
                                                        className="text-slate-300"
                                                    />
                                                    <p className="text-slate-400 font-black text-sm">
                                                        No hay movimientos para
                                                        esta fecha
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        movimientosFiltrados.map((mov) => {
                                            // Parsear rubros_cantidad si es string
                                            let rubrosData =
                                                mov.rubros_cantidad || {};
                                            if (
                                                typeof rubrosData === "string"
                                            ) {
                                                try {
                                                    rubrosData =
                                                        JSON.parse(rubrosData);
                                                } catch (e) {
                                                    rubrosData = {};
                                                }
                                            }

                                            return (
                                                <tr
                                                    key={mov.id}
                                                    className="hover:bg-slate-50 transition-all"
                                                >
                                                    <td className="px-10 py-6">
                                                        <p className="text-slate-900 font-black text-xs">
                                                            {mov.fecha
                                                                ? new Date(
                                                                      mov.fecha,
                                                                  ).toLocaleDateString(
                                                                      "es-ES",
                                                                      {
                                                                          day: "2-digit",
                                                                          month: "2-digit",
                                                                          year: "numeric",
                                                                          timeZone:
                                                                              "UTC",
                                                                      },
                                                                  )
                                                                : "Sin fecha"}
                                                        </p>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-[8px] font-black ${mov.tipo === "entrada" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                                                        >
                                                            {mov.tipo}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {Object.entries(
                                                                rubrosData,
                                                            ).map(
                                                                ([
                                                                    nombre,
                                                                    cantidad,
                                                                ]) => (
                                                                    <div
                                                                        key={
                                                                            nombre
                                                                        }
                                                                        className="bg-slate-50 p-2 rounded-xl border border-slate-300 flex justify-between"
                                                                    >
                                                                        <span
                                                                            className="text-[8px] text-rose-700 truncate mr-2"
                                                                            title={
                                                                                nombre
                                                                            }
                                                                        >
                                                                            {
                                                                                nombre
                                                                            }
                                                                        </span>
                                                                        <span className="text-[10px] font-black text-slate-900">
                                                                            {
                                                                                cantidad
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-center">
                                                        {mov.tipo ===
                                                        "salida" ? (
                                                            <div className="flex flex-col gap-1 text-[9px] font-black italic">
                                                                <span className="text-blue-600">
                                                                    EST:{" "}
                                                                    {mov.estudiantes ||
                                                                        "0"}
                                                                </span>
                                                                <span className="text-emerald-600">
                                                                    COC:{" "}
                                                                    {mov.cocineras ||
                                                                        "0"}
                                                                </span>
                                                                <span className="text-amber-600">
                                                                    PER:{" "}
                                                                    {mov.personal ||
                                                                        "0"}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>
                                                    <td className="px-10 py-6 text-right italic text-slate-400">
                                                        {mov.descripcion ||
                                                            "S/O"}
                                                    </td>
                                                    <td className="px-10 py-6 text-center">
                                                        <button
                                                            onClick={() =>
                                                                handleEditMovimiento(
                                                                    mov,
                                                                )
                                                            }
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                            title="Editar movimiento"
                                                        >
                                                            <Icons.Edit3
                                                                size={14}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Comedor" />
            <ViewContainer
                title="SISTEMA DE DESPENSA"
                subtitle="Registro y retiros"
                icon="Utensils"
                showSearch={false}
                returns={
                    view !== "dashboard" && (
                        <Button
                            onClick={() => setView("dashboard")}
                        >
                            <Icons.LayoutDashboard size={16} className="mr-2" />{" "}
                            PANEL CONTROL
                        </Button>
                    )
                }
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => setShowRubroModal(true)}
                            className="shadow-emerald-500/20"
                        >
                            <Icons.PlusCircle size={16} className="mr-2" />{" "}
                            NUEVO RUBRO
                        </Button>
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => setShowReportModal(true)}
                            className="shadow-amber-500/20"
                        >
                            <Icons.Printer size={16} className="mr-2" />{" "}
                            AUDITORÍA PDF
                        </Button>
                    </div>
                }
            >
                {renderContent()}

                {/* --- 5. MODALES CON PORTAL --- */}

                {/* MODAL REPORTE PDF */}
                {showReportModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-md p-12 border-4 border-white shadow-3xl text-center relative"
                            >
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <Icons.X size={28} />
                                </button>
                                <Icons.FileSpreadsheet
                                    className="mx-auto mb-6 text-amber-500"
                                    size={64}
                                />
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-8 tracking-tighter">
                                    Generar Auditoría
                                </h3>
                                <input
                                    type="month"
                                    className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-sm font-black uppercase mb-10 outline-none focus:border-blue-500 transition-all"
                                    value={mesReporte}
                                    onChange={(e) =>
                                        setMesReporte(e.target.value)
                                    }
                                />
                                <Button
                                    onClick={() => {
                                        window.open(
                                            route("comedor.reporte.pdf", {
                                                periodo: mesReporte,
                                            }),
                                            "_blank",
                                        );
                                        setShowReportModal(false);
                                    }}
                                    variant="primary"
                                    size="xl"
                                    className="w-full h-20 rounded-[2.5rem] shadow-xl shadow-blue-600/30"
                                >
                                    GENERAR DOCUMENTO
                                </Button>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL COMENSALES */}
                {showComensalesModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-md p-12 border-4 border-white shadow-2xl relative text-center"
                            >
                                <Icons.Users
                                    size={48}
                                    className="mx-auto mb-6 text-rose-600"
                                />
                                <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter mb-10">
                                    Matrícula que Asistió
                                </h3>
                                <div className="space-y-6 text-left">
                                    <Field
                                        label="Estudiantes (N°)"
                                        type="text"
                                        mask="000"
                                        autoFocus
                                        value={formMov.data.estudiantes}
                                        onChange={(e) =>
                                            formMov.setData(
                                                "estudiantes",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            label="Cocineras (N°)"
                                            type="text"
                                            mask="000"
                                            value={formMov.data.cocineras}
                                            onChange={(e) =>
                                                formMov.setData(
                                                    "cocineras",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <Field
                                            label="Personal (N°)"
                                            type="text"
                                            mask="000"
                                            value={formMov.data.personal}
                                            onChange={(e) =>
                                                formMov.setData(
                                                    "personal",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="danger"
                                    size="xl"
                                    className="w-full h-20 rounded-[2.5rem] mt-10 font-black italic shadow-xl shadow-rose-600/30"
                                    onClick={submitFinal}
                                    loading={formMov.processing}
                                >
                                    FINALIZAR Y GUARDAR
                                </Button>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL CREAR RUBRO */}
                {showRubroModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#06090f]/90 backdrop-blur-md">
                            <motion.div
                                initial={{ y: 50 }}
                                animate={{ y: 0 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-md p-12 border-4 border-white shadow-2xl relative text-center"
                            >
                                <button
                                    onClick={() => setShowRubroModal(false)}
                                    className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-all p-2"
                                >
                                    <Icons.X size={28} />
                                </button>
                                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-inner">
                                    <Icons.PlusCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-10">
                                    Nuevo Insumo
                                </h3>
                                <form
                                    onSubmit={submitRubro}
                                    className="space-y-6 text-left"
                                >
                                    <Field
                                        label="Nombre"
                                        value={formRubro.data.nombre}
                                        autoFocus
                                        onChange={(e) =>
                                            formRubro.setData(
                                                "nombre",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            label="Peso/medida"
                                            value={formRubro.data.peso_medida}
                                            onChange={(e) =>
                                                formRubro.setData(
                                                    "peso_medida",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <SelectField
                                            label="Unidad/Medida"
                                            value={formRubro.data.unidad_medida}
                                            options={[
                                                "Kg",
                                                "Gr",
                                                "Ltr",
                                                "Ml",
                                                "Uni",
                                                "Pqt",
                                                "Sac",
                                            ]}
                                            onChange={(e) =>
                                                formRubro.setData(
                                                    "unidad_medida",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="xl"
                                        className="w-full h-20 rounded-[2.5rem] shadow-xl"
                                        loading={formRubro.processing}
                                    >
                                        REGISTRAR EN CATÁLOGO
                                    </Button>
                                </form>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL EDITAR RUBRO */}
                {showEditInsumo &&
                    itemToEdit &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#06090f]/90 backdrop-blur-md">
                            <motion.div
                                initial={{ y: 50 }}
                                animate={{ y: 0 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-md p-12 border-4 border-white shadow-2xl relative text-center"
                            >
                                <button
                                    onClick={() => {
                                        setShowEditInsumo(false);
                                        setItemToEdit(null);
                                    }}
                                    className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-all p-2"
                                >
                                    <Icons.X size={28} />
                                </button>
                                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-amber-600 shadow-inner">
                                    <Icons.Edit3 size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-10">
                                    Editar Insumo
                                </h3>
                                <form
                                    onSubmit={submitEditRubro}
                                    className="space-y-6 text-left"
                                >
                                    <Field
                                        label="Nombre"
                                        value={formEdit.data.nombre}
                                        autoFocus
                                        onChange={(e) =>
                                            formEdit.setData(
                                                "nombre",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            label="Peso/medida"
                                            value={formEdit.data.peso_medida}
                                            onChange={(e) =>
                                                formEdit.setData(
                                                    "peso_medida",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <SelectField
                                            label="Unidad/Medida"
                                            value={formEdit.data.unidad_medida}
                                            options={[
                                                "Kg",
                                                "Gr",
                                                "Ltr",
                                                "Ml",
                                                "Uni",
                                                "Pqt",
                                                "Sac",
                                            ]}
                                            onChange={(e) =>
                                                formEdit.setData(
                                                    "unidad_medida",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        size="xl"
                                        className="w-full h-20 rounded-[2.5rem] shadow-xl"
                                        loading={formEdit.processing}
                                    >
                                        ACTUALIZAR CATÁLOGO
                                    </Button>
                                </form>
                            </motion.div>
                        </div>,
                        document.body,
                    )}

                {/* MODAL EDITAR MOVIMIENTO */}
                {showEditMovimientoModal &&
                    movimientoToEdit &&
                    createPortal(
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-4xl p-12 border-4 border-white shadow-2xl relative my-8"
                            >
                                <button
                                    onClick={() => {
                                        setShowEditMovimientoModal(false);
                                        setMovimientoToEdit(null);
                                    }}
                                    className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <Icons.X size={28} />
                                </button>

                                <div className="flex items-center gap-4 mb-8">
                                    <Icons.FileEdit
                                        size={40}
                                        className="text-blue-600"
                                    />
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                                        Editar Movimiento
                                    </h3>
                                    <span
                                        className={`px-4 py-2 rounded-full text-xs font-black ${movimientoToEdit.tipo === "entrada" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                                    >
                                        {movimientoToEdit.tipo.toUpperCase()}
                                    </span>
                                </div>

                                <form
                                    onSubmit={submitEditMovimiento}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field
                                            label="Fecha"
                                            type="date"
                                            value={
                                                formEditMovimiento.data.fecha
                                            }
                                            onChange={(e) =>
                                                formEditMovimiento.setData(
                                                    "fecha",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <Field
                                            label="Observación"
                                            value={
                                                formEditMovimiento.data
                                                    .descripcion
                                            }
                                            onChange={(e) =>
                                                formEditMovimiento.setData(
                                                    "descripcion",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <h4 className="font-black text-slate-700 uppercase text-xs tracking-widest mb-4">
                                            Rubros y Cantidades
                                        </h4>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {formEditMovimiento.data.items.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-black text-slate-800 text-sm">
                                                                {
                                                                    item.nombre_insumo
                                                                }
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                Stock actual:{" "}
                                                                {item.stock_actual ||
                                                                    0}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={
                                                                    movimientoToEdit.tipo ===
                                                                        "salida" &&
                                                                    (item.stock_actual ||
                                                                        0) > 0
                                                                        ? (item.stock_actual ||
                                                                              0) +
                                                                          (item.cantidad_original ||
                                                                              0)
                                                                        : undefined
                                                                }
                                                                value={
                                                                    item.cantidad ||
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const newItems =
                                                                        [
                                                                            ...formEditMovimiento
                                                                                .data
                                                                                .items,
                                                                        ];
                                                                    const newCantidad =
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0;

                                                                    // Validación para salida
                                                                    if (
                                                                        movimientoToEdit.tipo ===
                                                                        "salida"
                                                                    ) {
                                                                        // El stock disponible real es stock_actual + cantidad_original
                                                                        const stockDisponibleReal =
                                                                            (item.stock_actual ||
                                                                                0) +
                                                                            (item.cantidad_original ||
                                                                                0);

                                                                        if (
                                                                            newCantidad >
                                                                            stockDisponibleReal
                                                                        ) {
                                                                            toast.error(
                                                                                `La cantidad no puede exceder el stock disponible real (${stockDisponibleReal})`,
                                                                            );
                                                                            return;
                                                                        }
                                                                    }

                                                                    newItems[
                                                                        index
                                                                    ] = {
                                                                        ...newItems[
                                                                            index
                                                                        ],
                                                                        cantidad:
                                                                            newCantidad,
                                                                    };
                                                                    formEditMovimiento.setData(
                                                                        "items",
                                                                        newItems,
                                                                    );
                                                                }}
                                                                className="w-24 h-12 bg-slate-100 border-2 border-slate-200 rounded-xl text-center font-black text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                                required
                                                            />
                                                            {item.cantidad <=
                                                                0 && (
                                                                <span className="text-rose-500 text-[8px] font-black block text-center">
                                                                    Cantidad
                                                                    inválida
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {movimientoToEdit.tipo === "salida" && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Field
                                                label="Estudiantes"
                                                type="number"
                                                min="0"
                                                value={
                                                    formEditMovimiento.data
                                                        .estudiantes
                                                }
                                                onChange={(e) =>
                                                    formEditMovimiento.setData(
                                                        "estudiantes",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Field
                                                label="Cocineras"
                                                type="number"
                                                min="0"
                                                value={
                                                    formEditMovimiento.data
                                                        .cocineras
                                                }
                                                onChange={(e) =>
                                                    formEditMovimiento.setData(
                                                        "cocineras",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Field
                                                label="Personal"
                                                type="number"
                                                min="0"
                                                value={
                                                    formEditMovimiento.data
                                                        .personal
                                                }
                                                onChange={(e) =>
                                                    formEditMovimiento.setData(
                                                        "personal",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant={
                                            movimientoToEdit.tipo === "entrada"
                                                ? "primary"
                                                : "danger"
                                        }
                                        size="xl"
                                        className="w-full h-20 rounded-[2.5rem] shadow-xl font-black italic"
                                        loading={formEditMovimiento.processing}
                                    >
                                        <Icons.Save
                                            size={24}
                                            className="mr-3"
                                        />
                                        ACTUALIZAR MOVIMIENTO
                                    </Button>
                                </form>
                            </motion.div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

// COMPONENTE HUB CARD
function HubCard({ icon, title, subtitle, color, onClick }) {
    const IconComp = Icons[icon];
    const colors = {
        blue: "border-blue-500 text-blue-500 bg-blue-50/50 shadow-blue-500/20",
        emerald:
            "border-emerald-500 text-emerald-500 bg-emerald-50/50 shadow-emerald-500/20",
        rose: "border-rose-500 text-rose-500 bg-rose-50/50 shadow-rose-500/20",
        indigo: "border-indigo-500 text-indigo-500 bg-indigo-50/50 shadow-indigo-500/20",
    };
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-12 rounded-[3.5rem] border-4 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-white ${colors[color]}`}
        >
            <IconComp
                size={56}
                strokeWidth={1.2}
                className="mb-6 animate-in zoom-in duration-500"
            />
            <h3 className="font-black text-xl italic tracking-tighter uppercase leading-none">
                {title}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">
                {subtitle}
            </p>
        </button>
    );
}
