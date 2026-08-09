"use client";
import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/Ui/Button";
import { Head, Link, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs/dayjs.min.js";
import es from "dayjs/locale/es";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

dayjs.locale(es);

export default function VerificarGuardia({
    cargo,
    fecha,
    vigilantesTocaGuardia,
    diasCorrespondientes,
}) {
    // Manejo de estado local para los cambios
    const [vigilantesChanges, setVigilantesChanges] = useState(
        JSON.parse(JSON.stringify(vigilantesTocaGuardia || [])),
    );
    const [isUpdating, setIsUpdating] = useState(false);

    const statuses = [
        {
            id: "Asistio",
            label: "Asistió",
            icon: "CheckCircle2",
            color: "emerald",
            glow: "shadow-emerald-500/40",
            activeBg: "bg-emerald-600",
        },
        {
            id: "Falto",
            label: "Faltó",
            icon: "XCircle",
            color: "rose",
            glow: "shadow-rose-500/40",
            activeBg: "bg-rose-600",
        },
        {
            id: "Permiso",
            label: "Permiso",
            icon: "Clock",
            color: "amber",
            glow: "shadow-amber-500/40",
            activeBg: "bg-amber-600",
        },
    ];

    const handleStatusChange = (empleadoId, newStatus) => {
        setVigilantesChanges((prev) =>
            prev.map((v) =>
                v.empleado_id === empleadoId
                    ? { ...v, status_actual: newStatus }
                    : v,
            ),
        );
    };

    const saveAndContinue = () => {
        setIsUpdating(true);
        router.post(
            route("recursos.asistencia.empleados.actualizar.guardia"),
            {
                cambios: vigilantesChanges.map((v) => ({
                    empleado_id: v.empleado_id,
                    status: v.status_actual,
                })),
                cargo_id: cargo.id,
                fecha: fecha,
            },
            {
                onSuccess: () => {
                    setIsUpdating(false);
                    toast.success("GUARDIA VERIFICADA", {
                        description:
                            "Los estatus de vigilancia han sido actualizados.",
                    });
                },
                onError: () => setIsUpdating(false),
            },
        );
    };

    const fechaFormateada = useMemo(() => {
        return dayjs(fecha).format("dddd, D [de] MMMM YYYY");
    }, [fecha]);

    const stats = useMemo(() => {
        return {
            total: vigilantesChanges.length,
            confirmados: vigilantesChanges.filter(
                (v) => v.status_actual === "Asistio",
            ).length,
        };
    }, [vigilantesChanges]);

    return (
        <AuthenticatedLayout>
            <Head title={`Guardia - ${cargo.nombre_del_cargo}`} />
            <ViewContainer
                title="Validación de Guardias"
                subtitle="Verificación y actualización gurardias vigilantes"
                icon="ShieldCheck"
                showSearch={false}
                actions={
                    <Link
                        href={route("recursos.asistencia.empleados.index", {
                            fecha,
                        })}
                    >
                        <Button>
                            <Icons.ArrowLeftCircle size={16} /> VOLVER
                        </Button>
                    </Link>
                }
                actionFooter={
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-6">
                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700 shadow-xl">
                                <Icons.ShieldAlert
                                    className="text-blue-500"
                                    size={16}
                                />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-[10px] uppercase tracking-widest leading-none">
                                    Núcleo de Vigilancia
                                </h4>
                                <p className="text-slate-500 text-[9px] font-bold italic mt-1 uppercase">
                                    {fechaFormateada}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <div className="text-right">
                                <p className="text-lg font-black text-gray-600 leading-none tracking-tighter">
                                    {stats.confirmados}{" "}
                                    <span className="text-slate-600 text-lg">
                                        / {stats.total}
                                    </span>
                                </p>
                                <p className="text-[8px] text-blue-500 uppercase font-black tracking-widest mt-1">
                                    Personal Verificado
                                </p>
                            </div>

                            <Button
                                onClick={saveAndContinue}
                                loading={isUpdating}
                                variant="primary"
                            >
                                <Icons.Save size={18} /> CONFIRMAR Y PROCEDER
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="p-2 flex flex-col gap-6 h-full bg-[#f8fafc]">
                    {/* BANNER INFORMATIVO */}
                    <div className="relative overflow-hidden bg-indigo-600 p-2 rounded-[1.5rem] shadow-xl shadow-indigo-200 flex items-center justify-between text-white group">
                        <Icons.CalendarRange
                            className="absolute -right-6 -bottom-6 opacity-10 rotate-12"
                            size={150}
                        />

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                                <Icons.CalendarDays size={28} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tighter italic">
                                    Periodo de Guardia Detectado
                                </h2>
                                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">
                                    Día(s) en verificación:{" "}
                                    <span className="text-white underline decoration-indigo-300 underline-offset-4">
                                        {diasCorrespondientes?.join(" / ")}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3 bg-black/20 px-5 py-2.5 rounded-2xl border border-white/5 relative z-10">
                            <Icons.Info
                                size={16}
                                className="text-indigo-200 animate-pulse"
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest italic">
                                Validación previa obligatoria
                            </span>
                        </div>
                    </div>

                    {/* TABLA DE VIGILANTES */}
                    <div className="flex-1 bg-white rounded-[1.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-slate-950 text-white z-20">
                                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] italic">
                                        <th className="px-10 py-3 text-left border-r border-white/5">
                                            Personal de Seguridad
                                        </th>
                                        <th className="px-10 py-3 text-center">
                                            Validación de Presencia (Check-in)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] font-bold text-slate-600 uppercase divide-y divide-slate-50">
                                    {vigilantesChanges.map((vigi) => (
                                        <tr
                                            key={vigi.empleado_id}
                                            className="hover:bg-indigo-50/40 transition-all duration-300 group"
                                        >
                                            <td className="px-10 py-2">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                                                        <Icons.UserCheck
                                                            size={22}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-xs tracking-tight">
                                                            {vigi.nombre}
                                                        </p>
                                                        <p className="text-[9px] text-blue-500 font-black italic mt-0.5 tracking-widest">
                                                            Rol de turno
                                                            asignado
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-2">
                                                <div className="flex justify-center gap-3 bg-slate-100/50 p-1.5 rounded-[1.8rem] w-fit mx-auto border border-slate-200/50">
                                                    {statuses.map((st) => {
                                                        const IconComp =
                                                            Icons[st.icon];
                                                        const isSelected =
                                                            vigi.status_actual ===
                                                            st.id;

                                                        return (
                                                            <button
                                                                key={st.id}
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        vigi.empleado_id,
                                                                        st.id,
                                                                    )
                                                                }
                                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase transition-all duration-300 ${
                                                                    isSelected
                                                                        ? `${st.activeBg} text-white shadow-xl ${st.glow} scale-105`
                                                                        : "text-slate-400 hover:bg-white hover:text-slate-600"
                                                                }`}
                                                            >
                                                                <IconComp
                                                                    size={14}
                                                                    strokeWidth={
                                                                        3
                                                                    }
                                                                />
                                                                {st.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {vigilantesChanges.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="2"
                                                className="py-20 text-center opacity-20"
                                            >
                                                <Icons.ShieldX
                                                    size={80}
                                                    className="mx-auto text-slate-300"
                                                />
                                                <p className="text-[10px] font-black uppercase tracking-widest mt-4">
                                                    No hay personal de guardia
                                                    asignado
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
