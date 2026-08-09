import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/layout/ViewContainer";
import { Button } from "@/Components/ui/button";
import { Head, router, Link } from "@inertiajs/react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";
import dayjs from "dayjs";

export default function Index({ datos, filters, stats, periodoSugerido }) {
    const [search, setSearch] = useState(filters.search || "");
    const [fAnio, setFAnio] = useState(filters.anio || dayjs().year());
    const [fPeriodo, setFPeriodo] = useState(
        filters.periodo_actual || periodoSugerido,
    );
    const [bulkScores, setBulkScores] = useState({});
    const [focusedEmployeeId, setFocusedEmployeeId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const searchInputRef = useRef(null);
    const scoreInputRefs = useRef({});
    const employeesWithoutEvaluation = useMemo(() => {
        return datos.data.filter((emp) => emp.evaluaciones.length === 0);
    }, [datos.data]);

    const opcionesPeriodos = [
        { ordinal: "1ER PERIODO", meses: "ENERO - MARZO" },
        { ordinal: "2DO PERIODO", meses: "ABRIL - JUNIO" },
        { ordinal: "3ER PERIODO", meses: "JULIO - SEPTIEMBRE" },
        { ordinal: "4TO PERIODO", meses: "OCTUBRE - DICIEMBRE" },
    ];

    const filtrar = useCallback(
        debounce((q, p, a) => {
            router.get(
                route("empleados.acciones.evaluaciones.index"),
                {
                    search: q,
                    periodo_actual: p,
                    anio: a,
                    page: 1,
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 400),
        [],
    );

    useEffect(() => {
        if (
            search !== (filters.search || "") ||
            fPeriodo !== (filters.periodo_actual || periodoSugerido) ||
            fAnio !== (filters.anio || dayjs().year())
        ) {
            filtrar(search, fPeriodo, fAnio);
        }
    }, [search, fPeriodo, fAnio]);

    // Enfocar el input de puntuación cuando se selecciona un empleado
    useEffect(() => {
        if (focusedEmployeeId && scoreInputRefs.current[focusedEmployeeId]) {
            setTimeout(() => {
                scoreInputRefs.current[focusedEmployeeId].focus();
                scoreInputRefs.current[focusedEmployeeId].select();
            }, 100);
        }
    }, [focusedEmployeeId]);

    // Enfocar el buscador cuando se limpia
    useEffect(() => {
        if (search === "" && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current.focus();
            }, 100);
        }
    }, [search]);

    const totalAPuntuar = useMemo(
        () =>
            Object.values(bulkScores).filter((s) => s !== "" && s !== null)
                .length,
        [bulkScores],
    );

 const saveBulkEvaluations = () => {
     const payload = [];
     const periodoInfo = opcionesPeriodos.find((p) => p.ordinal === fPeriodo);

     for (const [id, score] of Object.entries(bulkScores)) {
         if (score !== "" && score !== null) {
             payload.push({
                 empleado_id: id,
                 puntuacion: score,
                 periodo_actual: fPeriodo,
                 periodo_evaluacion: `${periodoInfo.meses} ${fAnio}`,
             });
         }
     }

     router.post(
         route("empleados.acciones.evaluaciones.bulkStore"),
         { evaluaciones: payload },
         {
             onStart: () => setIsSaving(true),
             onSuccess: () => {
                 setBulkScores({});
                 setSearch("");
             },
             onFinish: () => setIsSaving(false),
         },
     );
 };

    const handlePageChange = (p) => {
        router.get(
            route("empleados.acciones.evaluaciones.index"),
            {
                page: p,
                search: search,
                periodo_actual: fPeriodo,
                anio: fAnio,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Manejar Enter desde el input de búsqueda
    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // Buscar el primer empleado sin evaluar
            const firstEmployee = employeesWithoutEvaluation[0];
            if (firstEmployee) {
                setFocusedEmployeeId(firstEmployee.id);
                setCurrentIndex(0);
            }
        }
    };

    // 1. Nueva función para limpiar y enfocar
    const resetSearchAndFocus = useCallback(() => {
        setSearch(""); // Limpia el estado
        // Aseguramos que el foco vuelva al input
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 50);
    }, []);

    // 2. Modifica el handleScoreKeyDown para incluir el reset
    const handleScoreKeyDown = (e, empId, index) => {
        // Si presionas Enter
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            const nextIndex = index + 1;
            const nextEmployee = employeesWithoutEvaluation[nextIndex];

            if (nextEmployee) {
                setFocusedEmployeeId(nextEmployee.id);
                setCurrentIndex(nextIndex);
            } else {
                // AQUÍ LLAMAS A LA NUEVA FUNCIÓN
                resetSearchAndFocus();
            }
        }

        // 3. OPCIONAL: Si quieres que una tecla especial (ej. Escape) lo haga siempre
        if (e.key === "Escape") {
            e.preventDefault();
            resetSearchAndFocus();
        }
    };

    // Capturar el input de búsqueda del ViewContainer
    useEffect(() => {
        const findSearchInput = () => {
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) {
                searchInputRef.current = searchInput;
                searchInput.addEventListener("keydown", handleSearchKeyDown);
                return true;
            }
            return false;
        };

        // Intentar encontrar el input inmediatamente
        if (!findSearchInput()) {
            // Si no está, esperar un momento y volver a intentar
            const timer = setTimeout(() => {
                findSearchInput();
            }, 500);
            return () => clearTimeout(timer);
        }

        return () => {
            if (searchInputRef.current) {
                searchInputRef.current.removeEventListener(
                    "keydown",
                    handleSearchKeyDown,
                );
            }
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Carga de Evaluaciones" />
            <ViewContainer
                title="Control de Evaluaciones"
                subtitle="Sistema de Evaluación de Empleados"
                icon="ListChecks"
                onSearch={setSearch}
                inputRef={searchInputRef}
                searchValue={search}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={handlePageChange}
                extraFilters={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                            <span className="text-[9px] font-black text-slate-800">
                                AÑO:
                            </span>
                            <input
                                type="number"
                                value={fAnio}
                                onChange={(e) => setFAnio(e.target.value)}
                                className="w-16 h-8 border-none text-gray-600 bg-transparent text-[10px] font-black focus:ring-0"
                                tabIndex="-1" // Quitar del flujo de tab
                            />
                        </div>
                        <select
                            value={fPeriodo}
                            onChange={(e) => setFPeriodo(e.target.value)}
                            className="h-10 bg-white border-slate-200 rounded-xl text-[10px] font-black uppercase text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                            tabIndex="-1" // Quitar del flujo de tab
                        >
                            {opcionesPeriodos.map((op) => (
                                <option key={op.ordinal} value={op.ordinal}>
                                    {op.ordinal}
                                </option>
                            ))}
                        </select>
                    </div>
                }
                actions={
                    <div className="flex gap-2">
                        <Link href={route("empleados.acciones.index")}>
                            <Button tabIndex="-1">
                                <Icons.ArrowLeftCircle size={18} /> VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={saveBulkEvaluations}
                            disabled={totalAPuntuar === 0 || isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black gap-2 shadow-lg shadow-emerald-100 min-w-[140px] justify-center"
                            tabIndex="-1"
                        >
                            {isSaving ? (
                                <>
                                    <Icons.Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    GUARDANDO...
                                </>
                            ) : (
                                <>
                                    <Icons.Send size={14} />
                                    CARGAR NOTAS ({totalAPuntuar})
                                </>
                            )}
                        </Button>

                        <Link
                            href={route(
                                "empleados.acciones.evaluaciones.gestion",
                            )}
                        >
                            <Button
                                variant="warning"
                                className="gap-2"
                                tabIndex="-1"
                            >
                                <Icons.Eye size={18} /> VER REPORTES
                            </Button>
                        </Link>
                    </div>
                }
                footerStats={
                    <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest italic text-slate-500">
                        <p>
                            Total:{" "}
                            <span className="text-slate-800">
                                {stats.total}
                            </span>
                        </p>
                        <p>
                            Evaluados:{" "}
                            <span className="text-emerald-500">
                                {stats.evaluados}
                            </span>
                        </p>
                        <p>
                            Restantes:{" "}
                            <span className="text-orange-500">
                                {stats.restantes}
                            </span>
                        </p>
                        <div className="flex items-center gap-3 ml-4">
                            <span>Progreso:</span>
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(stats.evaluados / stats.total) * 100}%`,
                                    }}
                                    className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                />
                            </div>
                            <span className="text-indigo-600 font-black">
                                {(
                                    (stats.evaluados / stats.total) *
                                    100
                                ).toFixed(1)}
                                %
                            </span>
                        </div>
                    </div>
                }
            >
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] border-b">
                                <th className="px-8 py-5 text-left">
                                    Información Empleado
                                </th>
                                <th className="px-8 py-5 text-center">
                                    Estado en {fPeriodo}
                                </th>
                                <th className="px-8 py-5 text-right">
                                    Resultado Estimado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                            {datos.data.map((emp, index) => {
                                const employeeIndex =
                                    employeesWithoutEvaluation.findIndex(
                                        (e) => e.id === emp.id,
                                    );
                                return (
                                    <tr
                                        key={emp.id}
                                        className={`hover:bg-indigo-50/20 transition-all ${
                                            focusedEmployeeId === emp.id
                                                ? "bg-indigo-50/50 ring-2 ring-indigo-400"
                                                : ""
                                        }`}
                                    >
                                        <td className="px-8 py-4 text-left">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${emp.evaluaciones.length > 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                                                >
                                                    {emp.evaluaciones.length >
                                                    0 ? (
                                                        <Icons.CheckCircle
                                                            size={20}
                                                        />
                                                    ) : (
                                                        emp.nombres[0]
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none">
                                                        {emp.nombres}{" "}
                                                        {emp.apellidos}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold mt-1">
                                                        C.I: {emp.cedula}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            {emp.evaluaciones.length > 0 ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase">
                                                        Puntaje:{" "}
                                                        {
                                                            emp.evaluaciones[0]
                                                                .puntuacion
                                                        }
                                                    </span>
                                                    <span className="text-[8px] text-slate-400 font-bold mt-1 italic uppercase">
                                                        Evaluado el{" "}
                                                        {dayjs(
                                                            emp.evaluaciones[0]
                                                                .fecha_evaluacion,
                                                        ).format("DD-MM-YYYY")}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center items-center gap-3">
                                                    <input
                                                        ref={(el) => {
                                                            if (el) {
                                                                scoreInputRefs.current[
                                                                    emp.id
                                                                ] = el;
                                                            }
                                                        }}
                                                        type="number"
                                                        value={
                                                            bulkScores[
                                                                emp.id
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            setBulkScores({
                                                                ...bulkScores,
                                                                [emp.id]:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        onKeyDown={(e) =>
                                                            handleScoreKeyDown(
                                                                e,
                                                                emp.id,
                                                                employeeIndex,
                                                            )
                                                        }
                                                        placeholder="Puntuar del 1 al 500"
                                                        className="w-48 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-center font-black text-indigo-600 placeholder:text-slate-300 focus:border-indigo-500 outline-none transition-all"
                                                        tabIndex={
                                                            employeeIndex >= 0
                                                                ? 1
                                                                : -1
                                                        }
                                                    />
                                                    <Icons.AlertCircle
                                                        size={16}
                                                        className="text-amber-400 animate-pulse"
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            {emp.evaluaciones.length > 0 ? (
                                                <span className="text-emerald-600 font-black uppercase text-[10px]">
                                                    {emp.evaluaciones[0]
                                                        .puntuacion >= 400
                                                        ? "Altamente Calificado"
                                                        : "Calificado"}
                                                </span>
                                            ) : bulkScores[emp.id] ? (
                                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg border border-indigo-100 font-black text-[9px] uppercase">
                                                    Pre-carga:{" "}
                                                    {bulkScores[emp.id]} pts
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 italic uppercase text-[9px]">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
