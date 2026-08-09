"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import {
    PieChart,
    Loader2,
    RefreshCcw,
    School,
    UsersRound,
    UserCheck,
    Star,
    LayoutDashboard,
    UserCircle,
    X,
    ChevronRight,
    ArrowRight,
    Users,
    GraduationCap,
    Briefcase,
    MapPin,
    Globe,
    Award,
    BadgeCheck,
    Calendar,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus,
    Building,
    UserPlus,
    UserMinus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function StatsSheet() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("matricula");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(route("api.quick.stats"));
            setData(res.data);
        } catch (e) {
            console.error("Error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && !data) fetchData();
    }, [isOpen]);

    // --- RENDERIZADO DEL PORTAL ---
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-emerald-400 border border-slate-700/50 shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 active:scale-95 group"
                title="Estadísticas Rápidas"
            >
                <PieChart
                    size={18}
                    className="group-hover:scale-110 transition-transform duration-300"
                />
            </button>

            {isOpen &&
                createPortal(
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-md p-2 md:p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                }}
                                className="w-full max-w-7xl h-full md:h-[92vh] bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/30"
                            >
                                {/* HEADER ELEGANTE */}
                                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-3 flex items-center justify-between shrink-0 border-b border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                            <PieChart
                                                size={20}
                                                className="text-emerald-400"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black text-white uppercase tracking-tight italic">
                                                Data Center Institucional
                                            </h2>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                    Sincronización en tiempo
                                                    real
                                                </p>
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={fetchData}
                                            className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                                        >
                                            <RefreshCcw
                                                size={16}
                                                className={
                                                    loading
                                                        ? "animate-spin"
                                                        : ""
                                                }
                                            />
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-rose-500/20"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* TABS MEJORADOS */}
                                <div className="bg-slate-50/80 border-b  border-slate-200/60 p-2 flex gap-1.5 shrink-0 overflow-x-auto scrollbar-thin">
                                    {[
                                        {
                                            id: "matricula",
                                            label: "Matrícula estudiantes",
                                            icon: GraduationCap,
                                            color: "blue",
                                        },
                                        {
                                            id: "personal",
                                            label: "Personal",
                                            icon: Briefcase,
                                            color: "emerald",
                                        },
                                        {
                                            id: "repres",
                                            label: "Responsables",
                                            icon: UserCheck,
                                            color: "purple",
                                        },
                                        {
                                            id: "otros",
                                            label: "Especiales",
                                            icon: Award,
                                            color: "amber",
                                        },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-300 ${
                                                activeTab === tab.id
                                                    ? `bg-white text-slate-900 shadow-md border border-slate-200/80 scale-[1.02]`
                                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                            }`}
                                        >
                                            <tab.icon
                                                size={14}
                                                className={
                                                    activeTab === tab.id
                                                        ? `text-${tab.color}-500`
                                                        : "text-slate-400"
                                                }
                                            />
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full bg-${tab.color}-500 animate-pulse`}
                                                ></span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* CONTENIDO OPTIMIZADO */}
                                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gradient-to-b from-slate-50/50 to-white">
                                    {loading && !data ? (
                                        <div className="h-full flex flex-col items-center justify-center gap-3">
                                            <Loader2
                                                className="animate-spin text-emerald-500"
                                                size={32}
                                            />
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                Cargando datos...
                                            </span>
                                        </div>
                                    ) : (
                                        data && (
                                            <div className="space-y-5">
                                                {/* --- TAB: MATRICULA --- */}
                                                {activeTab === "matricula" && (
                                                    <div className="space-y-2">
                                                        {/* Totales con diseño mejorado */}
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-2xl border border-blue-200/50 shadow-sm">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="p-1.5 bg-blue-500 rounded-lg">
                                                                        <UserPlus
                                                                            size={
                                                                                12
                                                                            }
                                                                            className="text-white"
                                                                        />
                                                                    </div>
                                                                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">
                                                                        Masculino
                                                                    </p>
                                                                </div>
                                                                <p className="text-3xl font-black text-blue-700 italic">
                                                                    {data.grados.reduce(
                                                                        (
                                                                            a,
                                                                            g,
                                                                        ) =>
                                                                            a +
                                                                            (g
                                                                                .resumen_grado
                                                                                ?.m ||
                                                                                0),
                                                                        0,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 rounded-2xl border border-rose-200/50 shadow-sm">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="p-1.5 bg-rose-500 rounded-lg">
                                                                        <UserMinus
                                                                            size={
                                                                                12
                                                                            }
                                                                            className="text-white"
                                                                        />
                                                                    </div>
                                                                    <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">
                                                                        Femenino
                                                                    </p>
                                                                </div>
                                                                <p className="text-3xl font-black text-rose-700 italic">
                                                                    {data.grados.reduce(
                                                                        (
                                                                            a,
                                                                            g,
                                                                        ) =>
                                                                            a +
                                                                            (g
                                                                                .resumen_grado
                                                                                ?.f ||
                                                                                0),
                                                                        0,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-2xl border border-emerald-200/50 shadow-sm">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="p-1.5 bg-emerald-500 rounded-lg">
                                                                        <Users
                                                                            size={
                                                                                12
                                                                            }
                                                                            className="text-white"
                                                                        />
                                                                    </div>
                                                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                                                                        Total
                                                                        General
                                                                    </p>
                                                                </div>
                                                                <p className="text-3xl font-black text-emerald-700 italic">
                                                                    {data.grados.reduce(
                                                                        (
                                                                            a,
                                                                            g,
                                                                        ) =>
                                                                            a +
                                                                            (g
                                                                                .resumen_grado
                                                                                ?.total ||
                                                                                0),
                                                                        0,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Grados y Secciones mejorado */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {data.grados.map(
                                                                (
                                                                    grado,
                                                                    idx,
                                                                ) => (
                                                                    <motion.div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            y: 10,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            y: 0,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                idx *
                                                                                0.05,
                                                                        }}
                                                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                                                    >
                                                                        <div className="bg-gradient-to-r from-slate-50 to-white px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                                                            <div className="flex items-center gap-2">
                                                                                <School
                                                                                    size={
                                                                                        14
                                                                                    }
                                                                                    className="text-indigo-500"
                                                                                />
                                                                                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                                                                                    {
                                                                                        grado.nombre
                                                                                    }
                                                                                </h4>
                                                                            </div>
                                                                            <div className="flex gap-3 text-[11px] font-black">
                                                                                <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg">
                                                                                    M:{" "}
                                                                                    {grado
                                                                                        .resumen_grado
                                                                                        ?.m ||
                                                                                        0}
                                                                                </span>
                                                                                <span className="text-pink-500 bg-pink-50 px-2 py-0.5 rounded-lg">
                                                                                    F:{" "}
                                                                                    {grado
                                                                                        .resumen_grado
                                                                                        ?.f ||
                                                                                        0}
                                                                                </span>
                                                                                <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                                                                                    T:{" "}
                                                                                    {grado
                                                                                        .resumen_grado
                                                                                        ?.total ||
                                                                                        0}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-3 flex justify-center grid-cols-3 sm:grid-cols-4 gap-2">
                                                                            {grado.secciones?.map(
                                                                                (
                                                                                    sec,
                                                                                    sIdx,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            sIdx
                                                                                        }
                                                                                        className="bg-gradient-to-br from-slate-50 to-white p-2 rounded-xl border border-slate-400 text-center hover:border-indigo-200 transition-colors"
                                                                                    >
                                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                                                          Sección  {
                                                                                                sec.seccion
                                                                                            }
                                                                                        </p>
                                                                                        <div className="flex items-center justify-center gap-2">
                                                                                            {sec.m >
                                                                                                0 &&
                                                                                                sec.f >
                                                                                                    0 && (
                                                                                                    <div className="flex gap-1 text-[12px]  font-bold">
                                                                                                        <span className="text-blue-400 gap-6">
                                                                                                            M
                                                                                                            {
                                                                                                                sec.m
                                                                                                            }
                                                                                                        </span>|
                                                                                                        <span className="text-pink-400">
                                                                                                            F
                                                                                                            {
                                                                                                                sec.f
                                                                                                            }
                                                                                                        </span>|
                                                                                                    </div>
                                                                                                )}

                                                                                            <span className="text-[12px] font-black text-slate-700">
                                                                                                T
                                                                                                {sec.total ||
                                                                                                    0}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* --- TAB: PERSONAL COMPLETO CON NACIONALES Y ESTADALES --- */}
                                                {activeTab === "personal" && (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-1">
                                                            {data.empleados.map(
                                                                (emp, idx) => (
                                                                    <motion.div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            scale: 0.95,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            scale: 1,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                idx *
                                                                                0.05,
                                                                        }}
                                                                        className="bg-white p-2 rounded-2xl border border-slate-600 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-200"
                                                                    >
                                                                        {/* Cabecera del cargo */}
                                                                        <div className="flex justify-between items-start mb-3">
                                                                            <div className="flex items-center gap-2.5">
                                                                                <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-sm">
                                                                                    <Briefcase
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className="text-blue-600"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                                        {emp.tipo ||
                                                                                            "Personal"}
                                                                                    </p>
                                                                                    <p className="text-[12px] font-black uppercase text-slate-800 tracking-tight">
                                                                                        {
                                                                                            emp.cargo
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                                                                <span className="text-[17px] font-black italic text-slate-900">
                                                                                    {
                                                                                        emp.total
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Totales M/F */}
                                                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                                                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 flex justify-between items-center">
                                                                                <span className="uppercase tracking-wider text-[14px] font-black">
                                                                                    M
                                                                                </span>
                                                                                <span className="text-[16px] font-black">
                                                                                    {
                                                                                        emp
                                                                                            .m
                                                                                            .total
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <div className="bg-pink-50 p-2.5 rounded-xl text-pink-600 flex justify-between items-center">
                                                                                <span className="uppercase tracking-wider text-[14px] font-black">
                                                                                    F
                                                                                </span>
                                                                                <span className="text-[16px] font-black">
                                                                                    {
                                                                                        emp
                                                                                            .f
                                                                                            .total
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Desglose por Nacionalidad y Estado - USANDO n y e */}
                                                                        <div className="grid grid-cols-2 gap-4 mt-2 pt-3 border-t border-slate-100">
                                                                            {/* Nacionales */}
                                                                            <div className="bg-blue-50/30 rounded-xl p-3">
                                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                                    <Globe
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                        className="text-emerald-500"
                                                                                    />
                                                                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                                                                        Nacionales
                                                                                    </p>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <div className="flex justify-between items-center bg-white/60 px-3 py-1.5 rounded-lg border border-blue-100/50">
                                                                                        <span className="text-[12px] font-bold text-blue-600">
                                                                                            M
                                                                                        </span>
                                                                                        <span className="text-xl font-black text-slate-700">
                                                                                            {emp
                                                                                                .m
                                                                                                .n ||
                                                                                                0}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center bg-white/60 px-3 py-1.5 rounded-lg border border-pink-100/50">
                                                                                        <span className="text-[12px] font-bold text-pink-600">
                                                                                            F
                                                                                        </span>
                                                                                        <span className="text-xl font-black text-slate-700">
                                                                                            {emp
                                                                                                .f
                                                                                                .n ||
                                                                                                0}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                                                                        <span className="text-[12px] font-bold text-emerald-600">
                                                                                            T
                                                                                        </span>
                                                                                        <span className="text-xl font-black text-emerald-700">
                                                                                            {(emp
                                                                                                .m
                                                                                                .n ||
                                                                                                0) +
                                                                                                (emp
                                                                                                    .f
                                                                                                    .n ||
                                                                                                    0)}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Estadales */}
                                                                            <div className="bg-amber-50/30 rounded-xl p-3">
                                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                                    <MapPin
                                                                                        size={
                                                                                            12
                                                                                        }
                                                                                        className="text-amber-500"
                                                                                    />
                                                                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                                                                        Estadales
                                                                                    </p>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <div className="flex justify-between items-center bg-white/60 px-3 py-1.5 rounded-lg border border-blue-100/50">
                                                                                        <span className="text-[12px] font-bold text-blue-600">
                                                                                            M
                                                                                        </span>
                                                                                        <span className="text-xl font-black text-slate-700">
                                                                                            {emp
                                                                                                .m
                                                                                                .e ||
                                                                                                0}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center bg-white/60 px-3 py-1.5 rounded-lg border border-pink-100/50">
                                                                                        <span className="text-[12px] font-bold text-pink-600">
                                                                                            F
                                                                                        </span>
                                                                                        <span className="text-xl font-black text-slate-700">
                                                                                            {emp
                                                                                                .f
                                                                                                .e ||
                                                                                                0}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                                                                        <span className="text-[12px] font-bold text-emerald-600">
                                                                                            T
                                                                                        </span>
                                                                                        <span className="text-xl font-black text-emerald-700">
                                                                                            {(emp
                                                                                                .m
                                                                                                .e ||
                                                                                                0) +
                                                                                                (emp
                                                                                                    .f
                                                                                                    .e ||
                                                                                                    0)}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Resumen de ubicación */}
                                                                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[12px] font-bold">
                                                                            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                                                NAC:{" "}
                                                                                {(emp
                                                                                    .m
                                                                                    .n ||
                                                                                    0) +
                                                                                    (emp
                                                                                        .f
                                                                                        .n ||
                                                                                        0)}
                                                                            </span>
                                                                            <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                                                                                EST:{" "}
                                                                                {(emp
                                                                                    .m
                                                                                    .e ||
                                                                                    0) +
                                                                                    (emp
                                                                                        .f
                                                                                        .e ||
                                                                                        0)}
                                                                            </span>
                                                                            <span className="text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                                                                                TOTAL:{" "}
                                                                                {
                                                                                    emp.total
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* --- TAB: REPRESENTANTES --- */}
                                                {activeTab === "repres" && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white flex flex-col justify-center items-center shadow-xl">
                                                            <Users
                                                                size={32}
                                                                className="text-emerald-400 mb-3"
                                                            />
                                                            <p className="text-5xl font-black italic tracking-tighter">
                                                                {data
                                                                    .representantes
                                                                    ?.total ||
                                                                    0}
                                                            </p>
                                                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                                                                Total
                                                                Responsables
                                                            </p>
                                                            <div className="flex gap-4 mt-3 text-[10px] font-bold">
                                                                <span className="text-blue-400">
                                                                    👨{" "}
                                                                    {data
                                                                        .representantes
                                                                        ?.m ||
                                                                        0}
                                                                </span>
                                                                <span className="text-pink-400">
                                                                    👩{" "}
                                                                    {data
                                                                        .representantes
                                                                        ?.f ||
                                                                        0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50 flex flex-col items-center justify-center">
                                                                <UserPlus
                                                                    size={24}
                                                                    className="text-blue-500 mb-2"
                                                                />
                                                                <p className="text-3xl font-black text-blue-600">
                                                                    {data
                                                                        .representantes
                                                                        ?.m ||
                                                                        0}
                                                                </p>
                                                                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">
                                                                    Padres
                                                                </p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 p-6 rounded-2xl border border-pink-200/50 flex flex-col items-center justify-center">
                                                                <UserMinus
                                                                    size={24}
                                                                    className="text-pink-500 mb-2"
                                                                />
                                                                <p className="text-3xl font-black text-pink-600">
                                                                    {data
                                                                        .representantes
                                                                        ?.f ||
                                                                        0}
                                                                </p>
                                                                <p className="text-[8px] font-black text-pink-500 uppercase tracking-widest">
                                                                    Madres
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* --- TAB: OTROS --- */}
                                                {activeTab === "otros" && (
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
                                                        {data.especiales.map(
                                                            (esp, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{
                                                                        opacity: 0,
                                                                        y: 10,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        y: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            idx *
                                                                            0.08,
                                                                    }}
                                                                    className="bg-white p-5 rounded-2xl border border-slate-200 text-center hover:border-amber-400/50 hover:shadow-md transition-all duration-200"
                                                                >
                                                                    <div className="flex justify-center mb-2">
                                                                        <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                                                                            <Award
                                                                                size={
                                                                                    16
                                                                                }
                                                                                className="text-amber-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[16px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                                        {
                                                                            esp.categoria
                                                                        }
                                                                    </p>
                                                                    <p className="text-2xl font-black text-slate-900 italic leading-none">
                                                                        {
                                                                            esp.total
                                                                        }
                                                                    </p>
                                                                    <div className="mt-2 flex justify-center gap-4 text-[16px] font-bold border-t border-slate-100 pt-2">
                                                                        <span className="text-blue-500">
                                                                            M:{" "}
                                                                            {
                                                                                esp.m
                                                                            }
                                                                        </span>
                                                                        <span className="text-pink-500">
                                                                            F:{" "}
                                                                            {
                                                                                esp.f
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </motion.div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* FOOTER ELEGANTE */}
                                <div className="bg-white border-t border-slate-100/80 px-6 py-3.5 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                            © Core v2.0 Platform
                                        </span>
                                        <span className="w-px h-4 bg-slate-200"></span>
                                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">
                                            {new Date().toLocaleDateString(
                                                "es-ES",
                                                {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                },
                                            )}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-5 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200 flex items-center gap-2"
                                    >
                                        Cerrar Panel <ArrowRight size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}
