import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Head, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";

export default function Show({ morosos, filters }) {
    const mes = filters?.month || new Date().getMonth() + 1;
    const año = filters?.year || new Date().getFullYear();

    // Array con nombres de meses
    const mesesNombres = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];

    const handlePrint = () => {
        const url = route("ExportDocumentosEmpleados", {
            type: "morosos-wifi",
            month: mes,
            year: año,
        });
        window.open(url, "_blank");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reporte de Morosidad" />

            <ViewContainer
                title="Análisis de Deuda WiFi"
                subtitle={`${mesesNombres[mes - 1]} ${año}`}
                icon="Wifi"
                showSearch={false}
                returns={
                    <Link
                        href={route("empleados.acciones.wifi.index")}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all shadow-md"
                    >
                        <Icons.ArrowLeft size={16} /> Volver
                    </Link>
                }
                actions={
                    morosos.length > 0 && (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                        >
                            <Icons.FileDown size={16} /> Imprimir PDF
                        </button>
                    )
                }
            >
                <div className="h-full w-full overflow-auto custom-scrollbar p-4 flex flex-col items-center">
                    <div className="w-full max-w-[850px] bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 my-8">
                        {/* Header del Reporte */}
                        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2 text-indigo-600">
                                    <Icons.Wifi size={24} strokeWidth={3} />
                                    <span className="text-sm font-black uppercase tracking-[0.2em]">
                                        Infraestructura de Red
                                    </span>
                                </div>
                                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                                    Reporte de <br /> Deudas Pendientes
                                </h2>
                            </div>
                            <div className="bg-slate-900 text-white p-6 rounded-[2rem] text-center min-w-[140px] shadow-xl shadow-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                                    Total Casos
                                </p>
                                <p className="text-3xl font-black leading-none">
                                    {morosos.length}
                                </p>
                            </div>
                        </div>

                        {/* Banner de Auditoría */}
                        <div className="mb-10 p-8 bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] flex gap-6 items-center">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 shrink-0">
                                <Icons.ShieldAlert size={36} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-rose-950 uppercase italic leading-none mb-1">
                                    Auditoría de Pagos Exigibles
                                </h3>
                                <p className="text-xs text-rose-700/70 font-bold uppercase leading-relaxed">
                                    Este listado detalla al personal con acceso
                                    a la red institucional que presenta saldos
                                    pendientes en los periodos operativos
                                    registrados.
                                </p>
                            </div>
                        </div>

                        {/* Tabla de Morosos */}
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50/50 border-y-2 border-slate-200">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-left">
                                    <th className="px-6 py-5 border-r border-slate-100">
                                        Información del Afiliado
                                    </th>
                                    <th className="px-6 py-5 border-r border-slate-100 text-center">
                                        Meses Pendientes
                                    </th>
                                    <th className="px-6 py-5">
                                        Desglose de Periodos
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px]">
                                {morosos.length > 0 ? (
                                    morosos.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors"
                                        >
                                            <td className="px-6 py-6 border-r border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                                        <Icons.UserCircle
                                                            size={24}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase leading-none mb-1.5">
                                                            {m.empleado}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-mono font-bold tracking-tight">
                                                            C.I: {m.cedula}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-r border-slate-100 text-center">
                                                <div className="inline-flex items-center gap-2 bg-rose-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black shadow-lg shadow-rose-100">
                                                    <Icons.AlertTriangle
                                                        size={12}
                                                    />
                                                    {m.cantidad_deuda} PERIODOS
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {m.meses_deuda.map(
                                                        (mes, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-xl text-[9px] font-black uppercase italic"
                                                            >
                                                                {mes}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="py-20 text-center"
                                        >
                                            <div className="flex flex-col items-center opacity-20">
                                                <Icons.CheckCircle2
                                                    size={64}
                                                    className="text-emerald-500 mb-4"
                                                />
                                                <p className="text-lg font-black uppercase tracking-widest">
                                                    No hay deudas activas
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Footer del Reporte */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center opacity-30 italic">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    Sistemas de Control Interno
                                </p>
                                <p className="text-[9px] font-bold text-indigo-600">
                                    INFRAESTRUCTURA DIGITAL PRO
                                </p>
                            </div>
                            <p className="text-[10px] font-mono font-bold">
                                Generado el: {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
