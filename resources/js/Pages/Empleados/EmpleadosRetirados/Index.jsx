import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import { Head, Link, router } from "@inertiajs/react";
import * as Icons from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";


// 🔴 IMPORTANTE: Configurar el locale
dayjs.locale("es");

export default function ListadoRetirados({ retirados, filters }) {
    const [showAgeId, setShowAgeId] = useState(null);

    const handleSearch = (val) => {
        // REGLA DE ORO: Si lo que llega del buscador es igual a lo que ya tenemos
        // en la URL, NO hacemos nada. Esto evita el reseteo al cambiar de página.
        if (val === (filters.search || "")) return;

        router.get(
            route("empleados.inactivos.retirados.index"),
            {
                search: val,
                page: 1, // Solo cuando el texto CAMBIA de verdad, volvemos a la página 1
            },
            {
                preserveState: true,
                replace: true, // Reemplaza la URL para no ensuciar el historial
            },
        );
    };

    const handlePrintHistory = (emp) => {
        const currentYear = dayjs().year();
        const meses = [
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

        Swal.fire({
            title: '<span class="text-2xl font-black text-slate-700 tracking-tighter">Historial de Asistencias</span>',
            html: `
            <div class="text-left mt-6">
                <p class="mb-6 text-[11px] font-black uppercase text-blue-600 italic tracking-widest border-b pb-2">
                    Empleado: ${emp.nombres} ${emp.apellidos}
                </p>
                
                <label class="block mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Año:</label>
                <input id="swal-anio" type="number" class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-700 mb-6" value="${currentYear}">
                
                <label class="block mb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meses:</label>
                <div class="grid grid-cols-3 gap-2">
                    ${meses
                        .map(
                            (m, i) => `
                        <label class="flex items-center gap-2 p-3 border border-slate-100 rounded-xl hover:bg-blue-50 cursor-pointer">
                            <input type="checkbox" value="${i + 1}" class="month-check w-4 h-4 text-blue-600"> 
                            <span class="text-[10px] font-black text-slate-500 uppercase">${m}</span>
                        </label>
                    `,
                        )
                        .join("")}
                </div>
            </div>
        `,
            showCancelButton: true,
            confirmButtonText: "GENERAR REPORTE",
            cancelButtonText: "CANCELAR",
            confirmButtonColor: "#2563eb",
            preConfirm: () => {
                const anio = Swal.getPopup().querySelector("#swal-anio").value;
                const checks = Swal.getPopup().querySelectorAll(
                    ".month-check:checked",
                );
                const mesesSeleccionados = Array.from(checks).map(
                    (c) => c.value,
                );

                if (!anio || mesesSeleccionados.length === 0) {
                    Swal.showValidationMessage(
                        "Debes ingresar el año y seleccionar al menos un mes",
                    );
                    return false;
                }
                // Unimos los meses en un solo string separado por comas
                return { anio, meses: mesesSeleccionados.join(",") };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { anio, meses } = result.value;

                // Abrimos una sola pestaña con todos los meses
                const url = route("ExportDocumentosEmpleados", {
                    cedula: emp.cedula,
                    month: meses, // ← Ahora es "1,3,5" por ejemplo
                    year: anio,
                    type: "historial-asistencia-retirados",
                });
                window.open(url, "_blank");
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Archivo de Retirados" />

            <ViewContainer
                title="Archivo Histórico de Retirados"
                subtitle="Consulta de personal egresado de la institución"
                icon="UserX"
                searchValue={filters.search || ""}
                onSearch={handleSearch}
                currentPage={retirados.current_page}
                totalPages={retirados.last_page}
                onPageChange={(page) => {
                    router.get(
                        route("empleados.inactivos.retirados.index"),
                        {
                            page: page,
                            search: filters.search, // Mantenemos el filtro activo al navegar
                        },
                        { preserveState: true },
                    );
                }}
                footerStats={
                    <span>
                        Registros Históricos:{" "}
                        <b className="text-blue-600">{retirados.total}</b>
                    </span>
                }
                returns={
                    <Link href={route("empleados.inactivos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={16} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest italic z-20">
                                <tr>
                                    <th className="p-4 border-r border-blue-500">
                                        Identidad / Expediente
                                    </th>
                                    <th className="p-4 border-r border-blue-500">
                                        Localización y Contacto
                                    </th>
                                    <th className="p-4 border-r border-blue-500 text-center">
                                        Registro de Egreso
                                    </th>
                                    <th className="p-4 border-r border-blue-500 text-center">
                                        Destino
                                    </th>
                                    <th className="p-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-500">
                                {retirados.data.length > 0 ? (
                                    retirados.data.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                                        >
                                            {/* COLUMNA 1: IDENTIDAD */}
                                            <td className="p-4 border-r border-slate-50">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Icons.User
                                                            size={14}
                                                            className="text-blue-600"
                                                        />
                                                        <span className="font-black text-slate-800 uppercase text-[12px]">
                                                            {emp.nombres}{" "}
                                                            {emp.apellidos}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 font-mono">
                                                        <Icons.IdCard
                                                            size={12}
                                                        />{" "}
                                                        {emp.documento}
                                                        {emp.cedula}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 relative">
                                                        <Icons.Calendar
                                                            size={12}
                                                        />
                                                        {emp.fecha_de_nacimiento ? (
                                                            <>
                                                                <span>
                                                                    {dayjs(
                                                                        emp.fecha_de_nacimiento,
                                                                    ).format(
                                                                        "DD/MM/YYYY",
                                                                    )}
                                                                </span>
                                                                <button
                                                                    onMouseEnter={() =>
                                                                        setShowAgeId(
                                                                            emp.id,
                                                                        )
                                                                    }
                                                                    onMouseLeave={() =>
                                                                        setShowAgeId(
                                                                            null,
                                                                        )
                                                                    }
                                                                >
                                                                    <Icons.Cake
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="text-blue-400 ml-1"
                                                                    />
                                                                </button>
                                                                {showAgeId ===
                                                                    emp.id && (
                                                                    <div className="absolute left-28 bg-slate-900 text-white px-2 py-1 rounded text-[9px] z-50 shadow-xl">
                                                                        {dayjs().diff(
                                                                            dayjs(
                                                                                emp.fecha_de_nacimiento,
                                                                            ),
                                                                            "year",
                                                                        )}{" "}
                                                                        AÑOS
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* COLUMNA 2: LOCALIZACIÓN */}
                                            <td className="p-4 border-r border-slate-50 uppercase">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-start gap-2 text-slate-600">
                                                        <Icons.MapPin
                                                            size={12}
                                                            className="text-blue-400 mt-0.5 shrink-0"
                                                        />
                                                        <span className="truncate max-w-[200px] leading-tight">
                                                            {emp.direccion_de_habitacion ||
                                                                "NO REGISTRADA"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <Icons.Phone
                                                            size={12}
                                                            className="text-blue-400"
                                                        />
                                                        <span>
                                                            {emp.telefono ||
                                                                "---"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-600 italic font-bold lowercase truncate max-w-[200px]">
                                                        <Icons.Mail
                                                            size={12}
                                                            className="text-blue-400"
                                                        />{" "}
                                                        {emp.correo_electronico ||
                                                            "---"}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* COLUMNA 3: REGISTRO DE EGRESO */}
                                            <td className="p-4 border-r border-slate-50 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Icons.FileClock
                                                        size={20}
                                                        className="text-rose-400 opacity-60"
                                                    />

                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        Egreso Registrado:
                                                    </p>
                                                    <p className="text-[12px] font-black text-slate-800 tracking-tighter">
                                                        {dayjs(
                                                            emp.fecha_registro,
                                                        ).format("DD-MM-YYYY")}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* COLUMNA 4: DESTINO */}
                                            <td className="p-4 border-r border-slate-50 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Icons.Map
                                                        size={20}
                                                        className="text-rose-400 opacity-60"
                                                    />
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        Destino:
                                                    </p>
                                                    {emp.destino ||
                                                        "NO REGISTRADO"}
                                                </div>
                                            </td>

                                            {/* COLUMNA 4: ACCIONES */}
                                            <td className="p-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all"
                                                    onClick={() =>
                                                        handlePrintHistory(emp)
                                                    }
                                                    title="Consultar Historial"
                                                >
                                                    <Icons.Printer size={18} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-24 text-center text-slate-400 font-bold italic uppercase tracking-widest opacity-30"
                                        >
                                            Archivo histórico vacío
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
