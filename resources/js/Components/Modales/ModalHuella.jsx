import { useState, useEffect, useRef } from "react";
import { FingerprintIcon, XCircle, Loader2, Save, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

export default function ModalHuella({ emp, onClose, onUpdateSuccess }) {
    const [huellaId, setHuellaId] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false); // Seguro para evitar disparo automático
    const inputRef = useRef(null);

    // 1. Efecto de inicio: Limpiamos todo y damos foco
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true); // Solo aceptamos datos después de 500ms de abierto
            inputRef.current?.focus();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // 2. Mantener el foco forzado para capturar el lector USB
    useEffect(() => {
        const handleGlobalClick = () => {
            if (!isProcessing) inputRef.current?.focus();
        };
        document.addEventListener("click", handleGlobalClick);
        return () => document.removeEventListener("click", handleGlobalClick);
    }, [isProcessing]);

    // 3. FUNCIÓN DE GUARDADO (Separada)
    const executeSave = (id) => {
        setIsProcessing(true);
        router.post(
            route("empleados.huella", emp.id),
            { huella_id: id },
            {
                onSuccess: () => {
                    if (onUpdateSuccess) onUpdateSuccess();
                    // toast.success("Huella dactilar vinculada con éxito");
                    onClose();
                },
                onError: () => {
                    toast.error(
                        "Error al vincular. El sensor podría estar duplicado.",
                    );
                    setHuellaId("");
                    setIsProcessing(false);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    // 4. CAPTURA INTELIGENTE (Solo por tecla Enter o longitud mínima real)
    const handleKeyDown = (e) => {
        if (!isReady || isProcessing) return;

        // La mayoría de los lectores USB terminan su ráfaga con 'Enter'
        if (e.key === "Enter") {
            e.preventDefault();
            if (huellaId.length > 3) {
                executeSave(huellaId);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* OVERLAY DE PROCESAMIENTO */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center"
                        >
                            <Loader2
                                className="animate-spin text-orange-500 mb-4"
                                size={50}
                            />
                            <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest animate-pulse text-center px-8">
                                Registrando Firma Dactilar en MySQL...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="text-center mb-8">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                        <XCircle size={24} />
                    </button>

                    <div
                        className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl transition-all duration-500 ${
                            isReady
                                ? "bg-orange-100 text-orange-600 animate-pulse shadow-orange-100"
                                : "bg-slate-100 text-slate-300"
                        }`}
                    >
                        <FingerprintIcon size={48} />
                    </div>

                    <h3 className="font-black uppercase text-xl text-slate-800 tracking-tighter leading-none">
                        Vincular Sensor
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div
                            className={`w-2 h-2 rounded-full ${isReady ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {isReady
                                ? "Lector en espera"
                                : "Iniciando sistema..."}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    {/* INPUT INVISIBLE QUE CAPTURA EL LECTOR */}
                    <input
                        ref={inputRef}
                        type="text" // Cambiado a text para evitar conflictos de autocompletado de password
                        autoComplete="off"
                        name="sensor_input"
                        readOnly
                        placeholder="POSICIONE DEDO..."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-center font-black text-slate-700 outline-none transition-all focus:border-orange-500 shadow-inner"
                        value={huellaId}
                        onChange={(e) => setHuellaId(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {/* Capa protectora para evitar que el usuario borre o escriba a mano fácilmente */}
                    {!isProcessing && (
                        <div className="absolute inset-0 cursor-none opacity-0" />
                    )}
                </div>

                <p className="mt-8 text-[9px] font-bold text-center text-slate-400 uppercase tracking-[0.15em] leading-relaxed">
                    Personal:{" "}
                    <span className="text-slate-800 font-black">
                        {emp.nombres} {emp.apellidos}
                    </span>
                    <br />
                    <span className="italic">
                        El registro será automático al detectar el sensor
                    </span>
                </p>
            </motion.div>
        </div>
    );
}
