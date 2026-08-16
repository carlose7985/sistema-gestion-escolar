"use client";
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { confirmDelete } from "@/Utils/confirmDelete";
import {
    Package,
    Save,
    Trash2,
    Edit3,
    QrCode,
    X,
    Plus,
    ChevronLeftCircle,
    ServerCog,
    MapPin,
    Printer,
} from "lucide-react";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export default function InmueblesIndex({ inmuebles, areas, filters }) {
    const [qrModalData, setQrModalData] = useState(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [newAreaName, setNewAreaName] = useState("");
    const [editId, setEditId] = useState(null);
    const [isSavingArea, setIsSavingArea] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } =
        useForm({
            id: null,
            tipo_de_inmueble: "",
            ubicacion: "",
            condicion_legal: "",
            largo: "",
            ancho: "",
            alto: "",
            color: "",
            costo_aproximado: "",
            cantidad: "",
        });

    // --- FUNCIÓN RECUPERADA: GENERADOR DE TEXTO QR ---
    const generarTextoQR = (item) => {
        if (!item) return "";
        return `INV-${item.id} | ${item.tipo_de_inmueble}\nUBIC: ${item.ubicacion}\nCANT: ${item.cantidad}\nESTADO: ${item.condicion_legal}`;
    };

    // Validación de entrada numérica profesional
    const handleNumericInput = (name, value, separator) => {
        const regex = separator === "." ? /[^0-9.]/g : /[^0-9,]/g;
        let filtered = value.replace(regex, "");
        if (value !== filtered) {
            toast.warning(
                `Atención: Solo se admite ${separator === "." ? "punto (.) para medidas" : "coma (,) para costos"}`,
                { position: "top-center" },
            );
        }
        setData(name, filtered);
    };

    const openCreateModal = () => {
        setEditId(null);
        reset();
        clearErrors();
        setIsAssetModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditId(item.id);
        setData({ ...item });
        clearErrors();
        setIsAssetModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("settings.institucion.inmuebles.store"), {
            onSuccess: () => {
                setIsAssetModalOpen(false);
                reset();
            },
        });
    };

    const handleOpenAreaModal = () => {
        setIsAssetModalOpen(false);
        setIsAreaModalOpen(true);
    };

    const handleCreateArea = () => {
        const areaToSelect = newAreaName.trim().toUpperCase();
        if (!areaToSelect) return toast.error("Nombre requerido");

        setIsSavingArea(true);
        router.post(
            route("settings.areas.storeFast"),
            { nombre_del_area: areaToSelect },
            {
                onSuccess: () => {
                    setData("ubicacion", areaToSelect); // Seteo automático
                    setIsAreaModalOpen(false);
                    setIsAssetModalOpen(true); // Re-apertura en cascada
                    setNewAreaName("");
                    setIsSavingArea(false);
                   // toast.success("UBICACIÓN VINCULADA");
                },
                onError: () => setIsSavingArea(false),
            },
        );
    };

    const handlePageChange = (page) => {
        router.get(
            route("settings.institucion.inmuebles.index"),
            { page, search: filters?.search || "" },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventario de Inmuebles" />

            <ViewContainer
                title="GESTIÓN DE INVENTARIO"
                subtitle="Registro y actualización inmuebles de la institución"
                icon="Package"
                onSearch={(val) =>
                    router.get(
                        route("settings.institucion.inmuebles.index"),
                        { search: val },
                        { preserveState: true },
                    )
                }
                searchValue={filters?.search || ""}
                currentPage={inmuebles.current_page}
                totalPages={inmuebles.last_page}
                onPageChange={handlePageChange}
                actionFooter={
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase italic text-slate-400">
                            Total:{" "}
                            <b className="text-blue-600">{inmuebles.total}</b>{" "}
                            Activos
                        </span>
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <Link href={route("settings.index")}>
                            <Button>
                                <ChevronLeftCircle size={16} /> VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={openCreateModal}
                            variant="success"
                            size="sm"
                        >
                            <Plus size={16} /> NUEVO REGISTRO
                        </Button>
                    </div>
                }
            >
                <div className="bg-white rounded-t-[1.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-[0.2em] italic">
                            <tr>
                                <th className="px-6 py-5">Inmueble / Activo</th>
                                <th className="px-6 py-5">Ubicación</th>
                                <th className="px-6 py-5 text-center">Cant.</th>
                                <th className="px-6 py-5 text-center">QR</th>
                                <th className="px-6 py-5 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] font-bold text-slate-600 uppercase">
                            {inmuebles.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-50 hover:bg-blue-50/30 transition-all group"
                                >
                                    <td className="px-6 py-4 text-slate-900 font-black">
                                        {item.tipo_de_inmueble}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg italic">
                                            {item.ubicacion}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-black">
                                        {item.cantidad}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setQrModalData(item)}
                                            className="p-2 text-emerald-500 hover:scale-125 transition-transform"
                                        >
                                            <QrCode size={18} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(item)
                                                }
                                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDelete(
                                                        route(
                                                            "settings.institucion.inmuebles.destroy",
                                                            item.id,
                                                        ),
                                                        "¿Eliminar este activo?",
                                                        `Vas a remover de forma definitiva: ${item.tipo_de_inmueble}`,
                                                    )
                                                }
                                                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {inmuebles.data.length === 0 && (
                        <div className="p-4 text-center flex flex-col items-center gap-4">
                            <ServerCog size={64} />
                            <p className="font-black text-rose-500 uppercase text-lg tracking-[0.3em]">
                                No hay registros
                            </p>
                        </div>
                    )}
                </div>
            </ViewContainer>

            {/* MODAL PRINCIPAL */}
            <AnimatePresence>
                {isAssetModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
                        onClick={() => setIsAssetModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border-4 border-white overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className={`p-8 flex justify-between items-center text-white ${editId ? "bg-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)]" : "bg-slate-900"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Package size={24} />
                                    </div>
                                    <h3 className="font-black uppercase italic text-sm tracking-widest">
                                        {editId
                                            ? "Actualizar Registro"
                                            : "Nuevo Inmueble"}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsAssetModalOpen(false)}
                                    className="hover:rotate-90 transition-transform"
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-10 space-y-6"
                            >
                                <Field
                                    label="Tipo de Inmueble"
                                    name="tipo_de_inmueble"
                                    autoFocus
                                    value={data.tipo_de_inmueble}
                                    onChange={(e) =>
                                        setData(
                                            "tipo_de_inmueble",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    autoAcentos
                                    error={errors.tipo_de_inmueble}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <SelectField
                                        label="Ubicación"
                                        value={data.ubicacion}
                                        options={[
                                            "+ Crear nueva área",
                                            ...areas.map(
                                                (a) => a.nombre_del_area,
                                            ),
                                        ]}
                                        onChange={(e) =>
                                            e.target.value ===
                                            "+ Crear nueva área"
                                                ? handleOpenAreaModal()
                                                : setData(
                                                      "ubicacion",
                                                      e.target.value,
                                                  )
                                        }
                                        required
                                        error={errors.ubicacion}
                                    />
                                    <SelectField
                                        label="Condición Legal"
                                        value={data.condicion_legal}
                                        options={[
                                            "Propio",
                                            "Alquilado",
                                            "Donado",
                                            "Prestado",
                                        ]}
                                        onChange={(e) =>
                                            setData(
                                                "condicion_legal",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        error={errors.condicion_legal}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Field
                                        label="Largo (m)"
                                        value={data.largo}
                                        onChange={(e) =>
                                            handleNumericInput(
                                                "largo",
                                                e.target.value,
                                                ".",
                                            )
                                        }
                                        placeholder="0.00"
                                    />
                                    <Field
                                        label="Ancho (m)"
                                        value={data.ancho}
                                        onChange={(e) =>
                                            handleNumericInput(
                                                "ancho",
                                                e.target.value,
                                                ".",
                                            )
                                        }
                                        placeholder="0.00"
                                    />
                                    <Field
                                        label="Alto (m)"
                                        value={data.alto}
                                        onChange={(e) =>
                                            handleNumericInput(
                                                "alto",
                                                e.target.value,
                                                ".",
                                            )
                                        }
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Field
                                        label="Costo (Ref)"
                                        value={data.costo_aproximado}
                                        onChange={(e) =>
                                            handleNumericInput(
                                                "costo_aproximado",
                                                e.target.value,
                                                ",",
                                            )
                                        }
                                        placeholder="0,00"
                                    />
                                    <Field
                                        label="Cantidad"
                                        value={data.cantidad}
                                        onChange={(e) =>
                                            setData(
                                                "cantidad",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        required
                                        error={errors.cantidad}
                                    />
                                    <Field
                                        label="Color"
                                        value={data.color}
                                        onChange={(e) =>
                                            setData("color", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        variant={editId ? "warning" : "success"}
                                        size="xl"
                                        className="w-full h-16 rounded-[1.5rem]"
                                        loading={processing}
                                    >
                                        <Save size={20} />{" "}
                                        {editId
                                            ? "CONFIRMAR CAMBIOS"
                                            : "REGISTRAR EN INVENTARIO"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL SECUNDARIO: CREAR ÁREA */}
            <AnimatePresence>
                {isAreaModalOpen && (
                    <div
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-blue-950/60 backdrop-blur-md p-4"
                        onClick={() => setIsAreaModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl border-4 border-white text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-xs font-black uppercase italic mb-8 tracking-tighter text-slate-800">
                                Registrar Nueva Ubicación
                            </h3>
                            <Field
                                label="Nombre del Área"
                                placeholder="EJ: BIBLIOTECA"
                                upperCase
                                autoFocus
                                value={newAreaName}
                                onChange={(e) => setNewAreaName(e.target.value)}
                                required
                            />
                            <div className="flex flex-col gap-3 mt-8">
                                <Button
                                    onClick={handleCreateArea}
                                    loading={isSavingArea}
                                    variant="primary"
                                    className="h-16 rounded-2xl shadow-xl shadow-blue-200"
                                >
                                    CREAR Y SELECCIONAR
                                </Button>
                                <button
                                    onClick={() => {
                                        setIsAreaModalOpen(false);
                                        setIsAssetModalOpen(true);
                                    }}
                                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-all"
                                >
                                    Cancelar y volver
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL QR */}
            <AnimatePresence>
                {qrModalData && (
                    <div
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 print:bg-white print:p-0"
                        onClick={() => setQrModalData(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-4 border-white relative print:shadow-none print:border-none print:rounded-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Botón de cerrar - Oculto en impresión */}
                            <button
                                onClick={() => setQrModalData(null)}
                                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all print:hidden"
                            >
                                <X size={24} />
                            </button>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 inline-block mb-6 print:border-none print:bg-white">
                                <QRCodeCanvas
                                    value={generarTextoQR(qrModalData)}
                                    size={220}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <div className="space-y-1 mb-8">
                                <h3 className="font-black uppercase italic text-sm text-slate-900 tracking-tight">
                                    {qrModalData.tipo_de_inmueble}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                                    Ubicación:{" "}
                                    <span className="text-blue-600">
                                        {qrModalData.ubicacion}
                                    </span>
                                </p>
                                <p className="text-[9px] font-black text-slate-300 uppercase mt-2">
                                    ID Activo: INV-{qrModalData.id}
                                </p>
                            </div>

                            {/* Botón de Imprimir - Oculto en impresión */}
                            <Button
                                onClick={() => window.print()}
                                variant="primary"
                                className="w-full h-14 rounded-2xl shadow-lg shadow-blue-600/20 print:hidden"
                            >
                                <Printer size={18} /> IMPRIMIR ETIQUETA
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
