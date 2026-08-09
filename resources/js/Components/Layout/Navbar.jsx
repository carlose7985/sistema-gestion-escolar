import { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react"; // Importamos usePage para los datos del usuario
import {
    Search,
    Bell,
    ChevronDown,
    Menu,
    User,
    Settings,
    ShieldCheck,
    LogOut,
} from "lucide-react";
import GlobalSearch from "@/Components/GlobalSearch";
import BirthdayDropdown from "@/Components/BirthdayDropdown";
import StatsSheet from "@/Components/StatsSheet";

export default function Navbar({ setIsMobileOpen }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { auth } = usePage().props;
    useEffect(() => {
        if (!auth?.user) {
            router.post(
                "/logout",
                {},
                {
                    onFinish: () => router.visit("/login"),
                },
            );
        }
    }, [auth]);

    if (!auth?.user) return null;
    // Obtenemos los datos del usuario autenticado desde Laravel

    return (
        <nav className="h-16 flex items-center justify-between px-6 lg:px-10 bg-[#06090f]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    {isMobile && (
                        <button
                            onClick={onMenuClick}
                            className="md:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <Menu className="text-white w-5 h-5" />
                        </button>
                    )}

                    {/* Mobile Logo (visible solo en móvil) */}
                    {isMobile && (
                        <div className="flex items-center gap-2 md:hidden">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <div className="text-white text-xs font-black">
                                    SGE
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Buscador - Ahora más responsive */}
                <div
                    className={`flex-1 ${isMobile ? "mx-2" : "flex justify-left px-4"}`}
                >
                    <div
                        className={`${isMobile ? "w-full max-w-[180px]" : "w-full max-w-md"}`}
                    >
                        <GlobalSearch />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                <div
                    className={`flex gap-2 md:gap-3 ${!isMobile && "pr-6 border-r border-slate-800/60"}`}
                >
                    <StatsSheet />
                    <BirthdayDropdown />
                </div>

                <div className="h-8 w-[1px] bg-white/5 mx-1" />

                {/* PERFIL DE USUARIO */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-3 p-1 pr-3 rounded-2xl border transition-all duration-300 ${
                            isDropdownOpen
                                ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                : "bg-[#0d121f] border-gray-800 hover:border-gray-600"
                        }`}
                    >
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-[9px] text-blue-500 font-black uppercase tracking-tighter leading-none">
                                Usuario: {auth.user.name}
                            </p>
                        </div>
                        <ChevronDown
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-500 ${isDropdownOpen ? "rotate-180 text-blue-400" : ""}`}
                        />
                    </button>

                    {/* Menú Desplegable */}
                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            ></div>

                            <div className="absolute right-0 mt-3 w-60 bg-[#0d121f] border border-gray-800/50 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200 z-20">
                                <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-transparent">
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em]">
                                        Sesión Activa
                                    </p>
                                    <p className="text-xs text-white font-bold italic mt-1 truncate uppercase tracking-tight">
                                        {auth.user.email}
                                    </p>
                                </div>

                                <div className="p-2.5">
                                    <Link
                                        href={route("profile.edit")}
                                        className="w-full flex items-center gap-3 px-3 py-3 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest italic group"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                                        Mi Configuración
                                    </Link>

                                    <button className="w-full flex items-center gap-3 px-3 py-3 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest italic group">
                                        <Settings className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                                        Seguridad
                                    </button>

                                    <div className="h-[1px] bg-white/5 my-2 mx-2" />

                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-3 px-3 py-3 text-[10px] font-black text-red-500/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-[0.15em] italic"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Finalizar Sesión
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
