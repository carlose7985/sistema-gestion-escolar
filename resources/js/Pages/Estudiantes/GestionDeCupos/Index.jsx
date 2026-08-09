"use client";
import React, { useState, useEffect, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/Ui/Button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { debounce } from "lodash";

export default function Index({
    datos,
    grados,
    periodo_actual,
    gradosConCupos,
    periodo_proximo,
    filters,
}) {
    const [search, setSearch] = useState(filters?.search || "");
    const [editMode, setEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, put, reset, processing, errors, clearErrors } =
        useForm({
            name: "",
            sexo: "",
            documento: "V-",
            cedula: "",
            grado_id: "", // Ahora manejamos ID
            institucion_procedencia: "",
            ciudad_procedencia: "",
            periodo_escolar: periodo_actual,
            status: "Pendiente",
        });

    // --- BUSCADOR ---
    const updateSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.registro.asignacion.cupo.index"),
                { search: query },
                { preserveState: true, replace: true },
            );
        }, 300),
        [],
    );

    useEffect(() => {
        updateSearch(search);
    }, [search]);

    // --- CAMBIO DE STATUS RÁPIDO ---
    const toggleStatus = (id, currentStatus) => {
        const statuses = ["Pendiente", "Inscrito", "Vencido"];
        const nextIndex =
            (statuses.indexOf(currentStatus) + 1) % statuses.length;

        router.patch(
            route("estudiantes.registro.asignacion.cupo.status", id),
            {
                status: statuses[nextIndex],
            },
            { preserveScroll: true },
        );
    };

    const handleEdit = (item) => {
        setEditMode(item);
        setData({
            name: item.name,
            sexo: item.sexo,
            documento: item.documento,
            cedula: item.cedula,
            grado_id: item.grado_id, // Usamos ID
            institucion_procedencia: item.institucion_procedencia,
            ciudad_procedencia: item.ciudad_procedencia,
            periodo_escolar: item.periodo_escolar,
            status: item.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = editMode
            ? route("estudiantes.registro.asignacion.cupo.update", editMode.id)
            : route("estudiantes.registro.asignacion.cupo.store");

        const method = editMode ? put : post;
        method(action, { onSuccess: () => setIsModalOpen(false) });
    };

    const handlePrint = (id) => {
        window.open(
            route("estudiantesExport", {
                studentId: id,
                type: "gestion-de-cupo",
            }),
            "_blank",
        );
    };

    // Componente para mostrar la tablita de cupos disponibles (TODOS los grados)
    const MiniTablaCupos = ({ gradosConCupos }) => {
        if (!gradosConCupos || gradosConCupos.length === 0) {
            return (
                <div className="text-center py-6 bg-white rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] font-bold uppercase">
                        No hay datos de cupos disponibles
                    </div>
                </div>
            );
        }

        // Calcular totales
        const totales = gradosConCupos.reduce(
            (acc, g) => ({
                limite: acc.limite + g.limite,
                ocupados: acc.ocupados + g.ocupados,
                pendientes: acc.pendientes + g.pendientes,
                disponibles: acc.disponibles + g.disponibles,
            }),
            { limite: 0, ocupados: 0, pendientes: 0, disponibles: 0 },
        );

        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">
                            📊 Cupos Disponibles por Grado
                        </span>
                        <span className="bg-white/20 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                            {gradosConCupos.filter((g) => g.tiene_cupo).length}{" "}
                            con cupo
                        </span>
                    </div>
                    <span className="text-white/60 text-[8px] font-bold">
                        Total grados: {gradosConCupos.length}
                    </span>
                </div>
                <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
                    <table className="w-full text-[10px]">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr className="text-slate-400 font-black uppercase">
                                <th className="px-3 py-2 text-left">
                                    Grado / Sección
                                </th>
                                <th className="px-2 py-2 text-center">
                                    Límite
                                </th>
                                <th className="px-2 py-2 text-center">
                                    Ocupados
                                </th>
                                <th className="px-2 py-2 text-center">
                                    Pendientes
                                </th>
                                <th className="px-3 py-2 text-right">
                                    Disponibles
                                </th>
                                <th className="px-2 py-2 text-center">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {gradosConCupos.map((grado) => (
                                <tr
                                    key={grado.id}
                                    className={`transition-colors ${
                                        grado.tiene_cupo
                                            ? "hover:bg-emerald-50/50"
                                            : "hover:bg-rose-50/50 bg-slate-50/30"
                                    }`}
                                >
                                    <td className="px-3 py-2.5 font-black text-slate-700 uppercase">
                                        {grado.nombre_del_grado} -{" "}
                                        {grado.seccion}
                                    </td>
                                    <td className="px-2 py-2.5 text-center font-bold text-slate-400">
                                        {grado.limite}
                                    </td>
                                    <td className="px-2 py-2.5 text-center font-bold text-amber-600">
                                        {grado.ocupados}
                                    </td>
                                    <td className="px-2 py-2.5 text-center font-bold text-blue-500">
                                        {grado.pendientes}
                                    </td>
                                    <td
                                        className={`px-3 py-2.5 text-right font-black text-[12px] ${
                                            grado.tiene_cupo
                                                ? "text-emerald-600"
                                                : "text-rose-500"
                                        }`}
                                    >
                                        {grado.disponibles}
                                    </td>
                                    <td className="px-2 py-2.5 text-center">
                                        {grado.tiene_cupo ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[8px] font-black uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Disponible
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-[8px] font-black uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                Sin Cupo
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-100 sticky bottom-0">
                            <tr>
                                <td className="px-3 py-2.5 font-black text-slate-700 uppercase text-[9px]">
                                    TOTALES
                                </td>
                                <td className="px-2 py-2.5 text-center font-black text-slate-700">
                                    {totales.limite}
                                </td>
                                <td className="px-2 py-2.5 text-center font-black text-amber-700">
                                    {totales.ocupados}
                                </td>
                                <td className="px-2 py-2.5 text-center font-black text-blue-700">
                                    {totales.pendientes}
                                </td>
                                <td className="px-3 py-2.5 text-right font-black text-[12px] text-emerald-700">
                                    {totales.disponibles}
                                </td>
                                <td className="px-2 py-2.5 text-center">
                                    <span className="text-[8px] font-black text-slate-400 uppercase">
                                        {
                                            gradosConCupos.filter(
                                                (g) => g.tiene_cupo,
                                            ).length
                                        }{" "}
                                        / {gradosConCupos.length}
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Cupos" />
            <ViewContainer
                title="Gestión de Cupos"
                searchValue={search}
                onSearch={setSearch}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                actions={
                    <Button
                        variant="success"
                        onClick={() => {
                            reset();
                            setIsModalOpen(true);
                            setEditMode(false);
                        }}
                    >
                        <Icons.Plus size={16} /> ASIGNAR CUPO
                    </Button>
                }
            
                 returns={
                    <Link href={route("estudiantes.registro.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={18} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <table className="w-full text-left select-text">
                        <thead className="bg-slate-950 text-white text-[10px] uppercase italic">
                            <tr>
                                <th className="px-6 py-4">Estudiante</th>
                                <th className="px-6 py-4">Grado / Periodo</th>
                                <th className="px-6 py-4 text-center">
                                    Estatus
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] divide-y divide-slate-100">
                            {datos.data.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-black text-[16px] text-slate-900">
                                            {item.name}
                                        </p>
                                        <p className="text-blue-900 text-[14px] font-mono font-bold">
                                            {item.documento}
                                            {item.cedula}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-mono font-bold text-slate-900">
                                            {item.grado?.nombre_del_grado} -{" "}
                                            {item.grado?.seccion}
                                        </p>
                                        <p className="text-slate-400 text-[14px] font-mono font-bold">
                                            P.E: {item.periodo_escolar}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* SWITCH DE STATUS */}
                                        <button
                                            onClick={() =>
                                                toggleStatus(
                                                    item.id,
                                                    item.status,
                                                )
                                            }
                                            className={`px-3 py-1 rounded-full font-black text-[9px] uppercase transition-all ${
                                                item.status === "Inscrito"
                                                    ? "bg-emerald-100 text-emerald-600"
                                                    : item.status === "Vencido"
                                                      ? "bg-rose-100 text-rose-600"
                                                      : "bg-amber-100 text-amber-600"
                                            }`}
                                        >
                                            {item.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handlePrint(item.id)}
                                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                            title="Imprimir Comprobante"
                                        >
                                            <Icons.Printer size={15} />
                                        </button>
                                        <button
                                            title="Editar Registro"
                                            onClick={() => handleEdit(item)}
                                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Icons.Edit3 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ViewContainer>

            {/* MODAL DE GESTIÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="bg-slate-950 p-6 text-white flex justify-between">
                            <h3 className="font-black uppercase italic">
                                {editMode ? "Editar Cupo" : "Nuevo Cupo"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}>
                                <Icons.X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <Field
                                label="Nombre Completo del Estudiante *"
                                name="name"
                                autoFocus
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                                autoAcentos
                                autoTitleCase
                                error={errors.name}
                                placeholder="EJ: Jose Ramos"
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <SelectField
                                    label="Doc."
                                    name="documento"
                                    value={data.documento}
                                    options={["V-", "E-", "P-"]}
                                    onChange={(e) =>
                                        setData("documento", e.target.value)
                                    }
                                />

                                <Field
                                    label="Cédula / C.E *"
                                    name="cedula"
                                    value={data.cedula}
                                    mask="00000000000"
                                    onChange={(e) =>
                                        setData(
                                            "cedula",
                                            e.target.value.replace(/\D/g, ""),
                                        )
                                    }
                                    required
                                    placeholder="00000000000"
                                    error={errors.cedula}
                                />

                                <SelectField
                                    label="Género"
                                    value={data.sexo}
                                    options={[
                                        { v: "M", l: "Masculino" },
                                        { v: "F", l: "Femenino" },
                                    ]}
                                    onChange={(e) =>
                                        setData("sexo", e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <SelectField
                                    label="Grado *"
                                    value={data.grado_id}
                                    options={grados.map((g) => {
                                        // Buscar el cupo disponible para este grado
                                        const cupo = gradosConCupos?.find(
                                            (c) => c.id === g.id,
                                        );
                                        const tieneCupo =
                                            cupo?.tiene_cupo ?? false;
                                        const disponibles =
                                            cupo?.disponibles ?? 0;

                                        return {
                                            v: g.id,
                                            l: `${g.nombre_del_grado} - ${g.seccion} ${tieneCupo ? `----->✅ (${disponibles} cupos)` : "----->🔴 Sin cupo"}`,
                                            disabled: !tieneCupo, // 🔥 Deshabilitar si no tiene cupo
                                        };
                                    })}
                                    onChange={(e) =>
                                        setData("grado_id", e.target.value)
                                    }
                                    error={errors.grado_id}
                                />
                                
                                <SelectField
                                    label="Período Escolar"
                                    value={data.periodo_escolar}
                                    options={[periodo_actual, periodo_proximo]}
                                    onChange={(e) =>
                                        setData(
                                            "periodo_escolar",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field
                                    label="Institución Procedencia"
                                    value={data.institucion_procedencia}
                                    onChange={(e) =>
                                        setData(
                                            "institucion_procedencia",
                                            e.target.value,
                                        )
                                    }
                                />
                                <Field
                                    label="Ciudad"
                                    value={data.ciudad_procedencia}
                                    onChange={(e) =>
                                        setData(
                                            "ciudad_procedencia",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="flex justify-center pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                >
                                    GUARDAR REGISTRO
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
