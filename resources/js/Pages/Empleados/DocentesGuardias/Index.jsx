import React, { useState, useEffect, useMemo, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import { Head, Link, router, usePage } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/Components/ui/Button";

export default function Index({
    docentes,
    matrizAsignaciones,
    filters,
    items,
    dias,
}) {
    const { flash } = usePage().props;

    // --- ESTADOS ---
    // Sincronizados con los props que vienen del controlador
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);
    const [activeDay, setActiveDay] = useState(dias[0]);
    const [searchQueries, setSearchQueries] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null);
    const inputRefs = React.useRef({});
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

    // --- ESCUCHAR ERRORES DEL CONTROLADOR (Conflictos) ---
    useEffect(() => {
        if (flash.conflicto) {
            Swal.fire({
                icon: "error",
                title: "Conflicto de Asignación",
                text: flash.conflicto,
                customClass: { popup: "rounded-[2rem]" },
            });
        }
    }, [flash.conflicto]);

    // --- LÓGICA DEL SWITCH (MODO TODOS) ---
    const allEmployeesMode = useMemo(() => {
        const mode = {};
        items.forEach((item) => {
            mode[item] = {};
            dias.forEach((dia) => {
                const asignaciones = matrizAsignaciones[item]?.[dia] || [];
                // Si el primer elemento es null, significa que "Todos" están asignados
                mode[item][dia] =
                    item === "Formación" &&
                    asignaciones.length === 1 &&
                    asignaciones[0] === null;
            });
        });
        return mode;
    }, [matrizAsignaciones, items, dias]);

    // --- CAMBIO DE FECHA (DISPARA EL GET) ---
    const handleDateChange = (m, y) => {
        router.get(
            route("empleados.acciones.guardias.docentes.index"),
            { month: m, year: y },
            { preserveState: true, replace: true },
        );
    };

   const [loading, setLoading] = useState(false);

   const toggleAllEmployeesMode = (item, dia) => {
       if (item !== "Formación" || loading) return;

       setLoading(true);
       const currentMode = allEmployeesMode[item]?.[dia];

       router.post(
           route("empleados.acciones.guardias.docentes.store"),
           {
               month: selectedMonth,
               year: selectedYear,
               item: item,
               dia_semana: dia,
               empleado_ids: !currentMode ? [null] : [],
           },
           {
               preserveScroll: true,
               onFinish: () => setLoading(false), // Desbloquea cuando termine
           },
       );
   };

    const toggleAssignment = (item, dia, id) => {
        if (item === "Formación" && allEmployeesMode[item]?.[dia]) return;

        let currentIds = matrizAsignaciones[item]?.[dia] || [];
        // Limpiamos nulls y aseguramos que sean números para comparar
        let newIds = currentIds.filter((x) => x !== null).map(Number);

        if (newIds.includes(Number(id))) {
            newIds = newIds.filter((x) => x !== Number(id));
        } else {
            newIds.push(Number(id));
        }

        router.post(
            route("empleados.acciones.guardias.docentes.store"),
            {
                month: selectedMonth,
                year: selectedYear,
                item,
                dia_semana: dia,
                empleado_ids: newIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // 1. Limpiamos la búsqueda de ese cuadro
                    setSearchQueries((prev) => ({ ...prev, [item]: "" }));

                    // 2. Cerramos el dropdown
                    setActiveDropdown(null);

                    // 3. REGRESAMOS EL FOCO AL INPUT
                    // Usamos un pequeño delay (setTimeout) para que el DOM se actualice primero
                    setTimeout(() => {
                        inputRefs.current[item]?.focus();
                    }, 50);
                },
            },
        );
    };

    const docentesOcupadosGlobal = useMemo(() => {
        const ocupados = new Set();
        Object.keys(matrizAsignaciones).forEach((item) => {
            if (item === "Pasillo") return; // Pasillo no cuenta para el bloqueo
            Object.keys(matrizAsignaciones[item]).forEach((dia) => {
                matrizAsignaciones[item][dia].forEach((id) => {
                    if (id !== null) ocupados.add(Number(id));
                });
            });
        });
        return ocupados;
    }, [matrizAsignaciones]);



    const getFilteredDocentes = (itemName) => {
        // Función interna de normalización
        const normalize = (str) =>
            (str || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

        const query = normalize(searchQueries[itemName]);
        const yaAsignadosEnEsteCuadro =
            matrizAsignaciones[itemName]?.[activeDay] || [];

        return docentes
            .filter((doc) => {
                const full = normalize(`${doc.nombres} ${doc.apellidos}`);

                const yaTieneOtraGuardiaPrincipal =
                    itemName !== "Pasillo" &&
                    docentesOcupadosGlobal.has(Number(doc.id));

                return (
                    !yaAsignadosEnEsteCuadro.includes(doc.id) &&
                    !yaTieneOtraGuardiaPrincipal &&
                    full.includes(query)
                );
            })
            .slice(0, 5);
    };

    const getItemIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes("pasillo")) return Icons.Users;
        if (n.includes("efemerides")) return Icons.CalendarDays;
        if (n.includes("himno") || n.includes("oracion")) return Icons.Flag;
        if (n.includes("comedor")) return Icons.Utensils;
        return Icons.Megaphone;
    };

    // --- EXPORTAR PDF ---
    const exportToPDF = () => {
        // 1. Configuración de la hoja: Letter (Carta) en Horizontal
        const doc = new jsPDF({
            orientation: "l",
            unit: "mm",
            format: "letter",
        });

        const nombreMes = meses[selectedMonth - 1].toUpperCase();

        // 2. Encabezado fuera de la tabla
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text(
            `CUADRATURA DE GUARDIAS: ${nombreMes} ${selectedYear}`,
            10,
            15,
        );

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 10, 22);

        // 3. Construcción del cuerpo de la tabla
        const tableBody = items.map((item) => {
            const row = [item.toUpperCase()]; // Primera columna (Función)

            dias.forEach((dia) => {
                const ids = matrizAsignaciones[item]?.[dia] || [];

                if (
                    item === "Formación" &&
                    ids.length === 1 &&
                    ids[0] === null
                ) {
                    // Formato apilado para "TODOS LOS DOCENTES"
                    row.push("TODOS\nLOS\nDOCENTES");
                } else if (ids.length > 0) {
                    const names = ids.map((id) => {
                        const d = docentes.find((x) => x.id === id);
                        // Nombre corto: "• PrimerNombre PrimerApellido"
                        return d
                            ? `• ${d.nombres.split(" ")[0]} ${d.apellidos.split(" ")[0]}`
                            : "";
                    });
                    row.push(names.join("\n")); // Unir con saltos de línea
                } else {
                    row.push(""); // Celda vacía si no hay nadie
                }
            });
            return row;
        });

        // 4. Generación de la tabla ocupando el ancho total
        autoTable(doc, {
            startY: 30,
            head: [["FUNCION", ...dias.map((d) => d.toUpperCase())]],
            body: tableBody,
            theme: "grid",
            margin: { left: 10, right: 10 }, // Márgenes mínimos para maximizar espacio
            styles: {
                fontSize: 10,
                cellPadding: 5,
                valign: "middle", // Centrado vertical
                overflow: "linebreak",
                cellWidth: "auto",
                textColor: [40, 40, 40],
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [229, 231, 235], // Gris claro como en la imagen
                textColor: [0, 0, 0], // Texto negro
                fontStyle: "bold",
                halign: "center",
                fontSize: 11,
            },
            columnStyles: {
                0: {
                    fillColor: [243, 244, 246], // Fondo gris para la primera columna
                    fontStyle: "bold",
                    cellWidth: 35, // Ancho fijo para la columna de funciones
                },
                // Las columnas de los días se reparten el resto del espacio automáticamente
            },
            // Aumentar la altura mínima de las filas para que se vea espacioso
            didParseCell: function (data) {
                if (data.section === "body") {
                    data.cell.styles.minCellHeight = 25;
                }
            },
        });

        // 5. Abrir en pestaña nueva
        window.open(doc.output("bloburl"), "_blank");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Guardias Docentes" />
            <ViewContainer
                title="Control de Guardias y Formación"
                subtitle="Asignación de docentes a funciones"
                icon="UserCheck"
                showSearch={false}
                extraFilters={
                    <div className="flex items-center gap-4">
                        <div className="flex text-gray-600 bg-white rounded-2xl border border-slate-500 shadow-sm">
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(e.target.value);
                                    handleDateChange(
                                        e.target.value,
                                        selectedYear,
                                    );
                                }}
                                className="border-none  bg-transparent text-[10px] font-black uppercase px-4 focus:ring-0"
                            >
                                {meses.map((m, i) => (
                                    <option key={i} value={i + 1}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    handleDateChange(
                                        selectedMonth,
                                        e.target.value,
                                    );
                                }}
                                className="w-20 border-none bg-transparent text-[11px] font-black text-center focus:ring-0"
                            />
                        </div>

                        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                            {dias.map((dia) => (
                                <button
                                    key={dia}
                                    onClick={() => setActiveDay(dia)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeDay === dia ? "bg-white text-indigo-600 shadow-md scale-105" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {dia}
                                </button>
                            ))}
                        </div>
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <Link
                            href={route("empleados.acciones.index")}
                        >
                            <Button>
                                <Icons.ArrowLeftCircle size={18} /> VOLVER
                            </Button>
                        </Link>

                        <Button
                            variant="primary"
                            onClick={exportToPDF}
                            className="btn-danger px-4 py-2"
                        >
                            <Icons.FileDown size={16} /> PDF
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5 p-2">
                    {items.map((item) => {
                        const ids = matrizAsignaciones[item]?.[activeDay] || [];
                        const isTodos = allEmployeesMode[item]?.[activeDay];
                        const filtered = getFilteredDocentes(item);

                        return (
                            <div
                                key={item}
                                className={`bg-white rounded-[2.5rem] border-2 p-3 flex flex-col h-[28rem] shadow-sm transition-all ${ids.length > 0 ? "border-emerald-100" : "border-slate-50"}`}
                            >
                                {/* Header Card */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`p-3 rounded-2xl ${ids.length > 0 ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}
                                        >
                                            {React.createElement(
                                                getItemIcon(item),
                                                { size: 24 },
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-[12px] font-black text-slate-800 uppercase leading-none">
                                                {item}
                                            </h3>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                {activeDay}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Buscador Interno */}

                                <div className="flex justify-center items-center gap-2 mb-2">
                                    {item === "Formación" && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                toggleAllEmployeesMode(
                                                    item,
                                                    activeDay,
                                                )
                                            }
                                            className="flex items-center gap-1 active:scale-90 transition-all"
                                        >
                                            <span className="text-[8px] font-black text-slate-400 uppercase">
                                                Seleccionar Todos
                                            </span>
                                            {isTodos ? (
                                                <Icons.ToggleRight
                                                    size={32}
                                                    className="text-emerald-500"
                                                />
                                            ) : (
                                                <Icons.ToggleLeft
                                                    size={32}
                                                    className="text-slate-300"
                                                />
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <div className="relative mb-5">
                                    <Icons.Search
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={16}
                                    />
                                    <input
                                        ref={(el) =>
                                            (inputRefs.current[item] = el)
                                        }
                                        type="text"
                                        placeholder="Agregar docente..."
                                        autoFocus
                                        disabled={isTodos}
                                        value={searchQueries[item] || ""}
                                        onFocus={() => setActiveDropdown(item)}
                                        onChange={(e) =>
                                            setSearchQueries((prev) => ({
                                                ...prev,
                                                [item]: e.target.value,
                                            }))
                                        }
                                        className={`w-full pl-11 pr-4 py-2 bg-slate-50  text-gray-600 border-none rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 ${isTodos ? "opacity-30" : ""}`}
                                    />

                                    <AnimatePresence>
                                        {activeDropdown === item &&
                                            searchQueries[item] && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() =>
                                                            setActiveDropdown(
                                                                null,
                                                            )
                                                        }
                                                    />
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        className="absolute z-20 w-full mt-2 text-gray-600 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden"
                                                    >
                                                        {filtered.length ===
                                                        0 ? (
                                                            <div className="p-4 text-center text-[10px] text-slate-400 italic">
                                                                Sin resultados
                                                            </div>
                                                        ) : (
                                                            filtered.map(
                                                                (doc) => (
                                                                    <button
                                                                        key={
                                                                            doc.id
                                                                        }
                                                                        onClick={() =>
                                                                            toggleAssignment(
                                                                                item,
                                                                                activeDay,
                                                                                doc.id,
                                                                            )
                                                                        }
                                                                        className="w-full text-left px-5 py-3 text-[11px] hover:bg-indigo-50 flex justify-between items-center border-b border-slate-50 last:border-none uppercase font-black"
                                                                    >
                                                                        {
                                                                            doc.nombres
                                                                        }{" "}
                                                                        {
                                                                            doc.apellidos
                                                                        }{" "}
                                                                        <Icons.Plus
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="text-emerald-500"
                                                                        />
                                                                    </button>
                                                                ),
                                                            )
                                                        )}
                                                    </motion.div>
                                                </>
                                            )}
                                    </AnimatePresence>
                                </div>

                                {/* Lista de Asignados */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {isTodos ? (
                                        <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] text-center flex flex-col items-center">
                                            <Icons.UsersRound
                                                size={40}
                                                className="text-emerald-500 mb-3"
                                            />
                                            <p className="text-[11px] font-black text-emerald-700 uppercase leading-tight">
                                                Todos los docentes están
                                                asignados a esta función en este
                                                día. Para modificar, desactiva
                                                el modo "Seleccionar Todos".
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {ids
                                                .filter((id) => id !== null)
                                                .map((id) => {
                                                    const doc = docentes.find(
                                                        (d) => d.id === id,
                                                    );
                                                    return (
                                                        <div
                                                            key={id}
                                                            className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 px-4 py-2.5 rounded-2xl"
                                                        >
                                                            <span className="text-[10px] font-black text-indigo-900 uppercase">
                                                                {
                                                                    doc?.nombres.split(
                                                                        " ",
                                                                    )[0]
                                                                }{" "}
                                                                {
                                                                    doc?.apellidos.split(
                                                                        " ",
                                                                    )[0]
                                                                }
                                                            </span>
                                                            <Icons.X
                                                                size={14}
                                                                className="text-slate-300 hover:text-rose-500 cursor-pointer"
                                                                onClick={() =>
                                                                    toggleAssignment(
                                                                        item,
                                                                        activeDay,
                                                                        id,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            {ids.length === 0 && (
                                                <div className="py-20 text-center opacity-20 uppercase text-[10px] font-black">
                                                    Vacío
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
