import React from "react";
import { Head } from "@inertiajs/react";
import { Printer, X } from "lucide-react";
import { Button } from "@/Components/ui/button";
import dayjs from "dayjs";

export default function ReporteCaja({
    institucion,
    accion,
    pagos,
    totalRecaudado,
    fechaReporte,
}) {
    return (
        <div className="min-h-screen bg-slate-800 py-6 print:bg-white print:py-0 font-sans text-black">
            <Head title={`Reporte_${accion.nombre}`} />

            {/* BOTONES DE CONTROL */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-md flex items-center justify-center gap-4 z-50 print:hidden shadow-2xl">
                <Button
                    variant="ghost"
                    onClick={() => window.close()}
                    className="text-slate-400"
                >
                    <X size={18} /> CERRAR
                </Button>
                <Button
                    onClick={() => window.print()}
                    className="bg-indigo-600 text-white px-10 font-black rounded-full shadow-lg"
                >
                    <Printer size={18} className="mr-2" /> IMPRIMIR REPORTE
                </Button>
            </div>

            <div className="flex justify-center mt-14 print:mt-0">
                {/* CONTENEDOR TAMAÑO CARTA HORIZONTAL */}
                <div className="bg-white w-[279.4mm] min-h-[215.9mm] p-[10mm] shadow-2xl print:shadow-none relative">
                    {/* ENCABEZADO INSTITUCIONAL */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                        <div>
                            <h2 className="text-xl font-black uppercase leading-none">
                                {institucion?.nombre_de_la_institucion ||
                                    "SISTEMA ESCOLAR"}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                                Reporte de Recaudación Administrativa
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase">
                                Fecha de Cierre:{" "}
                                {dayjs(fechaReporte).format("DD/MM/YYYY")}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                Hora: {dayjs(fechaReporte).format("hh:mm A")}
                            </p>
                        </div>
                    </div>

                    {/* TÍTULO DEL COBRO */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black uppercase tracking-widest underline decoration-double">
                            {accion.nombre}
                        </h1>
                        <div className="flex justify-center gap-10 mt-2">
                            <p className="text-xs font-bold uppercase">
                                Status:{" "}
                                <span className="text-emerald-600">
                                    Finalizado
                                </span>
                            </p>
                            <p className="text-xs font-bold uppercase">
                                Costo Base: ${accion.costo_base}
                            </p>
                        </div>
                    </div>

                    {/* TABLA DE REGISTROS */}
                    <table className="w-full border-collapse border-2 border-black">
                        <thead>
                            <tr className="bg-slate-100 text-[10px] font-black uppercase">
                                <th className="border border-black px-2 py-2 w-8">
                                    #
                                </th>
                                <th className="border border-black px-3 py-2 text-left">
                                    Nombres y Apellidos
                                </th>
                                <th className="border border-black px-3 py-2">
                                    Cédula
                                </th>
                                <th className="border border-black px-3 py-2">
                                    Fecha Pago
                                </th>
                                <th className="border border-black px-3 py-2">
                                    Método
                                </th>
                                <th className="border border-black px-3 py-2">
                                    Referencia
                                </th>
                                <th className="border border-black px-3 py-2 text-right">
                                    Monto
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px] uppercase">
                            {pagos.map((pago, index) => (
                                <tr key={pago.id} className="hover:bg-slate-50">
                                    <td className="border border-black text-center py-2">
                                        {index + 1}
                                    </td>
                                    <td className="border border-black px-3 py-2 font-bold">
                                        {pago.empleado.nombres}{" "}
                                        {pago.empleado.apellidos}
                                    </td>
                                    <td className="border border-black text-center px-3 py-2 font-mono">
                                        {pago.empleado.cedula}
                                    </td>
                                    <td className="border border-black text-center px-3 py-2">
                                        {dayjs(pago.fecha_pago).format(
                                            "DD-MM-YYYY",
                                        )}
                                    </td>
                                    <td className="border border-black text-center px-3 py-2">
                                        {pago.metodo_item}
                                    </td>
                                    <td className="border border-black text-center px-3 py-2 italic">
                                        {pago.ref_item || "N/A"}
                                    </td>
                                    <td className="border border-black text-right px-3 py-2 font-bold">
                                        ${Number(pago.monto_item).toFixed(2)}
                                    </td>
                                </tr>
                            ))}

                            {/* FILA DE TOTALES */}
                            <tr className="bg-slate-200 font-black">
                                <td
                                    colSpan={6}
                                    className="border border-black text-right px-4 py-3 text-xs tracking-widest"
                                >
                                    TOTAL GENERAL RECAUDADO:
                                </td>
                                <td className="border border-black text-right px-3 py-3 text-sm">
                                    ${Number(totalRecaudado).toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* FIRMAS DE RESPONSABLES */}
                    <div className="mt-20 grid grid-cols-2 gap-20 px-20">
                        <div className="border-t border-black text-center pt-2">
                            <p className="text-[10px] font-black uppercase">
                                Administración / Recaudador
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">
                                Firma y Sello
                            </p>
                        </div>
                        <div className="border-t border-black text-center pt-2">
                            <p className="text-[10px] font-black uppercase">
                                Dirección del Plantel
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">
                                Firma y Sello
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page { 
                        size: letter landscape; 
                        margin: 0; 
                    }
                    body { 
                        background: white !important; 
                        -webkit-print-color-adjust: exact;
                    }
                }
            `,
                }}
            />
        </div>
    );
}
