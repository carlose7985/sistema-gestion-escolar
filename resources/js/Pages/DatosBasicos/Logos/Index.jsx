"use client";
import React, { useState, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Button } from "@/Components/Ui/Button";
import { Head, router, Link } from "@inertiajs/react";
import { toast } from "sonner";
import { ChevronLeftCircle, FileCheck, FileText, ImagePlus, Info, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

export default function Index({ logos }) {
    const [uploadingField, setUploadingField] = useState(null);
    const institucionInput = useRef(null);
    const documentosInput = useRef(null);

    const placeholder = "/img/noImg.png";

    const handleUpload = (e, campo) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            toast.error("Imagen demasiado pesada", {
                description: "El límite es de 4MB.",
            });
            return;
        }

        setUploadingField(campo);

        router.post(
            route("settings.logos.store"),
            {
                imagen: file,
                campo: campo,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    setUploadingField(null);
                  //  toast.success("IDENTIDAD ACTUALIZADA");
                },
                onError: () => {
                    toast.error("Error al procesar la imagen");
                    setUploadingField(null);
                },
                onFinish: () => {
                    e.target.value = "";
                },
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Identidad Visual" />
            <ViewContainer
                title="IDENTIDAD VISUAL"
                subtitle="Registro y actualización logos de la institución"
                icon="Image"
                showSearch={false}
                actions={
                    <Link href={route("settings.index")}>
                        <Button>
                            <ChevronLeftCircle size={16} /> VOLVER
                        </Button>
                    </Link>
                }
                actionFooter={
                    <div className="flex items-center gap-3">
                        <RefreshCw
                            size={14}
                            className={`text-blue-500 ${uploadingField ? "animate-spin" : ""}`}
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            {uploadingField
                                ? "Sincronizando archivos..."
                                : "Identidad de marca vinculada"}
                        </span>
                    </div>
                }
            >
                <div className="flex flex-col lg:flex-row h-full w-full gap-8 p-8 items-stretch bg-[#f8fafc]">
                    {/* PANEL 1: ESCUDO (Logo Principal) */}
                    <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 flex flex-col items-center justify-center text-center">
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] italic">
                                Logo Principal
                            </h3>
                            <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">
                                Escudo de la Institución
                            </p>
                        </div>

                        <div
                            onClick={() =>
                                !uploadingField &&
                                institucionInput.current?.click()
                            }
                            className="relative w-72 h-72 rounded-full bg-slate-50 border-4 border-dashed border-slate-200 hover:border-blue-500 transition-all duration-700 cursor-pointer overflow-hidden flex items-center justify-center group shadow-inner"
                        >
                            <img
                                key={logos?.logo_institucion_url}
                                src={logos?.logo_institucion_url || placeholder}
                                className={`w-full h-full object-contain p-14 transition-all duration-700 group-hover:scale-110 ${!logos?.logo_institucion_url ? "opacity-20 grayscale" : ""}`}
                            />

                            <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white backdrop-blur-md">
                                <ImagePlus
                                    size={40}
                                    className="mb-3 animate-bounce"
                                />
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    Cambiar Escudo
                                </span>
                            </div>

                            {uploadingField === "logo_institucion" && (
                                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                                    <Loader2
                                        className="animate-spin text-blue-600"
                                        size={64}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-10 flex items-center gap-3 bg-blue-50 px-6 py-2.5 rounded-full border border-blue-100 shadow-sm">
                            <ShieldCheck
                                size={16}
                                className="text-blue-500"
                            />
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">
                                Sello Oficial Habilitado
                            </span>
                        </div>
                    </div>

                    {/* PANEL 2: CINTILLO (Membrete) */}
                    <div className="flex-[1.8] bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 flex flex-col items-center justify-center text-center">
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] italic">
                                Cintillo para Documentos
                            </h3>
                            <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">
                                Membrete Superior (PDF)
                            </p>
                        </div>

                        <div
                            onClick={() =>
                                !uploadingField &&
                                documentosInput.current?.click()
                            }
                            className="relative w-full aspect-[21/6] bg-slate-50 border-4 border-dashed border-slate-200 hover:border-blue-500 transition-all duration-700 cursor-pointer overflow-hidden rounded-[2.5rem] flex items-center justify-center group shadow-inner"
                        >
                            <img
                                key={logos?.logo_documentos_url}
                                src={logos?.logo_documentos_url || placeholder}
                                className={`w-full h-full object-contain p-10 transition-all duration-700 group-hover:scale-105 ${!logos?.logo_documentos_url ? "opacity-20 grayscale" : ""}`}
                            />

                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white backdrop-blur-md">
                                <FileText
                                    size={48}
                                    className="mb-3 animate-pulse"
                                />
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    Actualizar Cintillo Oficial
                                </span>
                            </div>

                            {uploadingField === "logo_documentos" && (
                                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                                    <Loader2
                                        className="animate-spin text-blue-600"
                                        size={64}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left flex items-start gap-4">
                                <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                                    <FileCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase mb-1">
                                        Automatización
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase">
                                        Se aplicará a constancias, boletines y
                                        reportes oficiales.
                                    </p>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left flex items-start gap-4">
                                <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-600">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase mb-1">
                                        Recomendación
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase">
                                        Use imágenes con fondo transparente
                                        (PNG) para mejor acabado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inputs ocultos */}
                <input
                    type="file"
                    ref={institucionInput}
                    className="hidden"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => handleUpload(e, "logo_institucion")}
                />
                <input
                    type="file"
                    ref={documentosInput}
                    className="hidden"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => handleUpload(e, "logo_documentos")}
                />
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
