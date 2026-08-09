import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { ScanFace, X, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

export default function ModalRostro({ emp, onClose, onUpdateSuccess }) {
    const [status, setStatus] = useState("loading"); // loading, ready, scanning, processing, success
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
                    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
                    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
                ]);
                setStatus("ready");
            } catch (e) {
                toast.error("Error al inicializar IA local");
            }
        };
        loadModels();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setStatus("scanning");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 500, height: 500 },
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
            streamRef.current = stream;
        } catch (err) {
            toast.error("Permiso de cámara denegado");
            setStatus("ready");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    };

    const handleScan = async () => {
        if (!videoRef.current) return;

        setStatus("processing"); // BLOQUEO INMEDIATO

        const detection = await faceapi
            .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions(),
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detection) {
            const faceData = JSON.stringify(Array.from(detection.descriptor));

            router.post(
                route("empleados.rostro", emp.id),
                { rostro_data: faceData },
                {
                    onSuccess: () => {
                        setStatus("success");
                        if (onUpdateSuccess) onUpdateSuccess();
                        // toast.success("Biometría vinculada");
                        setTimeout(onClose, 2000);
                    },
                    onError: () => setStatus("scanning"),
                },
            );
        } else {
            toast.warning("Posicione su rostro dentro del marco");
            setStatus("scanning");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
            >
                {/* SPINNER DE CARGA GENERAL (OVERLAY) */}
                <AnimatePresence>
                    {(status === "loading" || status === "processing") && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center"
                        >
                            <Loader2
                                className="animate-spin text-blue-600 mb-4"
                                size={50}
                            />
                            <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest animate-pulse">
                                {status === "loading"
                                    ? "Cargando Motores de IA..."
                                    : "Analizando Rasgos Faciales..."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h3 className="font-black uppercase text-xs tracking-tighter text-slate-800 italic">
                        Identificación por Rostro
                    </h3>
                    <X
                        className="cursor-pointer text-slate-300 hover:text-rose-500"
                        onClick={onClose}
                    />
                </div>

                <div className="relative aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden mb-8 border-4 border-slate-50 shadow-2xl">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover scale-x-[-1] ${status !== "scanning" && status !== "processing" && "hidden"}`}
                    />

                    {status === "ready" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8">
                            <ScanFace
                                size={80}
                                className="mb-6 opacity-20 animate-bounce"
                            />
                            <Button
                                onClick={startCamera}
                                variant="primary"
                                size="lg"
                                className="rounded-2xl"
                            >
                                ACTIVAR CÁMARA
                            </Button>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white">
                            <ShieldCheck size={100} className="mb-4" />
                            <p className="font-black uppercase tracking-widest text-lg">
                                Personal Vinculado
                            </p>
                        </div>
                    )}
                </div>

                {status === "scanning" && (
                    <Button
                        onClick={handleScan}
                        size="xl"
                        variant="success"
                        className="w-full shadow-emerald-200"
                    >
                        INICIAR ESCANEO FACIAL
                    </Button>
                )}
            </motion.div>
        </div>
    );
}
