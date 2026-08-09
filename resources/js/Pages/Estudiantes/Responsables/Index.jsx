import React, { useState, useEffect, useCallback, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { Button } from "@/Components/ui/button";
import { Head, useForm, router, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios"; // Asegúrate de tener axios importado
import {
    UserPlus,
    Edit,
    Printer,
    Trash2,
    Calendar,
    Phone,
    X,
    Save,
    Loader2,
    ArrowLeftCircle,
    MapPin,
    Fingerprint,
    Briefcase,
    Users,
    Eye,
} from "lucide-react";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { confirmDelete } from "@/Utils/confirmDelete";

export default function Index({ datos, filters }) {
    const [search, setSearch] = useState(filters?.search || "");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(null);

    // Estado para el modal de representados
    const [viewRepresentados, setViewRepresentados] = useState(null);

    const { data, setData, post, put, reset, processing, errors, clearErrors } =
        useForm({
            name_r: "",
            documento_r: "V-",
            cedula_r: "",
            fecha_de_nacimiento_r: "",
            sexo_r: "",
            telefono_r: "",
            direccion_r: "",
            ocupacion_r: "",
            parentesco_r: "",
        });

    const updateSearch = useCallback(
        debounce((query) => {
            router.get(
                route("estudiantes.registro.responsables.index"), // Ajustado a tu ruta real
                { search: query },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 500),
        [],
    );
   
    // Busca esta función y reemplázala por esta versión limpia:
    const clearSearchAndFocus = () => {
        // 1. Limpiar el estado local inmediatamente
        setSearch("");

        // 2. Limpiar la URL y recargar datos
        router.get(
            route("estudiantes.registro.responsables.index"),
            { search: "", page: 1 },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onFinish: () => {
                    // 3. Dar foco al input después de que Inertia termine
                    setTimeout(() => {
                        // Buscamos el input por su atributo search o por su tipo
                        const input =
                            document.querySelector(
                                'input[id="universal-search"]',
                            ) ||
                            document.querySelector(
                                'input[placeholder*="Buscar..."]',
                            );
                        if (input) {
                            input.focus();
                        }
                    }, 100);
                },
            },
        );
    };

    useEffect(() => {
        if (search !== (filters?.search || "")) {
            updateSearch(search);
        }
    }, [search]);

    // Dentro del componente Index, después de las funciones existentes

  const toggleStatus = (responsable) => {
      const nuevoStatus =
          responsable.status_r === "Activo" ? "Inactivo" : "Activo";

      Swal.fire({
          title: `¿${nuevoStatus === "Activo" ? "Activar" : "Inactivar"} responsable?`,
          text: `Vas a cambiar el estado de ${responsable.name_r}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, cambiar",
          showLoaderOnConfirm: true,
          preConfirm: async () => {
              try {
                  await axios.patch(
                      route(
                          "estudiantes.registro.responsables.updateStatus",
                          responsable.id,
                      ),
                      { status_r: nuevoStatus },
                  );
                  return true;
              } catch (error) {
                  Swal.showValidationMessage("Error al actualizar");
                  return false;
              }
          },
      }).then((result) => {
          if (result.isConfirmed) {
              // Mostramos el éxito
              Swal.fire({
                  icon: "success",
                  title: "¡Actualizado!",
                  timer: 1000, // Tiempo corto
                  showConfirmButton: false,
              }).then(() => {
                  // ¡AQUÍ! Cuando el modal de éxito desaparece, limpiamos y damos foco
                  clearSearchAndFocus();
              });
          }
      });
  };

    const openCreate = () => {
        reset();
        clearErrors();
        setEditMode(false);
        setShowModal(true);
    };

    const openEdit = (responsable) => {
        setEditMode(responsable.id);
        setData({
            name_r: responsable.name_r,
            documento_r: responsable.documento_r || "V-",
            cedula_r: responsable.cedula_r,
            fecha_de_nacimiento_r: responsable.fecha_de_nacimiento_r,
            sexo_r: responsable.sexo_r,
            telefono_r: responsable.telefono_r || "",
            direccion_r: responsable.direccion_r,
            ocupacion_r: responsable.ocupacion_r || "",
            parentesco_r: responsable.parentesco_r || "",
        });
        clearErrors();
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route("estudiantes.registro.responsables.update", editMode), {
                onSuccess: () => {
                    setShowModal(false);
                    clearSearchAndFocus(); // <--- Llamada limpia
                },
                onError: () => toast.error("Error al actualizar"),
            });
        } else {
            post(route("estudiantes.registro.responsables.store"), {
                onSuccess: () => {
                    setShowModal(false);
                    clearSearchAndFocus(); // <--- Llamada limpia
                },
                onError: () => toast.error("Error al guardar"),
            });
        }
    };

    const handlePrint = (id) => {
        window.open(
            route("estudiantesExport", {
                type: "constancia-de-reunion",
                responsableId: id,
            }),
            "_blank",
        );
         clearSearchAndFocus();
    };

    // Función auxiliar para procesar los representados y evitar duplicados inter-listas
    const procesarRepresentados = (responsable) => {
        if (!responsable)
            return { directos: [], asociados: [], totalUnicos: 0 };

        const directos = responsable.representados_directos || [];
        const asociadosTodo = responsable.representados_asociados || [];

        // Filtrar asociados para que no contengan alumnos que ya están en directos
        const directosIds = new Set(directos.map((d) => d.id));
        const asociados = asociadosTodo.filter((a) => !directosIds.has(a.id));

        return {
            directos,
            asociados,
            totalUnicos: directos.length + asociados.length,
        };
    };

    const infoRepresentados = procesarRepresentados(viewRepresentados);

    return (
        <AuthenticatedLayout>
            <Head title="Directorio de Responsables" />

            <ViewContainer
                title="Directorio de Responsables"
                subtitle="Gestión de representantes legales y progenitores"
                icon="Users"
                showSearch={true}
                searchValue={search}
                onSearch={(val) => setSearch(val)}
                currentPage={datos.current_page}
                totalPages={datos.last_page}
                onPageChange={(page) =>
                    router.get(
                        route("estudiantes.registro.responsables.index"),
                        { page, search: filters.search },
                        { preserveState: true },
                    )
                }
                actions={
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-lg"
                    >
                        <UserPlus size={16} /> Nuevo Responsable
                    </button>
                }
                returns={
                    <Link href={route("estudiantes.registro.index")}>
                        <Button>
                            <ArrowLeftCircle size={18} /> VOLVER
                        </Button>
                    </Link>
                }
                footerStats={
                    <span>
                        Responsables registrados:{" "}
                        <b className="text-indigo-600">{datos.total}</b>
                    </span>
                }
            >
                <div className="flex-1 overflow-hidden rounded-t-[1.5rem] border border-slate-200 bg-white shadow-xl">
                    <div className="h-full overflow-auto custom-scrollbar">
                        <table className="w-full border-collapse select-text">
                            <thead className="sticky top-0 z-20 bg-blue-600 text-white">
                                <tr className="text-[10px] font-black uppercase tracking-widest italic">
                                    <th className="px-6 py-3 text-left">
                                        Información Personal
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        Ubicación y Contacto
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        Status
                                    </th>
                                    {/* NUEVO TH SOLICITADO */}
                                    <th className="px-6 py-3 text-center">
                                        Carga Familiar
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] divide-y divide-slate-50">
                                {datos.data.map((item) => {
                                    const { totalUnicos } =
                                        procesarRepresentados(item);
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-indigo-50/40 transition-colors group"
                                        >
                                            <td className="px-6 py-3 border-l-[5px] border-l-indigo-500">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">
                                                        {item.name_r}
                                                    </span>
                                                    <div className="flex gap-4 mt-1">
                                                        <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 uppercase">
                                                            <Fingerprint
                                                                size={12}
                                                                className="text-slate-700"
                                                            />{" "}
                                                            {item.cedula_r}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
                                                            <Calendar
                                                                size={12}
                                                                className="text-indigo-400"
                                                            />{" "}
                                                            {dayjs(
                                                                item.fecha_de_nacimiento_r,
                                                            ).format(
                                                                "DD-MM-YYYY",
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-start gap-1.5 text-[10px] font-medium text-slate-500 italic leading-tight">
                                                        <MapPin
                                                            size={12}
                                                            className="text-slate-300 mt-0.5"
                                                        />{" "}
                                                        {item.direccion_r}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase">
                                                        <Phone size={12} />{" "}
                                                        {item.telefono_r ||
                                                            "S/N"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={
                                                                item.status_r ===
                                                                "Activo"
                                                            }
                                                            onChange={() =>
                                                                toggleStatus(
                                                                    item,
                                                                )
                                                            }
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                                        <span className="ms-2 text-xs font-medium text-gray-700">
                                                            {item.status_r ||
                                                                "Inactivo"}
                                                        </span>
                                                    </label>
                                                </div>
                                            </td>

                                            {/* NUEVO TD SOLICITADO */}
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() =>
                                                        setViewRepresentados(
                                                            item,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white rounded-xl font-bold transition-all border border-slate-200"
                                                >
                                                    <Eye size={12} />
                                                    <span>
                                                        {totalUnicos}{" "}
                                                        {totalUnicos === 1
                                                            ? "Alumno"
                                                            : "Alumnos"}
                                                    </span>
                                                </button>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        title="Actualizar Datos"
                                                        onClick={() =>
                                                            openEdit(item)
                                                        }
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center border border-amber-100 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        title="Imprimir Constancia"
                                                        onClick={() =>
                                                            handlePrint(item.id)
                                                        }
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center border border-indigo-100 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all"
                                                    >
                                                        <Printer size={14} />
                                                    </button>
                                                    <button
                                                        title="Eliminar registro"
                                                        onClick={() =>
                                                            confirmDelete(
                                                                route(
                                                                    "estudiantes.registro.responsables.destroy",
                                                                    item.id,
                                                                ),
                                                                "¿Eliminar este activo?",
                                                                `Vas a remover de forma definitiva el registro.`,
                                                            )
                                                        }
                                                        className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ViewContainer>

            {/* MODAL ORIGINAL DE REGISTRO/EDICIÓN */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-3xl p-8 border border-white">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white ${editMode ? "bg-amber-500" : "bg-indigo-600"}`}
                                >
                                    {editMode ? (
                                        <Edit size={24} />
                                    ) : (
                                        <UserPlus size={24} />
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
                                    {editMode
                                        ? "Actualizar Responsable"
                                        : "Nuevo Responsable"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >
                            <div className="col-span-2">
                                <Field
                                    label="Nombre y Apellido *"
                                    value={data.name_r}
                                    onChange={(e) =>
                                        setData("name_r", e.target.value)
                                    }
                                    error={errors.name_r}
                                    required
                                    className="capitalize"
                                />
                            </div>
                            <div className="flex gap-2 items-end">
                                <div className="w-20">
                                    <SelectField
                                        label="Doc."
                                        value={data.documento_r}
                                        options={["V-", "E-"]}
                                        onChange={(e) =>
                                            setData(
                                                "documento_r",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <Field
                                        label="Identificación *"
                                        value={data.cedula_r}
                                        onChange={(e) =>
                                            setData(
                                                "cedula_r",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        error={errors.cedula_r}
                                        required
                                    />
                                </div>
                            </div>
                            <SelectField
                                label="Género *"
                                value={data.sexo_r}
                                options={[
                                    { v: "M", l: "Masculino" },
                                    { v: "F", l: "Femenino" },
                                ]}
                                onChange={(e) =>
                                    setData("sexo_r", e.target.value)
                                }
                                error={errors.sexo_r}
                                required
                            />
                            <Field
                                label="Fecha de Nacimiento *"
                                type="date"
                                value={data.fecha_de_nacimiento_r}
                                onChange={(e) =>
                                    setData(
                                        "fecha_de_nacimiento_r",
                                        e.target.value,
                                    )
                                }
                                error={errors.fecha_de_nacimiento_r}
                                required
                            />
                            <Field
                                label="Teléfono de Contacto"
                                value={data.telefono_r}
                                onChange={(e) =>
                                    setData("telefono_r", e.target.value)
                                }
                                error={errors.telefono_r}
                                icon={<Phone size={14} />}
                            />
                            <Field
                                label="Ocupación / Profesión"
                                value={data.ocupacion_r}
                                onChange={(e) =>
                                    setData("ocupacion_r", e.target.value)
                                }
                                error={errors.ocupacion_r}
                                icon={<Briefcase size={14} />}
                                className="capitalize"
                            />
                            <div className="col-span-2">
                                <Field
                                    label="Dirección de Habitación"
                                    value={data.direccion_r}
                                    onChange={(e) =>
                                        setData("direccion_r", e.target.value)
                                    }
                                    error={errors.direccion_r}
                                    icon={<MapPin size={14} />}
                                    className="capitalize"
                                />
                            </div>
                            <div className="col-span-2 flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3"
                                >
                                    {processing ? (
                                        <Loader2
                                            className="animate-spin"
                                            size={16}
                                        />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {editMode
                                        ? "Actualizar Datos"
                                        : "Guardar Responsable"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* NUEVO MODAL COMPLEMENTARIO: DETALLE DE REPRESENTADOS */}
            {viewRepresentados && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-3xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Cabecera del modal */}
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                        Estudiantes Vinculados a:
                                    </h4>
                                    <p className="text-[14px] text-slate-400 font-medium font-mono">
                                        {viewRepresentados.name_r}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewRepresentados(null)}
                                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Cuerpo de Cuentas */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-center">
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block mb-1">
                                    Directos (Padre/Madre)
                                </span>
                                <b className="text-2xl font-black text-emerald-700">
                                    {infoRepresentados.directos.length}
                                </b>
                            </div>
                            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-center">
                                <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 block mb-1">
                                    Representados (Representante)
                                </span>
                                <b className="text-2xl font-black text-blue-700">
                                    {infoRepresentados.asociados.length}
                                </b>
                            </div>
                        </div>

                        {/* Listas de Estudiantes */}
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {/* Grupo Directos */}
                            {infoRepresentados.directos.map((est) => {
                                // Obtenemos la información académica del primer elemento del array (el más reciente)
                                const infoAcademica =
                                    est.estudiante_periodos?.[0];

                                return (
                                    <div
                                        key={est.id}
                                        className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-slate-700 uppercase text-[10px] tracking-tight">
                                                {est.name} {est.apellido}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase">
                                                    {infoAcademica?.grado
                                                        ? `${infoAcademica.grado.nombre_del_grado} - "${infoAcademica.grado.seccion}"`
                                                        : "Grado no asignado"}
                                                </span>
                                                {/* BADGE DE STATUS ESCOLAR */}
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                                                        infoAcademica?.status ===
                                                        "Activo"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : infoAcademica?.status ===
                                                                "Retirado"
                                                              ? "bg-rose-50 text-rose-700 border-rose-200"
                                                              : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}
                                                >
                                                    {infoAcademica?.status ||
                                                        "S/S"}{" "}
                                                    -{" "}
                                                    {infoAcademica?.status_escolar ||
                                                        "S/E"}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-600 text-white rounded-md uppercase self-center shadow-sm">
                                            Directo
                                        </span>
                                    </div>
                                );
                            })}

                            {/* GRUPO ASOCIADOS (Repetir la misma lógica) */}
                            {infoRepresentados.asociados.map((est) => {
                                const infoAcademica =
                                    est.estudiante_periodos?.[0];

                                return (
                                    <div
                                        key={est.id}
                                        className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-slate-700 uppercase text-[10px] tracking-tight">
                                                {est.name} {est.apellido}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase">
                                                    {infoAcademica?.grado
                                                        ? `${infoAcademica.grado.nombre_del_grado} - "${infoAcademica.grado.seccion}"`
                                                        : "Grado no asignado"}
                                                </span>
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                                                        infoAcademica?.status ===
                                                        "Activo"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : infoAcademica?.status ===
                                                                "Retirado"
                                                              ? "bg-rose-50 text-rose-700 border-rose-200"
                                                              : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}
                                                >
                                                    {infoAcademica?.status ||
                                                        "S/S"}{" "}
                                                    -{" "}
                                                    {infoAcademica?.status_escolar ||
                                                        "S/E"}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black px-2 py-0.5 bg-blue-600 text-white rounded-md uppercase self-center shadow-sm">
                                            Representado
                                        </span>
                                    </div>
                                );
                            })}

                            {infoRepresentados.totalUnicos === 0 && (
                                <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                        Este responsable no tiene alumnos
                                        asignados actualmente.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Botón de cierre */}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setViewRepresentados(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-800 transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
