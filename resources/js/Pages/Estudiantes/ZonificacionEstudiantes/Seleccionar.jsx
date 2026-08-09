import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import {
    Search,
    X,
    Save,
    Loader2,
    ArrowLeftCircle,
    School,
    Users,
    Check,
    ChevronDown,
    UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function SeleccionarZonificacion({
    datos,
    secciones,
    planteles,
    filters,
}) {
    // --- ESTADOS LOCALES ---
    const [search, setSearch] = useState(filters.search || "");
    const [liceoSearch, setLiceoSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [step, setStep] = useState(1);
    const dropdownRef = useRef(null);
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);

    // --- FORMULARIO INERTIA ---
    const { data, setData, post, processing, reset } = useForm({
        ids: [],
        plantel_id: "",
        nuevo_plantel: "",
        director: "",
        asite: "",
        grado_id_actual: filters.grado_id,
        registrar_escuela: true,
    });

    // --- CERRAR DROPDOWN ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
                setLiceoSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- BÚSQUEDA ---
    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.acciones.zonificacion.seleccionar"),
                { search: query, grado_id: filters.grado_id },
                { preserveState: true, replace: true, only: ["datos"] },
            );
        }, 400),
        [filters.grado_id],
    );

    useEffect(() => {
        debouncedSearch(search);
    }, [search]);

    // --- LÓGICA DE SELECCIÓN ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(datos.map((s) => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    // --- ABRIR MODAL ---
    const openModal = () => {
        if (selectedIds.length === 0)
            return toast.error("Seleccione al menos un alumno");

        const seleccionados = datos.filter((s) => selectedIds.includes(s.id));
        // Inicializar todos con "Si"
        const conAsiste = seleccionados.map((s) => ({ ...s, asiste: "Si" }));
        setAlumnosSeleccionados(conAsiste);

        setStep(1);
        setLiceoSearch("");
        setIsDropdownOpen(false);
        setData({
            ...data,
            ids: selectedIds,
            plantel_id: "",
            nuevo_plantel: "",
            director: "",
            asiste: "Si",
            registrar_escuela: true,
        });
        setIsModalOpen(true);
    };

    // --- MANEJAR CAMBIO DE ASISTE ---
    const toggleAsiste = (id, valor) => {
        setAlumnosSeleccionados((prev) =>
            prev.map((alumno) =>
                alumno.id === id ? { ...alumno, asiste: valor } : alumno,
            ),
        );
    };

    // --- PASAR AL SIGUIENTE PASO ---
    const siguientePaso = () => {
        const idsTodos = alumnosSeleccionados.map((a) => a.id);

        // 🔥 Crear un string con el asiste de cada estudiante separado por comas
        // Formato: "estudiante_id:asiste,estudiante_id:asiste"
        const asisteString = alumnosSeleccionados
            .map((a) => `${a.id}:${a.asiste}`)
            .join(",");

        setData((prevData) => ({
            ...prevData,
            ids: idsTodos,
            asiste: asisteString, // 🔥 Enviar como string
        }));

        setStep(2);
    };

    // --- VOLVER AL PASO ANTERIOR ---
    const pasoAnterior = () => {
        setStep(1);
    };

    // --- GUARDAR ---
    const handleStore = (e) => {
        e.preventDefault();

        post(route("estudiantes.acciones.zonificacion.store"), {
            data: {
                ...data,
                // asiste ya es un string de data
            },
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setSelectedIds([]);
                setAlumnosSeleccionados([]);
                setIsDropdownOpen(false);
                setLiceoSearch("");
                setStep(1);
            },
            onError: (errors) => {
                console.log("Errores:", errors);
                toast.error("Error al guardar: " + JSON.stringify(errors));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Seleccionar para Zonificar" />

            <ViewContainer
                title="VISTA ESTUDIANTES A ZONIFICAR"
                subtitle="Seleccione los alumnos de 6to grado para asignar destino"
                icon="User"
                showSearch={true}
                searchValue={search}
                onSearch={setSearch}
                returns={
                    <div className="flex items-center gap-2">
                        <Link
                            href={route(
                                "estudiantes.acciones.zonificacion.index",
                                { grado_id: filters.grado_id },
                            )}
                        >
                            <Button>
                                <ArrowLeftCircle size={16} className="mr-2" />{" "}
                                VOLVER
                            </Button>
                        </Link>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        {secciones.map((s) => (
                            <button
                                key={s.id}
                                onClick={() =>
                                    router.get(
                                        route(
                                            "estudiantes.acciones.zonificacion.seleccionar",
                                        ),
                                        { grado_id: s.id },
                                    )
                                }
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                    filters.grado_id == s.id
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                                6TO GRADO "{s.seccion}"
                            </button>
                        ))}
                    </div>
                }
                extraFilters={
                    selectedIds.length > 0 && (
                        <Button
                            onClick={openModal}
                            className="bg-indigo-600 text-white h-9 px-6 text-[10px] font-black uppercase rounded-xl animate-in zoom-in-95 shadow-xl ring-4 ring-indigo-50"
                        >
                            ZONIFICAR ({selectedIds.length})
                        </Button>
                    )
                }
            >
                <div className="bg-white border border-slate-200 rounded-t-[1.5rem] overflow-hidden shadow-2xl h-full flex flex-col">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-20 bg-indigo-600 text-white text-[10px] uppercase font-black italic">
                                <tr>
                                    <th className="px-6 py-4 text-center w-16 border-r border-indigo-500">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                datos.length > 0 &&
                                                selectedIds.length ===
                                                    datos.length
                                            }
                                            className="rounded border-none text-indigo-900 focus:ring-0"
                                        />
                                    </th>
                                    <th className="px-8 py-4 text-left">
                                        Nombres y Apellidos
                                    </th>
                                    <th className="px-8 py-4 text-center">
                                        Cédula de Identidad
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-600">
                                {datos.map((s) => (
                                    <tr
                                        key={s.id}
                                        onClick={() => handleSelectRow(s.id)}
                                        className={`cursor-pointer transition-colors ${
                                            selectedIds.includes(s.id)
                                                ? "bg-indigo-50/50"
                                                : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <td className="px-6 py-4 text-center border-r border-slate-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(
                                                    s.id,
                                                )}
                                                readOnly
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-8 py-4 font-black uppercase text-slate-700 text-[12px]">
                                            {s.name} {s.apellido}
                                        </td>
                                        <td className="px-8 py-4 text-center font-mono font-bold text-slate-500 text-[12px]">
                                            {s.cedula}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {datos.length === 0 && (
                            <div className="py-32 text-center opacity-20">
                                <Users size={64} className="mx-auto mb-4" />
                                <span className="text-sm font-black uppercase tracking-widest">
                                    No hay alumnos pendientes en esta sección
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </ViewContainer>

            {/* --- MODAL ZONIFICACIÓN --- */}
            {isModalOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="bg-white rounded-[1.5rem] w-full h-[250rem] max-w-2xl p-10 shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] border-2 border-emerald-100 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setLiceoSearch("");
                                    setIsDropdownOpen(false);
                                    setStep(1);
                                    setAlumnosSeleccionados([]);
                                }}
                                className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                            >
                                <X size={28} />
                            </button>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-lg ring-4 ring-emerald-50">
                                    <School size={40} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">
                                        Zonificación
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 italic">
                                        Paso {step} de 2
                                    </p>
                                </div>
                            </div>

                            {step === 1 ? (
                                // --- PASO 1: SELECCIÓN DE ASISTENCIA ---
                                <div>
                                    <p className="text-[11px] font-black text-slate-600 uppercase mb-4">
                                        Indique qué alumnos asistirán a grado
                                    </p>

                                    <div className="max-h-60 overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-slate-100 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-[9px] font-black uppercase text-slate-500">
                                                        Estudiante
                                                    </th>
                                                    <th className="px-4 py-2 text-center text-[9px] font-black uppercase text-slate-500">
                                                        Asiste a Grado
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alumnosSeleccionados.map(
                                                    (alumno) => (
                                                        <tr
                                                            key={alumno.id}
                                                            className="border-b border-slate-100"
                                                        >
                                                            <td className="px-4 py-3 font-black text-slate-700">
                                                                {alumno.name}{" "}
                                                                {
                                                                    alumno.apellido
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            toggleAsiste(
                                                                                alumno.id,
                                                                                "Si",
                                                                            )
                                                                        }
                                                                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                                                                            alumno.asiste ===
                                                                            "Si"
                                                                                ? "bg-emerald-500 text-white shadow-md"
                                                                                : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                                                        }`}
                                                                    >
                                                                        Si
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            toggleAsiste(
                                                                                alumno.id,
                                                                                "No",
                                                                            )
                                                                        }
                                                                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                                                                            alumno.asiste ===
                                                                            "No"
                                                                                ? "bg-rose-500 text-white shadow-md"
                                                                                : "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                                        }`}
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <Button
                                            onClick={() => {
                                                setAlumnosSeleccionados(
                                                    (prev) =>
                                                        prev.map((a) => ({
                                                            ...a,
                                                            asiste: "Si",
                                                        })),
                                                );
                                            }}
                                            variant="outline"
                                            className="flex-1 h-10 text-[9px] font-black uppercase rounded-xl"
                                        >
                                            Todos Asisten
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setAlumnosSeleccionados(
                                                    (prev) =>
                                                        prev.map((a) => ({
                                                            ...a,
                                                            asiste: "No",
                                                        })),
                                                );
                                            }}
                                            variant="outline"
                                            className="flex-1 h-10 text-[9px] font-black uppercase rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                                        >
                                            Ninguno Asiste
                                        </Button>
                                    </div>

                                    <Button
                                        onClick={siguientePaso}
                                        className="w-full h-14 mt-6 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black shadow-xl"
                                    >
                                        <UserCheck size={20} className="mr-2" />
                                        CONTINUAR (
                                        {
                                            alumnosSeleccionados.filter(
                                                (a) => a.asiste === "Si",
                                            ).length
                                        }{" "}
                                        asisten)
                                    </Button>
                                </div>
                            ) : (
                                // --- PASO 2: ASIGNAR LICEO ---
                                <form
                                    onSubmit={handleStore}
                                    className="space-y-6"
                                >
                                    {/* 1. EL SWITCH SIEMPRE VISIBLE */}
                                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-6">
                                        <span
                                            className={`text-[9px] font-black uppercase ml-2 ${
                                                data.nuevo_plantel
                                                    ? "text-emerald-600"
                                                    : "text-rose-600"
                                            }`}
                                        >
                                            {data.nuevo_plantel
                                                ? "✏️ Registro manual activado"
                                                : "📋 Click aca para registrar nuevo plantel"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData({
                                                    ...data,
                                                    nuevo_plantel:
                                                        !data.nuevo_plantel
                                                            ? " "
                                                            : "",
                                                    plantel_id: "",
                                                    director: "",
                                                });
                                                setIsDropdownOpen(false);
                                                setLiceoSearch("");
                                            }}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${
                                                data.nuevo_plantel
                                                    ? "bg-emerald-500"
                                                    : "bg-rose-500"
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${
                                                    data.nuevo_plantel
                                                        ? "left-7"
                                                        : "left-1"
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* 2. CONTENIDO CONDICIONAL */}
                                    {!data.nuevo_plantel ? (
                                        <div className="space-y-3">
                                            {/* DROPDOWN CON BUSCADOR Y SCROLL ELEGANTE */}
                                            <div
                                                className="relative"
                                                ref={dropdownRef}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsDropdownOpen(
                                                            !isDropdownOpen,
                                                        )
                                                    }
                                                    className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-4 text-left flex items-center justify-between hover:border-emerald-400 transition-all focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <School
                                                            size={20}
                                                            className="text-emerald-500"
                                                        />
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {data.plantel_id
                                                                ? planteles.find(
                                                                      (p) =>
                                                                          p.id ===
                                                                          data.plantel_id,
                                                                  )?.nombre
                                                                : "Seleccionar liceo..."}
                                                        </span>
                                                    </div>
                                                    <ChevronDown
                                                        size={20}
                                                        className={`text-slate-400 transition-transform duration-300 ${
                                                            isDropdownOpen
                                                                ? "rotate-180"
                                                                : ""
                                                        }`}
                                                    />
                                                </button>

                                                {/* DROPDOWN CON SCROLL ELEGANTE */}
                                                {isDropdownOpen && (
                                                    <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl overflow-hidden">
                                                        {/* Buscador dentro del dropdown */}
                                                        <div className="p-3 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                                            <div className="relative">
                                                                <Search
                                                                    size={14}
                                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Filtrar liceos..."
                                                                    value={
                                                                        liceoSearch
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setLiceoSearch(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                                                    autoFocus
                                                                />
                                                                {liceoSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setLiceoSearch(
                                                                                "",
                                                                            );
                                                                        }}
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                                                                    >
                                                                        <X
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* 🔥 LISTA CON SCROLL ELEGANTE */}
                                                        <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-slate-100 hover:scrollbar-thumb-emerald-300">
                                                            {(() => {
                                                                const filtered =
                                                                    planteles.filter(
                                                                        (p) =>
                                                                            p.nombre
                                                                                .toLowerCase()
                                                                                .includes(
                                                                                    liceoSearch.toLowerCase(),
                                                                                ),
                                                                    );
                                                                const top5 =
                                                                    filtered.slice(
                                                                        0,
                                                                        1000,
                                                                    );

                                                                return top5.map(
                                                                    (p) => (
                                                                        <button
                                                                            key={
                                                                                p.id
                                                                            }
                                                                            type="button"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setData(
                                                                                    "plantel_id",
                                                                                    p.id,
                                                                                );
                                                                                setIsDropdownOpen(
                                                                                    false,
                                                                                );
                                                                                setLiceoSearch(
                                                                                    "",
                                                                                );
                                                                            }}
                                                                            className={`w-full text-left p-3 transition-all duration-150 border-b border-slate-50 last:border-0 hover:bg-emerald-50 ${
                                                                                data.plantel_id ===
                                                                                p.id
                                                                                    ? "bg-emerald-50"
                                                                                    : ""
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-start gap-2">
                                                                                <div className="mt-0.5">
                                                                                    <div
                                                                                        className={`w-2 h-2 rounded-full ${
                                                                                            data.plantel_id ===
                                                                                            p.id
                                                                                                ? "bg-emerald-500"
                                                                                                : "bg-slate-300"
                                                                                        }`}
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-[11px] font-black uppercase text-slate-700 leading-tight">
                                                                                        {
                                                                                            p.nombre
                                                                                        }
                                                                                    </p>
                                                                                    {p.direccion && (
                                                                                        <p className="text-[8px] font-medium text-slate-400 mt-1 truncate">
                                                                                            {
                                                                                                p.direccion
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                {data.plantel_id ===
                                                                                    p.id && (
                                                                                    <Check
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className="text-emerald-500 shrink-0"
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    ),
                                                                );
                                                            })()}

                                                            {planteles.filter(
                                                                (p) =>
                                                                    p.nombre
                                                                        .toLowerCase()
                                                                        .includes(
                                                                            liceoSearch.toLowerCase(),
                                                                        ),
                                                            ).length === 0 && (
                                                                <div className="p-8 text-center">
                                                                    <School
                                                                        size={
                                                                            24
                                                                        }
                                                                        className="text-slate-300 mx-auto mb-2"
                                                                    />
                                                                    <p className="text-[12px] font-bold text-gray-800 uppercase">
                                                                        No se
                                                                        encontraron
                                                                        liceos
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-900 mt-1">
                                                                        Activa
                                                                        "Registrar
                                                                        Manual"
                                                                        para
                                                                        crear
                                                                        uno
                                                                        nuevo
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Field
                                                label="Nombre del Plantel *"
                                                autoFocus
                                                value={
                                                    data.nuevo_plantel === " "
                                                        ? ""
                                                        : data.nuevo_plantel
                                                }
                                                onChange={(e) =>
                                                    setData({
                                                        ...data,
                                                        nuevo_plantel:
                                                            e.target.value.toUpperCase(),
                                                    })
                                                }
                                                placeholder="EJ: LICEO BOLIVARIANO..."
                                            />
                                            <Field
                                                label="Nombre del Director(a)"
                                                value={data.director}
                                                onChange={(e) =>
                                                    setData(
                                                        "director",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="ESCRIBA EL NOMBRE DEL DIRECTOR..."
                                            />
                                        </div>
                                    )}

                                    {/* 3. BOTÓN DE ENVÍO */}
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            (!data.plantel_id &&
                                                !data.nuevo_plantel.trim())
                                        }
                                        className={`w-full h-20 rounded-[2rem] font-black text-sm shadow-2xl flex items-center justify-center gap-4 ${
                                            data.nuevo_plantel
                                                ? "bg-rose-600 hover:bg-rose-500"
                                                : "bg-emerald-600 hover:bg-emerald-500"
                                        }`}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2
                                                    className="animate-spin"
                                                    size={32}
                                                />
                                                <span>PROCESANDO...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={24} />
                                                <span>ACTUALIZAR DESTINO</span>
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </AuthenticatedLayout>
    );
}
