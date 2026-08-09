import React, { useState, useRef } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import {
    Section,
    Field,
    SelectField,
} from "@/Components/layout/FormComponents";
import { Button } from "@/Components/ui/button";
import axios from "axios";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function CrearEstudiante({
    representante_id,
    padre_id,
    parentesco,
    grado_id,
    status,
    apreciaciones,
    representante_data,
    padre_data,
}) {
    // --- FORMULARIO ---
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: "",
        apellido: "",
        cedula: "",
        documento: "V",
        sexo: "",
        fecha_de_nacimiento: "",
        lugar_de_nacimiento: "Tucupita",
        entidad_federal: "Edo. Delta Amacuro",
        direccion: "",
        instituto_de_procedencia: "",
        grado_id: grado_id,
        apreciacion: "S-D",
        condicion: "Regular",
        etnia: "Ninguna",
        lateralidad: "Derecho",
        talla_de_camisa: "",
        talla_de_pantalon: "",
        talla_de_zapato: "",
        enfermedades: "Ninguna",
        representante_id: representante_id,
        padre_id: padre_id,
        tratamiento_medico: "Ninguno",
        alergico: "No",
        condicion_especial: "Ninguna",
        problemas_fisicos: "Ninguno",
        parentesco: parentesco,
        status: status,
        status_escolar: "Escolarizado",
        actualizado: "Si",
        calificado: "No",
        fecha_registro: new Date().toISOString().split("T")[0],
    });

    // --- CORRECCIÓN AQUÍ: useState bien declarado ---
    const [isScanning, setIsScanning] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const nameInputRef = useRef(null);
    // --- HELPERS ---
    const formatFirstLetter = (val) =>
        val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : "";

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("estudiantes.registro.guardar.estudiante"), {
            onError: () => toast.error("Revise los campos en rojo."),
        });
    };

    const formatToHTMLDate = (dateStr) => {
        if (!dateStr) return "";

        // Si la fecha viene como "21-07-2012"
        // Dividimos por el guion o barra
        const parts = dateStr.split(/[-/]/);

        // Verificamos si tiene el formato DD-MM-YYYY (3 partes)
        if (parts.length === 3 && parts[0].length === 2) {
            // Retornamos YYYY-MM-DD
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        return dateStr; // Si ya viene bien o tiene otro formato, lo devuelve tal cual
    };

    const processFile = async (file) => {
        if (!file) return;

        setIsScanning(true);
        const toastId = toast.loading("Analizando captura con IA...");
        const formData = new FormData();
        formData.append("document", file);

        try {
            const response = await axios.post(
                route("estudiantes.registro.scan.formulario"),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    timeout: 60000,
                },
            );

            // Verificar si hay error de plan inactivo en la respuesta
            if (response.data && response.data.status === "inactive") {
                toast.error(
                    "Servicio OCR no disponible, plan mindee inactivo",
                    {
                        id: toastId,
                    },
                );
                // Dar focus al campo de nombres
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                }
                return;
            }

            // Verificar si la respuesta tiene la estructura esperada
            if (!response.data || !response.data.prediction) {
                throw new Error(
                    "La respuesta del servidor no tiene el formato esperado",
                );
            }

            const fields = response.data.prediction;

            const getV = (fieldName) => {
                const field = fields ? fields[fieldName] : null;
                return field &&
                    field.value !== undefined &&
                    field.value !== null
                    ? String(field.value)
                    : "";
            };

            const capitalize = (str) =>
                str
                    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
                    : "";

            setData((prev) => ({
                ...prev,
                name: getV("nombres_completos") || prev.name,
                apellido: getV("apellidos_completos") || prev.apellido,
                cedula: getV("cedula").replace(/\D/g, "") || prev.cedula,
                sexo: getV("sexo").toUpperCase().charAt(0) || prev.sexo,
                fecha_de_nacimiento:
                    formatToHTMLDate(getV("fecha_de_nacimiento")) ||
                    prev.fecha_de_nacimiento,
                lugar_de_nacimiento:
                    getV("lugar_de_nacimiento") || prev.lugar_de_nacimiento,
                entidad_federal:
                    getV("entidad_federal") || prev.entidad_federal,
                direccion: getV("direccion") || prev.direccion,
                apreciacion: getV("apreciacion") || prev.apreciacion,
                condicion: capitalize(getV("condicion")) || prev.condicion,
                instituto_de_procedencia: getV("instituto_de_procedencia") || prev.instituto_de_procedencia,
                status_escolar:  getV("status_escolar") || prev.status_escolar,
                lateralidad:
                    capitalize(getV("lateralidad")) || prev.lateralidad,
                problemas_fisicos:
                    capitalize(getV("dificultades")) || prev.problemas_fisicos,
                alergico: capitalize(getV("alergias")) || prev.alergico,
                enfermedades:
                    capitalize(getV("enfermedades_padecidas")) ||
                    prev.enfermedades,
                tratamiento_medico:
                    capitalize(getV("tratamiento_medico")) ||
                    prev.tratamiento_medico,
                talla_de_camisa:
                    getV("talla_de_camisa") || prev.talla_de_camisa,
                talla_de_pantalon:
                    getV("talla_de_pantalon") || prev.talla_de_pantalon,
                talla_de_zapato:
                    getV("talla_de_zapato") || prev.talla_de_zapato,
                condicion_especial:
                    getV("condicion_especial") || prev.condicion_especial,
                etnia: capitalize(getV("etnia")) || prev.etnia,
            }));

            toast.success("¡Datos capturados con éxito!", { id: toastId });
        } catch (error) {
            console.error("Error al procesar la imagen:", error);

            let errorMessage = "Error al procesar la imagen.";

            if (error.response) {
                console.error(
                    "Datos de respuesta del servidor:",
                    error.response.data,
                );
                console.error("Código de estado:", error.response.status);

                // Verificar si es error de plan inactivo (status 403)
                if (error.response.status === 403) {
                    const errorData = error.response.data;

                    // Si el servidor devuelve status 'inactive'
                    if (errorData && errorData.status === "inactive") {
                        toast.error(
                            "Servicio OCR no disponible, plan mindee inactivo",
                            {
                                id: toastId,
                            },
                        );
                        // Dar focus al campo de nombres
                        if (nameInputRef.current) {
                            nameInputRef.current.focus();
                        }
                        return;
                    }

                    // Otro error 403
                    errorMessage =
                        errorData?.message ||
                        errorData?.error ||
                        "Acceso denegado al servicio OCR.";
                }
                // Error 500 u otros
                else if (error.response.status === 500) {
                    errorMessage =
                        "Error interno del servidor. Por favor, intente nuevamente.";
                }
                // Error 422 (validación)
                else if (error.response.status === 422) {
                    errorMessage =
                        error.response.data?.message ||
                        "El archivo no cumple con los requisitos.";
                }
                // Otros errores
                else {
                    errorMessage =
                        error.response.data?.message ||
                        error.response.data?.error ||
                        "Error al procesar la imagen.";
                }
            } else if (error.request) {
                errorMessage =
                    "No se recibió respuesta del servidor. Verifique su conexión.";
            } else {
                errorMessage =
                    error.message || "Error desconocido al procesar la imagen.";
            }

            toast.error(errorMessage, { id: toastId, duration: 5000 });

            // Dar focus al campo de nombres en caso de cualquier error
            if (nameInputRef.current) {
                nameInputRef.current.focus();
            }
        } finally {
            setIsScanning(false);
            // Resetear el input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("No se pudo acceder a la cámara.");
            setShowCamera(false);
        }
    };

    const takePhoto = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const file = new File([blob], "capture.jpg", {
                type: "image/jpeg",
            });
            stopCamera();
            processFile(file);
        }, "image/jpeg");
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject
                .getTracks()
                .forEach((track) => track.stop());
        }
        setShowCamera(false);
    };

    const handleScan = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
        // Resetear el input para permitir seleccionar el mismo archivo nuevamente
        e.target.value = "";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inscripción de Estudiante" />

            <ViewContainer
                title="Expediente Estudiantil"
                subtitle="Carga de datos manual o mediante escaneo por IA"
                icon="GraduationCap"
                showSearch={false}
                returns={
                    <div className="flex gap-2">
                        <Link
                            href={route(
                                "estudiantes.registro.selecciona.responsable",
                            )}
                        >
                            <Button>
                                <Icons.ArrowLeftCircle
                                    size={16}
                                    className="mr-2"
                                />{" "}
                                VOLVER
                            </Button>
                        </Link>
                        {/* Botón de Cámara */}
                        <Button
                            type="button"
                            variant="primary"
                            onClick={startCamera}
                            disabled={isScanning}
                        >
                            <Icons.Camera size={18} className="mr-2" /> Cámara
                        </Button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleScan}
                            className="hidden"
                            accept="image/*"
                        />
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <Icons.Loader2
                                    size={18}
                                    className="mr-2 animate-spin"
                                />
                            ) : (
                                <Icons.UploadCloud size={18} className="mr-2" />
                            )}
                            {isScanning ? "Escaneando..." : "Archivo"}
                        </Button>

                        {/* Overlay de la Cámara */}
                        {showCamera && (
                            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
                                <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-auto"
                                    />
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                                        <Button
                                            onClick={stopCamera}
                                            variant="destructive"
                                            size="lg"
                                            className="rounded-full w-14 h-14 p-0"
                                        >
                                            <Icons.X size={24} />
                                        </Button>
                                        <Button
                                            onClick={takePhoto}
                                            variant="primary"
                                            size="lg"
                                            className="rounded-full w-20 h-20 p-0 border-4 border-white"
                                        >
                                            <Icons.Zap size={32} />
                                        </Button>
                                    </div>
                                </div>
                                <p className="mt-4 text-white text-sm font-bold">
                                    Encuadre la planilla y presione el rayo
                                </p>
                            </div>
                        )}
                    </div>
                }
            >
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-col gap-2"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 items-start">
                        {/* SECCIÓN 1: IDENTIDAD */}
                        <Section
                            icon={<Icons.User size={18} />}
                            title="Identidad Estudiantil"
                            color="text-indigo-600"
                        >
                            <Field
                                ref={nameInputRef} // Agregar esta línea
                                label="Nombres"
                                value={data.name}
                                onChange={(e) => {
                                    setData("name", e.target.value);
                                    clearErrors("name");
                                }}
                                autoFocus
                                error={errors.name}
                                required
                            />
                            <Field
                                label="Apellidos"
                                value={data.apellido}
                                onChange={(e) => {
                                    setData("apellido", e.target.value);
                                    clearErrors("apellido");
                                }}
                                error={errors.apellido}
                                required
                            />

                            <div className="grid grid-cols-3 gap-2">
                                <SelectField
                                    label="Doc."
                                    value={data.documento}
                                    options={["V", "E"]}
                                    onChange={(e) => {
                                        setData("documento", e.target.value);
                                        clearErrors("documento");
                                    }}
                                />
                                <div className="col-span-2">
                                    <Field
                                        label="Cédula/ID Escolar"
                                        mask="00000000000"
                                        value={data.cedula}
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
                                        error={errors.cedula}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Sexo"
                                    value={data.sexo}
                                    options={[
                                        { v: "M", l: "Masculino" },
                                        { v: "F", l: "Femenino" },
                                    ]}
                                    onChange={(e) => {
                                        setData("sexo", e.target.value);
                                        clearErrors("sexo");
                                    }}
                                    error={errors.sexo}
                                />
                                <Field
                                    label="F. Nacimiento"
                                    type="date"
                                    value={data.fecha_de_nacimiento}
                                    onChange={(e) => {
                                        setData(
                                            "fecha_de_nacimiento",
                                            e.target.value,
                                        );
                                        clearErrors("fecha_de_nacimiento");
                                    }}
                                    error={errors.fecha_de_nacimiento}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Field
                                    label="Lugar de Nacimiento"
                                    value={data.lugar_de_nacimiento}
                                    onChange={(e) => {
                                        setData(
                                            "lugar_de_nacimiento",
                                            e.target.value,
                                        );
                                        clearErrors("lugar_de_nacimiento");
                                    }}
                                    error={errors.lugar_de_nacimiento}
                                />
                                <Field
                                    label="Entidad Federal"
                                    value={data.entidad_federal}
                                    onChange={(e) => {
                                        setData(
                                            "entidad_federal",
                                            e.target.value,
                                        );
                                        clearErrors("entidad_federal");
                                    }}
                                    error={errors.entidad_federal}
                                />
                            </div>
                            <Field
                                label="Dirección de Habitación"
                                value={data.direccion}
                                onChange={(e) => {
                                    setData("direccion", e.target.value);
                                    clearErrors("direccion");
                                }}
                                error={errors.direccion}
                                required
                            />
                        </Section>

                        {/* SECCIÓN 2: SALUD Y ESCOLARIDAD */}
                        <Section
                            icon={<Icons.Stethoscope size={18} />}
                            title="Salud y Escolaridad"
                            color="text-emerald-600"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Apreciación"
                                    value={data.apreciacion}
                                    options={
                                        apreciaciones?.map((a) => ({
                                            v: a.numeral
                                                ? `${a.literal}-${a.numeral}`
                                                : a.literal,
                                            l: a.numeral
                                                ? `${a.literal}-${a.numeral}`
                                                : a.literal,
                                        })) || []
                                    }
                                    onChange={(e) => {
                                        setData("apreciacion", e.target.value);
                                        clearErrors("apreciacion");
                                    }}
                                    error={errors.apreciacion}
                                />
                                <SelectField
                                    label="Condición"
                                    value={data.condicion}
                                    options={["Regular", "Repitiente"]}
                                    onChange={(e) => {
                                        setData("condicion", e.target.value);
                                        clearErrors("condicion");
                                    }}
                                    error={errors.condicion}
                                />
                            </div>
                            <Field
                                label="Institución Procedencia"
                                value={data.instituto_de_procedencia}
                                onChange={(e) => {
                                    setData(
                                        "instituto_de_procedencia",
                                        e.target.value,
                                    );
                                    clearErrors("instituto_de_procedencia");
                                }}
                                error={errors.instituto_de_procedencia}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Estatus Escolar"
                                    value={data.status_escolar}
                                    options={[
                                        "Escolarizado",
                                        "No Escolarizado",
                                        "Otros",
                                    ]}
                                    onChange={(e) => {
                                        setData(
                                            "status_escolar",
                                            e.target.value,
                                        );
                                        clearErrors("status_escolar");
                                    }}
                                    error={errors.status_escolar}
                                />
                                <SelectField
                                    label="Lateralidad"
                                    value={data.lateralidad}
                                    options={[
                                        "Derecho",
                                        "Zurdo",
                                        "Ambidiestro",
                                    ]}
                                    onChange={(e) => {
                                        setData("lateralidad", e.target.value);
                                        clearErrors("lateralidad");
                                    }}
                                    error={errors.lateralidad}
                                />
                                <SelectField
                                    label="Dificultades"
                                    value={data.problemas_fisicos}
                                    options={[
                                        "Ninguno",
                                        "Motrices",
                                        "Visuales",
                                        "Auditivas",
                                    ]}
                                    onChange={(e) => {
                                        setData(
                                            "problemas_fisicos",
                                            e.target.value,
                                        );
                                        clearErrors("problemas_fisicos");
                                    }}
                                    error={errors.problemas_fisicos}
                                />
                                <Field
                                    label="Alergias"
                                    value={data.alergico}
                                    onChange={(e) => {
                                        setData(
                                            "alergico",
                                            formatFirstLetter(e.target.value),
                                        );
                                        clearErrors("alergico");
                                    }}
                                    error={errors.alergico}
                                />
                            </div>
                            <Field
                                label="Enfermedades"
                                value={data.enfermedades}
                                onChange={(e) => {
                                    setData(
                                        "enfermedades",
                                        formatFirstLetter(e.target.value),
                                    );
                                    clearErrors("enfermedades");
                                }}
                                error={errors.enfermedades}
                            />
                            <Field
                                label="Tratamiento Médico"
                                value={data.tratamiento_medico}
                                onChange={(e) => {
                                    setData(
                                        "tratamiento_medico",
                                        formatFirstLetter(e.target.value),
                                    );
                                    clearErrors("tratamiento_medico");
                                }}
                                error={errors.tratamiento_medico}
                            />
                        </Section>

                        {/* SECCIÓN 3: CARACTERIZACIÓN FÍSICA */}
                        <Section
                            icon={<Icons.Ruler size={18} />}
                            title="Caracterización Física"
                            color="text-purple-600"
                        >
                            <div className="grid grid-cols-3 gap-2">
                                <Field
                                    label="Camisa"
                                    type="text"
                                    mask="00"
                                    value={data.talla_de_camisa}
                                    onChange={(e) => {
                                        setData(
                                            "talla_de_camisa",
                                            e.target.value,
                                        );
                                        clearErrors("talla_de_camisa");
                                    }}
                                    error={errors.talla_de_camisa}
                                />
                                <Field
                                    label="Pantalón"
                                    type="text"
                                    mask="00"
                                    value={data.talla_de_pantalon}
                                    onChange={(e) => {
                                        setData(
                                            "talla_de_pantalon",
                                            e.target.value,
                                        );
                                        clearErrors("talla_de_pantalon");
                                    }}
                                    error={errors.talla_de_pantalon}
                                />

                                <Field
                                    label="Zapatos"
                                    type="text"
                                    mask="00"
                                    value={data.talla_de_zapato}
                                    onChange={(e) => {
                                        setData(
                                            "talla_de_zapato",
                                            e.target.value,
                                        );
                                        clearErrors("talla_de_zapato");
                                    }}
                                    error={errors.talla_de_zapato}
                                />
                            </div>
                            <Field
                                label="Condición Especial"
                                value={data.condicion_especial}
                                onChange={(e) => {
                                    setData(
                                        "condicion_especial",
                                        formatFirstLetter(e.target.value),
                                    );
                                    clearErrors("condicion_especial");
                                }}
                                error={errors.condicion_especial}
                            />
                            <Field
                                label="Etnia"
                                value={data.etnia}
                                onChange={(e) => {
                                    setData(
                                        "etnia",
                                        formatFirstLetter(e.target.value),
                                    );
                                    clearErrors("etnia");
                                }}
                                error={errors.etnia}
                            />
                            <div className="mt-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner space-y-3">
                                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <Icons.Users
                                        size={14}
                                        className="text-indigo-500"
                                    />
                                    <span className="text-[10px] font-black uppercase text-slate-500">
                                        Vínculo Familiar
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">
                                        Representante Legal
                                    </p>
                                    <p className="text-[11px] font-black text-indigo-700 uppercase italic">
                                        {representante_data?.name_r ||
                                            "No asignado"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        Progenitor Biológico
                                    </p>
                                    <p className="text-[11px] font-black text-slate-600 uppercase italic">
                                        {padre_data?.name_r || "No asignado"}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </div>

                    <div className="flex justify-center pb-2">
                        <Button
                            type="submit"
                            variant="primary"
                            loading={processing}
                            className="px-5 shadow-xl shadow-blue-100"
                            disabled={isScanning}
                        >
                            <Icons.Save size={20} className="mr-2" /> FINALIZAR
                            INSCRIPCIÓN
                        </Button>
                    </div>
                </form>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
