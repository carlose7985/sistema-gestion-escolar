import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { useForm } from "@inertiajs/react"; // Cambiamos router por useForm
import { toast } from "sonner";
import * as Icons from "lucide-react";

export default function ModalFoto({ emp, onClose, onUpdateSuccess }) {
    const [isCamera, setIsCamera] = useState(false);
    const [preview, setPreview] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // USAMOS useForm PARA MÁXIMA ROBUSTEZ
    const { data, setData, post, processing, reset } = useForm({
        foto: null,
    });

    // Sincronizar el preview con el form de Inertia
    useEffect(() => {
        setData("foto", preview);
    }, [preview]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreview(ev.target.result);
                setIsCamera(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setPreview(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 500, height: 500, facingMode: "user" },
            });
            streamRef.current = stream;
            setIsCamera(true);
        } catch (err) {
            toast.error("Error al acceder a la cámara.");
            setIsCamera(false);
        }
    };

    // Asegurar que el video se conecte al ref
    useEffect(() => {
        if (isCamera && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isCamera]);

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0, 500, 500);
            const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8); // Calidad 0.8 para evitar cuelgues por peso
            setPreview(dataUrl);
            stopCamera();
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCamera(false);
    };

   const save = (e) => {
       e.preventDefault();
       if (!data.foto)
           return toast.error("Capture o seleccione una imagen primero");

       post(route("empleados.activos.foto", emp.id), {
           forceFormData: true,
           preserveScroll: true,
           onSuccess: () => {
               if (onUpdateSuccess) onUpdateSuccess();
            //    toast.success(`Foto de ${emp.nombres} guardada`);
               onClose(); // Esta función ahora ejecuta setEmpForPhoto(null) en el padre
           },
           onError: () => toast.error("Error al guardar"),
       });
   };
    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3rem] p-8 max-w-sm w-full shadow-2xl border-4 border-white relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* OVERLAY DE CARGA PARA EVITAR CONGELAMIENTO */}
                <AnimatePresence>
                    {processing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
                        >
                            <Icons.Loader2
                                className="animate-spin text-indigo-600 mb-2"
                                size={40}
                            />
                            <p className="text-[10px] font-black uppercase text-slate-500">
                                Procesando Imagen...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Icons.Camera size={18} className="text-blue-600" />
                        <h3 className="font-black uppercase text-[10px] text-slate-800 tracking-widest italic">
                            Personal: {emp.nombres.split(" ")[0]}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <Icons.X size={20} />
                    </button>
                </div>

                <div className="aspect-square bg-slate-100 rounded-[2.5rem] overflow-hidden relative border-2 border-slate-100 shadow-inner">
                    {isCamera && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                        />
                    )}
                    {preview && !isCamera && (
                        <img
                            src={preview}
                            className="w-full h-full object-cover animate-in fade-in duration-500"
                        />
                    )}
                    {!isCamera && !preview && (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <Icons.Camera
                                size={48}
                                className="opacity-10 mb-2"
                            />
                            <p className="text-[8px] font-black uppercase">
                                Esperando acción
                            </p>
                        </div>
                    )}
                    {isCamera && (
                        <button
                            onClick={takePhoto}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 p-5 bg-rose-600 text-white rounded-full shadow-2xl border-4 border-white active:scale-90 transition-all"
                        >
                            <Icons.Camera size={24} />
                        </button>
                    )}
                </div>

                {!isCamera && !preview ? (
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                            onClick={startCamera}
                            className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 font-black uppercase text-[10px]"
                        >
                            <Icons.Camera size={24} /> Cámara
                        </button>
                        <label className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 cursor-pointer font-black uppercase text-[10px]">
                            <Icons.ImagePlus size={24} /> Archivo
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col gap-3">
                        {preview && (
                            <Button
                                onClick={save}
                                loading={processing}
                                variant="primary"
                                size="xl"
                            >
                                GUARDAR IDENTIDAD
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                setPreview(null);
                                setIsCamera(false);
                            }}
                            variant="ghost"
                            className="text-slate-400 text-[10px] font-black uppercase gap-2"
                        >
                            <Icons.RefreshCw size={14} /> Reintentar
                        </Button>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    width="500"
                    height="500"
                    className="hidden"
                />
            </motion.div>
        </div>
    );
}
