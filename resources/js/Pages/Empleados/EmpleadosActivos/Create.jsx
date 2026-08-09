import React, { useState, useMemo, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import {
    Section,
    Field,
    SelectField,
} from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, Link, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { MultiSelectField } from "@/Components/Layout/FormComponents";

export default function Create({ cargos, areas }) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            nombres: "",
            apellidos: "",
            documento: "V-",
            cedula: "",
            sexo: "",
            fecha_de_nacimiento: "",
            lugar_de_nacimiento: "",
            direccion_de_habitacion: "",
            parroquia: "",
            telefono: "",
            correo_electronico: "",
            grado_de_intruccion: "",
            profesion: "",
            cargo_en_el_perror: "",
            codigo_del_cargo: "",
            dependencia: "",
            codigo_de_dependencia: "",
            tipo_de_personal: "",
            status_del_cargo: "",
            condicion_del_cargo: "",
            area_de_trabajo: [],
            funcion_en_el_plantel: "",
            carga_horaria: "",
            fecha_de_ingreso_al_plantel: "",
            fecha_de_ingreso_al_cargo: "",
        });

    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [newAreaName, setNewAreaName] = useState("");
    const [isSavingArea, setIsSavingArea] = useState(false); // <--- NUEVO
    // REGLA: Títulos académicos dinámicos según sexo
    const gradosDisponibles = useMemo(() => {
        const comunes = [
            "Primaria",
            "Diversificada",
            "Bachiller",
            "Tsu",
            "Especialista",
            "MSc.",
            "Otras",
        ];
        if (data.sexo === "M") return [...comunes, "Profe.", "Lcdo.", "Doctor"];
        if (data.sexo === "F")
            return [...comunes, "Profa.", "Lcda.", "Doctora"];
        return comunes;
    }, [data.sexo]);

    const submit = (e) => {
        e.preventDefault();
        post(route("empleados.activos.store"), {
            // onSuccess: () => toast.success("Personal registrado correctamente"),
            onError: () =>
                toast.error(
                    "Error en el formulario. Revise los campos en rojo.",
                ),
        });
    };

    const handleAddArea = () => {
        if (!newAreaName.trim()) return toast.error("El nombre es obligatorio");

        setIsSavingArea(true); // Encendemos el spinner

        router.post(
            route("areas.storeFast"),
            {
                nombre_del_area: newAreaName,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setData("area_de_trabajo", newAreaName.toUpperCase());
                    setIsAreaModalOpen(false);
                    setNewAreaName("");
                    //   toast.success("Área creada y seleccionada");
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0]);
                },
                onFinish: () => setIsSavingArea(false), // Apagamos el spinner pase lo que pase
            },
        );
    };
    return (
        <AuthenticatedLayout>
            <Head title="Nuevo Registro" />
            <ViewContainer
                title="Registro de Personal"
                subtitle="Carga de expediente para nuevo ingreso"
                icon="UserPlus"
                showSearch={false}
                returns={
                    <Link href={route("empleados.activos.listado.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={18} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <form
                    onSubmit={submit}
                    noValidate
                    className="flex flex-col gap-6"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1">
                        {/* BLOQUE 1: DATOS PERSONALES */}
                        <Section
                            icon={<Icons.User size={18} />}
                            title="Datos Personales"
                            color="text-indigo-600"
                        >
                            <Field
                                label="Nombres"
                                name="nombres"
                                value={data.nombres}
                                error={errors.nombres}
                                onChange={(e) => {
                                    setData("nombres", e.target.value);
                                    clearErrors("nombres");
                                }}
                                autoFocus
                                required
                            />
                            <Field
                                label="Apellidos"
                                name="apellidos"
                                value={data.apellidos}
                                error={errors.apellidos}
                                onChange={(e) => {
                                    setData("apellidos", e.target.value);
                                    clearErrors("apellidos");
                                }}
                                required
                            />

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-1">
                                    <SelectField
                                        label="Tipo"
                                        value={data.documento}
                                        error={errors.documento}
                                        options={["V-", "E-"]}
                                        onChange={(e) => {
                                            setData(
                                                "documento",
                                                e.target.value,
                                            );
                                            clearErrors("documento");
                                        }}
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Field
                                        label="Cédula"
                                        value={data.cedula}
                                        error={errors.cedula}
                                        mask="00000000"
                                        onChange={(e) => {
                                            setData(
                                                "cedula",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            );
                                            clearErrors("cedula");
                                        }}
                                        placeholder="00000000"
                                        required
                                    />
                                </div>
                            </div>

                            <SelectField
                                label="Sexo"
                                value={data.sexo}
                                error={errors.sexo}
                                options={[
                                    { v: "M", l: "Masculino" },
                                    { v: "F", l: "Femenino" },
                                ]}
                                onChange={(e) => {
                                    setData("sexo", e.target.value);
                                    clearErrors("sexo");
                                }}
                                required
                            />
                            <Field
                                label="F. Nacimiento"
                                type="date"
                                value={data.fecha_de_nacimiento}
                                error={errors.fecha_de_nacimiento}
                                onChange={(e) => {
                                    setData(
                                        "fecha_de_nacimiento",
                                        e.target.value,
                                    );
                                    clearErrors("fecha_de_nacimiento");
                                }}
                                required
                            />
                            <Field
                                label="Lugar de Nacimiento"
                                value={data.lugar_de_nacimiento}
                                error={errors.lugar_de_nacimiento}
                                onChange={(e) => {
                                    setData(
                                        "lugar_de_nacimiento",
                                        e.target.value,
                                    );
                                    clearErrors("lugar_de_nacimiento");
                                }}
                                required
                            />
                        </Section>

                        {/* BLOQUE 2: UBICACIÓN Y FORMACIÓN */}
                        <Section
                            icon={<Icons.MapPin size={18} />}
                            title="Ubicación y Contacto"
                            color="text-blue-600"
                        >
                            <Field
                                label="Dirección de Habitación"
                                value={data.direccion_de_habitacion}
                                error={errors.direccion_de_habitacion}
                                onChange={(e) => {
                                    setData(
                                        "direccion_de_habitacion",
                                        e.target.value,
                                    );
                                    clearErrors("direccion_de_habitacion");
                                }}
                                required
                            />
                            <Field
                                label="Parroquia"
                                value={data.parroquia}
                                error={errors.parroquia}
                                onChange={(e) => {
                                    setData("parroquia", e.target.value);
                                    clearErrors("parroquia");
                                }}
                                required
                            />
                            <Field
                                label="Teléfono"
                                mask="0000-0000000"
                                value={data.telefono}
                                error={errors.telefono}
                                onChange={(e) => {
                                    setData("telefono", e.target.value);
                                    clearErrors("telefono");
                                }}
                                placeholder="0412-0000000"
                                required
                            />
                            <Field
                                label="Correo Electrónico"
                                type="email"
                                value={data.correo_electronico}
                                error={errors.correo_electronico}
                                onChange={(e) => {
                                    setData(
                                        "correo_electronico",
                                        e.target.value,
                                    );
                                    clearErrors("correo_electronico");
                                }}
                                required
                            />

                            <div
                                onPointerDown={() =>
                                    !data.sexo &&
                                    toast.warning(
                                        "Debe seleccionar el sexo primero",
                                    )
                                }
                            >
                                <SelectField
                                    label="Grado de Instrucción"
                                    value={data.grado_de_intruccion}
                                    error={errors.grado_de_intruccion}
                                    options={gradosDisponibles}
                                    onChange={(e) => {
                                        setData(
                                            "grado_de_intruccion",
                                            e.target.value,
                                        );
                                        clearErrors("grado_de_intruccion");
                                    }}
                                    disabled={!data.sexo}
                                    required
                                />
                            </div>
                            <Field
                                label="Título Obtenido"
                                autoSentenceCase
                                value={data.profesion}
                                error={errors.profesion}
                                onChange={(e) => {
                                    setData("profesion", e.target.value);
                                    clearErrors("profesion");
                                }}
                                required
                            />
                        </Section>

                        {/* BLOQUE 3: INFORMACIÓN LABORAL */}
                        <Section
                            icon={<Icons.Briefcase size={18} />}
                            title="Datos Laborales"
                            color="text-purple-600"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                <Field
                                    label="Cargo en Nómina"
                                    value={data.cargo_en_el_perror}
                                    error={errors.cargo_en_el_perror}
                                    upperCase
                                    onChange={(e) => {
                                        setData(
                                            "cargo_en_el_perror",
                                            e.target.value,
                                        );
                                        clearErrors("cargo_en_el_perror");
                                    }}
                                    required
                                />
                                <Field
                                    label="Código Cargo"
                                    upperCase
                                    value={data.codigo_del_cargo}
                                    error={errors.codigo_del_cargo}
                                    onChange={(e) => {
                                        setData(
                                            "codigo_del_cargo",
                                            e.target.value,
                                        );
                                        clearErrors("codigo_del_cargo");
                                    }}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Field
                                    label="Dependencia"
                                    value={data.dependencia}
                                    upperCase
                                    error={errors.dependencia}
                                    onChange={(e) => {
                                        setData("dependencia", e.target.value);
                                        clearErrors("dependencia");
                                    }}
                                    required
                                />
                                <Field
                                    label="Cód. Dependencia"
                                    value={data.codigo_de_dependencia}
                                    error={errors.codigo_de_dependencia}
                                    onChange={(e) => {
                                        setData(
                                            "codigo_de_dependencia",
                                            e.target.value,
                                        );
                                        clearErrors("codigo_de_dependencia");
                                    }}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <SelectField
                                    label="Tipo Personal"
                                    value={data.tipo_de_personal}
                                    error={errors.tipo_de_personal}
                                    options={cargos.map(
                                        (c) => c.nombre_del_cargo,
                                    )}
                                    onChange={(e) => {
                                        setData(
                                            "tipo_de_personal",
                                            e.target.value,
                                        );
                                        clearErrors("tipo_de_personal");
                                    }}
                                    required
                                />
                                <SelectField
                                    label="Status"
                                    value={data.status_del_cargo}
                                    error={errors.status_del_cargo}
                                    options={["Nacional", "Estadal"]}
                                    onChange={(e) => {
                                        setData(
                                            "status_del_cargo",
                                            e.target.value,
                                        );
                                        clearErrors("status_del_cargo");
                                    }}
                                    required
                                />
                                <SelectField
                                    label="Condición"
                                    value={data.condicion_del_cargo}
                                    error={errors.condicion_del_cargo}
                                    options={["Fijo", "Contratado"]}
                                    onChange={(e) => {
                                        setData(
                                            "condicion_del_cargo",
                                            e.target.value,
                                        );
                                        clearErrors("condicion_del_cargo");
                                    }}
                                    required
                                />
                            </div>

                            <MultiSelectField
                                label="Áreas de Asignación"
                                options={areas.map((a) => a.nombre_del_area)}
                                value={data.area_de_trabajo}
                                onAddNew={() => setIsAreaModalOpen(true)}
                                onChange={(val) => {
                                    setData("area_de_trabajo", val);
                                    clearErrors("area_de_trabajo");
                                }}
                                error={errors.area_de_trabajo}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Función"
                                    value={data.funcion_en_el_plantel}
                                    error={errors.funcion_en_el_plantel}
                                    options={[
                                        "Director",
                                        "Subdirector",
                                        "Coordinador",
                                        "Docente de Aula",
                                        "Docente Especialista",
                                        "Secretaria(o)",
                                        "Aseador(a)",
                                        "Cocinera(o)",
                                        "Vigilante",
                                        "Sin Asignación",
                                    ]}
                                    onChange={(e) => {
                                        setData(
                                            "funcion_en_el_plantel",
                                            e.target.value,
                                        );
                                        clearErrors("funcion_en_el_plantel");
                                    }}
                                    required
                                />
                                <SelectField
                                    label="Carga"
                                    value={data.carga_horaria}
                                    error={errors.carga_horaria}
                                    options={[
                                        "00.00",
                                        "20.00",
                                        "33.33",
                                        "35.00",
                                        "37.50",
                                        "40.00",
                                        "53.33",
                                        "54.00",
                                    ]}
                                    onChange={(e) => {
                                        setData(
                                            "carga_horaria",
                                            e.target.value,
                                        );
                                        clearErrors("carga_horaria");
                                    }}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Field
                                    label="F.I. Plantel"
                                    type="date"
                                    value={data.fecha_de_ingreso_al_plantel}
                                    error={errors.fecha_de_ingreso_al_plantel}
                                    onChange={(e) => {
                                        setData(
                                            "fecha_de_ingreso_al_plantel",
                                            e.target.value,
                                        );
                                        clearErrors(
                                            "fecha_de_ingreso_al_plantel",
                                        );
                                    }}
                                    required
                                />
                                <Field
                                    label="F.I. Cargo"
                                    type="date"
                                    value={data.fecha_de_ingreso_al_cargo}
                                    error={errors.fecha_de_ingreso_al_cargo}
                                    onChange={(e) => {
                                        setData(
                                            "fecha_de_ingreso_al_cargo",
                                            e.target.value,
                                        );
                                        clearErrors(
                                            "fecha_de_ingreso_al_cargo",
                                        );
                                    }}
                                    required
                                />
                            </div>
                        </Section>
                    </div>

                    <div className="flex justify-center pb-3">
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={processing}
                            className="shadow-blue-200"
                        >
                            <Icons.Save size={20} /> REGISTRAR EMPLEADO
                        </Button>
                    </div>
                </form>
            </ViewContainer>

            {/* MODAL ÁREA RÁPIDA */}
            <AnimatePresence>
                {isAreaModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
                        onClick={() =>
                            !isSavingArea && setIsAreaModalOpen(false)
                        } // No cerrar si está cargando
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* OVERLAY DE CARGA EXTRA (Opcional, para máxima elegancia) */}
                            <AnimatePresence>
                                {isSavingArea && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center"
                                    >
                                        <Icons.Loader2
                                            className="animate-spin text-blue-600"
                                            size={40}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black uppercase text-xs italic text-slate-800">
                                    Nueva Área de Trabajo
                                </h3>
                                <button
                                    onClick={() => setIsAreaModalOpen(false)}
                                    disabled={isSavingArea}
                                >
                                    <Icons.X className="text-slate-300 hover:text-rose-500 transition-colors" />
                                </button>
                            </div>

                            <Field
                                label="Identificador del Área"
                                upperCase
                                autoFocus
                                value={newAreaName}
                                onChange={(e) => setNewAreaName(e.target.value)}
                                disabled={isSavingArea} // Bloquear input al guardar
                            />

                            <Button
                                onClick={handleAddArea}
                                variant="primary"
                                size="lg" // Cambiado a lg para que se vea más elegante
                                className="w-full mt-8"
                                loading={isSavingArea} // <--- EL SPINNER ACTIVO
                            >
                                CREAR Y SELECCIONAR
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
