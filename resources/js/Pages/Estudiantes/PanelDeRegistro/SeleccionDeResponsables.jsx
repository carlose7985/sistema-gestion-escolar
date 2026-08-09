import React, { useState, useEffect, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import { Section, Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import {
    UserPlus,
    Search,
    ShieldCheck,
    UserCheck,
    AlertCircle,
    Save,
    Loader2,
    ArrowRight,
    ArrowLeftCircle,
    X,
    Fingerprint,
    Heart,
    Phone,
    MapPin,
    Briefcase,
} from "lucide-react";
import axios from "axios";
import { debounce } from "lodash";
import Swal from "sweetalert2";

export default function SeleccionaResponsable({ grado_id, status }) {
    // --- ESTADOS LOCALES ---
    const [mostrarProgenitorManual, setMostrarProgenitorManual] =
        useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isSearchingRep, setIsSearchingRep] = useState(false);
    const [isSearchingPadre, setIsSearchingPadre] = useState(false);
    const [responsableEncontrado, setResponsableEncontrado] = useState(null);
    const [padreEncontrado, setPadreEncontrado] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registeringFor, setRegisteringFor] = useState("representante");

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // --- FORMULARIO PRINCIPAL (Vinculación) ---
    const { data, setData, post, reset, errors, clearErrors } = useForm({
        cedula_representante: "",
        representante_id: "",
        nombre_representante: "",
        parentesco: "",
        cedula_padre: "",
        padre_id: "",
        nombre_padre: "",
        grado_id: grado_id,
        status: status,
    });

    // --- FORMULARIO MODAL (Nuevo Registro) ---
    const formNew = useForm({
        name_r: "",
        documento_r: "V-",
        cedula_r: "",
        fecha_de_nacimiento_r: "",
        sexo_r: "",
        telefono_r: "",
        ocupacion_r: "",
        direccion_r: "",
    });

    // --- LÓGICA DE BÚSQUEDA ---
    const buscarResponsable = async (cedula, tipo) => {
        const setLoading =
            tipo === "representante" ? setIsSearchingRep : setIsSearchingPadre;
        setLoading(true);
        try {
            const response = await axios.post(route("estudiantes.registro.buscar.responsable"), {
                cedula,
            });
            const res = response.data.responsable;
            if (res) {
                if (tipo === "representante") {
                    setResponsableEncontrado(res);
                    setData((prev) => ({
                        ...prev,
                        representante_id: res.id,
                        nombre_representante: res.name_r,
                        cedula_representante: cedula,
                    }));
                } else {
                    setPadreEncontrado(res);
                    setData((prev) => ({
                        ...prev,
                        padre_id: res.id,
                        nombre_padre: res.name_r,
                        cedula_padre: cedula,
                    }));
                }
                Toast.fire({
                    icon: "success",
                    title: `${tipo === "representante" ? "Representante" : "Progenitor"} localizado`,
                });
            } else {
                limpiarBusqueda(tipo);
                Toast.fire({ icon: "info", title: "No registrado en sistema" });
            }
        } catch (e) {
            limpiarBusqueda(tipo);
            Toast.fire({ icon: "error", title: "Error de conexión" });
        } finally {
            setLoading(false);
        }
    };

    const limpiarBusqueda = (tipo) => {
        if (tipo === "representante") {
            setResponsableEncontrado(null);
            setData((prev) => ({
                ...prev,
                representante_id: "",
                nombre_representante: "",
            }));
        } else {
            setPadreEncontrado(null);
            setData((prev) => ({ ...prev, padre_id: "", nombre_padre: "" }));
        }
    };

    // --- WATCHERS (Debounce) ---
    const debouncedSearchRep = useCallback(
        debounce((val) => {
            if (val.length >= 7) buscarResponsable(val, "representante");
            else limpiarBusqueda("representante");
        }, 500),
        [],
    );

    const debouncedSearchPadre = useCallback(
        debounce((val) => {
            if (val.length >= 7) buscarResponsable(val, "padre");
            else limpiarBusqueda("padre");
        }, 500),
        [],
    );

    useEffect(() => {
        debouncedSearchRep(data.cedula_representante);
    }, [data.cedula_representante]);
    useEffect(() => {
        debouncedSearchPadre(data.cedula_padre);
    }, [data.cedula_padre]);

    // --- HANDLERS ---
    const abrirModalRegistro = (tipo) => {
        setRegisteringFor(tipo);
        formNew.reset();
        formNew.clearErrors();
        formNew.setData(
            "cedula_r",
            tipo === "representante"
                ? data.cedula_representante
                : data.cedula_padre,
        );
        setShowRegisterModal(true);
    };

    const guardarNuevoResponsable = (e) => {
        e.preventDefault();
        formNew.post(route("estudiantes.registro.guardar.responsable"), {
            onSuccess: () => {
                setShowRegisterModal(false);
                buscarResponsable(formNew.data.cedula_r, registeringFor);
            },
        });
    };

    const handleNextStep = () => {
        if (!data.representante_id || !data.parentesco) {
            Toast.fire({
                icon: "warning",
                title: "Complete los datos del representante",
            });
            return;
        }
        setIsNavigating(true);
        router.get(
            route("estudiantes.registro.crear.estudiante"),
            { ...data },
            {
                onFinish: () => setIsNavigating(false),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Selección de Responsables" />
            <ViewContainer
                title="Selección de Responsables"
                subtitle="Vinculación legal y biológica del estudiante"
                icon="User"
                showSearch={false}
                actions={
                    <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer gap-3 bg-green-100 px-4 py-2 rounded-xl border border-slate-200">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                Registrar padre/madre?
                            </span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={mostrarProgenitorManual}
                                    onChange={(e) =>
                                        setMostrarProgenitorManual(
                                            e.target.checked,
                                        )
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </div>
                        </label>
                        <Link href={route("estudiantes.registro.selecciona.grado")}>
                            <Button>
                                <ArrowLeftCircle size={16} className="mr-2" />{" "}
                                VOLVER
                            </Button>
                        </Link>
                    </div>
                }
            >
                <div className="h-full flex flex-col gap-6 p-4 overflow-y-auto custom-scrollbar">
                    {/* PANEL 1: REPRESENTANTE LEGAL */}
                    <Section className="border-l-[6px] border-l-indigo-600 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">
                                        Representante Legal
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                                        Titular de la inscripción
                                    </p>
                                </div>
                            </div>
                            {responsableEncontrado && (
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 animate-in fade-in zoom-in">
                                    <UserCheck size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        Validado
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <Field
                                    label="Cédula de Identidad"
                                    placeholder="Ingrese C.I."
                                    autoFocus
                                    mask="00000000"
                                    value={data.cedula_representante}
                                    onChange={(e) =>
                                        setData(
                                            "cedula_representante",
                                            e.target.value.replace(/\D/g, ""),
                                        )
                                    }
                                    icon={
                                        isSearchingRep ? (
                                            <Loader2
                                                className="animate-spin"
                                                size={18}
                                            />
                                        ) : (
                                            <Fingerprint size={18} />
                                        )
                                    }
                                />
                                {!isSearchingRep &&
                                    data.cedula_representante.length >= 7 &&
                                    !responsableEncontrado && (
                                        <div className="absolute -bottom-5 left-2 flex justify-between w-full pr-4">
                                            <span className="text-[8px] font-black text-rose-500 uppercase italic">
                                                No registrado
                                            </span>
                                            <button
                                                onClick={() =>
                                                    abrirModalRegistro(
                                                        "representante",
                                                    )
                                                }
                                                className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
                                            >
                                                + Registrar Nuevo
                                            </button>
                                        </div>
                                    )}
                            </div>

                            <Field
                                label="Nombre Completo"
                                value={data.nombre_representante}
                                readOnly
                                placeholder="Esperando identificación..."
                                className="bg-slate-50 italic"
                            />

                            <SelectField
                                label="Parentesco / Vínculo"
                                value={data.parentesco}
                                onChange={(e) => {
                                    setData("parentesco", e.target.value);
                                    clearErrors("parentesco");
                                }}
                                options={[
                                    "Padre",
                                    "Madre",
                                    "Abuelo",
                                    "Abuela",
                                    "Hermano",
                                    "Hermana",
                                    "Tio",
                                    "Tia",  
                                    "Padrastro",
                                    "Madrastra",
                                    "Responsable",
                                    "Tutor/Legal",
                                    "Otro Familiar",
                                    "Otro No Familiar",
                                ]}
                                error={errors.parentesco}
                            />
                        </div>
                    </Section>

                    {/* PANEL 2: PROGENITOR BIOLÓGICO */}
                    {(mostrarProgenitorManual ||
                        (data.parentesco &&
                            !["Madre", "Padre"].includes(data.parentesco))) && (
                        <Section className="border-l-[6px] border-l-emerald-500 shadow-xl animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Heart size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">
                                        Progenitor Biológico
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                                        Datos obligatorios de padre/madre
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="relative">
                                    <Field
                                        label="Cédula del Progenitor"
                                        placeholder="Ingrese C.I."
                                        autoFocus
                                        mask="00000000"
                                        value={data.cedula_padre}
                                        onChange={(e) =>
                                            setData(
                                                "cedula_padre",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        icon={
                                            isSearchingPadre ? (
                                                <Loader2
                                                    className="animate-spin"
                                                    size={18}
                                                />
                                            ) : (
                                                <Search size={18} />
                                            )
                                        }
                                    />
                                    {!isSearchingPadre &&
                                        data.cedula_padre.length >= 7 &&
                                        !padreEncontrado && (
                                            <div className="absolute -bottom-5 left-2 flex justify-between w-full pr-4">
                                                <span className="text-[8px] font-black text-rose-500 uppercase italic">
                                                    No registrado
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        abrirModalRegistro(
                                                            "padre",
                                                        )
                                                    }
                                                    className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
                                                >
                                                    + Registrar Nuevo
                                                </button>
                                            </div>
                                        )}
                                </div>
                                <Field
                                    label="Nombre Completo"
                                    value={data.nombre_padre}
                                    readOnly
                                    placeholder="Esperando identificación..."
                                    className="bg-slate-50 italic"
                                />
                            </div>
                        </Section>
                    )}

                    {/* BOTÓN DE ACCIÓN FINAL */}
                    <div className="flex justify-center py-6">
                        <button
                            onClick={handleNextStep}
                            disabled={
                                isNavigating ||
                                !data.representante_id ||
                                !data.parentesco ||
                                (data.parentesco === "Representante" &&
                                    !data.padre_id)
                            }
                            className="group relative inline-flex items-center justify-center gap-4 px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:bg-black transition-all disabled:opacity-20 disabled:cursor-not-allowed min-w-[380px]"
                        >
                            {isNavigating ? (
                                <>
                                    <Loader2
                                        className="animate-spin"
                                        size={20}
                                    />{" "}
                                    PROCESANDO...
                                </>
                            ) : (
                                <>
                                    CONTINUAR AL REGISTRO{" "}
                                    <ArrowRight
                                        size={20}
                                        className="group-hover:translate-x-2 transition-transform"
                                    />
                                </>
                            )}
                        </button>
                    </div>

                    {grado_id === null && (
                        <div className="mx-4 flex items-center gap-3 bg-amber-50 border-l-4 border-l-amber-500 p-4 rounded-xl">
                            <AlertCircle className="text-amber-600" size={20} />
                            <p className="text-[10px] text-amber-800 font-black uppercase tracking-tighter italic">
                                Atención: Registro de Nuevo Ingreso sin grado
                                asignado (Lista de Espera)
                            </p>
                        </div>
                    )}
                </div>

                {/* MODAL REGISTRO NUEVO */}
                {showRegisterModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-3xl animate-in zoom-in-95 duration-300 border border-white p-10">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <UserPlus size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
                                        Nuevo Responsable
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowRegisterModal(false)}
                                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form
                                onSubmit={guardarNuevoResponsable}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="flex gap-2 items-end">
                                        <div className="w-24">
                                            <SelectField
                                                label="Doc."
                                                value={formNew.data.documento_r}
                                                options={["V-", "E-"]}
                                                onChange={(e) =>
                                                    formNew.setData(
                                                        "documento_r",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Field
                                                label="Cédula"
                                                value={formNew.data.cedula_r}
                                                readOnly
                                                className="bg-slate-50"
                                            />
                                        </div>
                                    </div>
                                    <Field
                                        label="Nombre y Apellido *"
                                        value={formNew.data.name_r}
                                        autoFocus
                                        onChange={(e) =>
                                            formNew.setData(
                                                "name_r",
                                                e.target.value,
                                            )
                                        }
                                        error={formNew.errors.name_r}
                                        required
                                        className="capitalize"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <Field
                                        label="F. Nacimiento *"
                                        type="date"
                                        value={
                                            formNew.data.fecha_de_nacimiento_r
                                        }
                                        onChange={(e) =>
                                            formNew.setData(
                                                "fecha_de_nacimiento_r",
                                                e.target.value,
                                            )
                                        }
                                        error={
                                            formNew.errors.fecha_de_nacimiento_r
                                        }
                                        required
                                    />
                                    <SelectField
                                        label="Sexo *"
                                        value={formNew.data.sexo_r}
                                        options={[
                                            { v: "M", l: "Masculino" },
                                            { v: "F", l: "Femenino" },
                                        ]}
                                        onChange={(e) =>
                                            formNew.setData(
                                                "sexo_r",
                                                e.target.value,
                                            )
                                        }
                                        error={formNew.errors.sexo_r}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <Field
                                        label="Teléfono"
                                        mask="0000-0000000"
                                        value={formNew.data.telefono_r}
                                        onChange={(e) =>
                                            formNew.setData(
                                                "telefono_r",
                                                e.target.value,
                                            )
                                        }
                                        error={formNew.errors.telefono_r}
                                        icon={<Phone size={14} />}
                                    />
                                    <Field
                                        label="Ocupación"
                                        value={formNew.data.ocupacion_r}
                                        onChange={(e) =>
                                            formNew.setData(
                                                "ocupacion_r",
                                                e.target.value,
                                            )
                                        }
                                        error={formNew.errors.ocupacion_r}
                                        icon={<Briefcase size={14} />}
                                        className="capitalize"
                                    />
                                </div>

                                <Field
                                    label="Dirección de Habitación"
                                    value={formNew.data.direccion_r}
                                    onChange={(e) =>
                                        formNew.setData(
                                            "direccion_r",
                                            e.target.value,
                                        )
                                    }
                                    error={formNew.errors.direccion_r}
                                    icon={<MapPin size={14} />}
                                    className="capitalize"
                                />

                                <button
                                    type="submit"
                                    disabled={formNew.processing}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                                >
                                    {formNew.processing ? (
                                        <Loader2
                                            className="animate-spin"
                                            size={16}
                                        />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    GUARDAR 
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
