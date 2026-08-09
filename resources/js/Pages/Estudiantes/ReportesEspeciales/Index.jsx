// resources/js/Pages/Estudiantes/ReportesEspeciales/Index.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import axios from "axios";
import { debounce } from "lodash";
import {
    ArrowLeftCircle,
    Search,
    Loader2,
    Users,
    Copy,
    Check,
    User,
    MessageCircle,
    X,
    Send,
    Phone,
    UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportesEspecialesIndex({ filters }) {
    // --- ESTADOS ---
    const [tipo, setTipo] = useState(filters?.tipo || "");
    const [search, setSearch] = useState(filters?.search || "");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Estados para WhatsApp
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [searchEmpleado, setSearchEmpleado] = useState("");
    const [whatsappUrl, setWhatsappUrl] = useState("");
    const [tipoEnvio, setTipoEnvio] = useState("masivo"); // 'masivo' o 'individual'
    const [estudianteParaEnviar, setEstudianteParaEnviar] = useState(null);
    const [loadingEmpleados, setLoadingEmpleados] = useState(false);

    const isTyping = useRef(false);

    const tiposOpciones = [
        { v: "", l: "SELECCIONAR FILTRO" },
        { v: "etnia", l: "Pertenecientes a una Etnia" },
        { v: "repitientes", l: "Repitientes" },
        { v: "condicion_especial", l: "Condición Especial" },
        { v: "no_escolarizado", l: "No Escolarizados" },
        { v: "vuelta_patria", l: "Vuelta a la Patria" },
    ];

    // --- CARGAR DATOS ---
    const fetchData = useCallback(
        debounce(async (tipoFiltro, searchQuery) => {
            if (!tipoFiltro) {
                setData([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(
                    route("estudiantes.acciones.condiciones.especiales.data"),
                    {
                        params: {
                            tipo: tipoFiltro,
                            search: searchQuery || "",
                        },
                    },
                );
                setData(response.data.data || []);
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error al cargar los datos");
                setData([]);
            } finally {
                setLoading(false);
            }
        }, 500),
        [],
    );

    useEffect(() => {
        fetchData(tipo, search);
        return () => fetchData.cancel?.();
    }, [tipo, search]);

    // --- MANEJADORES ---
    const onTipoChange = (e) => {
        setTipo(e.target.value);
        setSearch("");
    };

    const onSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (val === "") isTyping.current = false;
    };

    // --- FUNCIONES DE COPIA ---
    const formatSingleStudent = (item) => {
        return [
            `Nombre y Apellido: ${item.name || ""} ${item.apellido || ""}`.trim(),
            `C.I o C.E: ${item.cedula || ""}`,
            `F/N: ${item.fecha_de_nacimiento || ""}`,
            `EDAD: ${item.edad || ""}`,
            `GRADO: ${item.grado || ""} ${item.seccion || ""}`.trim(),
        ].join("\n");
    };

    const copyAllData = () => {
        if (data.length === 0) return;
        const textToCopy = data.map(formatSingleStudent).join("\n\n");
        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                setCopiedAll(true);
                toast.success(`${data.length} estudiantes copiados`);
                setTimeout(() => setCopiedAll(false), 3000);
            })
            .catch(() => toast.error("Error al copiar"));
    };

    const copySingleRow = (item) => {
        const text = formatSingleStudent(item);
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopiedId(item.id);
                toast.success(`✅ ${item.name} ${item.apellido} copiado`);
                setTimeout(() => setCopiedId(null), 3000);
            })
            .catch(() => toast.error("Error al copiar"));
    };

    // --- FUNCIONES DE WHATSAPP ---
    const abrirModalWhatsApp = async (tipoEnvio, estudiante = null) => {
        if (data.length === 0) {
            toast.warning("No hay datos para enviar");
            return;
        }

        setTipoEnvio(tipoEnvio);
        setEstudianteParaEnviar(estudiante);
        setShowWhatsAppModal(true);
        setEmpleadoSeleccionado(null);
        setSearchEmpleado("");
        await cargarEmpleados();
    };

    const cargarEmpleados = async (searchTerm = "") => {
        setLoadingEmpleados(true);
        try {
            const response = await axios.get(
                route("estudiantes.acciones.whatsapp.empleados"),
                { params: { search: searchTerm } },
            );
            setEmpleados(response.data.data || []);
        } catch (error) {
            toast.error("Error al cargar empleados");
        } finally {
            setLoadingEmpleados(false);
        }
    };

    const buscarEmpleados = (searchTerm) => {
        setSearchEmpleado(searchTerm);
        cargarEmpleados(searchTerm);
    };

    const enviarWhatsApp = async () => {
        if (!empleadoSeleccionado) {
            toast.warning("Selecciona un empleado para enviar");
            return;
        }

        setWhatsappLoading(true);
        try {
            const payload = {
                tipo: tipo,
                empleado_id: empleadoSeleccionado.id,
                search: search || "",
                individual: tipoEnvio === "individual",
                estudiante_id:
                    tipoEnvio === "individual"
                        ? estudianteParaEnviar?.id
                        : null,
            };

            const response = await axios.post(
                route("estudiantes.acciones.whatsapp.send"),
                payload,
            );

            if (response.data.success) {
                setWhatsappUrl(response.data.whatsapp_url);
                toast.success("Reporte generado, abriendo WhatsApp...");

                // Abrir WhatsApp Web
                window.open(response.data.whatsapp_url, "_blank");

                // Cerrar modal después de 2 segundos
                setTimeout(() => {
                    setShowWhatsAppModal(false);
                    setWhatsappLoading(false);
                    setEmpleadoSeleccionado(null);
                }, 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Error al enviar");
            setWhatsappLoading(false);
        }
    };

    // --- ESTADÍSTICAS ---
    const total = data.length;
    const totalM = data.filter((item) => item.sexo === "M").length;
    const totalF = data.filter((item) => item.sexo === "F").length;

    const getTipoLabel = () => {
        const found = tiposOpciones.find((t) => t.v === tipo);
        return found ? found.l : tipo;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reportes Especiales" />

            <ViewContainer
                title="REPORTES ESPECIALES"
                subtitle="Consulta de estudiantes por categoría especial"
                icon="Award"
                showSearch={false}
                returns={
                    <Link href={route("estudiantes.acciones.index")}>
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-2" />
                            VOLVER
                        </Button>
                    </Link>
                }
                extraFilters={
                    <div className="flex items-center gap-4 ml-auto w-full">
                        <div className="w-64">
                            <SelectField
                                value={tipo}
                                onChange={onTipoChange}
                                optionSelecName="SELECCIONAR FILTRO"
                                options={tiposOpciones}
                            />
                        </div>
                        {tipo && (
                            <div className="relative flex-1">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={onSearchChange}
                                    placeholder="Buscar por nombre, apellido o cédula..."
                                    className="w-96 pl-10 pr-4 py-1.6 bg-slate-50 border text-gray-500 border-slate-400 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        )}
                    </div>
                }
                actionFooter={
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase text-slate-500">
                        {tipo && (
                            <>
                                <span>
                                    Total:{" "}
                                    <b className="text-slate-900">{total}</b>
                                </span>
                                <span className="text-blue-500">
                                    M: {totalM}
                                </span>
                                <span className="text-pink-500">
                                    F: {totalF}
                                </span>
                                {data.length > 0 && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyAllData}
                                            className="text-[9px] font-black uppercase rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                        >
                                            {copiedAll ? (
                                                <Check
                                                    size={14}
                                                    className="mr-1"
                                                />
                                            ) : (
                                                <Copy
                                                    size={14}
                                                    className="mr-1"
                                                />
                                            )}
                                            {copiedAll
                                                ? "Copiados"
                                                : "Copiar Todos"}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                abrirModalWhatsApp("masivo")
                                            }
                                            className="text-[9px] font-black uppercase rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                        >
                                            <MessageCircle
                                                size={14}
                                                className="mr-1"
                                            />
                                            Enviar Todos por WhatsApp
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                }
            >
                <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-xl h-full">
                    {!tipo ? (
                        <div className="flex flex-col items-center justify-center h-full py-32">
                            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                                <Search size={40} className="text-slate-300" />
                            </div>
                            <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">
                                Seleccione un filtro para comenzar
                            </p>
                            <p className="text-[10px] text-slate-300 mt-1">
                                Elige una categoría especial para listar los
                                estudiantes
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center h-full py-32">
                            <Loader2
                                size={40}
                                className="animate-spin text-indigo-500"
                            />
                            <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">
                                Cargando datos...
                            </p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-32">
                            <Users size={40} className="text-slate-300" />
                            <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">
                                No hay estudiantes en esta categoría
                            </p>
                        </div>
                    ) : (
                        <div className="h-full overflow-auto custom-scrollbar">
                            <table className="w-full border-collapse select-text">
                                <thead className="sticky top-0 z-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-4 text-center w-12">
                                            #
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Nombres
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Cédula
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Fecha Nac.
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Edad
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Sección
                                        </th>
                                        <th className="px-4 py-4 text-center w-16">
                                            Copiar
                                        </th>
                                        <th className="px-4 py-4 text-center w-16">
                                            WhatsApp
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[15px]">
                                    {data.map((item, index) => (
                                        <tr
                                            key={item.id || index}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-4 py-3 text-center text-slate-400 font-bold">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {item.name || "-"}{" "}
                                                {item.apellido || "-"}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-600">
                                                {item.cedula || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600">
                                                {item.fecha_de_nacimiento
                                                    ? new Date(
                                                          item.fecha_de_nacimiento,
                                                      ).toLocaleDateString(
                                                          "es-ES",
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center font-black text-slate-700">
                                                {item.edad || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-indigo-600">
                                                {item.grado || "-"}{" "}
                                                {item.seccion || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() =>
                                                        copySingleRow(item)
                                                    }
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        copiedId === item.id
                                                            ? "bg-emerald-100 text-emerald-600"
                                                            : "hover:bg-indigo-50"
                                                    }`}
                                                    title="Copiar datos de este estudiante"
                                                >
                                                    {copiedId === item.id ? (
                                                        <Check
                                                            size={14}
                                                            className="text-emerald-500"
                                                        />
                                                    ) : (
                                                        <Copy
                                                            size={14}
                                                            className="text-indigo-400 hover:text-indigo-600"
                                                        />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() =>
                                                        abrirModalWhatsApp(
                                                            "individual",
                                                            item,
                                                        )
                                                    }
                                                    className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                                                    title="Enviar este estudiante por WhatsApp"
                                                >
                                                    <MessageCircle
                                                        size={14}
                                                        className="text-emerald-400 hover:text-emerald-600"
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </ViewContainer>

            {/* MODAL DE WHATSAPP */}
            {showWhatsAppModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-3xl">
                        {/* Header */}
                        <div className="bg-emerald-600 p-6 flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tight">
                                        Enviar por WhatsApp
                                    </h3>
                                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                                        {tipoEnvio === "masivo"
                                            ? `Enviando ${data.length} estudiantes`
                                            : `Enviando: ${estudianteParaEnviar?.name} ${estudianteParaEnviar?.apellido}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowWhatsAppModal(false);
                                    setEmpleadoSeleccionado(null);
                                }}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            {/* Tipo de reporte */}
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Reporte
                                </p>
                                <p className="font-bold text-slate-800">
                                    {getTipoLabel()}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {tipoEnvio === "masivo"
                                        ? `${data.length} estudiantes`
                                        : `1 estudiante seleccionado`}
                                </p>
                            </div>

                            {/* Buscar empleado */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Buscar empleado
                                </label>
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={searchEmpleado}
                                        onChange={(e) =>
                                            buscarEmpleados(e.target.value)
                                        }
                                        placeholder="Buscar por nombre, cargo o teléfono..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Lista de empleados */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {loadingEmpleados ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2
                                            size={24}
                                            className="animate-spin text-emerald-500"
                                        />
                                    </div>
                                ) : empleados.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <User
                                            size={32}
                                            className="mx-auto mb-2 opacity-30"
                                        />
                                        <p className="text-[10px] font-black uppercase tracking-widest">
                                            No se encontraron empleados con
                                            teléfono
                                        </p>
                                    </div>
                                ) : (
                                    empleados.map((emp) => (
                                        <div
                                            key={emp.id}
                                            onClick={() =>
                                                setEmpleadoSeleccionado(emp)
                                            }
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                empleadoSeleccionado?.id ===
                                                emp.id
                                                    ? "border-emerald-500 bg-emerald-50/50"
                                                    : "border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-800">
                                                        {emp.nombres}{" "}
                                                        {emp.apellidos}
                                                    </p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                                            {
                                                                emp.funcion_en_el_plantel
                                                            }
                                                        </span>
                                                        <Phone size={12} />
                                                        {emp.telefono}
                                                    </p>
                                                </div>
                                                {empleadoSeleccionado?.id ===
                                                    emp.id && (
                                                    <Check
                                                        size={20}
                                                        className="text-emerald-500"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-100 p-6 flex gap-4">
                            <button
                                onClick={() => {
                                    setShowWhatsAppModal(false);
                                    setEmpleadoSeleccionado(null);
                                }}
                                className="flex-1 py-3 bg-slate-100 rounded-xl font-black uppercase text-[10px] text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={enviarWhatsApp}
                                disabled={
                                    !empleadoSeleccionado || whatsappLoading
                                }
                                className="flex-1 py-3 bg-emerald-500 rounded-xl font-black uppercase text-[10px] text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {whatsappLoading ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Enviar Reporte
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
