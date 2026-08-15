"use client";
import React, { useState, useEffect, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/Ui/Button";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs/dayjs.min.js";
import es from "dayjs/locale/es";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
dayjs.locale(es);

export default function WhatsAppReporte() {
    const [selectedDate, setSelectedDate] = useState(
        dayjs().format("YYYY-MM-DD"),
    );
    const maxDate = dayjs().format("YYYY-MM-DD");
    const [loading, setLoading] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsappUrl, setWhatsappUrl] = useState("");
    const [messagePreview, setMessagePreview] = useState(
        "Generando vista previa...",
    );
    const [noDataAvailable, setNoDataAvailable] = useState(false);
    const [directorInfo, setDirectorInfo] = useState(null);
    const [messageData, setMessageData] = useState(null);

    // Generar vista previa del mensaje
    const generatePreview = useCallback(async () => {
        if (!selectedDate) return;
        setLoadingPreview(true);
        setNoDataAvailable(false);

        try {
            const response = await axios.get(
                route("recursos.whatsapp.preview"),
                {
                    params: { fecha: selectedDate, _t: Date.now() },
                },
            );
            if (response.data.success) {
                setNoDataAvailable(false);
                setMessagePreview(response.data.preview);
                setDirectorInfo(response.data.director || null);
            } else {
                setNoDataAvailable(true);
                setMessagePreview("");
                toast.info("INFORMACIÓN", {
                    description:
                        response.data.message || "No hay datos para esta fecha",
                });
            }
        } catch (error) {
            setNoDataAvailable(true);
            toast.error("ERROR DE CONEXIÓN", {
                description: "No se pudo sincronizar con el servidor.",
            });
        } finally {
            setLoadingPreview(false);
        }
    }, [selectedDate]);

    // Enviar mensaje por WhatsApp Web
    const sendMessage = async () => {
        if (noDataAvailable) {
            toast.warning("DATOS INSUFICIENTES", {
                description: "No hay registros de asistencia para esta fecha.",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(route("recursos.whatsapp.send"), {
                fecha: selectedDate,
            });

            if (response.data.success) {
                // Guardar la URL y datos del mensaje
                setWhatsappUrl(response.data.whatsapp_url);
                setMessageData(response.data);
                setShowWhatsAppModal(true);

                toast.success("REPORTE GENERADO", {
                    description:
                        "El mensaje está listo para enviar por WhatsApp",
                });
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.error || "Error al generar el reporte";

            toast.error("ERROR", {
                description: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    // Abrir WhatsApp Web
    const openWhatsApp = () => {
        if (whatsappUrl) {
            window.open(whatsappUrl, "_blank");
            setShowWhatsAppModal(false);

            toast.success("WHATSAPP ABIERTO", {
                description: "Revisa el mensaje y presiona enviar",
            });
        }
    };

    // Efecto para cargar la vista previa al cambiar la fecha
    useEffect(() => {
        generatePreview();
    }, [selectedDate]);

    return (
        <AuthenticatedLayout>
            <Head title="Reporte WhatsApp" />

            <ViewContainer
                title="Reporte de Matrícula Diaria"
                subtitle="Genera y envía el reporte por WhatsApp Web"
                icon="MessageCircle"
                showSearch={false}
                actions={
                    <Link href={route("recursos.index")}>
                        <Button>
                            <Icons.ChevronLeftCircle size={14} /> VOLVER
                        </Button>
                    </Link>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full bg-[#f8fafc]">
                    {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
                    <div className="flex flex-col justify-center lg:pl-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[1.5rem] border border-slate-100 shadow-2xl overflow-hidden"
                        >
                            <div className="bg-emerald-600 p-8 flex items-center gap-4 text-white relative overflow-hidden">
                                <Icons.MessageSquare
                                    className="absolute -right-4 -bottom-4 opacity-20 rotate-12"
                                    size={100}
                                />
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Icons.Send size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase italic tracking-tighter text-lg leading-none">
                                        WhatsApp Web
                                    </h3>
                                    <p className="text-[10px] font-black uppercase opacity-80 mt-1 tracking-widest">
                                        Envío manual con mensaje pre-cargado
                                    </p>
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                                        Fecha del Reporte
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        max={maxDate}
                                        onChange={(e) =>
                                            setSelectedDate(e.target.value)
                                        }
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black uppercase text-slate-700 py-4 px-6 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                                    />
                                </div>

                                {/* Información del Director */}
                                {directorInfo && (
                                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                                            Destinatario
                                        </p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {directorInfo.nombres}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            📱 {directorInfo.telefono}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <Button
                                        onClick={sendMessage}
                                        loading={loading}
                                        disabled={noDataAvailable}
                                        variant="success"
                                        className="w-full"
                                    >
                                        <Icons.Send
                                            size={20}
                                            className={
                                                loading ? "hidden" : "block"
                                            }
                                        />{" "}
                                        GENERAR ENLACE DE WHATSAPP
                                    </Button>

                                    <button
                                        onClick={generatePreview}
                                        disabled={loadingPreview}
                                        className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-all italic"
                                    >
                                        <Icons.RefreshCw
                                            size={14}
                                            className={
                                                loadingPreview
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />{" "}
                                        Actualizar Vista Previa
                                    </button>
                                </div>

                                <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/50">
                                    <div className="flex items-start gap-3">
                                        <Icons.Info
                                            size={18}
                                            className="text-amber-500 mt-0.5 flex-shrink-0"
                                        />
                                        <div>
                                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                                ¿Cómo funciona?
                                            </p>
                                            <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                                                1. Genera el enlace de WhatsApp
                                                <br />
                                                2. Se abrirá WhatsApp Web
                                                <br />
                                                3. Revisa el mensaje y presiona
                                                enviar
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* PANEL DERECHO: SIMULADOR DE WHATSAPP */}
                    <div className="flex items-center justify-center lg:pl-10">
                        <div className="relative bg-slate-900 rounded-[1.5rem] h-full p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-slate-800 w-full max-w-sm">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-3xl z-20"></div>

                            <div className="bg-[#e5ddd5] rounded-[1.5rem] overflow-hidden flex flex-col h-full relative">
                                {/* WhatsApp Header */}
                                <div className="bg-[#075e54] pt-10 pb-4 px-6 flex items-center gap-4 shadow-lg relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white/20 flex items-center justify-center shadow-inner">
                                        <Icons.Smartphone
                                            className="text-slate-500"
                                            size={20}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-xs uppercase tracking-tight">
                                            Reporte Matrícula
                                        </p>
                                        <p className="text-emerald-300 text-[8px] font-black uppercase tracking-widest">
                                            {directorInfo
                                                ? `Para: ${directorInfo.nombres}`
                                                : "Sin destinatario"}
                                        </p>
                                    </div>
                                </div>

                                {/* Chat Canvas */}
                                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                                    <div className="self-center bg-white/40 backdrop-blur-sm px-4 py-1 rounded-lg text-[8px] font-black text-slate-500 uppercase shadow-sm">
                                        {dayjs(selectedDate).format(
                                            "dddd, D MMMM",
                                        )}
                                    </div>

                                    {!noDataAvailable ? (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="self-start bg-white p-4 rounded-[1.5rem] rounded-tl-none shadow-md max-w-[92%] relative"
                                        >
                                            <div className="absolute top-0 -left-2 w-4 h-4 bg-white clip-path-whatsapp-tail" />
                                            <pre className="font-mono text-[9px] leading-tight text-slate-800 whitespace-pre-wrap tracking-tighter">
                                                {messagePreview}
                                            </pre>
                                            <div className="text-right mt-2 text-[7px] text-slate-400 font-black uppercase">
                                                {dayjs().format("HH:mm")} ✓✓
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-10">
                                            <Icons.SearchX
                                                size={48}
                                                className="text-slate-400 mb-4"
                                            />
                                            <p className="text-[10px] font-black uppercase tracking-widest">
                                                Sin registros para procesar
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL DE WHATSAPP WEB */}
                <AnimatePresence>
                    {showWhatsAppModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-[3.5rem] w-full max-w-sm p-10 text-center shadow-3xl border-4 border-white relative"
                            >
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border-2 border-emerald-100">
                                    <Icons.MessageCircle
                                        size={48}
                                        strokeWidth={2.5}
                                        className="animate-in zoom-in duration-500"
                                    />
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">
                                    Mensaje Listo
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mb-2 tracking-tight">
                                    El mensaje está preparado para enviar
                                </p>

                                {messageData && (
                                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            Para
                                        </p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {messageData.director}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            📱 {messageData.numero_destino}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <Button
                                        onClick={openWhatsApp}
                                        variant="success"
                                        className="w-full"
                                    >
                                        <Icons.ExternalLink size={20} />
                                        ABRIR WHATSAPP WEB
                                    </Button>

                                    <button
                                        onClick={() => {
                                            setShowWhatsAppModal(false);
                                            // Copiar enlace al portapapeles
                                            if (whatsappUrl) {
                                                navigator.clipboard.writeText(
                                                    whatsappUrl,
                                                );
                                                toast.info("ENLACE COPIADO", {
                                                    description:
                                                        "El enlace se ha copiado al portapapeles",
                                                });
                                            }
                                        }}
                                        className="py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Icons.Copy size={14} />
                                        Copiar enlace
                                    </button>

                                    <button
                                        onClick={() =>
                                            setShowWhatsAppModal(false)
                                        }
                                        className="py-2 text-slate-300 font-bold uppercase text-[9px] tracking-widest hover:text-slate-400 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
