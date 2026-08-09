import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { toast } from "sonner";
import {
    QrCode,
    ChevronLeftCircle,
    Edit3,
    Save,
    Plus,
    Search,
    X,
    PowerOff,
    DoorOpen,
    Power,
    Printer,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const normalizarTexto = (str) =>
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

export default function SeccionesIndex({ secciones, gradosDisponibles, docentes, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [qrModalData, setQrModalData] = useState(null);
    const [docenteSearch, setDocenteSearch] = useState("");
    const [showDocenteList, setShowDocenteList] = useState(false);

    // 1. Desestructuramos 'clearErrors'
    const { data, setData, post, reset, processing, errors, clearErrors } =
        useForm({
            id: null,
            nombre_del_grado: "",
            seccion: "",
            docente: "",
            limite_de_estudiantes: 40,
        });

    const opcionesSecciones = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "U"];

    const docentesFiltrados = useMemo(() => {
        const busqueda = normalizarTexto(docenteSearch);
        if (!busqueda) return [];
        return docentes.filter((doc) => normalizarTexto(doc).includes(busqueda));
    }, [docenteSearch, docentes]);

    // 2. Función para manejar cambios y limpiar errores al instante
    const handleFieldChange = (name, value) => {
        setData(name, value);
        if (errors[name]) clearErrors(name);
    };

    const openCreateModal = () => {
        setEditMode(false);
        reset();
        setDocenteSearch("");
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setData({ ...item });
        setDocenteSearch(item.docente);
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("settings.grados.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                //toast.success("OPERACIÓN EXITOSA", { description: "Aula gestionada correctamente." });
            },
            onError: () => {
                toast.error("ERROR DE VALIDACIÓN", { description: "Revise los campos marcados en rojo." });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Grados y Secciones" />
            <ViewContainer
                title="GRADOS Y SECCIONES"
                subtitle="Registro y actualización grados de la institución"
                icon="DoorOpen"
                onSearch={(val) =>
                    router.get(
                        route("settings.grados.index"),
                        { search: val },
                        { preserveState: true },
                    )
                }
                searchValue={filters?.search || ""}
                currentPage={secciones.current_page}
                totalPages={secciones.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("settings.grados.index"),
                        { page },
                        { preserveState: true },
                    )
                }
                actions={
                    <div className="flex gap-2">
                        <Link href={route("settings.index")}>
                            <Button>
                                <ChevronLeftCircle size={16} /> VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={openCreateModal}
                            variant="success"
                            size="sm"
                        >
                            <Plus size={16} /> NUEVA SECCIÓN
                        </Button>
                    </div>
                }
            >
                <div className="bg-white rounded-t-[1.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest italic">
                            <tr>
                                <th className="px-8 py-3">
                                    Identificación de Aula
                                </th>
                                <th className="px-8 py-3 text-center">QR</th>
                                <th className="px-8 py-3 text-center">
                                    Status
                                </th>
                                <th className="px-8 py-3 text-center">
                                    Máx. Estudiantes
                                </th>
                                <th className="px-8 py-3 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] font-bold text-slate-600 uppercase">
                            {secciones.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`border-b border-slate-50 transition-all ${item.status === "Inactivo" ? "opacity-40 grayscale bg-slate-50" : "hover:bg-blue-50/30"}`}
                                >
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-3 h-3 rounded-full shadow-lg ${item.status === "Activo" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                                            />
                                            <div>
                                                <p className="text-slate-950 font-black text-xs">
                                                    {item.nombre_del_grado} - "
                                                    {item.seccion}"
                                                </p>
                                                <p className="text-blue-600 italic tracking-tighter">
                                                    {item.docente}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <button
                                            onClick={() => setQrModalData(item)}
                                            className="p-2 text-emerald-500 hover:scale-125 transition-transform"
                                        >
                                            <QrCode size={18} />
                                        </button>
                                    </td>

                                    <td className="px-8 py-4 text-center">
                                        <p className="text-blue-600 italic tracking-tighter">
                                            {item.status}
                                        </p>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <p className="text-slate-950 font-black text-xs">
                                            {item.limite_de_estudiantes}
                                        </p>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(item)
                                                }
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            "settings.grados.toggle",
                                                            item.id,
                                                        ),
                                                    )
                                                }
                                                className={`p-2 rounded-lg transition-all ${item.status === "Activo" ? "bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"}`}
                                            >
                                                {item.status === "Activo" ? (
                                                    <PowerOff size={14} />
                                                ) : (
                                                    <Power size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {secciones.data.length === 0 && (
                        <div className="p-4 text-center flex flex-col items-center gap-4">
                            <ServerCog size={64} />
                            <p className="font-black text-rose-500 uppercase text-lg tracking-[0.3em]">
                                No hay registros
                            </p>
                        </div>
                    )}
                </div>
            </ViewContainer>

            {/* MODAL DE REGISTRO / EDICIÓN */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl border-4 border-white overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className={`p-8 flex justify-between items-center text-white ${editMode ? "bg-blue-600" : "bg-slate-900"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <DoorOpen size={24} />
                                    </div>
                                    <h3 className="font-black uppercase italic text-sm tracking-widest">
                                        {editMode
                                            ? "Actualizar Aula"
                                            : "Nueva Sección"}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="hover:rotate-90 transition-transform"
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-10 space-y-6"
                            >
                                {/* 3. Aplicamos validaciones en tiempo real */}
                                <SelectField
                                    label="Grado / Año Académico *"
                                    value={data.nombre_del_grado}
                                    options={gradosDisponibles}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "nombre_del_grado",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.nombre_del_grado}
                                    required
                                />
                                <SelectField
                                    label="Sección *"
                                    value={data.seccion}
                                    options={opcionesSecciones}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "seccion",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.seccion}
                                    required
                                />

                                <Field
                                    label="Límite de Estudiantes *"
                                    value={data.limite_de_estudiantes}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "limite_de_estudiantes",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    error={errors.limite_de_estudiantes}
                                    required
                                />  

                                <div className="relative">
                                    <label
                                        className={`text-[10px] font-black uppercase italic mb-1 block ${errors.docente ? "text-rose-500" : "text-gray-500"}`}
                                    >
                                        Docente Responsable *
                                    </label>
                                    <div className="relative group">
                                        <Search
                                            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.docente ? "text-rose-400" : "text-gray-400 group-focus-within:text-blue-500"}`}
                                            size={16}
                                        />
                                        <input
                                            type="search"
                                            placeholder="BUSCAR DOCENTE..."
                                            value={docenteSearch}
                                            onFocus={() =>
                                                setShowDocenteList(true)
                                            }
                                            onChange={(e) => {
                                                setDocenteSearch(
                                                    e.target.value,
                                                );
                                                setShowDocenteList(true);
                                                if (errors.docente)
                                                    clearErrors("docente"); // Limpia error al escribir
                                            }}
                                            className={`w-full bg-slate-50 border text-gray-700 rounded-2xl pl-11 pr-4 py-2 text-[11px] font-bold uppercase outline-none transition-all
                                                ${errors.docente ? "border-rose-500 ring-4 ring-rose-500/5" : "border-gray-300 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"}
                                            `}
                                        />
                                    </div>
                                    {errors.docente && (
                                        <p className="text-[9px] text-rose-500 font-black italic ml-2 mt-1 uppercase">
                                            {errors.docente}
                                        </p>
                                    )}

                                    <AnimatePresence>
                                        {showDocenteList &&
                                            docenteSearch.length > 1 && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute z-50 w-full mt-2 bg-white border border-slate-900 rounded-[1.5rem] shadow-2xl max-h-40 overflow-auto py-2"
                                                >
                                                    {docentesFiltrados.length >
                                                    0 ? (
                                                        docentesFiltrados.map(
                                                            (doc, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleFieldChange(
                                                                            "docente",
                                                                            doc,
                                                                        ); // Usa la función que limpia errores
                                                                        setDocenteSearch(
                                                                            doc,
                                                                        );
                                                                        setShowDocenteList(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className="w-full text-left px-5 py-3 text-[10px] text-gray-700 font-black uppercase hover:bg-blue-600 hover:text-white transition-colors"
                                                                >
                                                                    {doc}
                                                                </button>
                                                            ),
                                                        )
                                                    ) : (
                                                        <p className="px-5 py-3 text-[9px] text-slate-800 italic">
                                                            No hay resultados...
                                                        </p>
                                                    )}
                                                </motion.div>
                                            )}
                                    </AnimatePresence>
                                </div>

                                <Button
                                    type="submit"
                                    variant={editMode ? "primary" : "success"}
                                    size="xl"
                                    className="w-full h-16 rounded-[1.8rem] mt-4"
                                    loading={processing}
                                >
                                    <Save size={20} />{" "}
                                    {editMode
                                        ? "GUARDAR CAMBIOS"
                                        : "ACTIVAR SECCIÓN"}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL QR (Con lógica de impresión corregida) */}
            <AnimatePresence>
                {qrModalData && (
                    <div
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 print:bg-white print:p-0"
                        onClick={() => setQrModalData(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-4 border-white relative print:shadow-none print:border-none"
                        >
                            <button
                                onClick={() => setQrModalData(null)}
                                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 print:hidden"
                            >
                                <X size={24} />
                            </button>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 inline-block mb-6 print:border-none print:bg-white">
                                <QRCodeCanvas
                                    value={qrModalData.code_qr}
                                    size={220}
                                    level="H"
                                    includeMargin
                                />
                            </div>
                            <h3 className="font-black uppercase italic text-sm text-slate-900">
                                {qrModalData.nombre_del_grado} - "
                                {qrModalData.seccion}"
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase italic mb-8">
                                DOCENTE: {qrModalData.docente}
                            </p>
                            <Button
                                onClick={() => window.print()}
                                variant="primary"
                                className="w-full h-14 rounded-2xl print:hidden"
                            >
                                <Printer size={18} /> IMPRIMIR IDENTIFICADOR
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
