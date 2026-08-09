import React, { useState, useEffect, useMemo, useRef } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import * as Icons from "lucide-react";
import { Button } from "@/Components/ui/button";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Field } from "@/Components/Layout/FormComponents";
import ConfiguracionInicialCierre from "@/Components/Modales/ConfiguracionInicialCierre";
import dayjs from "dayjs";
import "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("es");

export default function AsistenciaEstudiantes({
    grados,
    fechaSeleccionada,
    gradoEstudiantesCounts,
    asistenciaDataInitial,
    asistenciaExistenteHoy,
    isWeekend,
    isHoliday, // Prop para detectar feriado
    holidayDescription, // Prop con el motivo del feriado
    fechasFaltantes = [],
    statusCierre,
    mostrarModalConfiguracionInicial = false,
    mostrarModalCierrePeriodo = false,
    mesSugerido,
    anioSugerido,
    periodoActivo,
    periodoNombre,
}) {
    // --- ESTADOS ---
    const [processing, setProcessing] = useState(false);
    const [localDate, setLocalDate] = useState(fechaSeleccionada);
    const [asistenciaData, setAsistenciaData] = useState(
        JSON.parse(JSON.stringify(asistenciaDataInitial)),
    );
    const [hasChanges, setHasChanges] = useState(false);
    const [showFestivoModal, setShowFestivoModal] = useState(false);
    const [selectedDatesToMark, setSelectedDatesToMark] = useState([]);
    const [motivoFestivo, setMotivoFestivo] = useState("");

    // Refs para el guardián de navegación
    const [isSaving, setIsSaving] = useState(false);
    const isSavingProcess = useRef(false);
    const hasChangesRef = useRef(false);

    // --- NUEVOS ESTADOS PARA ESCANEO ---
    const [isScanning, setIsScanning] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showConfigModal, setShowConfigModal] = useState(
        mostrarModalConfiguracionInicial,
    );
    const [recargar, setRecargar] = useState(false);

    const handleConfigSuccess = () => {
        setShowConfigModal(false);
        // Recargar la página para que tome la nueva configuración
        window.location.reload();
    };

    // Al inicio de tu componente, después de los estados
    const [showModalCierrePeriodo, setShowModalCierrePeriodo] = useState(
        mostrarModalCierrePeriodo,
    );

    const [isClosingPeriod, setIsClosingPeriod] = useState(false); // <--- NUEVO ESTADO

    // --- HANDLER DE CIERRE DE PERÍODO ---
    // 🔥 Efecto para cerrar el modal cuando el estado cambie
    useEffect(() => {
        if (mostrarModalCierrePeriodo === false) {
            setShowModalCierrePeriodo(false);
        }
    }, [mostrarModalCierrePeriodo]);

    const handleCerrarPeriodo = () => {
        setIsClosingPeriod(true);

        router.post(
            route("estudiantes.acciones.periodo.escolar.toggle", {
                periodo_escolar: periodoActivo?.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsClosingPeriod(false);
                    // 🔥 Recargar la página, el useEffect cerrará el modal
                    router.reload();
                },
                onError: (errors) => {
                    setIsClosingPeriod(false);
                    toast.error(
                        "Error al cerrar el período: " + (errors.message || ""),
                    );
                },
            },
        );
    };

    useEffect(() => {
        isSavingProcess.current = isSaving;
    }, [isSaving]);

    // --- SINCRONIZACIÓN Y DETECCIÓN DE CAMBIOS ---
    useEffect(() => {
        const changed = grados.some((grado) => {
            const cur = asistenciaData[grado.id] || { varones: 0, hembras: 0 };
            const ini = asistenciaDataInitial[grado.id] || {
                varones: 0,
                hembras: 0,
            };
            return cur.varones !== ini.varones || cur.hembras !== ini.hembras;
        });
        setHasChanges(changed);
        hasChangesRef.current = changed;
    }, [asistenciaData, grados, asistenciaDataInitial]);

    // --- CÁLCULOS COMPUTADOS ---
    const totales = useMemo(() => {
        return Object.values(asistenciaData).reduce(
            (acc, curr) => ({
                varones: acc.varones + (Number(curr?.varones) || 0),
                hembras: acc.hembras + (Number(curr?.hembras) || 0),
                total:
                    acc.total +
                    (Number(curr?.varones) || 0) +
                    (Number(curr?.hembras) || 0),
            }),
            { varones: 0, hembras: 0, total: 0 },
        );
    }, [asistenciaData]);

    const validarCantidad = (gradoId, tipo, valor) => {
        // Si el usuario borra todo, lo tratamos como 0 para el estado
        if (valor === "") {
            const newData = { ...asistenciaData };
            newData[gradoId][tipo] = 0;
            setAsistenciaData(newData);
            return;
        }

        // Convertimos a número entero para limpiar ceros a la izquierda (ej: "01" -> 1)
        // Si no es un número válido, usamos 0
        let val = parseInt(valor, 10);
        if (isNaN(val)) val = 0;

        const maximo = gradoEstudiantesCounts[gradoId][tipo];
        const gradoNombre =
            grados.find((g) => g.id === gradoId)?.nombre_del_grado ||
            "este grado";

        if (val > maximo) {
            const newData = { ...asistenciaData };
            newData[gradoId][tipo] = maximo;
            setAsistenciaData(newData);

            Swal.fire({
                title: '<span class="text-slate-800 font-black uppercase italic">¡Límite Excedido!</span>',
                html: `
                <div class="text-left text-sm p-2">
                    <p class="font-medium text-slate-500 mb-4">No puedes exceder la matrícula actual del grado.</p>
                    <div class="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4">
                        <p class="text-[10px] font-black uppercase text-amber-700 mb-1">Detalles:</p>
                        <p class="text-xs font-bold text-slate-700">GRADO: ${gradoNombre}</p>
                        <p class="text-xs font-bold text-slate-700">GÉNERO: ${tipo.toUpperCase()}</p>
                        <p class="text-xs font-black text-rose-600">CAPACIDAD MÁXIMA: ${maximo}</p>
                    </div>
                </div>
            `,
                icon: "warning",
                confirmButtonText: "ENTENDIDO",
                confirmButtonColor: "#0f172a",
                customClass: {
                    popup: "rounded-[2.5rem] border-4 border-white shadow-2xl",
                    confirmButton:
                        "rounded-xl px-8 py-3 font-black text-[10px] tracking-widest",
                },
            });
            return;
        }

        const newData = { ...asistenciaData };
        newData[gradoId][tipo] = val;
        setAsistenciaData(newData);
    };
    // --- GUARDADO ---
    const handleSave = (onSuccessCallback = null) => {
        isSavingProcess.current = true;
        setIsSaving(true);
        const payload = {
            fechaSeleccionada: localDate,
            asistenciaData: grados.map((g) => ({
                grado_id: g.id,
                varones: asistenciaData[g.id]?.varones ?? 0,
                hembras: asistenciaData[g.id]?.hembras ?? 0,
            })),
        };

        router.post(route("recursos.asistencia.estudiantes.store"), payload, {
            preserveScroll: true,
            onSuccess: () => {
                hasChangesRef.current = false;
                setHasChanges(false);
                //toast.success("Asistencia guardada correctamente");
                if (onSuccessCallback) onSuccessCallback();
            },
            onFinish: () => {
                setIsSaving(false);
                isSavingProcess.current = false;
            },
        });
    };

    // --- GUARDIÁN DE NAVEGACIÓN ---
    useEffect(() => {
        const unregister = router.on("before", (event) => {
            if (!hasChangesRef.current || isSavingProcess.current) return;
            if (event.detail.visit.url === window.location.href) return;

            event.preventDefault();

            Swal.fire({
                title: '<span class="text-slate-800 font-black uppercase italic">Cambios Pendientes</span>',
                text: "¿Deseas guardar la asistencia de hoy antes de salir?",
                icon: "question",
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: "GUARDAR Y SALIR",
                denyButtonText: "SALIR SIN GUARDAR",
                cancelButtonText: "CANCELAR",
                confirmButtonColor: "#10b981",
                denyButtonColor: "#64748b",
                customClass: {
                    popup: "rounded-[3rem] p-10 shadow-2xl border-4 border-white",
                    confirmButton:
                        "rounded-xl px-6 py-3 font-black text-[10px]",
                    denyButton: "rounded-xl px-6 py-3 font-black text-[10px]",
                    cancelButton: "rounded-xl px-6 py-3 font-black text-[10px]",
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    handleSave(() => router.visit(event.detail.visit.url));
                } else if (result.isDenied) {
                    hasChangesRef.current = false;
                    router.visit(event.detail.visit.url);
                }
            });
        });

        return () => unregister();
    }, [localDate, asistenciaData]);

    // --- NAVEGACIÓN DE FECHAS ---
    const navigateToDate = (date) => {
        hasChangesRef.current = false;
        router.get(
            route("recursos.asistencia.estudiantes.index"),
            { fecha: date },
            {
                preserveState: false, // Forzar recarga para traer datos de otros meses
                preserveScroll: true,
            },
        );
    };

    const handleSaveFestivos = () => {
        if (selectedDatesToMark.length === 0)
            return toast.error("Seleccione al menos una fecha");
        setProcessing(true);
        router.post(
            route("settings.festivos.asistencia.store"),
            {
                fechas: selectedDatesToMark,
                descripcion: motivoFestivo,
            },
            {
                onSuccess: () => {
                    setProcessing(false);
                    setShowFestivoModal(false);
                    setSelectedDatesToMark([]);
                    // toast.success("Calendario de feriados actualizado");
                },
            },
        );
    };

    const getInitials = (n) => n.charAt(0).toUpperCase();

    const processFile = async (file) => {
        if (!file) return;
        setIsScanning(true);
        const toastId = toast.loading("Analizando planilla de asistencia...");

        const formData = new FormData();
        formData.append("document", file);
        formData.append("fecha_objetivo", localDate);

        try {
            const response = await axios.post(
                route("recursos.scan.formulario.asistencia"),
                formData,
            );
            const { data_asistencia } = response.data;

            // Verifica aquí en la consola de tu navegador cómo llega la estructura:
            // Debe verse como un Objeto {} y no como un Arreglo []
            console.log("Datos recibidos de Laravel:", data_asistencia);

            setAsistenciaData((prev) => ({
                ...prev,
                ...data_asistencia,
            }));

            toast.success("Asistencia cargada desde la imagen", {
                id: toastId,
            });
        } catch (error) {
            console.error(error);
            toast.error("No se detectaron datos para la fecha seleccionada", {
                id: toastId,
            });
        } finally {
            setIsScanning(false);
        }
    };
    // --- FUNCIONES DE CÁMARA (Reutilizables de tu otra vista) ---
    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            toast.error("No se pudo acceder a la cámara.");
            setShowCamera(false);
        }
    };
    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const file = new File([blob], "asistencia.jpg", {
                type: "image/jpeg",
            });
            stopCamera();
            processFile(file);
        }, "image/jpeg");
    };
    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
        setShowCamera(false);
    };
    const [modalCreate, setModalCreate] = useState(false);

    // FORMULARIO DE ESTADÍSTICAS
    const formCreate = useForm({
        fecha: "",
        dias_habiles: "",
        dias_laborados: "",
        status: "Cerrado",
    });

    useEffect(() => {
        if (statusCierre?.bloqueado) {
            Swal.fire({
                title: '<span class="text-slate-900 font-black uppercase italic tracking-tighter text-xl">Acceso Restringido</span>',
                html: `
                        <div class="p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-4">
                            <p class="text-xs font-bold text-rose-600 uppercase tracking-widest leading-tight">
                                Integridad administrativa activa.
                            </p>
                        </div>
                        <p class="text-[11px] font-black text-slate-500 uppercase italic">
                            Debes registrar el cierre de:
                        </p>
                        <p class="text-2xl font-black text-blue-600 uppercase italic mt-2 underline decoration-blue-200">
                            ${statusCierre.mes_nombre} ${statusCierre.anio}
                        </p>
                    `,
                icon: "warning",
                showConfirmButton: true,
                confirmButtonText: "REGISTRAR CIERRE AHORA",
                confirmButtonColor: "#0f172a",
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                    popup: "rounded-[3rem] border-4 border-white shadow-2xl p-6",
                    confirmButton:
                        "rounded-2xl font-black italic px-8 py-4 tracking-widest text-[10px] uppercase shadow-xl shadow-blue-500/20",
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    // PRE-RELLENAMOS LA FECHA (Primer día del mes pendiente)
                    const fechaSugerida = `${statusCierre.anio}-${statusCierre.mes_numero}-01`;
                    formCreate.setData("fecha", fechaSugerida);
                    setModalCreate(true); // <--- AQUÍ ABRIMOS TU MODAL
                }
            });
        }
    }, [statusCierre]);

    // MANEJADOR DEL SUBMIT DEL MODAL
    const handleSubmitCreate = (e) => {
        e.preventDefault();
        if (formCreate.data.dias_laborados > formCreate.data.dias_habiles) {
            return toast.error("Error: Días laborados exceden a los hábiles.");
        }
        formCreate.post(route("estudiantes.acciones.estadisticas.store"), {
            // Ajusta a tu ruta real
            onSuccess: () => {
                setModalCreate(false);
                formCreate.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Asistencia Diaria" />

            <ViewContainer
                title={
                    isHoliday
                        ? "DÍA FESTIVO"
                        : asistenciaExistenteHoy
                          ? "EDICIÓN DE ASISTENCIA"
                          : "CONTROL DE ASISTENCIA"
                }
                subtitle="Registro y actualización de asistencias"
                icon="UserCheck"
                showSearch={false}
                actions={
                    <>
                        <Link href={route("recursos.index")}>
                            <Button>
                                <Icons.ChevronLeftCircle size={14} />
                                VOLVER
                            </Button>
                        </Link>
                        {/* Botones agrupados en móvil */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="primary"
                                onClick={startCamera}
                                size="sm"
                                className="text-[10px] md:text-xs"
                            >
                                <Icons.Camera
                                    size={14}
                                    className="mr-1 md:mr-2"
                                />
                                <span className="hidden sm:inline">
                                    Escanear
                                </span>
                                <span className="sm:hidden">📷</span>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => processFile(e.target.files[0])}
                                accept="image/*"
                            />
                            <Button
                                variant="primary"
                                onClick={() => fileInputRef.current.click()}
                                size="sm"
                                className="text-[10px] md:text-xs"
                            >
                                <Icons.UploadCloud
                                    size={14}
                                    className="mr-1 md:mr-2"
                                />
                                <span className="hidden sm:inline">
                                    Subir Foto
                                </span>
                                <span className="sm:hidden">⬆️</span>
                            </Button>
                        </div>
                    </>
                }
                actionFooter={
                    <div className="flex flex-wrap items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-3 md:gap-6">
                            <div className="flex items-center gap-1 md:gap-2">
                                <Icons.Mars
                                    size={14}
                                    className="text-blue-500"
                                />
                                <span className="text-[15px] md:text-[15px] font-black text-slate-500 uppercase">
                                    V:{" "}
                                    <b className="text-blue-600 text-sm">
                                        {totales.varones}
                                    </b>
                                </span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <Icons.Venus
                                    size={14}
                                    className="text-pink-500"
                                />
                                <span className="text-[15px] md:text-[15px] font-black text-slate-500 uppercase">
                                    H:{" "}
                                    <b className="text-pink-600 text-sm">
                                        {totales.hembras}
                                    </b>
                                </span>
                            </div>
                            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <Icons.Users
                                    size={14}
                                    className="text-indigo-500"
                                />
                                <span className="text-[15px] md:text-[15px] font-black text-slate-500 uppercase">
                                    TOTAL:{" "}
                                    <b className="text-slate-900 text-sm">
                                        {totales.total}
                                    </b>
                                </span>
                            </div>
                        </div>
                    </div>
                }
            >
                {/* Modal de cámara - responsive */}
                {showCamera && (
                    <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-2 md:p-4">
                        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl md:rounded-3xl bg-slate-900 shadow-2xl">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-auto"
                            />
                            <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex justify-center gap-4 md:gap-6">
                                <Button
                                    onClick={stopCamera}
                                    variant="destructive"
                                    className="rounded-full w-12 h-12 md:w-16 md:h-16"
                                >
                                    <Icons.X size={20} />
                                </Button>
                                <Button
                                    onClick={takePhoto}
                                    className="rounded-full w-20 h-20 md:w-24 md:h-24 border-4 md:border-8 border-white bg-blue-600"
                                >
                                    <Icons.Zap size={32} />
                                </Button>
                            </div>
                        </div>
                        <p className="mt-4 md:mt-6 text-white font-black uppercase italic tracking-widest text-center text-xs md:text-sm px-4">
                            Enfoque la columna del día:{" "}
                            {dayjs(localDate).format("DD-MM")}
                        </p>
                    </div>
                )}
                {/* Alerta de días faltantes - responsive */}
                {fechasFaltantes?.length > 0 && !isHoliday && !isWeekend && (
                    <div className="mb-2 bg-rose-300 text-white p-3 rounded-2xl md:rounded-[2.5rem] shadow-2xl border-b-4 border-indigo-500 animate-in slide-in-from-top-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                            <div className="flex items-center gap-3 md:gap-5">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                                    <Icons.CalendarClock size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm md:text-lg font-black uppercase italic tracking-tighter">
                                        Se detectaron asistencias faltantes
                                    </h4>
                                    <p className="text-[9px] md:text-[11px] font-bold text-gray-50 uppercase tracking-widest">
                                        Hay{" "}
                                        <span className="text-white text-xs md:text-sm">
                                            {fechasFaltantes.length}
                                        </span>{" "}
                                        día(s) hábiles previos sin registros.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowFestivoModal(true)}
                                className="bg-white text-indigo-900 hover:bg-emerald-400 hover:text-white font-black text-[9px] md:text-[10px] rounded-xl md:rounded-2xl px-4 md:px-8 h-8 md:h-10 shadow-xl transition-all"
                            >
                                RESOLVER CALENDARIO
                            </Button>
                        </div>
                    </div>
                )}
                <div className="h-full flex flex-col gap-3">
                    {/* BARRA DE NAVEGACIÓN DE FECHAS - RESPONSIVE */}
                    <div className="bg-white border border-slate-200 p-2 md:p-2 rounded-[1.5rem] md:rounded-[1.5rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                            <div
                                className={`p-2 md:p-2
                                     rounded-xl md:rounded-2xl shadow-inner ${
                                         isHoliday
                                             ? "bg-purple-100 text-purple-600"
                                             : asistenciaExistenteHoy
                                               ? "bg-emerald-50 text-emerald-600"
                                               : "bg-blue-50 text-blue-600"
                                     }`}
                            >
                                <Icons.CalendarCheck
                                    size={20}
                                    className="md:w-7 md:h-7"
                                />
                            </div>
                            <div>
                                <p className="text-sm md:text-lg font-black text-slate-800 uppercase italic leading-tight">
                                    {dayjs(localDate).format(
                                        "dddd D MMMM YYYY",
                                    )}
                                </p>

                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                    {isHoliday ? (
                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[8px] md:text-[9px] font-black uppercase">
                                            Festivo
                                        </span>
                                    ) : isWeekend ? (
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] md:text-[9px] font-black uppercase">
                                            Fin de semana
                                        </span>
                                    ) : asistenciaExistenteHoy ? (
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] md:text-[9px] font-black uppercase">
                                            Registrado
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] md:text-[9px] font-black uppercase">
                                            Pendiente
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!isWeekend && !isHoliday && (
                            <Button
                                onClick={() => handleSave()}
                                disabled={
                                    isSavingProcess.current ||
                                    (!hasChanges && asistenciaExistenteHoy)
                                }
                                className={`h-10 md:h-12 px-4 md:px-10 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl ${
                                    hasChanges
                                        ? "bg-amber-500 hover:bg-amber-600 animate-pulse"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                            >
                                {isSavingProcess.current ? (
                                    <Icons.Loader2
                                        className="animate-spin mr-1"
                                        size={14}
                                    />
                                ) : (
                                    <Icons.Save className="mr-1" size={14} />
                                )}
                                {hasChanges
                                    ? "Guardar"
                                    : asistenciaExistenteHoy
                                      ? "Guardado"
                                      : "Registrar"}
                            </Button>
                        )}

                        <div className="flex items-center bg-slate-100 border border-slate-300 rounded-xl md:rounded-2xl p-1 shadow-inner">
                            <button
                                onClick={() =>
                                    navigateToDate(
                                        dayjs(localDate)
                                            .subtract(1, "day")
                                            .format("YYYY-MM-DD"),
                                    )
                                }
                                className="p-1.5 md:p-2.5 bg-slate-300 hover:bg-slate-500 hover:text-indigo-600 rounded-lg md:rounded-xl transition-all"
                            >
                                <Icons.ChevronLeft size={16} color="white" />
                            </button>
                            <input
                                type="date"
                                value={localDate}
                                max={dayjs().format("YYYY-MM-DD")}
                                onChange={(e) => navigateToDate(e.target.value)}
                                className="bg-transparent border-none text-[10px] md:text-[11px] font-black uppercase text-slate-700 focus:ring-0 px-2 md:px-4 w-28 md:w-auto"
                            />
                            <button
                                onClick={() =>
                                    navigateToDate(
                                        dayjs(localDate)
                                            .add(1, "day")
                                            .format("YYYY-MM-DD"),
                                    )
                                }
                                disabled={dayjs(localDate).isSame(
                                    dayjs(),
                                    "day",
                                )}
                                className="p-1.5 md:p-2.5 bg-slate-300 hover:bg-slate-500 hover:text-indigo-600 rounded-lg md:rounded-xl transition-all disabled:opacity-20"
                            >
                                <Icons.ChevronRight size={16} color="white" />
                            </button>
                        </div>
                    </div>

                    {/* TABLA RESPONSIVE: scroll horizontal en móvil */}
                    {isWeekend || isHoliday ? (
                        <div
                            className={`flex-1 flex flex-col items-center justify-center rounded-[1.5rem] md:rounded-[1.5rem] border-4 border-dashed p-6 md:p-8 text-center ${
                                isHoliday
                                    ? "bg-purple-50 border-purple-100"
                                    : "bg-amber-50 border-amber-100"
                            }`}
                        >
                            {isHoliday ? (
                                <>
                                    <Icons.CalendarCheck
                                        size={48}
                                        className="text-purple-200 mb-2 md:mb-4"
                                    />
                                    <h3 className="text-xl md:text-2xl font-black text-purple-800 uppercase italic">
                                        Día Festivo
                                    </h3>
                                    <p className="text-xs md:text-sm font-bold text-purple-600 uppercase italic">
                                        {holidayDescription}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Icons.CalendarOff
                                        size={48}
                                        className="text-amber-200 mb-2 md:mb-4"
                                    />
                                    <h3 className="text-xl md:text-2xl font-black text-amber-800 uppercase italic">
                                        Fin de Semana
                                    </h3>
                                    <p className="text-xs md:text-sm font-bold text-amber-600 uppercase">
                                        Día no laborable
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[1.5rem] overflow-hidden shadow-xl">
                            {/* Contenedor con scroll horizontal para tabla */}
                            <div className="h-full overflow-auto custom-scrollbar">
                                <div className="min-w-[600px] md:min-w-full">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 z-20 bg-slate-900 text-white uppercase text-[9px] md:text-[10px] font-black tracking-widest italic">
                                            <tr>
                                                <th className="px-4 md:px-8 py-3 md:py-5 text-left border-r border-white/10">
                                                    Grado
                                                </th>
                                                <th className="px-4 md:px-8 py-3 md:py-5 text-center border-r border-white/10 w-32 md:w-44">
                                                    Varones
                                                </th>
                                                <th className="px-4 md:px-8 py-3 md:py-5 text-center border-r border-white/10 w-32 md:w-44">
                                                    Hembras
                                                </th>
                                                <th className="px-4 md:px-8 py-3 md:py-5 text-center w-24 md:w-32">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[10px] md:text-[11px]">
                                            {grados.map((grado) => {
                                                // Obtenemos los totales existentes desde el prop que enviamos del controlador
                                                const existentesVarones =
                                                    gradoEstudiantesCounts[
                                                        grado.id
                                                    ]?.varones || 0;
                                                const existentesHembras =
                                                    gradoEstudiantesCounts[
                                                        grado.id
                                                    ]?.hembras || 0;

                                                return (
                                                    <tr
                                                        key={grado.id}
                                                        className="hover:bg-slate-50/50 transition-colors group"
                                                    >
                                                        {/* COLUMNA GRADO */}
                                                        <td className="px-4 md:px-8 py-3 md:py-4 border-r border-slate-50 font-black">
                                                            <div className="flex items-center gap-2 md:gap-4">
                                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black border border-slate-200 shadow-inner group-hover:bg-white transition-colors uppercase text-xs md:text-base">
                                                                    {getInitials(
                                                                        grado.nombre_del_grado,
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-800 uppercase text-xs md:text-sm leading-tight md:leading-none mb-0.5 md:mb-1">
                                                                        {
                                                                            grado.nombre_del_grado
                                                                        }
                                                                    </p>
                                                                    <p className="text-[8px] md:text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                                                        Sección
                                                                        "
                                                                        {grado.seccion ||
                                                                            "U"}
                                                                        "
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* COLUMNA VARONES */}
                                                        <td className="px-4 md:px-6 py-3 md:py-4 border-r border-slate-50 text-center relative">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {" "}
                                                                {/* Cambio a flex horizontal */}
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        asistenciaData[
                                                                            grado
                                                                                .id
                                                                        ]
                                                                            ?.varones ??
                                                                        0
                                                                    }
                                                                    onFocus={(
                                                                        e,
                                                                    ) =>
                                                                        e.target.select()
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        validarCantidad(
                                                                            grado.id,
                                                                            "varones",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-16 md:w-20 py-2 md:py-3 bg-blue-50 border-2 border-blue-100 focus:border-blue-500 focus:bg-white rounded-xl md:rounded-2xl text-center text-base md:text-lg font-black text-blue-700 transition-all outline-none"
                                                                />
                                                                {/* Indicador a la derecha */}
                                                                <div className="flex flex-col items-start leading-none">
                                                                    <span className="text-[8px] md:text-[9px] font-bold text-blue-400 uppercase italic">
                                                                        Mat.
                                                                    </span>
                                                                    <span className="text-xs md:text-sm font-black text-blue-600">
                                                                        {
                                                                            existentesVarones
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* COLUMNA HEMBRAS */}
                                                        <td className="px-4 md:px-6 py-3 md:py-4 border-r border-slate-50 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {" "}
                                                                {/* Cambio a flex horizontal */}
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        asistenciaData[
                                                                            grado
                                                                                .id
                                                                        ]
                                                                            ?.hembras ??
                                                                        0
                                                                    }
                                                                    onFocus={(
                                                                        e,
                                                                    ) =>
                                                                        e.target.select()
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        validarCantidad(
                                                                            grado.id,
                                                                            "hembras",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-16 md:w-20 py-2 md:py-3 bg-pink-50 border-2 border-pink-100 focus:border-pink-500 focus:bg-white rounded-xl md:rounded-2xl text-center text-base md:text-lg font-black text-pink-700 transition-all outline-none"
                                                                />
                                                                {/* Indicador a la derecha */}
                                                                <div className="flex flex-col items-start leading-none">
                                                                    <span className="text-[8px] md:text-[9px] font-bold text-pink-400 uppercase italic">
                                                                        Mat.
                                                                    </span>
                                                                    <span className="text-xs md:text-sm font-black text-pink-600">
                                                                        {
                                                                            existentesHembras
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* COLUMNA TOTAL */}
                                                        <td className="px-4 md:px-8 py-3 md:py-4 text-center bg-slate-50/30 font-black text-slate-700">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-base md:text-lg">
                                                                    {(Number(
                                                                        asistenciaData[
                                                                            grado
                                                                                .id
                                                                        ]
                                                                            ?.varones,
                                                                    ) || 0) +
                                                                        (Number(
                                                                            asistenciaData[
                                                                                grado
                                                                                    .id
                                                                            ]
                                                                                ?.hembras,
                                                                        ) || 0)}
                                                                </span>
                                                                <span className="text-[8px] md:text-[9px] text-slate-400 uppercase font-bold italic">
                                                                    de{" "}
                                                                    {existentesVarones +
                                                                        existentesHembras}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* MODAL FESTIVOS - RESPONSIVE */}
                {showFestivoModal &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 md:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-white rounded-2xl md:rounded-[3.5rem] w-full max-w-md md:max-w-xl p-5 md:p-10 shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)] border-2 border-indigo-100 relative animate-in zoom-in-95">
                                <button
                                    onClick={() => setShowFestivoModal(false)}
                                    className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-300 hover:text-rose-500"
                                >
                                    <Icons.X
                                        size={20}
                                        className="md:w-7 md:h-7"
                                    />
                                </button>

                                <div className="flex flex-col items-center text-center mb-6 md:mb-8">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-3 md:mb-4 shadow-inner ring-4 md:ring-8 ring-indigo-50/50">
                                        <Icons.CalendarCheck
                                            size={28}
                                            className="md:w-10 md:h-10"
                                        />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
                                        Ajuste de Calendario
                                    </h3>
                                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase mt-1 md:mt-2 italic">
                                        Seleccione los días no laborables
                                    </p>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <div className="max-h-48 md:max-h-60 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
                                        {fechasFaltantes.map((f) => (
                                            <label
                                                key={f.fecha}
                                                className="flex items-center justify-between p-3 md:p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl md:rounded-2xl border border-slate-100 mb-2 cursor-pointer transition-all group"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">
                                                        {f.dia_nombre}
                                                    </span>
                                                    <span className="text-xs md:text-sm font-black text-slate-700 uppercase">
                                                        {f.formateada}
                                                    </span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 md:w-6 md:h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedDatesToMark.includes(
                                                        f.fecha,
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked)
                                                            setSelectedDatesToMark(
                                                                [
                                                                    ...selectedDatesToMark,
                                                                    f.fecha,
                                                                ],
                                                            );
                                                        else
                                                            setSelectedDatesToMark(
                                                                selectedDatesToMark.filter(
                                                                    (d) =>
                                                                        d !==
                                                                        f.fecha,
                                                                ),
                                                            );
                                                    }}
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <div className="pt-3 md:pt-4 border-t border-slate-100">
                                        <Field
                                            label="Descripción del motivo (Opcional)"
                                            placeholder="EJ: NATALISIO DE SIMON BOLIVAR"
                                            upperCase
                                            value={motivoFestivo}
                                            onChange={(e) =>
                                                setMotivoFestivo(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSaveFestivos}
                                        loading={processing}
                                        disabled={
                                            selectedDatesToMark.length === 0
                                        }
                                        className="w-full h-12 md:h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl md:rounded-3xl font-black shadow-xl shadow-indigo-100 uppercase text-[10px] md:text-xs tracking-widest mt-3 md:mt-4"
                                    >
                                        MARCAR COMO NO LABORABLES (
                                        {selectedDatesToMark.length})
                                    </Button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
                {/* TU MODAL (Portal Neon) */}
                {modalCreate &&
                    createPortal(
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] border-4 border-white relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Botón X solo si quieres permitir que el usuario vea la tabla sin editar 
                                                (Pero el Swal volverá a saltar si recarga) */}

                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200">
                                        <Icons.CalendarCheck size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">
                                            Cierre de Mes
                                        </h3>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">
                                            Faltan estadísticas de{" "}
                                            {statusCierre?.mes_nombre}
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleSubmitCreate}
                                    className="space-y-8"
                                >
                                    <Field
                                        label="Mes a Cerrar *"
                                        type="date"
                                        readOnly // Para que no cambie el mes que debe cerrar
                                        value={formCreate.data.fecha}
                                        error={formCreate.errors.fecha}
                                        className="bg-slate-50 cursor-not-allowed"
                                    />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Field
                                            label="Días Hábiles *"
                                            type="text"
                                            autoFocus
                                            mask="00"
                                            placeholder="Ej: 22"
                                            value={formCreate.data.dias_habiles}
                                            onChange={(e) =>
                                                formCreate.setData(
                                                    "dias_habiles",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            error={
                                                formCreate.errors.dias_habiles
                                            }
                                        />
                                        <Field
                                            label="Días Laborados *"
                                            type="text"
                                            mask="00"
                                            placeholder="Ej: 20"
                                            value={
                                                formCreate.data.dias_laborados
                                            }
                                            onChange={(e) =>
                                                formCreate.setData(
                                                    "dias_laborados",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            error={
                                                formCreate.errors.dias_laborados
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="xl"
                                        loading={formCreate.processing}
                                        className="w-full h-20 bg-indigo-600 rounded-[2rem] font-black shadow-2xl shadow-indigo-200 text-xs tracking-widest"
                                    >
                                        FINALIZAR Y DESBLOQUEAR
                                    </Button>
                                </form>
                            </motion.div>
                        </div>,
                        document.body,
                    )}
                {/* MODAL DE CIERRE DE PERÍODO */}
                {showModalCierrePeriodo &&
                    createPortal(
                        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl border-4 border-amber-400 relative"
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Icons.AlertTriangle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                                        Período Abierto
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500 mt-2">
                                        El período{" "}
                                        <span className="text-amber-600">
                                            {periodoNombre}
                                        </span>{" "}
                                        está{" "}
                                        <span className="text-amber-600">
                                            ABIERTO
                                        </span>
                                    </p>
                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                        Debes cerrar el período antes de
                                        registrar asistencia
                                    </p>
                                </div>

                                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                                    <p className="text-[10px] font-black text-amber-700 uppercase text-center leading-relaxed">
                                        ⚠️ Al cerrar el período se consolidarán
                                        las estadísticas finales
                                        <br />
                                        <span className="text-amber-500">
                                            (Matrícula Final e Inicial)
                                        </span>
                                    </p>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            router.visit(
                                                route("recursos.index"),
                                            )
                                        }
                                        className="flex-1 h-14 rounded-2xl font-black"
                                    >
                                        VOLVER
                                    </Button>
                                    <Button
                                        onClick={handleCerrarPeriodo}
                                        disabled={isClosingPeriod}
                                        className="flex-1 h-14 bg-amber-600 hover:bg-amber-700 rounded-2xl font-black shadow-xl disabled:opacity-50"
                                    >
                                        {isClosingPeriod ? (
                                            <>
                                                <Icons.Loader2
                                                    size={18}
                                                    className="mr-2 animate-spin"
                                                />
                                                CERRANDO...
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Lock
                                                    size={18}
                                                    className="mr-2"
                                                />
                                                CERRAR PERÍODO
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>,
                        document.body,
                    )}
                {/* TU ConfiguracionInicialCierre EXISTENTE */}
                <ConfiguracionInicialCierre
                    mostrar={showConfigModal}
                    mesSugerido={mesSugerido}
                    anioSugerido={anioSugerido}
                    periodoActivo={periodoActivo}
                    onSuccess={handleConfigSuccess}
                />
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
