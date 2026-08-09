"use client";
import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/ui/button";
import Swal from "sweetalert2";
import axios from "axios";

export function GestorPermisos({
    empId,
    nombre,
    onOpenEventual,
    onOpenPermanente,
    onOpenVacacion,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
        upward: false,
    });
    const buttonRef = useRef(null);

    const calculatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 260; // Altura estimada
        const menuWidth = 256; // w-64

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top = rect.bottom + 8;
        let upward = false;

        // Decidir si abre hacia arriba o hacia abajo
        if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
            top = rect.top - menuHeight - 8;
            upward = true;
        }

        // Alinear a la derecha del botón
        let left = rect.right - menuWidth;

        setMenuPosition({ top, left, upward });
    };

    // Cerrar al hacer clic fuera (Lógica mejorada para Portales)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isOpen &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                // Si el clic no es dentro del botón ni dentro del modal flotante
                if (!e.target.closest('[data-modal="gestor-permisos"]')) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);
    const opciones = [
        {
            id: "eventual",
            label: "Permiso Eventual",
            desc: "Ausencias cortas",
            icon: <Icons.FileText size={16} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
           // url: `/empleados-activos/${empId}/permisos/eventual`,
        },
        {
            id: "permanente",
            label: "Permiso Permanente",
            desc: "Reposos largos",
            icon: <Icons.CheckSquare size={16} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
           // url: `/empleados-activos/${empId}/permisos/permanente`,
        },
        {
            id: "vacacion",
            label: "Vacaciones",
            desc: "Período anual",
            icon: <Icons.Umbrella size={16} />,
            color: "text-purple-600",
            bg: "bg-purple-50",
           // url: `/empleados-activos/${empId}/vacaciones`,
        },
    ];

   const handleAction = async (tipo) => {
       setIsVerifying(true);
       try {
           const response = await axios.get(`/api/verificar/permisos/${empId}`);
           const check = response.data;
           setIsVerifying(false);

           // VALIDACIONES ESPECÍFICAS POR TIPO
           if (tipo === "eventual" && check.tieneEventual) {
               return Swal.fire({
                   title: "Permiso en Curso",
                   text: `${nombre} ya posee un Permiso Eventual activo actualmente.`,
                   icon: "warning",
                   confirmButtonColor: "#3b82f6",
                   customClass: { popup: "rounded-[2rem]" },
               });
           }

           if (tipo === "vacacion" && check.tieneVacacion) {
               return Swal.fire({
                   title: "Vacaciones Activas",
                   text: `${nombre} se encuentra actualmente en periodo de vacaciones.`,
                   icon: "error",
                   confirmButtonColor: "#a855f7",
                   customClass: { popup: "rounded-[2rem]" },
               });
           }

           if (tipo === "permanente" && check.tienePermanente) {
               return Swal.fire({
                   title: "Días Fijos Asignados",
                   text: `Este personal ya tiene un horario de permisos permanentes configurado.`,
                   icon: "info",
                   confirmButtonColor: "#10b981",
                   customClass: { popup: "rounded-[2rem]" },
               });
           }

           // Si pasó las validaciones, cerramos el menú y abrimos el modal correspondiente
           setIsOpen(false);

           if (tipo === "eventual") onOpenEventual();
           if (tipo === "permanente") onOpenPermanente();
           if (tipo === "vacacion") onOpenVacacion();
       } catch (error) {
           setIsVerifying(false);
           Swal.fire(
               "Error de Conexión",
               "No se pudo verificar el estatus de permisos en el servidor.",
               "error",
           );
       }
   };

    return (
        <>
            <Button
                title="Gestor de permisos"
                ref={buttonRef}
                onClick={() => {
                    calculatePosition();
                    setIsOpen(!isOpen);
                }}
                variant="ghost"
                size="icon"
                loading={isVerifying || isPending}
                className={`h-9 w-9 rounded-xl shadow-md transition-all relative z-20 ${!isOpen && "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
                <Icons.Users size={16} />
            </Button>

            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                data-modal="gestor-permisos"
                                initial={{
                                    opacity: 0,
                                    scale: 0.95,
                                    y: menuPosition.upward ? 10 : -10,
                                }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.95,
                                    y: menuPosition.upward ? 10 : -10,
                                }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: "fixed",
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                    zIndex: 9999,
                                }}
                                className="w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="px-4 py-3 bg-blue-600 text-white">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">
                                        Gestionar para:
                                    </p>
                                    <h4 className="text-xs font-bold truncate uppercase">
                                        {nombre}
                                    </h4>
                                </div>

                                <div className="p-2 space-y-1">
                                    {opciones.map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() =>
                                                handleAction(opt.id, opt.url)
                                            }
                                            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-slate-800"
                                        >
                                            <div
                                                className={`p-2 rounded-lg ${opt.bg} ${opt.color} group-hover:scale-105 transition-transform`}
                                            >
                                                {opt.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p
                                                    className={`text-[10px] font-black uppercase tracking-tight ${opt.color}`}
                                                >
                                                    {opt.label}
                                                </p>
                                                <p className="text-[8px] text-slate-400 font-bold leading-none">
                                                    {opt.desc}
                                                </p>
                                            </div>
                                            <Icons.ChevronRight
                                                size={12}
                                                className="text-slate-300"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-2.5 text-[8px] font-black text-slate-300 hover:text-rose-500 uppercase border-t border-slate-100 transition-colors"
                                >
                                    Cerrar Panel
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}
