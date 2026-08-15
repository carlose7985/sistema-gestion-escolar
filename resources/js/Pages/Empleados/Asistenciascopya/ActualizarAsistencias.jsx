"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/Ui/Button";
import { Head, Link, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { debounce } from "lodash";
import dayjs from "dayjs/dayjs.min.js";
import es from "dayjs/locale/es";
import { motion, AnimatePresence } from "framer-motion";

dayjs.locale(es);

export default function ActualizarAsistencia({ empleados, filters }) {
    const [search, setSearch] = useState(filters?.search || "");
    const [month, setMonth] = useState(filters?.month || dayjs().format("MM"));
    const [year, setYear] = useState(filters?.year || dayjs().format("YYYY"));
    const [day, setDay] = useState(filters?.day || "");
    const [processingId, setProcessingId] = useState(null);
    const [isHistoricMode, setIsHistoricMode] = useState(false);

    const meses = [
        { v: "01", l: "Enero" },
        { v: "02", l: "Febrero" },
        { v: "03", l: "Marzo" },
        { v: "04", l: "Abril" },
        { v: "05", l: "Mayo" },
        { v: "06", l: "Junio" },
        { v: "07", l: "Julio" },
        { v: "08", l: "Agosto" },
        { v: "09", l: "Septiembre" },
        { v: "10", l: "Octubre" },
        { v: "11", l: "Noviembre" },
        { v: "12", l: "Diciembre" },
    ];

    const { recientes, historicos } = useMemo(() => {
        const actual = new Date().getFullYear();
        const recientes = [actual, actual - 1, actual - 2];
        const historicos = Array.from(
            { length: actual - 2020 - 2 },
            (_, i) => actual - 3 - i,
        );
        return { recientes, historicos };
    }, []);

    const updateFilters = useCallback(
        debounce((s, m, y, d) => {
            router.get(
                route("recursos.asistencia.empleados.edit"),
                {
                    search: s,
                    month: m,
                    year: y,
                    day: d || null, // Mantener el valor del día
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 500),
        [],
    );

    useEffect(() => {
        updateFilters(search, month, year, day);
    }, [search, month, year, day]);

    useEffect(() => {
        if (filters) {
            if (filters.month) setMonth(filters.month);
            if (filters.year) setYear(filters.year);
            if (filters.day) setDay(filters.day);
            if (filters.search) setSearch(filters.search);
        }
    }, [filters]);

    const handleQuickUpdate = (empleadoId, fecha, newStatus, asistId) => {
        setProcessingId(asistId);
        router.put(
            route("recursos.asistencia.empleados.update", empleadoId),
            { empleado_id: empleadoId, fecha, status: newStatus },
            { preserveScroll: true, onFinish: () => setProcessingId(null) },
        );
    };

    const empleadoActual =
        search && empleados?.data?.length > 0 ? empleados.data[0] : null;

    const stats = useMemo(() => {
        if (!empleadoActual?.asistencias)
            return { presentes: 0, faltas: 0, permisos: 0 };
        return {
            presentes: empleadoActual.asistencias.filter(
                (a) => a.status === "Asistio",
            ).length,
            faltas: empleadoActual.asistencias.filter(
                (a) => a.status === "Falto",
            ).length,
            permisos: empleadoActual.asistencias.filter(
                (a) => a.status === "Permiso",
            ).length,
        };
    }, [empleadoActual]);

    return (
        <AuthenticatedLayout>
            <Head title="Auditoría de Asistencia" />
            <ViewContainer
                title="VERIFICACIÓN Y ACTUALIZACIÓN"
                subtitle="Actualización por fecha de asistencia"
                icon="ShieldCheck"
                showSearch={true}
                searchValue={search}
                onSearch={(val) => setSearch(val)}
                placeholderSearch="Buscar por Cédula o Nombre..."
                currentPage={!search ? empleados.current_page : null}
                totalPages={!search ? empleados.last_page : null}
                onPageChange={
                    !search
                        ? (p) =>
                              router.get(
                                  route("recursos.asistencia.empleados.edit"),
                                  {
                                      page: p,
                                      month: month, // Usar el estado actual
                                      year: year, // Usar el estado actual
                                      day: day || null, // Usar el estado actual del día
                                  },
                                  {
                                      preserveState: true,
                                      replace: true,
                                      preserveScroll: true,
                                  },
                              )
                        : null
                }
                extraFilters={
                    <div className="flex gap-3 items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                        <label className="text-blue-600 text-sm">Mes</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="h-9 bg-white text-gray-700 border-none rounded-xl px-3 text-[10px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {meses.map((m) => (
                                <option key={m.v} value={m.v}>
                                    {m.l}
                                </option>
                            ))}
                        </select>
                        <label className="text-blue-600 text-sm">Día(s)</label>
                        <select
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="h-9 w-24 bg-white text-gray-700 border-none rounded-xl px-3 text-[10px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">TODOS</option>
                            {Array.from({ length: 31 }, (_, i) => {
                                const d = String(i + 1).padStart(2, "0");
                                return (
                                    <option key={d} value={d}>
                                        DÍA {d}
                                    </option>
                                );
                            })}
                        </select>
                        <label className="text-blue-600 text-sm">Año</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="h-9 bg-white text-gray-700 border-none rounded-xl w-20 px-3 text-[10px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {recientes.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                            {historicos.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                }
                actions={
                    <Link href={route("recursos.asistencia.empleados.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={16} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="h-full bg-white rounded-t-[1.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                    {empleadoActual && (
                        <div className="bg-gradient-to-r from-purple-800 to-slate-900 border-b border-slate-700 px-8 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl border-2 border-blue-400/20">
                                        <span className="text-xl font-black text-white">
                                            {empleadoActual.nombres?.charAt(0)}
                                            {empleadoActual.apellidos?.charAt(
                                                0,
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                            {empleadoActual.nombres}{" "}
                                            {empleadoActual.apellidos}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1 text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                                            <span>
                                                C.I: {empleadoActual.cedula}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                            <span>
                                                {
                                                    empleadoActual.tipo_de_personal
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <StatBadge
                                        label="ASISTENCIAS"
                                        value={stats.presentes}
                                        color="emerald"
                                        icon={<Icons.Check size={14} />}
                                    />
                                    <StatBadge
                                        label="FALTAS"
                                        value={stats.faltas}
                                        color="rose"
                                        icon={<Icons.X size={14} />}
                                    />
                                    <StatBadge
                                        label="PERMISOS"
                                        value={stats.permisos}
                                        color="amber"
                                        icon={<Icons.Clock size={14} />}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-blue-900 text-slate-50 font-black uppercase text-[9px] tracking-[0.2em] z-10 border-slate-700">
                                <tr>
                                    <th className="px-10 py-3">Fecha</th>
                                    <th className="px-10 py-3 text-center">
                                        Horario
                                    </th>
                                    <th className="px-10 py-3 text-center">
                                        Auditoría
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {empleadoActual &&
                                    empleadoActual.asistencias?.map((asist) => (
                                        <RowAsistencia
                                            key={asist.id}
                                            asist={asist}
                                            year={year}
                                            processingId={processingId}
                                            onUpdate={handleQuickUpdate}
                                            empleadoId={empleadoActual.id}
                                        />
                                    ))}

                                {!search &&
                                    empleados.data.map((emp) => (
                                        <RowEmpleado
                                            key={emp.id}
                                            emp={emp}
                                            onClick={() =>
                                                setSearch(emp.cedula)
                                            }
                                        />
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

// --- SUB-COMPONENTES CORE EDITION ---

const StatBadge = ({ label, value, color }) => {
    const colors = {
        emerald:
            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
        rose: "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5",
    };
    return (
        <div
            className={`px-6 py-3 rounded-2xl border-2 ${colors[color]} text-center shadow-lg`}
        >
            <p className="text-lg font-black leading-none italic">
                {value || 0}
            </p>
            <p className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-70">
                {label}
            </p>
        </div>
    );
};

const RowAsistencia = ({ asist, processingId, onUpdate, empleadoId }) => {
    const date = dayjs(asist.fecha);
    const isProcessing = processingId === asist.id;

    return (
        <tr className="hover:bg-blue-50/40 transition-all group">
            <td className="px-10 py-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:border-blue-200 transition-all">
                        <span className="text-sm font-black text-slate-900 leading-none italic">
                            {date.format("DD")} 
                        </span>
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">
                            {date.format("MMM")}
                        </span>
                    </div>
                    <div>
                        <p className="font-black text-slate-900 text-xs tracking-tight">
                            {date.format("dddd")}
                        </p>
                        <p className="text-[9px] text-slate-400 font-black uppercase italic tracking-widest">
                            Año Fiscal {date.format("YYYY")}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-10 py-2 text-center">
                <div className="inline-flex items-center gap-3 bg-slate-100 px-5 py-2 rounded-xl font-mono text-[11px] font-black text-slate-500">
                    {asist.hora_entrada || "--:--"}
                    <Icons.ArrowRight size={10} className="text-slate-300" />
                    {asist.hora_salida || "--:--"}
                </div>
            </td>
            <td className="px-10 py-2">
                <div className="flex justify-center gap-2 bg-slate-50 p-1 rounded-2xl w-fit mx-auto border border-slate-200/50">
                    <AuditoriaButton
                        titles="Asistio"
                        active={asist.status === "Asistio"}
                        color="emerald"
                        icon="Check"
                        onClick={() =>
                            onUpdate(
                                empleadoId,
                                asist.fecha,
                                "Asistio",
                                asist.id,
                            )
                        }
                        loading={isProcessing}
                    />
                    <AuditoriaButton
                        titles="Falto"
                        active={asist.status === "Falto"}
                        color="rose"
                        icon="X"
                        onClick={() =>
                            onUpdate(empleadoId, asist.fecha, "Falto", asist.id)
                        }
                        loading={isProcessing}
                    />
                    <AuditoriaButton
                        titles="Permiso"
                        active={asist.status === "Permiso"}
                        color="amber"
                        icon="Clock"
                        onClick={() =>
                            onUpdate(
                                empleadoId,
                                asist.fecha,
                                "Permiso",
                                asist.id,
                            )
                        }
                        loading={isProcessing}
                    />
                </div>
            </td>
        </tr>
    );
};

const AuditoriaButton = ({ active, color, icon, onClick, loading, titles }) => {
    const IconComp = Icons[icon];
    const colors = {
        emerald: active
            ? "bg-emerald-600 text-white shadow-emerald-600/40"
            : "text-slate-400 hover:bg-white hover:text-emerald-600",
        rose: active
            ? "bg-rose-600 text-white shadow-rose-600/40"
            : "text-slate-400 hover:bg-white hover:text-rose-600",
        amber: active
            ? "bg-amber-600 text-white shadow-amber-600/40"
            : "text-slate-400 hover:bg-white hover:text-amber-600",
    };
    return (
        <button
            onClick={onClick}
            disabled={loading}
            title={titles}
            className={`p-2.5 rounded-xl transition-all duration-300 ${colors[color]} ${active ? "shadow-xl scale-110" : "scale-100"}`}
        >
            {loading && active ? (
                <Icons.Loader2 size={16} className="animate-spin" />
            ) : (
                <IconComp size={16} strokeWidth={3} />
            )}
        </button>
    );
};

const RowEmpleado = ({ emp, onClick }) => (
    <tr
        onClick={onClick}
        className="hover:bg-blue-50/40 cursor-pointer transition-all group border-l-4 border-black hover:border-blue-600"
    >
        <td className="px-10 py-2">
            <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <Icons.UserCircle size={24} />
                </div>
                <div>
                    <p className="font-black text-slate-900 text-xs tracking-tight group-hover:text-blue-700">
                        {emp.nombres} {emp.apellidos}
                    </p>
                    <p className="text-[9px] text-slate-400 font-black italic tracking-widest uppercase">
                        {emp.cedula}
                    </p>
                </div>
            </div>
        </td>
        <td className="px-10 py-5 text-center">
            <div className="inline-flex items-center gap-3 bg-slate-100 px-5 py-2 rounded-xl font-mono text-[11px] font-black text-slate-500">
                <span>--:--</span>
                <Icons.ArrowRight size={10} className="text-slate-300" />
                <span>--:--</span>
            </div>
        </td>
        <td className="px-10 py-5 text-center">
            <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                <Icons.History size={14} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-900 italic uppercase">
                    {emp.asistencias_count} REGISTROS
                </span>
                <Icons.ChevronRight
                    size={16}
                    className="text-slate-200 group-hover:translate-x-1 group-hover:text-blue-600 transition-all"
                />
            </div>
        </td>
    </tr>
);
