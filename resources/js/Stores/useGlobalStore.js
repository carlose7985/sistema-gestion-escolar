import { create } from "zustand";

export const useGlobalStore = create((set) => ({
    isProcessing: false,
    loadingMessage: "Procesando...",
    setProcessing: (status, message = "Procesando...") =>
        set({ isProcessing: status, loadingMessage: message }),
}));
