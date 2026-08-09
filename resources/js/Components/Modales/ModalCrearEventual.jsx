import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { toast } from "sonner";

export default function ModalCrearEventual({ emp, onClose, onUpdateSuccess }) {
    // 1. Configuración del Formulario con Inertia (se añade el tipo "Eventual")
    const { data, setData, post, processing, reset , errors} = useForm({
        tipo: "Eventual",
        fecha_de_inicio: "",
        fecha_final: "",
        descripcion: "",
    });

    const submit = (e) => {
        e.preventDefault();

        // Validación de coherencia de fechas
        if (data.fecha_final < data.fecha_de_inicio) {
            return toast.error(
                "La fecha de retorno no puede ser anterior a la de inicio",
            );
        }

        post(route("empleados.inactivos.permisos.store", emp.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (onUpdateSuccess) onUpdateSuccess();
                onClose();
            },
            onError: (err) => {
                toast.error("Error al procesar el registro");
            },
        });
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative border-4 border-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CABECERA DEL MODAL */}
                <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Icons.FileText size={28} />
                        <div>
                            <h3 className="font-black uppercase italic text-sm leading-none">
                                Registro de Permiso Eventual
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Icons.X size={24} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* COLUMNA IZQUIERDA: CONTEXTO */}
                        <div className="space-y-4">
                            <div className="bg-slate-50 h-32 rounded-[1rem] border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Información de Control:
                                </p>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold  uppercase mt-1 tracking-widest text-blue-800">
                                        Personal: {emp.nombres} {emp.apellidos}
                                    </p>
                                    <p className="text-xs font-black text-slate-700 uppercase">
                                        C.I: {emp.documento}
                                        {emp.cedula}
                                    </p>
                                    <p className="text-xs font-bold text-blue-600 uppercase italic">
                                        Status: {emp.situacion_laboral}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-amber-50 rounded-[1.5rem] border border-amber-100 flex gap-3">
                                <Icons.Info
                                    className="text-amber-500 shrink-0"
                                    size={20}
                                />
                                <p className="text-[9px] font-bold text-amber-700 leading-tight uppercase">
                                    El empleado pasará a status "EN PERMISO"
                                    automáticamente al procesar este formulario.
                                </p>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: CAMPOS */}
                        <div className="space-y-4">
                            <SelectField
                                label="Motivo o Justificación"
                                value={data.descripcion}
                                options={[
                                    "Permiso Médico",
                                    "Permiso por Cuido",
                                    "Permiso Pre-Post",
                                    "Permiso Solicitado",
                                    "Otros",
                                ]}
                                onChange={(e) =>
                                    setData("descripcion", e.target.value)
                                }
                                error={errors.descripcion}
                            />
                            <Field
                                label="Fecha Inicio"
                                type="date"
                                value={data.fecha_de_inicio}
                                onChange={(e) =>
                                    setData("fecha_de_inicio", e.target.value)
                                }
                                required
                            />
                            <Field
                                label="Fecha Final"
                                type="date"
                                value={data.fecha_final}
                                onChange={(e) =>
                                    setData("fecha_final", e.target.value)
                                }
                                required
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    variant="primary"
                                    loading={processing}
                                >
                                    ACTIVAR PERMISO
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* ADORNO DE FONDO */}
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none">
                    <Icons.FileText size={150} />
                </div>
            </motion.div>
        </div>
    );
}
