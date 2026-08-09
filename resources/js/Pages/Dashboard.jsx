import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Head, Link } from "@inertiajs/react";
import {
    Command,
    CommandIcon,
    LucideQrCode,
   
} from "lucide-react";
import { Button } from "@/Components/Ui/Button";

export default function TestPage() {
    return (
        <AuthenticatedLayout>
            {/* Título en la pestaña del navegador */}
            <Head title="Página de Prueba" />

            <ViewContainer
                title="Laboratorio de Pruebas"
                subtitle="Pruebas en desarrolo"
                icon="FlaskConical" // Icono de Lucide para pruebas
                showSearch={false} // Desactivamos el buscador para que esté bien limpia
            >
                {/*  
                   Contenedor centrado para el texto de prueba 
                   Usamos flex y h-full para que el texto quede en el medio del Card blanco
                */}
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    {/* Icono decorativo de fondo */}
                    <div className="p-6 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                        <CommandIcon
                            size={48}
                            className="text-slate-200 animate-pulse"
                        />
                    </div>

                    <h1 className="text-2xl font-black italic uppercase tracking-[0.3em] text-slate-300">
                        AQUÍ ESTAMOS DE PRUEBA
                        <Link href={route("comedor.index")} className="block">
                            <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 py-2.5 rounded-xl">
                                <LucideQrCode size={16} />
                                Control comida
                            </Button>
                        </Link>
                    </h1>

                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-60">
                        Core Edition v2.0 - Entorno de Desarrollo Habilitado
                    </p>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
