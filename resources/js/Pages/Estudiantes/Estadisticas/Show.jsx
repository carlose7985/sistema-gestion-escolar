import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react"; // Corregida importación de router
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
    BarChart3,
    CalendarDays,
    Edit,
    X,
    Info,
    Search,
    ChevronLeftCircle,
} from "lucide-react";
import { toast } from "sonner";

dayjs.locale("es");

export default function History({ datos }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const form = useForm({
        fecha: "",
        dias_habiles: 0,
        dias_laborados: 0,
    });

    // --- FUNCIONES DE FORMATEO ---
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = dayjs(dateString);
        return `${date.format("DD-MM-YYYY")} - ${date.format("MMMM").toUpperCase()}`;
    };

    // --- MANEJADORES DEL MODAL (CORREGIDOS) ---
    const openEditModal = (item) => {
        setSelectedId(item.id);
        form.setData({
            fecha: dayjs(item.fecha).format("YYYY-MM-DD"),
            dias_habiles: item.dias_habiles,
            dias_laborados: item.dias_laborados,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedId(null);
        form.reset();
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (form.data.dias_laborados > form.data.dias_habiles) {
            return toast.error(
                "Días laborados no pueden exceder a los hábiles",
            );
        }

        form.put(route("estudiantes.acciones.estadisticas.update", selectedId), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
               // toast.success("Historial actualizado correctamente");
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Historial de Estadísticas" />
            <ViewContainer
                title="HISTORIAL ESTADÍSTICO"
                subtitle="Consulta y corrección de cierres mensuales previos"
                icon="BarChart3"
                showSearch={false}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={(p) =>
                    router.get(
                        route("estadistica-estudiantes.show", 0),
                        {
                            page: p,
                        },
                        { preserveState: true, preserveScroll: true },
                    )
                }
                returns={
                    <Link href={route("estudiantes.acciones.estadisticas.index")}>
                        <Button>
                            <ChevronLeftCircle size={16} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="h-full bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-20 bg-blue-600 text-white uppercase text-[10px] font-black italic tracking-widest">
                                <tr>
                                    <th className="px-8 py-5 text-center w-16 border-r border-blue-500">
                                        #
                                    </th>
                                    <th className="px-8 py-5 text-left border-r border-blue-500">
                                        Mes de Referencia
                                    </th>
                                    <th className="px-8 py-5 text-center border-r border-blue-500">
                                        Hábiles
                                    </th>
                                    <th className="px-8 py-5 text-center border-r border-blue-500">
                                        Laborados
                                    </th>
                                    <th className="px-8 py-5 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                {datos.data.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-blue-50/40 transition-colors"
                                    >
                                        <td className="px-8 py-4 text-center font-black text-slate-300">
                                            {(datos.current_page - 1) *
                                                datos.per_page +
                                                index +
                                                1}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-blue-600 flex items-center justify-center shadow-inner">
                                                    <CalendarDays size={20} />
                                                </div>
                                                <span className="font-black text-slate-800 uppercase">
                                                    {formatDate(item.fecha)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-black border border-indigo-100">
                                                {item.dias_habiles} Días
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-black border border-emerald-100">
                                                {item.dias_laborados} Días
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <button
                                                onClick={() =>
                                                    openEditModal(item)
                                                }
                                                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {datos.data.length === 0 && (
                            <div className="py-32 text-center opacity-20">
                                <Search size={64} className="mx-auto mb-4" />
                                <span className="text-sm font-black uppercase">
                                    Sin registros históricos
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL EDITAR */}
                {isModalOpen &&
                    createPortal(
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-3xl border-2 border-indigo-100 relative animate-in zoom-in-95 text-center">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <X size={28} />
                                </button>
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <BarChart3 size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic mb-8">
                                    Corregir Dias Cierre
                                </h3>
                                <form
                                    onSubmit={submitForm}
                                    className="space-y-6 text-left"
                                >
                                    <Field
                                        label="Referencia del Mes"
                                        type="date"
                                        value={form.data.fecha}
                                        readOnly
                                        className="bg-slate-50 opacity-60 font-black cursor-not-allowed"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            label="Días Hábiles"
                                            type="number"
                                            value={form.data.dias_habiles}
                                            onChange={(e) =>
                                                form.setData(
                                                    "dias_habiles",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <Field
                                            label="Días Laborados"
                                            type="number"
                                            value={form.data.dias_laborados}
                                            onChange={(e) =>
                                                form.setData(
                                                    "dias_laborados",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                        <Info
                                            className="text-blue-500 shrink-0"
                                            size={18}
                                        />
                                        <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed">
                                            Nota: Los días laborados no pueden
                                            exceder los hábiles (
                                            {form.data.dias_habiles}).
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        loading={form.processing}
                                        className="w-full h-16 bg-indigo-600 rounded-[1.5rem] font-black shadow-xl"
                                    >
                                        GUARDAR CAMBIOS
                                    </Button>
                                </form>
                            </div>
                        </div>,
                        document.body,
                    )}
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
