"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/ui/button";
import Swal from "sweetalert2";
import axios from "axios"; // Asegúrate de tener axios instalado

export function GestorDocumentos({ empId, nombre }) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const buttonRef = useRef(null);

    // --- FUNCIÓN DE IMPRESIÓN BASE ---
    const handlePrint = (type, extraParams = {}) => {
        const url = route("ExportDocumentosEmpleados", {
            type: type,
            empleadoId: empId,
            ...extraParams,
        });
        window.open(url, "_blank");
        setIsOpen(false);
    };

    const openLiberacionModal = async () => {
        setIsOpen(false); // Cerramos el menú de Framer Motion inmediatamente

        try {
            const response = await axios.get(
                route("empleados.activos.destinos.empleados.check", empId),
            );
            const data = response.data;

            if (data && data.exists) {
                Swal.fire({
                    title: '<span class="text-lg font-black uppercase text-slate-700">Destino Registrado</span>',
                    html: `
                    <div class="text-center p-2">
                        <p class="text-[11px] font-bold text-slate-500 uppercase mb-4">Este empleado ya tiene un destino asignado:</p>
                        <div class="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100 mb-4">
                            <p class="text-sm font-black text-indigo-700 uppercase italic">"${data.destino}"</p>
                        </div>
                    </div>
                `,
                    showCancelButton: true,
                    showDenyButton: true,
                    confirmButtonText: "Imprimir",
                    denyButtonText: "Modificar",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#4f46e5",
                    denyButtonColor: "#f59e0b",
                    customClass: { popup: "rounded-[2.5rem] p-8" },
                }).then((result) => {
                    if (result.isConfirmed) {
                        handlePrint("constancia-de-liberacion");
                    } else if (result.isDenied) {
                        showInputDestinoModal(data.destino);
                    }
                });
            } else {
                showInputDestinoModal("");
            }
        } catch (error) {
            Swal.fire("Error", "No se pudo conectar con el servidor", "error");
        }
    };

    const showInputDestinoModal = (valorPrevio = "") => {
        Swal.fire({
            title: `<span class="text-lg font-black uppercase text-slate-700">${valorPrevio ? "Actualizar" : "Registrar"} Destino</span>`,
            input: "text",
            inputValue: valorPrevio,
            inputLabel: "INSTITUCIÓN DE DESTINO / CARGO",
            inputPlaceholder: "EJ: E.B. CARLOS RAFAEL CONTRERAS",
            showCancelButton: true,
            confirmButtonText: "GUARDAR Y GENERAR",
            confirmButtonColor: "#10b981",

            // --- CORRECCIÓN DE ALINEACIÓN ---
            customClass: {
                popup: "rounded-[2.5rem] p-8",
                // Forzamos el input a ser un bloque centrado con ancho completo
                input: "!w-[90%] !mx-auto !block rounded-xl border-2 border-slate-100 font-bold uppercase text-sm focus:border-indigo-500 shadow-sm",
                inputLabel:
                    "text-[10px] font-black text-gray-500 uppercase mb-2 text-center w-full",
                actions: "flex justify-center gap-2",
            },

            inputAttributes: {
                style: "text-transform: uppercase;",
            },

            showLoaderOnConfirm: true,
            preConfirm: async (destino) => {
                if (!destino || destino.trim() === "")
                    return Swal.showValidationMessage("Indique el destino");
                try {
                    await axios.post(route("empleados.activos.destinos.empleados.storeDestino"), {
                        empleado_id: empId,
                        destino: destino.toUpperCase(),
                    });
                    return true;
                } catch (error) {
                    Swal.showValidationMessage(
                        "Error al guardar en el servidor",
                    );
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                handlePrint("constancia-de-liberacion");
            }
        });
    };

    // --- MODAL DE ASISTENCIA ---
    const openAsistenciaModal = () => {
        setIsOpen(false);
        const meses = [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
        ];

        Swal.fire({
            title: '<span class="text-lg font-black uppercase text-slate-700">Historial de Asistencias</span>',
            html: `
                <div class="text-left px-2">
                    <p class="text-[10px] font-black text-slate-400 uppercase mb-4 text-center">
                        Periodo para: <br>
                        <span class="text-indigo-600 text-xs">${nombre}</span>
                    </p>
                    <label class="block text-[10px] font-black text-gray-500 uppercase mb-1">Año Escolar</label>
                    <input id="swal-year" autofocus uppercasse type="number" class="swal2-input !w-full !m-0 !text-sm !font-bold !rounded-xl border-2 border-slate-100" value="${new Date().getFullYear()}">
                    <label class="block text-[10px] font-black text-gray-500 uppercase mt-4 mb-2">Seleccione Meses</label>
                    <div class="grid grid-cols-3 gap-2">
                        ${meses
                            .map(
                                (m, i) => `
                            <label class="flex items-center justify-center gap-2 p-2 border border-slate-100 rounded-xl hover:bg-indigo-50 cursor-pointer transition-colors">
                                <input type="checkbox" value="${i + 1}" class="month-checkbox w-3 h-3 accent-indigo-600">
                                <span class="text-[10px] font-black text-slate-600 uppercase">${m}</span>
                            </label>
                        `,
                            )
                            .join("")}
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Generar",
            confirmButtonColor: "#4f46e5",
            customClass: { popup: "rounded-[2.5rem] p-6" },
            preConfirm: () => {
                const year = document.getElementById("swal-year").value;
                const selected = Array.from(
                    document.querySelectorAll(".month-checkbox:checked"),
                ).map((cb) => cb.value);
                if (selected.length === 0)
                    return Swal.showValidationMessage(
                        "Seleccione al menos un mes",
                    );
                return { year, months: selected.join(",") };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                handlePrint("historial-asistencia-activos", {
                    year: result.value.year,
                    month: result.value.months,
                });
            }
        });
    };

    // --- LÓGICA DE POSICIONAMIENTO ---
    const toggleMenu = (event) => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const menuHeight = 280;
        const spaceBelow = window.innerHeight - rect.bottom;

        setMenuStyle({
            top:
                spaceBelow < menuHeight
                    ? `${rect.top - menuHeight - 8}px`
                    : `${rect.bottom + 8}px`,
            left: `${rect.left - 240}px`,
        });
        setIsOpen(true);
    };

    useEffect(() => {
        const close = (e) => {
            if (buttonRef.current && !buttonRef.current.contains(e.target))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const btnClass =
        "flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-slate-600 uppercase hover:bg-indigo-50 rounded-xl transition-all group";

    return (
        <div className="relative inline-block">
            <Button
                title="Gestor de Impresiones"
                ref={buttonRef}
                onClick={toggleMenu}
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-lg shadow-sm transition-all ${isOpen ? "bg-slate-100" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
                {isOpen ? (
                    <Icons.X size={16} className="text-slate-500" />
                ) : (
                    <Icons.PrinterCheck size={16} />
                )}
            </Button>

            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    position: "fixed",
                                    ...menuStyle,
                                    zIndex: 9999,
                                }}
                                className="w-72 bg-white rounded-2xl shadow-2xl border border-indigo-100 p-2"
                            >
                                <div className="px-4 py-2 border-b mb-1 text-center bg-indigo-50/50 rounded-t-xl">
                                    <p className="text-[9px] font-black text-indigo-600 uppercase truncate">
                                        {nombre}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        handlePrint("ficha-del-empleado")
                                    }
                                    className={btnClass}
                                >
                                    <Icons.FileText
                                        className="text-blue-500"
                                        size={16}
                                    />{" "}
                                    <span>Ficha Técnica</span>
                                </button>

                                {/* BOTÓN CON MODAL DE DESTINO */}
                                <button
                                    onClick={openLiberacionModal}
                                    className={btnClass}
                                >
                                    <Icons.FileText
                                        className="text-emerald-500"
                                        size={16}
                                    />{" "}
                                    <span>Constancia Liberación</span>
                                </button>

                                <button
                                    onClick={() =>
                                        handlePrint(
                                            "carta-de-fiel-cumplimiento",
                                        )
                                    }
                                    className={btnClass}
                                >
                                    <Icons.FileText
                                        className="text-purple-500"
                                        size={16}
                                    />{" "}
                                    <span>Fiel Cumplimiento</span>
                                </button>

                                <button
                                    onClick={openAsistenciaModal}
                                    className={btnClass}
                                >
                                    <Icons.History
                                        className="text-amber-500"
                                        size={16}
                                    />{" "}
                                    <span>Historial Asistencias</span>
                                </button>

                                <button
                                    onClick={() =>
                                        handlePrint(
                                            "solicitud-vacaciones",
                                        )
                                    }
                                    className={btnClass}
                                >
                                    <Icons.FileText
                                        className="text-purple-500"
                                        size={16}
                                    />{" "}
                                    <span>Solicitud de Vacaciones</span>
                                </button>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-2 text-[8px] font-black text-slate-300 hover:text-rose-500 uppercase mt-1 border-t border-slate-50"
                                >
                                    Cerrar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
}
