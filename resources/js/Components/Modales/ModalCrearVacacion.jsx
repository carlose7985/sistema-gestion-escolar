import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Field, SelectField } from "@/Components/Layout/FormComponents";

export default function ModalCrearVacacion({ emp, onClose, onUpdateSuccess }) {
    const { data, setData, post, processing , errors} = useForm({
        fecha_de_inicio: "",
        fecha_final: "",
        tipo: "Vacacion",
        descripcion: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("empleados.inactivos.permisos.store", emp.id), {
            onSuccess: () => {
                if (onUpdateSuccess) onUpdateSuccess();
                // toast.success("Vacaciones registradas");
                onClose();
            },
        });
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <div className="flex items-center gap-3 text-purple-600">
                        <Icons.Umbrella size={24} />
                        <h3 className="font-black uppercase italic text-sm text-slate-800">
                            Plan Vacacional
                        </h3>
                    </div>
                    <Icons.X
                        className="cursor-pointer text-slate-300"
                        onClick={onClose}
                    />
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 mb-6">
                        <p className="text-[10px] font-black text-purple-600 uppercase">
                            Empleado:
                        </p>
                        <p className="text-sm font-bold text-slate-700 uppercase">
                            {emp.nombres} {emp.apellidos}
                        </p>
                    </div>

                    <SelectField
                        label="Tipo de Vacación"
                        value={data.descripcion}
                        options={[
                            "Vacaciones Regulares",
                            "Adelanto de Vacaciones",
                            "Días Pendientes",
                            "Vacaciones Colectivas",
                            "Otros",
                        ]}
                        onChange={(e) => setData("descripcion", e.target.value)}
                        error={errors.descripcion}
                    />
                    <Field
                        label="Fecha Salida"
                        type="date"
                        value={data.fecha_de_inicio}
                        onChange={(e) =>
                            setData("fecha_de_inicio", e.target.value)
                        }
                        required
                    />
                    <Field
                        label="Fecha Retorno"
                        type="date"
                        value={data.fecha_final}
                        onChange={(e) => setData("fecha_final", e.target.value)}
                        required
                    />

                    <div className="flex justify-center">
                        <Button
                            variant="success"
                            type="submit"
                            loading={processing}
                        >
                            INICIAR PERIODO VACACIONAL
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
