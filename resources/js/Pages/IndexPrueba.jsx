import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { Head } from "@inertiajs/react";
import * as Icons from "lucide-react";

export default function TestPage() {
    return (
        <AuthenticatedLayout>
            {/* Título en la pestaña del navegador */}
            <Head title="Página de Prueba" />

            <ViewContainer
                title="Laboratorio de Pruebas"
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
                        <Icons.Command
                            size={48}
                            className="text-slate-200 animate-pulse"
                        />
                    </div>

                    <h1 className="text-2xl font-black italic uppercase tracking-[0.3em] text-slate-300">
                        AQUÍ ESTAMOS DE PRUEBA
                    </h1>

                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-60">
                        Core Edition v2.0 - Entorno de Desarrollo Habilitado
                    </p>
                </div>
            </ViewContainer>
        </AuthenticatedLayout>
    );
}
