// resources/js/Pages/Estudiantes/NoCedulados/Index.jsx

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
    IdCard,
    Calendar,
    GraduationCap,
    Check,
    CheckCircle2,
    UserCheck,
    UserX,
    Share2,
    Printer,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function EstudiantesNoCedulados() {
    // --- ESTADOS ---
    const [search, setSearch] = useState("");
    const [grado, setGrado] = useState("");
    const [data, setData] = useState([]);
    const [grados, setGrados] = useState([]);
    const [totals, setTotals] = useState({ total: 0, m: 0, f: 0 });
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [updating, setUpdating] = useState(false);
    const isTyping = useRef(false);

    // --- CARGAR DATOS ---
    const fetchData = useCallback(
        debounce(async (searchQuery, gradoId) => {
            setLoading(true);
            try {
                const response = await axios.get(
                    route("estudiantes.acciones.no.cedulados.data"),
                    {
                        params: {
                            search: searchQuery || "",
                            grado: gradoId || "",
                        },
                    },
                );
                setData(response.data.data || []);
                setTotals(response.data.totals || { total: 0, m: 0, f: 0 });
                setGrados(response.data.grados || []);
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        }, 500),
        [],
    );

    useEffect(() => {
        fetchData(search, grado);
        return () => fetchData.cancel?.();
    }, [search, grado]);

    // --- MANEJADORES ---
    const onSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (val === "") isTyping.current = false;
    };

    const onGradoChange = (e) => {
        setGrado(e.target.value);
    };

    // --- SELECCIÓN ---
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const selectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map((item) => item.id));
        }
    };

    // --- ACTUALIZAR A CEDULADO ---
    const updateCedulado = () => {
        if (selectedIds.length === 0) {
            return toast.warning("Seleccione al menos un estudiante.");
        }

        Swal.fire({
            title: '<span class="text-slate-800 font-black uppercase italic">¿Confirmar actualización?</span>',
            html: `
                <div class="text-left text-sm p-2">
                    <p class="font-medium text-slate-500 mb-4">
                        Se marcarán como <span class="font-black text-emerald-600">CEDULADOS</span> 
                        <span class="font-black text-indigo-600">${selectedIds.length}</span> estudiante(s).
                    </p>
                    <div class="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4">
                        <p class="text-[10px] font-black uppercase text-emerald-700 mb-1">✅ Acción positiva</p>
                        <p class="text-xs font-bold text-slate-600">
                            Los estudiantes seleccionados serán marcados como cedulados.
                        </p>
                    </div>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "SÍ, ACTUALIZAR",
            cancelButtonText: "CANCELAR",
            confirmButtonColor: "#10b981",
            customClass: {
                popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                confirmButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] tracking-widest",
                cancelButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] tracking-widest",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setUpdating(true);
                axios
                    .patch(route("estudiantes.acciones.no.cedulados.update"), {
                        ids: selectedIds,
                    })
                    .then(() => {
                        toast.success(
                            `${selectedIds.length} estudiante(s) actualizado(s) a CEDULADO`,
                        );
                        setSelectedIds([]);
                        fetchData(search, grado);
                    })
                    .catch((error) => {
                        toast.error("Error al actualizar");
                        console.error(error);
                    })
                    .finally(() => {
                        setUpdating(false);
                    });
            }
        });
    };

    // 1. Función simple para abrir el PDF en otra pestaña
    const handlePrint = () => {
        // Construimos la URL con los parámetros actuales de búsqueda y grado
        const url = route("estudiantes.acciones.no.cedulados.pdf", {
            search: search,
            grado: grado,
        });

        window.open(url, "_blank");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Estudiantes No Cedulados" />

            <ViewContainer
                title="ESTUDIANTES NO CEDULADOS"
                subtitle="Listado de estudiantes de 5to y 6to grado sin cédula"
                icon="IdCard"
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
                        <div className="relative flex-1">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={onSearchChange}
                                placeholder="Buscar por nombre, apellido o cédula..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="w-56">
                            <SelectField
                                value={grado}
                                onChange={onGradoChange}
                                optionSelecName="TODOS LOS GRADOS"
                                options={grados.map((g) => ({
                                    v: g.id,
                                    l: `${g.nombre_del_grado} - ${g.seccion}`,
                                }))}
                            />
                        </div>
                        {selectedIds.length > 0 && (
                            <Button
                                onClick={updateCedulado}
                                disabled={updating}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100"
                            >
                                {updating ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin mr-2"
                                    />
                                ) : (
                                    <Check size={16} className="mr-2" />
                                )}
                                MARCAR CEDULADOS ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <Button
                            onClick={handlePrint}
                            disabled={data.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase shadow-lg"
                        >
                            <Printer size={16} className="mr-2" />
                            IMPRIMIR PDF
                        </Button>
                    </div>
                }
                actionFooter={
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase text-slate-500">
                        <span>
                            Total:{" "}
                            <b className="text-slate-900">{totals.total}</b>
                        </span>
                        <span className="text-blue-500">M: {totals.m}</span>
                        <span className="text-pink-500">F: {totals.f}</span>
                    </div>
                }
            >
                <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-xl h-full">
                    {loading ? (
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
                            <IdCard size={40} className="text-slate-300" />
                            <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">
                                No hay estudiantes sin cédula en 5to o 6to grado
                            </p>
                            <p className="text-[10px] text-slate-300 mt-1">
                                Todos los estudiantes ya están cedulados
                            </p>
                        </div>
                    ) : (
                        <div className="h-full overflow-auto custom-scrollbar">
                            <table className="w-full border-collapse select-text">
                                <thead className="sticky top-0 z-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-4 text-center w-12">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedIds.length ===
                                                        data.length &&
                                                    data.length > 0
                                                }
                                                onChange={selectAll}
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Nombres
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Apellidos
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Documento
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Cédula
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Fecha Nac.
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Edad
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Grado
                                        </th>
                                        <th className="px-4 py-4 text-center">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        item.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelect(item.id)
                                                    }
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {item.name || "-"}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {item.apellido || "-"}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-600">
                                                {item.documento || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-amber-600">
                                                {item.cedula || "SIN CÉDULA"}
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
                                                {item.seccion || ""}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">
                                                    <UserX
                                                        size={12}
                                                        className="inline mr-1"
                                                    />
                                                    No Cedulado
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
