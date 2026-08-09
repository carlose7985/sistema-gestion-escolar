import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/Button";
import { Head, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

export default function Index({ cargos }) {
    const [selectedCargo, setSelectedCargo] = useState("");

    // Función unificada de impresión basada en tu lógica original
    const handlePrint = (type, cargoName = null) => {
        const url = route("ExportDocumentosEmpleados", {
            type: type,
            cargoName: cargoName,
        });
        window.open(url, "_blank");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Centro de Reportes" />
            <ViewContainer
                title="Centro de Documentación"
                subtitle="Generación de nóminas, listados y clasificaciones"
                icon="Printer"
                showSearch={false}
                actions={
                    <Link href={route("empleados.activos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={18} /> VOLVER 
                        </Button>
                    </Link>
                }
            >
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 p-2">
                    {/* MODULO 1: NÓMINAS */}
                    <CardModulo
                        title="Gestión de Nóminas"
                        icon={Icons.LayoutList}
                        color="blue"
                        description="Reportes generales de personal en formatos PDF y Excel."
                    >
                        <div className="space-y-3">
                            <ActionButton
                                icon={Icons.FileSpreadsheet}
                                label="Nómina General (Excel)"
                                onClick={() =>
                                    handlePrint("nomina-general-excell")
                                }
                                color="emerald"
                            />
                            <ActionButton
                                icon={Icons.FileText}
                                label="Nómina General (PDF)"
                                onClick={() =>
                                    handlePrint("nomina-general-pdf")
                                }
                                color="rose"
                            />

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                                    Nómina por Cargo Específico
                                </p>
                                <select
                                    value={selectedCargo}
                                    onChange={(e) =>
                                        setSelectedCargo(e.target.value)
                                    }
                                    className="w-full bg-slate-50 border-2 text-gray-600  border-slate-400 rounded-2xl text-[10px] font-black uppercase px-4 h-12 mb-3 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                >
                                    <option value="">
                                        Seleccionar Cargo...
                                    </option>
                                    {cargos.map((c) => (
                                        <option
                                            key={c.id}
                                            value={c.nombre_del_cargo}
                                        >
                                            {c.nombre_del_cargo}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    disabled={!selectedCargo}
                                    onClick={() =>
                                        handlePrint(
                                            "nomina-por-cargo-pdf",
                                            selectedCargo,
                                        )
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-2xl font-black uppercase text-[10px]"
                                >
                                    <Icons.Printer size={14} className="mr-2" />{" "}
                                    Generar por Cargo
                                </Button>
                            </div>
                        </div>
                    </CardModulo>

                    {/* MODULO 2: CLASIFICADOS */}
                    <CardModulo
                        title="Clasificaciones"
                        icon={Icons.Users}
                        color="indigo"
                        description="Análisis del personal agrupado por criterios profesionales."
                    >
                        <div className="space-y-3">
                            <ActionButton
                                icon={Icons.Briefcase}
                                label="Clasificados por Cargo"
                                onClick={() =>
                                    handlePrint("clasificacion-por-cargo")
                                }
                                color="indigo"
                            />
                            <ActionButton
                                icon={Icons.GraduationCap}
                                label="Clasificados por Profesión"
                                onClick={() =>
                                    handlePrint("clasificacion-por-profesion")
                                }
                                color="violet"
                            />
                            <div className="mt-10 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                                <Icons.Info
                                    size={20}
                                    className="text-indigo-400 mb-2"
                                />
                                <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase">
                                    Estos reportes organizan al personal según
                                    su formación académica y funciones actuales
                                    en el plantel.
                                </p>
                            </div>
                        </div>
                    </CardModulo>

                    {/* MODULO 3: LISTADOS */}
                    <CardModulo
                        title="Listados y Control"
                        icon={Icons.Printer}
                        color="emerald"
                        description="Formatos de firmas diarias y efemérides del personal."
                    >
                        <div className="space-y-3">
                            <ActionButton
                                icon={Icons.UserSquare2}
                                label="Listado para Firmas"
                                onClick={() => handlePrint("listado-de-firmas")}
                                color="emerald"
                            />
                            <ActionButton
                                icon={Icons.Cake}
                                label="Listado de Cumpleañeros"
                                onClick={() =>
                                    handlePrint("listado-de-cumpleaneros")
                                }
                                color="rose"
                            />
                            <div className="mt-10 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                <Icons.CheckCircle2
                                    size={20}
                                    className="text-emerald-400 mb-2"
                                />
                                <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase">
                                    Formatos optimizados para impresión en
                                    blanco y negro, ideales para uso diario
                                    administrativo.
                                </p>
                            </div>
                        </div>
                    </CardModulo>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

// --- SUB-COMPONENTES INTERNOS ---

function CardModulo({ title, icon: Icon, color, description, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full"
        >
            <div
                className={`p-8 bg-${color}-600 text-white relative overflow-hidden`}
            >
                <Icon
                    size={80}
                    className="absolute -right-4 -bottom-4 opacity-10 rotate-12"
                />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-black uppercase italic tracking-tighter text-lg leading-none">
                            {title}
                        </h3>
                        <p className="text-[9px] font-black uppercase opacity-70 mt-1 tracking-widest">
                            Módulo de Impresión
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
                <p className="text-xs font-medium text-slate-400 mb-8 leading-relaxed italic">
                    {description}
                </p>
                {children}
            </div>
        </motion.div>
    );
}

function ActionButton({ icon: Icon, label, onClick, color }) {
    const colorClasses = {
        emerald:
            "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100",
        rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100",
        indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-indigo-100",
        violet: "bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white border-violet-100",
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${colorClasses[color] || colorClasses.indigo}`}
        >
            <div className="flex items-center gap-4">
                <Icon
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                />
                <span className="text-[11px] font-black uppercase tracking-tight">
                    {label}
                </span>
            </div>
            <Icons.ChevronRight size={14} className="opacity-40" />
        </button>
    );
}
