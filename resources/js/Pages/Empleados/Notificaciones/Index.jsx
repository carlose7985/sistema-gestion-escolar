import React, { useState, useEffect, useCallback, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import { Head, Link, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { debounce } from "lodash";
import { toast } from "sonner";

export default function Index({ empleados, filters }) {
    // --- ESTADOS ---
    const [search, setSearch] = useState(filters.search || "");
    const [selectedMonth, setSelectedMonth] = useState(filters.month || "");
    const [selectedYear, setSelectedYear] = useState(
        filters.year || new Date().getFullYear().toString(),
    );

    // --- CONFIGURACIÓN DE DATOS ---
    const meses = [
        { id: "01", nombre: "Enero" },
        { id: "02", nombre: "Febrero" },
        { id: "03", nombre: "Marzo" },
        { id: "04", nombre: "Abril" },
        { id: "05", nombre: "Mayo" },
        { id: "06", nombre: "Junio" },
        { id: "07", nombre: "Julio" },
        { id: "08", nombre: "Agosto" },
        { id: "09", nombre: "Septiembre" },
        { id: "10", nombre: "Octubre" },
        { id: "11", nombre: "Noviembre" },
        { id: "12", nombre: "Diciembre" },
    ];

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) =>
            (currentYear - i).toString(),
        );
    }, []);

    // --- LÓGICA DE BÚSQUEDA ---
    const handleSearch = useCallback(
        debounce((val) => {
            router.get(
                route("empleados.activos.notificaciones.index"),
                {
                    search: val,
                    month: selectedMonth,
                    year: selectedYear,
                    page: 1,
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 400),
        [selectedMonth, selectedYear],
    );

    useEffect(() => {
        if (search !== filters.search) {
            handleSearch(search);
        }
    }, [search]);

    // --- MANEJADOR DE CAMBIO DE MES/AÑO ---
    const handleFilterChange = (type, value) => {
        if (type === "month") {
            setSelectedMonth(value);
        } else {
            setSelectedYear(value);
        }

        router.get(
            route("empleados.activos.notificaciones.index"),
            {
                search: search,
                month: type === "month" ? value : selectedMonth,
                year: type === "year" ? value : selectedYear,
                page: 1,
            },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    // --- MANEJADOR DE IMPRESIÓN ---
    const handlePrint = (empleadoId) => {
        if (!selectedMonth) {
            toast.warning(
                "Debe seleccionar un mes para procesar la notificación",
                {
                    position: "top-center",
                    duration: 4000,
                },
            );
            return;
        }

        const url = route("ExportDocumentosEmpleados", {
            empleadoId: empleadoId,
            type: "notificaciones",
            month: selectedMonth,
            year: selectedYear,
        });

        window.open(url, "_blank");
    };

    // --- MANEJADOR DE CAMBIO DE PÁGINA ---
    const handlePageChange = (page) => {
        router.get(
            route("empleados.activos.notificaciones.index"),
            {
                ...filters,
                page: page,
                month: selectedMonth,
                year: selectedYear,
                search: search,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notificaciones Administrativas" />

            <ViewContainer
                title="Notificaciones de Empleados"
                subtitle="Notificaciones por inasistencias"
                icon="Bell"
                showSearch={true}
                searchValue={search}
                onSearch={setSearch}
                placeholderSearch="Buscar por nombre, apellido o cédula..."
                currentPage={empleados.current_page}
                totalPages={empleados.last_page}
                onPageChange={handlePageChange}
                actions={
                    <Link href={route("empleados.activos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={16} /> Volver
                        </Button>
                    </Link>
                }
                extraFilters={
                    <div className="ml-auto flex items-center gap-3">
                        <div className="relative w-48 group">
                            <Icons.Calendar
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10 transition-transform group-hover:scale-110"
                            />
                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    handleFilterChange("month", e.target.value)
                                }
                                className="w-full pl-9 h-10 bg-white border-slate-300 border rounded-2xl text-[11px] font-bold uppercase appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700"
                            >
                                <option
                                    value=""
                                    className="text-slate-400 font-normal"
                                >
                                    Seleccionar Mes
                                </option>
                                {meses.map((m) => (
                                    <option
                                        key={m.id}
                                        value={m.id}
                                        className="text-slate-700 font-medium"
                                    >
                                        {m.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="relative w-32 group">
                            <Icons.CalendarX2
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 z-10 transition-transform group-hover:scale-110"
                            />
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    handleFilterChange("year", e.target.value)
                                }
                                className="w-full pl-9 h-10 bg-white border-slate-300 border rounded-2xl text-[11px] font-bold uppercase appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700"
                            >
                                {years.map((y) => (
                                    <option
                                        key={y}
                                        value={y}
                                        className="text-slate-700 font-medium"
                                    >
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
                footerStats={
                    <div className="flex items-center gap-4 text-[11px] font-black uppercase italic text-slate-500">
                        <span>
                            Registros en plantilla:{" "}
                            <b className="text-indigo-600">{empleados.total}</b>
                        </span>
                        <span className="w-px h-3 bg-slate-300"></span>
                        <span>
                            Año Fiscal:{" "}
                            <b className="text-slate-800">{selectedYear}</b>
                        </span>
                        {selectedMonth && (
                            <>
                                <span className="w-px h-3 bg-slate-300"></span>
                                <span>
                                    Mes:{" "}
                                    <b className="text-emerald-600">
                                        {
                                            meses.find(
                                                (m) => m.id === selectedMonth,
                                            )?.nombre
                                        }
                                    </b>
                                </span>
                            </>
                        )}
                    </div>
                }
            >
                <div className="h-full w-full overflow-hidden pt-2 relative">
                    {/* TABLA PRINCIPAL - SIN OVERLAY */}
                    <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-600 text-white uppercase text-[10px] font-black tracking-widest italic sticky top-0 z-10">
                                        <th className="px-8 py-5 text-left">
                                            Identificación
                                        </th>
                                        <th className="px-8 py-5 text-left">
                                            Datos del Personal
                                        </th>
                                        <th className="px-8 py-5 text-left">
                                            Cargo
                                        </th>
                                        <th className="px-8 py-5 text-center">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {empleados.data.length > 0 ? (
                                        empleados.data.map((emp) => (
                                            <tr
                                                key={emp.id}
                                                className="hover:bg-blue-50/40 transition-colors group"
                                            >
                                                <td className="px-8 py-4 font-mono font-bold text-slate-500 bg-slate-50/30">
                                                    <div className="flex items-center gap-3">
                                                        <Icons.IdCard
                                                            size={16}
                                                            className="text-indigo-400"
                                                        />
                                                        {emp.cedula}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                            <Icons.UserCircle
                                                                size={22}
                                                            />
                                                        </div>
                                                        <span className="font-black text-slate-800 uppercase tracking-tight">
                                                            {emp.nombres}{" "}
                                                            {emp.apellidos}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 uppercase">
                                                    <div className="flex items-center gap-3">
                                                        <Icons.Briefcase
                                                            size={16}
                                                            className="text-indigo-300"
                                                        />
                                                        <span className="font-bold text-slate-600">
                                                            {emp.tipo_de_personal ||
                                                                "Sin Cargo"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handlePrint(emp.id)
                                                        }
                                                        className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-[1.2rem] text-[10px] font-black uppercase transition-all shadow-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-100"
                                                    >
                                                        <Icons.Printer
                                                            size={16}
                                                        />
                                                        <span>
                                                            Generar Notificación
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-8 py-10 text-center text-slate-400 font-medium"
                                            >
                                                No se encontraron empleados que
                                                coincidan con la búsqueda
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
