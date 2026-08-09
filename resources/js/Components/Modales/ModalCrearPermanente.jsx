import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Field, SelectField } from "@/Components/Layout/FormComponents";
import { toast } from "sonner";

export default function ModalCrearPermanente({
    emp,
    onClose,
    onUpdateSuccess,
}) {
    const { data, setData, post, processing ,errors } = useForm({
        empleado_id: emp.id,
        dias: [],
        descripcion: "",
        tipo: "Permanente",
    });

    const diasSemana = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        //"Domingo",
    ];

    const toggleDia = (dia) => {
        const nuevosDias = data.dias.includes(dia)
            ? data.dias.filter((d) => d !== dia)
            : [...data.dias, dia];
        setData("dias", nuevosDias);
    };

    const submit = (e) => {
        e.preventDefault();

        if (data.dias.length === 0) {
            return toast.warning(
                "Debe seleccionar al menos un día de la semana",
            );
        }

        // CORRECCIÓN: Pasamos emp.id para que Ziggy pueda construir la URL
        post(route("empleados.inactivos.permisos.store", emp.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (onUpdateSuccess) onUpdateSuccess();
                //    toast.success(`Días fijos asignados correctamente`);
                onClose();
            },
            onError: (err) => {
                toast.error("Error al procesar la solicitud");
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
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="mt-2">
                            <h3 className="font-black uppercase italic text-sm leading-none">
                                Registro de Permiso Permanente
                            </h3>
                            <p className="text-[10px] font-bold opacity-80 uppercase mt-1 tracking-widest text-blue-100">
                                Personal: {emp.nombres} {emp.apellidos}
                            </p>
                        </div>
                    </div>
                    <Icons.X
                        className="cursor-pointer text-slate-500 hover:text-white"
                        onClick={onClose}
                    />
                </div>

                <form
                    onSubmit={submit}
                    className="p-8 space-y-6 text-slate-800"
                >
                    <SelectField
                        label="Motivo"
                        value={data.descripcion}
                        options={[
                            "Horario Especial",
                            "Horario para Estudios",
                            "Cuidado de Familiar",
                            "Asignación Externa",
                            "Otros",
                        ]}
                        onChange={(e) => setData("descripcion", e.target.value)}
                        error={errors.descripcion}
                    />

                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                        Seleccione día(s) de permiso(s):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {diasSemana.map((dia) => (
                            <button
                                key={dia}
                                type="button"
                                onClick={() => toggleDia(dia)}
                                className={`p-3 rounded-xl border-2 transition-all font-black text-[9px] uppercase flex justify-between items-center ${
                                    data.dias.includes(dia)
                                        ? "bg-green-700 border-blue-600 text-white shadow-lg"
                                        : "bg-rose-700 border-slate-600 text-slate-50"
                                }`}
                            >
                                {dia}{" "}
                                {data.dias.includes(dia) && (
                                    <Icons.CheckCircle2 size={12} />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            type="submit"
                            loading={processing}
                            variant="primary"
                        >
                            ACTIVAR HORARIO FIJO
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-400 font-bold text-[10px]"
                        >
                            CANCELAR
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
