import { useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import * as Icons from "lucide-react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Button } from "@/Components/ui/button"; // Usando tu botón global
import { motion } from "framer-motion";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 font-sans bg-white">
            <Head title="Acceso al Portal" />

            {/* --- SECCIÓN IZQUIERDA: IMAGEN DECORATIVA (OCULTA EN MÓVIL) --- */}
            <div className="relative hidden bg-slate-900 lg:block overflow-hidden">
                {/* Imagen de fondo */}
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    src="/img/escuala.jpg"
                    alt="Campus Escolar"
                    className="h-full w-full object-cover opacity-60"
                />

                {/* Overlay Gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />

                {/* Contenido sobre la imagen */}
                <div className="absolute bottom-0 left-0 p-16 text-white z-10">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6 flex w-fit items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10"
                    >
                        <Icons.BookOpen className="h-4 w-4 text-blue-400" /> Educación
                        de Excelencia
                    </motion.div>

                    <motion.blockquote
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-4"
                    >
                        <p className="text-3xl leading-tight font-black tracking-tighter uppercase italic">
                            "La educación es el arma <br /> más poderosa para{" "}
                            <br /> cambiar el mundo."
                        </p>
                        <footer className="text-sm font-bold opacity-60 uppercase tracking-widest">
                            — Nelson Mandela
                        </footer>
                    </motion.blockquote>
                </div>
            </div>

            {/* --- SECCIÓN DERECHA: FORMULARIO --- */}
            <div className="flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16 xl:px-24 bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mx-auto w-full max-w-md space-y-10"
                >
                    {/* Header del Formulario */}
                    <div className="text-center lg:text-left">
                        <div className="mb-6 flex justify-center lg:justify-start">
                            <div className="flex items-center justify-center rounded-2xl bg-blue-600 p-3 text-white shadow-xl shadow-blue-200">
                                <Icons.School className="h-8 w-8" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
                            Bienvenido
                        </h1>
                        <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-tight">
                            Ingresa tus credenciales para acceder al núcleo
                            escolar.
                        </p>
                    </div>

                    {status && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-black text-emerald-600 uppercase">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-5">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <InputLabel
                                    htmlFor="email"
                                    value="Correo Electrónico"
                                    className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
                                />
                                <div className="relative group">
                                    <Icons.Mail className="absolute top-3.5 left-4 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pl-12 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="usuario@colegio.edu"
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <InputLabel
                                        htmlFor="password"
                                        value="Contraseña"
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                                    />
                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-tighter"
                                        >
                                            ¿Olvidaste tu clave?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Icons.Lock className="absolute top-3.5 left-4 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="block w-full pl-12 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="••••••••"
                                    />
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            {/* Botón Ingresar */}
                            <Button
                                variant="primary"
                                className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 mt-4 rounded-2xl transition-all hover:scale-[1.02]"
                                loading={processing}
                            >
                                <span className="flex items-center gap-2">
                                    Entrar al Portal <Icons.ArrowRight size={18} />
                                </span>
                            </Button>
                        </div>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            © {new Date().getFullYear()} Sis Gestión Escolar •
                            Core Edition
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
