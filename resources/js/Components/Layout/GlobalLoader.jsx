import { usePage } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

export default function GlobalLoader() {
    const { processing } = usePage().props; // Inertia activa esto automáticamente

    if (!processing) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Procesando registros masivos...
                </p>
            </div>
        </div>
    );
}
