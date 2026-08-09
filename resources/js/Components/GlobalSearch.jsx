import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    Loader2,
    User,
    X,
    ChevronDown,
    ChevronUp,
    History,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
if (token) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
}

export default function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(
                    route("api.estudiantes.search"),
                    {
                        params: { query },
                        headers: { Accept: "application/json" },
                    },
                );
                setResults(data);
                setOpen(true);
            } catch (error) {
                console.error("Error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // 🔥 Función para navegar a un período específico
    const navigateToPeriod = (item, periodo) => {
        setOpen(false);
        setQuery("");

        const status = periodo.status;
        const gradoId = periodo.grado_id;
        const cedula = item.cedula;

        switch (status) {
            case "Activo":
                router.visit(
                    route("estudiantes.activos.listado.show", {
                        grado_id: gradoId,
                    }),
                    {
                        data: { search: cedula },
                    },
                );
                break;

            case "Aprobado":
                router.visit(route("estudiantes.activos.aprobados.index"), {
                    data: { search: cedula },
                });
                break;

            case "Reprobado":
                router.visit(route("estudiantes.activos.reprobados.index"), {
                    data: { search: cedula },
                });
                break;

            case "Retirado":
                router.visit(route("estudiantes.inactivos.retirados.index"), {
                    data: { search: cedula },
                });
                break;

            case "Graduado":
                router.visit(route("estudiantes.inactivos.graduados.index"), {
                    data: { search: cedula },
                });
                break;

            default:
                router.visit(route("estudiantes.activos.listado.index"));
                break;
        }
    };

    // 🔥 Función para navegar al último período (click en la cabecera)
    const navigateToLastPeriod = (item) => {
        if (item.periodos && item.periodos.length > 0) {
            // Usar el primer período (el más reciente)
            const ultimoPeriodo = item.periodos[0];
            navigateToPeriod(item, ultimoPeriodo);
        }
    };

    return (
        <div className="relative w-96 z-100" ref={containerRef}>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    )}
                </div>

                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setOpen(true)}
                    placeholder="BUSCAR ESTUDIANTE..."
                    className="bg-slate-900/80 backdrop-blur-md border border-slate-400 rounded-2xl w-full py-2 pl-12 pr-10 text-[10px] font-black tracking-[0.1em] text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none shadow-2xl uppercase"
                />

                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setOpen(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {open && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        className="absolute top-full mt-3 w-[120%] -left-[10%] bg-[#0f172a] border border-slate-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[999] backdrop-blur-xl"
                    >
                        <div className="p-3 max-h-[480px] overflow-y-auto custom-scrollbar">
                            <div className="px-4 py-2 mb-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                    Resultados de búsqueda
                                </span>
                            </div>

                            {results.map((item, index) => (
                                <div
                                    key={index}
                                    className="mb-2 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all"
                                >
                                    {/* Cabecera - click navega al último período */}
                                    <div
                                        className="flex items-center gap-3 p-3 hover:bg-blue-600/10 transition-all group cursor-pointer"
                                        onClick={() =>
                                            navigateToLastPeriod(item)
                                        }
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shrink-0">
                                            <User size={20} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[12px] font-black text-white uppercase tracking-tighter truncate">
                                                    {item.full_name}
                                                </p>
                                                <div
                                                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${item.color}`}
                                                >
                                                    {item.status}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[9px] text-slate-400 font-bold">
                                                    C.I:{" "}
                                                    <span className="text-slate-200">
                                                        {item.cedula}
                                                    </span>
                                                </p>
                                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                <p className="text-[9px] text-blue-400 font-black uppercase italic">
                                                    {item.grado}
                                                </p>
                                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                <p className="text-[9px] text-slate-500 font-bold">
                                                    {item.periodo}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(item.id);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-slate-800 transition-all shrink-0"
                                        >
                                            {expandedId === item.id ? (
                                                <ChevronUp
                                                    size={16}
                                                    className="text-slate-400"
                                                />
                                            ) : (
                                                <ChevronDown
                                                    size={16}
                                                    className="text-slate-400"
                                                />
                                            )}
                                        </button>
                                    </div>

                                    {/* Historial de períodos - CADA PERÍODO ES NAVEGABLE */}
                                    {expandedId === item.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-slate-800/50 bg-slate-900/30 p-3"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <History
                                                    size={12}
                                                    className="text-slate-500"
                                                />
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                    Historial Académico - Click
                                                    para ir a ese período
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {item.periodos.map(
                                                    (periodo, idx) => {
                                                        // 🔥 Determinar si es el período actual
                                                        const esActual =
                                                            periodo.is_last;
                                                        // 🔥 Obtener el color según el status del período
                                                        const colorStatus =
                                                            periodo.status ===
                                                            "Activo"
                                                                ? "text-emerald-400"
                                                                : periodo.status ===
                                                                    "Aprobado"
                                                                  ? "text-blue-400"
                                                                  : periodo.status ===
                                                                      "Reprobado"
                                                                    ? "text-rose-400"
                                                                    : periodo.status ===
                                                                        "Retirado"
                                                                      ? "text-slate-400"
                                                                      : periodo.status ===
                                                                          "Graduado"
                                                                        ? "text-purple-400"
                                                                        : "text-slate-400";

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-blue-600/20 cursor-pointer border border-transparent hover:border-blue-500/30"
                                                                onClick={() =>
                                                                    navigateToPeriod(
                                                                        item,
                                                                        periodo,
                                                                    )
                                                                }
                                                            >
                                                                <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                                                <span className="text-[10px] font-bold text-slate-400 min-w-[90px]">
                                                                    {
                                                                        periodo.periodo
                                                                    }
                                                                </span>
                                                                <span
                                                                    className={`text-[10px] font-black uppercase ${colorStatus}`}
                                                                >
                                                                    {
                                                                        periodo.status
                                                                    }
                                                                </span>
                                                                {periodo.status_escolar && (
                                                                    <span className="text-[8px] text-slate-500 font-bold uppercase">
                                                                        (
                                                                        {
                                                                            periodo.status_escolar
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                                <span className="text-[9px] text-slate-500 font-mono ml-auto">
                                                                    {
                                                                        periodo.grado
                                                                    }
                                                                </span>
                                                                {esActual && (
                                                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[7px] font-black uppercase border border-blue-500/30">
                                                                        Actual
                                                                    </span>
                                                                )}
                                                                <ChevronDown
                                                                    size={12}
                                                                    className="text-blue-400 rotate-[-90deg] ml-1"
                                                                />
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                            <div className="mt-2 text-[7px] text-slate-500 font-black uppercase tracking-widest text-center border-t border-slate-800/50 pt-2">
                                                {item.periodos.length} períodos
                                                encontrados
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
