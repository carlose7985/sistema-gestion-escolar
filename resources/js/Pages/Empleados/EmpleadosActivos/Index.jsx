import React, { useCallback, useEffect, useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/ui/Button";
import { Head, Link, router, usePage } from "@inertiajs/react";
import * as Icons from "lucide-react";
import dayjs from "dayjs";
import { GestorPermisos } from "@/Components/GestorPermisos";
import { GestorDocumentos } from "@/Components/GestorDocumentos";
import { AnimatePresence, motion } from "framer-motion";
import ModalFoto from "@/Components/Modales/ModalFoto";
import ModalRostro from "@/Components/Modales/ModalRostro";
import ModalHuella from "@/Components/Modales/ModalHuella";
import Swal from "sweetalert2";
import ModalCargo from "@/Components/Modales/ModalCargo";
import ModalStatus from "@/Components/Modales/ModalStatus";
import ModalCrearPermanente from "@/Components/Modales/ModalCrearPermanente";
import ModalCrearEventual from "@/Components/Modales/ModalCrearEventual";
import ModalCrearVacacion from "@/Components/Modales/ModalCrearVacacion";

export default function Index({ empleados, cargos = [], filters }) {
    // --- ESTADOS ÚNICOS PARA MODALES ---
    const [empForPhoto, setEmpForPhoto] = useState(null);
    const [empForStatus, setEmpForStatus] = useState(null);
    const [empForCargo, setEmpForCargo] = useState(null);
    const [empForEventual, setEmpForEventual] = useState(null);
    const [empForPermanente, setEmpForPermanente] = useState(null);
    const [empForVacacion, setEmpForVacacion] = useState(null);

    // Biometría
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [showRostro, setShowRostro] = useState(false);
    const [showHuella, setShowHuella] = useState(false);

    const [showAgeId, setShowAgeId] = useState(null);
    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const searchInputRef = useRef(null);
    const searchTimer = useRef(null);

    // Regla de Bloqueo
    const STATUS_BLOQUEADOS = [
        "Comision de Servicios",
        "Proceso de Jubilacion",
        "Proceso Administrativo",
    ];
    const { flash } = usePage().props;
    const [showWaModal, setShowWaModal] = useState(false);
    const [waData, setWaData] = useState(null);

    useEffect(() => {
        console.log("Flash recibido:", flash); // 👈 Agrega este log para depurar
        if (flash?.whatsapp_message) {
            setWaData(flash.whatsapp_message);
            setShowWaModal(true);
        }
    }, [flash]);

    const handleOpenStatus = (emp) => {
        if (STATUS_BLOQUEADOS.includes(emp.situacion_laboral)) {
            toast.info("Acción Protegida", {
                description:
                    "Este estatus está vinculado a un cronograma activo y no puede cambiarse manualmente.",
                className: "rounded-2xl border-blue-100 shadow-2xl",
            });
            return;
        }
        setEmpForStatus(emp);
    };

    // BÚSQUEDA CORREGIDA - SOLO ESTA FUNCIÓN
    const handleSearch = (val) => {
        setLocalSearch(val);

        if (searchTimer.current) clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => {
            router.get(
                route("empleados.activos.listado.index"),
                {
                    ...filters,
                    search: val,
                    page: 1,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 400);
    };

    // Resetear búsqueda
    const resetSearchAndFocus = useCallback(() => {
        if (localSearch === "") return;
        setLocalSearch("");
        router.get(
            route("empleados.activos.listado.index"),
            { search: "", page: 1 },
            { preserveState: true, replace: true },
        );
        setTimeout(() => searchInputRef.current?.focus(), 500);
    }, [localSearch]);

    const handleDelete = (emp) => {
        Swal.fire({
            title: '<span class="text-slate-800 font-black uppercase tracking-tighter">¿Retirar Empleado?</span>',
            html: `<p class="text-sm text-slate-500 font-medium">Se moverá a <b>${emp.nombres}</b> al historial de personal retirado.</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "SÍ, RETIRAR",
            cancelButtonText: "CANCELAR",
            confirmButtonColor: "#ef4444",
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            customClass: {
                popup: "rounded-[2.5rem] p-10 border-4 border-white shadow-2xl",
                confirmButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-lg",
                cancelButton:
                    "rounded-xl px-6 py-3 font-black text-[10px] uppercase tracking-widest",
            },
            preConfirm: () => {
                return new Promise((resolve) => {
                    router.delete(route("empleados.activos.destroy", emp.id), {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.close();
                            resetSearchAndFocus();
                            resolve();
                        },
                        onError: () => {
                            Swal.showValidationMessage(
                                "Error: No se pudo completar la operación",
                            );
                            resolve();
                        },
                        onFinish: () => {
                            resolve();
                        },
                    });
                });
            },
        });
    };
    // Dentro del componente, antes del return
    const colorClasses = {
        emerald: "bg-emerald-500 text-white border-emerald-200",
        rose: "bg-rose-500 text-white border-rose-200",
        purple: "bg-purple-500 text-white border-purple-200",
        amber: "bg-amber-600 text-white border-amber-200",
        gray: "bg-gray-400 text-white border-gray-200",
        blue: "bg-blue-500 text-white border-blue-200",
        slate: "bg-slate-500 text-white border-slate-200",
    };

    return (
        <AuthenticatedLayout>
            <Head title="Personal Activo" />
            <ViewContainer
                title="Directorio de Personal"
                icon="Users"
                ref={searchInputRef}
                subtitle="Gestiónes administrativos"
                searchValue={localSearch}
                onSearch={handleSearch}
                currentPage={empleados.current_page}
                totalPages={empleados.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("empleados.activos.listado.index"),
                        {
                            ...filters,
                            search: localSearch,
                            page: page,
                        },
                        {
                            preserveState: true,
                            preserveScroll: true,
                        },
                    )
                }
                footerStats={
                    <span>
                        Total registros: <b>{empleados.total}</b>
                    </span>
                }
                returns={
                    <Link href={route("empleados.activos.index")}>
                        <Button>
                            <Icons.ArrowLeftCircle size={16} /> Volver
                        </Button>
                    </Link>
                }
                actions={
                    <div className="flex gap-2">
                        <Link href={route("empleados.activos.create")}>
                            <Button size="sm" variant="success">
                                <Icons.Plus size={16} /> NUEVO REGISTRO
                            </Button>
                        </Link>

                        {/* <AccionesReportes cargos={cargos} /> */}
                    </div>
                }
            >
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse select-text">
                            <thead className="sticky top-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest italic z-20">
                                <tr>
                                    <th className="p-3 w-5 text-center">
                                        Foto
                                    </th>
                                    <th className="p-3 border-r border-blue-500">
                                        Datos Personales
                                    </th>
                                    <th className="p-3 border-r border-blue-500">
                                        Contacto / Habitación
                                    </th>
                                    <th className="p-3 border-r border-blue-500 text-center">
                                        Laboral
                                    </th>
                                    <th className="p-3 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold text-slate-500">
                                {empleados.data.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors group relative hover:z-50"
                                    >
                                        {/* FOTO */}
                                        <td className="p-2 text-center">
                                            <div
                                                className="relative w-14 h-14 mx-auto group/img"
                                                title="Cargar/Actualizar Foto"
                                            >
                                                {emp.foto_url ? (
                                                    <img
                                                        key={emp.foto}
                                                        src={emp.foto_url}
                                                        className="w-full h-full object-cover rounded-2xl border-2 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
                                                        <Icons.User size={24} />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        setEmpForPhoto(emp)
                                                    } // <--- Solo seteamos al empleado y listo
                                                    className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110 shadow-lg"
                                                >
                                                    <Icons.Camera size={10} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* DATOS PERSONALES */}
                                        <td className="p-2 border-r border-slate-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-black text-slate-800 uppercase text-[13px] tracking-tight">
                                                        {emp.nombres}{" "}
                                                        {emp.apellidos}
                                                    </span>
                                                    <span className="text-slate-400 font-mono">
                                                        <Icons.IdCard
                                                            size={12}
                                                            className="inline mr-1"
                                                        />{" "}
                                                        {emp.documento}
                                                        {emp.cedula}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-slate-400 relative">
                                                        <Icons.Calendar
                                                            size={12}
                                                        />{" "}
                                                        {dayjs(
                                                            emp.fecha_de_nacimiento,
                                                        ).format("DD/MM/YYYY")}
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
                                                            className="text-blue-400"
                                                        >
                                                            <Icons.Cake
                                                                size={14}
                                                            />
                                                        </button>
                                                        {showAgeId ===
                                                            emp.id && (
                                                            <div className="absolute left-24 -top-8 bg-slate-900 text-white px-2 py-1 rounded-lg text-[9px] z-50">
                                                                {dayjs().diff(
                                                                    dayjs(
                                                                        emp.fecha_de_nacimiento,
                                                                    ),
                                                                    "year",
                                                                )}{" "}
                                                                AÑOS
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 ">
                                                    <a
                                                        href={route(
                                                            "empleados.activos.carnet",
                                                            emp.id,
                                                        )}
                                                        target="_blank"
                                                        className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm flex items-center justify-center"
                                                    >
                                                        <Icons.QrCode
                                                            size={12}
                                                        />
                                                    </a>
                                                    {/* <button
                                                        title="Biometría Facial"
                                                        onClick={() =>
                                                            handleCheckRostro(
                                                                emp,
                                                            )
                                                        } // <--- Llamada a la validación
                                                        className={`p-1.5 rounded-lg shadow-sm transition-all hover:scale-110 ${
                                                            emp.rostro_data
                                                                ? "bg-emerald-500 shadow-emerald-200"
                                                                : "bg-blue-600 shadow-blue-200"
                                                        } text-white`}
                                                    >
                                                        <ScanFace size={12} />
                                                    </button>

                                                  
                                                    <button
                                                        title="Huella Dactilar"
                                                        onClick={() =>
                                                            handleCheckHuella(
                                                                emp,
                                                            )
                                                        } // <--- Llamada a la validación
                                                        className={`p-1.5 rounded-lg shadow-sm transition-all hover:scale-110 ${
                                                            emp.huella_id
                                                                ? "bg-emerald-500 shadow-emerald-200"
                                                                : "bg-blue-600 shadow-blue-200"
                                                        } text-white`}
                                                    >
                                                        <Fingerprint
                                                            size={12}
                                                        />
                                                    </button> */}
                                                </div>
                                            </div>
                                        </td>

                                        {/* CONTACTO */}
                                        <td className="p-2 border-r border-slate-50 uppercase">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-start gap-2">
                                                    <Icons.MapPin
                                                        size={12}
                                                        className="text-blue-400 mt-0.5 shrink-0"
                                                    />{" "}
                                                    <span className="truncate">
                                                        {
                                                            emp.direccion_de_habitacion
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-800 font-black">
                                                    <Icons.Phone
                                                        size={12}
                                                        className="text-blue-500"
                                                    />{" "}
                                                    {emp.telefono}
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-600 italic lowercase truncate max-w-[180px]">
                                                    <Icons.Mail size={12} />{" "}
                                                    {emp.correo_electronico}
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-900 font-black text-[10px]">
                                                    <Icons.Layers
                                                        size={12}
                                                        className="text-blue-400"
                                                    />{" "}
                                                    ingreso:{" "}
                                                    {dayjs(
                                                        emp.fecha_de_ingreso_al_plantel,
                                                    ).format("MMMM YYYY")}
                                                </div>
                                            </div>
                                        </td>

                                        {/* LABORAL (VIGILANTE APLICADO) */}
                                        <td className="p-2 border-r border-slate-50 text-center">
                                            <div className="flex flex-col gap-2 max-w-[260px] mx-auto">
                                                <div
                                                    title={emp.detalle_permiso} // Opcional: muestra la razón al pasar el mouse
                                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors ${colorClasses[emp.color_real] || "bg-slate-400 text-white"}`}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleOpenStatus(
                                                                emp,
                                                            )
                                                        }
                                                        className="w-full text-left"
                                                    >
                                                        STATUS:{" "}
                                                        {emp.situacion_real}
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-100 transition-colors shadow-sm">
                                                    <button
                                                        onClick={() =>
                                                            setEmpForCargo(emp)
                                                        }
                                                        className="..."
                                                    >
                                                        CARGO:{" "}
                                                        {emp.tipo_de_personal}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="p-2 relative overflow-visible">
                                            <div className="flex justify-center gap-1.5">
                                                <Link
                                                    href={route(
                                                        "empleados.activos.show",
                                                        emp.id,
                                                    )}
                                                >
                                                    <Button
                                                        title="Ver/Actualizar Registro"
                                                        size="icon"
                                                        className="h-9 w-9 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600"
                                                    >
                                                        <Icons.UserPen
                                                            size={16}
                                                        />
                                                    </Button>
                                                </Link>

                                                {/* GESTOR CONECTADO A LOS MODALES DEL PADRE */}
                                                <GestorPermisos
                                                    empId={emp.id}
                                                    nombre={`${emp.nombres} ${emp.apellidos}`}
                                                    onOpenEventual={() =>
                                                        setEmpForEventual(emp)
                                                    }
                                                    onOpenPermanente={() =>
                                                        setEmpForPermanente(emp)
                                                    }
                                                    onOpenVacacion={() =>
                                                        setEmpForVacacion(emp)
                                                    }
                                                />

                                                <GestorDocumentos
                                                    empId={emp.id}
                                                    nombre={`${emp.nombres} ${emp.apellidos}`}
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(emp)
                                                    } // <--- Solo llamamos a la función
                                                    title="Mover a Historial de Retirados"
                                                    className="h-9 w-9 shadow-lg"
                                                >
                                                    <Icons.Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {empleados.data.length === 0 && (
                            <div className="p-32 text-center text-blue-600">
                                <Icons.FileStack
                                    size={64}
                                    className="mx-auto"
                                />
                                <p className="mt-4 font-black uppercase tracking-widest">
                                    Sin registros
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </ViewContainer>
            {/* --- MOTOR DE RENDERIZADO DE MODALES (LIMPIEZA ABSOLUTA) --- */}
            <AnimatePresence>
                {empForPhoto && ( // Si empForPhoto tiene datos, el modal EXISTE
                    <ModalFoto
                        key={empForPhoto.id} // <--- ESTO ES VITAL: Reinicia el modal al cambiar de ID
                        emp={empForPhoto}
                        onClose={() => setEmpForPhoto(null)} // Cerramos limpiando el estado
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}
                {showRostro && (
                    <ModalRostro
                        key={selectedEmp?.id} // <--- ESTO OBLIGA A REINICIAR EL MODAL
                        emp={selectedEmp}
                        onClose={() => setShowRostro(false)}
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}
                {showHuella && (
                    <ModalHuella
                        key={selectedEmp?.id} // <--- ESTO OBLIGA A REINICIAR EL MODAL
                        emp={selectedEmp}
                        onClose={() => setShowHuella(false)}
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}

                {empForStatus && (
                    <ModalStatus
                        key={`status-${empForStatus.id}`}
                        emp={empForStatus}
                        onClose={() => setEmpForStatus(null)}
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}
                {empForCargo && (
                    <ModalCargo
                        key={`cargo-${empForCargo.id}`}
                        emp={empForCargo}
                        cargos={cargos} // <--- Esta es la variable que daba error
                        onClose={() => setEmpForCargo(null)}
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}

                {empForPermanente && (
                    <ModalCrearPermanente
                        key={`perm-${empForPermanente.id}`}
                        emp={empForPermanente}
                        onClose={() => setEmpForPermanente(null)}
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}

                {empForVacacion && (
                    <ModalCrearVacacion
                        key={`vac-${empForVacacion.id}`}
                        emp={empForVacacion}
                        onClose={() => setEmpForVacacion(null)}
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}
                {empForEventual && (
                    <ModalCrearEventual
                        key={`event-${empForEventual.id}`}
                        emp={empForEventual}
                        onClose={() => setEmpForEventual(null)}
                        onUpdateSuccess={resetSearchAndFocus}
                    />
                )}
            </AnimatePresence>

               <AnimatePresence>
                            {showWaModal && (
                                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 text-center shadow-3xl border-4 border-white"
                                    >
                                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <Icons.MessageCircle size={40} />
                                        </div>
            
                                        <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">
                                            Enviar Comprobante
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-6">
                                            Notificar al trabajador sobre su permiso
                                        </p>
            
                                        <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                                                Trabajador
                                            </p>
                                            <p className="text-sm font-black text-slate-800 uppercase">
                                                {waData?.destinatario}
                                            </p>
                                            <p className="text-[10px] font-bold text-emerald-600 font-mono">
                                                {waData?.numero}
                                            </p>
                                        </div>
            
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={() => {
                                                    window.open(waData.url, "_blank");
                                                    setShowWaModal(false);
                                                }}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-emerald-200"
                                            >
                                                <Icons.Send size={16} className="mr-2" />{" "}
                                                ENVIAR COMPROBANTE
                                            </Button>
            
                                            <button
                                                onClick={() => setShowWaModal(false)}
                                                className="py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                            >
                                                Omitir envío
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
        </AuthenticatedLayout>
    );
}
