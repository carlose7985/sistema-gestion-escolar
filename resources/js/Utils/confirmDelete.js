import Swal from "sweetalert2";
import { router } from "@inertiajs/react";

/**
 * Confirmación de eliminación global con SweetAlert2 e Inertia.js
 * * @param {string} routeUrl - La ruta de Laravel (ej: route('ruta.destroy', id))
 * @param {string} title - Título del modal (Opcional)
 * @param {string} text - Texto descriptivo (Opcional)
 */
export const confirmDelete = (
    routeUrl,
    title = "¿ESTÁS SEGURO?",
    text = "Esta acción no se puede deshacer y eliminará el registro de forma permanente.",
) => {
    Swal.fire({
        title: title.toUpperCase(),
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444", // rose-500
        cancelButtonColor: "#64748b", // slate-500
        confirmButtonText: "SÍ, ELIMINAR",
        cancelButtonText: "CANCELAR",
        background: "#ffffff",
        customClass: {
            popup: "rounded-[2rem] border-4 border-white shadow-2xl font-sans",
            title: "font-black text-slate-900 tracking-tight text-lg italic",
            htmlContainer:
                "text-[11px] font-bold text-slate-500 uppercase tracking-wide",
            confirmButton:
                "rounded-xl font-black text-xs px-6 py-3 tracking-widest uppercase",
            cancelButton:
                "rounded-xl font-black text-xs px-6 py-3 tracking-widest uppercase",
        },
    }).then((result) => {
        if (result.isConfirmed) {
            router.delete(routeUrl, {
                preserveScroll: true,
                onBefore: () => {
                    // Muestra el spinner de carga y bloquea la pantalla mientras procesa la petición
                    Swal.fire({
                        title: "PROCESANDO...",
                        text: "Por favor, espere mientras se actualiza el sistema.",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false,
                        showConfirmButton: false,
                        background: "#ffffff",
                        customClass: {
                            popup: "rounded-[2rem] border-4 border-white shadow-2xl",
                            title: "font-black text-slate-900 tracking-widest italic text-sm",
                            htmlContainer:
                                "text-[10px] font-bold text-slate-400 uppercase",
                        },
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });
                },
                onSuccess: () => {
                    // Cerrar el Swal automáticamente si todo sale bien
                    Swal.close();
                },
                onError: () => {
                    // En caso de que falle el backend, avisar al usuario
                    Swal.fire({
                        title: "ERROR",
                        text: "No se pudo eliminar el registro. Intente de nuevo.",
                        icon: "error",
                        confirmButtonColor: "#0f172a", // slate-900
                        customClass: {
                            popup: "rounded-[2rem]",
                            title: "font-black text-rose-500",
                        },
                    });
                },
            });
        }
    });
};
