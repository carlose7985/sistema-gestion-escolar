import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Pagination } from "./Pagination";
import * as Icons from "lucide-react";
import { usePage } from "@inertiajs/react";
import { showToast } from "@/Components/ToastMessage";
import React, { forwardRef } from "react";

const ViewContainer = forwardRef(function ViewContainer(
    {
        title = "Sin Título",
        titleBlue = "",
        subtitle = "",
        loading = false,
        showSearch = true,
        placeholderSearch = "Buscar...",
        searchValue = "",
        onSearch = null,
        actions = null,
        returns = null,
        extraFilters = null,
        icon = null,
        activePaginate = null,
        currentPage,
        totalPages,
        onPageChange,
        clearSearchOnSuccess = true,
        actionFooter = null,
        footerStats = null, // 👈 AÑADIR ESTA PROP PARA CAPTURARLA
        children,
        ...props
    },
    ref,
) {
    const [internalSearch, setInternalSearch] = useState(searchValue);
    const inputRef = useRef(null);

    // --- LÓGICA DE BÚSQUEDA ---
    const normalizeText = (text) => {
        return text
            ? text
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
            : "";
    };

    // const { flash } = usePage().props;
    const { props: pageProps, url } = usePage();
    const { flash } = pageProps;

    // --- 1. LÓGICA DE FOCO UNIVERSAL ---
    useEffect(() => {
        // Función para aplicar el foco
        const applyFocus = () => {
            if (inputRef.current) {
                inputRef.current.focus();
                // Opcional: mover el cursor al final del texto si hubiera algo
                const val = inputRef.current.value;
                inputRef.current.setSelectionRange(val.length, val.length);
            }
        };

        // Intento 1: Inmediato (para navegaciones rápidas)
        applyFocus();

        // Intento 2: Retrasado (para ganarle al cierre de modales)
        // 450ms es el tiempo estándar para que las animaciones de modales terminen
        const timer = setTimeout(applyFocus, 450);

        return () => clearTimeout(timer);
    }, [url, flash]); // Se dispara cada vez que cambias de página o haces una acción exitosa

    // --- 2. LÓGICA DE LIMPIEZA AUTOMÁTICA ---
    useEffect(() => {
        // Si hay un mensaje de éxito, limpiamos el buscador visualmente
        if (flash?.success) {
            setInternalSearch("");

            // Si quieres que el servidor también refresque la lista (opcional)
            if (onSearch && searchValue !== "") {
                onSearch("");
            }
        }
    }, [flash]);

    useEffect(() => {
        if (flash?.success) showToast("success", flash.success);
        if (flash?.error) showToast("error", flash.error);
        if (flash?.warning) showToast("warning", flash.warning);
        if (flash?.info) showToast("info", flash.info);
    }, [flash]);

    // --- 4. SINCRONIZACIÓN DE BÚSQUEDA ---
    // Debounce para la búsqueda (Tu lógica existente)
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                onSearch &&
                normalizeText(internalSearch) !== normalizeText(searchValue)
            ) {
                onSearch(internalSearch);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [internalSearch]);

    // Sincronizar cuando el padre cambia el valor (ej: redirección con search en URL)
    useEffect(() => {
        setInternalSearch(searchValue || "");
    }, [searchValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                onSearch &&
                normalizeText(internalSearch) !== normalizeText(searchValue)
            ) {
                onSearch(internalSearch);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [internalSearch]);

    useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setInternalSearch(searchValue || "");
        }
    }, [searchValue]);

    const IconComponent = Icons[icon] || null;

    return (
        <div
            ref={ref}
            className="flex flex-col h-[calc(100vh-80px)] w-full bg-[#f3f4f6] overflow-hidden animate-in fade-in duration-500"
            {...props}
        >
            {/* 1. HEADER */}
            <header className="flex-none bg-white px-8 py-1 h-16 flex items-center justify-between border-b border-gray-100 shadow-sm z-30">
                <div className="flex items-center gap-5">
                    {IconComponent && (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative p-3.5 bg-gradient-to-br from-[#4ade80] via-[#3b82f6] to-[#6366f1] rounded-[1.2rem] shadow-xl flex items-center justify-center border border-white/20">
                                <IconComponent
                                    size={18}
                                    className="text-white"
                                    strokeWidth={2.2}
                                />
                                {icon === "UserPlus" && (
                                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-blue-600 shadow-sm">
                                        <Icons.Plus size={10} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[22px] font-black text-blue-800 uppercase tracking-tighter flex items-center leading-none">
                                {title}
                                {loading && (
                                    <div className="ml-4 flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                                        <Loader2
                                            className="animate-spin text-blue-500"
                                            size={14}
                                        />
                                        <span className="text-[9px] text-blue-500 uppercase font-black tracking-widest">
                                            Cargando
                                        </span>
                                    </div>
                                )}
                            </h2>
                        </div>
                        {subtitle && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {returns}
                    {actions}
                </div>
            </header>

            {/* 2. FILTROS */}
            {(showSearch || extraFilters) && (
                <div className="flex-none p-2 flex items-center justify-between gap-4">
                    {showSearch && (
                        <div className="relative w-full max-w-md">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                size={16}
                            />
                            <input
                                type="search"
                                id="universal-search"
                                autoFocus
                                autoComplete="off"
                                ref={inputRef}
                                value={internalSearch}
                                onChange={(e) =>
                                    setInternalSearch(e.target.value)
                                }
                                placeholder={placeholderSearch}
                                className="w-full bg-white border border-gray-500 rounded-2xl py-2 pl-10 pr-2 text-[11px] font-bold text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none italic tracking-wider"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {extraFilters}
                    </div>
                </div>
            )}

            {/* 3. CUERPO */}
            <main className="flex-1 overflow-auto p-2 custom-scrollbar">
                {children}
            </main>

            {/* 4. FOOTER */}
            {(activePaginate ||
                actionFooter ||
                footerStats || // 👈 AÑADIR ESTA CONDICIÓN
                (onPageChange && totalPages > 1)) && (
                <footer className="flex-none bg-white border-t h-11 border-slate-200 p-2 flex items-center justify-between z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    {/* IZQUIERDA: Acciones adicionales y estadísticas */}
                    <div className="flex items-center gap-3">
                        {actionFooter}
                        {footerStats && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {footerStats}
                            </span>
                        )}
                    </div>

                    {/* DERECHA: Paginación */}
                    <div className="flex items-center">
                        {onPageChange &&
                        currentPage !== undefined &&
                        totalPages > 1 ? (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        ) : (
                            activePaginate
                        )}
                    </div>
                </footer>
            )}
        </div>
    );
});

ViewContainer.displayName = "ViewContainer";

export default ViewContainer;
