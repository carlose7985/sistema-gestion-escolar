import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewContainer from "@/Components/Layout/ViewContainer";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Link, Head, usePage } from "@inertiajs/react";


const modules = [
    {
        title: "ESTUDIANTES POR GRADO",
        subtitle: "Listados Académicos",
        icon: "School",
        color: "indigo",
        route: "estudiantes.activos.listado.index", // Cambiar por tu ruta real
        items: ["Secciones", "Aulas", "Control de Cupos"],
    },
    {
        title: "CALIFICAR ESTUDIANTES",
        subtitle: "Aprobar / Reprobar",
        icon: "CheckSquare",
        color: "orange",
        route: "estudiantes.activos.aprobar.reprobar.index", // Cambiar por tu ruta real
        items: ["Cierre de Periodo", "Evaluación Final", "Gestión de Notas"],
    },
    {
        title: "ESTUDIANTES APROBADOS",
        subtitle: "Rendimiento Exitoso",
        icon: "CheckCircle2",
        color: "emerald",
        route: "estudiantes.activos.aprobados.index", // Cambiar por tu ruta real
        items: ["Certificados", "Promocionados", "Cuadro de Honor"],
    },
    {
        title: "ESTUDIANTES REPROBADOS",
        subtitle: "Seguimiento Académico",
        icon: "XCircle",
        color: "rose",
        route: "estudiantes.activos.reprobados.index", // Cambiar por tu ruta real
        items: ["Materias Pendientes", "Refuerzo", "Repitientes"],
    },
];

const neonStyles = {
    indigo: {
        border: "border-indigo-500",
        shadow: "shadow-indigo-500/20",
        text: "text-indigo-500",
        bg: "bg-indigo-600",
        hoverShadow: "hover:shadow-indigo-500/40",
        from: "from-indigo-500/10",
        to: "to-indigo-500/20",
        buttonHover: "group-hover:bg-indigo-600",
    },
    orange: {
        border: "border-orange-500",
        shadow: "shadow-orange-500/20",
        text: "text-orange-500",
        bg: "bg-orange-500",
        hoverShadow: "hover:shadow-orange-500/40",
        from: "from-orange-500/10",
        to: "to-orange-500/20",
        buttonHover: "group-hover:bg-orange-500",
    },
    emerald: {
        border: "border-emerald-500",
        shadow: "shadow-emerald-500/20",
        text: "text-emerald-500",
        bg: "bg-emerald-500",
        hoverShadow: "hover:shadow-emerald-500/40",
        from: "from-emerald-500/10",
        to: "to-emerald-500/20",
        buttonHover: "group-hover:bg-emerald-500",
    },
    rose: {
        border: "border-rose-500",
        shadow: "shadow-rose-500/20",
        text: "text-rose-500",
        bg: "bg-rose-500",
        hoverShadow: "hover:shadow-rose-500/40",
        from: "from-rose-500/10",
        to: "to-rose-500/20",
        buttonHover: "group-hover:bg-rose-500",
    },
};

export default function EstudiantesActivos() {
   
   
    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Estudiantes" />

            <ViewContainer
                title="CONTROL ESTUDIANTES ACTIVOS"
                subtitle="Administración académica y seguimiento de alumnos"
                icon="Users"
                showSearch={false}
            >
                {/* Grid ajustado a 5 columnas para XL */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {modules.map((mod, idx) => {
                        const IconComponent = Icons[mod.icon];
                        const style = neonStyles[mod.color];

                        return (
                            <Link
                                key={idx}
                                href={route(mod.route)}
                                className="group"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: idx * 0.1,
                                        type: "spring",
                                        stiffness: 100,
                                    }}
                                    whileHover={{ y: -12 }}
                                    className={`relative h-full flex flex-col bg-white border-b-[6px] ${style.border} rounded-[1.5rem] p-7 shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer active:scale-95`}
                                >
                                    {/* Resplandor de fondo al hacer hover */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-b ${style.from} ${style.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                    />

                                    {/* Icono Flotante Neón */}
                                    <div className="flex justify-center mb-8 relative z-10">
                                        <div
                                            className={`p-5 rounded-3xl text-white shadow-2xl ${style.bg} ${style.shadow} ${style.hoverShadow}`}
                                        >
                                            <IconComponent
                                                size={34}
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                    </div>

                                    {/* Textos Centrales */}
                                    <div className="text-center mb-6 relative z-10">
                                        <h3 className="text-[12px] font-black text-slate-800 tracking-tighter uppercase italic group-hover:text-black transition-colors leading-tight">
                                            {mod.title}
                                        </h3>
                                        <p
                                            className={`text-[10px] font-black uppercase tracking-[0.1em] mt-1.5 ${style.text}`}
                                        >
                                            {mod.subtitle}
                                        </p>
                                    </div>

                                    {/* Lista de Items (Píldoras) */}
                                    <div className="flex-1 space-y-2.5 mb-10 relative z-10">
                                        {mod.items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="bg-gray-50/80 border-l-4 border-gray-100 group-hover:border-current group-hover:bg-white py-2.5 px-4 rounded-xl text-[9px] font-bold text-gray-500 group-hover:text-gray-700 uppercase italic tracking-tight transition-all duration-300"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botón Inferior */}
                                    <div
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-500 
                                            bg-slate-900 text-white ${style.buttonHover} group-hover:shadow-lg group-hover:scale-105`}
                                    >
                                        ENTRAR{" "}
                                        <Icons.Zap
                                            size={14}
                                            className="fill-current animate-pulse"
                                        />
                                    </div>

                                    {/* Adorno visual de luz en la esquina */}
                                    <div
                                        className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-3xl transition-all opacity-20 
                                            ${style.from} group-hover:opacity-40`}
                                    />
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </ViewContainer>
           
        </AuthenticatedLayout>
    );
}
