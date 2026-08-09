// Components/LoadingSpinner.jsx
import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
    fullScreen = false,
    text = "Cargando...",
}) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 select-text bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                        <Loader2 className="absolute inset-0 m-auto w-5 h-5 text-indigo-600 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 select-text">
                        {text}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center select-text justify-center py-12 gap-3">
            <div className="relative">
                {/* Círculo exterior multicolor */}
                <div className="w-12 h-12 select-text rounded-full border-4 border-indigo-200 animate-spin"></div>
                <div className="absolute select-text inset-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>

                {/* Efecto degradado */}
                <div className="absolute inset-0 w-12 h-12 select-text rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>

                {/* Icono central */}
                <Loader2 className="absolute inset-0 m-auto w-5 h-5 text-indigo-600 animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-600 select-text">
                {text}
            </p>
        </div>
    );
}
