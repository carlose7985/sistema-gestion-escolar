import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import {
    Section,
    Field,
    SelectField,
} from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import {
    Save,
    ArrowLeftCircle,
    MapPin,
    GraduationCap,
    User,
    ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function CrearEgresado({ apreciacionesAprobadas }) {
    // --- FORMULARIO INERTIA ---
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            name: "",
            apellido: "",
            documento: "V",
            cedula: "",
            sexo: "",
            fecha_de_nacimiento: "",
            lugar_de_nacimiento: "Tucupita",
            entidad_federal: "Edo. Delta Amacuro",
            direccion: "",
            apreciacion: "",
            periodo_escolar: "",
        });

    // 🔥 Función para manejar cambio de campo y limpiar error
    const handleFieldChange = (field, value) => {
        setData(field, value);
        if (errors[field]) {
            clearErrors(field);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("estudiantes.inactivos.graduados.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: () => {
                toast.error(
                    "Error en la validación. Verifique los campos en rojo.",
                );
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Registrar Egresado" />

            <ViewContainer
                title="NUEVO REGISTRO DE EGRESADO"
                subtitle="Carga manual de expedientes históricos y graduados"
                icon="UserCheck"
                showSearch={false}
                returns={
                    <Link href={route("estudiantes.inactivos.graduados.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="mx-auto p-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                            {/* SECCIÓN 1: IDENTIDAD */}
                            <Section
                                icon={<User size={18} />}
                                title="Identidad Estudiantil"
                                color="text-indigo-600"
                            >
                                <Field
                                    label="Nombres *"
                                    value={data.name}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.name}
                                    autoFocus
                                />
                                <Field
                                    label="Apellidos *"
                                    value={data.apellido}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "apellido",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.apellido}
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <SelectField
                                        label="Doc."
                                        value={data.documento}
                                        options={["V", "E"]}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "documento",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <div className="col-span-2">
                                        <Field
                                            label="Cédula *"
                                            value={data.cedula}
                                            mask="00000000000"
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "cedula",
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                            error={errors.cedula}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <SelectField
                                        label="Género"
                                        value={data.sexo}
                                        options={[
                                            { v: "M", l: "Masculino" },
                                            { v: "F", l: "Femenino" },
                                        ]}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "sexo",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.sexo}
                                    />
                                    <Field
                                        label="F. Nacimiento"
                                        type="date"
                                        value={data.fecha_de_nacimiento}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "fecha_de_nacimiento",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.fecha_de_nacimiento}
                                    />
                                </div>
                            </Section>

                            {/* SECCIÓN 2: LOCALIZACIÓN */}
                            <Section
                                icon={<MapPin size={18} />}
                                title="Procedencia y Ubicación"
                                color="text-emerald-600"
                            >
                                <Field
                                    label="Lugar de Nacimiento"
                                    value={data.lugar_de_nacimiento}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "lugar_de_nacimiento",
                                            e.target.value,
                                        )
                                    }
                                />
                                <Field
                                    label="Estado / Entidad"
                                    value={data.entidad_federal}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "entidad_federal",
                                            e.target.value,
                                        )
                                    }
                                />
                                <Field
                                    label="Dirección de Habitación"
                                    value={data.direccion}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "direccion",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="DIRECCIÓN CORTA..."
                                    error={errors.direccion}
                                />
                            </Section>

                            {/* SECCIÓN 3: DATOS ACADÉMICOS */}
                            <Section
                                icon={<GraduationCap size={18} />}
                                title="Información de Egreso"
                                color="text-blue-600"
                            >
                                <SelectField
                                    label="Apreciación Final (Literal) *"
                                    value={data.apreciacion}
                                    options={
                                        apreciacionesAprobadas?.map((a) => ({
                                            v: a.numeral
                                                ? `${a.literal}-${a.numeral}`
                                                : a.literal,
                                            l: a.numeral
                                                ? `${a.literal}-${a.numeral}`
                                                : a.literal,
                                        })) || []
                                    }
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "apreciacion",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.apreciacion}
                                    required
                                />
                                <Field
                                    label="Periodo Escolar *"
                                    value={data.periodo_escolar}
                                    mask="0000-0000"
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "periodo_escolar",
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    error={errors.periodo_escolar}
                                    required
                                />

                                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                                    <ClipboardCheck
                                        size={20}
                                        className="text-blue-600"
                                    />
                                    <p className="text-[9px] font-bold text-blue-700 uppercase leading-tight italic">
                                        Nota: Este registro se guardará
                                        directamente en el historial de alumnos
                                        egresados.
                                    </p>
                                </div>
                            </Section>
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <div className="flex justify-center pt-4 pb-8">
                            <Button
                                type="submit"
                                disabled={processing}
                                loading={processing}
                                className="px-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl shadow-indigo-100 tracking-widest transition-all"
                            >
                                <Save size={20} className="mr-2" />
                                {processing
                                    ? "PROCESANDO REGISTRO..."
                                    : "FINALIZAR REGISTRO DE EGRESADO"}
                            </Button>
                        </div>
                    </form>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
