"use client";
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    memo,
} from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, router, Link, useForm, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import axios from "axios";
import { debounce } from "lodash";
import {
    AlertTriangle,
    Briefcase,
    CheckCircle2,
    ClipboardList,
    IdCard,
    Loader2,
    MapPin,
    Phone,
    Search,
    ShoppingCart,
    UserCog,
    UserRoundCog,
    X,
} from "lucide-react";

// Componente memoizado para la fila del estudiante
const StudentRow = memo(
    ({ est, selectedIds, toggleSelect, openGuardianManager }) => {
        const isSelected = selectedIds.includes(est.id);

        return (
            <tr
                className={`hover:bg-blue-50/50 transition-all ${isSelected ? "bg-blue-50" : ""}`}
            >
                <td className="px-6 py-4">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(est.id)}
                        className="w-5 h-5 rounded-lg text-blue-600 cursor-pointer"
                    />
                </td>
                <td className="px-6 py-4" colSpan={2}>
                    <div className="flex gap-4 p-2 rounded-[1.5rem] items-center border border-pink-600">
                        {/* Representante */}
                        <div
                            onClick={() =>
                                openGuardianManager(est, "representante")
                            }
                            className="flex-1 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[8px] font-black text-indigo-500 mb-1">
                                        PRINCIPAL
                                    </p>
                                    <p className="font-black text-slate-700 tracking-wider text-[11px] leading-none">
                                        {est.representante_name ||
                                            "NO ASIGNADO"}
                                    </p>
                                    <p className="text-[12px] font-bold text-slate-700 tracking-wider mt-1 italic">
                                        {est.representante_cedula
                                            ? `C.I: ${est.representante_cedula}`
                                            : "Haga clic para vincular"}
                                    </p>
                                </div>
                                <UserCog
                                    size={14}
                                    className="text-slate-300 group-hover:text-indigo-500 flex-shrink-0"
                                />
                            </div>
                        </div>

                        <div className="h-8 w-px bg-slate-100 flex-shrink-0" />

                        {/* Padre/Madre */}
                        <div
                            onClick={() => openGuardianManager(est, "padre")}
                            className="flex-1 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[8px] font-black text-blue-500 mb-1">
                                        ALTERNO
                                    </p>
                                    <p className="font-black text-slate-700 tracking-wider text-[11px] leading-none">
                                        {est.padre_name || "NO ASIGNADO"}
                                    </p>
                                    <p className="text-[12px] font-bold text-slate-600 tracking-wider mt-1 italic">
                                        {est.padre_cedula
                                            ? `C.I: ${est.padre_cedula}`
                                            : "Haga clic para vincular"}
                                    </p>
                                </div>
                                <UserCog
                                    size={14}
                                    className="text-slate-300 group-hover:text-blue-500 flex-shrink-0"
                                />
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <p className="text-slate-900 font-black text-xs">
                        {est.name} {est.apellido}
                    </p>
                    <p className="text-blue-500 italic text-[8px]">
                        {est.nombre_del_grado} {est.seccion}
                    </p>
                </td>
            </tr>
        );
    },
);

export default function UnisexIndex({ estudiantes, grados, filters }) {
    const { flash } = usePage().props;

    // --- ESTADOS NAVEGACIÓN Y SELECCIÓN ---
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- ESTADOS MODALES ---
    const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);

    // --- ESTADOS GESTOR DE RESPONSABLES ---
    const [isRegisteringNewGuardian, setIsRegisteringNewGuardian] =
        useState(false);
    const [searchCedulaResp, setSearchCedulaResp] = useState("");
    const [foundResponsable, setFoundResponsable] = useState(null);
    const [isSearchingResp, setIsSearchingResp] = useState(false);
    const [targetField, setTargetField] = useState("representante");
    const [parentesco, setParentesco] = useState("");
    const [isLinking, setIsLinking] = useState(false);

    // --- FORMULARIO NUEVO RESPONSABLE ---
    const formGuardian = useForm({
        documento_r: "V",
        cedula_r: "",
        name_r: "",
        sexo_r: "",
        fecha_de_nacimiento_r: "",
        telefono_r: "",
        ocupacion_r: "",
        direccion_r: "",
    });

    // --- LÓGICA DE BÚSQUEDA CON DEBOUNCE OPTIMIZADO ---
    const buscarResponsable = useCallback(async (cedula) => {
        if (cedula.length < 5) {
            setFoundResponsable(null);
            return;
        }
        setIsSearchingResp(true);
        try {
            const response = await axios.post(
                route("estudiantes.acciones.unisex.buscar.responsable"),
                { cedula },
            );
            setFoundResponsable(response.data.responsable || null);
        } catch (error) {
            console.error("Error buscando responsable:", error);
            setFoundResponsable(null);
        } finally {
            setIsSearchingResp(false);
        }
    }, []);

    const debouncedSearch = useRef(
        debounce((cedula) => buscarResponsable(cedula), 500),
    ).current;

    useEffect(() => {
        setSearchTerm(filters?.search || "");
    }, [filters?.search]);

    useEffect(() => {
        debouncedSearch(searchCedulaResp);
        return () => debouncedSearch.cancel();
    }, [searchCedulaResp, debouncedSearch]);

    // --- MANEJO DE FLASH ---
    useEffect(() => {
        if (flash?.responsable) {
            setFoundResponsable(flash.responsable);
            setIsRegisteringNewGuardian(false);
            setSearchCedulaResp(flash.responsable.cedula_r);
        }
    }, [flash]);

    // --- ACCIONES DE VÍNCULO ---
    const openGuardianManager = useCallback((student, type) => {
        setSelectedStudent(student);
        setTargetField(type);
        setSearchCedulaResp("");
        setFoundResponsable(null);
        setIsRegisteringNewGuardian(false);
        setParentesco("");
        setIsGuardianModalOpen(true);
    }, []);

    const closeGuardianModal = useCallback(() => {
        setIsGuardianModalOpen(false);
        setFoundResponsable(null);
        setSearchCedulaResp("");
        setIsRegisteringNewGuardian(false);
        setParentesco("");
        formGuardian.reset();
    }, [formGuardian]);

    const assignGuardian = useCallback(() => {
        if (targetField === "representante" && !parentesco) {
            return toast.warning("Seleccione el parentesco.");
        }
        setIsLinking(true);
        router.patch(
            route(
                "estudiantes.acciones.unisex.updateVinculo",
                selectedStudent.id,
            ),
            {
                responsable_id: foundResponsable.id,
                tipo: targetField,
                parentesco: targetField === "representante" ? parentesco : null,
            },
            {
                onSuccess: () => {
                    setIsGuardianModalOpen(false);
                },
                onFinish: () => setIsLinking(false),
            },
        );
    }, [targetField, parentesco, selectedStudent, foundResponsable]);

    const submitCreateGuardian = useCallback(
        (e) => {
            e.preventDefault();
            formGuardian.setData("cedula_r", searchCedulaResp);
            formGuardian.post(
                route("estudiantes.acciones.unisex.storeResponsable"),
                {
                    preserveScroll: true,
                    onSuccess: () => {},
                },
            );
        },
        [formGuardian, searchCedulaResp],
    );

    // --- LÓGICA SELECCIÓN ---
    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    }, []);

    // --- GUARDAR SELECCIONADOS DIRECTAMENTE ---
    const guardarSeleccionados = useCallback(() => {
        if (selectedIds.length === 0) {
            return toast.warning("Seleccione al menos un estudiante.");
        }

        setIsSaving(true);

        const registros = selectedIds.map((id) => ({
            estudiante_id: id,
        }));

        router.post(
            route("estudiantes.acciones.unisex.store"),
            { registros },
            {
                onSuccess: () => {
                    setSelectedIds([]);
                    setIsSaving(false);
                   // toast.success("Estudiantes registrados correctamente");

                    // Recargar la tabla
                    router.get(
                        route("estudiantes.acciones.unisex.index"),
                        { search: searchTerm },
                        { preserveState: true },
                    );
                },
                onError: (errors) => {
                    console.error("Errores:", errors);
                    toast.error("Error al guardar los estudiantes");
                    setIsSaving(false);
                },
            },
        );
    }, [selectedIds, searchTerm]);

    // --- MEMOIZAR DATOS ---
    const estudiantesData = useMemo(
        () => estudiantes?.data || [],
        [estudiantes],
    );

    // --- RENDER DEL MODAL GUARDIAN ---
    const renderGuardianModal = useMemo(() => {
        if (!isGuardianModalOpen) return null;

        return createPortal(
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-3xl p-10 max-h-[95vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 relative border border-white">
                    <button
                        onClick={closeGuardianModal}
                        className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-5 mb-8 border-b pb-6 border-slate-100">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white ${targetField === "padre" ? "bg-indigo-600 shadow-indigo-200" : "bg-blue-600 shadow-blue-200"}`}
                        >
                            <UserRoundCog size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                                Asignar{" "}
                                {targetField === "padre"
                                    ? "Estatus Alterno (P2)"
                                    : "Estatus Principal (P1)"}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
                                Estudiante:{" "}
                                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {selectedStudent?.name}{" "}
                                    {selectedStudent?.apellido}
                                </span>
                            </p>
                        </div>
                    </div>

                    {!isRegisteringNewGuardian ? (
                        <div className="space-y-6">
                            <div className="relative group">
                                <Field
                                    label="Ingrese Cédula para consultar"
                                    autoFocus
                                    type="search"
                                    placeholder="Ej: 15666777"
                                    mask="00000000"
                                    value={searchCedulaResp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(
                                            /\D/g,
                                            "",
                                        );
                                        setSearchCedulaResp(val);
                                        if (!val) setFoundResponsable(null);
                                    }}
                                    icon={<Search size={16} />}
                                />
                                {isSearchingResp && (
                                    <div className="absolute right-4 bottom-3">
                                        <Loader2
                                            className="animate-spin text-indigo-500"
                                            size={18}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-inner min-h-[280px]">
                                {foundResponsable ? (
                                    <div className="w-full text-center animate-in slide-in-from-bottom-4">
                                        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4">
                                            <CheckCircle2 size={14} />
                                            Registro Verificado
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-800 uppercase italic mb-1">
                                            {foundResponsable.name_r}
                                        </h4>
                                        <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">
                                            Cédula: {foundResponsable.cedula_r}
                                        </p>

                                        {targetField === "representante" && (
                                            <div className="max-w-xs mx-auto mb-8">
                                                <SelectField
                                                    label="Definir Parentesco *"
                                                    value={parentesco}
                                                    options={[
                                                        "Padre",
                                                        "Madre",
                                                        "Abuelo(a)",
                                                        "Tio(a)",
                                                        "Tutor Legal",
                                                        "Otro",
                                                    ]}
                                                    onChange={(e) =>
                                                        setParentesco(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        )}

                                        <Button
                                            onClick={assignGuardian}
                                            loading={isLinking}
                                            variant="primary"
                                            className="w-full h-20 rounded-[2rem] text-xs shadow-xl shadow-indigo-100 italic"
                                        >
                                            VINCULAR COMO{" "}
                                            {targetField === "padre"
                                                ? "ALTERNO (P2)"
                                                : "REPRESENTANTE (P1)"}
                                        </Button>
                                    </div>
                                ) : searchCedulaResp.length >= 6 &&
                                  !isSearchingResp ? (
                                    <div className="text-center animate-in zoom-in-95">
                                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <AlertTriangle size={40} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-8 italic">
                                            No se encontró registro para la
                                            cédula{" "}
                                            <span className="text-slate-900 font-black">
                                                {searchCedulaResp}
                                            </span>
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="px-12 h-14 rounded-2xl border-indigo-200 text-indigo-600"
                                            onClick={() =>
                                                setIsRegisteringNewGuardian(
                                                    true,
                                                )
                                            }
                                        >
                                            REGISTRAR NUEVO RESPONSABLE
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center opacity-30">
                                        <IdCard
                                            size={64}
                                            className="mx-auto mb-4"
                                        />
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">
                                            Esperando identificación...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={submitCreateGuardian}
                            className="space-y-6 animate-in slide-in-from-right-4"
                        >
                            <div className="grid grid-cols-2 gap-5">
                                <Field
                                    label="Cédula"
                                    value={searchCedulaResp}
                                    readOnly
                                    className="bg-slate-50 font-black text-indigo-600"
                                />
                                <Field
                                    label="Nombre y Apellido *"
                                    value={formGuardian.data.name_r}
                                    autoFocus
                                    onChange={(e) =>
                                        formGuardian.setData(
                                            "name_r",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    error={formGuardian.errors.name_r}
                                    autoTitleCase
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <Field
                                    label="F. Nacimiento *"
                                    type="date"
                                    value={
                                        formGuardian.data.fecha_de_nacimiento_r
                                    }
                                    onChange={(e) =>
                                        formGuardian.setData(
                                            "fecha_de_nacimiento_r",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    error={
                                        formGuardian.errors
                                            .fecha_de_nacimiento_r
                                    }
                                />
                                <SelectField
                                    label="Género *"
                                    value={formGuardian.data.sexo_r}
                                    options={[
                                        { v: "M", l: "MASCULINO" },
                                        { v: "F", l: "FEMENINO" },
                                    ]}
                                    onChange={(e) =>
                                        formGuardian.setData(
                                            "sexo_r",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    error={formGuardian.errors.sexo_r}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <Field
                                    label="Teléfono"
                                    mask="0000-0000000"
                                    value={formGuardian.data.telefono_r}
                                    onChange={(e) =>
                                        formGuardian.setData(
                                            "telefono_r",
                                            e.target.value,
                                        )
                                    }
                                    icon={<Phone size={14} />}
                                />
                                <Field
                                    label="Ocupación"
                                    value={formGuardian.data.ocupacion_r}
                                    onChange={(e) =>
                                        formGuardian.setData(
                                            "ocupacion_r",
                                            e.target.value,
                                        )
                                    }
                                    icon={<Briefcase size={14} />}
                                />
                            </div>
                            <Field
                                label="Dirección de Habitación *"
                                value={formGuardian.data.direccion_r}
                                onChange={(e) =>
                                    formGuardian.setData(
                                        "direccion_r",
                                        e.target.value,
                                    )
                                }
                                required
                                icon={<MapPin size={14} />}
                            />

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1 py-7"
                                    onClick={() =>
                                        setIsRegisteringNewGuardian(false)
                                    }
                                >
                                    CANCELAR
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-[2] py-7 shadow-xl shadow-indigo-100"
                                    loading={formGuardian.processing}
                                >
                                    GUARDAR Y VINCULAR
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>,
            document.body,
        );
    }, [
        isGuardianModalOpen,
        closeGuardianModal,
        targetField,
        selectedStudent,
        isRegisteringNewGuardian,
        searchCedulaResp,
        foundResponsable,
        isSearchingResp,
        parentesco,
        isLinking,
        assignGuardian,
        submitCreateGuardian,
        formGuardian,
    ]);

    return (
        <AuthenticatedLayout>
            <Head title="Gestión Unisex" />
            <ViewContainer
                title="Gestión de registro"
                subtitle="Registro general de estudiantes"
                icon="Shirt"
                onSearch={(v) =>
                    router.get(
                        route("estudiantes.acciones.unisex.index"),
                        { search: v },
                        { preserveState: true },
                    )
                }
                searchValue={searchTerm}
                extraFilters={
                    <div className="flex gap-4 mr-6">
                        {selectedIds.length > 0 && (
                            <Button
                                variant="success"
                                onClick={guardarSeleccionados}
                                loading={isSaving}
                                className="shadow-emerald-500/20 animate-in zoom-in"
                            >
                                <ShoppingCart className="mr-2" /> GUARDAR
                                SELECCIONADOS ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                }
                actions={
                    <div className="flex gap-2 flex-wrap">
                        <Link
                            href={route("estudiantes.acciones.unisex.listado")}
                        >
                            <Button variant="primary" size="sm">
                                <ClipboardList size={16} /> VER REGISTRADOS
                            </Button>
                        </Link>
                      
                    </div>
                }
            >
                <div className="bg-white rounded-t-[1.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-white text-[9px] font-black uppercase italic tracking-widest">
                                <tr>
                                    <th className="px-6 py-5 w-10"></th>
                                    <th className="px-6 py-5" colSpan={2}>
                                        Vínculos Familiares (P1 / P2)
                                    </th>
                                    <th className="px-6 py-5">
                                        Datos de representados
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[10px] font-bold text-slate-600 uppercase divide-y divide-slate-500">
                                {estudiantesData.map((est) => (
                                    <StudentRow
                                        key={est.id}
                                        est={est}
                                        selectedIds={selectedIds}
                                        toggleSelect={toggleSelect}
                                        openGuardianManager={
                                            openGuardianManager
                                        }
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>

            {renderGuardianModal}
        </AuthenticatedLayout>
    );
}
