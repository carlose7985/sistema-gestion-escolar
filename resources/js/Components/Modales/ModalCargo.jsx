import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import * as Icons from "lucide-react";

export default function ModalCargo({ emp, cargos, onClose, onUpdateSuccess }) {
    const { data, setData, post, processing } = useForm({
        tipo_de_personal: emp.tipo_de_personal || "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("empleados.activos.updateCargo", emp.id), {
            onSuccess: () => {
                onClose();
                if (onUpdateSuccess) onUpdateSuccess();
            },
            preserveScroll: true,
        });
    };

    // Color del cargo actual para el header
    const currentCargo = data.tipo_de_personal || "Sin asignar";

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
                {/* HEADER GRADIENTE */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white relative border-b-4 border-indigo-400/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                            <Icons.Briefcase size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-black uppercase text-sm tracking-wider">
                                Cambiar Cargo
                            </h3>
                            <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
                                Asignación de funciones
                            </p>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO */}
                <div className="p-8 space-y-6">
                    {/* INFO DEL EMPLEADO */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border-2 border-slate-100/80 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0">
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

                    {/* CARGO ACTUAL */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/70 rounded-xl border-2 border-indigo-100/80">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Cargo Actual
                        </span>
                        <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {emp.tipo_de_personal || "SIN ASIGNAR"}
                        </span>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Icons.GitBranch
                                    size={14}
                                    className="text-indigo-500"
                                />
                                Nuevo Cargo
                            </label>
                            <select
                                value={data.tipo_de_personal}
                                onChange={(e) =>
                                    setData("tipo_de_personal", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 hover:border-indigo-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <option value="">Seleccionar cargo...</option>
                                {cargos.map((c) => (
                                    <option
                                        key={c.id}
                                        value={c.nombre_del_cargo}
                                    >
                                        {c.nombre_del_cargo.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                type="submit"
                                loading={processing}
                                className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                                disabled={
                                    !data.tipo_de_personal ||
                                    data.tipo_de_personal ===
                                        emp.tipo_de_personal
                                }
                            >
                                <Icons.Save size={16} className="mr-2" />
                                ACTUALIZAR CARGO
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
