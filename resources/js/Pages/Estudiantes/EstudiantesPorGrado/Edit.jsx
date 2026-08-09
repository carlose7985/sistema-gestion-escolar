import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Section, Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import {
    User,
    Save,
    Users,
    ArrowLeftCircle,
    Stethoscope,
    Ruler,
    UserPen,
} from "lucide-react";
import Swal from "sweetalert2";

export default function EditarEstudiante({
    estudiantesData,
    currentRepresentante,
    currentPadre,
    apreciaciones,
}) {
    // --- FORMULARIO (Estructura estándar de Inertia) ---
    const { data, setData, put, processing, errors } = useForm({
        name: estudiantesData.name || "",
        apellido: estudiantesData.apellido || "",
        cedula: estudiantesData.cedula || "",
        documento: estudiantesData.documento || "V",
        sexo: estudiantesData.sexo || "",
        fecha_de_nacimiento: estudiantesData.fecha_de_nacimiento || "",
        lugar_de_nacimiento: estudiantesData.lugar_de_nacimiento || "",
        entidad_federal: estudiantesData.entidad_federal || "",
        direccion: estudiantesData.direccion || "",
        instituto_de_procedencia:
            estudiantesData.instituto_de_procedencia || "",
        grado_id: estudiantesData.grado_id,
        apreciacion: estudiantesData.apreciacion || "",
        condicion: estudiantesData.condicion || "",
        etnia: estudiantesData.etnia || "",
        lateralidad: estudiantesData.lateralidad || "",
        talla_de_camisa: estudiantesData.talla_de_camisa || "",
        talla_de_pantalon: estudiantesData.talla_de_pantalon || "",
        talla_de_zapato: estudiantesData.talla_de_zapato || "",
        enfermedades: estudiantesData.enfermedades || "",
        representante_id: estudiantesData.representante_id,
        padre_id: estudiantesData.padre_id,
        tratamiento_medico: estudiantesData.tratamiento_medico || "",
        alergico: estudiantesData.alergico || "",
        condicion_especial: estudiantesData.condicion_especial || "",
        problemas_fisicos: estudiantesData.problemas_fisicos || "",
        parentesco: estudiantesData.parentesco || "",
        status: estudiantesData.status || "",
        status_escolar: estudiantesData.status_escolar || "",
        fecha_registro: estudiantesData.fecha_registro?.split("T")[0] || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("estudiantes.activos.listado.update", estudiantesData.id), {
            // onSuccess: () =>
            //     //toast.success("Expediente actualizado correctamente"),
            onError: () => {
                Swal.fire({
                    icon: "error",
                    title: "Error de Validación",
                    text: "Por favor, verifique los datos marcados en rojo.",
                    customClass: { popup: "rounded-[2rem]" },
                });
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar: ${data.name}`} />

            <ViewContainer
                title="Actualización de Expediente"
                subtitle={`Editando a: ${estudiantesData.name} ${estudiantesData.apellido}`}
                icon="Edit3"
                showSearch={false}
                returns={
                    <Link
                        href={route(
                            "estudiantes.activos.listado.show",
                            estudiantesData.grado_id,
                        )}
                    >
                        <Button>
                            <ArrowLeftCircle size={18} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                        {/* SECCIÓN 1: IDENTIDAD Y LOCALIZACIÓN */}
                        <Section
                            icon={<User size={18} />}
                            title="Identidad y Localización"
                            color="text-blue-600"
                        >
                            <Field
                                label="Nombres"
                                autoFocus
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name}
                                required
                            />
                            <Field
                                label="Apellidos"
                                value={data.apellido}
                                onChange={(e) =>
                                    setData("apellido", e.target.value)
                                }
                                error={errors.apellido}
                                required
                            />

                            <div className="grid grid-cols-3 gap-2">
                                <SelectField
                                    label="Doc."
                                    value={data.documento}
                                    options={["V", "E"]}
                                    onChange={(e) =>
                                        setData("documento", e.target.value)
                                    }
                                />
                                <div className="col-span-2">
                                    <Field
                                        label="Cédula Escolar/ID"
                                        value={data.cedula}
                                        mask="00000000000"
                                        onChange={(e) =>
                                            setData(
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
                                        setData("sexo", e.target.value)
                                    }
                                    required
                                />
                                <Field
                                    label="F. Nacimiento"
                                    type="date"
                                    value={data.fecha_de_nacimiento}
                                    onChange={(e) =>
                                        setData(
                                            "fecha_de_nacimiento",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.fecha_de_nacimiento}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Field
                                    label="Lugar de  Nacimiento"
                                    type="text"
                                    value={data.lugar_de_nacimiento}
                                    onChange={(e) =>
                                        setData(
                                            "lugar_de_nacimiento",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.lugar_de_nacimiento}
                                    required
                                />

                                <Field
                                    label="Entidad Federal"
                                    type="text"
                                    value={data.entidad_federal}
                                    onChange={(e) =>
                                        setData(
                                            "entidad_federal",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.entidad_federal}
                                    required
                                />
                            </div>
                            <Field
                                label="Dirección de Habitación"
                                value={data.direccion}
                                onChange={(e) =>
                                    setData("direccion", e.target.value)
                                }
                                required
                            />
                        </Section>

                        {/* SECCIÓN 2: SALUD Y ESCOLARIDAD */}
                        <Section
                            icon={<Stethoscope size={18} />}
                            title="Salud y Escolaridad"
                            color="text-emerald-600"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Literal Actual"
                                    value={data.apreciacion}
                                    options={[
                                        ...apreciaciones.map((a) => ({
                                            v: a.numeral
                                                ? `${a.literal}-${a.numeral}`
                                                : a.literal,
                                            l: a.numeral
                                                ? `${a.literal}-${a.numeral}`
                                                : a.literal,
                                        })),
                                    ]}
                                    onChange={(e) =>
                                        setData("apreciacion", e.target.value)
                                    }
                                />
                                <SelectField
                                    label="Escolarización"
                                    value={data.condicion}
                                    options={["Regular", "Repitiente"]}
                                    onChange={(e) =>
                                        setData("condicion", e.target.value)
                                    }
                                />
                            </div>
                            <Field
                                label="Inst. Procedencia"
                                value={data.instituto_de_procedencia}
                                onChange={(e) =>
                                    setData(
                                        "instituto_de_procedencia",
                                        e.target.value,
                                    )
                                }
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Lateralidad"
                                    value={data.lateralidad}
                                    options={[
                                        "Derecho",
                                        "Zurdo",
                                        "Ambidiestro",
                                    ]}
                                    onChange={(e) =>
                                        setData("lateralidad", e.target.value)
                                    }
                                />
                                <Field
                                    label="¿Es Alérgico?"
                                    value={data.alergico}
                                    onChange={(e) =>
                                        setData("alergico", e.target.value)
                                    }
                                />
                                <SelectField
                                    label="Dificultad"
                                    value={data.problemas_fisicos}
                                    options={[
                                        "Ninguno",
                                        "Motrices",
                                        "Visuales",
                                        "Auditivas",
                                    ]}
                                    onChange={(e) =>
                                        setData(
                                            "problemas_fisicos",
                                            e.target.value,
                                        )
                                    }
                                />
                                <SelectField
                                    label="Estatus Escolar"
                                    value={data.status_escolar}
                                    options={[
                                        "Escolarizado",
                                        "No escolarizado",
                                        "Otros",
                                    ]}
                                    onChange={(e) =>
                                        setData(
                                            "status_escolar",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <Field
                                label="Enfermedades"
                                value={data.enfermedades}
                                onChange={(e) =>
                                    setData("enfermedades", e.target.value)
                                }
                            />
                            <Field
                                label="Tratamiento Médico"
                                value={data.tratamiento_medico}
                                onChange={(e) =>
                                    setData(
                                        "tratamiento_medico",
                                        e.target.value,
                                    )
                                }
                            />
                        </Section>

                        {/* SECCIÓN 3: ANTROPOMETRÍA Y FAMILIA */}
                        <Section
                            icon={<Ruler size={18} />}
                            title="Antropometría y Familia"
                            color="text-purple-600"
                        >
                            <div className="grid grid-cols-3 gap-2">
                                <Field
                                    label="Camisa"
                                    value={data.talla_de_camisa}
                                    onChange={(e) =>
                                        setData(
                                            "talla_de_camisa",
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 2),
                                        )
                                    }
                                />
                                <Field
                                    label="Pantalón"
                                    value={data.talla_de_pantalon}
                                    onChange={(e) =>
                                        setData(
                                            "talla_de_pantalon",
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 2),
                                        )
                                    }
                                />
                                <Field
                                    label="Calzado"
                                    value={data.talla_de_zapato}
                                    onChange={(e) =>
                                        setData(
                                            "talla_de_zapato",
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 2),
                                        )
                                    }
                                />
                            </div>

                            <Field
                                label="Etnia"
                                value={data.etnia}
                                onChange={(e) =>
                                    setData("etnia", e.target.value)
                                }
                            />

                            <Field
                                label="Condición Especial"
                                value={data.condicion_especial}
                                onChange={(e) =>
                                    setData(
                                        "condicion_especial",
                                        e.target.value,
                                    )
                                }
                            />

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                                <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100 shadow-inner">
                                    <h5 className="text-[10px] font-black text-indigo-400 uppercase mb-2 flex items-center gap-2">
                                        <UserPen size={14} /> Representante
                                        Legal
                                    </h5>
                                    <p className="text-xs font-black text-slate-800 uppercase italic leading-tight">
                                        {currentRepresentante?.name_r}{" "}
                                        {currentRepresentante?.apellido_r || ""}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-indigo-50">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">
                                            Vínculo:
                                        </span>
                                        <span className="text-[10px] font-black text-indigo-600 uppercase italic">
                                            {estudiantesData.parentesco ||
                                                "No Especificado"}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 opacity-80">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                                        <Users size={14} /> Padre/Madre
                                        Biológico
                                    </h5>
                                    <p className="text-xs font-black text-slate-600 uppercase italic leading-tight">
                                        {currentPadre
                                            ? `${currentPadre.name_r} ${currentPadre.apellido_r || ""}`
                                            : "No Asignado"}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={processing}
                            className="px-20 shadow-2xl shadow-indigo-100 uppercase tracking-widest text-[11px] rounded-[1.5rem]"
                        >
                            <Save size={20} className="mr-3" />
                            {processing
                                ? "Guardando cambios..."
                                : "Actualizar Datos Estudiante"}
                        </Button>
                    </div>
                </form>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
