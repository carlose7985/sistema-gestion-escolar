import React, { useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import {
    Section,
    Field,
    SelectField,
    MultiSelectField,
} from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";

import { toast } from "sonner";

export default function Edit({ empleado, cargos, areas }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: "PUT", // Simulación de PUT para Laravel
        ...empleado,
        fecha_de_nacimiento: empleado.fecha_de_nacimiento
            ? empleado.fecha_de_nacimiento.split("T")[0]
            : "",
    });

    const gradosDisponibles = useMemo(() => {
        const comunes = [
            "Primaria",
            "Diversificada",
            "Bachiller",
            "Tsu",
            "Especialista",
            "MSc.",
        ];
        if (data.sexo === "M") return [...comunes, "Lcdo.", "Dr."];
        if (data.sexo === "F") return [...comunes, "Lcda.", "Dra."];
        return comunes;
    }, [data.sexo]);

   const submit = (e) => {
       e.preventDefault();
       post(route("empleados.activos.update", empleado.id), {
           onSuccess: () => {
               // NO PONGAS toast.success() AQUÍ
               // Deja que el Layout lo maneje globalmente
           },
       });
   };

    return (
        <AuthenticatedLayout>
            <Head title="Editar Personal" />
            <ViewContainer
                title={`Actualizar: ${empleado.nombres}`}
                subtitle="Actualización de expediente"
                icon="Edit"
                showSearch={false}
                returns={
                    <Link href={route("empleados.activos.show", empleado.id)}>
                        <Button>
                            <Icons.ArrowLeftCircle size={18} /> CANCELAR
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
                            <div className="grid grid-cols-2 gap-1">
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
        </AuthenticatedLayout>
    );
}
