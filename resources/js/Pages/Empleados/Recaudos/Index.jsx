import React, { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/Button";
import { Head, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import Swal from "sweetalert2";

export default function RecaudosIndex({
    empleados,
    filters,
    currentTab,
    cargos,
    etiquetas = [], // Asegurar que etiquetas siempre sea un array
}) {
    // 1. Estados para búsqueda y datos
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const [lista, setLista] = useState(empleados.data);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const searchTimer = useRef(null);

    // 2. MEMORIA DE CAMBIOS (Para no perder datos al buscar)
    const [drafts, setDrafts] = useState({});

    // 3. Estado para el modal de edición
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState(null);
    const [editData, setEditData] = useState({
        cargo_actual: "",
        profesion: "",
        talla: "",
        etiqueta: "",
    });
    const [editLoading, setEditLoading] = useState(false);

    // Sincronizar y fusionar datos del servidor con los borradores locales
    useEffect(() => {
        const datosFusionados = empleados.data.map((emp) => {
            // Si el empleado tiene un cambio pendiente en drafts, lo usamos
            if (drafts[emp.id]) {
                return { ...emp, ...drafts[emp.id] };
            }
            return emp;
        });
        setLista(datosFusionados);
    }, [empleados.data, drafts]);

    // Función de búsqueda con Debounce
    const handleSearch = (val) => {
        setLocalSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => {
            router.get(
                route("empleados.acciones.recaudos.index"),
                {
                    search: val,
                    tab: currentTab,
                    page: 1,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 500);
    };

    // Cambio de pestaña
    const changeTab = (tab) => {
        if (tab === currentTab) return;
        router.get(
            route("empleados.acciones.recaudos.index"),
            {
                tab: tab,
                search: localSearch,
                page: 1,
            },
            { preserveState: true },
        );
    };

    // Manejar cambios: actualiza la lista visual y la memoria de borradores
    const handleChange = (id, field, value, empCompleto) => {
        setDrafts((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {
                    id: empCompleto.id,
                    profesion: empCompleto.profesion || "",
                    talla: empCompleto.talla || "",
                    cargo_actual: empCompleto.cargo_actual || "",
                    etiqueta: empCompleto.etiqueta || "",
                }),
                [field]: value,
            },
        }));
    };

    // Abrir modal de edición individual
    const openEditModal = (emp) => {
        setEditingEmpleado(emp);
        setEditData({
            cargo_actual: emp.cargo_actual || "",
            profesion: emp.profesion || "",
            talla: emp.talla || "",
            etiqueta: emp.etiqueta || "",
        });
        setModalOpen(true);
    };

    // Cerrar modal
    const closeEditModal = () => {
        setModalOpen(false);
        setEditingEmpleado(null);
        setEditData({
            cargo_actual: "",
            profesion: "",
            talla: "",
            etiqueta: "",
        });
    };

    // Guardar cambios individuales
    const handleIndividualSave = () => {
        if (!editData.talla || !editData.etiqueta) {
            Swal.fire("Atención", "Todos los campos son obligatorios", "info");
            return;
        }

        setEditLoading(true);
        router.post(
            route("empleados.acciones.recaudos.store"),
            {
                recaudos: [
                    {
                        id: editingEmpleado.id,
                        cargo_actual: editData.cargo_actual,
                        profesion: editData.profesion,
                        talla: editData.talla,
                        etiqueta: editData.etiqueta,
                    },
                ],
            },
            {
                onSuccess: () => {
                    setEditLoading(false);
                    closeEditModal();
                    Swal.fire(
                        "¡Éxito!",
                        "Los datos del empleado han sido actualizados correctamente.",
                        "success",
                    );
                    router.get(
                        route("empleados.acciones.recaudos.index"),
                        {
                            tab: currentTab,
                            search: localSearch,
                            page: empleados.current_page,
                        },
                        { preserveState: true },
                    );
                },
                onError: () => {
                    setEditLoading(false);
                    Swal.fire(
                        "Error",
                        "No se pudo actualizar el registro. Inténtalo de nuevo.",
                        "error",
                    );
                },
            },
        );
    };

    const handleSave = () => {
        const datosAEnviar = Object.values(drafts).filter(
            (d) =>
                d.talla !== "" &&
                d.cargo_actual !== "" &&
                d.profesion !== "" &&
                d.etiqueta !== "",
        );

        if (datosAEnviar.length === 0) {
            return Swal.fire(
                "Atención",
                "No hay cambios completos para guardar (asegúrese de seleccionar profesión, cargo, talla y etiqueta)",
                "info",
            );
        }

        setLoading(true);
        router.post(
            route("empleados.acciones.recaudos.store"),
            { recaudos: datosAEnviar },
            {
                onSuccess: () => {
                    setDrafts({});
                    Swal.fire(
                        "¡Éxito!",
                        "Los registros han sido procesados y movidos correctamente.",
                        "success",
                    );
                    router.get(
                        route("empleados.acciones.recaudos.index"),
                        {
                            tab: currentTab,
                            search: localSearch,
                            page: empleados.current_page,
                        },
                        { preserveState: true },
                    );
                },
                onFinish: () => setLoading(false),
                preserveScroll: true,
            },
        );
    };

    // Función para eliminar un registro
    const handleDelete = (id, nombreCompleto) => {
        Swal.fire({
            title: "¿Estás seguro?",
            html: `Eliminarás el registro de <strong>${nombreCompleto}</strong>`,
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                setDeletingId(id);
                router.delete(route("empleados.acciones.recaudos.destroy", id), {
                    onSuccess: () => {
                        router.get(
                            route("empleados.acciones.recaudos.index"),
                            {
                                tab: currentTab,
                                search: localSearch,
                                page: empleados.current_page,
                            },
                            { preserveState: true },
                        );
                    },
                    onFinish: () => setDeletingId(null),
                    onError: () => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar el registro. Inténtalo de nuevo.",
                            "error",
                        );
                    },
                });
            }
        });
    };

    const totalCambios = Object.keys(drafts).length;

    return (
        <AuthenticatedLayout>
            <Head title="Control de Tallas" />
            <ViewContainer
                title="Gestión de Recaudos"
                subtitle={
                    currentTab === "pendientes"
                        ? "Personal por registrar"
                        : "Historial de registros"
                }
                icon="UserCheck"
                searchValue={localSearch}
                onSearch={handleSearch}
                currentPage={empleados.current_page}
                totalPages={empleados.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("empleados.acciones.recaudos.index"),
                        { ...filters, page: page },
                        { preserveState: true },
                    )
                }
                returns={
                    currentTab === "pendientes" && (
                        <Link href={route("empleados.acciones.index")}>
                            <Button>
                                <Icons.ArrowLeft size={16} className="mr-2" />{" "}
                                Volver
                            </Button>
                        </Link>
                    )
                }
                actions={
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-2">
                            {currentTab === "registrados" && (
                                <Button
                                    onClick={() =>
                                        window.open(
                                            route("empleados.acciones.recaudos.imprimir"),
                                            "_blank",
                                        )
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Icons.Printer size={16} className="mr-2" />
                                    IMPRIMIR
                                </Button>
                            )}
                            {currentTab === "pendientes" && (
                                <Button
                                    onClick={handleSave}
                                    disabled={loading || totalCambios === 0}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                                >
                                    {loading ? (
                                        <Icons.Loader2
                                            className="animate-spin mr-2"
                                            size={16}
                                        />
                                    ) : (
                                        <Icons.Save
                                            size={16}
                                            className="mr-2"
                                        />
                                    )}
                                    {`GUARDAR SELECCIONADOS ${totalCambios > 0 ? `(${totalCambios})` : ""}`}
                                </Button>
                            )}
                        </div>
                        {totalCambios > 0 && (
                            <span className="text-[9px] font-black text-amber-600 animate-pulse uppercase tracking-tighter">
                                Tienes cambios acumulados de varios empleados
                            </span>
                        )}
                    </div>
                }
                footerStats={
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-wider">
                        {currentTab === "pendientes" ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <Icons.Clock
                                        size={14}
                                        className="text-blue-500"
                                    />
                                    <span className="text-slate-700">
                                        Pendientes:
                                    </span>
                                    <span className="text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full">
                                        {empleados.total || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-700">
                                        Cambios:
                                    </span>
                                    <span className="text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-full">
                                        {totalCambios}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icons.Save
                                        size={14}
                                        className="text-emerald-500"
                                    />
                                    <span className="text-slate-700">
                                        Por guardar:
                                    </span>
                                    <span className="text-emerald-600 text-sm bg-emerald-50 px-3 py-1 rounded-full">
                                        {
                                            Object.values(drafts).filter(
                                                (d) =>
                                                    d.talla !== "" &&
                                                    d.cargo_actual !== "" &&
                                                    d.profesion !== "" &&
                                                    d.etiqueta !== "",
                                            ).length
                                        }
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <Icons.ListChecks
                                        size={14}
                                        className="text-emerald-500"
                                    />
                                    <span className="text-slate-700">
                                        Registrados:
                                    </span>
                                    <span className="text-emerald-600 text-sm bg-emerald-50 px-3 py-1 rounded-full">
                                        {empleados.total || 0}
                                    </span>
                                </div>
                                {totalCambios > 0 ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-700">
                                                Cambios:
                                            </span>
                                            <span className="text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-full">
                                                {totalCambios}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icons.Save
                                                size={14}
                                                className="text-emerald-500"
                                            />
                                            <span className="text-slate-700">
                                                Por actualizar:
                                            </span>
                                            <span className="text-emerald-600 text-sm bg-emerald-50 px-3 py-1 rounded-full">
                                                {
                                                    Object.values(
                                                        drafts,
                                                    ).filter(
                                                        (d) =>
                                                            d.talla !== "" &&
                                                            d.cargo_actual !==
                                                                "" &&
                                                            d.profesion !==
                                                                "" &&
                                                            d.etiqueta !== "",
                                                    ).length
                                                }
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-700">
                                            Estado:
                                        </span>
                                        <span className="text-green-600 text-sm bg-green-50 px-3 py-1 rounded-full">
                                            ✓ Sin cambios
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                }
                extraFilters={
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border text-slate-700">
                        <button
                            onClick={() => changeTab("pendientes")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                                currentTab === "pendientes"
                                    ? "bg-white shadow-md text-blue-600"
                                    : "text-slate-800 hover:text-slate-700"
                            }`}
                        >
                            <Icons.Clock size={14} /> POR REGISTRAR
                        </button>
                        <button
                            onClick={() => changeTab("registrados")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                                currentTab === "registrados"
                                    ? "bg-white shadow-md text-emerald-600"
                                    : "text-slate-800 hover:text-slate-700"
                            }`}
                        >
                            <Icons.ListChecks size={14} /> YA REGISTRADOS
                        </button>
                    </div>
                }
            >
                <div className="bg-white rounded-[2rem] border text-slate-700 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic">
                                <tr>
                                    <th className="p-4 border-r border-slate-800">
                                        Datos del Empleado
                                    </th>
                                    <th className="p-4 border-r border-slate-800">
                                        Cargo Actual
                                    </th>
                                    <th className="p-4 border-r border-slate-800">
                                        Profesión
                                    </th>
                                    <th className="p-4 border-r border-slate-800 text-center">
                                        Talla
                                    </th>
                                    {currentTab === "pendientes" && (
                                        <th className="p-4 border-r border-slate-800 text-center">
                                            Etiqueta
                                        </th>
                                    )}
                                    {currentTab === "registrados" && (
                                        <>
                                            <th className="p-4 border-r border-slate-800 text-center">
                                                Etiqueta
                                            </th>
                                            <th className="p-4 text-center">
                                                Acciones
                                            </th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-600">
                                {lista.length > 0 ? (
                                    lista.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="font-black text-slate-800 uppercase text-[12px]">
                                                    {emp.nombre_completo}
                                                </div>
                                                <div className="text-slate-700 font-mono text-[10px]">
                                                    {emp.cedula}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {currentTab === "pendientes" ? (
                                                    <select
                                                        className="w-full text-slate-700 rounded-xl py-1.5 font-black uppercase text-[10px] focus:ring-blue-500"
                                                        value={
                                                            emp.cargo_actual ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                emp.id,
                                                                "cargo_actual",
                                                                e.target.value,
                                                                emp,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            -- SELECCIONE --
                                                        </option>
                                                        {cargos &&
                                                            cargos.map(
                                                                (cargo) => (
                                                                    <option
                                                                        key={
                                                                            cargo.id ||
                                                                            cargo.nombre_del_cargo
                                                                        }
                                                                        value={
                                                                            cargo.nombre_del_cargo
                                                                        }
                                                                    >
                                                                        {
                                                                            cargo.nombre_del_cargo
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                ) : (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-[9px] uppercase tracking-tighter">
                                                        {emp.cargo_actual ||
                                                            "Sin asignar"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {currentTab === "pendientes" ? (
                                                    <select
                                                        className="w-full text-slate-700 rounded-xl py-1.5 font-black uppercase text-[10px] focus:ring-blue-500"
                                                        value={
                                                            emp.profesion || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                emp.id,
                                                                "profesion",
                                                                e.target.value,
                                                                emp,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            -- SELECCIONE --
                                                        </option>
                                                        <option value="Docente">
                                                            Docente
                                                        </option>
                                                        <option value="T.S.U">
                                                            T.S.U
                                                        </option>
                                                        <option value="Profe.">
                                                            Profe.
                                                        </option>
                                                        <option value="Profa.">
                                                            Profa.
                                                        </option>
                                                        <option value="Profe. MSc.">
                                                            Profe. MSc.
                                                        </option>
                                                        <option value="Profa. MSc.">
                                                            Profa. MSc.
                                                        </option>
                                                        <option value="Lcdo.">
                                                            Lcdo.
                                                        </option>
                                                        <option value="Lcda.">
                                                            Lcda.
                                                        </option>
                                                        <option value="Ing.">
                                                            Ing.
                                                        </option>
                                                    </select>
                                                ) : (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] uppercase tracking-tighter">
                                                        {emp.profesion ||
                                                            "Sin asignar"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {currentTab === "pendientes" ? (
                                                    <select
                                                        className="w-24 text-slate-700 rounded-xl py-1.5 font-black mx-auto block text-center text-[10px] focus:ring-blue-500"
                                                        value={emp.talla || ""}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                emp.id,
                                                                "talla",
                                                                e.target.value,
                                                                emp,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            -
                                                        </option>
                                                        {[
                                                            "S",
                                                            "M",
                                                            "L",
                                                            "XL",
                                                            "XXL",
                                                            "16",
                                                        ].map((t) => (
                                                            <option
                                                                key={t}
                                                                value={t}
                                                            >
                                                                {t}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] uppercase tracking-tighter font-black">
                                                        {emp.talla ||
                                                            "Sin asignar"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {currentTab === "pendientes" ? (
                                                    <select
                                                        className="w-32 text-slate-700 rounded-xl py-1.5 font-black mx-auto block text-center text-[10px] focus:ring-blue-500"
                                                        value={
                                                            emp.etiqueta || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                emp.id,
                                                                "etiqueta",
                                                                e.target.value,
                                                                emp,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            -- SELECCIONE --
                                                        </option>
                                                        {etiquetas &&
                                                            etiquetas.length >
                                                                0 &&
                                                            etiquetas.map(
                                                                (etiqueta) => (
                                                                    <option
                                                                        key={
                                                                            etiqueta
                                                                        }
                                                                        value={
                                                                            etiqueta
                                                                        }
                                                                    >
                                                                        {
                                                                            etiqueta
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                ) : (
                                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] uppercase tracking-tighter font-black">
                                                        {emp.etiqueta ||
                                                            "Sin asignar"}
                                                    </span>
                                                )}
                                            </td>
                                            {currentTab === "registrados" && (
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    emp,
                                                                )
                                                            }
                                                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 rounded-xl"
                                                        >
                                                            <Icons.Edit
                                                                size={14}
                                                            />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    emp.id,
                                                                    emp.nombre_completo,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                emp.id
                                                            }
                                                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                                                        >
                                                            {deletingId ===
                                                            emp.id ? (
                                                                <Icons.Loader2
                                                                    size={14}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Icons.Trash2
                                                                    size={14}
                                                                />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                currentTab === "registrados"
                                                    ? 6
                                                    : 5
                                            }
                                            className="p-10 text-center text-slate-700 italic"
                                        >
                                            No hay registros que coincidan con
                                            la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>

            {/* MODAL DE EDICIÓN INDIVIDUAL */}
            {modalOpen && editingEmpleado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Header del Modal */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-wider">
                                    Editar Registro
                                </h3>
                                <p className="text-blue-100 text-[10px] font-bold">
                                    {editingEmpleado.nombre_completo}
                                </p>
                            </div>
                            <button
                                onClick={closeEditModal}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <Icons.X size={20} />
                            </button>
                        </div>

                        {/* Cuerpo del Modal */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1">
                                    Cargo Actual
                                </label>
                                <select
                                    className="w-full text-slate-700 rounded-xl py-2.5 px-3 font-black uppercase text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={editData.cargo_actual}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            cargo_actual: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">-- SELECCIONE --</option>
                                    {cargos &&
                                        cargos.map((cargo) => (
                                            <option
                                                key={
                                                    cargo.id ||
                                                    cargo.nombre_del_cargo
                                                }
                                                value={cargo.nombre_del_cargo}
                                            >
                                                {cargo.nombre_del_cargo}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1">
                                    Profesión
                                </label>
                                <select
                                    className="w-full text-slate-700 rounded-xl py-2.5 px-3 font-black uppercase text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={editData.profesion}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            profesion: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">-- SELECCIONE --</option>
                                    <option value="T.S.U">T.S.U</option>
                                    <option value="Profe.">Profe.</option>
                                    <option value="Profa.">Profa.</option>
                                    <option value="Profe. MSc.">
                                        Profe. MSc.
                                    </option>
                                    <option value="Profa. MSc.">
                                        Profa. MSc.
                                    </option>
                                    <option value="Lcdo.">Lcdo.</option>
                                    <option value="Lcda.">Lcda.</option>
                                    <option value="Ing.">Ing.</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1">
                                    Talla
                                </label>
                                <select
                                    className="w-full text-slate-700 rounded-xl py-2.5 px-3 font-black uppercase text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={editData.talla}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            talla: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">-- SELECCIONE --</option>
                                    {["S", "M", "L", "XL", "XXL", "16"].map(
                                        (t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-1">
                                    Etiqueta
                                </label>
                                <select
                                    className="w-full text-slate-700 rounded-xl py-2.5 px-3 font-black uppercase text-[11px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    value={editData.etiqueta}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            etiqueta: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">-- SELECCIONE --</option>
                                    {etiquetas &&
                                        etiquetas.length > 0 &&
                                        etiquetas.map((etiqueta) => (
                                            <option
                                                key={etiqueta}
                                                value={etiqueta}
                                            >
                                                {etiqueta}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        {/* Footer del Modal */}
                        <div className="px-6 py-4 bg-slate-50 flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                onClick={closeEditModal}
                                className="text-slate-600 hover:bg-slate-200 rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleIndividualSave}
                                disabled={editLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                            >
                                {editLoading ? (
                                    <Icons.Loader2
                                        size={16}
                                        className="animate-spin mr-2"
                                    />
                                ) : (
                                    <Icons.Save size={16} className="mr-2" />
                                )}
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
