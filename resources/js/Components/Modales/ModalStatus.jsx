import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function ModalStatus({ emp, onClose, onUpdateSuccess }) {
    const { data, setData, post, processing } = useForm({
        situacion_laboral: emp.situacion_laboral || "Activo",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("empleados.activos.updateStatus", emp.id), {
            onSuccess: () => {
                onClose();
                if (onUpdateSuccess) onUpdateSuccess();
            },
            preserveScroll: true,
        });
    };

    // Mapeo de colores para cada status
    const statusColors = {
        Activo: "emerald",
        "Comision de servicio": "amber",
        "Proceso administrativo": "slate",
    };

    const currentColor = statusColors[data.situacion_laboral] || "blue";

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER GRADIENTE CON BORDE */}
                <div
                    className={`
                    bg-gradient-to-r from-${currentColor}-500 to-${currentColor}-600 
                    px-8 py-6 text-white relative
                    border-b-4 border-${currentColor}-300/50
                `}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                            <Icons.History size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-black uppercase text-sm tracking-wider">
                                Situación Laboral
                            </h3>
                            <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
                                Gestión de estatus del empleado
                            </p>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO */}
                <div className="p-8 space-y-6">
                    {/* INFO DEL EMPLEADO */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border-2 border-slate-100/80 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0">
                            {emp.nombres?.charAt(0)}
                            {emp.apellidos?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-slate-800 truncate">
                                {emp.nombres} {emp.apellidos}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Icons.IdCard
                                    size={12}
                                    className="text-slate-400"
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {emp.cedula || "Sin cédula"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* STATUS ACTUAL */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/70 rounded-xl border-2 border-blue-100/80">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Estatus Actual
                        </span>
                        <span
                            className={`
                            px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider
                            bg-${currentColor}-100 text-${currentColor}-700 border border-${currentColor}-200
                        `}
                        >
                            {emp.situacion_laboral || "Activo"}
                        </span>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Icons.GitBranch
                                    size={14}
                                    className="text-blue-500"
                                />
                                Nuevo Estatus
                            </label>
                            <select
                                value={data.situacion_laboral}
                                onChange={(e) =>
                                    setData("situacion_laboral", e.target.value)
                                }
                                className={`
                                    w-full bg-white border-2 rounded-2xl px-5 py-4 
                                    text-xs font-black text-slate-700 
                                    outline-none transition-all duration-300
                                    focus:border-${currentColor}-500 focus:ring-2 focus:ring-${currentColor}-500/20
                                    border-slate-200 hover:border-${currentColor}-300
                                    appearance-none cursor-pointer
                                    shadow-sm hover:shadow-md
                                `}
                            >
                                <option value="Activo">🟢 ACTIVO</option>
                                <option value="Comision de servicio">
                                    🟡 COMISIÓN DE SERVICIO
                                </option>
                                <option value="Proceso administrativo">
                                    ⚪ PROCESO ADMINISTRATIVO
                                </option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                type="submit"
                                loading={processing}
                                className={`
                                    w-full h-12 rounded-2xl 
                                    text-xs font-black uppercase tracking-wider
                                    bg-gradient-to-r from-${currentColor}-500 to-${currentColor}-600
                                    hover:from-${currentColor}-600 hover:to-${currentColor}-700
                                    text-white shadow-lg hover:shadow-xl
                                    transition-all duration-300
                                    border-0
                                `}
                            >
                                <Icons.Save size={16} className="mr-2" />
                                CONFIRMAR CAMBIO
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="w-full text-slate-400 font-bold text-[10px] hover:text-slate-600 hover:bg-slate-50/50 rounded-xl transition-all"
                            >
                                CANCELAR
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
