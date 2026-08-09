"use client";
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/Ui/Button";
import { Head, Link, useForm, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs/dayjs.min.js";
import es from "dayjs/locale/es";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

dayjs.locale(es);

export default function ChequearPermisos({
    permisosVencidos,
    totalPendientes,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permisoSeleccionado, setPermisoSeleccionado] = useState(null);

    const { data, setData, post, processing, reset, clearErrors, errors } =
        useForm({
            empleado_id: "",
            permiso_id_actual: "",
            fecha_de_inicio: "",
            fecha_final: "",
            descripcion: "",
        });

    const abrirModalRenovacion = (permiso) => {
        setPermisoSeleccionado(permiso);
        setData({
            empleado_id: permiso.empleado_id,
            permiso_id_actual: permiso.permiso_id,
            fecha_de_inicio: dayjs().format("YYYY-MM-DD"),
            fecha_final: "",
            descripcion: permiso.motivo_permiso,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const guardarRenovacion = (e) => {
        e.preventDefault();
        post(route("empleados.inactivos.permisos.renovar.permiso"), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                toast.success("ESTATUS RENOVADO", {
                    description: "El permiso ha sido extendido correctamente.",
                });
            },
        });
    };

  const marcarComoVencido = (permiso) => {
      // Mostrar confirmación con diseño mejorado
      Swal.fire({
          title: "🔄 REINCORPORAR EMPLEADO",
          html: `
            <div class="flex flex-col items-center gap-3 py-2">
                <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-3xl">
                    👤
                </div>
                <p class="text-sm font-bold text-slate-700">
                    ${permiso.nombre_empleado}
                </p>
                <p class="text-xs text-slate-400 uppercase tracking-wider">
                    ${permiso.cedula} • ${permiso.departamento}
                </p>
                <div class="w-full h-px bg-slate-200 my-2"></div>
                <p class="text-sm font-bold uppercase text-slate-500 italic">
                    ¿Confirmar el regreso a sus funciones habituales?
                </p>
            </div>
        `,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#64748b",
          confirmButtonText: "SÍ, REINCORPORAR",
          cancelButtonText: "CANCELAR",
          reverseButtons: true,
          customClass: {
              popup: "rounded-[2.5rem] border-4 border-white shadow-2xl p-6",
              confirmButton:
                  "font-black uppercase tracking-wider px-6 py-3 rounded-xl",
              cancelButton:
                  "font-black uppercase tracking-wider px-6 py-3 rounded-xl",
          },
          preConfirm: () => {
              // Cambiar el Swal a modo loading
              Swal.fire({
                  title: "⏳ PROCESANDO REINCORPORACIÓN",
                  html: `
                    <div class="flex flex-col items-center gap-6 py-6">
                        <div class="relative">
                            <div class="w-20 h-20 border-4 border-emerald-200 rounded-full"></div>
                            <div class="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <div class="absolute inset-0 flex items-center justify-center text-2xl">
                                🔄
                            </div>
                        </div>
                        <div class="flex flex-col items-center gap-2">
                            <p class="text-sm font-bold text-slate-700">
                                ${permiso.nombre_empleado}
                            </p>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-emerald-600 animate-pulse">
                                    ●
                                </span>
                                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Actualizando estatus...
                                </span>
                            </div>
                        </div>
                        <div class="w-full max-w-xs bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full animate-[loading_2s_ease-in-out_infinite]" 
                                 style="width: 70%"></div>
                        </div>
                    </div>
                `,
                  showConfirmButton: false,
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  customClass: {
                      popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                  },
              });

              // Hacer la petición
              router.post(
                  route("empleados.inactivos.permisos.marcar.vencido"),
                  {
                      empleado_id: permiso.empleado_id,
                      permiso_id: permiso.permiso_id,
                  },
                  {
                      preserveScroll: true,
                      onSuccess: () => {
                          // Cerrar loading
                          Swal.close();

                          // Mostrar éxito con animación
                        
                      },
                      onError: (errors) => {
                          Swal.close();
                          Swal.fire({
                              title: "❌ ERROR DE SISTEMA",
                              html: `
                                <div class="flex flex-col items-center gap-3 py-2">
                                    <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
                                        ⚠️
                                    </div>
                                    <p class="text-sm font-bold text-slate-700">
                                        No se pudo completar la reincorporación
                                    </p>
                                    <p class="text-xs text-slate-400">
                                        ${errors.message || "Intenta nuevamente o contacta a soporte"}
                                    </p>
                                </div>
                            `,
                              icon: "error",
                              confirmButtonColor: "#ef4444",
                              confirmButtonText: "INTENTAR DE NUEVO",
                              customClass: {
                                  popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                                  confirmButton:
                                      "font-black uppercase tracking-wider px-8 py-3 rounded-xl",
                              },
                          });
                      },
                  },
              );
          },
      });
  };

    return (
        <AuthenticatedLayout>
            <Head title="Validación de Estatus" />

            <ViewContainer
                title="SATATUS PERMISOS VENCIDOS"
                subtitle="Verificación y Actualización de permisos"
                icon="ShieldAlert"
                showSearch={false}
                actions={
                    <Link href={route("recursos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={14} /> VOLVER
                        </Button>
                    </Link>
                }
                actionFooter={
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-amber-500 font-black uppercase text-[10px] italic">
                            <Icons.Clock size={14} /> Permisos Caducados:{" "}
                            {totalPendientes}
                        </span>
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                            Núcleo de Validación Docente
                        </span>
                    </div>
                }
            >
                <div className="p-3 flex flex-col gap-6 h-full">
                    {/* BANNER DE ALERTA NEÓN */}
                    <div className="relative overflow-hidden bg-white p-2 rounded-[1.5rem] border border-amber-100 shadow-xl shadow-amber-500/5 flex items-center justify-between group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700" />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-10 h-10 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-500 shadow-inner border border-amber-100/50">
                                <Icons.AlertTriangle
                                    size={32}
                                    className="animate-pulse"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-2">
                                    Detección de Caducidad
                                </h2>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] leading-none">
                                    Acción requerida para actualizar el listado
                                    de asistencia
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TABLA CORE EDITION */}
                    <div className="flex-1 bg-white rounded-[1.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-slate-900 text-white z-20 font-black uppercase text-[9px] tracking-[0.2em] italic">
                                    <tr>
                                        <th className="px-10 py-6">
                                            Identidad / Dependencia
                                        </th>
                                        <th className="px-8 py-6 text-center">
                                            Fecha Límite
                                        </th>
                                        <th className="px-8 py-6">
                                            Motivo Reportado
                                        </th>
                                        <th className="px-10 py-6 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] font-bold text-slate-600 uppercase divide-y divide-slate-500">
                                    {permisosVencidos.map((permiso) => (
                                        <tr
                                            key={permiso.permiso_id}
                                            className="hover:bg-blue-50/30 transition-all group"
                                        >
                                            <td className="px-10 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                        <Icons.UserCircle
                                                            size={24}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-950 text-xs tracking-tight">
                                                            {
                                                                permiso.nombre_empleado
                                                            }
                                                        </p>
                                                        <p className="text-[9px] text-blue-500 font-black italic mt-0.5 tracking-widest">
                                                            {permiso.cedula} •{" "}
                                                            {
                                                                permiso.departamento
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="inline-flex flex-col bg-rose-50 px-5 py-2.5 rounded-2xl border border-rose-100 shadow-sm">
                                                    <span className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-1">
                                                        Caducó el:
                                                    </span>
                                                    <span className="text-[11px] font-black text-rose-600 font-mono italic">
                                                        {dayjs(
                                                            permiso.fecha_final_permiso,
                                                        ).format(
                                                            "DD [de] MMMM",
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[9px] font-black text-slate-900 italic leading-tight block max-w-[280px]">
                                                    {permiso.motivo_permiso}
                                                </span>
                                            </td>
                                            <td className="px-10 py-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <Button
                                                        onClick={() =>
                                                            abrirModalRenovacion(
                                                                permiso,
                                                            )
                                                        }
                                                        variant="primary"
                                                    >
                                                        <Icons.RefreshCw
                                                            size={14}
                                                            className="mr-2"
                                                        />{" "}
                                                        RENOVAR
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            marcarComoVencido(
                                                                permiso,
                                                            )
                                                        }
                                                        variant="success"
                                                    >
                                                        <Icons.UserCheck
                                                            size={14}
                                                            className="mr-2"
                                                        />{" "}
                                                        REINCORPORAR
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {permisosVencidos.length === 0 && (
                                <div className="p-20 text-center opacity-20">
                                    <Icons.ShieldCheck
                                        size={80}
                                        className="mx-auto text-slate-300"
                                    />
                                    <p className="text-sm font-black uppercase tracking-[0.3em] mt-4">
                                        Todo en orden
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MODAL DE RENOVACIÓN - CORE EDITION */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06090f]/80 backdrop-blur-md p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-4 border-white relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Cabecera Colorida y Vibrante */}
                                <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
                                    {/* Icono de fondo decorativo */}
                                    <Icons.History
                                        className="absolute -right-6 -bottom-6 opacity-10 rotate-12"
                                        size={140}
                                    />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/40">
                                                    <Icons.CalendarClock
                                                        size={20}
                                                        className="text-white"
                                                    />
                                                </div>
                                                <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                                    Renovar Estatus
                                                </h3>
                                            </div>
                                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Icons.User size={12} />{" "}
                                                PERSONAL:{" "}
                                                {
                                                    permisoSeleccionado?.nombre_empleado
                                                }
                                            </p>
                                        </div>

                                        {/* BOTÓN SALIR DEL MODAL */}
                                        <button
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
                                            className="p-3 bg-white/10 rounded-2xl hover:bg-rose-600 hover:scale-110 transition-all duration-300 group"
                                        >
                                            <Icons.X
                                                size={20}
                                                className="text-white group-hover:rotate-90 transition-transform"
                                            />
                                        </button>
                                    </div>
                                </div>

                                <form
                                    onSubmit={guardarRenovacion}
                                    className="p-12 space-y-8 bg-white"
                                >
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">
                                                Fecha Inicio
                                            </label>
                                            <input
                                                type="date"
                                                value={data.fecha_de_inicio}
                                                onChange={(e) =>
                                                    setData(
                                                        "fecha_de_inicio",
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 bg-slate-50 border-2 border-slate-600 rounded-[1.5rem] px-5 text-[12px] font-black text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">
                                                Fecha Final
                                            </label>
                                            <input
                                                type="date"
                                                value={data.fecha_final}
                                                onChange={(e) =>
                                                    setData(
                                                        "fecha_final",
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 bg-slate-50 border-2 border-slate-600 rounded-[1.5rem] px-5 text-[12px] font-black text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2 tracking-widest">
                                            Justificación de Extensión
                                        </label>
                                        <select
                                            value={data.descripcion}
                                            onChange={(e) =>
                                                setData(
                                                    "descripcion",
                                                    e.target.value,
                                                )
                                            }
                                            className="h-11 bg-slate-50 border-2 border-slate-600 rounded-[1.5rem] px-5 text-[11px] font-black uppercase italic text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">
                                                Seleccione un motivo...
                                            </option>
                                            <option value="Permiso médico">
                                                Permiso médico
                                            </option>
                                            <option value="Permiso por cuido">
                                                Permiso por cuido
                                            </option>
                                            <option value="Permiso pre-post">
                                                Permiso pre-post
                                            </option>
                                            <option value="Permiso por dirección">
                                                Permiso por dirección
                                            </option>
                                            <option value="Permiso solicitado">
                                                Permiso solicitado
                                            </option>
                                        </select>
                                    </div>

                                    <div className="pt-4">
                                        {/* BOTÓN CON SPINNER Y BRILLO NEÓN */}
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            variant="primary"
                                            size="xl"
                                            className="w-full h-11 rounded-[2rem] shadow-[0_10px_30px_rgba(37,99,235,0.3)] text-xs tracking-[0.2em]"
                                            loading={processing}
                                        >
                                            <Icons.Save
                                                size={20}
                                                className={
                                                    processing
                                                        ? "hidden"
                                                        : "block"
                                                }
                                            />
                                            CONFIRMAR RENOVACIÓN
                                        </Button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                    >
                                        Cancelar y volver
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
