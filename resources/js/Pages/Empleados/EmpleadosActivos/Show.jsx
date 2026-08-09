import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Section } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

export default function Show({ empleado }) {
    const [activeTab, setActiveTab] = useState(0);

    // Cálculo de edad dinámica
    const edad = empleado.fecha_de_nacimiento
        ? dayjs().diff(dayjs(empleado.fecha_de_nacimiento), "year")
        : "---";

    const tabs = [
        { label: "DatosPersonales", icon: <Icons.User size={16} /> },
        { label: "Dirección & Contactos", icon: <Icons.MapPin size={16} /> },
        { label: "Datos Académicos", icon: <Icons.GraduationCap size={16} /> },
        { label: "Datos Laborales", icon: <Icons.Briefcase size={16} /> },
    ];

    // LÓGICA PARA ÁREAS DE TRABAJO (Soporta Array o String con comas)
    const renderAreas = () => {
        const areas = empleado.area_de_trabajo;
        if (!areas) return "No asignadas";
        if (Array.isArray(areas)) return areas.join(", ");
        return areas; // Si ya es un string, lo devuelve tal cual
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Expediente: ${empleado.cedula}`} />
            <ViewContainer
                title={`Expediente: ${empleado.nombres} ${empleado.apellidos}`}
                subtitle="Hoja de vida y datos administrativos del personal"
                icon="File"
                showSearch={false}
                returns={
                    <Link href={route("empleados.activos.listado.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={18} /> VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    <Link href={route("empleados.activos.edit", empleado.id)}>
                        <Button
                            variant="primary"
                            size="sm"
                            className="rounded-xl font-black gap-2"
                        >
                            <Icons.UserPen size={16} /> ACTUALIZAR DATOS
                        </Button>
                    </Link>
                }
            >
                <div className="max-w-5xl mx-auto flex flex-col h-full gap-6">
                    {/* NAV DE CATEGORÍAS TIPO BENTO */}
                    <div className="flex justify-center bg-slate-100/50 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === idx
                                        ? "bg-white text-blue-600 shadow-md scale-100"
                                        : "text-slate-400 hover:text-slate-600 scale-95"
                                }`}
                            >
                                {tab.icon}{" "}
                                <span className="hidden md:block">
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* CONTENIDO ANIMADO */}
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {/* TAB 0: DATOS PERSONALES */}
                                {activeTab === 0 && (
                                    <Section
                                        icon={<Icons.User size={18} />}
                                        title="Identidad y Registro"
                                        color="text-blue-600"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <InfoItem
                                                label="Nombres"
                                                val={empleado.nombres}
                                                icon={<Icons.User size={14} />}
                                            />
                                            <InfoItem
                                                label="Apellidos"
                                                val={empleado.apellidos}
                                                icon={<Icons.User size={14} />}
                                            />
                                            <InfoItem
                                                label="Cédula"
                                                val={`${empleado.documento}${empleado.cedula}`}
                                                icon={
                                                    <Icons.IdCard size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Sexo"
                                                val={
                                                    empleado.sexo === "M"
                                                        ? "Masculino"
                                                        : "Femenino"
                                                }
                                                icon={<Icons.Venus size={14} />}
                                            />
                                            <InfoItem
                                                label="Edad"
                                                val={`${edad} AÑOS`}
                                                icon={
                                                    <Icons.Cake
                                                        size={14}
                                                        className="text-pink-500"
                                                    />
                                                }
                                            />
                                            <InfoItem
                                                label="Fecha Nacimiento"
                                                val={dayjs(
                                                    empleado.fecha_de_nacimiento,
                                                ).format("DD-MM-YYYY")}
                                                icon={
                                                    <Icons.Calendar size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Lugar de Nacimiento"
                                                val={
                                                    empleado.lugar_de_nacimiento
                                                }
                                                icon={
                                                    <Icons.MapPinned
                                                        size={14}
                                                    />
                                                }
                                            />
                                            <InfoItem
                                                label="Actualizado"
                                                val={
                                                    empleado.status_de_actualizacion
                                                }
                                                icon={
                                                    <Icons.FileCheck
                                                        size={14}
                                                        className="text-emerald-500"
                                                    />
                                                }
                                            />
                                            <InfoItem
                                                label="Fecha de Registro"
                                                val={dayjs(
                                                    empleado.fecha_registro,
                                                ).format("DD/MM/YYYY")}
                                                icon={
                                                    <Icons.Calendar size={14} />
                                                }
                                            />
                                        </div>
                                    </Section>
                                )}

                                {/* TAB 1: UBICACIÓN Y CONTACTO */}
                                {activeTab === 1 && (
                                    <Section
                                        icon={<Icons.MapPin size={18} />}
                                        title="Ubicación y Localización"
                                        color="text-rose-600"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <InfoItem
                                                    label="Dirección de Habitación"
                                                    val={
                                                        empleado.direccion_de_habitacion
                                                    }
                                                    icon={
                                                        <Icons.MapPin
                                                            size={14}
                                                        />
                                                    }
                                                />
                                            </div>
                                            <InfoItem
                                                label="Parroquia"
                                                val={empleado.parroquia}
                                                icon={
                                                    <Icons.MapPin size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Teléfono"
                                                val={empleado.telefono}
                                                icon={<Icons.Phone size={14} />}
                                            />
                                            <div className="md:col-span-2">
                                                <InfoItem
                                                    label="Correo Electrónico"
                                                    val={
                                                        empleado.correo_electronico
                                                    }
                                                    icon={
                                                        <Icons.Mail size={14} />
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                {/* TAB 2: ACADÉMICOS */}
                                {activeTab === 2 && (
                                    <Section
                                        icon={<Icons.GraduationCap size={18} />}
                                        title="Formación Profesional"
                                        color="text-emerald-600"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem
                                                label="Grado de Instrucción"
                                                val={
                                                    empleado.grado_de_intruccion
                                                }
                                                icon={
                                                    <Icons.GraduationCapIcon
                                                        size={14}
                                                    />
                                                }
                                            />
                                            <InfoItem
                                                label="Profesión / Título Obtenido"
                                                val={empleado.profesion}
                                                icon={<Icons.Tag size={14} />}
                                            />
                                        </div>
                                    </Section>
                                )}

                                {/* TAB 3: LABORALES (COMPLETO) */}
                                {activeTab === 3 && (
                                    <Section
                                        icon={<Icons.Briefcase size={18} />}
                                        title="Información Laboral Institucional"
                                        color="text-indigo-600"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <InfoItem
                                                label="Cargo en Nómina"
                                                val={
                                                    empleado.cargo_en_el_perror
                                                }
                                                icon={
                                                    <Icons.Notebook size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Código del Cargo"
                                                val={empleado.codigo_del_cargo}
                                                icon={
                                                    <Icons.CodeIcon size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Tipo de Personal"
                                                val={empleado.tipo_de_personal}
                                                icon={
                                                    <Icons.TypeIcon size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Dependencia"
                                                val={empleado.dependencia}
                                                icon={
                                                    <Icons.Landmark size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Cod. Dependencia"
                                                val={
                                                    empleado.codigo_de_dependencia
                                                }
                                                icon={
                                                    <Icons.CodeXml size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Carga Horaria"
                                                val={empleado.carga_horaria}
                                                icon={<Icons.Clock size={14} />}
                                            />
                                            <InfoItem
                                                label="Condición"
                                                val={
                                                    empleado.condicion_del_cargo
                                                }
                                                icon={<Icons.Stamp size={14} />}
                                            />
                                            <InfoItem
                                                label="Status Cargo"
                                                val={empleado.status_del_cargo}
                                                icon={
                                                    <Icons.LucideStamp
                                                        size={14}
                                                    />
                                                }
                                            />
                                            <InfoItem
                                                label="Situación Laboral"
                                                val={empleado.situacion_laboral}
                                                icon={
                                                    <Icons.ShieldCheck
                                                        size={14}
                                                    />
                                                }
                                            />
                                            <div className="md:col-span-2 lg:col-span-3">
                                                <InfoItem
                                                    label="Áreas de Trabajo Asignadas"
                                                    val={renderAreas()}
                                                    icon={
                                                        <Icons.MicOffIcon
                                                            size={14}
                                                        />
                                                    }
                                                />
                                            </div>
                                            <InfoItem
                                                label="Función Plantel"
                                                val={
                                                    empleado.funcion_en_el_plantel
                                                }
                                                icon={
                                                    <Icons.Fullscreen
                                                        size={14}
                                                    />
                                                }
                                            />
                                            <InfoItem
                                                label="Ingreso Cargo"
                                                val={
                                                    empleado.fecha_de_ingreso_al_cargo
                                                }
                                                icon={
                                                    <Icons.Calendar size={14} />
                                                }
                                            />
                                            <InfoItem
                                                label="Ingreso Plantel"
                                                val={
                                                    empleado.fecha_de_ingreso_al_plantel
                                                }
                                                icon={
                                                    <Icons.Calendar size={14} />
                                                }
                                            />
                                        </div>
                                    </Section>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

/**
 * COMPONENTE INFO ITEM
 * Muestra el par Etiqueta - Valor con estilo premium
 */
function InfoItem({ label, val, icon, className = "" }) {
    return (
        <div className={`flex flex-col  gap-1 ${className}`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                {label}
            </p>
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-blue-800 flex items-center gap-2.5 shadow-sm">
                {icon && (
                    <span className="text-blue-500 opacity-60">{icon}</span>
                )}
                <span className="text-xs font-bold text-slate-700 uppercase leading-none truncate">
                    {val || "No registrado"}
                </span>
            </div>
        </div>
    );
}
