import React, { useEffect, useMemo, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import Chart from "react-apexcharts";

import {
    LucideUsers,
    LucideUserCheck,
    LucideUserPlus,
    LucideUserX,
    LucidePieChart,
    LucideClock,
    LucideTrendingUp,
    LucideQrCode,
    LucideUtensils,
    LucidePackage,
    LucideHistory,
    LucideFileSpreadsheet,
    LucideSettings,
    LucideHelpCircle,
    LucideBell,
    LucideCalendar,
    LucideHome,
    LucideBarChart3,
    LucideClipboardList,
    LucideChevronRight,
    LucideHouse,
} from "lucide-react";
import { Button } from "@/Components/ui/Button";

export default function Dashboard({
    periodoEscolar = "N/A",
    activeStudentsCount = 0,
    retiredStudentsCount = 0,
    newStudentsCount = 0,
    matriculaInicial = 0,
    periodoStatus = "Cerrado",
    reporteGlobal = {
        hayReporte: false,
        estudiantes: { total: 0, varones: 0, hembras: 0 },
        personal: { total: 0, varones: 0, hembras: 0, desglose: [] },
        fecha: "",
    },
}) {
    const retentionRate = useMemo(() => {
        if (!matriculaInicial || matriculaInicial === 0) return 0;
        return ((activeStudentsCount / matriculaInicial) * 100).toFixed(1);
    }, [activeStudentsCount, matriculaInicial]);

    const chartOptions = {
        chart: {
            type: "donut",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            toolbar: { show: false },
        },
        labels: ["Activos", "Retirados", "Nuevos"],
        colors: ["#10b981", "#f43f5e", "#3b82f6"],
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total Inicial",
                            formatter: () => matriculaInicial,
                            fontSize: "10px",
                            fontWeight: "600",
                            color: "#334155",
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        legend: {
            show: true,
            position: "bottom",
            fontSize: "10px",
            markers: { radius: 8 },
            offsetY: 5,
        },
        stroke: { show: false },
    };

    const chartSeries = [
        Number(activeStudentsCount),
        Number(retiredStudentsCount),
        Number(newStudentsCount),
    ];

    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) =>
        date.toLocaleTimeString("en-US", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    const formatDate = (date) =>
        date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    // Mini links data
    const miniLinks = [
        { icon: LucideHome, label: "Inicio", route: "dashboard" },
        {
            icon: LucideUsers,
            label: "Estudiantes",
            route: "estudiantes.activos.index",
        },
        {
            icon: LucideUsers,
            label: "Empleados",
            route: "empleados.activos.index",
        },
        { icon: LucideUtensils, label: "Comedor", route: "comedor.index" },
        {
            icon: LucideHouse,
            label: "Institución",
            route: "settings.institucion.index",
        },
        {
            icon: LucideFileSpreadsheet,
            label: "Reportes",
            route: "comedor.index",
        },
        { icon: LucideCalendar, label: "Calendario", route: "comedor.index" },
        {
            icon: LucideSettings,
            label: "Sin Asignar",
            route: "comedor.index",
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <ViewContainer
                title="DASHBOARD"
                subtitle="Resumen ejecutivo y control de asistencia"
                showSearch={false}
            >
                <div className="h-full flex flex-col p-4 gap-4 overflow-auto bg-slate-50/30">
                    {/* Tarjetas de estadísticas - horizontales arriba */}
                    <div className="grid grid-cols-4 gap-3">
                        <StatCard
                            label="Matrícula Inicial"
                            value={matriculaInicial}
                            icon={<LucideUsers size={16} />}
                            gradient="from-indigo-50 to-indigo-100"
                            iconBg="bg-indigo-500"
                            textColor="text-indigo-900"
                            valueColor="text-indigo-700"
                        />
                        <StatCard
                            label="Activos"
                            value={activeStudentsCount}
                            icon={<LucideUserCheck size={16} />}
                            gradient="from-emerald-50 to-emerald-100"
                            iconBg="bg-emerald-500"
                            textColor="text-emerald-900"
                            valueColor="text-emerald-700"
                        />
                        <StatCard
                            label="Nuevos Ingresos"
                            value={newStudentsCount}
                            icon={<LucideUserPlus size={16} />}
                            gradient="from-blue-50 to-blue-100"
                            iconBg="bg-blue-500"
                            textColor="text-blue-900"
                            valueColor="text-blue-700"
                        />
                        <StatCard
                            label="Retiros"
                            value={retiredStudentsCount}
                            icon={<LucideUserX size={16} />}
                            gradient="from-rose-50 to-rose-100"
                            iconBg="bg-rose-500"
                            textColor="text-rose-900"
                            valueColor="text-rose-700"
                        />
                    </div>

                    {/* Layout de 3 columnas: Asistencias | Gráfico | Mini Links */}
                    <div className="flex gap-4 flex-1 min-h-0">
                        {/* PANEL IZQUIERDO: Asistencias - OCUPA TODA LA ALTURA */}
                        <div className="w-1/3 flex flex-col">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                    <LucideUsers
                                        size={16}
                                        className="text-indigo-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                       Resumen asistencias del día
                                    </span>
                                    <p className="text-sm font-mono font-bold text-slate-700">
                                        {formatDate(time)}
                                    </p>
                                </div>

                                {!reporteGlobal?.hayReporte ? (
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="p-4 bg-amber-100 rounded-full mb-3">
                                            <LucideClock
                                                className="text-amber-600"
                                                size={28}
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-amber-700 text-center">
                                            Esperando reporte del día
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {formatDate(time)}
                                        </p>
                                        <div className="px-4 py-1.5 bg-amber-100 rounded-full text-[11px] font-semibold text-amber-700 mt-3">
                                            Pendiente
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col">
                                        {/* Estudiantes */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    👩‍🎓 Estudiantes
                                                </span>
                                                <span className="text-2xl font-black text-slate-800">
                                                    {reporteGlobal.estudiantes
                                                        ?.total || 0}
                                                </span>
                                            </div>
                                            <div className="flex gap-6 mt-1.5">
                                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl">
                                                    <span className="text-sm">
                                                        👨
                                                    </span>
                                                    <span className="text-sm font-bold text-blue-600">
                                                        {reporteGlobal
                                                            .estudiantes
                                                            ?.varones || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-xl">
                                                    <span className="text-sm">
                                                        👩
                                                    </span>
                                                    <span className="text-sm font-bold text-pink-600">
                                                        {reporteGlobal
                                                            .estudiantes
                                                            ?.hembras || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Personal */}
                                        <div className="mb-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    👔 Personal
                                                </span>
                                                <span className="text-2xl font-black text-slate-800">
                                                    {reporteGlobal.personal
                                                        ?.total || 0}
                                                </span>
                                            </div>
                                            <div className="flex gap-6 mt-1.5">
                                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl">
                                                    <span className="text-sm">
                                                        👨
                                                    </span>
                                                    <span className="text-sm font-bold text-blue-600">
                                                        {reporteGlobal.personal
                                                            ?.varones || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-xl">
                                                    <span className="text-sm">
                                                        👩
                                                    </span>
                                                    <span className="text-sm font-bold text-pink-600">
                                                        {reporteGlobal.personal
                                                            ?.hembras || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desglose completo de personal */}
                                        {reporteGlobal.personal?.desglose &&
                                            reporteGlobal.personal.desglose
                                                .length > 0 && (
                                                <div className="mt-auto pt-3 border-t border-slate-100">
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                        Desglose por cargo
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                        {reporteGlobal.personal.desglose.map(
                                                            (cargo, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                                                                >
                                                                    <p className="text-[9px] font-medium text-slate-500 truncate">
                                                                        {
                                                                            cargo.tipo_de_personal
                                                                        }
                                                                    </p>
                                                                    <div className="flex gap-2 text-xs font-bold">
                                                                        <span className="text-blue-500">
                                                                            👨
                                                                            {cargo.varones ||
                                                                                0}
                                                                        </span>
                                                                        <span className="text-pink-500">
                                                                            👩
                                                                            {cargo.hembras ||
                                                                                0}
                                                                        </span>
                                                                        <span className="text-slate-400">
                                                                            (
                                                                            {cargo.total ||
                                                                                0}
                                                                            )
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PANEL CENTRAL: Gráfico Donut + Retención */}
                        <div className="w-1/3 flex flex-col gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <LucidePieChart
                                            size={14}
                                            className="text-indigo-500"
                                        />
                                        Composición
                                    </h3>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {periodoEscolar}
                                    </span>
                                </div>
                                <div className="flex justify-center">
                                    <Chart
                                        options={chartOptions}
                                        series={chartSeries}
                                        type="donut"
                                        height={180}
                                        width="100%"
                                    />
                                </div>
                            </div>

                            {/* Retención y Reloj */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 mb-1">
                                            📅 Periodo activo
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {periodoEscolar}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-center">
                                            <p className="text-[10px] font-medium text-slate-400">
                                                HORA
                                            </p>
                                            <p className="text-sm font-mono font-bold text-slate-700">
                                                {formatTime(time)}
                                            </p>
                                        </div>
                                        <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-center">
                                            <p className="text-[10px] font-medium text-slate-400">
                                                FECHA
                                            </p>
                                            <p className="text-sm font-mono font-bold text-slate-700">
                                                {formatDate(time)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                            <LucideTrendingUp
                                                size={12}
                                                className="text-emerald-500"
                                            />
                                            Tasa de retención
                                        </p>
                                        <span className="text-2xl font-black text-emerald-600">
                                            {retentionRate}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${retentionRate}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">
                                        {retentionRate >= 80
                                            ? "✅ Excelente nivel de permanencia"
                                            : retentionRate >= 60
                                              ? "⚠️ Retención moderada, revisar estrategias"
                                              : "📉 Por debajo del objetivo esperado"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PANEL DERECHO: Mini Links verticales */}
                        <div className="w-1/3">
                            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg p-4 h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                    <LucideChevronRight
                                        size={14}
                                        className="text-indigo-500"
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Accesos rápidos
                                    </span>
                                    <span className="ml-auto text-[8px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {miniLinks.length}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
                                    {miniLinks.map((link, index) => {
                                        const Icon = link.icon;
                                        return (
                                            <Link
                                                key={index}
                                                href={route(link.route)}
                                                className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all duration-200"
                                            >
                                                <Icon
                                                    size={15}
                                                    className="text-slate-500 group-hover:text-indigo-600 transition-colors flex-shrink-0"
                                                />
                                                <span className="text-[11px] font-medium text-slate-600 group-hover:text-indigo-700 transition-colors">
                                                    {link.label}
                                                </span>
                                                <LucideChevronRight
                                                    size={12}
                                                    className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors"
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}

const StatCard = ({
    label,
    value,
    icon,
    gradient,
    iconBg,
    textColor,
    valueColor,
}) => (
    <div
        className={`bg-gradient-to-br ${gradient} p-3 rounded-2xl shadow-sm border border-white/30 hover:shadow-md transition-all duration-200`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${iconBg} shadow-sm text-white`}>
                {icon}
            </div>
            <div>
                <p
                    className={`text-[11px] font-semibold uppercase tracking-wide ${textColor}`}
                >
                    {label}
                </p>
                <h4 className={`text-xl font-black ${valueColor}`}>{value}</h4>
            </div>
        </div>
    </div>
);
