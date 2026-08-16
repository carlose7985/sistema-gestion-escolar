"use client";
import React, { useRef, useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import {
    Section,
    Field,
    SelectField,
} from "@/Components/Layout/FormComponents";
import { Head, useForm, Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/Components/Ui/Button";
import {
    Building2,
    ChevronLeftCircle,
    Edit3,
    GraduationCap,
    Home,
    Printer,
    FileText,
    Hash,
    Map,
    Save,
    AlertCircle,
    CheckCircle2,
    LogOut,
} from "lucide-react";

export default function Institucion({ institucion }) {
    const isSubmittingRef = useRef(false);
    const [isEditing, setIsEditing] = useState(!institucion);
    const [hasChanges, setHasChanges] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [pendingUrl, setPendingUrl] = useState(null);

    const containerRef = useRef(null);
    const firstInputRef = useRef(null);

    // 1. Agregamos 'clearErrors' a la desestructuración
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        nombre_de_la_institucion: institucion?.nombre_de_la_institucion || "",
        direccion: institucion?.direccion || "",
        email: institucion?.email || "",
        telefono: institucion?.telefono || "",
        rif: institucion?.rif || "",
        nif: institucion?.nif || "",
        zona_educativa: institucion?.zona_educativa || "",
        codigo_dea: institucion?.codigo_dea || "",
        dependencia: institucion?.dependencia || "",
        codigo_de_dependencia: institucion?.codigo_de_dependencia || "",
        codigo_estadistico: institucion?.codigo_estadistico || "",
        codigo_cenae: institucion?.codigo_cenae || "",
        circuito: institucion?.circuito || "",
        codigo_circuito: institucion?.codigo_circuito || "",
        codigo_primaria: institucion?.codigo_primaria || "",
        fecha_de_fundada: institucion?.fecha_de_fundada || "",
        estado: institucion?.estado || "",
        municipio: institucion?.municipio || "",
        parroquia: institucion?.parroquia || "",
        comuna: institucion?.comuna || "",
        codigo_electoral: institucion?.codigo_electoral || "",
        turno: institucion?.turno || "",
        medio: institucion?.medio || "",
        tipo_de_escuela: institucion?.tipo_de_escuela || "",
        numero_de_aulas: institucion?.numero_de_aulas || "",
        numero_de_secciones: institucion?.numero_de_secciones || "",
        otras_aulas: institucion?.otras_aulas || "",
    });

    const calcularAntiguedad = (fecha) => {
        if (!fecha) return "0 años";
        const años = dayjs().diff(dayjs(fecha), "year");
        return años + (años === 1 ? " año" : " años");
    };

    useEffect(() => {
        const unbind = router.on("before", (event) => {
            if (hasChanges && !showExitModal && !isSubmittingRef.current) {
                event.preventDefault();
                setPendingUrl(event.detail.visit.url);
                setShowExitModal(true);
            }
        });
        return () => unbind();
    }, [hasChanges, showExitModal]);

    useEffect(() => {
        if (isEditing && firstInputRef.current) {
            setTimeout(() => {
                firstInputRef.current.focus();
            }, 50);
        }
    }, [isEditing]);


    const handleFieldChange = (nameOrEvent, valueOrUndefined) => {
        let name, value;

        // Si el primer argumento es un objeto con target, es un evento
        if (nameOrEvent && nameOrEvent.target) {
            name = nameOrEvent.target.name;
            value = nameOrEvent.target.value;
        }
        // Si el primer argumento es string y el segundo es el valor
        else if (
            typeof nameOrEvent === "string" &&
            valueOrUndefined !== undefined
        ) {
            name = nameOrEvent;
            value = valueOrUndefined;
        }
        // Si solo recibimos un valor y no tenemos nombre
        else {
            console.warn(
                "Formato no reconocido para handleFieldChange:",
                nameOrEvent,
            );
            return;
        }

        setData(name, value);
        setHasChanges(true);

        if (errors[name]) {
            clearErrors(name);
        }
    };

    // Para inputs normales
    const handleChange = (e) => {
        handleFieldChange(e);
    };

    // Para SelectFields
    const handleSelectChange = (name, value) => {
        handleFieldChange(name, value);
    };

    const handleSave = (e, redirectUrl = null) => {
        if (e) e.preventDefault();
        isSubmittingRef.current = true;

        post(route("settings.institucion.store"), {
            onSuccess: () => {
                setHasChanges(false);
                setShowExitModal(false);
                isSubmittingRef.current = false;
                if (redirectUrl) router.visit(redirectUrl);
                else setIsEditing(false);
            },
            onError: () => {
                isSubmittingRef.current = false;
                toast.error("ERROR", {
                    description: "Verifique los campos obligatorios.",
                });
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Datos de la Institución" />

            <div ref={containerRef} className="h-full">
                <ViewContainer
                    title="DATOS GENERALES"
                    subtitle="Registro y actualización datos de la institución"
                    icon={Building2}
                    showSearch={false}
                    actions={
                        <div className="flex gap-2">
                            <Link
                                href={route("settings.index")}
                                onClick={(e) => {
                                    if (hasChanges) {
                                        e.preventDefault();
                                        setShowExitModal(true);
                                    }
                                }}
                            >
                                <Button>
                                    <ChevronLeftCircle className="text-white w-4 h-4" />
                                    VOLVER
                                </Button>
                            </Link>
                           
                            {institucion && !isEditing && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="primary"
                                >
                                    <Edit3 className="text-white w-4 h-4" />
                                    EDITAR INFORMACIÓN
                                </Button>
                            )}
                            <Button variant="warning" asChild>
                                <a
                                    href={route(
                                        "settings.institucion.imprimir",
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Printer className="text-white w-4 h-4" />
                                    EXPORTAR PDF
                                </a>
                            </Button>
                        </div>
                    }
                >
                    <form
                        onSubmit={handleSave}
                        className="flex flex-col overflow-hidden"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {/* COLUMNA 1: IDENTIDAD */}
                            <Section
                                icon={
                                    <FileText className="text-blue w-4 h-4" />
                                }
                                title="Identidad Legal"
                                color="text-blue-600"
                            >
                                <Field
                                    label="Nombre Oficial"
                                    name="nombre_de_la_institucion"
                                    value={data.nombre_de_la_institucion}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={errors.nombre_de_la_institucion}
                                    autoAcentos={true}
                                    innerRef={firstInputRef}
                                />
                                <Field
                                    label="Correo Electrónico"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={errors.email}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Teléfono"
                                        name="telefono"
                                        mask="0000-0000000"
                                        value={data.telefono}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.telefono}
                                    />
                                    <Field
                                        label="RIF"
                                        name="rif"
                                        upperCase
                                        value={data.rif}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.rif}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="NIF"
                                        name="nif"
                                        upperCase
                                        value={data.nif}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.nif}
                                    />
                                    <Field
                                        label="Fundación"
                                        name="fecha_de_fundada"
                                        type="date"
                                        value={data.fecha_de_fundada}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.fecha_de_fundada}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Circuito"
                                        name="circuito"
                                        value={data.circuito}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.circuito}
                                    />
                                    <SelectField
                                        label="Dependencia"
                                        name="dependencia"
                                        value={data.dependencia}
                                        options={[
                                            { v: "Nacional", l: "Nacional" },
                                            { v: "Estadal", l: "Estadal" },
                                            { v: "Privada", l: "Privada" },
                                        ]}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.dependencia}
                                    />
                                </div>
                                <Field
                                    label="Dependencia Estatal / Zona"
                                    name="zona_educativa"
                                    value={data.zona_educativa}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={errors.zona_educativa}
                                />
                            </Section>

                            {/* COLUMNA 2: CÓDIGOS Y ESTRUCTURA */}
                            <Section
                                icon={
                                    <Hash className="text-blue w-4 h-4" />
                                }
                                title="Códigos y Estructura"
                                color="text-indigo-600"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Código DEA"
                                        name="codigo_dea"
                                        upperCase
                                        value={data.codigo_dea}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.codigo_dea}
                                    />
                                    <Field
                                        label="Cód. Estadístico"
                                        name="codigo_estadistico"
                                        value={data.codigo_estadistico}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.codigo_estadistico}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Cód. CENAE"
                                        name="codigo_cenae"
                                        value={data.codigo_cenae}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.codigo_cenae}
                                    />
                                    <Field
                                        label="Cód. Circuital"
                                        name="codigo_circuito"
                                        value={data.codigo_circuito}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.codigo_circuito}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Cód. Dependencia"
                                        name="codigo_de_dependencia"
                                        value={data.codigo_de_dependencia}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.codigo_de_dependencia}
                                    />
                                    <Field
                                        label="Cód. Electoral"
                                        name="codigo_electoral"
                                        value={data.codigo_electoral}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.codigo_electoral}
                                    />

                                    <Field
                                        label="Cód. Primaria"
                                        name="codigo_primaria"
                                        value={data.codigo_primaria}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.codigo_primaria}
                                    />
                                    <Field
                                        label="Aulas"
                                        type="number"
                                        name="numero_de_aulas"
                                        value={data.numero_de_aulas}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.numero_de_aulas}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Otras Aulas"
                                        type="number"
                                        name="otras_aulas"
                                        value={data.otras_aulas}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.otras_aulas}
                                    />
                                    <Field
                                        label="Secciones"
                                        type="number"
                                        name="numero_de_secciones"
                                        value={data.numero_de_secciones}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.numero_de_secciones}
                                    />
                                </div>
                                <Field
                                    label="Antigüedad del Plantel"
                                    value={calcularAntiguedad(
                                        data.fecha_de_fundada,
                                    )}
                                    readOnly
                                    disabled
                                />
                            </Section>

                            {/* COLUMNA 3: UBICACIÓN Y TURNOS */}
                            <Section
                                icon={
                                    <Map className="text-rose w-4 h-4" />
                                }
                                title="Ubicación y Turnos"
                                color="text-rose-600"
                            >
                                <Field
                                    label="Dirección Exacta"
                                    name="direccion"
                                    value={data.direccion}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    autoAcentos={true}
                                    error={errors.direccion}
                                />

                                <Field
                                    label="Estado"
                                    name="estado"
                                    value={data.estado}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={errors.estado}
                                />
                                <Field
                                    label="Municipio"
                                    name="municipio"
                                    value={data.municipio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={errors.municipio}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Field
                                        label="Parroquia"
                                        name="parroquia"
                                        value={data.parroquia}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.parroquia}
                                    />
                                    <Field
                                        label="Comuna"
                                        name="comuna"
                                        value={data.comuna}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.comuna}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField
                                        label="Turno"
                                        name="turno"
                                        value={data.turno}
                                        options={[
                                            { v: "Mañana", l: "Mañana" },
                                            { v: "Tarde", l: "Tarde" },
                                            { v: "Integral", l: "Integral" },
                                            { v: "Nocturno", l: "Nocturno" },
                                        ]}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.turno}
                                    />
                                    <SelectField
                                        label="Medio"
                                        name="medio"
                                        value={data.medio}
                                        options={[
                                            { v: "Urbano", l: "Urbano" },
                                            { v: "Rural", l: "Rural" },
                                            { v: "Indígena", l: "Indígena" },
                                        ]}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        error={errors.medio}
                                    />
                                </div>
                                <SelectField
                                    label="Tipo de Escuela"
                                    name="tipo_de_escuela"
                                    value={data.tipo_de_escuela}
                                    options={[
                                        { v: "Nacional", l: "Nacional" },
                                        { v: "Estadal", l: "Estadal" },
                                        { v: "Privada", l: "Privada" },
                                        {
                                            v: "Subvencionada",
                                            l: "Subvencionada",
                                        },
                                    ]}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={errors.tipo_de_escuela}
                                />
                            </Section>
                        </div>

                        {/* BOTÓN DE GUARDADO FLOTANTE */}
                        <AnimatePresence>
                            {isEditing && (
                                <div className="flex justify-center p-1">
                                    <Button
                                        type="submit"
                                        variant="success" // Usa tu variante verde esmeralda
                                        size="sm" // Tamaño grande y redondeado
                                        loading={processing} // <--- Se conecta al estado de carga de Laravel
                                        className="shadow-emerald-600/40" // Brillo extra manual si quieres
                                    >
                                        <Save className="text-white w-4 h-4" />
                                        CONFIRMAR Y GUARDAR
                                    </Button>
                                </div>
                            )}
                        </AnimatePresence>
                    </form>
                </ViewContainer>
            </div>

            {/* --- MODAL DE SALIDA (ESTILO CORE) --- */}
            <AnimatePresence>
                {showExitModal && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
                        onClick={() => setShowExitModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.8rem] p-10 max-w-md w-full shadow-2xl text-center border-4 border-white relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <AlertCircle className="text-white w-4 h-4" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter italic">
                                ¡Cambios sin guardar!
                            </h3>
                            <p className="text-slate-500 text-sm mb-8 font-medium italic">
                                ¿Qué deseas hacer antes de abandonar la
                                configuración?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleSave(null, pendingUrl)}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-[#059669] text-white rounded-2xl font-black italic uppercase text-xs shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                                >
                                    <CheckCircle2 className="text-white w-4 h-4" />
                                    GUARDAR Y SALIR
                                </button>
                                <button
                                    onClick={() => {
                                        setHasChanges(false);
                                        setShowExitModal(false);
                                        router.visit(
                                            pendingUrl ||
                                                route("settings.index"),
                                        );
                                    }}
                                    className="w-full py-5 text-rose-500 hover:bg-rose-50 rounded-2xl font-black italic uppercase text-[10px] transition-all"
                                >
                                    <LogOut className="text-white w-4 h-4" />{" "}
                                    SALIR SIN GUARDAR
                                </button>
                                <button
                                    onClick={() => {
                                        setShowExitModal(false);
                                        setPendingUrl(null);
                                    }}
                                    className="w-full py-5 border border-slate-200 text-slate-500 rounded-2xl font-black italic uppercase text-[10px] hover:bg-slate-50 transition-all"
                                >
                                    CONTINUAR EDITANDO
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
