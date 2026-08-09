import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Section, Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import {
    Settings,
    Printer,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
    Plus,
    Trash2,
    ListOrdered,
    ArrowLeftCircle,
    User,
} from "lucide-react";

// Cambiamos 'grados' por 'gradosSeleccionados' para que coincida con el Controller
export default function ConfigReporte({
    gradosSeleccionados = [],
    camposDisponibles = {},
}) {
    // --- ESTADOS DE CONFIGURACIÓN ---
    // Usamos gradosSeleccionados.map con un fallback de array vacío para evitar el error
    const [selectedGrados] = useState(
        (gradosSeleccionados || []).map((g) => g.id.toString()),
    );

    const [tituloReporte, setTituloReporte] = useState("CONTROL ESTUDIANTIL");
    const [filasVacias, setFilasVacias] = useState();
    const [paperSize, setPaperSize] = useState("letter");
    const [orientation, setOrientation] = useState("portrait");

    // --- ESTADOS DE ESTRUCTURA ---
    const [selectedFields, setSelectedFields] = useState([
        "full_name",
        // "cedula",
    ]);
    const [customTitles, setCustomTitles] = useState({ ...camposDisponibles });

    // --- LÓGICA DE COLUMNAS ---
    const addBlankColumn = () => {
        const id = `virtual_${Date.now()}`;
        setSelectedFields([...selectedFields, id]);
        setCustomTitles((prev) => ({ ...prev, [id]: "NUEVA COLUMNA" }));
    };

    const move = (index, direction) => {
        const newOrder = [...selectedFields];
        const target = index + direction;
        if (target < 0 || target >= newOrder.length) return;
        [newOrder[index], newOrder[target]] = [
            newOrder[target],
            newOrder[index],
        ];
        setSelectedFields(newOrder);
    };

    const toggleField = (key) => {
        setSelectedFields((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        );
    };

    // --- LÓGICA DE IMPRESIÓN ---
    const handlePrint = (e) => {
        e.preventDefault();
        if (selectedGrados.length === 0)
            return alert("No hay grados seleccionados para imprimir.");

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        const form = document.createElement("form");
        form.method = "POST";
        form.action = route("control.de.actividades");
        form.target = "_blank";

        const fields = {
            _token: csrfToken,
            grado_ids: JSON.stringify(selectedGrados),
            titulo_reporte: tituloReporte,
            campos: JSON.stringify(selectedFields),
            titulos: JSON.stringify(customTitles),
            filas_vacias: filasVacias,
            paper: paperSize,
            orientation: orientation,
        };

        Object.keys(fields).forEach((key) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = fields[key];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Diseñador de Reportes" />
            <ViewContainer
                title="Diseñador de Reportes"
                showSearch={false}
                subtitle="Gestione y personalice la estructura de sus planillas PDF"
                icon="File"
                returns={
                    <Button onClick={() => window.history.back()}>
                        <ArrowLeftCircle size={18} className="mr-2" /> VOLVER
                    </Button>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] items-stretch">
                    {/* CARD 1: CONFIGURACIÓN GENERAL */}
                    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <Section
                                title="Ajustes de Reporte"
                                icon={<Settings size={18} />}
                                color="text-indigo-600"
                            >
                                {/* PANEL DE GRADOS SELECCIONADOS */}
                                <div className="mb-6">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block">
                                        Secciones a procesar
                                    </label>
                                   
                                    <p className="text-[12px] font-bold text-slate-400 mt-2 ml-2 italic">
                                        * Se generará un archivo PDF con{" "}
                                        {gradosSeleccionados.length} grado(s) .
                                    </p>
                                </div>

                                <Field
                                    label="Título del Reporte"
                                    autoFocus
                                    value={tituloReporte}
                                    onChange={(e) =>
                                        setTituloReporte(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                />
                                <Field
                                    label="Filas Vacías Extras hacia abajo (Opcional)"
                                    type="number"
                                    value={filasVacias}
                                    onChange={(e) =>
                                        setFilasVacias(e.target.value)
                                    }
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField
                                        label="Papel"
                                        value={paperSize}
                                        options={[
                                            { v: "letter", l: "Carta" },
                                            { v: "legal", l: "Oficio" },
                                            { v: "a4", l: "A4" },
                                        ]}
                                        onChange={(e) =>
                                            setPaperSize(e.target.value)
                                        }
                                    />
                                    <SelectField
                                        label="Orientación"
                                        value={orientation}
                                        options={[
                                            { v: "portrait", l: "Vertical" },
                                            { v: "landscape", l: "Horiz." },
                                        ]}
                                        onChange={(e) =>
                                            setOrientation(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <Button
                                        onClick={addBlankColumn}
                                        variant="outline"
                                        className="w-full border-dashed border-2 py-4 border-indigo-200 text-indigo-500 hover:bg-indigo-50 rounded-2xl font-black text-[10px]"
                                    >
                                        <Plus size={18} className="mr-2" />{" "}
                                        AÑADIR COLUMNA DE REFERENCIA A LA DERECHA
                                    </Button>
                                </div>
                            </Section>
                        </div>
                    </div>

                    {/* CARD 2: CAMPOS DISPONIBLES */}
                    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <Section
                                title="Campos a seleccionar del Estudiante"
                                icon={<User size={18} />}
                                color="text-emerald-600"
                            >
                                <div className="grid grid-cols-1 gap-2 text-bold">
                                    {Object.entries(
                                        camposDisponibles || {},
                                    ).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleField(key)}
                                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${selectedFields.includes(key) ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold" : "bg-white border-slate-300 text-slate-800 text-bold"}`}
                                        >
                                            <span className="text-[10px] uppercase">
                                                {label}
                                            </span>
                                            {selectedFields.includes(key) && (
                                                <CheckCircle2 size={16} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </Section>
                        </div>
                    </div>

                    {/* CARD 3: ESTRUCTURA */}
                    <div className="flex flex-col h-full bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden">
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500 rounded-xl text-white">
                                    <ListOrdered size={20} />
                                </div>
                                <h3 className="text-white font-black uppercase italic text-sm tracking-widest">
                                    Editor de Estructura
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {selectedFields.map((key, index) => (
                                    <div
                                        key={key}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border animate-in slide-in-from-right-4 ${key.startsWith("virtual_") ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/5 border-white/10"}`}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => move(index, -1)}
                                                className="text-slate-500 hover:text-white"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => move(index, 1)}
                                                className="text-slate-500 hover:text-white"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                {key.startsWith("virtual_")
                                                    ? "ESPACIO EN BLANCO"
                                                    : "CAMPO DE BD"}
                                            </p>
                                            <input
                                                type="text"
                                                autoFocus={key.startsWith("virtual_")}
                                                value={customTitles[key] || ""}
                                                onChange={(e) =>
                                                    setCustomTitles({
                                                        ...customTitles,
                                                        [key]: e.target.value.toUpperCase(),
                                                    })
                                                }
                                                className="w-full bg-white/5 border-none rounded-lg text-[10px] font-black uppercase p-2 text-white focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                      
                                        <button
                                            onClick={() => toggleField(key)}
                                            className="text-slate-600 hover:text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border-t border-white/10">
                            <Button
                                onClick={handlePrint}
                                variant="primary"
                                className="w-full py-8 text-sm shadow-2xl shadow-blue-500/20"
                                disabled={
                                    selectedFields.length === 0 ||
                                    selectedGrados.length === 0
                                }
                            >
                                <Printer size={22} className="mr-3" />
                                {gradosSeleccionados.length > 1
                                    ? `IMPRIMIR ${gradosSeleccionados.length} SECCIONES`
                                    : "GENERAR REPORTE"}
                            </Button>
                        </div>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
