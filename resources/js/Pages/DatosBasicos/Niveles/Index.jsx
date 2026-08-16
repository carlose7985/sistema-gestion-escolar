"use client";
import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, router, Link, useForm } from "@inertiajs/react";

import {
    Save,  
    Plus,
    ChevronLeftCircle,
    Info,
    Layers,
    CheckCircle2,
    Circle,
    Inbox,
    PlusSquare,
   
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function NivelesIndex({ niveles }) {
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [selectedNivel, setSelectedNivel] = useState("");

    const { data, setData, post, processing, reset } = useForm({
        nombre: "",
        nivel: "",
    });

    const columnasNiveles = [
        {
            id: "Educación Inicial",
            color: "text-rose-500",
            glow: "shadow-rose-500/20",
            border: "border-rose-500",
        },
        {
            id: "Educación Primaria",
            color: "text-blue-500",
            glow: "shadow-blue-500/20",
            border: "border-blue-500",
        },
        {
            id: "Media General",
            color: "text-indigo-500",
            glow: "shadow-indigo-500/20",
            border: "border-indigo-500",
        },
        {
            id: "Media Técnica",
            color: "text-fuchsia-500",
            glow: "shadow-fuchsia-500/20",
            border: "border-fuchsia-500",
        },
    ];

    const openAddModal = (nivelId) => {
        setSelectedNivel(nivelId);
        setData("nivel", nivelId);
        setIsAreaModalOpen(true);
    };

    const handleToggle = (id) => {
        router.post(
            route("settings.institucion.niveles.toggle"),
            { id },
            { preserveScroll: true },
        );
    };

    const handleSaveGrado = (e) => {
        e.preventDefault();
        post(route("settings.institucion.niveles.store"), {
            onSuccess: () => {
                setIsAreaModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Niveles Educativos" />

            <ViewContainer
                title="ECTRUCTURA ACADÉMICA"
                subtitle="Registro y actualización niveles académicos de la institución"
                icon="GraduationCap"
                showSearch={false}
                actions={
                    <Link href={route("settings.index")}>
                        <Button>
                            <ChevronLeftCircle size={16} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="p-6 h-full flex flex-col gap-6">
                    {/* Alerta Informativa Core Edition */}
                    <div className="flex items-center gap-4 bg-[#f8fafc] border border-blue-100 p-5 rounded-[2rem] shadow-sm">
                        <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest italic">
                                Regla de Configuración:
                            </p>
                            <p className="text-[11px] font-bold text-slate-500 leading-tight">
                                Registre únicamente el nombre del grado o año{" "}
                                <span className="text-rose-500 underline">
                                    (ej: "1er Grupo", "1er Grado", "1er Año",
                                    ect).
                                </span>{" "}
                                No incluya las secciones aquí, ya que se asignan
                                en un módulo posterior. Registre únicamente el
                                nombre del grado.
                            </p>
                        </div>
                    </div>

                    {/* Grid de Niveles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 overflow-hidden">
                        {columnasNiveles.map((col, idx) => (
                            <motion.div
                                key={col.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <div
                                        className={`flex items-center gap-3 ${col.color}`}
                                    >
                                        <Layers size={18} />
                                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] italic">
                                            {col.id}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => openAddModal(col.id)}
                                        className={`p-2 rounded-xl bg-white border border-slate-100 ${col.color} hover:scale-110 active:scale-90 transition-all shadow-sm`}
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>

                                <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
                                    {niveles
                                        .filter((n) => n.nivel === col.id)
                                        .map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() =>
                                                    handleToggle(item.id)
                                                }
                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                                                    item.activo
                                                        ? `${col.border} bg-white shadow-lg ${col.glow}`
                                                        : "border-slate-100 bg-slate-50/50 text-slate-300"
                                                }`}
                                            >
                                                <span
                                                    className={`text-[10px] font-black uppercase italic tracking-widest transition-colors ${item.activo ? col.color : "text-slate-400"}`}
                                                >
                                                    {item.nombre}
                                                </span>
                                                {item.activo ? (
                                                    <CheckCircle2
                                                        size={14}
                                                        className={col.color}
                                                    />
                                                ) : (
                                                    <Circle
                                                        size={14}
                                                        className="opacity-20 group-hover:opacity-100 transition-opacity"
                                                    />
                                                )}
                                            </button>
                                        ))}

                                    {niveles.filter((n) => n.nivel === col.id)
                                        .length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-20">
                                            <Inbox
                                                size={32}
                                                className="text-slate-400"
                                            />
                                            <p className="text-[9px] font-black uppercase mt-2">
                                                Vacío
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </ViewContainer>

            {/* MODAL DE REGISTRO - CORE EDITION */}
            <AnimatePresence>
                {isAreaModalOpen && (
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#06090f]/80 backdrop-blur-md p-4"
                        onClick={() => setIsAreaModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden relative border-4 border-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-10 text-center">
                                <div className="bg-indigo-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
                                    <PlusSquare size={32} />
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                    Nuevo Grado para:
                                </p>
                                <h3 className="text-sm font-black text-indigo-950 uppercase italic tracking-tighter mb-8 underline decoration-indigo-200 underline-offset-4">
                                    {selectedNivel}
                                </h3>

                                <form
                                    onSubmit={handleSaveGrado}
                                    className="space-y-8"
                                >
                                    <Field
                                        label="Nombre del Grado / Año"
                                        placeholder="EJ: 1er Grado, 1er Año..."
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData("nombre", e.target.value)
                                        }
                                        autoFocus
                                        required
                                        autoTitleCase
                                    />

                                    <div className="flex flex-col gap-3">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            className="w-full h-16 rounded-2xl"
                                            loading={processing}
                                        >
                                            <Save size={18} /> CONFIRMAR
                                            REGISTRO
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                setIsAreaModalOpen(false)
                                            }
                                            className="text-slate-400 hover:text-rose-500"
                                        >
                                            DESCARTAR
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
