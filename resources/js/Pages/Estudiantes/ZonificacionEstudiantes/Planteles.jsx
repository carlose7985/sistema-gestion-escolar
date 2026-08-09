import React, { useState, useEffect, useCallback } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { createPortal } from "react-dom";
import { debounce } from "lodash";
import Swal from "sweetalert2";
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Loader2,
    School,
    ArrowLeftCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function GestionPlanteles({ planteles, filters }) {
    // --- ESTADOS ---
    const [search, setSearch] = useState(filters.search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false); // Estado para el spinner central
    // --- FORMULARIO INERTIA ---
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        nombre: "",
        director: "",
    });

    // --- BÚSQUEDA DEBOUNCE ---
    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.acciones.planteles.index"),
                { search: query },
                { preserveState: true, replace: true },
            );
        }, 400),
        [],
    );

    useEffect(() => {
        debouncedSearch(search);
    }, [search]);

    // --- MANEJADORES ---
    const openModal = (plantel = null) => {
        clearErrors();
        if (plantel) {
            setEditingId(plantel.id);
            setData({
                nombre: plantel.nombre,
                director: plantel.director || "",
            });
        } else {
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route("estudiantes.acciones.planteles.update", editingId), {
                onSuccess: () => {
                    closeModal();
                  //  toast.success("Plantel actualizado");
                },
            });
        } else {
            post(route("estudiantes.acciones.planteles.store"), {
                onSuccess: () => {
                    closeModal();
                   // toast.success("Plantel registrado");
                },
            });
        }
    };

   const confirmDelete = (plantel) => {
       Swal.fire({
           title: '<span class="text-slate-800 font-black uppercase tracking-tighter">¿Eliminar Plantel?</span>',
           html: `<p class="text-sm text-slate-500 font-medium">Confirme que desea borrar <b>${plantel.nombre}</b>. El sistema verificará si hay alumnos vinculados.</p>`,
           icon: "warning",
           showCancelButton: true,
           confirmButtonColor: "#ef4444",
           confirmButtonText: "SÍ, ELIMINAR",
           cancelButtonText: "CANCELAR",
           customClass: {
               popup: "rounded-[2rem] p-10 border-4 border-white shadow-2xl",
           },
       }).then((result) => {
           if (result.isConfirmed) {
               router.delete(
                   route("estudiantes.acciones.planteles.destroy", plantel.id),
                   {
                       onStart: () => setIsProcessing(true),
                       onFinish: () => setIsProcessing(false),
                       // No ponemos toast.success aquí porque si falla la validación en el controlador,
                       // Laravel enviará un 'error' y no un 'success'.
                       // El componente 'ViewContainer' o tu layout debe manejar los flash messages.
                   },
               );
           }
       });
   };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Planteles" />

            <ViewContainer
                title="GESTIÓN DE PLANTELES"
                subtitle="Administración de liceos y centros de educación media"
                icon="House"
                showSearch={true}
                searchValue={search}
                onSearch={setSearch}
                currentPage={planteles.current_page}
                totalPages={planteles.last_page}
                onPageChange={(p) =>
                    router.get(route("estudiantes.acciones.planteles.index"), {
                        ...filters,
                        page: p,
                    })
                }
                returns={
                    <Link
                        href={route("estudiantes.acciones.zonificacion.index")}
                    >
                        <Button>
                            <ArrowLeftCircle size={16} className="mr-2" />{" "}
                            VOLVER
                        </Button>
                    </Link>
                }
                actions={
                    <Button variant="success" onClick={() => openModal()}>
                        <Plus size={14} className="mr-2" /> NUEVO PLANTEL
                    </Button>
                }
            >
                {isProcessing && (
                    <div className="absolute inset-0 z-[100] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                        <div className="relative">
                            {/* Círculo Exterior Indigo */}
                            <Loader2
                                size={80}
                                className="animate-spin text-indigo-600"
                            />
                            {/* Círculo Interior Esmeralda girando al revés */}
                            <Loader2
                                size={40}
                                className="animate-spin text-emerald-500 absolute top-5 left-5"
                                style={{ animationDirection: "reverse" }}
                            />
                        </div>
                        <span className="mt-4 text-[11px] font-black uppercase text-indigo-600 tracking-[0.3em] animate-pulse">
                            Procesando datos...
                        </span>
                    </div>
                )}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl h-full flex flex-col">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-20 bg-slate-800 text-white text-[10px] uppercase font-black italic">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        Nombre del Plantel
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Director
                                    </th>

                                    <th className="px-6 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {planteles.data.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                                    <School size={16} />
                                                </div>
                                                <span className="font-black text-slate-800 uppercase text-[12px]">
                                                    {p.nombre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg text-[11px] border border-indigo-100">
                                                {p.director || "DESCONOCIDO"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openModal(p)}
                                                    className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        confirmDelete(p)
                                                    }
                                                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {planteles.data.length === 0 && (
                            <div className="py-32 text-center opacity-20 flex flex-col items-center">
                                <School size={64} className="mb-4" />
                                <span className="text-sm font-black uppercase tracking-widest">
                                    No se encontraron planteles
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </ViewContainer>

            {/* --- MODAL CRUD --- */}
            {isModalOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 border border-white">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                    {editingId
                                        ? "Actualizar Plantel"
                                        : "Registrar Plantel"}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <Field
                                        label="Nombre Completo del Plantel"
                                        autoFocus
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData(
                                                "nombre",
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        error={errors.nombre}
                                        required
                                    />

                                    <Field
                                        label="Nombre del Director "
                                        value={data.director}
                                        onChange={(e) =>
                                            setData("director", e.target.value)
                                        }
                                        error={errors.director}
                                        placeholder="DIRECTOR DEL CENTRO EDUCATIVO..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-colors"
                                    >
                                        CERRAR
                                    </button>
                                    <Button
                                        type="submit"
                                        loading={processing}
                                        className="flex-[2] py-8 bg-indigo-600 shadow-xl"
                                    >
                                        <Save size={18} className="mr-2" />{" "}
                                        {editingId ? "ACTUALIZAR" : "GUARDAR"}{" "}
                                        PLANTEL
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}
        </AuthenticatedLayout>
    );
}
