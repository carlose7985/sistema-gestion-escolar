import React, { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    FileSpreadsheet,
    UserSquare2,
    Briefcase,
    Printer,
    Cake,
    Users,
    FileText,
    LayoutList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccionesReportes({ cargos }) {
    const [openMenu, setOpenMenu] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            )
                setOpenMenu(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

    // Ajustado para apuntar siempre a la ruta única
    const handlePrint = (type, cargoName = null) => {
        const url = route("ExportDocumentosEmpleados", {
            type: type,
            cargoName: cargoName,
        });
        window.open(url, "_blank");
        setOpenMenu(null);
    };

    return (
        <div
            className="flex items-center bg-blue-600 rounded-[5.5px] shadow-sm border border-blue-500 overflow-visible h-8"
            ref={containerRef}
        >
            {/* --- BOTÓN NÓMINAS --- */}
            <div className="relative border-r border-blue-400/50 h-full">
                <button
                    onClick={() => toggleMenu("nominas")}
                    className={`flex items-center gap-2 px-4 h-full text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all rounded-l-xl ${openMenu === "nominas" ? "bg-blue-800" : ""}`}
                >
                    <LayoutList size={14} /> NÓMINAS{" "}
                    <ChevronDown
                        size={12}
                        className={`transition-transform ${openMenu === "nominas" ? "rotate-180" : ""}`}
                    />
                </button>

                <AnimatePresence>
                    {openMenu === "nominas" && (
                        <DropdownContent>
                        
                            <button
                                onClick={() =>
                                    handlePrint("nomina-general-excell")
                                }
                                className="w-full flex items-center gap-3 px-4 py-1 hover:bg-slate-50 transition-all group cursor-pointer text-left"
                            >
                                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <FileText
                                        className="text-emerald-500"
                                        size={16}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    Nómina General Excel
                                </span>
                            </button>

                            <button
                                onClick={() =>
                                    handlePrint("nomina-general-pdf")
                                }
                                className="w-full flex items-center gap-3 px-4 py-1 hover:bg-slate-50 transition-all group cursor-pointer text-left"
                            >
                                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <FileText
                                        className="text-emerald-500"
                                        size={16}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    Nómina General Pdf
                                </span>
                            </button>

                            <div className="px-4 py-1 bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-100 mt-1">
                                Por Cargos
                            </div>
                            <div className="max-h-52 overflow-y-auto custom-scrollbar">
                                {cargos.map((cargo) => (
                                    <button
                                        key={cargo.id}
                                        onClick={() =>
                                            handlePrint(
                                                "nomina-por-cargo-pdf",
                                                cargo.nombre_del_cargo,
                                            )
                                        }
                                        className="w-full flex items-center gap-3 px-4 py-1 hover:bg-slate-50 transition-all group cursor-pointer border-b border-slate-50 last:border-0 text-left"
                                    >
                                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Briefcase
                                                size={14}
                                                className="text-blue-500"
                                            />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                            {cargo.nombre_del_cargo}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </DropdownContent>
                    )}
                </AnimatePresence>
            </div>

            {/* --- BOTÓN CLASIFICADOS --- */}
            <div className="relative border-r border-blue-400/50 h-full">
                <button
                    onClick={() => toggleMenu("clasificados")}
                    className={`flex items-center gap-2 px-4 h-full text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all ${openMenu === "clasificados" ? "bg-blue-800" : ""}`}
                >
                    <Users size={14} /> CLASIFICADOS{" "}
                    <ChevronDown
                        size={12}
                        className={`transition-transform ${openMenu === "clasificados" ? "rotate-180" : ""}`}
                    />
                </button>

                <AnimatePresence>
                    {openMenu === "clasificados" && (
                        <DropdownContent>
                            <button
                                onClick={() =>
                                    handlePrint("clasificacion-por-cargo")
                                }
                                className="w-full flex items-center gap-3 px-4 py-1 hover:bg-slate-50 transition-all group cursor-pointer text-left"
                            >
                                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <FileText
                                        className="text-emerald-500"
                                        size={16}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    Clasificados por Cargo
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handlePrint("clasificacion-por-profesion")
                                }
                                className="w-full flex items-center gap-3 px-4 py-1 hover:bg-slate-50 transition-all group cursor-pointer text-left"
                            >
                                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <FileText
                                        className="text-emerald-500"
                                        size={16}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    Clasificados por Profesión
                                </span>
                            </button>
                        </DropdownContent>
                    )}
                </AnimatePresence>
            </div>

            {/* --- BOTÓN LISTADOS --- */}
            <div className="relative h-full">
                <button
                    onClick={() => toggleMenu("listados")}
                    className={`flex items-center gap-2 px-4 h-full text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all rounded-r-xl ${openMenu === "listados" ? "bg-blue-800" : ""}`}
                >
                    <Printer size={14} /> LISTADOS{" "}
                    <ChevronDown
                        size={12}
                        className={`transition-transform ${openMenu === "listados" ? "rotate-180" : ""}`}
                    />
                </button>

                <AnimatePresence>
                    {openMenu === "listados" && (
                        <DropdownContent align="right">
                            <button
                                onClick={() => handlePrint("listado-de-firmas")}
                                className="w-full flex items-center gap-3 px-4 py-1 hover:bg-slate-50 transition-all group cursor-pointer text-left"
                            >
                                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <UserSquare2
                                        className="text-emerald-500"
                                        size={16}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    Listado de Firmas
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handlePrint("listado-de-cumpleaneros")
                                }
                                className="w-full flex items-center gap-3 px-4 py-1 hover:bg-slate-50 transition-all group cursor-pointer text-left"
                            >
                                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <Cake
                                        className="text-emerald-500"
                                        size={16}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    Cumpleañeros
                                </span>
                            </button>
                        </DropdownContent>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function DropdownContent({ children, align = "left" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-12 w-64 bg-white border border-slate-200 rounded-[1.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] py-3 overflow-hidden ${align === "right" ? "right-0" : "left-0"}`}
        >
            {children}
        </motion.div>
    );
}
