"use client";
import React, {
    useRef,
    useState,
    useMemo,
    useEffect,
    useLayoutEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X, Trash2 } from "lucide-react";
import {
    buscarSugerencia,
    titleCaseFixed,
    aplicarMascara,
} from "@/lib/formUtils";

export function Field({
    label,
    name,
    value,
    onChange,
    disabled,
    type = "text",
    placeholder = "",
    required = false,
    innerRef,
    readOnly = false,
    mask,
    autoFocus,
    autoTitleCase = true,
    autoSentenceCase = false,
    autoAcentos = true,
    upperCase = false,
    error,
    icon,
}) {
    const localRef = useRef(null);
    const ref = innerRef || localRef;
    const [localError, setLocalError] = useState(error);
    const [activeSuggestion, setActiveSuggestion] = useState(null);
    // Dentro de tu componente Field
    const [cursor, setCursor] = useState(null);
    const fixRomanNumerals = (text) => {
        if (!text) return text;

        // Regex para identificar números romanos como palabras independientes
        // Esta regex valida la estructura estándar (I, II, IV, VIII, IX, etc.)
        const romanRegex =
            /\b(m*(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3}))\b/gi;

        return text.replace(romanRegex, (match) => {
            // Solo transformamos si tiene contenido (evita strings vacíos en los grupos de captura)
            if (match.length === 0) return match;

            // Excepción opcional: evitar que palabras comunes de una sola letra se vuelvan romanas
            // por ejemplo la "a" o "y" no son romanas, pero "i" y "v" sí.
            // Si quieres que "i" (como en inglés) no se capitalice, podrías filtrar aquí.

            return match.toUpperCase();
        });
    };
    // Usa esto para restaurar la posición después de que el valor se actualice
    useLayoutEffect(() => {
        if (cursor !== null && ref.current) {
            // Aseguramos que nunca supere el largo real del valor
            const pos = Math.min(cursor, ref.current.value.length);
            ref.current.setSelectionRange(pos, pos);
            setCursor(null);
        }
    }, [value]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);

    // FOCO INICIAL: Posicionamiento inmediato al montar el componente
    useEffect(() => {
        if (autoFocus && ref.current) {
            const node = ref.current;
            node.focus();
            const len = node.value.length;
            node.setSelectionRange(len, len);
        }
    }, [autoFocus]);

    const detectarSugerencia = (text, cursor) => {
        if (!autoAcentos || !text) {
            setActiveSuggestion(null);
            return;
        }
        const matches = Array.from(text.matchAll(/\S+/g));

        const wordAtCursor = matches.find(
            (m) => cursor >= m.index && cursor <= m.index + m[0].length,
        );
        if (wordAtCursor) {
            const sug = buscarSugerencia(wordAtCursor[0]);
            if (sug && sug.toLowerCase() !== wordAtCursor[0].toLowerCase()) {
                setActiveSuggestion({
                    word: wordAtCursor[0],
                    sug,
                    start: wordAtCursor.index,
                });
                return;
            }
        }
        setActiveSuggestion(null);
    };

   const handleInternalChange = (e) => {
       if (!onChange) return;

       const input = e.target;
       const oldVal = value || "";
       const selectionStart = input.selectionStart;

       let val = input.value;
       let newCursor = selectionStart;

       // 1. Aplicar máscara
       if (mask) {
           const valLimpio = val.replace(/\D/g, "");
           val = aplicarMascara(val, mask);
           const diff = val.length - oldVal.length;
           if (diff > 0) {
               newCursor += diff;
           }
       }
       // 2. Aplicar transformaciones de texto
       else {
           const isTech = ["email"].includes(name);
           if (type === "text" && !isTech) {
               // Aplicamos transformaciones base
               if (upperCase) {
                   val = val.toUpperCase();
               } else {
                   if (autoTitleCase) {
                       val = titleCaseFixed(val);
                   } else if (autoSentenceCase && val.length > 0) {
                       val = val[0].toUpperCase() + val.slice(1);
                   }

                   // --- NUEVA LÓGICA PARA NÚMEROS ROMANOS ---
                   // Se aplica después de TitleCase para corregir cosas como "Ii" -> "II"
                   val = fixRomanNumerals(val);
               }
           }
       }

       setCursor(newCursor);
       onChange({ target: { name, value: val } });
   };

    // --- MANEJADOR DE FOCO SIN PARPADEO ---
    const handleFocus = (e) => {
        if (readOnly || disabled) return;

        const node = e.currentTarget;
        const len = node.value.length;

        // Al hacerlo síncronamente y antes de cualquier otra lógica,
        // la mayoría de navegadores colapsan la selección antes del primer "paint".
        node.setSelectionRange(len, len);
    };

    const aplicarCorreccion = (e, añadirEspacio = false) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!activeSuggestion || !onChange) return;

        const { sug, start, word } = activeSuggestion;
        const before = value.substring(0, start);
        const after = value.substring(start + word.length);

        // Si añadirEspacio es true, ponemos un espacio al final
        const nuevoValor =
            before +
            (upperCase ? sug.toUpperCase() : sug) +
            after +
            (añadirEspacio ? " " : "");

        const posFinal = start + sug.length + (añadirEspacio ? 1 : 0);

        setActiveSuggestion(null);
        onChange({ target: { name, value: nuevoValor } });

        setTimeout(() => {
            if (ref.current) {
                ref.current.focus();
                ref.current.setSelectionRange(posFinal, posFinal);
            }
        }, 10);
    };

    const handleKeyDown = (e) => {
        // Si la sugerencia está activa y presiona Tab
        if (e.key === "Tab" && activeSuggestion) {
            e.preventDefault(); // Evita que salte al siguiente input
            aplicarCorreccion(null, true); // Corrige y añade espacio
        }
    };

    const renderUnderlines = useMemo(() => {
        // Si no hay valor, o el valor NO es una cadena de texto, no procesamos acentos
        if (!autoAcentos || !value || typeof value !== "string") return null;

        return value.split(/(\s+)/).map((part, i) => {
            if (part.trim() === "") return <span key={i}>{part}</span>;
            const sug = buscarSugerencia(part);
            const tieneError = sug && sug.toLowerCase() !== part.toLowerCase();
            return (
                <span
                    key={i}
                    className={`relative ${tieneError ? "border-b-2 border-rose-500" : ""}`}
                    style={{ color: "transparent" }}
                >
                    {part}
                </span>
            );
        });
    }, [value, autoAcentos]);

    return (
        <div className="flex flex-col gap-1 w-full relative">
            <label
                className={`text-[10px] font-bold uppercase tracking-tighter ml-1 transition-colors ${localError ? "text-rose-500" : "text-gray-800"}`}
            >
                {label}
            </label>
            <div className="relative group">
                {value && value.length > 0 && (
                    <div className="absolute inset-0 px-3 py-2.5 text-xs font-bold pointer-events-none whitespace-pre overflow-hidden flex wrap border border-transparent">
                        {renderUnderlines}
                    </div>
                )}

                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-20">
                        {icon}
                    </div>
                )}

                <input
                    ref={ref}
                    onKeyDown={handleKeyDown}
                    name={name}
                    type={type}
                    value={value ?? ""}
                    onChange={handleInternalChange}
                    onKeyUp={(e) =>
                        detectarSugerencia(
                            e.target.value,
                            e.target.selectionStart,
                        )
                    }
                    onClick={(e) =>
                        detectarSugerencia(
                            e.target.value,
                            e.target.selectionStart,
                        )
                    }
                    onFocus={handleFocus} // Foco síncrono
                    disabled={disabled}
                    required={required}
                    readOnly={readOnly}
                    spellCheck="false"
                    autoComplete="off"
                    placeholder={placeholder}
                    className={`relative placeholder:text-slate-400
                    placeholder:font-medium
                    placeholder:italic z-10 w-full bg-transparent border rounded-xl ${icon ? "pl-9" : "px-3"} py-2.5 text-xs font-bold text-slate-700 outline-none transition-all ${localError ? "border-rose-500 focus:ring-2 focus:ring-rose-500/10" : "border-gray-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"} ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`}
                />

                <AnimatePresence>
                    {activeSuggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                // Calculamos una posición aproximada basada en el inicio de la palabra
                                left: `${Math.min(activeSuggestion.start * 0.7, 80)}%`,
                            }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-7 z-50 flex items-center gap-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg font-black shadow-xl border border-slate-700 whitespace-nowrap"
                            style={{
                                // Esto hace que el globito se mueva horizontalmente con la palabra
                                left: `${activeSuggestion.start * 7}px`,
                                maxWidth: "300px",
                            }}
                        >
                            <span className="text-gray-50 font-normal">
                                Presione TAB para corregir:
                            </span>
                            <button
                                type="button"
                                onClick={(e) => aplicarCorreccion(e, true)}
                                className="bg-blue-600 px-2 py-0.5 rounded hover:bg-blue-500 transition-all font-black text-white"
                            >
                                {activeSuggestion.sug}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {localError && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[9px] text-rose-500 font-black italic ml-1 mt-0.5"
                    >
                        {localError}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * MULTI-SELECT COMPACTO
 * Mantiene toda la lógica de gestión de tags y búsqueda.
 */
export function MultiSelectField({
    label,
    name,
    options,
    value = [],
    onChange,
    onAddNew,
    error,
}) {
    const safeValue = Array.isArray(value) ? value : [];
    const [localError, setLocalError] = useState(error);
    const [showManager, setShowManager] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setLocalError(error);
    }, [error]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            )
                setShowManager(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        if (localError) setLocalError(null);
        if (val === "+ Agregar nueva") {
            if (onAddNew) onAddNew();
            return;
        }
        if (!value.includes(val)) onChange([...value, val]);
    };

    const removeTag = (val) => {
        onChange(value.filter((item) => item !== val));
        if (value.length <= 1) setShowManager(false);
    };

    return (
        <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>
            <label
                className={`text-[10px] font-black uppercase tracking-tighter ml-1 ${localError ? "text-rose-500" : "text-gray-800"}`}
            >
                {label}
            </label>
            <div
                className={`h-9 w-full bg-white border rounded-xl flex items-center transition-all ${localError ? "border-rose-500 shadow-sm shadow-rose-100" : "border-gray-400 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500"}`}
            >
                <div
                    onClick={() =>
                        safeValue.length > 0 && setShowManager(!showManager)
                    }
                    className={`flex-1 h-full flex items-center px-3 gap-2 cursor-pointer ${safeValue.length > 0 ? "bg-slate-50/50" : ""}`}
                >
                    {safeValue.length > 0 ? (
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                                {safeValue[0]}
                            </span>
                            {safeValue.length > 1 && (
                                <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex-none">
                                    +{safeValue.length - 1}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-[12px] text-gray-700 font-bold">
                            Seleccione...
                        </span>
                    )}
                </div>
                <div className="w-12 h-full border-l border-gray-200 relative flex items-center justify-center">
                    <select
                        value=""
                        onChange={(e) => handleSelect(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                        <option value="" disabled></option>
                        <option
                            value="+ Agregar nueva"
                            className="font-black text-blue-600"
                        >
                            + NUEVA ÁREA
                        </option>
                        {options.map((opt, i) => (
                            <option
                                key={i}
                                value={opt}
                                disabled={value.includes(opt)}
                                className="text-xs"
                            >
                                {opt}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="text-slate-400" />
                </div>
                <AnimatePresence>
                    {showManager && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-12 left-0 w-full bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-[100] p-4 flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-center mb-2 border-b pb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase">
                                    Gestión de Áreas
                                </span>
                                <button onClick={() => setShowManager(false)}>
                                    <X size={14} className="text-slate-300" />
                                </button>
                            </div>
                            <div className="max-h-32 overflow-auto custom-scrollbar flex flex-col gap-1.5">
                                {safeValue.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 group"
                                    >
                                        <span className="text-[10px] font-black text-slate-700 uppercase">
                                            {item}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(item)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * SELECT FIELD COMPONENT
 */
export function SelectField({
    label,
    value,
    onChange,
    optionSelecName,
    disabled,
    options = [],
    required = false,
    error,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(
        (opt) => (typeof opt === "object" ? opt.v : opt) == value,
    );

    const displayLabel = selectedOption
        ? typeof selectedOption === "object"
            ? selectedOption.l
            : selectedOption
        : optionSelecName || "Seleccione...";

    const handleSelect = (val) => {
        onChange({ target: { value: val } });
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col gap-1 w-full relative" ref={containerRef}>
            <label
                className={`text-[10px] font-black uppercase tracking-tighter ml-1 ${error ? "text-rose-500" : "text-gray-800"}`}
            >
                {label} {required && <span className="text-rose-500">*</span>}
            </label>

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-between cursor-pointer
                    w-full bg-white border rounded-xl px-3 py-2.5 text-xs font-bold transition-all
                    ${error ? "border-rose-500 ring-2 ring-rose-500/10" : "border-gray-400"}
                    ${isOpen ? "ring-2 ring-indigo-500/20 border-indigo-500" : ""}
                    ${disabled ? "bg-slate-50 opacity-60 cursor-not-allowed" : "hover:border-gray-500"}
                `}
            >
                <span className={value ? "text-slate-700" : "text-slate-400"}>
                    {displayLabel}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        /* p-1.5: Es el espacio entre las opciones y el borde del cuadro blanco */
                        className="absolute left-0 right-0 z-[9999] bg-gray-200 border border-slate-200 mt-14 p-1.5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] max-h-60 overflow-y-auto"
                        style={{ top: "0px" }}
                    >
                        {options.map((opt, i) => {
                            const v = typeof opt === "object" ? opt.v : opt;
                            const l = typeof opt === "object" ? opt.l : opt;
                            const isSelected = v == value;

                            return (
                                <li
                                    key={i}
                                    onClick={() => handleSelect(v)}
                                    className={`
                                        flex items-center justify-between
                                        px-4 py-2.5 text-xs font-bold cursor-pointer transition-all
                                        /* rounded-lg: Hace que el color de hover/seleccion sea redondeado y no toque los bordes */
                                        rounded-sm mb-1 last:mb-0
                                        ${
                                            isSelected
                                                ? "bg-indigo-600 text-white"
                                                : "text-slate-600 hover:bg-slate-300 hover:text-indigo-700"
                                        }
                                    `}
                                >
                                    <span>{l}</span>
                                    {isSelected && <Check size={14} />}
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>

            {error && (
                <p className="text-[9px] text-rose-500 font-black italic ml-1 mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * SECTION COMPONENT
 */
export function Section({ icon, title, color, children }) {
    return (
        <div className="space-y-3 bg-white p-4 rounded-[1.0rem] border border-slate-100 shadow-sm shadow-slate-200/50 h-full">
            {title && (
                <div className={`flex items-center gap-3 ${color} mb-2`}>
                    <div className="bg-current/10 p-1.5 rounded-lg">{icon}</div>
                    <h3 className="font-black text-xs tracking-tighter uppercase italic">
                        {title}
                    </h3>
                </div>
            )}
            {children}
        </div>
    );
}
