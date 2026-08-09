import React, { useMemo } from "react";
import { Head } from "@inertiajs/react";
import { Printer, X } from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function ReportePdf({
    evaluaciones = [],
    institucion,
    director,
    titulo_cargo,
    meta,
    logoUrl,
}) {
    const paginas = useMemo(() => {
        const size = 14; // Exactamente 14 por hoja
        const res = [];
        for (let i = 0; i < evaluaciones.length; i += size) {
            res.push(evaluaciones.slice(i, i + size));
        }
        return res;
    }, [evaluaciones]);

    return (
        <div className="min-h-screen bg-slate-800 py-10 print:bg-white print:py-0 font-sans text-black overflow-x-hidden">
            <Head title="Reporte Oficial de Evaluaciones" />

            {/* BOTONES FLOTANTES */}
            <div className="fixed top-5 left-0 right-0 flex justify-center gap-4 print:hidden z-50">
                <Button
                    onClick={() => window.close()}
                    variant="ghost"
                    className="text-white bg-slate-900/80 hover:bg-slate-900"
                >
                    <X size={18} className="mr-2" /> CERRAR
                </Button>
                <Button
                    onClick={() => window.print()}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-10 font-black rounded-full shadow-2xl"
                >
                    <Printer size={18} className="mr-2" /> IMPRIMIR FORMATO
                </Button>
            </div>

            {paginas.map((grupo, pageIndex) => (
                <div
                    key={pageIndex}
                    className="flex justify-center mb-10 print:mb-0 print:block page-break"
                >
                    {/* CONTENEDOR OFICIO HORIZONTAL (LEGAL LANDSCAPE) - DIMENSIONES TÉCNICAS */}
                    <div className="reporte-hoja bg-white w-[355.6mm] h-[215.9mm] p-[10mm] shadow-2xl print:shadow-none relative flex flex-col box-border">
                        {/* 1. ENCABEZADO SUPERIOR TÍTULO */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <img
                                    src={logoUrl}
                                    className="h-12 w-auto object-contain"
                                    alt="Logo"
                                />
                            </div>
                            <div className="text-right">
                                <h1 className="text-[11px] font-black uppercase tracking-tighter">
                                    EVALUACIONES {meta.periodo} PLANTEL
                                    EDUCATIVOS ({meta.meses}) ESTADO DELTA
                                    AMACURO ({titulo_cargo})
                                </h1>
                            </div>
                        </div>

                        {/* 2. CUADRO DE DATOS (REJILLA NEGRA) */}
                        <div className="contenedor-datos mb-3">
                            <div className="fila-dato">
                                <span className="label">
                                    NOMBRE DE LA INSTITUCION:
                                </span>{" "}
                                <span className="valor">
                                    {institucion?.nombre_de_la_institucion}
                                </span>
                            </div>
                            <div className="fila-dato">
                                <span className="label">
                                    NOMBRE DEL DIRECTOR:
                                </span>{" "}
                                <span className="valor">
                                    {director?.nombres} {director?.apellidos}
                                </span>
                            </div>
                            <div className="fila-dato">
                                <span className="label">
                                    CEDULA DEL DIRECTOR:
                                </span>{" "}
                                <span className="valor">
                                    {director?.cedula}
                                </span>
                            </div>
                            <div className="fila-dato">
                                <span className="label">
                                    NUMERO TELEFONICO DEL DIRECTOR:
                                </span>{" "}
                                <span className="valor">
                                    {director?.telefono}
                                </span>
                            </div>
                            <div className="fila-dato border-b-0">
                                <span className="label">
                                    CORREO ELECTRONICO DEL DIRECTOR:
                                </span>{" "}
                                <span className="valor">
                                    {director?.correo_electronico}
                                </span>
                            </div>
                        </div>

                        {/* 3. TABLA PRINCIPAL */}
                        <div className="flex-1">
                            <table className="tabla-evaluacion">
                                <thead>
                                    <tr>
                                        <th style={{ width: "35px" }}>N</th>
                                        <th style={{ width: "180px" }}>
                                            APELLIDOS
                                        </th>
                                        <th style={{ width: "180px" }}>
                                            NOMBRES
                                        </th>
                                        <th style={{ width: "90px" }}>
                                            CÉDULA
                                        </th>
                                        <th>INSTITUCIÓN</th>
                                        <th style={{ width: "220px" }}>
                                            CARGO
                                        </th>
                                        <th style={{ width: "100px" }}>
                                            ESTADO
                                        </th>
                                        <th style={{ width: "100px" }}>
                                            MUNICIPIO
                                        </th>
                                        <th style={{ width: "100px" }}>
                                            PARROQUIA
                                        </th>
                                        <th style={{ width: "55px" }}>PUNT.</th>
                                        <th style={{ width: "90px" }}>FIRMA</th>
                                        <th style={{ width: "90px" }}>
                                            HUELLA
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupo.map((ev, idx) => (
                                        <tr key={ev.id}>
                                            <td className="text-center">
                                                {pageIndex * 14 + (idx + 1)}
                                            </td>
                                            {/* Letras de apellidos y nombres más grandes */}
                                            <td className="px-2 text-left text-[11px] font-black uppercase">
                                                {ev.empleado?.apellidos}
                                            </td>
                                            <td className="px-2 text-left text-[11px] font-black uppercase">
                                                {ev.empleado?.nombres}
                                            </td>
                                            <td className="text-center">
                                                {ev.empleado?.cedula}
                                            </td>
                                            <td className="text-[7.5px] leading-none px-1 text-center font-normal">
                                                {
                                                    institucion?.nombre_de_la_institucion
                                                }
                                            </td>
                                            <td className="px-1 text-[8px] text-left">
                                                {ev.empleado
                                                    ?.cargo_en_el_perror ||
                                                    ev.empleado
                                                        ?.tipo_de_personal}
                                            </td>
                                            <td className="text-center text-[7.5px]">
                                                DELTA AMACURO
                                            </td>
                                            <td className="text-center text-[7.5px]">
                                                {institucion?.municipio}
                                            </td>
                                            <td className="text-center text-[7.5px]">
                                                {institucion?.parroquia}
                                            </td>
                                            <td className="text-center font-black text-[11px]">
                                                {Math.round(ev.puntuacion)}
                                            </td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                    {/* Rellenar filas vacías hasta 14 */}
                                    {Array.from({
                                        length: 14 - grupo.length,
                                    }).map((_, i) => (
                                        <tr
                                            key={"empty-" + i}
                                            className="fila-vacia"
                                        >
                                            {Array.from({ length: 12 }).map(
                                                (_, j) => (
                                                    <td key={j}></td>
                                                ),
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 4. BLOQUE DE FIRMAS INFERIOR ALARGADO */}
                        <div className="flex justify-between mt-4 px-2">
                            <div className="cuadro-firma">
                                <span>FIRMA Y SELLO DEL DIRECTOR</span>
                            </div>
                            <div className="cuadro-firma">
                                <span>FIRMA Y FECHA RECEPCION SUPERVISOR</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media screen, print {
                    .reporte-hoja {
                        font-family: Arial, sans-serif !important;
                        box-sizing: border-box;
                    }
                    .contenedor-datos {
                        border: 1.5px solid black;
                    }
                    .fila-dato {
                        border-bottom: 1.5px solid black;
                        display: flex;
                        padding: 3px 8px;
                    }
                    .fila-dato .label {
                        width: 250px;
                        font-weight: 900;
                        font-size: 9.5px;
                    }
                    .fila-dato .valor {
                        font-weight: 900;
                        font-size: 9.5px;
                    }
                    .tabla-evaluacion {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1.5px solid black;
                    }
                    .tabla-evaluacion th {
                        border: 1.5px solid black;
                        font-size: 9px;
                        font-weight: 900;
                        padding: 4px 2px;
                        background-color: #f2f2f2 !important;
                    }
                    .tabla-evaluacion td {
                        border: 1.5px solid black;
                        font-size: 8.5px;
                        height: 34px; 
                        font-weight: 700;
                    }
                    .cuadro-firma {
                        border: 1.5px solid black;
                        width: 48%; /* Alargado horizontalmente */
                        height: 70px; /* Alargado verticalmente para mayor espacio de sello/firma */
                        display: flex;
                        align-items: flex-end;
                        justify-content: center;
                        padding-bottom: 8px;
                    }
                    .cuadro-firma span {
                        font-size: 9.5px;
                        font-weight: 900;
                        letter-spacing: 1px;
                    }
                }
                @media print {
                    @page { 
                        size: legal landscape; /* Configurado a tamaño Oficio/Legal */
                        margin: 0; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                    }
                    .page-break { 
                        page-break-after: always; 
                        page-break-inside: avoid;
                    }
                }
            `,
                }}
            />
        </div>
    );
}
