"use client";
import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import Sidebar from "@/Components/Layout/Sidebar";
import Navbar from "@/Components/Layout/Navbar";
import { Toaster } from "sonner";

export default function AuthenticatedLayout({ children }) {
    const { props, url } = usePage();
    const { auth } = props;
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isLocked =
        !auth.has_institution && url !== "/datos-basicos/institucion";

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setIsMobileOpen(false);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                router.reload({
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        };

        const keepAlive = setInterval(
            () => {
                fetch("/ping").catch(() =>
                    console.warn("Reintentando conexión..."),
                );
            },
            4 * 60 * 1000,
        );

        window.addEventListener("resize", handleResize);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            clearInterval(keepAlive);
        };
    }, []);

    useEffect(() => {
        if (!auth.has_institution && url !== "/datos-basicos/institucion") {
            showConfigAlert(
                "CONFIGURACIÓN REQUERIDA",
                "Para habilitar el sistema, primero debe cargar la identidad legal.",
                "/datos-basicos/institucion",
            );
        }
    }, [auth.has_institution, url]);

    const showConfigAlert = (title, text, redirect) => {
        Swal.fire({
            title: `<span class="text-slate-900 font-black italic uppercase tracking-tighter">${title}</span>`,
            html: `<p class="text-xs text-slate-500 font-bold italic uppercase tracking-tight">${text}</p>`,
            icon: "warning",
            confirmButtonText: "IR A CONFIGURAR",
            confirmButtonColor: "#2563eb",
            allowOutsideClick: false,
            customClass: {
                popup: "rounded-[2.5rem] p-10 border-4 border-white shadow-2xl bg-white",
                confirmButton:
                    "rounded-2xl font-black italic px-8 py-4 tracking-widest",
            },
        }).then(() => router.visit(redirect));
    };

    return (
        <div className="flex h-screen bg-[#06090f] text-gray-200 overflow-hidden select-none">
            {/* Sidebar con ancho fijo */}
            <Sidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* CONTENEDOR PRINCIPAL: Añadido lg:pl-64 para respetar el espacio del sidebar */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
                <Navbar setIsMobileOpen={setIsMobileOpen} />

                <main className="flex-1 overflow-y-auto bg-black relative">
                    <Toaster
                        theme="dark"
                        position="top-right"
                        expand={false}
                        richColors
                        toastOptions={{
                            style: {
                                borderRadius: "1rem",
                                border: "1px solid rgba(255,255,255,0.1)",
                            },
                        }}
                    />
                    {!isLocked ? (
                        <div className="w-full">{children}</div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#06090f] px-10 z-50">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                                <div className="relative p-6 bg-gray-900 border border-gray-800 rounded-[2rem] text-blue-500 shadow-2xl">
                                    <ShieldAlert
                                        size={48}
                                        className="animate-bounce"
                                    />
                                </div>
                            </div>
                            <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-white">
                                Sistema Bloqueado
                            </h2>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function ShieldAlert({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}
